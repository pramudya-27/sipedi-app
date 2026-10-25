from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from app.core.database import Base

class ContactMessage(Base):
    __tablename__ = 'contact_messages'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default='PENDING')
    created_at = Column(DateTime, default=datetime.utcnow)