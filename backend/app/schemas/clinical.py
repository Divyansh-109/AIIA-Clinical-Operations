from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, datetime


class AssessmentEntry(BaseModel):
    assessment_type: str  # VITALS, LAB, QUESTIONNAIRE
    assessment_name: str  # SYSBP, DIABP, PULSE, FASTING_BG, WEIGHT
    numeric_value: Optional[float] = None
    text_value: Optional[str] = None
    unit: Optional[str] = None


class ScreeningRequest(BaseModel):
    participant_code: str  # e.g., 'AIIA-PCOS-001-S01-P0042'
    site_id: UUID
    age: int
    gender: str
    screening_date: date
    eligibility_status: str = "ELIGIBLE"  # ELIGIBLE, INELIGIBLE, PENDING
    screen_failure_reason: Optional[str] = None


class EnrollmentRequest(BaseModel):
    enrollment_date: date
    consent_version_id: Optional[UUID] = None
    consent_purpose: str = "Primary Clinical Trial Protocol Participation"


class RandomizationRequest(BaseModel):
    randomization_date: date
    allocation_group: str  # e.g. 'ARM_A (Ayush-PCOS Active)', 'ARM_B (Placebo)'
    is_blinded: bool = True


class VisitCompleteRequest(BaseModel):
    actual_date: date
    assessments: List[AssessmentEntry] = []
    notes: Optional[str] = None


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    assessment_type: str
    assessment_name: str
    numeric_value: Optional[float] = None
    text_value: Optional[str] = None
    unit: Optional[str] = None
    recorded_at: datetime


class VisitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    participant_id: UUID
    protocol_visit_id: UUID
    visit_name: Optional[str] = None
    visit_number: Optional[int] = None
    scheduled_date: date
    actual_date: Optional[date] = None
    study_day: Optional[int] = None
    status: str
    notes: Optional[str] = None
    assessments: List[AssessmentResponse] = []


class ParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    participant_code: str
    study_id: UUID
    site_id: UUID
    status: str
    age: int
    gender: str
    created_at: datetime


class DeviationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    study_id: UUID
    site_id: UUID
    participant_id: UUID
    visit_id: Optional[UUID] = None
    deviation_type: str
    severity: str
    description: str
    status: str
    detected_at: datetime
    resolved_at: Optional[datetime] = None


class UpcomingDeviationRiskResponse(BaseModel):
    participant_id: UUID
    participant_code: str
    risk_indicator: str  # ELEVATED, MODERATE, LOW
    evidence: str
    recommended_action: str
    historical_delays: List[int] = []


class AmendmentImpactResponse(BaseModel):
    old_version: str
    new_version: str
    affected_participants_count: int
    affected_sites_count: int
    upcoming_visits_affected: int
    potential_deviation_risks: int
    data_fields_changed: int
    reconsent_required: bool
    summary_narrative: str
