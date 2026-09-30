import os, uuid
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user
from app.models.user import User
from app.models.complaint import Complaint, ComplaintEvidence
from app.schemas.complaint import ComplaintResponse, ComplaintUpdateStatus
from app.core.config import settings

router = APIRouter(prefix='/api/complaints', tags=['Complaints'])

@router.get('', response_model=List[ComplaintResponse])
def get_complaints(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == 'CITIZEN':
        return db.query(Complaint).filter(Complaint.reporter_id == current_user.id).order_by(Complaint.date.desc()).all()
    return db.query(Complaint).order_by(Complaint.date.desc()).all()

@router.get('/{complaint_id}', response_model=ComplaintResponse)
def get_complaint(complaint_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail='Complaint not found')
    if current_user.role == 'CITIZEN' and complaint.reporter_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not enough permissions')
    return complaint

@router.post('', response_model=ComplaintResponse)
async def create_complaint(
    category: str = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    evidences: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comp_num = f'CMP-{datetime.utcnow().strftime("%Y%m%d%H%M%S")}'
    new_complaint = Complaint(
        complaint_number=comp_num, category=category, location=location, description=description, reporter_id=current_user.id, status='Baru'
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    for doc in evidences:
        if not doc.filename:
            continue
        file_ext = os.path.splitext(doc.filename)[1]
        file_name = f'{uuid.uuid4()}{file_ext}'
        file_path = os.path.join(settings.UPLOAD_DIR, file_name)
        with open(file_path, 'wb') as f:
            content = await doc.read()
            f.write(content)
        
        comp_ev = ComplaintEvidence(complaint_id=new_complaint.id, file_path=f'/uploads/{file_name}')
        db.add(comp_ev)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint

@router.put('/{complaint_id}/status', response_model=ComplaintResponse)
def update_complaint_status(complaint_id: str, status_data: ComplaintUpdateStatus, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail='Complaint not found')
    complaint.status = status_data.status
    if status_data.priority:
        complaint.priority = status_data.priority
    db.commit()
    db.refresh(complaint)
    return complaint
