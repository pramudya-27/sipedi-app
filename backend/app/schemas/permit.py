from pydantic import Field
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .user import UserResponse

class PermitDocumentResponse(BaseModel):
    id: str
    document_type: str
    file_path: str

    class Config:
        from_attributes = True

class PermitBase(BaseModel):
    type: str
    businessName: str = Field(alias='business_name')

class PermitCreate(PermitBase):
    pass

class PermitUpdateStatus(BaseModel):
    status: str
    duration_months: Optional[int] = None
    start_date: Optional[str] = None
    rejection_reason: Optional[str] = None
    admin_note: Optional[str] = None

class PermitResponse(PermitBase):
    id: str
    permitNumber: str = Field(alias='permit_number')
    applicantId: str = Field(alias='applicant_id')
    status: str
    submissionDate: datetime = Field(alias='submission_date')
    lastUpdate: datetime = Field(alias='last_update')
    documents: List[PermitDocumentResponse] = []
    applicant: Optional[UserResponse] = None

    class Config:
        from_attributes = True


