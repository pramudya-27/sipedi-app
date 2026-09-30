from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .user import UserResponse

class ComplaintEvidenceResponse(BaseModel):
    id: str
    file_path: str

    class Config:
        from_attributes = True

class ComplaintBase(BaseModel):
    category: str
    location: str
    description: str

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdateStatus(BaseModel):
    status: str
    priority: Optional[str] = None

class ComplaintResponse(ComplaintBase):
    id: str
    complaint_number: str
    reporter_id: str
    status: str
    priority: str
    date: datetime
    evidences: List[ComplaintEvidenceResponse] = []
    reporter: Optional[UserResponse] = None

    class Config:
        from_attributes = True

