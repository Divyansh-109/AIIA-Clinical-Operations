from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import get_db, require_roles
from app.models.identity import User
from app.models.clinical import Visit
from app.schemas.clinical import VisitCompleteRequest
from app.services.protocol_guardian_service import ProtocolGuardianService

router = APIRouter(prefix="/visits", tags=["Visit Operations & Protocol Guardian"])


@router.post("/{visit_id}/complete")
def complete_visit(
    visit_id: UUID,
    req: VisitCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "STUDY_COORDINATOR"]))
):
    """
    Submits actual visit attendance and clinical assessments.
    Triggers Protocol Guardian to perform real-time visit window and assessment compliance checks!
    """
    visit = db.query(Visit).filter(Visit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit record not found.")

    assessments_dict = [a.model_dump() for a in req.assessments]

    result = ProtocolGuardianService.validate_visit_completion(
        db=db,
        visit=visit,
        actual_date=req.actual_date,
        assessments_data=assessments_dict,
        user_id=str(current_user.id),
        user_role=current_user.role.name
    )

    if req.notes:
        visit.notes = req.notes
        db.commit()

    return {
        "message": "Visit completed and validated by Protocol Guardian.",
        "result": result
    }
