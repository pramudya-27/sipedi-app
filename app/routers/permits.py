import os
import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.permit import Permit, PermitDocument
from app.models.user import User
from app.utils.notification_helper import create_notification

router = APIRouter(tags=['Permits'])

UPLOAD_DIR = "uploads/permits"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class PermitUpdateStatus(BaseModel):
    status: str
    admin_note: Optional[str] = None

# 1. GET ALL PERMITS (Pengurutan diperbaiki ke created_at.desc / submission_date.desc)
@router.get('')
def get_permits(db: Session = Depends(get_db)):
    try:
        if hasattr(Permit, 'created_at'):
            permits = db.query(Permit).order_by(Permit.created_at.desc()).all()
        elif hasattr(Permit, 'submission_date'):
            permits = db.query(Permit).order_by(Permit.submission_date.desc()).all()
        else:
            permits = db.query(Permit).all()

        result = []
        for p in permits:
            applicant_name = "Pemohon"
            applicant_nik = getattr(p, 'nik', '')
            applicant_phone = getattr(p, 'phone', '')
            applicant_email = getattr(p, 'email', '')

            user_obj = None
            if hasattr(p, 'applicant') and p.applicant:
                user_obj = p.applicant
            else:
                user_obj = db.query(User).filter(User.id == str(p.applicant_id)).first() if getattr(p, 'applicant_id', None) else None

            if user_obj:
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

            sub_date = "2026-10-21"
            if hasattr(p, 'submission_date') and p.submission_date:
                sub_date = str(p.submission_date)
            elif hasattr(p, 'created_at') and p.created_at:
                sub_date = str(p.created_at)

            docs_list = []
            docs = db.query(PermitDocument).filter(PermitDocument.permit_id == str(p.id)).all()
            for doc in docs:
                file_path = getattr(doc, 'file_path', '')
                if file_path and not file_path.startswith('/'):
                    file_path = f"/{file_path}"
                
                docs_list.append({
                    "id": str(doc.id),
                    "file_name": getattr(doc, 'file_name', 'Dokumen'),
                    "file_path": file_path,
                    "document_type": getattr(doc, 'document_type', 'PERSYARATAN'),
                    "mime_type": getattr(doc, 'mime_type', 'image/png'),
                    "status": getattr(doc, 'status', 'PENDING')
                })

            result.append({
                "id": str(p.id),
                "permitNumber": permit_num,
                "permit_number": permit_num,
                "type": permit_type,
                "permitType": permit_type,
                "businessName": biz_name,
                "business_name": biz_name,
                "business_address": biz_addr,
                "applicantName": applicant_name,
                "applicant_name": applicant_name,
                "nik": applicant_nik,
                "phone": applicant_phone,
                "email": applicant_email,
                "status": getattr(p, 'status', 'Submitted'),
                "submissionDate": sub_date,
                "submission_date": sub_date,
                "documents": docs_list
            })
            
        return result
    except Exception as e:
        print("ERROR GET PERMITS:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil data perizinan: {str(e)}"
        )

