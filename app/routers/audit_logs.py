from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])

@router.get("")
def get_audit_logs(db: Session = Depends(get_db)):
    try:
        
        query = text("""
            SELECT 
                a.id,
                a.action,
                a.module,
                a.reference,
                a.status,
                a.timestamp,
                a.role,
                u.name AS user_name,
                u.email AS user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.timestamp DESC
        """)
        
        rows = db.execute(query).fetchall()
        result = []
        for r in rows:
            name = r.user_name or (r.user_email.split('@')[0] if r.user_email else "Pengguna Tidak Dikenal")
            
            result.append({
                "id": str(r.id),
                "user_name": name,
                "role": str(r.role).upper() if r.role else "CITIZEN",
                "action": r.action,
                "module": r.module,
                "reference": r.reference or "-",
                "status": str(r.status).upper() if r.status else "SUCCESS",
                "created_at": str(r.timestamp) if r.timestamp else ""
            })
        return result
    except Exception as e:
        print("ERROR GET AUDIT LOGS:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil data audit logs: {str(e)}"
        )