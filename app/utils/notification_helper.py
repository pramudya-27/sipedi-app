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
        query = text("""
            INSERT INTO notifications (user_id, title, message, type, link_url, is_read, created_at)
            VALUES (:user_id, :title, :message, :type, :link_url, 0, NOW())
        """)
        
        db.execute(query, {
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