import os, uuid
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.complaint import Complaint, ComplaintEvidence
from app.schemas.complaint import ComplaintUpdateStatus
from app.utils.cloudinary_upload import upload_file_to_cloudinary, delete_file_from_cloudinary
from app.utils.notification_helper import create_notification

router = APIRouter(tags=['Complaints'])

def serialize_complaint(c: Complaint, db: Session) -> dict:
    comp_id = str(getattr(c, 'id', uuid.uuid4()))
    comp_num = str(getattr(c, 'complaint_number', f"CMP-{comp_id[:8]}"))
    category = str(getattr(c, 'category', 'Umum') or 'Umum')
    location = str(getattr(c, 'location', '-') or '-')
    description = str(getattr(c, 'description', '-') or '-')
    comp_status = str(getattr(c, 'status', 'Baru') or 'Baru')
    priority = str(getattr(c, 'priority', 'RENDAH') or 'RENDAH')
    created_at = str(getattr(c, 'date', datetime.utcnow()))
    admin_note = getattr(c, 'admin_note', None)

    rep_user = getattr(c, 'reporter', None)
    if not rep_user and getattr(c, 'reporter_id', None):
        try:
            rep_user = db.query(User).filter(User.id == c.reporter_id).first()
        except Exception:
            pass

    reporter_name = getattr(c, 'reporter_name', None)
    if not reporter_name or reporter_name in ["Anonim", "Masyarakat"]:
        if rep_user and getattr(rep_user, 'name', None):
            reporter_name = rep_user.name
        else:
            reporter_name = "Masyarakat"

    nik_val = str(getattr(c, 'nik', '') or '')
    if not nik_val and rep_user and getattr(rep_user, 'nik', None):
        nik_val = str(rep_user.nik)
    masked_nik = f"{nik_val[:4]}************" if len(nik_val) >= 4 else "3510************"

    email_val = str(getattr(c, 'email', '') or '')
    if not email_val and rep_user and getattr(rep_user, 'email', None):
        email_val = str(rep_user.email)

    phone_val = str(getattr(c, 'phone', '') or getattr(c, 'contact_number', '') or '')
    if not phone_val and rep_user and getattr(rep_user, 'phone', None):
        phone_val = str(rep_user.phone)

    evidences_list = []
    try:
        evs = db.query(ComplaintEvidence).filter(ComplaintEvidence.complaint_id == comp_id).all()
        for ev in evs:
            fp = getattr(ev, 'file_path', '') or ''
            if fp.startswith('/http://') or fp.startswith('/https://'):
                fp = fp[1:]
            elif fp and not fp.startswith('/') and not fp.startswith('http'):
                fp = f"/{fp}"
            evidences_list.append({
                "id": str(getattr(ev, 'id', '')),
                "file_name": str(getattr(ev, 'file_name', 'Foto Bukti')),
                "file_path": fp,
                "filePath": fp,
                "file_type": str(getattr(ev, 'file_type', 'image/jpeg'))
            })
    except Exception as ev_err:
        print("Warning fetch evidences fail:", ev_err)

    return {
        "id": comp_id,
        "complaint_number": comp_num,
        "complaintNumber": comp_num,
        "category": category,
        "location": location,
        "description": description,
        "title": str(getattr(c, 'title', None) or category),
        "status": comp_status,
        "priority": priority,
        "reporter_id": str(getattr(c, 'reporter_id', '') or ''),
        "reporter_name": str(reporter_name),
        "reporterName": str(reporter_name),
        "nik": nik_val,
        "maskedNik": masked_nik,
        "masked_nik": masked_nik,
        "contact_number": phone_val,
        "phone": phone_val,
        "email": email_val,
        "admin_note": admin_note,
        "adminNote": admin_note,
        "date": created_at,
        "created_at": created_at,
        "evidences": evidences_list,
        "complaint_evidences": evidences_list
    }

# 1. GET ALL COMPLAINTS (Filtered by user if citizen)
@router.get('')
def get_complaints(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Complaint)
        if current_user and current_user.role == 'CITIZEN':
            query = query.filter(Complaint.reporter_id == current_user.id)
        complaints = query.order_by(Complaint.date.desc()).all()
    except Exception as e:
        try:
            complaints = db.query(Complaint).all()
        except Exception as err:
            print("CRITICAL DATABASE QUERY ERROR:", err)
            return []

    result = []
    for c in complaints:
        try:
            result.append(serialize_complaint(c, db))
        except Exception as row_err:
            print("Error parsing single complaint row:", row_err)
            continue

    return result

