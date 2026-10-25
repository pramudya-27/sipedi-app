import os
import io
import uuid
import json
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user
from app.models.permit import Permit, PermitDocument
from app.models.payment import PermitRenewal, Invoice, InvoiceItem, Payment, EmailLog
from app.models.user import User
from app.utils.notification_helper import create_notification
from app.utils.audit import log_activity
from app.utils.cloudinary_upload import upload_file_to_cloudinary, delete_file_from_cloudinary
from app.services.pdf_service import generate_permit_pdf, generate_invoice_pdf
from app.services.email_service import (
    send_permit_submitted_email,
    send_permit_approved_email,
    send_renewal_invoice_email,
    send_renewal_success_email
)
from app.services.payment_service import create_snap_transaction

router = APIRouter(tags=['Permits'])

UPLOAD_DIR = "uploads/permits"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class PermitUpdateStatus(BaseModel):
    status: str
    rejection_reason: Optional[str] = None
    admin_note: Optional[str] = None
    duration_months: Optional[int] = None
    start_date: Optional[str] = None

class RenewalRequestModel(BaseModel):
    duration_months: int = 1
    notes: Optional[str] = None

def serialize_permit(p: Permit, db: Session) -> dict:
    applicant_name = getattr(p, 'applicant_name', '') or "Pemohon"
    applicant_nik = getattr(p, 'nik', '') or ""
    applicant_phone = getattr(p, 'phone', '') or ""
    applicant_email = getattr(p, 'email', '') or ""

    user_obj = None
    if hasattr(p, 'applicant') and p.applicant:
        user_obj = p.applicant
    else:
        user_obj = db.query(User).filter(User.id == str(p.applicant_id)).first() if getattr(p, 'applicant_id', None) else None

    if user_obj:
        if not applicant_name or applicant_name == "Pemohon":
            applicant_name = getattr(user_obj, 'name', getattr(user_obj, 'full_name', getattr(user_obj, 'email', 'Pemohon')))
        if not applicant_nik:
            applicant_nik = getattr(user_obj, 'nik', '')
        if not applicant_phone:
            applicant_phone = getattr(user_obj, 'phone', '')
        if not applicant_email:
            applicant_email = getattr(user_obj, 'email', '')

    permit_num = getattr(p, 'permit_number', f"PRM-{p.id}")
    permit_type = getattr(p, 'type', getattr(p, 'permit_type', 'Izin Layanan'))
    biz_name = getattr(p, 'business_name', '-')
    biz_addr = getattr(p, 'business_address', '-')
    sector = getattr(p, 'business_sector', 'Perdagangan & Jasa') or 'Perdagangan & Jasa'

    sub_date = "2026-10-21"
    if hasattr(p, 'submission_date') and p.submission_date:
        sub_date = str(p.submission_date)
    elif hasattr(p, 'created_at') and p.created_at:
        sub_date = str(p.created_at)

    docs_list = []
    docs = db.query(PermitDocument).filter(PermitDocument.permit_id == str(p.id)).all()
    for doc in docs:
        file_path = getattr(doc, 'file_path', '') or ''
        if file_path.startswith('/http://') or file_path.startswith('/https://'):
            file_path = file_path[1:]
        elif file_path and not file_path.startswith('/') and not file_path.startswith('http'):
            file_path = f"/{file_path}"
        
        docs_list.append({
            "id": str(doc.id),
            "file_name": getattr(doc, 'file_name', 'Dokumen'),
            "file_path": file_path,
            "filePath": file_path,
            "document_type": getattr(doc, 'document_type', 'PERSYARATAN'),
            "mime_type": getattr(doc, 'mime_type', 'image/png'),
            "status": getattr(doc, 'status', 'PENDING')
        })

    # Ambil riwayat perpanjangan
    renewals = db.query(PermitRenewal).filter(PermitRenewal.permit_id == str(p.id)).order_by(PermitRenewal.created_at.desc()).all()
    renewal_list = []
    for r in renewals:
        inv = db.query(Invoice).filter(Invoice.renewal_id == str(r.id)).first()
        renewal_list.append({
            "id": str(r.id),
            "renewal_number": r.renewal_number,
            "duration_months": r.duration_months,
            "status": r.status,
            "previous_expired_at": str(r.previous_expired_at) if r.previous_expired_at else None,
            "new_expired_at": str(r.new_expired_at) if r.new_expired_at else None,
            "created_at": str(r.created_at),
            "invoice_number": inv.invoice_number if inv else None,
            "invoice_status": inv.status if inv else None,
            "total_amount": float(inv.total_amount) if inv and inv.total_amount else 100000
        })

    # Ambil invoice pending terakhir
    latest_inv = db.query(Invoice).filter(Invoice.permit_id == str(p.id)).order_by(Invoice.created_at.desc()).first()
    latest_inv_data = None
    if latest_inv:
        latest_inv_data = {
            "id": str(latest_inv.id),
            "invoice_number": latest_inv.invoice_number,
            "status": latest_inv.status,
            "total_amount": float(latest_inv.total_amount or 0),
            "due_date": str(latest_inv.due_date) if latest_inv.due_date else None,
            "paid_at": str(latest_inv.paid_at) if latest_inv.paid_at else None,
            "snap_token": latest_inv.snap_token,
            "snap_redirect_url": latest_inv.snap_redirect_url,
            "qris_url": latest_inv.qris_url,
            "pdf_path": latest_inv.pdf_path
        }

    # Hitung sisa masa berlaku dalam hari jika aktif
    remaining_days = None
    is_expired = False
    if getattr(p, 'expired_at', None):
        delta = p.expired_at - datetime.utcnow()
        if delta.total_seconds() <= 0:
            remaining_days = 0
            is_expired = True
        else:
            remaining_days = delta.days
    elif getattr(p, 'status', '').upper() == 'EXPIRED':
        is_expired = True
        remaining_days = 0

    return {
        "id": str(p.id),
        "permitNumber": permit_num,
        "permit_number": permit_num,
        "type": permit_type,
        "permitType": permit_type,
        "businessName": biz_name,
        "business_name": biz_name,
        "business_address": biz_addr,
        "business_sector": sector,
        "applicantId": str(p.applicant_id) if p.applicant_id else "",
        "applicant_id": str(p.applicant_id) if p.applicant_id else "",
        "applicantName": applicant_name,
        "applicant_name": applicant_name,
        "nik": applicant_nik,
        "phone": applicant_phone,
        "email": applicant_email,
        "status": getattr(p, 'status', 'Submitted'),
        "duration_months": getattr(p, 'duration_months', 1) or 1,
        "start_date": str(p.start_date) if getattr(p, 'start_date', None) else None,
        "approved_at": str(p.approved_at) if getattr(p, 'approved_at', None) else None,
        "expired_at": str(p.expired_at) if getattr(p, 'expired_at', None) else None,
        "remaining_days": remaining_days,
        "is_expired": is_expired,
        "isExpired": is_expired,
        "rejection_reason": getattr(p, 'rejection_reason', '') or '',
        "issued_by": getattr(p, 'issued_by', '') or '',
        "pdf_path": getattr(p, 'pdf_path', '') or '',
        "qr_code_path": getattr(p, 'qr_code_path', '') or '',
        "active_version": getattr(p, 'active_version', 1) or 1,
        "submissionDate": sub_date,
        "submission_date": sub_date,
        "documents": docs_list,
        "renewals": renewal_list,
        "latest_invoice": latest_inv_data
    }

