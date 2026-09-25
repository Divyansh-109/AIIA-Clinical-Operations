import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_code = Column(String(100), unique=True, nullable=False, index=True)  # e.g., 'AIIA-PCOS-001-S01-P0042'
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    status = Column(String(50), nullable=False, default="SCREENED")  # SCREENED, ENROLLED, ACTIVE, COMPLETED, DROPPED_OUT
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    study = relationship("Study", back_populates="participants")
    site = relationship("Site", back_populates="participants")
    screening = relationship("Screening", back_populates="participant", uselist=False)
    enrollment = relationship("Enrollment", back_populates="participant", uselist=False)
    randomization = relationship("Randomization", back_populates="participant", uselist=False)
    visits = relationship("Visit", back_populates="participant")
    medications = relationship("Medication", back_populates="participant")


class Screening(Base):
    __tablename__ = "screenings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participants.id"), unique=True, nullable=False)
    screening_date = Column(Date, nullable=False)
    eligibility_status = Column(String(50), nullable=False)  # ELIGIBLE, INELIGIBLE, PENDING
    screen_failure_reason = Column(Text, nullable=True)
    screened_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    participant = relationship("Participant", back_populates="screening")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participants.id"), unique=True, nullable=False)
    enrollment_date = Column(Date, nullable=False)
    enrolled_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    participant = relationship("Participant", back_populates="enrollment")


class Randomization(Base):
    __tablename__ = "randomizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participants.id"), unique=True, nullable=False)
    randomization_date = Column(Date, nullable=False)
    allocation_group = Column(String(100), nullable=False)  # e.g., 'ARM_A (Ayush-PCOS)', 'ARM_B (Standard of Care)'
    is_blinded = Column(Boolean, default=True)

    participant = relationship("Participant", back_populates="randomization")


class Visit(Base):
    __tablename__ = "visits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participants.id"), nullable=False)
    protocol_visit_id = Column(UUID(as_uuid=True), ForeignKey("protocol_visits.id"), nullable=False)
    scheduled_date = Column(Date, nullable=False)
    actual_date = Column(Date, nullable=True)
    study_day = Column(Integer, nullable=True)
    status = Column(String(50), nullable=False, default="SCHEDULED")  # SCHEDULED, COMPLETED, MISSED, CANCELLED, OUT_OF_WINDOW
    notes = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    participant = relationship("Participant", back_populates="visits")
    protocol_visit = relationship("ProtocolVisit")
    assessments = relationship("VisitAssessment", back_populates="visit")


class VisitAssessment(Base):
    __tablename__ = "visit_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visit_id = Column(UUID(as_uuid=True), ForeignKey("visits.id"), nullable=False)
    assessment_type = Column(String(100), nullable=False)  # VITALS, LAB, QUESTIONNAIRE
    assessment_name = Column(String(100), nullable=False)  # SYSBP, DIABP, PULSE, FASTING_BG, WEIGHT
    numeric_value = Column(Float, nullable=True)
    text_value = Column(Text, nullable=True)
    unit = Column(String(50), nullable=True)
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    visit = relationship("Visit", back_populates="assessments")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participants.id"), nullable=False)
    drug_name = Column(String(255), nullable=False)
    is_investigational = Column(Boolean, nullable=False, default=False)
    dosage = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)

    participant = relationship("Participant", back_populates="medications")
