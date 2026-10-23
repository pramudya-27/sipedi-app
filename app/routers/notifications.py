from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db

router = APIRouter()

class NotificationSchema(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    link_url: Optional[str] = ""
    is_read: int
    created_at: str

    class Config:
        from_attributes = True

# 1. GET /api/v1/notifications
@router.get("", response_model=List[NotificationSchema])
@router.get("/", response_model=List[NotificationSchema])
def get_notifications(db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("SELECT * FROM notifications WHERE is_read = 0 ORDER BY id DESC LIMIT 15")
        )
        rows = result.mappings().all()
        
        notifications = []
        for row in rows:
            data = dict(row)
            notifications.append({
                "id": str(data.get("id", "")),
                "user_id": str(data.get("user_id", "")),
                "title": str(data.get("title", "")),
                "message": str(data.get("message", "")),
                "type": str(data.get("type", "SYSTEM_INFO")),
                "link_url": str(data.get("link_url") or ""),
                "is_read": int(data.get("is_read", 0)),
                "created_at": str(data.get("created_at", ""))
            })
            
        return notifications
    except Exception as e:
        print(f"\n[ERROR NOTIFICATIONS ROUTE]: {str(e)}\n")
        return []

# 2. PUT /api/v1/notifications/mark-all-read
@router.put("/mark-all-read")
def mark_all_as_read(db: Session = Depends(get_db)):
    try:
        db.execute(text("UPDATE notifications SET is_read = 1 WHERE is_read = 0"))
        db.commit()
        return {"message": "Semua notifikasi berhasil ditandai dibaca"}
    except Exception as e:
        db.rollback()
        print(f"\n[ERROR MARK ALL READ]: {str(e)}\n")
        raise HTTPException(status_code=500, detail="Gagal memperbarui status notifikasi")

# 3. PUT /api/v1/notifications/{notification_id}/read
@router.put("/{notification_id}/read")
def mark_single_as_read(notification_id: str, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("UPDATE notifications SET is_read = 1 WHERE id = :id"),
            {"id": notification_id}
        )
        db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan")
            
        return {"message": f"Notifikasi {notification_id} berhasil ditandai dibaca"}
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        db.rollback()
        print(f"\n[ERROR MARK SINGLE READ]: {str(e)}\n")
        raise HTTPException(status_code=500, detail="Gagal memperbarui status notifikasi")