# 2. CREATE PERMIT
@router.post('')
async def create_permit(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        data = {}
        uploaded_files = []
        seen_filenames = set()

        content_type = request.headers.get('content-type', '')

        if 'multipart/form-data' in content_type:
            form = await request.form()
            for key, val in form.items():
                if hasattr(val, 'filename') and val.filename:
                    if val.filename not in seen_filenames:
                        seen_filenames.add(val.filename)
                        uploaded_files.append((key, val))
                else:
                    data[key] = val
        elif 'application/json' in content_type:
            data = await request.json()

        if 'permitType' in data and 'type' not in data:
            data['type'] = data['permitType']
        if 'businessName' in data and 'business_name' not in data:
            data['business_name'] = data['businessName']

        valid_permit_cols = {c.name for c in Permit.__table__.columns}
        filtered_data = {k: v for k, v in data.items() if k in valid_permit_cols}

        if 'id' in valid_permit_cols and 'id' not in filtered_data:
            filtered_data['id'] = str(uuid.uuid4())

        if 'permit_number' in valid_permit_cols and not filtered_data.get('permit_number'):
            short_id = str(uuid.uuid4())[:8].upper()
            filtered_data['permit_number'] = f"PRM-{datetime.now().strftime('%Y%m%d')}-{short_id}"

        if 'status' in valid_permit_cols and (not filtered_data.get('status') or filtered_data.get('status') == 'Draft'):
            filtered_data['status'] = 'Submitted'

        # Penanganan applicant_id
        if 'applicant_id' in valid_permit_cols:
            req_applicant_id = filtered_data.get('applicant_id') or data.get('user_id')
            req_email = data.get('email')
            req_name = data.get('full_name') or data.get('applicant_name') or data.get('applicantName') or data.get('name')
            req_nik = data.get('nik')
            
            existing_user = None
            valid_user_cols = {c.name for c in User.__table__.columns}
            
            # 1. Cek berdasarkan ID
            if req_applicant_id:
                existing_user = db.query(User).filter(User.id == str(req_applicant_id)).first()
            
            # 2. Cek berdasarkan Email
            if not existing_user and req_email and 'email' in valid_user_cols:
                existing_user = db.query(User).filter(User.email == str(req_email).strip()).first()

            # 3. Cek berdasarkan NIK
            if not existing_user and req_nik and 'nik' in valid_user_cols:
                existing_user = db.query(User).filter(User.nik == str(req_nik)).first()
                
            # 4. Cek berdasarkan Nama
            if not existing_user and req_name:
                if 'name' in valid_user_cols:
                    existing_user = db.query(User).filter(User.name == str(req_name)).first()
                elif 'full_name' in valid_user_cols:
                    existing_user = db.query(User).filter(User.full_name == str(req_name)).first()

            if not existing_user and req_name:
                new_user_id = str(uuid.uuid4())
                user_kwargs = {"id": new_user_id}
                
                if 'name' in valid_user_cols:
                    user_kwargs['name'] = req_name
                elif 'full_name' in valid_user_cols:
                    user_kwargs['full_name'] = req_name
                    
                if 'nik' in valid_user_cols:
                    user_kwargs['nik'] = req_nik or f"35102{str(uuid.uuid4().int)[:11]}"
                    
                if 'email' in valid_user_cols:
                    user_kwargs['email'] = req_email or f"user_{new_user_id[:6]}@sipedi.go.id"
                    
                if 'role' in valid_user_cols:
                    user_kwargs['role'] = "CITIZEN"

                if 'hashed_password' in valid_user_cols:
                    user_kwargs['hashed_password'] = "$2b$12$eImiTXuWVxfM37uY4JANjOL.81F8Rj0gK7W3f5yG0C31i8e2A9.me"

                existing_user = User(**user_kwargs)
                db.add(existing_user)
                db.commit()
                db.refresh(existing_user)

            if not existing_user:
                existing_user = db.query(User).first()

            if existing_user:
                filtered_data['applicant_id'] = existing_user.id

        new_permit = Permit(**filtered_data)
        db.add(new_permit)
        db.commit()
        db.refresh(new_permit)

        # Simpan Berkas Upload ke permit_documents
        valid_doc_cols = {c.name for c in PermitDocument.__table__.columns}

        for field_name, file_item in uploaded_files:
            file_ext = os.path.splitext(file_item.filename)[1]
            saved_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, saved_filename)

            file_contents = await file_item.read()
            with open(file_path, "wb") as f:
                f.write(file_contents)

            doc_payload = {}
            if 'id' in valid_doc_cols:
                doc_payload['id'] = str(uuid.uuid4())
            if 'permit_id' in valid_doc_cols:
                doc_payload['permit_id'] = new_permit.id
            if 'file_name' in valid_doc_cols:
                doc_payload['file_name'] = file_item.filename
            if 'document_type' in valid_doc_cols:
                doc_payload['document_type'] = field_name.upper() if field_name else "PERSYARATAN"
            if 'file_path' in valid_doc_cols:
                doc_payload['file_path'] = f"/{UPLOAD_DIR}/{saved_filename}"
            if 'file_size' in valid_doc_cols:
                doc_payload['file_size'] = len(file_contents)
            if 'mime_type' in valid_doc_cols:
                doc_payload['mime_type'] = file_item.content_type or "application/octet-stream"
            if 'status' in valid_doc_cols:
                doc_payload['status'] = "PENDING"
            if 'created_at' in valid_doc_cols:
                doc_payload['created_at'] = datetime.now()
            if 'updated_at' in valid_doc_cols:
                doc_payload['updated_at'] = datetime.now()

            doc_entry = PermitDocument(**doc_payload)
            db.add(doc_entry)

        if uploaded_files:
            db.commit()

        permit_num = getattr(new_permit, 'permit_number', f"PRM-{new_permit.id}")

        try:
            create_notification(
                db=db,
                user_id=str(filtered_data.get('applicant_id', '1')),
                title="Permohonan Izin Baru",
                message=f"Permohonan izin baru ({permit_num}) telah berhasil diajukan.",
                type="PERMIT_STATUS",
                link_url="/admin/permits"
            )
        except Exception as notif_err:
            print("Warning: Gagal membuat notifikasi:", notif_err)

        return new_permit
    except Exception as e:
        db.rollback()
        print("ERROR CREATE PERMIT:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat perizinan: {str(e)}"
        )

