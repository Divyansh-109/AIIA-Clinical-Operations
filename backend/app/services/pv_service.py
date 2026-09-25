from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.pharmacovigilance import AdverseEvent, SeriousAdverseEvent, SafetySignal, TerminologyCode, ReportingRule
from app.models.clinical import Participant
from app.models.study import Study
from app.models.intelligence import Alert
from app.services.audit_service import AuditService
from app.core.event_bus import event_bus, Event

MOCK_MEDDRA_DICTIONARY = [
    {"term": "Abdominal Pain", "code": "10000081", "system": "MEDDRA", "classification": "Gastrointestinal disorders"},
    {"term": "Severe Abdominal Cramps", "code": "10000084", "system": "MEDDRA", "classification": "Gastrointestinal disorders"},
    {"term": "Headache", "code": "10019211", "system": "MEDDRA", "classification": "Nervous system disorders"},
    {"term": "Nausea", "code": "10028813", "system": "MEDDRA", "classification": "Gastrointestinal disorders"},
    {"term": "Elevated Liver Enzymes (ALT/AST)", "code": "10001551", "system": "MEDDRA", "classification": "Hepatobiliary disorders"},
    {"term": "Skin Rash / Pruritus", "code": "10037844", "system": "MEDDRA", "classification": "Skin and subcutaneous tissue disorders"},
    {"term": "Dizziness", "code": "10013573", "system": "MEDDRA", "classification": "Nervous system disorders"},
    {"term": "Ayush-PCOS Granules", "code": "WHOD-AYUSH-001", "system": "WHODRUG", "classification": "Ayurvedic Proprietary Compound"},
    {"term": "Metformin Hydrochloride", "code": "WHOD-MET-500", "system": "WHODRUG", "classification": "Antidiabetic Biguanide"}
]


