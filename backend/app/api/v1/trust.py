from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.api.deps import get_db, get_current_user
from app.models.identity import User
from app.schemas.compliance_trust import TrustAnomalyEvidence, EvidenceGraphResponse
from app.services.trial_trust_service import TrialTrustService

router = APIRouter(prefix="/trial-trust", tags=["Trial Trust & Data Integrity Engine"])


@router.get("/study/{study_id}", response_model=List[TrustAnomalyEvidence])
def inspect_study_integrity(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Trial Trust Engine (Section 29 & 30):
    Inspects measurement distributions (identical readings), timestamp bursts,
    and site AE reporting disparity to detect potential integrity concerns for human review.
    """
    return TrialTrustService.inspect_trial_integrity(db=db, study_id=study_id)


@router.get("/evidence-graph/{study_id}", response_model=EvidenceGraphResponse)
def get_integrity_evidence_graph(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Trial Integrity Graph (Section 31):
    Returns interactive graph nodes and links connecting Study -> Site -> Specific Anomaly.
    """
    return TrialTrustService.generate_evidence_graph(db=db, study_id=study_id)
