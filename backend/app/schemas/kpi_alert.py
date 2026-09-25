from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    study_id: Optional[UUID] = None
    site_id: Optional[UUID] = None
    category: str  # SAFETY, COMPLIANCE, RECRUITMENT, DATA_QUALITY
    severity: str  # INFO, WARNING, CRITICAL
    title: str
    message: str
    is_acknowledged: bool
    created_at: datetime


class CorrelatedSiteAlert(BaseModel):
    site_id: UUID
    site_code: str
    site_name: str
    study_code: str
    overall_site_risk: str  # CRITICAL, HIGH, MODERATE
    contributing_signals: List[str]
    evidence_narrative: str
    active_alerts_count: int


class StudyKPISummary(BaseModel):
    study_id: UUID
    study_code: str
    status: str

    # Recruitment
    target_enrollment: int
    actual_enrollment: int
    enrollment_pct: float
    screened_count: int
    screen_failure_rate_pct: float

    # Compliance & Protocol
    total_deviations: int
    critical_deviations: int
    deviation_rate: float
    visit_compliance_pct: float

    # Data Quality
    open_queries: int
    critical_queries: int
    overdue_queries: int

    # Safety
    total_ae_count: int
    sae_count: int
    active_sae_deadlines_count: int
    safety_signals_count: int

    # Composite Health Index
    composite_health_score: float  # 0 to 100
