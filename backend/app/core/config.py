import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Muat file .env secara otomatis dari lokasi backend/.env atau root .env
_backend_env = Path(__file__).resolve().parent.parent.parent / '.env'
_root_env = Path(__file__).resolve().parent.parent.parent.parent / '.env'
if _backend_env.exists():
    load_dotenv(dotenv_path=_backend_env)
if _root_env.exists():
    load_dotenv(dotenv_path=_root_env)

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@127.0.0.1:3306/sipedi_db')
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'yoursecretkey123')
    ALGORITHM: str = os.getenv('ALGORITHM', 'HS256')
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '1440'))
    UPLOAD_DIR: str = os.getenv('UPLOAD_DIR', 'uploads')

    # Brevo Email Configuration
    BREVO_API_KEY: str = os.getenv('BREVO_API_KEY', '')
    BREVO_SENDER_EMAIL: str = os.getenv('BREVO_SENDER_EMAIL', 'sitorusjames53@gmail.com')
    BREVO_SENDER_NAME: str = os.getenv('BREVO_SENDER_NAME', 'SIPEDI - Layanan Publik')
    FRONTEND_URL: str = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    RESET_TOKEN_EXPIRE_MINUTES: int = int(os.getenv('RESET_TOKEN_EXPIRE_MINUTES', '30'))

    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: str = os.getenv('CLOUDINARY_CLOUD_NAME', 'dkrxyn8i5')
    CLOUDINARY_API_KEY: str = os.getenv('CLOUDINARY_API_KEY', '249684727415718')
    CLOUDINARY_API_SECRET: str = os.getenv('CLOUDINARY_API_SECRET', 'SkiIZyFRtW0rhKX8HYHE34pm-aY')

    # Midtrans Payment Gateway Configuration
    MIDTRANS_SERVER_KEY: str = os.getenv('MIDTRANS_SERVER_KEY', 'SB-Mid-server-test-sipedi-sandbox')
    MIDTRANS_CLIENT_KEY: str = os.getenv('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-test-sipedi-sandbox')
    MIDTRANS_MERCHANT_ID: str = os.getenv('MIDTRANS_MERCHANT_ID', 'M00123456')
    MIDTRANS_IS_PRODUCTION: bool = os.getenv('MIDTRANS_IS_PRODUCTION', 'false').lower() == 'true'

    class Config:
        env_file = '.env'

settings = Settings()
