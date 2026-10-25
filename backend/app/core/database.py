import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

connect_args = {}
# Deteksi otomatis koneksi cloud (Aiven) yang mewajibkan SSL
db_url = settings.DATABASE_URL or ""
if "aivencloud.com" in db_url or "ssl" in db_url.lower():
    ca_cert_content = os.getenv("AIVEN_CA_CERT")
    ca_path = os.getenv("AIVEN_CA_PATH", "ca.pem")

    # Jika isi sertifikat dioper via environment variable / Secret HF
    if ca_cert_content and not os.path.exists(ca_path):
        try:
            with open(ca_path, "w") as f:
                f.write(ca_cert_content.strip())
        except Exception as e:
            print("Warning writing AIVEN_CA_CERT:", e)

    if os.path.exists(ca_path):
        connect_args["ssl"] = {
            "check_hostname": False,
            "ca": ca_path
        }

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
