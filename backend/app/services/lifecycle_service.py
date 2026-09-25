from typing import Tuple, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.study import Study
from app.services.audit_service import AuditService
from app.core.event_bus import event_bus, Event

# Permitted sequential state machine transitions
ALLOWED_TRANSITIONS = {
    "DRAFT": ["PROTOCOL_FINALIZED"],
    "PROTOCOL_FINALIZED": ["ETHICS_PENDING"],
    "ETHICS_PENDING": ["ETHICS_APPROVED"],
    "ETHICS_APPROVED": ["CTRI_REGISTERED"],
    "CTRI_REGISTERED": ["SITE_ACTIVATION"],
    "SITE_ACTIVATION": ["RECRUITING"],
    "RECRUITING": ["ACTIVE"],
    "ACTIVE": ["FOLLOW_UP"],
    "FOLLOW_UP": ["CLOSE_OUT"],
    "CLOSE_OUT": ["COMPLETED"],
    "COMPLETED": []
}


class LifecycleService:
    @staticmethod
    def transition(
        db: Session,
        study: Study,
        new_status: str,
        reason: str,
        user_id: str,
        user_role: str
    ) -> Study:
        """Enforces state machine transitions and records audit + event bus triggers."""
        current_status = study.status
        allowed_next = ALLOWED_TRANSITIONS.get(current_status, [])

        if new_status not in allowed_next:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Illegal lifecycle transition from '{current_status}' to '{new_status}'. Allowed transitions: {allowed_next}"
            )

        study.status = new_status
        db.commit()
        db.refresh(study)

        # Record tamper-evident audit entry
        AuditService.record(
            db=db,
            action="STUDY_LIFECYCLE_TRANSITION",
            entity_type="Study",
            entity_id=str(study.id),
            user_id=str(user_id),
            user_role=user_role,
            old_value={"status": current_status},
            new_value={"status": new_status},
            change_reason=reason
        )

        # Dispatch domain event
        event_bus.publish(
            Event(
                event_type="StudyLifecycleChanged",
                payload={
                    "study_id": str(study.id),
                    "previous_status": current_status,
                    "new_status": new_status,
                    "reason": reason
                },
                user_id=str(user_id),
                user_role=user_role
            )
        )

        return study
