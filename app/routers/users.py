from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_admin_user
from app.models.user import User
from app.schemas.user import UserResponse, UserRoleUpdate

router = APIRouter(prefix='/api/users', tags=['Users'])

ALLOWED_ROLES = ['CITIZEN', 'ADMIN', 'OFFICER']

@router.get('', response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.put('/{user_id}/role', response_model=UserResponse)
def update_user_role(
    user_id: str, 
    role_data: UserRoleUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_admin_user)
):
    target_role = role_data.role.upper()
    if target_role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f'Peran tidak valid. Pilih dari: {", ".join(ALLOWED_ROLES)}'
        )
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Pengguna tidak ditemukan')
    
    # Cegah admin tunggal mencabut hak admin dirinya sendiri
    if target_user.id == current_user.id and target_role != 'ADMIN':
        admin_count = db.query(User).filter(User.role == 'ADMIN').count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail='Tidak dapat mengubah peran Anda sendiri karena Anda adalah satu-satunya admin aktif'
            )
            
    target_user.role = target_role
    db.commit()
    db.refresh(target_user)
    return target_user

@router.delete('/{user_id}')
def delete_user(
    user_id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_admin_user)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail='Tidak dapat menghapus akun Anda sendiri'
        )
        
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Pengguna tidak ditemukan')
        
    db.delete(target_user)
    db.commit()
    return {'message': 'Pengguna berhasil dihapus'}
