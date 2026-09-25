from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, datetime


class AECreate(BaseModel):
    study_id: UUID
    site_id: UUID
    participant_id: UUID
    event_term: str
    meddra_pt_code: Optional[str] = None
    meddra_soc: Optional[str] = None
    onset_date: date
    end_date: Optional[date] = None
    severity: str = "MODERATE"  # MILD, MODERATE, SEVERE
    is_serious: bool = False
    suspected_drug: str
    causality: str = "PROBABLE"  # CERTAIN, PROBABLE, POSSIBLE, UNLIKELY, UNCLASSIFIED
    outcome: str = "RECOVERING"  # RECOVERED, RECOVERING, NOT_RECOVERED, FATAL, UNKNOWN
    awareness_date: Optional[datetime] = None

    # SAE criteria if is_serious == True
    criteria_death: bool = False
    criteria_life_threatening: bool = False
    criteria_hospitalization: bool = False
    criteria_disability: bool = False
    criteria_congenital: bool = False


class AEResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    study_id: UUID
    site_id: UUID
    participant_id: UUID
    event_term: str
    meddra_pt_code: Optional[str] = None
    meddra_soc: Optional[str] = None
    onset_date: date
    end_date: Optional[date] = None
    severity: str
    is_serious: bool
    suspected_drug: str
    causality: str
    outcome: str
    reported_at: datetime


class SAEDeadlineResponse(BaseModel):
    sae_id: UUID
    adverse_event_id: Optional[UUID] = None
    event_term: str
    participant_code: str
    severity: Optional[str] = None
    suspected_drug: Optional[str] = None
    reported_at: datetime
    awareness_date: Optional[datetime] = None
    clock_start_event: Optional[str] = "PI Awareness of SAE"
    regulatory_framework: Optional[str] = "New Drugs and Clinical Trials Rules (NDCT 2019)"
    jurisdiction: Optional[str] = "CDSCO (India)"
    recipient: Optional[str] = "Licensing Authority (DCGI) & IEC"
    reference_source: Optional[str] = "Chapter VI, Rule 42, NDCT Rules 2019"
    initial_deadline_24h: datetime
    detailed_deadline_7d: datetime
    initial_hours_remaining: float
    detailed_hours_remaining: float
    urgency_status: str  # NORMAL, URGENT, CRITICAL, OVERDUE, SUBMITTED
    status: str
    causality_assessment: Optional[str] = None
    expectedness: Optional[str] = None
    pv_review_notes: Optional[str] = None
    follow_up_notes: Optional[str] = None
    regulatory_submission_date: Optional[datetime] = None


class SAEReviewRequest(BaseModel):
    status: str = "UNDER_REVIEW"  # UNDER_REVIEW, REPORTABLE, SUBMITTED, FOLLOW_UP_REQUIRED, CLOSED
    pv_review_notes: Optional[str] = None
    causality: Optional[str] = None
    expectedness: Optional[str] = None


class SAESubmitRequest(BaseModel):
    submission_dossier_ref: Optional[str] = None


class ReportingRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    jurisdiction: str
    regulatory_framework: str
    study_type: str
    event_type: str
    reporter: str
    clock_start_event: str
    initial_deadline_hours: int
    detailed_deadline_days: int
    recipient: str
    reference_source: str
    is_active: bool


class SafetySignalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    study_id: UUID
    event_term: str
    observed_cases: int
    expected_cases: float
    disproportionality_score: float
    priority_score: float
    status: str
    evidence_summary: Dict[str, Any] = {}


class TerminologySearchResponse(BaseModel):
    term: str
    code: str
    system: str  # MEDDRA, WHODRUG
    classification: str
