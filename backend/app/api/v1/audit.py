from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.api.deps import get_db, get_current_user, require_roles
from app.models.identity import User
from app.models.compliance import AuditEvent
from app.schemas.compliance_trust import AuditEventResponse, AuditVerificationResult
from app.services.audit_service import AuditService, GENESIS_HASH

router = APIRouter(prefix="/audit", tags=["Compliance & Tamper-Evident Audit"])


@router.get("/events", response_model=List[AuditEventResponse])
def list_audit_events(
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves immutable audit trail with cryptographic SHA-256 hash pointers."""
    query = db.query(AuditEvent)
    if entity_type:
        query = query.filter(AuditEvent.entity_type == entity_type)
    if action:
        query = query.filter(AuditEvent.action == action)
    return query.order_by(AuditEvent.sequence_number.desc()).limit(limit).all()


@router.post("/verify-integrity", response_model=AuditVerificationResult)
def verify_audit_trail_integrity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cryptographic Audit Verifier (Section 53):
    Recalculates the SHA-256 hash chain from Genesis block H_0 to the latest event H_n.
    Returns mathematical verification status or pinpoints tampered records.
    """
    is_valid, count, failure_reason = AuditService.verify_integrity(db=db)
    latest_event = db.query(AuditEvent).order_by(AuditEvent.sequence_number.desc()).first()

    return AuditVerificationResult(
        is_valid=is_valid,
        total_events=count,
        verification_status="VERIFIED" if is_valid else "INTEGRITY_COMPROMISED",
        genesis_hash=GENESIS_HASH,
        latest_hash=latest_event.current_hash if latest_event else None,
        failure_reason=failure_reason,
        verified_at=datetime.now(timezone.utc)
    )
