import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, BigInteger, Date, DateTime, ForeignKey, Text, Boolean, Identity
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sequence_number = Column(BigInteger, Identity(start=1), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    user_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False, index=True)  # ENROLL_PARTICIPANT, RECORD_VISIT, etc.
    entity_type = Column(String(100), nullable=False, index=True)
    entity_id = Column(String(100), nullable=False, index=True)
    old_value = Column(JSONB, nullable=True)
    new_value = Column(JSONB, nullable=True)
    change_reason = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    previous_hash = Column(String(64), nullable=False)  # H_(n-1)
    current_hash = Column(String(64), nullable=False)   # H_n = SHA256(Event_n + H_(n-1))


class EthicsSubmission(Base):
    __tablename__ = "ethics_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    committee_name = Column(String(255), nullable=False)
    submission_date = Column(Date, nullable=False)
    approval_status = Column(String(50), nullable=False, default="PENDING")  # PENDING, APPROVED, CONDITIONAL, REJECTED
    approval_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=False)
    document_reference = Column(String(255), nullable=True)

    study = relationship("Study")


class CTRIRecord(Base):
    __tablename__ = "ctri_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), unique=True, nullable=False)
    ctri_number = Column(String(100), nullable=False)  # e.g., 'CTRI/2026/03/084210'
    registration_date = Column(Date, nullable=False)
    last_updated_date = Column(Date, nullable=False)
    next_update_due = Column(Date, nullable=False)
    registration_status = Column(String(50), nullable=False, default="REGISTERED")  # REGISTERED, UPDATE_PENDING, VERIFIED

    study = relationship("Study")


class ConsentVersion(Base):
    __tablename__ = "consent_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    version_number = Column(String(20), nullable=False)  # e.g., 'v1.0', 'v2.0'
    effective_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)

    consents = relationship("Consent", back_populates="version")


class Consent(Base):
    __tablename__ = "consents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participants.id"), nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    version_id = Column(UUID(as_uuid=True), ForeignKey("consent_versions.id"), nullable=False)
    status = Column(String(50), nullable=False, default="CONSENTED")  # CONSENTED, RE_CONSENT_REQUIRED, WITHDRAWN
    signed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    signer_role = Column(String(50), nullable=False, default="PARTICIPANT")  # PARTICIPANT, LAR
    signature_metadata = Column(JSONB, nullable=False, default={})

    version = relationship("ConsentVersion", back_populates="consents")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    title = Column(String(255), nullable=False)
    document_type = Column(String(100), nullable=False)  # PROTOCOL, ETHICS_APPROVAL, CTRI_CERT, IB, SAP, CONSENT_FORM, MONITORING_REPORT
    file_path = Column(String(500), nullable=False)
    version = Column(String(20), nullable=False, default="1.0")
    status = Column(String(50), nullable=False, default="APPROVED")  # DRAFT, UNDER_REVIEW, APPROVED, SUPERSEDED, ARCHIVED
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approval_date = Column(Date, nullable=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

