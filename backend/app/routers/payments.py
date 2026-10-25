import os
import json
import uuid
from datetime import datetime
from typing import Optional
from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import get_db
from app.models.permit import Permit, PermitDocument
from app.models.payment import Invoice, InvoiceItem, Payment, PermitRenewal
from app.services.payment_service import verify_midtrans_signature, check_midtrans_status
from app.services.pdf_service import generate_permit_pdf, generate_invoice_pdf
from app.services.email_service import send_renewal_success_email, send_permit_submitted_email
from app.utils.audit import log_activity
from app.utils.notification_helper import create_notification
from app.schemas.payment import MidtransWebhook, SimulatePaymentRequest

router = APIRouter(prefix="/payments", tags=["Payments"])

def find_existing_invoice_file(p: str) -> Optional[str]:
    """Mencari file fisik invoice di berbagai kandidat folder relatif atau absolut."""
    if not p:
        return None
    c = p.lstrip('/')
    candidates = [
        c,
        os.path.join("..", c),
        os.path.join("backend", c),
        os.path.abspath(c),
        os.path.join(settings.UPLOAD_DIR, 'invoices', os.path.basename(c)),
        os.path.join('uploads', 'invoices', os.path.basename(c))
    ]
    for cand in candidates:
        if os.path.exists(cand) and os.path.isfile(cand):
            return cand
    return None

def execute_payment_settlement(
    invoice: Invoice,
    db: Session,
    payment_type: str = "QRIS",
    transaction_id: str = None,
    signature_key: str = "",
    raw_response: str = ""
) -> dict:
    """
    Menjalankan eksekusi pelunasan pembayaran secara terpusat (idempotent).
    - Memperbarui status Invoice menjadi PAID dan paid_at
    - Menyimpan catatan transaksi ke tabel Payment (sinkronisasi real-time Manajemen Keuangan)
    - Jika perpanjangan (renewal): perpanjang expired_at 1 bulan, naikkan versi surat izin,
      terbitkan PDF surat versi baru, dan kirim email resmi ke pemohon
    - Jika perizinan baru: perbarui status perizinan menjadi 'Submitted' sehingga masuk antrean verifikasi Admin,
      dan kirim email konfirmasi pengajuan ke pemohon.
    """
    if invoice.status == 'PAID':
        permit = invoice.permit
        return {
            "status": "PAID",
            "message": "Tagihan ini sudah lunas sebelumnya.",
            "invoice_number": invoice.invoice_number,
            "permit_number": permit.permit_number if permit else "-",
            "is_renewal": bool(invoice.renewal)
        }

    now = datetime.utcnow()
    selected_method = (payment_type or "QRIS").upper()

    invoice.status = 'PAID'
    invoice.paid_at = now
    invoice.payment_method = selected_method

    order_id = invoice.invoice_number
    trx_id = transaction_id or f"TRX-{uuid.uuid4().hex[:10].upper()}"

    pay_record = Payment(
        id=str(uuid.uuid4()),
        order_id=order_id,
        invoice_id=invoice.id,
        transaction_id=trx_id,
        payment_type=selected_method.lower(),
        gross_amount=invoice.total_amount,
        transaction_status="settlement",
        transaction_time=now,
        settlement_time=now,
        signature_key=signature_key or "VERIFIED_MIDTRANS",
        raw_response=raw_response or f"Payment settlement verified via {selected_method}"
    )
    db.add(pay_record)

    permit = invoice.permit
    renewal = invoice.renewal

    if renewal:
        # === KASUS PERPANJANGAN (RENEWAL) ===
        duration = renewal.duration_months or 1
        if permit.expired_at and permit.expired_at > now:
            new_exp = permit.expired_at + relativedelta(months=duration)
        else:
            new_exp = now + relativedelta(months=duration)

        permit.expired_at = new_exp
        permit.status = 'Approved'
        permit.active_version = (permit.active_version or 1) + 1

        renewal.status = 'PAID'
        renewal.new_expired_at = new_exp

        db.commit()
        db.refresh(permit)

        # Buat Surat Izin PDF Versi Terbaru dengan nomor ID yang sama
        new_pdf_path, new_pdf_bytes = generate_permit_pdf(permit, permit.applicant)
        permit.pdf_path = new_pdf_path

        doc_entry = PermitDocument(
            id=str(uuid.uuid4()),
            permit_id=permit.id,
            file_name=f"SURAT_IZIN_RESMI_{permit.permit_number}_v{permit.active_version}.pdf",
            document_type="OFFICIAL_PERMIT_LETTER",
            file_path=new_pdf_path,
            file_size=len(new_pdf_bytes),
            mime_type="application/pdf",
            status="ACTIVE"
        )
        db.add(doc_entry)
        db.commit()

        log_activity(
            db=db,
            action="MIDTRANS_PAYMENT_SUCCESS_RENEWED",
            module="PAYMENTS",
            user_id=str(permit.applicant_id),
            role="SYSTEM",
            reference=f"{order_id} | {permit.permit_number}",
            status="SUCCESS"
        )

        create_notification(
            db=db,
            user_id=str(permit.applicant_id),
            title="Pembayaran Berhasil — Izin Diperpanjang!",
            message=f"Pembayaran tagihan {order_id} lunas. Izin Anda telah resmi diperpanjang sampai {new_exp.strftime('%d %B %Y')}.",
            type="PERMIT_STATUS",
            link_url=f"/track/{permit.permit_number}"
        )

        try:
            send_renewal_success_email(invoice, permit, new_pdf_bytes, db=db)
        except Exception as mail_err:
            print("Warning kirim Email D:", mail_err)

        return {
            "status": "PAID",
            "message": "Pembayaran berhasil diverifikasi. Izin otomatis diperpanjang & surat izin versi baru diterbitkan.",
            "invoice_number": order_id,
            "permit_number": permit.permit_number,
            "permit_id": str(permit.id),
            "is_renewal": True,
            "new_expired_at": new_exp.strftime("%d %B %Y"),
            "pdf_url": f"/api/v1/permits/{permit.id}/download-pdf"
        }
    else:
        # === KASUS PENDAFTARAN IZIN BARU (> 1 BULAN) ===
        # Retribusi lunas -> status menjadi 'Submitted' agar masuk ke antrean Admin
        permit.status = 'Submitted'
        db.commit()
        db.refresh(permit)

        log_activity(
            db=db,
            action="MIDTRANS_PAYMENT_RETRIBUTION_SUCCESS",
            module="PAYMENTS",
            user_id=str(permit.applicant_id),
            role="SYSTEM",
            reference=f"{order_id} | {permit.permit_number}",
            status="SUCCESS"
        )

        create_notification(
            db=db,
            user_id=str(permit.applicant_id),
            title="Pembayaran Retribusi Berhasil!",
            message=f"Pembayaran retribusi untuk perizinan {permit.permit_number} telah lunas. Pengajuan Anda kini masuk antrean pemeriksaan admin SIPEDI.",
            type="PERMIT_STATUS",
            link_url=f"/track/{permit.permit_number}"
        )

        try:
            send_permit_submitted_email(permit, db=db)
        except Exception as mail_err:
            print("Warning kirim email pembayaran retribusi:", mail_err)

        return {
            "status": "PAID",
            "message": "Pembayaran retribusi berhasil diverifikasi! Pengajuan izin Anda kini masuk antrean Admin untuk diperiksa dan disetujui.",
            "invoice_number": order_id,
            "permit_number": permit.permit_number,
            "permit_id": str(permit.id),
            "is_renewal": False,
            "track_url": f"/track/{permit.permit_number}"
        }

