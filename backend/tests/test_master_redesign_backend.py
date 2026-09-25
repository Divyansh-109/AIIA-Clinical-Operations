from fastapi.testclient import TestClient
from uuid import uuid4
from datetime import date, datetime, timezone
import pytest

from app.main import app
from app.core.database import SessionLocal
from app.models.identity import User, Role
from app.models.study import Study, Protocol, ProtocolVersion, ProtocolVisit, Site
from app.models.clinical import Participant, Screening, Enrollment, Visit
from app.models.pharmacovigilance import AdverseEvent, SeriousAdverseEvent, ReportingRule

client = TestClient(app)


def get_token_for(role_name: str) -> str:
    db = SessionLocal()
    try:
        user = db.query(User).join(Role).filter(Role.name == role_name).first()
        if not user:
            role = db.query(Role).filter(Role.name == role_name).first()
            user = User(
                email=f"{role_name.lower()}@demo.ctms",
                hashed_password="pw",
                full_name=f"Demo {role_name}",
                role_id=role.id
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        from app.core.security import create_access_token
        return create_access_token(subject=str(user.id), role=role_name, email=user.email, full_name=user.full_name)
    finally:
        db.close()


def test_control_center_and_documents():
    db = SessionLocal()
    try:
        study = db.query(Study).filter(Study.study_code == "AIIA-PCOS-001").first()
        assert study is not None

        token = get_token_for("ADMIN")
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Test Control Center
        resp = client.get(f"/api/v1/kpis/study/{study.id}/control-center", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "operational_health" in data
        assert "safety" in data
        assert "compliance" in data
        assert "data_integrity" in data
        assert "action_center" in data
        assert "ayurvedic_intervention" in data
        assert data["ayurvedic_intervention"]["formulation"] is not None

        # 2. Test Documents
        doc_resp = client.get(f"/api/v1/compliance/documents/{study.id}", headers=headers)
        assert doc_resp.status_code == 200
        docs = doc_resp.json()
        assert len(docs) >= 1

        # 3. Test Reporting Rules
        rules_resp = client.get("/api/v1/safety/reporting-rules", headers=headers)
        assert rules_resp.status_code == 200
        rules = rules_resp.json()
        assert len(rules) >= 1
        assert "clock_start_event" in rules[0]
    finally:
        db.close()
