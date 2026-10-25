from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RenewalRequest(BaseModel):
    duration_months: int = 1
    notes: Optional[str] = None

class MidtransWebhook(BaseModel):
    order_id: str
    status_code: Optional[str] = "200"
    gross_amount: Optional[str] = "100000.00"
    signature_key: Optional[str] = None
    transaction_status: str
    payment_type: Optional[str] = "qris"
    transaction_id: Optional[str] = None
    transaction_time: Optional[str] = None
    settlement_time: Optional[str] = None
    fraud_status: Optional[str] = None

class SimulatePaymentRequest(BaseModel):
    order_id: str
    status: str = "settlement" # settlement, cancel, expire
    payment_type: Optional[str] = "QRIS"
