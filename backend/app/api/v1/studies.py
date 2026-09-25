from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import date

from app.api.deps import get_db, get_current_user, require_roles
from app.models.identity import User
from app.models.study import Study, Protocol, ProtocolVersion, ProtocolVisit, ProtocolRule, Site
from app.schemas.study import (
    StudyCreate, StudyResponse, LifecycleTransitionRequest,
    SiteCreate, SiteResponse, ProtocolVersionCreate, ProtocolVersionResponse
)
from app.services.lifecycle_service import LifecycleService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/studies", tags=["Study & Protocol Management"])


@router.get("", response_model=List[StudyResponse])
def list_studies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists clinical studies. Scoped by role permissions."""
    query = db.query(Study)
    # Role scoping: PI or COORDINATOR only sees studies where they are assigned or lead
    if current_user.role.name == "PI":
        query = query.filter(Study.principal_investigator_id == current_user.id)
    # Admin, Leadership, PV, Regulator, Monitor see all studies
    return query.order_by(Study.created_at.desc()).all()


@router.post("", response_model=StudyResponse)
def create_study(
    req: StudyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI"]))
):
    """Creates a new clinical research study."""
    existing = db.query(Study).filter(Study.study_code == req.study_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Study code '{req.study_code}' already exists."
        )

    study = Study(
        study_code=req.study_code,
        title=req.title,
        short_title=req.short_title,
        study_type=req.study_type,
        intervention=req.intervention,
        therapeutic_area=req.therapeutic_area,
        phase=req.phase,
        design=req.design,
        status="DRAFT",
        start_date=req.start_date,
        planned_end_date=req.planned_end_date,
        target_enrollment=req.target_enrollment,
        actual_enrollment=0,
        principal_investigator_id=current_user.id if current_user.role.name == "PI" else None
    )
    db.add(study)
    db.commit()
    db.refresh(study)

    # Automatically create the root Protocol container
    protocol = Protocol(study_id=study.id)
    db.add(protocol)
    db.commit()

    # Tamper-evident audit
    AuditService.record(
        db=db,
        action="CREATE_STUDY",
        entity_type="Study",
        entity_id=str(study.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"study_code": study.study_code, "title": study.title},
        change_reason="Initial study registration"
    )

    return study


@router.get("/{study_id}", response_model=StudyResponse)
def get_study(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves study by ID."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found.")
    return study


@router.put("/{study_id}/lifecycle", response_model=StudyResponse)
def transition_study_lifecycle(
    study_id: UUID,
    req: LifecycleTransitionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "LEADERSHIP"]))
):
    """Transitions study to next lifecycle phase via state machine."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found.")

    return LifecycleService.transition(
        db=db,
        study=study,
        new_status=req.new_status,
        reason=req.reason,
        user_id=str(current_user.id),
        user_role=current_user.role.name
    )


# ---------------- SITE ENDPOINTS ----------------

@router.get("/{study_id}/sites", response_model=List[SiteResponse])
def list_study_sites(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists clinical trial sites for a study."""
    return db.query(Site).filter(Site.study_id == study_id).order_by(Site.site_code).all()


@router.post("/{study_id}/sites", response_model=SiteResponse)
def add_study_site(
    study_id: UUID,
    req: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI"]))
):
    """Adds a clinical site to a study."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found.")

    existing = db.query(Site).filter(Site.study_id == study_id, Site.site_code == req.site_code).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Site code '{req.site_code}' already exists for this study.")

    site = Site(
        study_id=study_id,
        site_code=req.site_code,
        site_name=req.site_name,
        location=req.location,
        target_enrollment=req.target_enrollment,
        actual_enrollment=0,
        status="ACTIVE",
        activation_date=date.today()
    )
    db.add(site)
    db.commit()
    db.refresh(site)

    AuditService.record(
        db=db,
        action="ADD_SITE",
        entity_type="Site",
        entity_id=str(site.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"site_code": site.site_code, "site_name": site.site_name},
        change_reason="Site activation"
    )

    return site


# ---------------- PROTOCOL ENDPOINTS ----------------

@router.get("/{study_id}/protocols", response_model=List[ProtocolVersionResponse])
def list_protocol_versions(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists all protocol versions for a study."""
    protocol = db.query(Protocol).filter(Protocol.study_id == study_id).first()
    if not protocol:
        return []
    return db.query(ProtocolVersion).filter(ProtocolVersion.protocol_id == protocol.id).order_by(ProtocolVersion.created_at.desc()).all()


@router.post("/{study_id}/protocols", response_model=ProtocolVersionResponse)
def add_protocol_version(
    study_id: UUID,
    req: ProtocolVersionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI"]))
):
    """Submits a new versioned protocol with visits and assessment rules."""
    protocol = db.query(Protocol).filter(Protocol.study_id == study_id).first()
    if not protocol:
        protocol = Protocol(study_id=study_id)
        db.add(protocol)
        db.commit()
        db.refresh(protocol)

    # Check for duplicate version
    existing_ver = db.query(ProtocolVersion).filter(
        ProtocolVersion.protocol_id == protocol.id,
        ProtocolVersion.version_number == req.version_number
    ).first()
    if existing_ver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Protocol version '{req.version_number}' already exists. Regulated protocols must be incremented."
        )

    pv = ProtocolVersion(
        protocol_id=protocol.id,
        version_number=req.version_number,
        effective_date=req.effective_date,
        approval_status="APPROVED",
        approval_date=req.effective_date,
        amendment_reason=req.amendment_reason,
        created_by=current_user.id
    )
    db.add(pv)
    db.commit()
    db.refresh(pv)

    # Populate Visits and Assessment Rules
    for v_data in req.visits:
        p_visit = ProtocolVisit(
            protocol_version_id=pv.id,
            visit_name=v_data.visit_name,
            visit_number=v_data.visit_number,
            target_day=v_data.target_day,
            lower_window_days=v_data.lower_window_days,
            upper_window_days=v_data.upper_window_days,
            is_mandatory=v_data.is_mandatory
        )
        db.add(p_visit)
        db.commit()
        db.refresh(p_visit)

        for r_data in v_data.rules:
            rule = ProtocolRule(
                protocol_visit_id=p_visit.id,
                rule_type=r_data.rule_type,
                rule_code=r_data.rule_code,
                parameters=r_data.parameters
            )
            db.add(rule)
        db.commit()

    protocol.current_version_id = pv.id
    db.commit()

    AuditService.record(
        db=db,
        action="ADD_PROTOCOL_VERSION",
        entity_type="ProtocolVersion",
        entity_id=str(pv.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"version_number": pv.version_number, "visits_count": len(req.visits)},
        change_reason=req.amendment_reason or "Protocol initial creation / amendment"
    )

    return pv
