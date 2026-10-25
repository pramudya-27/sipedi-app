from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.contact import ContactMessage
from app.schemas.contact import ContactCreate, ContactResponse, ContactStatusUpdate

router = APIRouter(prefix="/api/v1/contact", tags=["Contact & Support"])

# Endpoint untuk publik/warga mengirim pesan (POST ke /api/v1/contact atau /api/v1/contact/)
@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def submit_contact_message(data: ContactCreate, db: Session = Depends(get_db)):
    try:
        new_message = ContactMessage(
            name=data.name,
            email=data.email,
            phone=data.phone,
            category=data.category,
            message=data.message
        )
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        return new_message
    except Exception as e:
        db.rollback()
        print("=== ERROR SUBMIT CONTACT MESSAGE ===", str(e))
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal mengirim pesan bantuan: {str(e)}")

# Endpoint khusus Admin melihat semua daftar pesan dengan Pagination
@router.get("/admin/all", response_model=List[ContactResponse])
def get_all_contact_messages(
    skip: int = 0, 
    limit: int = 15, 
    db: Session = Depends(get_db)
):
    try:
        messages = (
            db.query(ContactMessage)
            .order_by(ContactMessage.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return messages
    except Exception as e:
        print("=== ERROR DETAIL PADA CONTACT GET ===")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint khusus Admin mengubah status pesan (PATCH / PUT ke /api/v1/contact/admin/{message_id}/status)
@router.patch("/admin/{message_id}/status", response_model=ContactResponse)
@router.put("/admin/{message_id}/status", response_model=ContactResponse)
def update_contact_status(message_id: int, data: ContactStatusUpdate, db: Session = Depends(get_db)):
    try:
        message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
        if not message:
            raise HTTPException(status_code=404, detail="Pesan tidak ditemukan")
        
        status_clean = data.status.upper().strip()
        message.status = status_clean
        db.commit()
        db.refresh(message)
        return message
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        print("=== ERROR DETAIL PADA CONTACT UPDATE STATUS ===", str(e))
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal memperbarui status pesan: {str(e)}")

# Endpoint khusus Admin menghapus pesan berdasarkan ID (DELETE ke /api/v1/contact/admin/{message_id})
@router.delete("/admin/{message_id}", status_code=status.HTTP_200_OK)
def delete_contact_message(message_id: int, db: Session = Depends(get_db)):
    try:
        message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
        if not message:
            raise HTTPException(status_code=404, detail="Pesan tidak ditemukan")
        
        db.delete(message)
        db.commit()
        return {"message": "Pesan berhasil dihapus"}
    except Exception as e:
        print("=== ERROR DETAIL PADA CONTACT DELETE ===")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))