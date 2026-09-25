from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.api.deps import get_db, get_current_user, require_roles
from app.models.identity import User
from app.models.pharmacovigilance import AdverseEvent, SeriousAdverseEvent, SafetySignal, ReportingRule
from app.schemas.safety import (
    AECreate, AEResponse, SAEDeadlineResponse, SafetySignalResponse, TerminologySearchResponse,
    SAEReviewRequest, SAESubmitRequest, ReportingRuleResponse
)
from app.services.pv_service import PVService

router = APIRouter(prefix="/safety", tags=["Pharmacovigilance & Safety Monitoring"])


@router.post("/adverse-events", response_model=AEResponse)
def report_adverse_event(
    req: AECreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "STUDY_COORDINATOR", "PHARMACOVIGILANCE"]))
):
    """
    Records an Adverse Event. If seriousness criteria are marked True,
    automatically creates an SAE case, begins regulatory clock initiated upon awareness,
    and calculates deadlines against configured reporting rules!
    """
    ae, sae = PVService.capture_adverse_event(
        db=db,
        study_id=req.study_id,
        site_id=req.site_id,
        participant_id=req.participant_id,
        event_term=req.event_term,
        onset_date=req.onset_date,
        suspected_drug=req.suspected_drug,
        severity=req.severity,
        is_serious=req.is_serious,
        causality=req.causality,
        outcome=req.outcome,
        meddra_pt_code=req.meddra_pt_code,
        meddra_soc=req.meddra_soc,
        criteria_death=req.criteria_death,
        criteria_life_threatening=req.criteria_life_threatening,
        criteria_hospitalization=req.criteria_hospitalization,
        criteria_disability=req.criteria_disability,
        criteria_congenital=req.criteria_congenital,
        awareness_date=req.awareness_date,
        user_id=str(current_user.id),
        user_role=current_user.role.name
    )
    return ae


@router.get("/studies/{study_id}/adverse-events", response_model=List[AEResponse])
def list_study_adverse_events(
    study_id: UUID,
    serious_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists reported adverse events for a study."""
    query = db.query(AdverseEvent).filter(AdverseEvent.study_id == study_id)
    if serious_only:
        query = query.filter(AdverseEvent.is_serious.is_(True))
    return query.order_by(AdverseEvent.reported_at.desc()).all()


@router.get("/sae/deadlines", response_model=List[SAEDeadlineResponse])
def get_active_sae_deadlines(
    study_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    SAE Regulatory Deadline Engine:
    Returns exact remaining hours/minutes against configured reporting rules,
    clearly identifying the clock-start event (PI awareness timestamp).
    """
    return PVService.get_sae_deadlines(db=db, study_id=study_id)


@router.put("/sae/{sae_id}/review")
def update_sae_review(
    sae_id: UUID,
    req: SAEReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PHARMACOVIGILANCE", "PI"]))
):
    """
    Pharmacovigilance Medical Assessment:
    Updates SAE state machine (Draft -> Under Review -> Reportable -> Closed),
    records causality, expectedness, and reviewer notes.
    """
    try:
        updated = PVService.update_sae_review(
            db=db,
            sae_id=sae_id,
            status=req.status,
            pv_review_notes=req.pv_review_notes,
            causality=req.causality,
            expectedness=req.expectedness,
            user_id=str(current_user.id),
            user_role=current_user.role.name
        )
        return {"message": "SAE medical review successfully updated.", "sae_id": updated.id, "status": updated.status}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/sae/{sae_id}/submit")
def submit_sae_report(
    sae_id: UUID,
    req: SAESubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PHARMACOVIGILANCE", "PI"]))
):
    """
    Formal Regulatory Submission:
    Submits initial/detailed SAE report to Central Licensing Authority & IEC.
    """
    try:
        updated = PVService.submit_sae_report(
            db=db,
            sae_id=sae_id,
            submission_dossier_ref=req.submission_dossier_ref,
            user_id=str(current_user.id),
            user_role=current_user.role.name
        )
        return {
            "message": "SAE report formally submitted to Licensing Authority (DCGI) & Ethics Committee.",
            "sae_id": updated.id,
            "status": updated.status,
            "submission_date": updated.regulatory_submission_date
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/reporting-rules", response_model=List[ReportingRuleResponse])
def get_reporting_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves active configurable regulatory reporting rules."""
    rules = db.query(ReportingRule).all()
    if not rules:
        r = PVService.get_or_create_default_reporting_rule(db)
        return [r]
    return rules


@router.get("/studies/{study_id}/signals", response_model=List[SafetySignalResponse])
def list_safety_signals(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Safety Signal Prioritization Engine:
    Retrieves detected potential signals with explainable disproportionality PRR metrics,
    numerator/denominator evidence, and baseline rates.
    """
    return db.query(SafetySignal).filter(SafetySignal.study_id == study_id).order_by(SafetySignal.priority_score.desc()).all()


@router.get("/terminology/search", response_model=List[TerminologySearchResponse])
def search_terminology(
    q: str = "",
    current_user: User = Depends(get_current_user)
):
    """Search MedDRA / WHODrug clinical terminology codes."""
    return PVService.search_terminology(query=q)
