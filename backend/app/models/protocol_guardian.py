import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProtocolDeviation(Base):
    __tablename__ = "protocol_deviations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participants.id"), nullable=False)
    visit_id = Column(UUID(as_uuid=True), ForeignKey("visits.id"), nullable=True)
    deviation_type = Column(String(100), nullable=False)  # OUT_OF_WINDOW_VISIT, MISSING_ASSESSMENT, INELIGIBLE_ENROLLMENT
    severity = Column(String(50), nullable=False)  # MINOR, MAJOR, CRITICAL
    description = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="OPEN")  # OPEN, UNDER_REVIEW, RESOLVED, REPORTED_TO_IRB
    detected_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    study = relationship("Study")
    site = relationship("Site")
    participant = relationship("Participant")
    visit = relationship("Visit")


class DataQuery(Base):
    __tablename__ = "data_queries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participants.id"), nullable=False)
    visit_id = Column(UUID(as_uuid=True), ForeignKey("visits.id"), nullable=True)
    field_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), nullable=False, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(50), nullable=False, default="OPEN")  # OPEN, ASSIGNED, RESPONDED, RESOLVED, REJECTED
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    due_at = Column(DateTime(timezone=True), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolution_text = Column(Text, nullable=True)

    study = relationship("Study")
    site = relationship("Site")
    participant = relationship("Participant")
