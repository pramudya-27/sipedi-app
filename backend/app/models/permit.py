import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Permit(Base):
    __tablename__ = 'permits'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    permit_number = Column(String(100), unique=True, index=True, nullable=False)
    type = Column(String(100), nullable=False)
    business_name = Column(String(150), nullable=False)
    business_address = Column(Text, nullable=True)
    applicant_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    
    # Snapshot data pemohon
    applicant_name = Column(String(150), nullable=True)
    nik = Column(String(20), nullable=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(120), nullable=True)
    business_sector = Column(String(100), nullable=True)

    # Durasi & Masa Berlaku
    duration_months = Column(Integer, default=1, nullable=False)
    start_date = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    expired_at = Column(DateTime, nullable=True)

    # Status: Submitted, Under Verification, Approved, ACTIVE, Rejected, EXPIRED, EXTENDED
    status = Column(String(50), default='Submitted')
    rejection_reason = Column(Text, nullable=True)
    issued_by = Column(String(36), nullable=True)
    
    # Berkas Dokumen Resmi PDF & QR
    pdf_path = Column(String(255), nullable=True)
    qr_code_path = Column(String(255), nullable=True)
    active_version = Column(Integer, default=1)

    submission_date = Column(DateTime, default=datetime.utcnow)
    last_update = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relasi
    applicant = relationship('User', back_populates='permits')
    documents = relationship('PermitDocument', back_populates='permit', cascade='all, delete-orphan')
    renewals = relationship('PermitRenewal', back_populates='permit', cascade='all, delete-orphan')
    invoices = relationship('Invoice', back_populates='permit', cascade='all, delete-orphan')

class PermitDocument(Base):
    __tablename__ = 'permit_documents'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    permit_id = Column(String(36), ForeignKey('permits.id'), nullable=False)
    file_name = Column(String(255), nullable=True)
    document_type = Column(String(100), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    status = Column(String(50), default='PENDING')
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    permit = relationship('Permit', back_populates='documents')
