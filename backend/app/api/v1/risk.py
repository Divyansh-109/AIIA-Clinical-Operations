from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import get_db, get_current_user
from app.models.identity import User
from app.schemas.compliance_trust import TrialRiskResponse
from app.services.trial_risk_service import TrialRiskService

router = APIRouter(prefix="/risk", tags=["Explainable Trial Risk Engine"])


@router.get("/study/{study_id}", response_model=TrialRiskResponse)
def get_study_risk_profile(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Explainable Trial Risk Engine (Section 35 & 36):
    Evaluates multi-factor operational risk (recruitment lag, protocol deviations,
    data queries, safety pressure) with direct references to underlying records.
    """
    risk_data = TrialRiskService.evaluate_study_risk(db=db, study_id=study_id)
    if not risk_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found.")
    return risk_data
