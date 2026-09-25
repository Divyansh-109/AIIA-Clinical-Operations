from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import get_db, get_current_user
from app.models.identity import User
from app.schemas.kpi_alert import StudyKPISummary
from app.services.kpi_service import KPIService

router = APIRouter(prefix="/kpis", tags=["Central KPI Engine"])


@router.get("/portfolio")
def get_portfolio_kpis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Aggregate portfolio recruitment, safety, quality, and compliance metrics for Leadership."""
    return KPIService.get_portfolio_kpis(db=db)


@router.get("/study/{study_id}", response_model=StudyKPISummary)
def get_study_kpis(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Detailed centrally-calculated KPIs for an individual clinical study."""
    kpi_dict = KPIService.calculate_study_kpis(db=db, study_id=study_id)
    if not kpi_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found.")
    return kpi_dict


@router.get("/study/{study_id}/control-center")
def get_study_control_center(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Unified Study Control Center:
    Aggregates multi-dimensional operational health, safety, compliance,
    data integrity, prioritized Action Center items, and recent study activity.
    """
    center = KPIService.get_study_control_center(db=db, study_id=study_id)
    if not center:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found.")
    return center

