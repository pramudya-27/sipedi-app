import os, uuid
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user
from app.models.user import User
from app.models.permit import Permit, PermitDocument
from app.schemas.permit import PermitResponse, PermitUpdateStatus
from app.core.config import settings

router = APIRouter(prefix='/api/permits', tags=['Permits'])

@router.get('', response_model=List[PermitResponse])
def get_permits(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == 'CITIZEN':
        return db.query(Permit).filter(Permit.applicant_id == current_user.id).order_by(Permit.submission_date.desc()).all()
    return db.query(Permit).order_by(Permit.submission_date.desc()).all()

@router.get('/{permit_id}', response_model=PermitResponse)
def get_permit(permit_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    permit = db.query(Permit).filter(Permit.id == permit_id).first()
    if not permit:
        raise HTTPException(status_code=404, detail='Permit not found')
    if current_user.role == 'CITIZEN' and permit.applicant_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not enough permissions')
    return permit

@router.post('', response_model=PermitResponse)
async def create_permit(
    type: str = Form(...),
    business_name: str = Form(...),
    documents: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    permit_num = f'PRM-{datetime.utcnow().strftime("%Y%m%d%H%M%S")}'
    new_permit = Permit(
        permit_number=permit_num, type=type, business_name=business_name, applicant_id=current_user.id, status='Submitted'
    )
    db.add(new_permit)
    db.commit()
    db.refresh(new_permit)
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    for doc in documents:
        if not doc.filename:
            continue
        file_ext = os.path.splitext(doc.filename)[1]
        file_name = f'{uuid.uuid4()}{file_ext}'
        file_path = os.path.join(settings.UPLOAD_DIR, file_name)
        with open(file_path, 'wb') as f:
            content = await doc.read()
            f.write(content)
        
        permit_doc = PermitDocument(permit_id=new_permit.id, document_type='attachment', file_path=f'/uploads/{file_name}')
        db.add(permit_doc)
    db.commit()
    db.refresh(new_permit)
    return new_permit

@router.put('/{permit_id}/status', response_model=PermitResponse)
def update_permit_status(permit_id: str, status_data: PermitUpdateStatus, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    permit = db.query(Permit).filter(Permit.id == permit_id).first()
    if not permit:
        raise HTTPException(status_code=404, detail='Permit not found')
    permit.status = status_data.status
    
    if status_data.status == 'Approved':
        # Generate the digital permit result (mock valid for 3 months)
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_name = f'Surat_Izin_{permit.permit_number}.txt'
        file_path = os.path.join(settings.UPLOAD_DIR, file_name)
        
        # Valid 3 months
        valid_until = datetime.utcnow().replace(month=(datetime.utcnow().month + 3) % 12 or 12)
        if datetime.utcnow().month > 9:
            valid_until = valid_until.replace(year=datetime.utcnow().year + 1)

        with open(file_path, 'w') as f:
            f.write(f"SURAT IZIN DIGITAL - SIPEDI\n")
            f.write(f"===========================\n")
            f.write(f"No. Izin     : {permit.permit_number}\n")
            f.write(f"Jenis Izin   : {permit.type}\n")
            f.write(f"Nama Usaha   : {permit.businessName if hasattr(permit, 'businessName') else permit.business_name}\n")
            f.write(f"Pemohon      : {permit.applicant.name if permit.applicant else 'N/A'}\n")
            f.write(f"Status       : DISETUJUI & DITANDATANGANI SECARA DIGITAL\n")
            f.write(f"Berlaku s/d  : {valid_until.strftime('%Y-%m-%d')}\n")
        
        permit_doc = PermitDocument(permit_id=permit.id, document_type='result', file_path=f'/uploads/{file_name}')
        db.add(permit_doc)
        
        # Mock sending email
        print(f"[EMAIL MOCK] Mengirim email ke pemohon {permit.applicant.email if permit.applicant else ''}")
        print(f"[EMAIL MOCK] Subjek: Surat Izin {permit.permit_number} Disetujui")
        print(f"[EMAIL MOCK] Lampiran: {file_path}")
        print(f"[EMAIL MOCK] Isi: Selamat, izin Anda disetujui. Berlaku 3 bulan hingga {valid_until.strftime('%Y-%m-%d')}.")

    db.commit()
    db.refresh(permit)
    return permit
