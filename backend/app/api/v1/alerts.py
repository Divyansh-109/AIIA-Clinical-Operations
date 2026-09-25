from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.api.deps import get_db, get_current_user
from app.models.identity import User
from app.models.intelligence import Alert
from app.schemas.kpi_alert import AlertResponse, CorrelatedSiteAlert
from app.services.alert_engine import AlertEngine

router = APIRouter(prefix="/alerts", tags=["Central Alert & Correlation Engine"])


@router.get("", response_model=List[AlertResponse])
def list_alerts(
    study_id: Optional[UUID] = None,
    severity: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists system alerts sorted by severity and recency."""
    query = db.query(Alert)
    if study_id:
        query = query.filter(Alert.study_id == study_id)
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    if category:
        query = query.filter(Alert.category == category.upper())
    return query.order_by(Alert.created_at.desc()).limit(50).all()


@router.get("/correlated/{study_id}", response_model=List[CorrelatedSiteAlert])
def get_correlated_site_risks(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Alert Correlation Engine:
    Combines isolated site signals (recruitment, deviations, queries, AE patterns)
    into a synthesized 'Site Performance Risk' evaluation with transparent evidence.
    """
    return AlertEngine.evaluate_correlated_site_risks(db=db, study_id=study_id)
