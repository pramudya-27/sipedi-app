import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Enum
from app.core.database import Base

class ContactMessage(Base):
    __tablename__ = 'contact_messages'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(Enum('PENDING', 'RESPONDED', 'CLOSED', name='contact_status'), default='PENDING')
    created_at = Column(DateTime, default=datetime.utcnow)