# 1. GET INVOICE DETAIL BY INVOICE NUMBER
@router.get('/invoice/{invoice_number}')
def get_invoice_detail(invoice_number: str, db: Session = Depends(get_db)):
    inv = db.query(Invoice).filter(
        (Invoice.invoice_number == invoice_number.strip()) | (Invoice.id == invoice_number.strip())
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice tagihan tidak ditemukan.")

    permit = inv.permit
    items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == inv.id).all()

    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "renewal_id": inv.renewal_id,
        "permit_id": inv.permit_id,
        "permit_number": permit.permit_number if permit else "-",
        "business_name": permit.business_name if permit else "-",
        "applicant_name": permit.applicant_name if permit else "-",
        "subtotal": float(inv.subtotal or 0),
        "total_amount": float(inv.total_amount or 0),
        "status": inv.status,
        "due_date": inv.due_date.strftime("%d %B %Y, %H:%M WIB") if inv.due_date else "-",
        "paid_at": inv.paid_at.strftime("%d %B %Y, %H:%M WIB") if inv.paid_at else None,
        "snap_token": inv.snap_token,
        "snap_redirect_url": inv.snap_redirect_url,
        "qris_url": inv.qris_url,
        "pdf_path": inv.pdf_path,
        "items": [
            {
                "id": str(it.id),
                "item_name": it.item_name,
                "quantity": it.quantity,
                "unit_price": float(it.unit_price or 0),
                "subtotal": float(it.subtotal or 0)
            } for it in items
        ]
    }

