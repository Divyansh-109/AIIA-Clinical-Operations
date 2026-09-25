from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from app.api.deps import get_db, get_current_user, require_roles
from app.models.identity import User
from app.models.protocol_guardian import ProtocolDeviation
from app.schemas.clinical import DeviationResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/deviations", tags=["Protocol Deviations"])


@router.get("/study/{study_id}", response_model=List[DeviationResponse])
def list_study_deviations(
    study_id: UUID,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists protocol deviations detected for a study with optional severity filtering."""
    query = db.query(ProtocolDeviation).filter(ProtocolDeviation.study_id == study_id)
    if severity:
        query = query.filter(ProtocolDeviation.severity == severity.upper())
    return query.order_by(ProtocolDeviation.detected_at.desc()).all()


@router.put("/{deviation_id}/signoff")
def signoff_deviation(
    deviation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "MONITOR"]))
):
    """Investigator or Monitor signs off on a reviewed protocol deviation."""
    dev = db.query(ProtocolDeviation).filter(ProtocolDeviation.id == deviation_id).first()
    if not dev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deviation not found.")

    dev.status = "RESOLVED"
    dev.resolved_at = datetime.now(timezone.utc)
    dev.reviewed_by = current_user.id
    db.commit()

    AuditService.record(
        db=db,
        action="DEVIATION_SIGNOFF",
        entity_type="ProtocolDeviation",
        entity_id=str(dev.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"status": "RESOLVED"},
        change_reason="Investigator clinical sign-off"
    )

    return {"message": "Protocol deviation signed off and resolved.", "deviation_id": dev.id}
