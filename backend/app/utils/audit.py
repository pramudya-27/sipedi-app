from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User

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
        valid_user_id = None
        if user_id:
            exists = db.query(User.id).filter(User.id == str(user_id)).first()
            if exists:
                valid_user_id = str(user_id)

        if not valid_user_id:
            first_user = db.query(User.id).first()
            if first_user:
                valid_user_id = str(first_user[0])

        new_log = AuditLog(
            user_id=valid_user_id,
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