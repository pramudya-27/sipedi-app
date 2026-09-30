import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Permit(Base):
    __tablename__ = 'permits'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    permit_number = Column(String(100), unique=True, index=True, nullable=False)
    type = Column(String(100), nullable=False)
    business_name = Column(String(150), nullable=False)
    applicant_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    status = Column(Enum('Draft', 'Submitted', 'Under Verification', 'Revision Required', 'Approved', 'Rejected', name='permit_status'), default='Draft')
    submission_date = Column(DateTime, default=datetime.utcnow)
    last_update = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applicant = relationship('User', back_populates='permits')
    documents = relationship('PermitDocument', back_populates='permit', cascade='all, delete-orphan')

class PermitDocument(Base):
    __tablename__ = 'permit_documents'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    permit_id = Column(String(36), ForeignKey('permits.id'), nullable=False)
    document_type = Column(String(100), nullable=False)
    file_path = Column(String(255), nullable=False)

    permit = relationship('Permit', back_populates='documents')

