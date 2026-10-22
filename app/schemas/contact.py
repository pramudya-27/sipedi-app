from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    category: str
    message: str

class ContactResponse(ContactCreate):
    id: int  
    status: str
    created_at: datetime

    class Config:
        from_attributes = True