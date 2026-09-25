from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.protocol_guardian import DataQuery
from app.services.audit_service import AuditService
from app.core.event_bus import event_bus, Event


class DataQualityService:
    @staticmethod
    def create_query(
        db: Session,
        study_id: UUID,
        site_id: UUID,
        participant_id: UUID,
        field_name: str,
        description: str,
        severity: str = "MEDIUM",
        visit_id: Optional[UUID] = None,
        due_days: int = 5,
        user_id: Optional[str] = None,
        user_role: Optional[str] = None
    ) -> DataQuery:
        """Creates a discrepancy query and tracks resolution aging."""
        now_utc = datetime.now(timezone.utc)
        due_at = now_utc + timedelta(days=due_days)

        query = DataQuery(
            study_id=study_id,
            site_id=site_id,
            participant_id=participant_id,
            visit_id=visit_id,
            field_name=field_name,
            description=description,
            severity=severity,
            status="OPEN",
            created_at=now_utc,
            due_at=due_at
        )
        db.add(query)
        db.commit()
        db.refresh(query)

        AuditService.record(
            db=db,
            action="QUERY_CREATED",
            entity_type="DataQuery",
            entity_id=str(query.id),
            user_id=str(user_id) if user_id else None,
            user_role=user_role,
            new_value={"field": field_name, "severity": severity, "description": description},
            change_reason="Clinical data discrepancy raised"
        )

        event_bus.publish(
            Event(
                event_type="QueryGenerated",
                payload={
                    "query_id": str(query.id),
                    "study_id": str(study_id),
                    "site_id": str(site_id),
                    "field_name": field_name,
                    "severity": severity
                },
                user_id=str(user_id) if user_id else None,
                user_role=user_role
            )
        )

        return query

    @staticmethod
    def get_query_metrics(db: Session, study_id: UUID) -> Dict[str, Any]:
        """Calculates study data quality indicators: open, critical, aging, and resolution rates."""
        queries = db.query(DataQuery).filter(DataQuery.study_id == study_id).all()
        now_utc = datetime.now(timezone.utc)

        total = len(queries)
        if total == 0:
            return {
                "total_queries": 0,
                "open_queries": 0,
                "critical_queries": 0,
                "overdue_queries": 0,
                "resolved_queries": 0,
                "resolution_rate_pct": 100.0,
                "avg_resolution_hours": 0.0
            }

        open_q = [q for q in queries if q.status in ["OPEN", "ASSIGNED", "RESPONDED", "REVIEW"]]
        critical_q = [q for q in open_q if q.severity == "CRITICAL"]
        overdue_q = [q for q in open_q if q.due_at.replace(tzinfo=timezone.utc) < now_utc]
        resolved_q = [q for q in queries if q.status == "RESOLVED"]

        # Calculate average turnaround hours for resolved queries
        turnaround_hours = []
        for q in resolved_q:
            if q.resolved_at and q.created_at:
                diff = (q.resolved_at.replace(tzinfo=timezone.utc) - q.created_at.replace(tzinfo=timezone.utc)).total_seconds() / 3600.0
                turnaround_hours.append(max(0.1, diff))

        avg_hours = round(sum(turnaround_hours) / len(turnaround_hours), 1) if turnaround_hours else 0.0
        res_rate = round((len(resolved_q) / total) * 100.0, 1)

        return {
            "total_queries": total,
            "open_queries": len(open_q),
            "critical_queries": len(critical_q),
            "overdue_queries": len(overdue_q),
            "resolved_queries": len(resolved_q),
            "resolution_rate_pct": res_rate,
            "avg_resolution_hours": avg_hours
        }
