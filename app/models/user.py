import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(150), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum('CITIZEN', 'ADMIN', name='user_roles'), default='CITIZEN', nullable=False)
    profile_picture = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    permits = relationship('Permit', back_populates='applicant')
    complaints = relationship('Complaint', back_populates='reporter')
    notifications = relationship('Notification', back_populates='user')

