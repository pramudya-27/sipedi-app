from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token
)
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.user import User
from app.schemas.user import (
    UserCreate, 
    UserLogin, 
    UserResponse, 
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.services.email_service import send_password_reset_email

router = APIRouter(tags=['Auth'])

@router.post('/login', response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail='Email tidak terdaftar di sistem.'
        )
    
    # 2. Cek kebenaran password
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail='Kata sandi yang Anda masukkan salah.'
        )
    
    access_token = create_access_token(data={'sub': user.email, 'role': user.role})
    return {'access_token': access_token, 'token_type': 'bearer', 'user': user}

@router.post('/register', response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user_exists = db.query(User).filter(User.email == user_data.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail='Email sudah terdaftar. Silakan masuk atau gunakan email lain.')
    
    pwd = user_data.password
    if len(pwd) < 6:
        raise HTTPException(status_code=400, detail='Kata sandi minimal harus terdiri dari 6 karakter.')
    if not any(c.isupper() for c in pwd):
        raise HTTPException(status_code=400, detail='Kata sandi harus mengandung setidaknya 1 huruf kapital / besar (A-Z).')
    if not any(c.islower() for c in pwd):
        raise HTTPException(status_code=400, detail='Kata sandi harus mengandung setidaknya 1 huruf kecil (a-z).')
    if not any(c.isdigit() for c in pwd):
        raise HTTPException(status_code=400, detail='Kata sandi harus mengandung setidaknya 1 angka (0-9).')

    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, name=user_data.name, hashed_password=hashed_pwd, role=user_data.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={'sub': new_user.email, 'role': new_user.role})
    return {'access_token': access_token, 'token_type': 'bearer', 'user': new_user}

@router.get('/me', response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# === TAMBAHAN AMAN: Endpoint update profil warga (PUT /api/v1/auth/me atau PUT /users/me) ===
@router.put('/me', response_model=UserResponse)
def update_me(
    data: dict, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan.")

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
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memperbarui profil: {str(e)}"
        )

@router.post('/forgot-password')
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if user:
        reset_token = create_password_reset_token(user.email)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        send_password_reset_email(user.email, user.name, reset_url)
    
    return {
        "message": "Jika email terdaftar di sistem kami, tautan konfirmasi ganti password telah dikirim. Silakan periksa kotak masuk atau spam email Anda."
    }

@router.post('/reset-password')
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = verify_password_reset_token(req.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Tautan reset password tidak valid atau telah kedaluwarsa. Silakan ajukan permohonan baru."
        )
    
    pwd = req.new_password
    if len(pwd) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi baru minimal harus terdiri dari 6 karakter."
        )
    if not any(c.isupper() for c in pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi baru harus mengandung setidaknya 1 huruf kapital / besar (A-Z)."
        )
    if not any(c.islower() for c in pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi baru harus mengandung setidaknya 1 huruf kecil (a-z)."
        )
    if not any(c.isdigit() for c in pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi baru harus mengandung setidaknya 1 angka (0-9)."
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Akun pengguna tidak ditemukan."
        )
    
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()

    return {
        "message": "Kata sandi Anda berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda."
    }