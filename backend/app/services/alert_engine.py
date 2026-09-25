from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.intelligence import Alert
from app.models.study import Site, Study
from app.models.protocol_guardian import ProtocolDeviation, DataQuery
from app.models.pharmacovigilance import AdverseEvent


class AlertEngine:
    @staticmethod
    def create_alert(
        db: Session,
        category: str,
        severity: str,
        title: str,
        message: str,
        study_id: Optional[UUID] = None,
        site_id: Optional[UUID] = None
    ) -> Alert:
        """Creates an alert record and indexes it for role notifications."""
        alert = Alert(
            category=category.upper(),
            severity=severity.upper(),
            title=title,
            message=message,
            study_id=study_id,
            site_id=site_id
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def evaluate_correlated_site_risks(db: Session, study_id: UUID) -> List[Dict[str, Any]]:
        """
        Alert Correlation Engine (Section 34):
        Aggregates multiple isolated operational signals at each site
        into a unified, explainable 'Site Performance Risk' evaluation.
        """
        sites = db.query(Site).filter(Site.study_id == study_id).all()
        correlated_risks = []

        for site in sites:
            signals = []
            risk_score = 0

            # 1. Recruitment check
            target = site.target_enrollment or 1
            actual = site.actual_enrollment or 0
            if actual < (target * 0.4):
                signals.append(f"Severe recruitment shortfall ({actual}/{target} enrolled, {round(actual/target*100)}% target)")
                risk_score += 35
            elif actual < (target * 0.7):
                signals.append(f"Moderate recruitment lag ({actual}/{target} enrolled)")
                risk_score += 15

            # 2. Protocol Deviations check
            devs = db.query(ProtocolDeviation).filter(ProtocolDeviation.site_id == site.id).all()
            if len(devs) >= 3:
                signals.append(f"Elevated protocol deviation velocity ({len(devs)} deviations detected)")
                risk_score += 25
            elif len(devs) >= 1:
                signals.append(f"{len(devs)} protocol deviation(s) active")
                risk_score += 10

            # 3. Query backlog check
            queries = db.query(DataQuery).filter(DataQuery.site_id == site.id, DataQuery.status != "RESOLVED").all()
            if len(queries) >= 3:
                signals.append(f"Critical data query backlog ({len(queries)} open discrepancies)")
                risk_score += 25

            # 4. AE reporting disparity
            aes = db.query(AdverseEvent).filter(AdverseEvent.site_id == site.id).count()
            if actual >= 10 and aes == 0:
                signals.append("Potential safety under-reporting anomaly: 0 AEs reported across substantial cohort")
                risk_score += 20

            # If 2 or more signals are active, produce correlated summary
            if len(signals) >= 2 or risk_score >= 35:
                overall_risk = "CRITICAL" if risk_score >= 60 else ("HIGH" if risk_score >= 40 else "MODERATE")
                narrative = (
                    f"Composite operational risk detected at {site.site_name} ({site.site_code}). "
                    f"Confluence of {len(signals)} operational signals suggests systemic site oversight strain: "
                    + "; ".join(signals) + "."
                )
                correlated_risks.append({
                    "site_id": site.id,
                    "site_code": site.site_code,
                    "site_name": site.site_name,
                    "study_code": site.study.study_code if site.study else "STUDY",
                    "overall_site_risk": overall_risk,
                    "contributing_signals": signals,
                    "evidence_narrative": narrative,
                    "active_alerts_count": len(signals)
                })

        return correlated_risks
