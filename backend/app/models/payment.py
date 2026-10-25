import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base

class PermitRenewal(Base):
    __tablename__ = 'permit_renewals'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    permit_id = Column(String(36), ForeignKey('permits.id'), nullable=False)
    renewal_number = Column(String(100), unique=True, index=True, nullable=False)
    duration_months = Column(Integer, default=1, nullable=False)
    previous_expired_at = Column(DateTime, nullable=True)
    new_expired_at = Column(DateTime, nullable=True)
    status = Column(String(50), default='PENDING_PAYMENT') # PENDING_PAYMENT, PAID, CANCELLED, EXPIRED
    processed_by = Column(String(36), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    permit = relationship('Permit', back_populates='renewals')
    invoices = relationship('Invoice', back_populates='renewal', cascade='all, delete-orphan')

class Invoice(Base):
    __tablename__ = 'invoices'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_number = Column(String(100), unique=True, index=True, nullable=False)
    renewal_id = Column(String(36), ForeignKey('permit_renewals.id'), nullable=True)
    permit_id = Column(String(36), ForeignKey('permits.id'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    subtotal = Column(Numeric(12, 2), default=Decimal('0.00'))
    total_amount = Column(Numeric(12, 2), default=Decimal('0.00'))
    status = Column(String(50), default='UNPAID') # UNPAID, PAID, EXPIRED, CANCELLED
    due_date = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    qris_url = Column(Text, nullable=True)
    snap_token = Column(String(255), nullable=True)
    snap_redirect_url = Column(String(255), nullable=True)
    payment_method = Column(String(50), nullable=True)
    pdf_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    renewal = relationship('PermitRenewal', back_populates='invoices')
    permit = relationship('Permit', back_populates='invoices')
    user = relationship('User')
    items = relationship('InvoiceItem', back_populates='invoice', cascade='all, delete-orphan')
    payments = relationship('Payment', back_populates='invoice', cascade='all, delete-orphan')

class InvoiceItem(Base):
    __tablename__ = 'invoice_items'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id = Column(String(36), ForeignKey('invoices.id'), nullable=False)
    item_name = Column(String(150), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(12, 2), default=Decimal('0.00'))
    subtotal = Column(Numeric(12, 2), default=Decimal('0.00'))
    created_at = Column(DateTime, default=datetime.utcnow)

    invoice = relationship('Invoice', back_populates='items')

class Payment(Base):
    __tablename__ = 'payments'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(100), unique=True, index=True, nullable=False)
    invoice_id = Column(String(36), ForeignKey('invoices.id'), nullable=False)
    transaction_id = Column(String(100), nullable=True)
    payment_type = Column(String(50), default='qris')
    gross_amount = Column(Numeric(12, 2), nullable=False)
    transaction_status = Column(String(50), default='pending') # pending, settlement, expire, deny, cancel
    fraud_status = Column(String(50), nullable=True)
    transaction_time = Column(DateTime, nullable=True)
    settlement_time = Column(DateTime, nullable=True)
    signature_key = Column(String(255), nullable=True)
    raw_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    invoice = relationship('Invoice', back_populates='payments')

class EmailLog(Base):
    __tablename__ = 'email_logs'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email_type = Column(String(50), nullable=False) # SUBMISSION_RECEIVED, PERMIT_APPROVED, RENEWAL_INVOICE, PAYMENT_SUCCESS_RENEWED
    recipient_email = Column(String(120), nullable=False)
    recipient_name = Column(String(150), nullable=True)
    subject = Column(String(255), nullable=False)
    reference_id = Column(String(100), nullable=True)
    status = Column(String(50), default='SENT') # SENT, FAILED
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