# 1.1 DOWNLOAD INVOICE PDF
@router.get('/invoice/{invoice_number}/download-pdf')
def download_invoice_pdf(invoice_number: str, db: Session = Depends(get_db)):
    inv = db.query(Invoice).filter(
        (Invoice.invoice_number == invoice_number.strip()) | (Invoice.id == invoice_number.strip())
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice tagihan tidak ditemukan.")

    permit = inv.permit
    resolved_path = find_existing_invoice_file(inv.pdf_path)

    if not resolved_path or not os.path.exists(resolved_path):
        rel_path, pdf_bytes = generate_invoice_pdf(inv, permit, permit.applicant if permit else None)
        inv.pdf_path = rel_path
        db.commit()
        resolved_path = find_existing_invoice_file(rel_path)

    if not resolved_path or not os.path.exists(resolved_path):
        raise HTTPException(status_code=404, detail="File PDF tagihan belum dapat diunduh.")

    filename = f"TAGIHAN_{inv.invoice_number}.pdf"
    return FileResponse(
        resolved_path, 
        media_type="application/pdf", 
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# 2. MIDTRANS WEBHOOK (NOTIFICATION HANDLER WITH SIGNATURE VERIFICATION & IDEMPOTENCY)
@router.post('/midtrans-webhook')
async def midtrans_webhook(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    order_id = body.get("order_id")
    status_code = str(body.get("status_code", "200"))
    gross_amount = str(body.get("gross_amount", "0"))
    signature_key = body.get("signature_key", "")
    transaction_status = body.get("transaction_status", "")
    payment_type = body.get("payment_type", "qris")
    transaction_id = body.get("transaction_id", str(uuid.uuid4()))

    if not order_id:
        raise HTTPException(status_code=400, detail="order_id is required")

    # 1. Validasi Signature SHA-512
    if not verify_midtrans_signature(order_id, status_code, gross_amount, signature_key):
        raise HTTPException(status_code=403, detail="Invalid Midtrans Signature Key")

    # 2. Cari Invoice
    invoice = db.query(Invoice).filter(Invoice.invoice_number == order_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail=f"Invoice {order_id} not found")

    # 3. Idempotency Check: Jika sudah PAID, jangan proses perpanjangan ganda
    if invoice.status == 'PAID':
        return {"status": "ok", "message": "Transaction already processed"}

    # 4. Tangani Status Transaksi (settlement, capture = SUKSES)
    if transaction_status in ['settlement', 'capture']:
        res = execute_payment_settlement(
            invoice=invoice,
            db=db,
            payment_type=payment_type,
            transaction_id=transaction_id,
            signature_key=signature_key,
            raw_response=json.dumps(body)
        )
        return {"status": "ok", "message": "Payment processed successfully", "data": res}

    elif transaction_status in ['expire', 'cancel', 'deny']:
        invoice.status = 'EXPIRED' if transaction_status == 'expire' else 'CANCELLED'
        if invoice.renewal:
            invoice.renewal.status = 'CANCELLED'
        db.commit()
        return {"status": "ok", "message": f"Payment marked as {invoice.status}"}

    return {"status": "ok", "message": "Pending notification recorded"}

# 3. VERIFIKASI STATUS PEMBAYARAN MIDTRANS REAL-TIME (DIPANGGIL DARI RETURN / FINISH PAGE)
@router.get('/verify/{order_id}')
@router.post('/verify/{order_id}')
def verify_payment_status(order_id: str, request: Request, db: Session = Depends(get_db)):
    """
    Mengecek dan memverifikasi status pembayaran langsung ke API Midtrans.
    Otomatis melunasi tagihan (settlement) jika terbayar dan memperbarui status berkas.
    """
    order_clean = order_id.strip()
    invoice = db.query(Invoice).filter(
        (Invoice.invoice_number == order_clean) | (Invoice.id == order_clean)
    ).first()

    if not invoice:
        raise HTTPException(status_code=404, detail=f"Tagihan {order_clean} tidak ditemukan.")

    permit = invoice.permit

    # 1. Jika sudah lunas di database, langsung kembalikan data sukses
    if invoice.status == 'PAID':
        return {
            "status": "PAID",
            "message": "Tagihan ini sudah terverifikasi lunas.",
            "invoice_number": invoice.invoice_number,
            "total_amount": float(invoice.total_amount or 0),
            "payment_method": invoice.payment_method or "QRIS",
            "permit_id": str(permit.id) if permit else None,
            "permit_number": permit.permit_number if permit else "-",
            "is_renewal": bool(invoice.renewal),
            "paid_at": invoice.paid_at.strftime("%d %B %Y, %H:%M WIB") if invoice.paid_at else None,
            "download_pdf_url": f"/api/v1/permits/{permit.id}/download-pdf" if (permit and permit.status == 'Approved') else None,
            "invoice_pdf_url": f"/api/v1/payments/invoice/{invoice.invoice_number}/download-pdf"
        }

    # 2. Ambil parameter callback URL dari Midtrans
    query_params = request.query_params
    tx_status_query = query_params.get("transaction_status", "").lower()

    # 3. Query status real-time ke Midtrans API
    midtrans_res = check_midtrans_status(invoice.invoice_number)
    api_tx_status = midtrans_res.get("transaction_status", "").lower()

    # Eksekusi settlement jika Midtrans konfirmasi settlement / capture
    # atau query param redirect sandbox membawa flag settlement
    is_settled = (api_tx_status in ['settlement', 'capture']) or (
        tx_status_query in ['settlement', 'capture'] and not settings.MIDTRANS_IS_PRODUCTION
    )

    if is_settled:
        payment_type = midtrans_res.get("payment_type") or query_params.get("payment_type") or "QRIS"
        trx_id = midtrans_res.get("transaction_id") or f"TRX-VERIF-{uuid.uuid4().hex[:8].upper()}"
        res = execute_payment_settlement(
            invoice=invoice,
            db=db,
            payment_type=payment_type,
            transaction_id=trx_id,
            signature_key=midtrans_res.get("signature_key", ""),
            raw_response=json.dumps(midtrans_res)
        )
        return res

    # Jika expired, cancel, deny
    is_cancelled = (api_tx_status in ['expire', 'cancel', 'deny']) or (tx_status_query in ['expire', 'cancel', 'deny'])
    if is_cancelled:
        invoice.status = 'CANCELLED' if (api_tx_status != 'expire' and tx_status_query != 'expire') else 'EXPIRED'
        if invoice.renewal:
            invoice.renewal.status = 'CANCELLED'
        db.commit()
        return {
            "status": invoice.status,
            "message": f"Status transaksi: {api_tx_status or tx_status_query}",
            "invoice_number": invoice.invoice_number,
            "permit_number": invoice.permit.permit_number if invoice.permit else "-"
        }

    # Jika masih pending
    return {
        "status": "PENDING",
        "message": "Menunggu proses pembayaran oleh pemohon.",
        "invoice_number": invoice.invoice_number,
        "permit_number": invoice.permit.permit_number if invoice.permit else "-",
        "total_amount": float(invoice.total_amount or 0),
        "snap_redirect_url": invoice.snap_redirect_url,
        "midtrans_response": midtrans_res
    }

# 4. SIMULASI PEMBAYARAN SANDBOX (UNTUK PENGUJIAN INSTAN DI UI FRONTEND)
@router.post('/simulate-pay')
def simulate_sandbox_payment(req: SimulatePaymentRequest, db: Session = Depends(get_db)):
    """
    Memungkinkan pengujian pembayaran sandbox secara langsung dari tombol UI
    tanpa harus membuka Midtrans Sandbox Simulator secara manual.
    """
    order_id = req.order_id.strip()
    status_target = req.status.lower()

    invoice = db.query(Invoice).filter(
        (Invoice.invoice_number == order_id) | (Invoice.id == order_id)
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail=f"Tagihan {order_id} tidak ditemukan.")

    if invoice.status == 'PAID':
        return {"message": "Tagihan ini sudah lunas sebelumnya.", "status": "ALREADY_PAID"}

    if status_target == 'settlement':
        selected_method = (getattr(req, 'payment_type', None) or "QRIS").upper()
        res = execute_payment_settlement(
            invoice=invoice,
            db=db,
            payment_type=selected_method,
            transaction_id=f"TRX-SB-{uuid.uuid4().hex[:8].upper()}",
            signature_key="SIMULATED_SANDBOX_KEY",
            raw_response=f"Simulated Sandbox {selected_method} Payment Success"
        )
        return res
    else:
        invoice.status = 'CANCELLED'
        if invoice.renewal:
            invoice.renewal.status = 'CANCELLED'
        db.commit()
        return {"message": "Simulasi pembayaran dibatalkan / gagal.", "status": "CANCELLED"}
