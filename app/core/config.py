import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@127.0.0.1:3306/sipedi_db')
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'yoursecretkey123')
    ALGORITHM: str = os.getenv('ALGORITHM', 'HS256')
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '1440'))
    UPLOAD_DIR: str = os.getenv('UPLOAD_DIR', 'uploads')

    class Config:
        env_file = '.env'

settings = Settings()
