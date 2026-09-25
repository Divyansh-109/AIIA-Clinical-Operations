from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.study import Study
from app.models.protocol_guardian import ProtocolDeviation, DataQuery
from app.models.pharmacovigilance import SeriousAdverseEvent, SafetySignal, AdverseEvent


class TrialRiskService:
    @staticmethod
    def evaluate_study_risk(db: Session, study_id: UUID) -> Dict[str, Any]:
        """
        Explainable Trial Risk Engine (Section 35):
        Evaluates multi-dimensional operational risks without black-box claims.
        Displays exact underlying records driving the risk status.
        """
        study = db.query(Study).filter(Study.id == study_id).first()
        if not study:
            return {}

        factors = []
        total_risk_score = 0.0

        # Factor 1: Recruitment Lag
        target = study.target_enrollment or 1
        actual = study.actual_enrollment or 0
        pct = (actual / target) * 100.0
        if pct < 35.0:
            impact = 30.0
            status = "ATTENTION_REQUIRED"
            desc = f"Recruitment severely behind milestone target ({actual}/{target} enrolled, {round(pct, 1)}%)."
        elif pct < 70.0:
            impact = 15.0
            status = "MODERATE"
            desc = f"Moderate recruitment pace lag ({actual}/{target} enrolled, {round(pct, 1)}%)."
        else:
            impact = 0.0
            status = "NORMAL"
            desc = f"Recruitment pace on track ({actual}/{target} enrolled, {round(pct, 1)}%)."

        factors.append({
            "factor_name": "Recruitment Velocity",
            "score_impact": impact,
            "status": status,
            "description": desc,
            "underlying_records_reference": f"Study target: {target}, enrolled participants: {actual}"
        })
        total_risk_score += impact

        # Factor 2: Protocol Deviations
        devs = db.query(ProtocolDeviation).filter(ProtocolDeviation.study_id == study_id).all()
        crit_devs = [d for d in devs if d.severity in ["CRITICAL", "MAJOR"]]
        if len(crit_devs) >= 4:
            impact = 25.0
            status = "ATTENTION_REQUIRED"
            desc = f"High density of major/critical protocol deviations ({len(crit_devs)} major events)."
        elif len(devs) >= 3:
            impact = 15.0
            status = "MODERATE"
            desc = f"Multiple protocol deviations recorded ({len(devs)} total deviations)."
        else:
            impact = 0.0
            status = "NORMAL"
            desc = "Protocol adherence within acceptable GCP tolerance."

        factors.append({
            "factor_name": "Protocol Deviations",
            "score_impact": impact,
            "status": status,
            "description": desc,
            "underlying_records_reference": f"{len(crit_devs)} major/critical deviations of {len(devs)} total"
        })
        total_risk_score += impact

        # Factor 3: Data Quality Query Backlog
        queries = db.query(DataQuery).filter(DataQuery.study_id == study_id, DataQuery.status != "RESOLVED").all()
        if len(queries) >= 5:
            impact = 20.0
            status = "ATTENTION_REQUIRED"
            desc = f"Unresolved query backlog ({len(queries)} open discrepancies) exceeding turnaround threshold."
        elif len(queries) >= 2:
            impact = 10.0
            status = "MODERATE"
            desc = f"{len(queries)} open queries pending investigator/coordinator response."
        else:
            impact = 0.0
            status = "NORMAL"
            desc = "Data discrepancy resolution turnaround is healthy."

        factors.append({
            "factor_name": "Data Quality & Queries",
            "score_impact": impact,
            "status": status,
            "description": desc,
            "underlying_records_reference": f"{len(queries)} open discrepancies recorded in eCRFs"
        })
        total_risk_score += impact

        # Factor 4: Pharmacovigilance & Safety
        saes = db.query(SeriousAdverseEvent).join(AdverseEvent, AdverseEvent.id == SeriousAdverseEvent.adverse_event_id).filter(AdverseEvent.study_id == study_id).all()
        signals = db.query(SafetySignal).filter(SafetySignal.study_id == study_id).all()
        if len(saes) >= 2 or len(signals) >= 1:
            impact = 25.0
            status = "ATTENTION_REQUIRED"
            desc = f"Safety vigilance elevated: {len(saes)} SAE case(s) and {len(signals)} prioritized safety signal(s)."
        elif len(saes) >= 1:
            impact = 15.0
            status = "MODERATE"
            desc = f"{len(saes)} SAE case under active regulatory reporting surveillance."
        else:
            impact = 0.0
            status = "NORMAL"
            desc = "No serious safety triggers or disproportionality signals detected."

        factors.append({
            "factor_name": "Safety Signals & SAEs",
            "score_impact": impact,
            "status": status,
            "description": desc,
            "underlying_records_reference": f"{len(saes)} SAE records, {len(signals)} detected safety signals"
        })
        total_risk_score += impact

        # Determine level and verdict
        overall_score = min(100.0, round(total_risk_score, 1))
        if overall_score >= 60.0:
            level = "CRITICAL"
            verdict = "TRIAL REQUIRES URGENT ATTENTION"
        elif overall_score >= 40.0:
            level = "HIGH"
            verdict = "TRIAL REQUIRES ATTENTION"
        elif overall_score >= 20.0:
            level = "MEDIUM"
            verdict = "MODERATE OPERATIONAL SCRUTINY"
        else:
            level = "LOW"
            verdict = "TRIAL ON TRACK"

        return {
            "study_id": study.id,
            "study_code": study.study_code,
            "overall_risk_score": overall_score,
            "risk_level": level,
            "verdict": verdict,
            "contributing_factors": factors,
            "assessed_at": datetime.now(timezone.utc)
        }
