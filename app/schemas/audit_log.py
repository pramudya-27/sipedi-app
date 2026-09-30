from pydantic import BaseModel
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    user_id: str
    role: str
    action: str
    module: str
    reference: str
    status: str

    class Config:
        from_attributes = True