# 1.0 GET MY PERMITS (Khusus user yang sedang login)
@router.get('/my-permits')
def get_my_permits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        permits = db.query(Permit).filter(
            Permit.applicant_id == current_user.id
        ).order_by(Permit.submission_date.desc()).all()
        return [serialize_permit(p, db) for p in permits]
    except Exception as e:
        print("ERROR GET MY PERMITS:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil data perizinan saya: {str(e)}"
        )

# 1. GET ALL PERMITS (Admin melihat semua, Warga hanya miliknya)
@router.get('')
def get_permits(current_user: Optional[User] = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    try:
        query = db.query(Permit)
        if current_user and current_user.role == 'CITIZEN':
            query = query.filter(Permit.applicant_id == current_user.id)
        else:
            # Sembunyikan permohonan yang belum bayar retribusi QRIS dari antrean admin
            query = query.filter(Permit.status != 'Pending Payment')

        if hasattr(Permit, 'submission_date'):
            permits = query.order_by(Permit.submission_date.desc()).all()
        else:
            permits = query.all()

        return [serialize_permit(p, db) for p in permits]
    except Exception as e:
        print("ERROR GET PERMITS:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil daftar perizinan: {str(e)}"
        )

# 1.05 CHECK NIK AVAILABILITY FOR NEW PERMIT
@router.get('/check-nik')
def check_nik_availability(nik: str, db: Session = Depends(get_db)):
    clean_nik = str(nik).strip()
    if not clean_nik or len(clean_nik) != 16 or not clean_nik.isdigit():
        return {
            "nik": clean_nik,
            "is_valid_format": False,
            "is_available": False,
            "message": "NIK harus terdiri dari 16 digit angka."
        }

    # Cek apakah NIK sudah digunakan dalam perizinan aktif/tercatat (selain yang ditolak)
    existing_permit = db.query(Permit).filter(
        (Permit.nik == clean_nik) | (Permit.applicant.has(User.nik == clean_nik)),
        Permit.status != 'Rejected'
    ).first()

    if existing_permit:
        return {
            "nik": clean_nik,
            "is_valid_format": True,
            "is_available": False,
            "permit_number": existing_permit.permit_number,
            "business_name": existing_permit.business_name,
            "status": existing_permit.status,
            "message": f"NIK {clean_nik} sudah terdaftar pada perizinan {existing_permit.permit_number} ({existing_permit.business_name}). Satu NIK hanya dapat digunakan untuk 1 perizinan usaha."
        }

    return {
        "nik": clean_nik,
        "is_valid_format": True,
        "is_available": True,
        "message": "NIK tersedia untuk pengajuan izin baru."
    }

# 1.1 GET SINGLE PERMIT DETAIL
@router.get('/{permit_id}')
def get_permit_detail(permit_id: str, db: Session = Depends(get_db)):
    permit = db.query(Permit).filter(Permit.id == permit_id).first()
    if not permit:
        raise HTTPException(status_code=404, detail='Data perizinan tidak ditemukan.')
    return serialize_permit(permit, db)

# 2. CREATE NEW PERMIT (PENGAJUAN OLEH WARGA DENGAN DURASI & EMAIL A)
@router.post('', status_code=status.HTTP_201_CREATED)
async def create_permit(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    try:
        content_type = request.headers.get('content-type', '').lower()
        data: Dict[str, Any] = {}
        uploaded_files = []
        seen_filenames = set()

        if 'json' in content_type:
            try:
                data = await request.json()
            except Exception:
                data = {}
        else:
            try:
                form = await request.form()
                for key, val in form.items():
                    if hasattr(val, 'filename') and val.filename:
                        if val.filename not in seen_filenames:
                            seen_filenames.add(val.filename)
                            uploaded_files.append((key, val))
                    else:
                        data[key] = val
            except Exception as form_err:
                print("Warning parsing form:", form_err)

        if not data and 'json' not in content_type:
            try:
                data = await request.json()
            except Exception:
                pass

        # Mapping field frontend camelCase -> backend snake_case
        if 'permitType' in data and not data.get('type'):
            data['type'] = data['permitType']
        if 'businessName' in data and not data.get('business_name'):
            data['business_name'] = data['businessName']
        if 'businessAddress' in data and not data.get('business_address'):
            data['business_address'] = data['businessAddress']
        if 'businessSector' in data and not data.get('business_sector'):
            data['business_sector'] = data['businessSector']
        if 'durationMonths' in data and not data.get('duration_months'):
            data['duration_months'] = data['durationMonths']
        if 'startDate' in data and not data.get('start_date'):
            data['start_date'] = data['startDate']

        if not data.get('type'):
            data['type'] = 'Izin Usaha Mikro (IUMK)'
        if not data.get('business_name'):
            data['business_name'] = 'Usaha Mandiri'

        valid_permit_cols = {c.name for c in Permit.__table__.columns}
        filtered_data = {k: v for k, v in data.items() if k in valid_permit_cols}

        if 'id' in valid_permit_cols and 'id' not in filtered_data:
            filtered_data['id'] = str(uuid.uuid4())

        # Buat nomor unik standar nasional: PRM-YYYYMMDD-XXXX
        if 'permit_number' in valid_permit_cols and not filtered_data.get('permit_number'):
            short_id = uuid.uuid4().hex[:6].upper()
            filtered_data['permit_number'] = f"PRM-{datetime.now().strftime('%Y%m%d')}-{short_id}"

        # Durasi
        req_duration = int(data.get('duration_months') or data.get('duration') or 1)
        filtered_data['duration_months'] = req_duration

        # Status awal: Pending Payment (wajib bayar retribusi resmi sebelum masuk verifikasi admin)
        filtered_data['status'] = 'Pending Payment'

        # Tanggal mulai
        req_start_date = data.get('start_date')
        if req_start_date:
            try:
                filtered_data['start_date'] = datetime.fromisoformat(req_start_date)
            except Exception:
                filtered_data['start_date'] = datetime.utcnow()
        else:
            filtered_data['start_date'] = datetime.utcnow()

        # Data snapshot pemohon
        filtered_data['applicant_name'] = data.get('full_name') or data.get('applicant_name') or (getattr(current_user, 'name', None) if current_user else "Pemohon")
        filtered_data['nik'] = data.get('nik') or getattr(current_user, 'nik', '') or ""
        filtered_data['phone'] = data.get('phone') or getattr(current_user, 'phone', '') or ""
        filtered_data['email'] = data.get('email') or (getattr(current_user, 'email', '') if current_user else "")
        filtered_data['business_sector'] = data.get('business_sector') or "Perdagangan & Jasa"

        # VALIDASI KETAT NIK: NIK TIDAK BOLEH DIGUNAKAN GANDA PADA PERIZINAN
        req_nik = str(filtered_data.get('nik') or '').strip()
        if not req_nik or len(req_nik) != 16 or not req_nik.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nomor Induk Kependudukan (NIK) harus terdiri dari 16 digit angka valid sesuai KTP."
            )

        existing_permit = db.query(Permit).filter(
            (Permit.nik == req_nik) | (Permit.applicant.has(User.nik == req_nik)),
            Permit.status != 'Rejected'
        ).first()

        if existing_permit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"NIK {req_nik} sudah terdaftar pada perizinan nomor {existing_permit.permit_number} ({existing_permit.business_name}). Satu NIK hanya dapat digunakan untuk 1 perizinan usaha aktif. Silakan lakukan perpanjangan izin jika masa berlaku telah habis."
            )

        # Hubungkan ke akun User
        existing_user = current_user
        if not existing_user and filtered_data.get('email'):
            existing_user = db.query(User).filter(User.email == str(filtered_data['email']).strip()).first()

        if not existing_user and filtered_data.get('nik') and hasattr(User, 'nik'):
            existing_user = db.query(User).filter(User.nik == str(filtered_data['nik']).strip()).first()

        if not existing_user and filtered_data.get('applicant_name'):
            new_user_id = str(uuid.uuid4())
            existing_user = User(
                id=new_user_id,
                name=filtered_data['applicant_name'],
                email=filtered_data.get('email') or f"warga_{new_user_id[:6]}@sipedi.go.id",
                nik=filtered_data.get('nik'),
                phone=filtered_data.get('phone'),
                role="CITIZEN",
                hashed_password="$2b$12$eImiTXuWVxfM37uY4JANjOL.81F8Rj0gK7W3f5yG0C31i8e2A9.me"
            )
            db.add(existing_user)
            db.commit()
            db.refresh(existing_user)
        elif existing_user:
            # Sinkronkan NIK dan Nomor HP warga jika belum terisi
            if filtered_data.get('nik') and hasattr(existing_user, 'nik') and not existing_user.nik:
                existing_user.nik = filtered_data['nik']
            if filtered_data.get('phone') and hasattr(existing_user, 'phone') and not existing_user.phone:
                existing_user.phone = filtered_data['phone']
            db.commit()

        if existing_user:
            filtered_data['applicant_id'] = existing_user.id
        elif current_user:
            filtered_data['applicant_id'] = current_user.id

        new_permit = Permit(**filtered_data)
        db.add(new_permit)
        db.commit()
        db.refresh(new_permit)

        # Simpan berkas pendukung
        valid_doc_cols = {c.name for c in PermitDocument.__table__.columns}
        for field_name, file_item in uploaded_files:
            file_contents = await file_item.read()
            file_size = len(file_contents)
            file_name = file_item.filename
            content_type = file_item.content_type or 'application/octet-stream'

            file_ext = os.path.splitext(file_name)[1].lower()
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = f"uploads/permits/{unique_filename}"
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "wb") as f:
                f.write(file_contents)

            cloud_url = None
            try:
                cloud_url = upload_file_to_cloudinary(
                    file=io.BytesIO(file_contents),
                    folder_name="sipedi/permits",
                    public_id=f"doc_{uuid.uuid4()}"
                )
            except Exception as e:
                print(f"Cloudinary upload warning: {e}")

            final_path = cloud_url if cloud_url else f"/{file_path}"
            doc_kwargs = {
                "id": str(uuid.uuid4()),
                "permit_id": new_permit.id,
                "file_name": file_name,
                "document_type": field_name.upper(),
                "file_path": final_path,
                "file_size": file_size,
                "mime_type": content_type,
                "status": "PENDING"
            }
            doc_entry = PermitDocument(**{k: v for k, v in doc_kwargs.items() if k in valid_doc_cols})
            db.add(doc_entry)

        if uploaded_files:
            db.commit()

        permit_num = new_permit.permit_number

        # 1. Catat ke Audit Log
        log_activity(
            db=db,
            action="CREATE_PERMIT_APPLICATION",
            module="PERMITS",
            user_id=str(new_permit.applicant_id),
            role="CITIZEN",
            reference=permit_num,
            status="SUCCESS"
        )

        # 2. Buat Notifikasi Internal
        try:
            create_notification(
                db=db,
                user_id=str(new_permit.applicant_id),
                title="Permohonan Izin Baru",
                message=f"Permohonan izin baru ({permit_num}) telah berhasil diajukan dan sedang menunggu verifikasi.",
                type="PERMIT_STATUS",
                link_url="/citizen/profile"
            )
        except Exception as notif_err:
            print("Warning notif:", notif_err)

        # 3. Buat Invoice Retribusi QRIS untuk seluruh permohonan izin (termasuk 1 bulan)
        rate_kebersihan = 50000.0 * req_duration
        rate_keamanan = 50000.0 * req_duration
        total_amount = rate_kebersihan + rate_keamanan

        invoice_num = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        due_date = datetime.utcnow() + relativedelta(days=3)

        snap_res = create_snap_transaction(
            order_id=invoice_num,
            gross_amount=total_amount,
            customer_details={
                "first_name": new_permit.applicant_name or "Pemohon SIPEDI",
                "email": new_permit.email,
                "phone": new_permit.phone or "08123456789"
            },
            item_details=[
                {"id": "RET-KEBERSIHAN", "price": 50000, "quantity": req_duration, "name": f"Retribusi Kebersihan ({req_duration} Bulan)"},
                {"id": "RET-KEAMANAN", "price": 50000, "quantity": req_duration, "name": f"Retribusi Keamanan ({req_duration} Bulan)"}
            ]
        )

        new_invoice = Invoice(
            id=str(uuid.uuid4()),
            invoice_number=invoice_num,
            permit_id=new_permit.id,
            renewal_id=None,
            user_id=new_permit.applicant_id,
            subtotal=total_amount,
            total_amount=total_amount,
            status="UNPAID",
            due_date=due_date,
            payment_method="QRIS",
            snap_token=snap_res.get("token"),
            snap_redirect_url=snap_res.get("redirect_url"),
            qris_url=snap_res.get("qris_url") or snap_res.get("redirect_url")
        )
        db.add(new_invoice)
        db.commit()
        db.refresh(new_invoice)

        item1 = InvoiceItem(
            id=str(uuid.uuid4()),
            invoice_id=new_invoice.id,
            item_name=f"Iuran Retribusi Kebersihan ({req_duration} Bulan)",
            quantity=req_duration,
            unit_price=50000.0,
            subtotal=rate_kebersihan
        )
        item2 = InvoiceItem(
            id=str(uuid.uuid4()),
            invoice_id=new_invoice.id,
            item_name=f"Iuran Retribusi Ketertiban & Keamanan ({req_duration} Bulan)",
            quantity=req_duration,
            unit_price=50000.0,
            subtotal=rate_keamanan
        )
        db.add_all([item1, item2])
        db.commit()

        # Generate Invoice PDF (untuk ditampilkan di halaman pembayaran QRIS)
        try:
            inv_pdf_path, inv_pdf_bytes = generate_invoice_pdf(new_invoice, new_permit, new_permit.applicant)
            new_invoice.pdf_path = inv_pdf_path
            db.commit()
        except Exception as inv_err:
            print("Warning generate invoice pdf:", inv_err)

        return serialize_permit(new_permit, db)

    except HTTPException as http_err:
        db.rollback()
        raise http_err
    except Exception as e:
        db.rollback()
        print("ERROR CREATE PERMIT:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengajukan perizinan: {str(e)}"
        )

