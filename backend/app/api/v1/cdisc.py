from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import get_db, get_current_user
from app.models.identity import User
from app.services.cdisc_service import CDISCService

router = APIRouter(prefix="/cdisc", tags=["CDISC SDTM & Define-XML"])


@router.post("/export/{study_id}")
def export_sdtm_datasets(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    CDISC SDTM Dataset Export (Section 44):
    Generates regulatory-aligned SDTM domain datasets: DM, VS, AE, CM, EX.
    Returns domain names and their CSV content.
    """
    datasets = CDISCService.generate_sdtm_datasets(db=db, study_id=study_id)
    if not datasets:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found for CDISC export.")
    return {
        "study_id": study_id,
        "domains_exported": list(datasets.keys()),
        "datasets": datasets
    }


@router.get("/define-xml/{study_id}")
def get_define_xml(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Define-XML Generation (Section 46):
    Produces machine-readable XML metadata describing datasets, variables, labels, types, and codelists.
    """
    xml_content = CDISCService.generate_define_xml(db=db, study_id=study_id)
    return Response(content=xml_content, media_type="application/xml")
