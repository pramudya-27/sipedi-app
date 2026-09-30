from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user, get_admin_user
from app.models.user import User
from app.models.permit import Permit
from app.models.complaint import Complaint

router = APIRouter(prefix='/api/dashboard', tags=['Dashboard'])

@router.get('/citizen')
def get_citizen_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_permits = db.query(Permit).filter(Permit.applicant_id == current_user.id).count()
    total_complaints = db.query(Complaint).filter(Complaint.reporter_id == current_user.id).count()
    active_permits = db.query(Permit).filter(Permit.applicant_id == current_user.id, Permit.status.notin_(['Approved', 'Rejected'])).count()
    active_complaints = db.query(Complaint).filter(Complaint.reporter_id == current_user.id, Complaint.status != 'Selesai').count()
    
    return {
        'total_permits': total_permits,
        'total_complaints': total_complaints,
        'active_permits': active_permits,
        'active_complaints': active_complaints
    }

@router.get('/admin')
def get_admin_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    total_users = db.query(User).count()
    total_permits = db.query(Permit).count()
    total_complaints = db.query(Complaint).count()
    
    return {
        'total_users': total_users,
        'total_permits': total_permits,
        'total_complaints': total_complaints
    }

@router.get('/officer')
def get_officer_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    pending_permits = db.query(Permit).filter(Permit.status == 'Submitted').count()
    pending_complaints = db.query(Complaint).filter(Complaint.status == 'Baru').count()
    
    return {
        'pending_permits': pending_permits,
        'pending_complaints': pending_complaints
    }
