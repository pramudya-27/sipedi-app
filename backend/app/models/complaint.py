import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Complaint(Base):
    __tablename__ = 'complaints'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_number = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=True)
    category = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    reporter_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    reporter_name = Column(String(150), nullable=True)
    nik = Column(String(30), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)
    admin_note = Column(Text, nullable=True)
    status = Column(Enum('Baru', 'Verifikasi', 'Diteruskan', 'Dalam Penanganan', 'Selesai', name='complaint_status'), default='Baru')
    priority = Column(Enum('Rendah', 'Sedang', 'Tinggi', name='complaint_priority'), default='Rendah')
    date = Column(DateTime, default=datetime.utcnow)

    reporter = relationship('User', back_populates='complaints')
    evidences = relationship('ComplaintEvidence', back_populates='complaint', cascade='all, delete-orphan')

class ComplaintEvidence(Base):
    __tablename__ = 'complaint_evidences'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String(36), ForeignKey('complaints.id'), nullable=False)
    file_path = Column(String(255), nullable=False)

    complaint = relationship('Complaint', back_populates='evidences')

