import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class KPI(Base):
    __tablename__ = "kpis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=True)  # Null if portfolio-wide
    metric_name = Column(String(100), nullable=False)  # ENROLLMENT_PCT, RETENTION_RATE, DEVIATION_RATE, etc.
    metric_value = Column(Float, nullable=False)
    target_value = Column(Float, nullable=True)
    calculated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=True)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True)
    category = Column(String(50), nullable=False)  # SAFETY, COMPLIANCE, RECRUITMENT, DATA_QUALITY
    severity = Column(String(20), nullable=False)  # INFO, WARNING, CRITICAL
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class TrialIntegrityEvidence(Base):
    __tablename__ = "trial_integrity_evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    anomaly_type = Column(String(100), nullable=False)  # IDENTICAL_VITALS, TIMESTAMP_BURST, AE_UNDERREPORTING
    confidence = Column(String(20), nullable=False)     # HIGH, MEDIUM, REQUIRES_REVIEW
    evidence_data = Column(JSONB, nullable=False, default={})
    status = Column(String(50), nullable=False, default="FLAGGED")  # FLAGGED, UNDER_REVIEW, JUSTIFIED, ESCALATED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    study = relationship("Study")
    site = relationship("Site")


class TrialRiskAssessment(Base):
    __tablename__ = "trial_risk_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    overall_risk_score = Column(Float, nullable=False)  # 0 to 100
    risk_level = Column(String(20), nullable=False)     # LOW, MEDIUM, HIGH, CRITICAL
    contributing_factors = Column(JSONB, nullable=False, default={})
    assessed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    study = relationship("Study")


class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    scenario_name = Column(String(255), nullable=False)
    parameters = Column(JSONB, nullable=False, default={})
    results = Column(JSONB, nullable=False, default={})
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
