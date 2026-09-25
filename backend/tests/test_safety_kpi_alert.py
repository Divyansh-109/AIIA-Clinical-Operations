import pytest
import uuid
from datetime import date
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_header(role="ADMIN"):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiia.gov.in", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    if role != "ADMIN":
        switch_resp = client.post(
            "/api/v1/auth/switch-role",
            headers={"Authorization": f"Bearer {token}"},
            json={"target_role": role}
        )
        token = switch_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def setup_study_and_participant():
    headers = get_auth_header("ADMIN")
    u_code = f"AIIA-SAFETY-{uuid.uuid4().hex[:6].upper()}"

    # Study
    s_resp = client.post(
        "/api/v1/studies",
        headers=headers,
        json={
            "study_code": u_code,
            "title": "Safety & PV Intelligence Study",
            "short_title": "Safety Trial",
            "study_type": "INTERVENTIONAL",
            "intervention": "Ayush-Compound-X",
            "therapeutic_area": "Ayurveda",
            "target_enrollment": 100
        }
    )
    study_id = s_resp.json()["id"]

    # Site
    site_resp = client.post(
        f"/api/v1/studies/{study_id}/sites",
        headers=headers,
        json={
            "site_code": "S01",
            "site_name": "AIIA Research Hospital",
            "location": "New Delhi",
            "target_enrollment": 50
        }
    )
    site_id = site_resp.json()["id"]

    # Protocol
    client.post(
        f"/api/v1/studies/{study_id}/protocols",
        headers=headers,
        json={
            "version_number": "v1.0",
            "effective_date": "2026-09-20",
            "visits": [
                {"visit_name": "V1", "visit_number": 1, "target_day": 0, "rules": []}
            ]
        }
    )

    # Participant Screen & Enroll
    p_code = f"AIIA-PCOS-S01-P{uuid.uuid4().hex[:4].upper()}"
    p_resp = client.post(
        f"/api/v1/studies/{study_id}/participants/screen",
        headers=headers,
        json={
            "participant_code": p_code,
            "site_id": site_id,
            "age": 30,
            "gender": "FEMALE",
            "screening_date": "2026-09-20"
        }
    )
    p_id = p_resp.json()["id"]

    client.post(
        f"/api/v1/participants/{p_id}/enroll",
        headers=headers,
        json={"enrollment_date": "2026-09-22"}
    )

    return study_id, site_id, p_id


def test_sae_reporting_and_deadlines():
    study_id, site_id, p_id = setup_study_and_participant()
    pv_headers = get_auth_header("PHARMACOVIGILANCE")

    # 1. Report Serious Adverse Event (Hospitalization)
    ae_resp = client.post(
        "/api/v1/safety/adverse-events",
        headers=pv_headers,
        json={
            "study_id": study_id,
            "site_id": site_id,
            "participant_id": p_id,
            "event_term": "Severe Abdominal Cramps",
            "onset_date": "2026-09-23",
            "severity": "SEVERE",
            "is_serious": True,
            "suspected_drug": "Ayush-Compound-X",
            "causality": "PROBABLE",
            "criteria_hospitalization": True
        }
    )
    assert ae_resp.status_code == 200
    ae_data = ae_resp.json()
    assert ae_data["is_serious"] is True
    assert ae_data["meddra_pt_code"] == "10000084"

    # 2. Verify SAE Deadline calculation
    deadlines_resp = client.get(f"/api/v1/safety/sae/deadlines?study_id={study_id}", headers=pv_headers)
    assert deadlines_resp.status_code == 200
    deadlines = deadlines_resp.json()
    assert len(deadlines) >= 1
    sae_case = deadlines[0]
    assert sae_case["initial_hours_remaining"] > 20.0  # Approx 24 hours remaining
    assert sae_case["detailed_hours_remaining"] > 160.0 # Approx 7 days remaining
    assert sae_case["urgency_status"] in ["NORMAL", "URGENT"]

    # 3. Report additional AEs of same term to trigger Safety Signal Engine
    for _ in range(3):
        client.post(
            "/api/v1/safety/adverse-events",
            headers=pv_headers,
            json={
                "study_id": study_id,
                "site_id": site_id,
                "participant_id": p_id,
                "event_term": "Severe Abdominal Cramps",
                "onset_date": "2026-09-23",
                "severity": "SEVERE",
                "is_serious": False,
                "suspected_drug": "Ayush-Compound-X"
            }
        )

    # 4. Check Safety Signals endpoint
    signals_resp = client.get(f"/api/v1/safety/studies/{study_id}/signals", headers=pv_headers)
    assert signals_resp.status_code == 200
    signals = signals_resp.json()
    assert len(signals) >= 1
    assert signals[0]["event_term"] == "Severe Abdominal Cramps"
    assert signals[0]["disproportionality_score"] >= 2.0
    assert signals[0]["priority_score"] > 0

    # 5. Check Study KPIs
    kpi_resp = client.get(f"/api/v1/kpis/study/{study_id}", headers=pv_headers)
    assert kpi_resp.status_code == 200
    kpis = kpi_resp.json()
    assert kpis["total_ae_count"] >= 4
    assert kpis["sae_count"] >= 1
    assert kpis["safety_signals_count"] >= 1

    # 6. Check Alerts and Correlation
    alerts_resp = client.get(f"/api/v1/alerts?study_id={study_id}", headers=pv_headers)
    assert alerts_resp.status_code == 200
    alerts = alerts_resp.json()
    assert any(a["severity"] == "CRITICAL" for a in alerts)
