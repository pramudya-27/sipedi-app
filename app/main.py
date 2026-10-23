import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine

# Impor router termasuk 'contact' dan 'track'
from app.routers import (
    auth,
    permits,
    complaints,
    dashboard,
    users,
    audit_logs,
    notifications,
    track,
    contact
)

# 0. Buat tabel database secara otomatis jika belum ada di DB
Base.metadata.create_all(bind=engine)

# 1. Inisialisasi Aplikasi FastAPI
app = FastAPI(title="SIPEDI API")

# 2. Konfigurasi CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Folder Upload Statis (Di-mount ke /uploads dan /static agar mendukung foto profil)
os.makedirs("uploads", exist_ok=True)
if hasattr(settings, 'UPLOAD_DIR') and settings.UPLOAD_DIR:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount folder uploads ke jalur /static untuk foto profil
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# 4. Pendaftaran Router Terpusat
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(permits.router, prefix="/api/permits", tags=["Permits"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["Complaints"])

# Pendaftaran Dashboard Router
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])

# Pendaftaran Track Router
app.include_router(track.router)

# Pendaftaran Contact Router 
app.include_router(contact.router)

app.include_router(audit_logs.router)
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])

@app.get("/")
def read_root():
    return {"message": "Welcome to SIPEDI API"}