# 3. UPDATE STATUS PERMIT (PERSETUJUAN + DURASI + AUTO-PDF + EMAIL B, ATAU PENOLAKAN + ALASAN)
@router.put('/{permit_id}/status')
@router.patch('/{permit_id}/status')
def update_permit_status(
    permit_id: str,
    status_data: PermitUpdateStatus,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    try:
        permit = db.query(Permit).filter(Permit.id == permit_id).first()
        if not permit:
            raise HTTPException(status_code=404, detail='Data perizinan tidak ditemukan.')

        target_status = status_data.status

        # Skenario 1: PERSETUJUAN (APPROVED / ACTIVE)
        if target_status.upper() in ['APPROVED', 'ACTIVE']:
            duration = getattr(status_data, 'duration_months', None) or permit.duration_months or 1
            permit.duration_months = duration
            
            # Tentukan tanggal mulai
            st_date = getattr(status_data, 'start_date', None)
            if st_date:
                try:
                    start_dt = datetime.fromisoformat(st_date)
                except Exception:
                    start_dt = permit.start_date or datetime.utcnow()
            else:
                start_dt = permit.start_date or datetime.utcnow()

            permit.start_date = start_dt
            permit.approved_at = datetime.utcnow()
            permit.expired_at = start_dt + relativedelta(months=duration)
            permit.issued_by = current_user.name if current_user else "Kepala DPMPTSP SIPEDI"
            permit.rejection_reason = None

            permit.status = 'Approved'
            db.commit()
            db.refresh(permit)

            # Generate Surat Izin Resmi (PDF)
            pdf_rel_path, pdf_bytes = generate_permit_pdf(permit, permit.applicant)
            permit.pdf_path = pdf_rel_path
            db.commit()

            # Simpan entri dokumen surat resmi di permit_documents
            doc_entry = PermitDocument(
                id=str(uuid.uuid4()),
                permit_id=permit.id,
                file_name=f"SURAT_IZIN_RESMI_{permit.permit_number}.pdf",
                document_type="OFFICIAL_PERMIT_LETTER",
                file_path=pdf_rel_path,
                file_size=len(pdf_bytes),
                mime_type="application/pdf",
                status="ACTIVE"
            )
            db.add(doc_entry)
            db.commit()

            # Catat Audit Log
            log_activity(
                db=db,
                action="APPROVE_PERMIT",
                module="PERMITS",
                user_id=str(current_user.id if (current_user and hasattr(current_user, 'id')) else "1"),
                role="ADMIN",
                reference=permit.permit_number,
                status="SUCCESS"
            )

            # Notifikasi User
            create_notification(
                db=db,
                user_id=str(permit.applicant_id),
                title=f"Perizinan {duration} Bulan Disetujui!",
                message=f"Permohonan izin {permit.permit_number} ({duration} Bulan) telah disetujui. Surat izin resmi dapat langsung diunduh.",
                type="PERMIT_STATUS",
                link_url=f"/track/{permit.permit_number}"
            )

            # KIRIM EMAIL B: HASIL PERIZINAN RESMI + LAMPIRAN PDF VIA BREVO
            try:
                send_permit_approved_email(permit, pdf_bytes, db=db)
            except Exception as mail_err:
                print("Warning kirim Email B:", mail_err)

        # Skenario 2: PENOLAKAN (REJECTED)
        elif target_status.upper() == 'REJECTED':
            reason = status_data.rejection_reason or status_data.admin_note
            if not reason or not reason.strip():
                raise HTTPException(status_code=400, detail="Alasan penolakan izin wajib diisi secara jelas.")

            permit.status = 'Rejected'
            permit.rejection_reason = reason.strip()
            db.commit()
            db.refresh(permit)

            log_activity(
                db=db,
                action="REJECT_PERMIT",
                module="PERMITS",
                user_id=str(current_user.id if (current_user and hasattr(current_user, 'id')) else "1"),
                role="ADMIN",
                reference=permit.permit_number,
                status="SUCCESS"
            )

            create_notification(
                db=db,
                user_id=str(permit.applicant_id),
                title="Permohonan Izin Ditolak",
                message=f"Permohonan izin {permit.permit_number} ditolak. Alasan: {reason.strip()}",
                type="PERMIT_STATUS",
                link_url="/citizen/profile"
            )

        # Skenario Status Lainnya (Under Verification, Draft, dll.)
        else:
            permit.status = target_status
            if status_data.admin_note:
                permit.rejection_reason = status_data.admin_note
            db.commit()
            db.refresh(permit)

        return serialize_permit(permit, db)

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 4. KONFIRMASI PERPANJANGAN IZIN (MEMBUAT INVOICE, MIDTRANS QRIS, & EMAIL C)
@router.post('/{permit_id}/request-renewal')
def request_permit_renewal(
    permit_id: str,
    req_data: RenewalRequestModel,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    try:
        permit = db.query(Permit).filter(Permit.id == permit_id).first()
        if not permit:
            raise HTTPException(status_code=404, detail='Data perizinan tidak ditemukan.')

        duration = 1  # Sesuai aturan bisnis: setiap perpanjangan izin kedaluwarsa berdurasi 1 bulan (Rp 100.000)
        notes = req_data.notes or "Perpanjangan masa berlaku izin operasional (1 Bulan)"

        # 1. Buat record PermitRenewal
        renewal_id = str(uuid.uuid4())
        renewal_num = f"RNW-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        
        # Hitung estimasi expired baru (hanya referensi sebelum dibayar)
        current_exp = permit.expired_at or datetime.utcnow()
        est_new_exp = current_exp + relativedelta(months=duration)

        new_renewal = PermitRenewal(
            id=renewal_id,
            permit_id=permit.id,
            renewal_number=renewal_num,
            duration_months=duration,
            previous_expired_at=permit.expired_at,
            new_expired_at=est_new_exp,
            status="PENDING_PAYMENT",
            processed_by=str(current_user.id if (current_user and hasattr(current_user, 'id')) else "Admin"),
            notes=notes
        )
        db.add(new_renewal)

        # 2. Hitung Rincian Biaya Transparan (Section 7)
        price_kebersihan = 50000.0 * duration
        price_keamanan = 50000.0 * duration
        total_amount = price_kebersihan + price_keamanan

        # 3. Buat Invoice
        invoice_id = str(uuid.uuid4())
        invoice_num = f"INV-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        due_date = datetime.utcnow() + timedelta(days=3) # 3 hari batas pembayaran

        new_invoice = Invoice(
            id=invoice_id,
            invoice_number=invoice_num,
            renewal_id=renewal_id,
            permit_id=permit.id,
            user_id=permit.applicant_id,
            subtotal=total_amount,
            total_amount=total_amount,
            status="UNPAID",
            due_date=due_date,
            payment_method="QRIS"
        )
        db.add(new_invoice)

        # Item 1: Iuran Kebersihan
        item1 = InvoiceItem(
            id=str(uuid.uuid4()),
            invoice_id=invoice_id,
            item_name=f"Iuran Kebersihan Lingkungan ({duration} Bulan)",
            quantity=duration,
            unit_price=50000.0,
            subtotal=price_kebersihan
        )
        # Item 2: Iuran Keamanan
        item2 = InvoiceItem(
            id=str(uuid.uuid4()),
            invoice_id=invoice_id,
            item_name=f"Iuran Ketertiban & Keamanan Publik ({duration} Bulan)",
            quantity=duration,
            unit_price=50000.0,
            subtotal=price_keamanan
        )
        db.add(item1)
        db.add(item2)
        db.commit()

        # 4. Integrasi Midtrans Sandbox Snap
        customer_info = {
            "first_name": permit.applicant_name or "Warga",
            "email": permit.email or "warga@sipedi.go.id",
            "phone": permit.phone or "08123456789"
        }
        item_list = [
            {"id": "KEBERSIHAN", "price": int(price_kebersihan), "quantity": 1, "name": f"Iuran Kebersihan ({duration} Bulan)"},
            {"id": "KEAMANAN", "price": int(price_keamanan), "quantity": 1, "name": f"Iuran Keamanan ({duration} Bulan)"}
        ]

        midtrans_res = create_snap_transaction(
            order_id=invoice_num,
            gross_amount=total_amount,
            customer_details=customer_info,
            item_details=item_list
        )

        new_invoice.snap_token = midtrans_res.get("token")
        new_invoice.snap_redirect_url = midtrans_res.get("redirect_url")
        new_invoice.qris_url = midtrans_res.get("qris_url") or midtrans_res.get("redirect_url")
        db.commit()

        # 5. Generate Invoice PDF
        inv_pdf_path, inv_pdf_bytes = generate_invoice_pdf(new_invoice, permit, permit.applicant)
        new_invoice.pdf_path = inv_pdf_path
        db.commit()

        # 6. Catat Audit Log
        log_activity(
            db=db,
            action="REQUEST_PERMIT_RENEWAL",
            module="PERMITS",
            user_id=str(current_user.id if (current_user and hasattr(current_user, 'id')) else "1"),
            role="ADMIN",
            reference=f"{permit.permit_number} | {invoice_num}",
            status="SUCCESS"
        )

        # 7. KIRIM EMAIL C: TAGIHAN PERPANJANGAN VIA BREVO
        try:
            send_renewal_invoice_email(new_invoice, permit, inv_pdf_bytes, db=db)
        except Exception as mail_err:
            print("Warning kirim Email C:", mail_err)

        return {
            "message": "Tagihan perpanjangan izin berhasil dibuat dan email telah dikirim.",
            "renewal_id": renewal_id,
            "invoice_number": invoice_num,
            "total_amount": total_amount,
            "snap_token": new_invoice.snap_token,
            "snap_redirect_url": new_invoice.snap_redirect_url,
            "invoice_pdf": inv_pdf_path
        }

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        db.rollback()
        print("ERROR RENEWAL:", str(e))
        raise HTTPException(status_code=500, detail=f"Gagal memproses perpanjangan: {str(e)}")

# 5. DOWNLOAD PDF SURAT IZIN RESMI
@router.get('/{permit_id}/download-pdf')
def download_permit_pdf(permit_id: str, db: Session = Depends(get_db)):
    from sqlalchemy import or_
    permit = db.query(Permit).filter(
        or_(Permit.id == permit_id, Permit.permit_number == permit_id)
    ).first()
    if not permit:
        raise HTTPException(status_code=404, detail="Data perizinan tidak ditemukan.")

    def find_existing_file(p: str) -> Optional[str]:
        if not p:
            return None
        c = p.lstrip('/')
        candidates = [
            c,
            os.path.join("..", c),
            os.path.join("backend", c),
            os.path.abspath(c),
            os.path.join(settings.UPLOAD_DIR, 'permits', os.path.basename(c)),
            os.path.join('uploads', 'permits', os.path.basename(c))
        ]
        for cand in candidates:
            if os.path.exists(cand) and os.path.isfile(cand):
                return cand
        return None

    resolved_path = find_existing_file(permit.pdf_path) if permit.pdf_path else None
    if not resolved_path:
        rel_path, pdf_bytes = generate_permit_pdf(permit, permit.applicant)
        permit.pdf_path = rel_path
        db.commit()
        resolved_path = find_existing_file(rel_path)

    if not resolved_path or not os.path.exists(resolved_path):
        raise HTTPException(status_code=404, detail="File PDF surat izin belum berhasil dibuat.")

    permit_num = getattr(permit, 'permit_number', 'IZIN')
    filename = f"SURAT_IZIN_RESMI_{permit_num}.pdf"
    return FileResponse(
        resolved_path, 
        media_type="application/pdf", 
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# 6. RESEND EMAIL PERSETUJUAN
@router.post('/{permit_id}/resend-email')
def resend_permit_email(permit_id: str, db: Session = Depends(get_db)):
    from sqlalchemy import or_
    permit = db.query(Permit).filter(
        or_(Permit.id == permit_id, Permit.permit_number == permit_id)
    ).first()
    if not permit:
        raise HTTPException(status_code=404, detail="Data perizinan tidak ditemukan.")

    if permit.status.upper() not in ['APPROVED', 'ACTIVE', 'EXTENDED']:
        raise HTTPException(status_code=400, detail="Hanya perizinan yang telah disetujui yang dapat dikirimi surat izin.")

    # Generate / baca bytes PDF
    pdf_rel_path, pdf_bytes = generate_permit_pdf(permit, permit.applicant)
    permit.pdf_path = pdf_rel_path
    db.commit()

    success = send_permit_approved_email(permit, pdf_bytes, db=db)
    if not success:
        return {"message": "Gagal mengirim email, periksa kredensial Brevo atau coba kembali.", "status": "failed"}

    return {"message": f"Surat izin resmi berhasil dikirim ulang ke {permit.email}.", "status": "success"}

# 7. CHECK & AUTO-UPDATE EXPIRED PERMITS (SCHEDULER / WORKER)
@router.post('/check-expired')
def check_expired_permits(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    expired_permits = db.query(Permit).filter(
        Permit.status.in_(['Approved', 'ACTIVE', 'EXTENDED']),
        Permit.expired_at < now
    ).all()

    count = 0
    for p in expired_permits:
        p.status = 'EXPIRED'
        count += 1

    if count > 0:
        db.commit()

    return {"message": f"Pemeriksaan kedaluwarsa selesai. {count} perizinan telah diperbarui menjadi EXPIRED.", "count": count}

# 8. DELETE PERMIT
@router.delete('/{permit_id}')
def delete_permit(permit_id: str, db: Session = Depends(get_db)):
    try:
        permit = db.query(Permit).filter(Permit.id == permit_id).first()
        if not permit:
            raise HTTPException(status_code=404, detail='Data perizinan tidak ditemukan')

        docs = db.query(PermitDocument).filter(PermitDocument.permit_id == permit_id).all()
        for doc in docs:
            if doc.file_path:
                if "cloudinary" in doc.file_path:
                    try:
                        delete_file_from_cloudinary(doc.file_path)
                    except Exception as fe:
                        print("Gagal hapus cloudinary:", fe)
                else:
                    clean_path = doc.file_path.lstrip('/')
                    if os.path.exists(clean_path):
                        try:
                            os.remove(clean_path)
                        except Exception:
                            pass
            db.delete(doc)

        db.delete(permit)
        db.commit()
        return {"message": "Data perizinan berhasil dihapus"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
