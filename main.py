from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SIPEDI API",
    description="Sistem Perizinan Digital Mikro dan Layanan Pengaduan Ketertiban Berbasis Asisten AI",
    version="1.0.0",
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "service": "SIPEDI Backend Service",
        "status": "online",
        "version": "1.0.0",
        "description": "Sistem Perizinan Digital Mikro dan Layanan Pengaduan Ketertiban Berbasis Asisten AI"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
