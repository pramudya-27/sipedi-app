from pydantic import BaseModel, Field, computed_field
from typing import List, Optional
from datetime import datetime
from .user import UserResponse

class ComplaintEvidenceResponse(BaseModel):
    id: str
    file_path: str
    file_name: Optional[str] = None
    file_type: Optional[str] = None

    class Config:
        from_attributes = True

class ComplaintBase(BaseModel):
    category: str
    location: str
    description: str

class ComplaintCreate(ComplaintBase):
    nik: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None

class ComplaintUpdateStatus(BaseModel):
    status: str
    priority: Optional[str] = None
    admin_note: Optional[str] = None

class ComplaintResponse(ComplaintBase):
    id: str
    complaint_number: str
    reporter_id: Optional[str] = None
    reporter_name: Optional[str] = None
    nik: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    status: str
    priority: str
    admin_note: Optional[str] = None
    created_at: Optional[datetime] = None
    date: Optional[datetime] = None
    evidences: List[ComplaintEvidenceResponse] = []
    reporter: Optional[UserResponse] = None

    @computed_field
    @property
    def masked_nik(self) -> Optional[str]:
        if self.nik and len(self.nik) >= 4:
            return self.nik[:4] + "*" * (len(self.nik) - 4)
        return "3201************"

    class Config:
        from_attributes = True