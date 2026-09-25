import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class AdverseEvent(Base):
    __tablename__ = "adverse_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participants.id"), nullable=False)
    event_term = Column(String(255), nullable=False)
    meddra_pt_code = Column(String(50), nullable=True)  # Preferred Term Code
    meddra_soc = Column(String(255), nullable=True)     # System Organ Class
    onset_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    severity = Column(String(50), nullable=False)       # MILD, MODERATE, SEVERE
    is_serious = Column(Boolean, nullable=False, default=False)
    suspected_drug = Column(String(255), nullable=False)
    causality = Column(String(50), nullable=False, default="UNCLASSIFIED")  # CERTAIN, PROBABLE, POSSIBLE, UNLIKELY, UNCLASSIFIED
    outcome = Column(String(50), nullable=False, default="UNKNOWN")        # RECOVERED, RECOVERING, NOT_RECOVERED, FATAL, UNKNOWN
    reported_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reported_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    study = relationship("Study")
    site = relationship("Site")
    participant = relationship("Participant")
    sae = relationship("SeriousAdverseEvent", back_populates="adverse_event", uselist=False)


class SeriousAdverseEvent(Base):
    __tablename__ = "serious_adverse_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    adverse_event_id = Column(UUID(as_uuid=True), ForeignKey("adverse_events.id"), unique=True, nullable=False)
    criteria_death = Column(Boolean, default=False)
    criteria_life_threatening = Column(Boolean, default=False)
    criteria_hospitalization = Column(Boolean, default=False)
    criteria_disability = Column(Boolean, default=False)
    criteria_congenital = Column(Boolean, default=False)
    initial_report_deadline = Column(DateTime(timezone=True), nullable=False)  # Configured deadline from awareness
    detailed_report_deadline = Column(DateTime(timezone=True), nullable=False) # Configured dossier deadline
    awareness_date = Column(DateTime(timezone=True), nullable=True)            # Clock-start event timestamp
    status = Column(String(50), nullable=False, default="REPORTED")            # DRAFT, REPORTED, UNDER_REVIEW, REPORTABLE, SUBMITTED, FOLLOW_UP_REQUIRED, CLOSED
    causality_assessment = Column(String(100), nullable=True, default="UNCLASSIFIED")
    expectedness = Column(String(50), nullable=True, default="UNEXPECTED")
    pv_reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    pv_review_completed_at = Column(DateTime(timezone=True), nullable=True)
    pv_review_notes = Column(Text, nullable=True)
    follow_up_notes = Column(Text, nullable=True)
    regulatory_submission_date = Column(DateTime(timezone=True), nullable=True)

    adverse_event = relationship("AdverseEvent", back_populates="sae")


class ReportingRule(Base):
    __tablename__ = "reporting_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jurisdiction = Column(String(100), nullable=False, default="CDSCO (India)")
    regulatory_framework = Column(String(150), nullable=False, default="New Drugs and Clinical Trials Rules (NDCT 2019)")
    study_type = Column(String(100), nullable=False, default="INTERVENTIONAL")
    event_type = Column(String(100), nullable=False, default="SERIOUS_ADVERSE_EVENT")
    reporter = Column(String(100), nullable=False, default="PRINCIPAL_INVESTIGATOR")
    clock_start_event = Column(String(150), nullable=False, default="PI Awareness of SAE")
    initial_deadline_hours = Column(Integer, nullable=False, default=24)
    detailed_deadline_days = Column(Integer, nullable=False, default=7)
    recipient = Column(String(255), nullable=False, default="Licensing Authority (DCGI) & Institutional Ethics Committee (IEC)")
    reference_source = Column(String(255), nullable=False, default="Chapter VI, Rule 42, NDCT Rules 2019 / GCP Guidelines")
    is_active = Column(Boolean, default=True)


class SafetySignal(Base):
    __tablename__ = "safety_signals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    event_term = Column(String(255), nullable=False)
    observed_cases = Column(Integer, nullable=False)
    expected_cases = Column(Float, nullable=False)
    disproportionality_score = Column(Float, nullable=False)  # PRR ratio
    priority_score = Column(Float, nullable=False)            # 0 to 100
    status = Column(String(50), nullable=False, default="POTENTIAL_SIGNAL")  # POTENTIAL_SIGNAL, UNDER_REVIEW, EVALUATED, DISMISSED
    evidence_summary = Column(JSONB, nullable=False, default={})

    study = relationship("Study")


class TerminologyCode(Base):
    __tablename__ = "terminology_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    system = Column(String(50), nullable=False)  # MEDDRA, WHODRUG
    code = Column(String(50), nullable=False)
    preferred_term = Column(String(255), nullable=False)
    category = Column(String(255), nullable=True)  # System Organ Class or ATC Code