class PVService:
    @staticmethod
    def get_or_create_default_reporting_rule(db: Session) -> ReportingRule:
        rule = db.query(ReportingRule).filter(ReportingRule.is_active.is_(True)).first()
        if not rule:
            rule = ReportingRule(
                jurisdiction="CDSCO (India)",
                regulatory_framework="New Drugs and Clinical Trials Rules (NDCT 2019)",
                study_type="INTERVENTIONAL",
                event_type="SERIOUS_ADVERSE_EVENT",
                reporter="PRINCIPAL_INVESTIGATOR",
                clock_start_event="PI Awareness of SAE",
                initial_deadline_hours=24,
                detailed_deadline_days=7,
                recipient="Licensing Authority (DCGI) & Institutional Ethics Committee (IEC)",
                reference_source="Chapter VI, Rule 42, NDCT Rules 2019 / Indian GCP",
                is_active=True
            )
            db.add(rule)
            db.commit()
            db.refresh(rule)
        return rule

    @staticmethod
    def capture_adverse_event(
        db: Session,
        study_id: UUID,
        site_id: UUID,
        participant_id: UUID,
        event_term: str,
        onset_date,
        suspected_drug: str,
        severity: str = "MODERATE",
        is_serious: bool = False,
        causality: str = "PROBABLE",
        outcome: str = "RECOVERING",
        meddra_pt_code: Optional[str] = None,
        meddra_soc: Optional[str] = None,
        criteria_death: bool = False,
        criteria_life_threatening: bool = False,
        criteria_hospitalization: bool = False,
        criteria_disability: bool = False,
        criteria_congenital: bool = False,
        awareness_date: Optional[datetime] = None,
        user_id: Optional[str] = None,
        user_role: Optional[str] = None
    ) -> Tuple[AdverseEvent, Optional[SeriousAdverseEvent]]:
        """
        Captures AE, escalates to SAE if seriousness criteria met, and models
        a configurable reporting rule with clock initiated upon investigator awareness.
        """
        now_utc = datetime.now(timezone.utc)
        rule = PVService.get_or_create_default_reporting_rule(db)

        # Lookup MedDRA if not supplied
        if not meddra_pt_code:
            match = next((m for m in MOCK_MEDDRA_DICTIONARY if m["term"].lower() in event_term.lower()), None)
            if match:
                meddra_pt_code = match["code"]
                meddra_soc = match["classification"]
            else:
                meddra_pt_code = "10099999"
                meddra_soc = "General disorders and administration site conditions"

        ae = AdverseEvent(
            study_id=study_id,
            site_id=site_id,
            participant_id=participant_id,
            event_term=event_term,
            meddra_pt_code=meddra_pt_code,
            meddra_soc=meddra_soc,
            onset_date=onset_date,
            severity=severity,
            is_serious=is_serious,
            suspected_drug=suspected_drug,
            causality=causality,
            outcome=outcome,
            reported_by=UUID(user_id) if user_id else UUID("00000000-0000-0000-0000-000000000000"),
            reported_at=now_utc
        )
        db.add(ae)
        db.commit()
        db.refresh(ae)

        sae = None
        if is_serious:
            clock_start = awareness_date or now_utc
            initial_deadline = clock_start + timedelta(hours=rule.initial_deadline_hours)
            detailed_deadline = clock_start + timedelta(days=rule.detailed_deadline_days)

            sae = SeriousAdverseEvent(
                adverse_event_id=ae.id,
                criteria_death=criteria_death,
                criteria_life_threatening=criteria_life_threatening,
                criteria_hospitalization=criteria_hospitalization,
                criteria_disability=criteria_disability,
                criteria_congenital=criteria_congenital,
                awareness_date=clock_start,
                initial_report_deadline=initial_deadline,
                detailed_report_deadline=detailed_deadline,
                status="REPORTED",
                causality_assessment=causality,
                expectedness="UNEXPECTED"
            )
            db.add(sae)

            # Spawn urgent alert
            alert = Alert(
                study_id=study_id,
                site_id=site_id,
                category="SAFETY",
                severity="CRITICAL",
                title=f"URGENT: Serious Adverse Event Reported ({event_term})",
                message=(
                    f"SAE logged. Configured reporting rule: {rule.jurisdiction} ({rule.regulatory_framework}). "
                    f"Reporting clock initiated from {rule.clock_start_event} on {clock_start.strftime('%d-%b-%Y %H:%M UTC')}. "
                    f"Initial notification deadline: {rule.initial_deadline_hours}h to {rule.recipient}."
                )
            )
            db.add(alert)
            db.commit()
            db.refresh(sae)

        AuditService.record(
            db=db,
            action="ADVERSE_EVENT_LOGGED",
            entity_type="AdverseEvent",
            entity_id=str(ae.id),
            user_id=str(user_id) if user_id else None,
            user_role=user_role,
            new_value={
                "event_term": event_term,
                "severity": severity,
                "is_serious": is_serious,
                "sae_id": str(sae.id) if sae else None,
                "awareness_date": str(sae.awareness_date) if sae else None
            },
            change_reason="Pharmacovigilance report"
        )

        event_bus.publish(
            Event(
                event_type="SAEEscalated" if is_serious else "AECreated",
                payload={
                    "ae_id": str(ae.id),
                    "sae_id": str(sae.id) if sae else None,
                    "study_id": str(study_id),
                    "site_id": str(site_id),
                    "event_term": event_term,
                    "is_serious": is_serious
                },
                user_id=str(user_id) if user_id else None,
                user_role=user_role
            )
        )

        # Trigger real-time signal evaluation
        PVService.evaluate_safety_signals(db=db, study_id=study_id)

        return ae, sae


    @staticmethod
    def get_sae_deadlines(db: Session, study_id: Optional[UUID] = None) -> List[Dict[str, Any]]:
        """
        Calculates exact real-time hours/minutes remaining against configurable reporting rules.
        Exposes the exact event that started the reporting clock.
        """
        now_utc = datetime.now(timezone.utc)
        rule = PVService.get_or_create_default_reporting_rule(db)

        query = db.query(SeriousAdverseEvent).join(AdverseEvent, AdverseEvent.id == SeriousAdverseEvent.adverse_event_id)
        if study_id:
            query = query.filter(AdverseEvent.study_id == study_id)

        saes = query.all()
        results = []

        for s in saes:
            ae = s.adverse_event
            p = ae.participant

            init_due = s.initial_report_deadline.replace(tzinfo=timezone.utc) if not s.initial_report_deadline.tzinfo else s.initial_report_deadline
            detail_due = s.detailed_report_deadline.replace(tzinfo=timezone.utc) if not s.detailed_report_deadline.tzinfo else s.detailed_report_deadline

            init_diff_hours = (init_due - now_utc).total_seconds() / 3600.0
            detail_diff_hours = (detail_due - now_utc).total_seconds() / 3600.0

            if s.status in ["SUBMITTED", "CLOSED"]:
                urgency = "SUBMITTED"
            elif init_diff_hours < 0:
                urgency = "OVERDUE"
            elif init_diff_hours <= 4.0:
                urgency = "CRITICAL"
            elif init_diff_hours <= 12.0:
                urgency = "URGENT"
            else:
                urgency = "NORMAL"

            results.append({
                "sae_id": s.id,
                "adverse_event_id": ae.id,
                "event_term": ae.event_term,
                "participant_code": p.participant_code if p else "UNKNOWN",
                "severity": ae.severity,
                "suspected_drug": ae.suspected_drug,
                "reported_at": ae.reported_at,
                "awareness_date": s.awareness_date or ae.reported_at,
                "clock_start_event": rule.clock_start_event,
                "regulatory_framework": rule.regulatory_framework,
                "jurisdiction": rule.jurisdiction,
                "recipient": rule.recipient,
                "reference_source": rule.reference_source,
                "initial_deadline_24h": s.initial_report_deadline,
                "detailed_deadline_7d": s.detailed_report_deadline,
                "initial_hours_remaining": round(init_diff_hours, 1),
                "detailed_hours_remaining": round(detail_diff_hours, 1),
                "urgency_status": urgency,
                "status": s.status,
                "causality_assessment": s.causality_assessment or ae.causality,
                "expectedness": s.expectedness or "UNEXPECTED",
                "pv_review_notes": s.pv_review_notes,
                "follow_up_notes": s.follow_up_notes,
                "regulatory_submission_date": s.regulatory_submission_date
            })

        return sorted(results, key=lambda x: x["initial_hours_remaining"])

    @staticmethod
    def update_sae_review(
        db: Session,
        sae_id: UUID,
        status: str,
        pv_review_notes: Optional[str] = None,
        causality: Optional[str] = None,
        expectedness: Optional[str] = None,
        user_id: Optional[str] = None,
        user_role: Optional[str] = None
    ) -> SeriousAdverseEvent:
        """Updates SAE review status, causality, expectedness, and review documentation."""
        sae = db.query(SeriousAdverseEvent).filter(SeriousAdverseEvent.id == sae_id).first()
        if not sae:
            raise ValueError("SAE record not found.")

        old_status = sae.status
        sae.status = status.upper()
        if pv_review_notes:
            sae.pv_review_notes = pv_review_notes
        if causality:
            sae.causality_assessment = causality
        if expectedness:
            sae.expectedness = expectedness

        sae.pv_reviewer_id = UUID(user_id) if user_id else None
        sae.pv_review_completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(sae)

        AuditService.record(
            db=db,
            action="SAE_REVIEW_UPDATED",
            entity_type="SeriousAdverseEvent",
            entity_id=str(sae.id),
            user_id=str(user_id) if user_id else None,
            user_role=user_role,
            new_value={
                "old_status": old_status,
                "new_status": sae.status,
                "causality": sae.causality_assessment,
                "expectedness": sae.expectedness,
                "notes": sae.pv_review_notes
            },
            change_reason="Pharmacovigilance medical assessment"
        )
        return sae

    @staticmethod
    def submit_sae_report(
        db: Session,
        sae_id: UUID,
        submission_dossier_ref: Optional[str] = None,
        user_id: Optional[str] = None,
        user_role: Optional[str] = None
    ) -> SeriousAdverseEvent:
        """Formal submission of initial SAE report to CDSCO / Licensing Authority and IEC."""
        sae = db.query(SeriousAdverseEvent).filter(SeriousAdverseEvent.id == sae_id).first()
        if not sae:
            raise ValueError("SAE record not found.")

        now_utc = datetime.now(timezone.utc)
        sae.status = "SUBMITTED"
        sae.regulatory_submission_date = now_utc
        if submission_dossier_ref:
            sae.follow_up_notes = f"Submitted under dossier ref: {submission_dossier_ref}. {sae.follow_up_notes or ''}"
        db.commit()
        db.refresh(sae)

        AuditService.record(
            db=db,
            action="SAE_REGULATORY_SUBMISSION",
            entity_type="SeriousAdverseEvent",
            entity_id=str(sae.id),
            user_id=str(user_id) if user_id else None,
            user_role=user_role,
            new_value={
                "status": "SUBMITTED",
                "submission_timestamp": now_utc.isoformat(),
                "dossier_ref": submission_dossier_ref
            },
            change_reason="Mandatory initial regulatory reporting submission (Rule 42, NDCT 2019)"
        )
        return sae

    @staticmethod
    def evaluate_safety_signals(db: Session, study_id: UUID) -> List[SafetySignal]:
        """
        Safety Signal Prioritization Engine:
        Explainable statistical signal calculation. Exposes numerator, denominator,
        reference baseline population, time window, mathematical formula (PRR),
        and marks finding as 'POTENTIAL_SIGNAL' requiring human clinical review.
        """
        all_aes = db.query(AdverseEvent).filter(AdverseEvent.study_id == study_id).all()
        total_participants = db.query(Participant).filter(Participant.study_id == study_id).count() or 1

        counts: Dict[str, int] = {}
        severity_weights: Dict[str, float] = {}
        for ae in all_aes:
            term = ae.event_term
            counts[term] = counts.get(term, 0) + 1
            weight = 3.0 if ae.severity == "SEVERE" else (2.0 if ae.severity == "MODERATE" else 1.0)
            severity_weights[term] = severity_weights.get(term, 0.0) + weight

        signals = []
        for term, obs in counts.items():
            expected = max(0.5, round(total_participants * 0.02, 2))
            prr = round(obs / expected, 2)

            # Signal criterion: observed >= 3 and PRR >= 2.0
            if obs >= 3 and prr >= 2.0:
                freq_factor = min(40.0, (obs / total_participants) * 100.0 * 2.0)
                sev_factor = min(35.0, (severity_weights[term] / obs) * 10.0)
                disprop_factor = min(25.0, prr * 4.0)
                priority_score = round(freq_factor + sev_factor + disprop_factor, 1)

                existing = (
                    db.query(SafetySignal)
                    .filter(SafetySignal.study_id == study_id, SafetySignal.event_term == term)
                    .first()
                )
                evidence = {
                    "event": term,
                    "numerator_observed": obs,
                    "denominator_cohort": total_participants,
                    "observed_incidence_pct": round((obs / total_participants) * 100, 1),
                    "reference_expected_cases": expected,
                    "reference_baseline_rate_pct": "2.0%",
                    "disproportionality_prr": prr,
                    "time_window": "01 Jan 2026 to Present",
                    "threshold_applied": "PRR >= 2.0 and Observed Cases >= 3",
                    "formula": "PRR = (Observed Cases / Study Cohort) / Reference Baseline Incidence",
                    "reason_for_prioritization": "Configured statistical disproportionality threshold exceeded",
                    "clinical_interpretation": (
                        f"Observed event frequency ({obs}/{total_participants}, {round((obs / total_participants) * 100, 1)}%) "
                        f"is {prr}x higher than the reference population baseline (2.0%). "
                        f"Prioritized for multidisciplinary Pharmacovigilance safety committee review."
                    ),
                    "status_label": "Potential Safety Signal — Requires Review"
                }

                if existing:
                    existing.observed_cases = obs
                    existing.disproportionality_score = prr
                    existing.priority_score = priority_score
                    existing.evidence_summary = evidence
                    signals.append(existing)
                else:
                    sig = SafetySignal(
                        study_id=study_id,
                        event_term=term,
                        observed_cases=obs,
                        expected_cases=expected,
                        disproportionality_score=prr,
                        priority_score=priority_score,
                        status="POTENTIAL_SIGNAL",
                        evidence_summary=evidence
                    )
                    db.add(sig)
                    signals.append(sig)

        db.commit()
        return signals

    @staticmethod
    def search_terminology(query: str) -> List[Dict[str, str]]:
        """Mock MedDRA and WHODrug terminology dictionary lookup."""
        q_lower = query.lower()
        matches = [m for m in MOCK_MEDDRA_DICTIONARY if q_lower in m["term"].lower() or q_lower in m["code"].lower()]
        return matches if matches else MOCK_MEDDRA_DICTIONARY[:5]
