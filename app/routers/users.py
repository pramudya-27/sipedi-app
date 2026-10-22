import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserRoleUpdate
from app.core.dependencies import get_current_user  

router = APIRouter(tags=['Users'])

ALLOWED_ROLES = ['CITIZEN', 'ADMIN', 'OFFICER']


# --- 1. ENDPOINT PROFIL WARGA (ME) ---

@router.get('/me')
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        display_name = getattr(current_user, 'name', None) or current_user.email.split('@')[0]
        return {
            "id": str(current_user.id),
            "name": display_name,
            "email": current_user.email,
            "role": str(current_user.role).upper() if current_user.role else "CITIZEN",
            "phone": getattr(current_user, 'phone', None) or "",
            "nik": getattr(current_user, 'nik', None) or "",
            "address": getattr(current_user, 'address', None) or "",
            "profile_picture": getattr(current_user, 'profile_picture', None)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil data profil: {str(e)}"
        )


@router.put('/me')
def update_current_user_profile(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Pengguna tidak ditemukan"
            )

        if "name" in data and data["name"]:
            user.name = data["name"]
        if "phone" in data and hasattr(user, 'phone'):
            user.phone = data["phone"]
        if "nik" in data and hasattr(user, 'nik'):
            user.nik = data["nik"]
        if "address" in data and hasattr(user, 'address'):
            user.address = data["address"]

        db.commit()
        db.refresh(user)

        display_name = getattr(user, 'name', None) or user.email.split('@')[0]
        return {
            "id": str(user.id),
            "name": display_name,
            "email": user.email,
            "role": str(user.role).upper() if user.role else "CITIZEN",
            "phone": getattr(user, 'phone', None) or "",
            "nik": getattr(user, 'nik', None) or "",
            "address": getattr(user, 'address', None) or "",
            "profile_picture": getattr(user, 'profile_picture', None)
        }
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memperbarui profil: {str(e)}"
        )


# --- 2. ENDPOINT UPLOAD & HAPUS FOTO PROFIL ---

@router.post('/profile-picture')
def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Buat folder uploads jika belum ada
        upload_dir = "uploads"
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)

        # Buat nama file unik berdasarkan ID User
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        file_name = f"user_{current_user.id}.{file_extension}"
        file_path = os.path.join(upload_dir, file_name)

        # Simpan file ke server
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Simpan URL publik static gambar ke database
        image_url = f"http://localhost:8000/static/{file_name}"
        current_user.profile_picture = image_url
        db.commit()
        db.refresh(current_user)

        return {"profile_picture": image_url}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Gagal mengunggah foto profil: {str(e)}"
        )


@router.delete('/profile-picture')
def delete_profile_picture(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        current_user.profile_picture = None
        db.commit()
        return {"message": "Foto profil berhasil dihapus"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Gagal menghapus foto profil: {str(e)}"
        )


# --- 3. ENDPOINT MANAJEMEN USER (ADMIN) ---

@router.get('')
def get_users(db: Session = Depends(get_db)):
    try:
        users = db.query(User).order_by(User.created_at.desc()).all()
        result = []
        for u in users:
            display_name = getattr(u, 'name', None) or u.email.split('@')[0]
            result.append({
                "id": str(u.id),
                "name": display_name,
                "full_name": display_name,
                "email": u.email,
                "role": str(u.role).upper() if u.role else "CITIZEN",
                "created_at": str(u.created_at) if u.created_at else "2026-10-10"
            })
        return result
    except Exception as e:
        print("ERROR GET USERS:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil data pengguna: {str(e)}"
        )


@router.put('/{user_id}/role')
def update_user_role(
    user_id: str, 
    role_data: UserRoleUpdate, 
    db: Session = Depends(get_db)
):
    try:
        target_role = role_data.role.upper()
        if target_role not in ALLOWED_ROLES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f'Peran tidak valid. Pilih dari: {", ".join(ALLOWED_ROLES)}'
            )
        
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail='Pengguna tidak ditemukan'
            )
            
        target_user.role = target_role
        db.commit()
        db.refresh(target_user)
        return target_user
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memperbarui peran: {str(e)}"
        )


@router.delete('/{user_id}')
def delete_user(user_id: str, db: Session = Depends(get_db)):
    try:
        check_sql = text("SELECT id FROM users WHERE id = :user_id")
        user_exists = db.execute(check_sql, {"user_id": user_id}).fetchone()
        
        if not user_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail='Pengguna tidak ditemukan'
            )
            
        delete_sql = text("DELETE FROM users WHERE id = :user_id")
        db.execute(delete_sql, {"user_id": user_id})
        db.commit()
        
        return {"message": "Pengguna berhasil dihapus", "id": user_id}
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menghapus pengguna: {str(e)}"
        )