# 2. GET MY COMPLAINTS (Khusus user yang sedang login)
@router.get('/my-complaints')
def get_my_complaints(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        complaints = db.query(Complaint).filter(
            Complaint.reporter_id == current_user.id
        ).order_by(Complaint.date.desc()).all()
        return [serialize_complaint(c, db) for c in complaints]
    except Exception as e:
        print("ERROR GET MY COMPLAINTS:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil pengaduan saya: {str(e)}"
        )

# 3. GET SINGLE COMPLAINT BY ID
@router.get('/{complaint_id}')
def get_complaint(complaint_id: str, db: Session = Depends(get_db)):
    try:
        c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not c:
            raise HTTPException(status_code=404, detail='Complaint not found')
        return serialize_complaint(c, db)
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. CREATE COMPLAINT
@router.post('')
async def create_complaint(
    category: str = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    full_name: Optional[str] = Form(None),
    nik: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    evidences: List[UploadFile] = File(default=[]),
    files: List[UploadFile] = File(default=[]),
    file: Optional[UploadFile] = File(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    try:
        comp_num = f'CMP-{datetime.utcnow().strftime("%Y%m%d%H%M%S")}'
        reporter_display_name = full_name
        reporter_user_id = None

        if current_user:
            reporter_user_id = str(current_user.id)
            if not reporter_display_name:
                reporter_display_name = getattr(current_user, 'name', 'Masyarakat')
            if not email:
                email = getattr(current_user, 'email', None)
            if not nik:
                nik = getattr(current_user, 'nik', None)
            if not phone:
                phone = getattr(current_user, 'phone', None)
        else:
            # Cari user berdasarkan email atau nik jika ada
            matched_user = None
            if email:
                matched_user = db.query(User).filter(User.email == str(email).strip()).first()
            if not matched_user and nik:
                matched_user = db.query(User).filter(User.nik == str(nik).strip()).first()
            
            if matched_user:
                reporter_user_id = str(matched_user.id)
                if not reporter_display_name:
                    reporter_display_name = getattr(matched_user, 'name', 'Masyarakat')
            elif full_name or email:
                # Buat user baru untuk pengadu publik
                new_user_id = str(uuid.uuid4())
                user_kwargs = {
                    "id": new_user_id,
                    "name": full_name or "Masyarakat",
                    "email": email or f"pengadu_{new_user_id[:6]}@sipedi.go.id",
                    "role": "CITIZEN",
                    "hashed_password": "$2b$12$eImiTXuWVxfM37uY4JANjOL.81F8Rj0gK7W3f5yG0C31i8e2A9.me"
                }
                valid_u_cols = {col.name for col in User.__table__.columns}
                if 'nik' in valid_u_cols and nik:
                    user_kwargs['nik'] = nik
                if 'phone' in valid_u_cols and phone:
                    user_kwargs['phone'] = phone
                created_u = User(**user_kwargs)
                db.add(created_u)
                db.commit()
                db.refresh(created_u)
                reporter_user_id = created_u.id
            else:
                default_u = db.query(User).first()
                reporter_user_id = str(default_u.id) if default_u else "1"

        if not reporter_display_name:
            reporter_display_name = "Masyarakat"

        new_complaint = Complaint()
        new_complaint.id = str(uuid.uuid4())
        
        if hasattr(new_complaint, 'complaint_number'):
            setattr(new_complaint, 'complaint_number', comp_num)
        if hasattr(new_complaint, 'category'):
            setattr(new_complaint, 'category', category)
        if hasattr(new_complaint, 'location'):
            setattr(new_complaint, 'location', location)
        if hasattr(new_complaint, 'description'):
            setattr(new_complaint, 'description', description)
        if hasattr(new_complaint, 'reporter_name'):
            setattr(new_complaint, 'reporter_name', reporter_display_name)
        if hasattr(new_complaint, 'reporter_id'):
            setattr(new_complaint, 'reporter_id', reporter_user_id)
        if hasattr(new_complaint, 'nik'):
            setattr(new_complaint, 'nik', nik)
        if hasattr(new_complaint, 'contact_number'):
            setattr(new_complaint, 'contact_number', phone)
        if hasattr(new_complaint, 'phone'):
            setattr(new_complaint, 'phone', phone)
        if hasattr(new_complaint, 'email'):
            setattr(new_complaint, 'email', email)
        if hasattr(new_complaint, 'status'):
            setattr(new_complaint, 'status', 'Baru')
        if hasattr(new_complaint, 'priority'):
            setattr(new_complaint, 'priority', 'RENDAH')
        if hasattr(new_complaint, 'date'):
            setattr(new_complaint, 'date', datetime.utcnow())
        if hasattr(new_complaint, 'title') and title:
            setattr(new_complaint, 'title', title)

        db.add(new_complaint)
        db.commit()
        db.refresh(new_complaint)
        
        upload_dir = "uploads/complaints"
        os.makedirs(upload_dir, exist_ok=True)

        all_docs = list(evidences) + list(files)
        if file and file.filename:
            all_docs.append(file)

        for doc in all_docs:
            if not doc or not doc.filename:
                continue

            file_contents = await doc.read()
            file_path_result = None
            try:
                # Upload bukti pengaduan langsung ke Cloudinary folder 'SIPEDI/pengaduan'
                file_path_result = upload_file_to_cloudinary(
                    file=file_contents,
                    folder_name='SIPEDI/pengaduan'
                )
            except Exception as e:
                print(f"Cloudinary upload failed for complaint, falling back to local: {e}")
                filename = f"{uuid.uuid4()}_{doc.filename}"
                local_path = os.path.join(upload_dir, filename)
                with open(local_path, "wb") as f:
                    f.write(file_contents)
                file_path_result = f"/uploads/complaints/{filename}"
                
            if file_path_result:
                comp_ev = ComplaintEvidence()
                comp_ev.id = str(uuid.uuid4())
                if hasattr(comp_ev, 'complaint_id'):
                    setattr(comp_ev, 'complaint_id', str(new_complaint.id))
                if hasattr(comp_ev, 'file_path'):
                    setattr(comp_ev, 'file_path', file_path_result)
                if hasattr(comp_ev, 'file_name'):
                    setattr(comp_ev, 'file_name', doc.filename)
                if hasattr(comp_ev, 'file_type'):
                    setattr(comp_ev, 'file_type', doc.content_type)
                
                db.add(comp_ev)
                
        db.commit()
        db.refresh(new_complaint)

        try:
            create_notification(
                db=db,
                user_id="1",
                title="Pengaduan Baru Masuk",
                message=f"Pengaduan baru ({comp_num}) kategori {category} telah dikirim oleh {reporter_display_name}.",
                type="NEW_COMPLAINT",
                link_url="/admin/complaints"
            )
        except Exception as notif_err:
            print("Warning notification fail:", notif_err)

        return new_complaint
    except Exception as e:
        db.rollback()
        print("CRITICAL ERROR CREATE COMPLAINT:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat pengaduan: {str(e)}"
        )

# 5. UPDATE COMPLAINT STATUS
@router.put('/{complaint_id}/status')
@router.patch('/{complaint_id}/status')
def update_complaint_status(
    complaint_id: str, 
    status_data: ComplaintUpdateStatus, 
    db: Session = Depends(get_db)
):
    try:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=404, detail='Complaint not found')
            
        complaint.status = status_data.status
        if status_data.priority:
            complaint.priority = status_data.priority
        if status_data.admin_note:
            complaint.admin_note = status_data.admin_note
            
        db.commit()
        db.refresh(complaint)

        # Kirim notifikasi email HANYA jika status diubah menjadi 'Selesai'
        if str(status_data.status).strip().lower() == 'selesai':
            try:
                from app.services.email_service import send_complaint_resolved_email
                send_complaint_resolved_email(complaint=complaint, db=db)
            except Exception as mail_err:
                print(f"[COMPLAINT RESOLVED EMAIL ERROR] Gagal mengirim email penyelesaian: {mail_err}")

        target_user = getattr(complaint, 'reporter_id', getattr(complaint, 'user_id', "1")) or "1"
        try:
            create_notification(
                db=db,
                user_id=str(target_user),
                title="Status Pengaduan Diperbarui",
                message=f"Status pengaduan {complaint.complaint_number} diubah menjadi '{status_data.status}'.",
                type="COMPLAINT_STATUS",
                link_url="/admin/complaints"
            )
        except Exception:
            pass

        return complaint
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 6. DELETE COMPLAINT
@router.delete('/{complaint_id}')
def delete_complaint(complaint_id: str, db: Session = Depends(get_db)):
    try:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=404, detail='Complaint not found')
        
        # Hapus bukti file dari Cloudinary atau lokal
        evidences = db.query(ComplaintEvidence).filter(ComplaintEvidence.complaint_id == complaint_id).all()
        for ev in evidences:
            if ev.file_path:
                if "cloudinary" in ev.file_path:
                    try:
                        delete_file_from_cloudinary(ev.file_path)
                    except Exception as fe:
                        print("Gagal menghapus bukti dari Cloudinary:", fe)
                else:
                    clean_path = ev.file_path.lstrip('/')
                    if os.path.exists(clean_path):
                        try:
                            os.remove(clean_path)
                        except Exception:
                            pass
            db.delete(ev)

        db.delete(complaint)
        db.commit()
        return {"message": "Complaint deleted successfully"}
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))