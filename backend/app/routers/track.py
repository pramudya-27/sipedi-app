from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.permit import Permit
from app.models.complaint import Complaint
from app.models.payment import Invoice, PermitRenewal

router = APIRouter(prefix="/api/v1/track", tags=["Tracking"])

@router.get("/{ticket_number}")
def track_status(ticket_number: str, db: Session = Depends(get_db)):
    ticket_clean = ticket_number.strip()

    # 1. Cari di tabel Permit berdasarkan permit_number
    permit = db.query(Permit).filter(Permit.permit_number == ticket_clean).first()

    if permit:
        sub_str = permit.submission_date.strftime("%d %B %Y") if permit.submission_date else "-"
        appr_str = permit.approved_at.strftime("%d %B %Y") if permit.approved_at else "-"
        start_str = permit.start_date.strftime("%d %B %Y") if permit.start_date else "-"
        exp_str = permit.expired_at.strftime("%d %B %Y") if permit.expired_at else "-"

        current_status = permit.status or 'Submitted'
        status_upper = current_status.upper()

        # Hitung sisa hari
        now = datetime.utcnow()
        remaining_days = None
        is_expired = False
        if permit.expired_at:
            delta = permit.expired_at - now
            remaining_days = max(0, delta.days)
            if permit.expired_at < now and status_upper != 'REJECTED':
                is_expired = True

        # Ambil invoice pending terakhir jika ada perpanjangan
        latest_inv = db.query(Invoice).filter(Invoice.permit_id == str(permit.id)).order_by(Invoice.created_at.desc()).first()
        invoice_info = None
        if latest_inv:
            invoice_info = {
                "invoice_number": latest_inv.invoice_number,
                "status": latest_inv.status,
                "total_amount": float(latest_inv.total_amount or 0),
                "due_date": latest_inv.due_date.strftime("%d %B %Y") if latest_inv.due_date else None,
                "snap_redirect_url": latest_inv.snap_redirect_url,
                "pay_url": f"/pay/{latest_inv.invoice_number}" if latest_inv.status == 'UNPAID' else None
            }

        # Status label yang mudah dipahami publik (Section 4)
        status_label = "Menunggu Pemeriksaan"
        if status_upper in ['APPROVED', 'ACTIVE']:
            status_label = "Aktif & Berlaku" if not is_expired else "Kedaluwarsa"
        elif status_upper == 'REJECTED':
            status_label = "Permohonan Ditolak"
        elif status_upper == 'EXTENDED':
            status_label = "Perpanjangan Berhasil"
        elif is_expired:
            status_label = "Kedaluwarsa"

        is_submitted = True
        is_verifying = status_upper in ['UNDER VERIFICATION', 'REVISION REQUIRED']
        is_approved = status_upper in ['APPROVED', 'ACTIVE', 'EXTENDED']
        is_rejected = status_upper == 'REJECTED'

        return {
            "category": "PERMIT",
            "code": permit.permit_number,
            "type": f"Perizinan Usaha ({permit.type})",
            "permit_type": permit.type,
            "business_name": permit.business_name,
            "business_sector": permit.business_sector or "Perdagangan & Jasa",
            "submission_date": sub_str,
            "approved_at": appr_str,
            "start_date": start_str,
            "expired_at": exp_str,
            "duration_months": permit.duration_months or 1,
            "remaining_days": remaining_days,
            "is_expired": is_expired,
            "status": current_status,
            "status_label": status_label,
            "rejection_reason": permit.rejection_reason if is_rejected else None,
            "has_pdf": bool(is_approved),
            "pdf_url": f"/api/permits/{permit.permit_number}/download-pdf" if is_approved else None,
            "permit_id": str(permit.id),
            "invoice": invoice_info,
            "steps": [
                {
                    "title": "Pengajuan Diterima",
                    "desc": "Berkas masuk ke sistem SIPEDI",
                    "done": is_submitted,
                    "active": status_upper == 'SUBMITTED'
                },
                {
                    "title": "Verifikasi Petugas",
                    "desc": "Pemeriksaan teknis dan administratif",
                    "done": is_approved or is_rejected,
                    "active": is_verifying
                },
                {
                    "title": "Penerbitan Izin Resmi",
                    "desc": "Surat izin dan QR Code legal diterbitkan",
                    "done": is_approved,
                    "active": is_approved and not is_expired
                },
                {
                    "title": "Masa Berlaku & Perpanjangan",
                    "desc": f"Masa berlaku sampai {exp_str}" if permit.expired_at else "Periode izin aktif",
                    "done": is_approved and not is_expired,
                    "active": is_approved
                }
            ]
        }

    # 2. Cari di tabel Complaint berdasarkan complaint_number
    complaint = db.query(Complaint).filter(Complaint.complaint_number == ticket_clean).first()

    if complaint:
        date_str = complaint.date.strftime("%d %B %Y") if complaint.date else "-"
        current_status = complaint.status or 'Baru'

        is_received = True
        is_in_progress = current_status in ['Verifikasi', 'Diteruskan', 'Dalam Penanganan']
        is_done = current_status == 'Selesai'

        return {
            "category": "COMPLAINT",
            "code": complaint.complaint_number,
            "type": f"Pengaduan Ketertiban ({complaint.category})",
            "category_name": complaint.category,
            "date": date_str,
            "status": current_status,
            "status_label": f"Pengaduan: {current_status}",
            "steps": [
                {
                    "title": "Laporan Diterima",
                    "desc": "Laporan masuk ke sistem SIPEDI",
                    "done": is_received,
                    "active": current_status == 'Baru'
                },
                {
                    "title": "Tindak Lanjut Lapangan",
                    "desc": "Petugas memverifikasi & menangani laporan",
                    "done": is_done,
                    "active": is_in_progress
                },
                {
                    "title": "Penanganan Selesai",
                    "desc": "Pengaduan telah selesai ditindaklanjuti",
                    "done": is_done,
                    "active": is_done
                }
            ]
        }

    raise HTTPException(status_code=404, detail="Nomor tiket atau ID perizinan tidak ditemukan dalam sistem SIPEDI.")
