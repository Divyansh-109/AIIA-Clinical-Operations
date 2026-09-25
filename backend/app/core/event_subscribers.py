import logging
from uuid import UUID
from datetime import datetime, timezone
from app.core.event_bus import event_bus, Event
from app.core.database import SessionLocal
from app.models.intelligence import Alert
from app.services.kpi_service import KPIService
from app.services.trial_risk_service import TrialRiskService
from app.services.alert_engine import AlertEngine
from app.services.pv_service import PVService

logger = logging.getLogger("aiia_event_subscribers")


def handle_participant_enrolled(event: Event):
    """
    Action -> Consequence:
    Participant enrolled -> recalculates study recruitment KPIs,
    re-assesses multi-dimensional operational risk, and updates site metrics.
    """
    payload = event.payload
    study_id_str = payload.get("study_id")
    if not study_id_str:
        return

    study_id = UUID(study_id_str)
    db = SessionLocal()
    try:
        logger.info(f"[State Propagation] Recomputing KPIs and risk for Study {study_id} on ParticipantEnrolled")
        KPIService.calculate_study_kpis(db=db, study_id=study_id)
        TrialRiskService.evaluate_study_risk(db=db, study_id=study_id)
        AlertEngine.evaluate_correlated_site_risks(db=db, study_id=study_id)
    except Exception as e:
        logger.error(f"Error handling ParticipantEnrolled event: {e}", exc_info=True)
    finally:
        db.close()


def handle_visit_completed(event: Event):
    """
    Action -> Consequence:
    Visit completed -> Protocol Guardian validation updates visit compliance %,
    generates compliance alert if deviation detected, and updates operational risk.
    """
    payload = event.payload
    study_id_str = payload.get("study_id")
    if not study_id_str:
        return

    study_id = UUID(study_id_str)
    site_id_str = payload.get("site_id")
    site_id = UUID(site_id_str) if site_id_str else None
    deviations_count = payload.get("deviations_count", 0)
    guardian_status = payload.get("guardian_status", "COMPLIANT")

    db = SessionLocal()
    try:
        logger.info(f"[State Propagation] Visit completed with guardian status '{guardian_status}' for Study {study_id}")
        if deviations_count > 0:
            AlertEngine.create_alert(
                db=db,
                category="COMPLIANCE",
                severity="WARNING" if guardian_status == "DEVIATION" else "CRITICAL",
                title=f"Protocol Deviation Identified ({deviations_count} non-compliance event)",
                message=f"Protocol Guardian flagged visit non-compliance for human review. Status: {guardian_status}.",
                study_id=study_id,
                site_id=site_id
            )

        KPIService.calculate_study_kpis(db=db, study_id=study_id)
        TrialRiskService.evaluate_study_risk(db=db, study_id=study_id)
    except Exception as e:
        logger.error(f"Error handling VisitCompleted event: {e}", exc_info=True)
    finally:
        db.close()


def handle_safety_event(event: Event):
    """
    Action -> Consequence:
    AE logged / SAE escalated -> recalculates safety KPIs, re-runs safety signal
    prioritization engine with updated PRR disproportionality, updates risk index.
    """
    payload = event.payload
    study_id_str = payload.get("study_id")
    if not study_id_str:
        return

    study_id = UUID(study_id_str)
    is_serious = payload.get("is_serious", False)

    db = SessionLocal()
    try:
        logger.info(f"[State Propagation] Recomputing safety metrics for Study {study_id} on safety event")
        PVService.evaluate_safety_signals(db=db, study_id=study_id)
        KPIService.calculate_study_kpis(db=db, study_id=study_id)
        TrialRiskService.evaluate_study_risk(db=db, study_id=study_id)
    except Exception as e:
        logger.error(f"Error handling safety event: {e}", exc_info=True)
    finally:
        db.close()


def handle_query_event(event: Event):
    """
    Action -> Consequence:
    Query created / responded / resolved -> updates data quality KPIs,
    overdue backlog, and study health index.
    """
    payload = event.payload
    study_id_str = payload.get("study_id")
    if not study_id_str:
        return

    study_id = UUID(study_id_str)
    db = SessionLocal()
    try:
        logger.info(f"[State Propagation] Updating data quality metrics for Study {study_id} on query event")
        KPIService.calculate_study_kpis(db=db, study_id=study_id)
        TrialRiskService.evaluate_study_risk(db=db, study_id=study_id)
    except Exception as e:
        logger.error(f"Error handling query event: {e}", exc_info=True)
    finally:
        db.close()


def register_domain_subscribers():
    """Subscribes all core domain consequence handlers to the global EventBus."""
    event_bus.subscribe("ParticipantEnrolled", handle_participant_enrolled)
    event_bus.subscribe("VisitCompleted", handle_visit_completed)
    event_bus.subscribe("AECreated", handle_safety_event)
    event_bus.subscribe("SAEEscalated", handle_safety_event)
    event_bus.subscribe("DataQueryCreated", handle_query_event)
    event_bus.subscribe("DataQueryResolved", handle_query_event)
    event_bus.subscribe("DataQueryResponded", handle_query_event)
    logger.info("AIIA EventBus domain event subscribers successfully registered.")
