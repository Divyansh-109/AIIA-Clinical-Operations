from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, datetime


class ProtocolRuleSchema(BaseModel):
    rule_type: str  # REQUIRED_ASSESSMENT, LAB_TEST, MEDICATION_RULE
    rule_code: str  # e.g., 'SYSBP_REQ', 'FASTING_GLUCOSE_REQ'
    parameters: Dict[str, Any] = {}


class ProtocolVisitSchema(BaseModel):
    visit_name: str
    visit_number: int
    target_day: int
    lower_window_days: int = 0
    upper_window_days: int = 0
    is_mandatory: bool = True
    rules: List[ProtocolRuleSchema] = []


class ProtocolVersionCreate(BaseModel):
    version_number: str  # e.g. 'v1.0'
    effective_date: date
    amendment_reason: Optional[str] = None
    visits: List[ProtocolVisitSchema] = []


class ProtocolVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    protocol_id: UUID
    version_number: str
    effective_date: date
    approval_status: str
    approval_date: Optional[date] = None
    amendment_reason: Optional[str] = None
    created_at: datetime


class SiteCreate(BaseModel):
    site_code: str
    site_name: str
    location: str
    target_enrollment: int = 20


class SiteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    study_id: UUID
    site_code: str
    site_name: str
    location: str
    status: str
    activation_date: Optional[date] = None
    target_enrollment: int
    actual_enrollment: int


class StudyCreate(BaseModel):
    study_code: str
    title: str
    short_title: str
    study_type: str = "INTERVENTIONAL"
    intervention: str
    therapeutic_area: str
    phase: str = "PHASE_II"
    design: str = "Randomized, Double-Blind, Parallel-Group, Placebo-Controlled"
    start_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    target_enrollment: int = 100


class StudyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    study_code: str
    title: str
    short_title: str
    study_type: str
    intervention: str
    therapeutic_area: str
    phase: str
    design: str
    status: str
    start_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    target_enrollment: int
    actual_enrollment: int
    created_at: datetime


class LifecycleTransitionRequest(BaseModel):
    new_status: str
    reason: str
