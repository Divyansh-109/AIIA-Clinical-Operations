from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from app.api.deps import get_db, get_current_user, require_roles
from app.models.identity import User
from app.models.protocol_guardian import DataQuery
from app.schemas.data_quality import (
    DataQueryCreate, QueryRespondRequest, QueryResolveRequest,
    DataQueryResponse, DataQualityMetrics
)
from app.services.data_quality_service import DataQualityService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/queries", tags=["Data Quality & Query Management"])


@router.get("/study/{study_id}", response_model=List[DataQueryResponse])
def list_study_queries(
    study_id: UUID,
    status_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all data quality queries for a study with computed aging metrics."""
    query = db.query(DataQuery).filter(DataQuery.study_id == study_id)
    if status_filter:
        query = query.filter(DataQuery.status == status_filter.upper())
    if severity_filter:
        query = query.filter(DataQuery.severity == severity_filter.upper())

    records = query.order_by(DataQuery.created_at.desc()).all()
    now_utc = datetime.now(timezone.utc)

    result = []
    for q in records:
        q_due = q.due_at if q.due_at.tzinfo else q.due_at.replace(tzinfo=timezone.utc)
        q_created = q.created_at if q.created_at.tzinfo else q.created_at.replace(tzinfo=timezone.utc)

        is_overdue = (q.status not in ["RESOLVED", "REJECTED"]) and (q_due < now_utc)
        age_days = (now_utc - q_created).days

        result.append(
            DataQueryResponse(
                id=q.id,
                study_id=q.study_id,
                site_id=q.site_id,
                participant_id=q.participant_id,
                visit_id=q.visit_id,
                field_name=q.field_name,
                description=q.description,
                severity=q.severity,
                status=q.status,
                assigned_to=q.assigned_to,
                created_at=q.created_at,
                due_at=q.due_at,
                resolved_at=q.resolved_at,
                resolution_text=q.resolution_text,
                is_overdue=is_overdue,
                age_days=age_days
            )
        )
    return result


@router.post("", response_model=DataQueryResponse)
def create_query(
    req: DataQueryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "MONITOR"]))
):
    """Creates a clinical discrepancy query."""
    q = DataQualityService.create_query(
        db=db,
        study_id=req.study_id,
        site_id=req.site_id,
        participant_id=req.participant_id,
        visit_id=req.visit_id,
        field_name=req.field_name,
        description=req.description,
        severity=req.severity,
        due_days=req.due_days,
        user_id=str(current_user.id),
        user_role=current_user.role.name
    )
    return DataQueryResponse(
        id=q.id,
        study_id=q.study_id,
        site_id=q.site_id,
        participant_id=q.participant_id,
        visit_id=q.visit_id,
        field_name=q.field_name,
        description=q.description,
        severity=q.severity,
        status=q.status,
        assigned_to=q.assigned_to,
        created_at=q.created_at,
        due_at=q.due_at,
        resolved_at=q.resolved_at,
        resolution_text=q.resolution_text,
        is_overdue=False,
        age_days=0
    )


@router.put("/{query_id}/respond")
def respond_to_query(
    query_id: UUID,
    req: QueryRespondRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "STUDY_COORDINATOR"]))
):
    """Study Coordinator provides explanation or data correction response to query."""
    q = db.query(DataQuery).filter(DataQuery.id == query_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Query not found.")

    q.status = "RESPONDED"
    q.resolution_text = req.resolution_text
    db.commit()

    AuditService.record(
        db=db,
        action="QUERY_RESPONDED",
        entity_type="DataQuery",
        entity_id=str(q.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"status": "RESPONDED", "resolution": req.resolution_text},
        change_reason="Coordinator query response submitted"
    )

    return {"message": "Query response recorded and routed for review.", "query_id": q.id}


@router.put("/{query_id}/resolve")
def resolve_query(
    query_id: UUID,
    req: QueryResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "MONITOR"]))
):
    """Monitor or PI reviews response and formally closes/resolves or rejects discrepancy."""
    q = db.query(DataQuery).filter(DataQuery.id == query_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Query not found.")

    q.status = req.status.upper()
    if q.status == "RESOLVED":
        q.resolved_at = datetime.now(timezone.utc)
    db.commit()

    AuditService.record(
        db=db,
        action=f"QUERY_{q.status}",
        entity_type="DataQuery",
        entity_id=str(q.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"status": q.status, "notes": req.notes},
        change_reason=f"Clinical monitor verification ({q.status})"
    )

    return {"message": f"Query status updated to {q.status}.", "query_id": q.id}


@router.get("/metrics/{study_id}", response_model=DataQualityMetrics)
def get_study_data_quality_metrics(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves composite data quality KPIs: open queries, aging, and turnaround times."""
    return DataQualityService.get_query_metrics(db=db, study_id=study_id)
