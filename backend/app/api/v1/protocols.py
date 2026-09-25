from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.models.identity import User
from app.schemas.clinical import AmendmentImpactResponse
from app.services.protocol_guardian_service import ProtocolGuardianService

router = APIRouter(prefix="/protocols", tags=["Protocol Guardian & Amendments"])


class ImpactAnalysisRequest(BaseModel):
    study_id: UUID
    old_version: str = "v1.0"
    new_version: str = "v2.0"


@router.post("/impact-analysis", response_model=AmendmentImpactResponse)
def analyze_protocol_amendment_impact(
    req: ImpactAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Protocol Amendment Impact Analyzer:
    Predicts operational, participant, visit, and compliance burden when transitioning to a new protocol version.
    """
    return ProtocolGuardianService.analyze_amendment_impact(
        db=db,
        study_id=req.study_id,
        old_version_number=req.old_version,
        new_version_number=req.new_version
    )
