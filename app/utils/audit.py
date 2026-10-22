from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

def log_activity(
    db: Session,
    action: str,
    module: str,
    user_id: str = None,
    role: str = "CITIZEN",
    reference: str = None,
    status: str = "SUCCESS"
):
    try:
        new_log = AuditLog(
            user_id=user_id,
            role=role,
            action=action,
            module=module,
            reference=reference,
            status=status
        )
        db.add(new_log)
        db.commit()
    except Exception as e:
        print(f"FAILED TO CREATE AUDIT LOG: {str(e)}")
        db.rollback()