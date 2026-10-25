import uuid
from sqlalchemy.orm import Session
from sqlalchemy import text

def create_notification(
    db: Session,
    user_id: str,
    title: str,
    message: str,
    type: str = "SYSTEM_INFO",
    link_url: str = ""
):
    """
    Helper function untuk membuat record notifikasi baru secara otomatis ke MySQL database.
    """
    try:
        notif_id = str(uuid.uuid4())
        query = text("""
            INSERT INTO notifications (id, user_id, title, message, type, link_url, is_read, created_at)
            VALUES (:id, :user_id, :title, :message, :type, :link_url, 0, NOW())
        """)
        
        db.execute(query, {
            "id": notif_id,
            "user_id": str(user_id),
            "title": title,
            "message": message,
            "type": type,
            "link_url": link_url
        })
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"[NOTIFICATION ERROR]: Gagal membuat notifikasi otomatis: {str(e)}")
        return False