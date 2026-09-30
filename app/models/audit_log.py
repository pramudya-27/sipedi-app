import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    module = Column(String(100), nullable=False)
    reference = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False)

