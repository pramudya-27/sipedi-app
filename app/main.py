from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.routers import auth, permits, complaints, dashboard, users

app = FastAPI(title="SIPEDI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's local demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(permits.router)
app.include_router(complaints.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SIPEDI API"}
