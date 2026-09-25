from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.identity import User
from app.schemas.compliance_trust import SimulationRequest, SimulationResponse
from app.services.simulator_service import SimulatorService

router = APIRouter(prefix="/simulation", tags=["What-If Trial Simulator"])


@router.post("/run", response_model=SimulationResponse)
def run_trial_simulation(
    req: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    What-If Trial Simulator (Section 37):
    Simulates trial completion trajectories when adding sites, modifying recruitment rates,
    or adjusting protocol burden.
    """
    res = SimulatorService.simulate_trial_scenario(
        db=db,
        study_id=req.study_id,
        additional_sites=req.additional_sites,
        recruitment_rate_multiplier=req.recruitment_rate_multiplier,
        dropout_rate_pct=req.dropout_rate_pct,
        protocol_burden_reduction_pct=req.protocol_burden_reduction_pct
    )
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found for simulation.")
    return res
