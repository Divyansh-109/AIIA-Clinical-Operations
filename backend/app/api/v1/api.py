from fastapi import APIRouter
from app.api.v1 import (
    auth, studies, participants, visits, deviations, protocols,
    queries, safety, kpis, alerts, audit, compliance, trust, risk, simulation,
    fhir, cdisc, ai
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(studies.router)
api_router.include_router(participants.router)
api_router.include_router(visits.router)
api_router.include_router(deviations.router)
api_router.include_router(protocols.router)
api_router.include_router(queries.router)
api_router.include_router(safety.router)
api_router.include_router(kpis.router)
api_router.include_router(alerts.router)
api_router.include_router(audit.router)
api_router.include_router(compliance.router)
api_router.include_router(trust.router)
api_router.include_router(risk.router)
api_router.include_router(simulation.router)
api_router.include_router(fhir.router)
api_router.include_router(cdisc.router)
api_router.include_router(ai.router)
