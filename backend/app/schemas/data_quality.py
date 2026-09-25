from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime


class DataQueryCreate(BaseModel):
    study_id: UUID
    site_id: UUID
    participant_id: UUID
    visit_id: Optional[UUID] = None
    field_name: str
    description: str
    severity: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    due_days: int = 5


class QueryRespondRequest(BaseModel):
    resolution_text: str


class QueryResolveRequest(BaseModel):
    status: str  # RESOLVED, REJECTED
    notes: Optional[str] = None


class DataQueryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    study_id: UUID
    site_id: UUID
    participant_id: UUID
    visit_id: Optional[UUID] = None
    field_name: str
    description: str
    severity: str
    status: str
    assigned_to: Optional[UUID] = None
    created_at: datetime
    due_at: datetime
    resolved_at: Optional[datetime] = None
    resolution_text: Optional[str] = None
    is_overdue: bool = False
    age_days: int = 0


class DataQualityMetrics(BaseModel):
    total_queries: int
    open_queries: int
    critical_queries: int
    overdue_queries: int
    resolved_queries: int
    resolution_rate_pct: float
    avg_resolution_hours: float