# 3. UPDATE STATUS PERMIT
@router.put('/{permit_id}/status')
@router.patch('/{permit_id}/status')
def update_permit_status(
    permit_id: str,
    status_data: PermitUpdateStatus,
    db: Session = Depends(get_db)
):
    try:
        permit = db.query(Permit).filter(Permit.id == permit_id).first()
        if not permit:
            raise HTTPException(status_code=404, detail='Permit not found')

        permit.status = status_data.status
        if status_data.admin_note and hasattr(permit, 'admin_note'):
            permit.admin_note = status_data.admin_note

        db.commit()
        db.refresh(permit)

        permit_num = getattr(permit, 'permit_number', f"PRM-{permit.id}")
        target_user = getattr(permit, 'applicant_id', "1") or "1"

        try:
            create_notification(
                db=db,
                user_id=str(target_user),
                title="Status Perizinan Diperbarui",
                message=f"Permohonan izin {permit_num} telah diubah statusnya menjadi '{status_data.status}'.",
                type="PERMIT_STATUS",
                link_url="/admin/permits"
            )
        except Exception as notif_err:
            print("Warning: Gagal membuat notifikasi:", notif_err)

        return permit
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 4. DELETE PERMIT
@router.delete('/{permit_id}')
def delete_permit(
    permit_id: str,
    db: Session = Depends(get_db)
):
    try:
        permit = db.query(Permit).filter(Permit.id == permit_id).first()
        if not permit:
            raise HTTPException(status_code=404, detail='Data perizinan tidak ditemukan')

        docs = db.query(PermitDocument).filter(PermitDocument.permit_id == permit_id).all()
        for doc in docs:
            if doc.file_path:
                clean_path = doc.file_path.lstrip('/')
                if os.path.exists(clean_path):
                    try:
                        os.remove(clean_path)
                    except Exception as fe:
                        print("Gagal menghapus file fisik:", fe)
            db.delete(doc)

        db.delete(permit)
        db.commit()

        return {"message": "Data perizinan berhasil dihapus"}
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        db.rollback()
        print("ERROR DELETE PERMIT:", str(e))
        raise HTTPException(status_code=500, detail=f"Gagal menghapus perizinan: {str(e)}")