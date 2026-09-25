from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import date, timedelta

from app.api.deps import get_db, get_current_user, require_roles
from app.models.identity import User
from app.models.study import Study, Site, Protocol, ProtocolVersion, ProtocolVisit
from app.models.clinical import Participant, Screening, Enrollment, Randomization, Visit
from app.schemas.clinical import (
    ScreeningRequest, EnrollmentRequest, RandomizationRequest,
    ParticipantResponse, VisitResponse, UpcomingDeviationRiskResponse
)
from app.services.protocol_guardian_service import ProtocolGuardianService
from app.services.audit_service import AuditService
from app.core.event_bus import event_bus, Event

router = APIRouter(tags=["Clinical Operations & Participants"])


@router.post("/studies/{study_id}/participants/screen", response_model=ParticipantResponse)
def screen_participant(
    study_id: UUID,
    req: ScreeningRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "STUDY_COORDINATOR"]))
):
    """Records participant screening and initial eligibility check."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found.")

    site = db.query(Site).filter(Site.id == req.site_id, Site.study_id == study_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found for this study.")

    existing = db.query(Participant).filter(Participant.participant_code == req.participant_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Participant code '{req.participant_code}' already exists."
        )

    participant = Participant(
        participant_code=req.participant_code,
        study_id=study_id,
        site_id=req.site_id,
        status="SCREENED",
        age=req.age,
        gender=req.gender
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)

    screening = Screening(
        participant_id=participant.id,
        screening_date=req.screening_date,
        eligibility_status=req.eligibility_status,
        screen_failure_reason=req.screen_failure_reason,
        screened_by=current_user.id
    )
    db.add(screening)
    db.commit()

    AuditService.record(
        db=db,
        action="PARTICIPANT_SCREENED",
        entity_type="Participant",
        entity_id=str(participant.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"code": participant.participant_code, "status": req.eligibility_status},
        change_reason="Subject screening"
    )

    return participant


@router.post("/participants/{participant_id}/enroll", response_model=ParticipantResponse)
def enroll_participant(
    participant_id: UUID,
    req: EnrollmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "STUDY_COORDINATOR"]))
):
    """
    Confirms participant enrollment (Study Day 0), links consent,
    generates protocol visit schedule, and updates recruitment KPIs.
    """
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found.")

    if participant.status != "SCREENED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot enroll participant in status '{participant.status}'. Must be in 'SCREENED'."
        )

    # 1. Update Participant Status
    participant.status = "ENROLLED"

    # 2. Record Enrollment
    enrollment = Enrollment(
        participant_id=participant.id,
        enrollment_date=req.enrollment_date,
        enrolled_by=current_user.id
    )
    db.add(enrollment)

    # 3. Update Study and Site actual enrollment counters
    study = db.query(Study).filter(Study.id == participant.study_id).first()
    study.actual_enrollment += 1

    site = db.query(Site).filter(Site.id == participant.site_id).first()
    site.actual_enrollment += 1

    # 4. Automatically generate scheduled visits from active Protocol
    protocol = db.query(Protocol).filter(Protocol.study_id == participant.study_id).first()
    if protocol and protocol.current_version_id:
        p_visits = (
            db.query(ProtocolVisit)
            .filter(ProtocolVisit.protocol_version_id == protocol.current_version_id)
            .order_by(ProtocolVisit.visit_number.asc())
            .all()
        )
        for pv in p_visits:
            scheduled_date = req.enrollment_date + timedelta(days=pv.target_day)
            visit = Visit(
                participant_id=participant.id,
                protocol_visit_id=pv.id,
                scheduled_date=scheduled_date,
                status="SCHEDULED"
            )
            db.add(visit)

    db.commit()
    db.refresh(participant)

    AuditService.record(
        db=db,
        action="PARTICIPANT_ENROLLED",
        entity_type="Participant",
        entity_id=str(participant.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={
            "code": participant.participant_code,
            "enrollment_date": req.enrollment_date.isoformat(),
            "new_study_enrollment": study.actual_enrollment
        },
        change_reason="Informed consent confirmed & enrolled"
    )

    event_bus.publish(
        Event(
            event_type="ParticipantEnrolled",
            payload={
                "participant_id": str(participant.id),
                "study_id": str(study.id),
                "site_id": str(site.id),
                "enrollment_date": req.enrollment_date.isoformat()
            },
            user_id=str(current_user.id),
            user_role=current_user.role.name
        )
    )

    return participant


@router.post("/participants/{participant_id}/randomize")
def randomize_participant(
    participant_id: UUID,
    req: RandomizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "STUDY_COORDINATOR"]))
):
    """Allocates participant to treatment group."""
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found.")

    if participant.status not in ["ENROLLED", "ACTIVE"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Participant must be ENROLLED prior to randomization. Current status: '{participant.status}'."
        )

    existing_rand = db.query(Randomization).filter(Randomization.participant_id == participant_id).first()
    if existing_rand:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Participant already randomized.")

    rand = Randomization(
        participant_id=participant_id,
        randomization_date=req.randomization_date,
        allocation_group=req.allocation_group,
        is_blinded=req.is_blinded
    )
    participant.status = "ACTIVE"
    db.add(rand)
    db.commit()

    AuditService.record(
        db=db,
        action="PARTICIPANT_RANDOMIZED",
        entity_type="Randomization",
        entity_id=str(rand.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"allocation_group": req.allocation_group if not req.is_blinded else "BLINDED_ARM"},
        change_reason="Randomization allocation"
    )

    return {
        "status": "success",
        "participant_id": participant_id,
        "allocation": req.allocation_group if not req.is_blinded else "BLINDED_ACTIVE_INVESTIGATION"
    }


@router.get("/studies/{study_id}/participants", response_model=List[ParticipantResponse])
def list_study_participants(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists study participants using de-identified codes."""
    return db.query(Participant).filter(Participant.study_id == study_id).order_by(Participant.created_at.desc()).all()


@router.get("/participants/{participant_id}/visits", response_model=List[VisitResponse])
def get_participant_visits(
    participant_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves full protocol visit schedule and completion history for a participant."""
    visits = (
        db.query(Visit)
        .filter(Visit.participant_id == participant_id)
        .order_by(Visit.scheduled_date.asc())
        .all()
    )
    result = []
    for v in visits:
        pv_name = v.protocol_visit.visit_name if v.protocol_visit else "Visit"
        pv_num = v.protocol_visit.visit_number if v.protocol_visit else 0
        result.append(
            VisitResponse(
                id=v.id,
                participant_id=v.participant_id,
                protocol_visit_id=v.protocol_visit_id,
                visit_name=pv_name,
                visit_number=pv_num,
                scheduled_date=v.scheduled_date,
                actual_date=v.actual_date,
                study_day=v.study_day,
                status=v.status,
                notes=v.notes,
                assessments=v.assessments
            )
        )
    return result


@router.get("/participants/{participant_id}/deviation-risk", response_model=UpcomingDeviationRiskResponse)
def get_participant_deviation_risk(
    participant_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Predictive Protocol Guardian: evaluates risk of upcoming protocol deviation."""
    return ProtocolGuardianService.predict_upcoming_deviation_risk(db=db, participant_id=participant_id)
