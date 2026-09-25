from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, datetime


class AuditEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sequence_number: int
    timestamp: datetime
    user_id: Optional[UUID] = None
    user_role: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    change_reason: Optional[str] = None
    ip_address: Optional[str] = None
    previous_hash: str
    current_hash: str


class AuditVerificationResult(BaseModel):
    is_valid: bool
    total_events: int
    verification_status: str  # VERIFIED, INTEGRITY_COMPROMISED
    genesis_hash: str
    latest_hash: Optional[str] = None
    failure_reason: Optional[str] = None
    verified_at: datetime


class ALCOAPrinciple(BaseModel):
    principle: str
    meaning: str
    system_implementation: str
    compliance_status: str = "COMPLIANT"
    audit_evidence_anchor: str


class EthicsSubmissionCreate(BaseModel):
    study_id: UUID
    committee_name: str
    submission_date: date
    approval_status: str = "APPROVED"
    approval_date: Optional[date] = None
    expiry_date: date
    document_reference: Optional[str] = None


class CTRICreate(BaseModel):
    study_id: UUID
    ctri_number: str
    registration_date: date
    last_updated_date: date
    next_update_due: date
    registration_status: str = "REGISTERED"


class DocumentCreate(BaseModel):
    study_id: UUID
    title: str
    document_type: str
    file_path: str = "/documents/protocols/v2.0_amendment.pdf"
    version: str = "1.0"
    status: str = "DRAFT"


class DocumentStatusUpdate(BaseModel):
    status: str  # DRAFT, UNDER_REVIEW, APPROVED, SUPERSEDED, ARCHIVED


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    study_id: UUID
    title: str
    document_type: str
    file_path: str
    version: str
    status: str
    approved_by: Optional[UUID] = None
    approval_date: Optional[date] = None
    uploaded_by: UUID
    uploaded_at: datetime



class TrustAnomalyEvidence(BaseModel):
    anomaly_id: UUID
    site_id: UUID
    site_code: str
    site_name: str
    anomaly_type: str
    confidence: str
    title: str
    evidence_narrative: str
    telemetry_details: Dict[str, Any] = {}
    recommendation: str


class EvidenceGraphNode(BaseModel):
    id: str
    label: str
    node_type: str  # STUDY, SITE, ANOMALY, PARTICIPANT, RECORD
    details: Dict[str, Any] = {}


class EvidenceGraphLink(BaseModel):
    source: str
    target: str
    relation: str


class EvidenceGraphResponse(BaseModel):
    study_id: UUID
    study_code: str
    nodes: List[EvidenceGraphNode]
    links: List[EvidenceGraphLink]


class RiskFactor(BaseModel):
    factor_name: str
    score_impact: float
    status: str  # ATTENTION_REQUIRED, MODERATE, NORMAL
    description: str
    underlying_records_reference: str


class TrialRiskResponse(BaseModel):
    study_id: UUID
    study_code: str
    overall_risk_score: float  # 0 to 100
    risk_level: str            # LOW, MEDIUM, HIGH, CRITICAL
    verdict: str               # TRIAL REQUIRES ATTENTION / ON TRACK
    contributing_factors: List[RiskFactor]
    assessed_at: datetime


class SimulationRequest(BaseModel):
    study_id: UUID
    additional_sites: int = 0
    recruitment_rate_multiplier: float = 1.0  # 1.0 = current rate, 1.2 = +20%
    dropout_rate_pct: float = 5.0
    protocol_burden_reduction_pct: float = 0.0


class SimulationResponse(BaseModel):
    study_id: UUID
    study_code: str
    baseline_months_to_completion: float
    simulated_months_to_completion: float
    time_saved_months: float
    projected_total_enrollment: int
    projected_completion_date: date
    assumptions_narrative: str
