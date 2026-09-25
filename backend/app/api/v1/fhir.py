from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import get_db, get_current_user
from app.models.identity import User
from app.services.fhir_service import FHIRService

router = APIRouter(prefix="/fhir", tags=["FHIR R4 Interoperability"])


@router.get("/Patient/{participant_id}")
def get_fhir_patient(
    participant_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns standard FHIR R4 Patient resource for a trial participant."""
    resource = FHIRService.get_patient_resource(db=db, participant_id=participant_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found.")
    return resource


@router.get("/Observation/{assessment_id}")
def get_fhir_observation(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns standard FHIR R4 Observation resource with LOINC terminology."""
    resource = FHIRService.get_observation_resource(db=db, assessment_id=assessment_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observation assessment not found.")
    return resource


@router.get("/AdverseEvent/{ae_id}")
def get_fhir_adverse_event(
    ae_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns standard FHIR R4 AdverseEvent resource."""
    resource = FHIRService.get_adverse_event_resource(db=db, ae_id=ae_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adverse event not found.")
    return resource


@router.get("/ResearchStudy/{study_id}")
def get_fhir_research_study(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns standard FHIR R4 ResearchStudy resource."""
    resource = FHIRService.get_research_study_resource(db=db, study_id=study_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found.")
    return resource
