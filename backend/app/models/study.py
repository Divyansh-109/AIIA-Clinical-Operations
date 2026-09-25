import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class Study(Base):
    __tablename__ = "studies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_code = Column(String(100), unique=True, nullable=False, index=True)  # e.g., 'AIIA-PCOS-001'
    title = Column(Text, nullable=False)
    short_title = Column(String(255), nullable=False)
    study_type = Column(String(50), nullable=False)  # INTERVENTIONAL, OBSERVATIONAL, MULTI_CENTRE
    intervention = Column(Text, nullable=False)
    therapeutic_area = Column(String(100), nullable=False)
    phase = Column(String(50), nullable=False)  # PHASE_I, PHASE_II, PHASE_III, PHASE_IV, NOT_APPLICABLE
    design = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="DRAFT")  # Configurable state machine
    start_date = Column(Date, nullable=True)
    planned_end_date = Column(Date, nullable=True)
    target_enrollment = Column(Integer, nullable=False, default=100)
    actual_enrollment = Column(Integer, nullable=False, default=0)
    principal_investigator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    protocol = relationship("Protocol", back_populates="study", uselist=False)
    sites = relationship("Site", back_populates="study")
    participants = relationship("Participant", back_populates="study")


class Protocol(Base):
    __tablename__ = "protocols"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), unique=True, nullable=False)
    current_version_id = Column(UUID(as_uuid=True), nullable=True)

    study = relationship("Study", back_populates="protocol")
    versions = relationship("ProtocolVersion", back_populates="protocol")


class ProtocolVersion(Base):
    __tablename__ = "protocol_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    protocol_id = Column(UUID(as_uuid=True), ForeignKey("protocols.id"), nullable=False)
    version_number = Column(String(20), nullable=False)  # e.g., 'v1.0', 'v2.0'
    effective_date = Column(Date, nullable=False)
    approval_status = Column(String(50), nullable=False, default="DRAFT")  # DRAFT, PENDING_ETHICS, APPROVED, SUPERSEDED
    approval_date = Column(Date, nullable=True)
    amendment_reason = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    protocol = relationship("Protocol", back_populates="versions")
    visits = relationship("ProtocolVisit", back_populates="protocol_version")


class ProtocolVisit(Base):
    __tablename__ = "protocol_visits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    protocol_version_id = Column(UUID(as_uuid=True), ForeignKey("protocol_versions.id"), nullable=False)
    visit_name = Column(String(100), nullable=False)  # e.g., 'Screening', 'Baseline', 'Week 4'
    visit_number = Column(Integer, nullable=False)
    target_day = Column(Integer, nullable=False)  # e.g. Day 0, Day 28
    lower_window_days = Column(Integer, nullable=False, default=0)  # e.g. -3
    upper_window_days = Column(Integer, nullable=False, default=0)  # e.g. +3
    is_mandatory = Column(Boolean, default=True)

    protocol_version = relationship("ProtocolVersion", back_populates="visits")
    rules = relationship("ProtocolRule", back_populates="protocol_visit")


class ProtocolRule(Base):
    __tablename__ = "protocol_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    protocol_visit_id = Column(UUID(as_uuid=True), ForeignKey("protocol_visits.id"), nullable=False)
    rule_type = Column(String(50), nullable=False)  # REQUIRED_ASSESSMENT, LAB_TEST, MEDICATION_RULE
    rule_code = Column(String(100), nullable=False)  # e.g. 'SYSBP_REQ'
    parameters = Column(JSONB, nullable=False, default={})  # ranges, units, criteria

    protocol_visit = relationship("ProtocolVisit", back_populates="rules")


class Site(Base):
    __tablename__ = "sites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    site_code = Column(String(50), nullable=False)  # e.g. 'S01'
    site_name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    activation_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=False, default="PENDING")  # PENDING, ACTIVE, SUSPENDED, CLOSED
    target_enrollment = Column(Integer, nullable=False, default=20)
    actual_enrollment = Column(Integer, nullable=False, default=0)

    study = relationship("Study", back_populates="sites")
    participants = relationship("Participant", back_populates="site")
    investigators = relationship("Investigator", back_populates="site")


class Investigator(Base):
    __tablename__ = "investigators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    role_at_site = Column(String(50), nullable=False)  # PRINCIPAL_INVESTIGATOR, CO_INVESTIGATOR, COORDINATOR

    site = relationship("Site", back_populates="investigators")
