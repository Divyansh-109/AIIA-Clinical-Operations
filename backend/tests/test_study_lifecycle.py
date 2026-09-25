import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.services.audit_service import AuditService

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


def test_study_creation_and_lifecycle():
    headers = get_auth_header("ADMIN")
    unique_code = f"AIIA-PCOS-TEST-{uuid.uuid4().hex[:6].upper()}"

    # 1. Create Study
    study_payload = {
        "study_code": unique_code,
        "title": "Clinical Evaluation of Ayush-PCOS Formulation in Women of Reproductive Age",
        "short_title": "Ayush-PCOS Clinical Trial",
        "study_type": "INTERVENTIONAL",
        "intervention": "Ayush-PCOS Herbal Granules 5g BD vs Placebo",
        "therapeutic_area": "Ayurvedic Gynecology & Endocrinology",
        "phase": "PHASE_II",
        "design": "Randomized Double-Blind Placebo-Controlled Multi-Centric Trial",
        "start_date": "2026-10-01",
        "planned_end_date": "2027-10-01",
        "target_enrollment": 120
    }

    create_resp = client.post("/api/v1/studies", headers=headers, json=study_payload)
    assert create_resp.status_code == 200, f"Error: {create_resp.text}"
    study_data = create_resp.json()
    study_id = study_data["id"]
    assert study_data["study_code"] == unique_code
    assert study_data["status"] == "DRAFT"

    # 2. Add Protocol Version with visits and rules
    protocol_payload = {
        "version_number": "v1.0",
        "effective_date": "2026-09-25",
        "amendment_reason": "Initial approved protocol design",
        "visits": [
            {
                "visit_name": "Screening (V0)",
                "visit_number": 0,
                "target_day": -7,
                "lower_window_days": -3,
                "upper_window_days": 0,
                "is_mandatory": True,
                "rules": [
                    {"rule_type": "REQUIRED_ASSESSMENT", "rule_code": "FASTING_GLUCOSE_REQ", "parameters": {}},
                    {"rule_type": "REQUIRED_ASSESSMENT", "rule_code": "ULTRASOUND_REQ", "parameters": {}}
                ]
            },
            {
                "visit_name": "Baseline (V1)",
                "visit_number": 1,
                "target_day": 0,
                "lower_window_days": 0,
                "upper_window_days": 2,
                "is_mandatory": True,
                "rules": [
                    {"rule_type": "REQUIRED_ASSESSMENT", "rule_code": "SYSBP_REQ", "parameters": {"min": 90, "max": 140}},
                    {"rule_type": "REQUIRED_ASSESSMENT", "rule_code": "DIABP_REQ", "parameters": {"min": 60, "max": 90}}
                ]
            },
            {
                "visit_name": "Week 4 (V2)",
                "visit_number": 2,
                "target_day": 28,
                "lower_window_days": -3,
                "upper_window_days": 3,
                "is_mandatory": True,
                "rules": [
                    {"rule_type": "REQUIRED_ASSESSMENT", "rule_code": "SYSBP_REQ", "parameters": {}},
                    {"rule_type": "REQUIRED_ASSESSMENT", "rule_code": "DIABP_REQ", "parameters": {}}
                ]
            }
        ]
    }
    proto_resp = client.post(f"/api/v1/studies/{study_id}/protocols", headers=headers, json=protocol_payload)
    assert proto_resp.status_code == 200, f"Protocol error: {proto_resp.text}"
    assert proto_resp.json()["version_number"] == "v1.0"

    # 3. Add Clinical Site
    site_payload = {
        "site_code": "S01",
        "site_name": "AIIA Main Hospital, New Delhi",
        "location": "Sarita Vihar, New Delhi",
        "target_enrollment": 60
    }
    site_resp = client.post(f"/api/v1/studies/{study_id}/sites", headers=headers, json=site_payload)
    assert site_resp.status_code == 200, f"Site error: {site_resp.text}"
    assert site_resp.json()["site_code"] == "S01"

    # 4. Verify illegal status jump is rejected (DRAFT -> RECRUITING)
    illegal_jump_resp = client.put(
        f"/api/v1/studies/{study_id}/lifecycle",
        headers=headers,
        json={"new_status": "RECRUITING", "reason": "Attempting illegal jump"}
    )
    assert illegal_jump_resp.status_code == 400
    assert "Illegal lifecycle transition" in illegal_jump_resp.json()["detail"]

    # 5. Follow legal sequential lifecycle state machine
    # DRAFT -> PROTOCOL_FINALIZED
    trans_1 = client.put(
        f"/api/v1/studies/{study_id}/lifecycle",
        headers=headers,
        json={"new_status": "PROTOCOL_FINALIZED", "reason": "Protocol v1.0 signed off by scientific board"}
    )
    assert trans_1.status_code == 200
    assert trans_1.json()["status"] == "PROTOCOL_FINALIZED"

    # PROTOCOL_FINALIZED -> ETHICS_PENDING
    trans_2 = client.put(
        f"/api/v1/studies/{study_id}/lifecycle",
        headers=headers,
        json={"new_status": "ETHICS_PENDING", "reason": "Dossier submitted to IEC"}
    )
    assert trans_2.status_code == 200
    assert trans_2.json()["status"] == "ETHICS_PENDING"

    # ETHICS_PENDING -> ETHICS_APPROVED
    trans_3 = client.put(
        f"/api/v1/studies/{study_id}/lifecycle",
        headers=headers,
        json={"new_status": "ETHICS_APPROVED", "reason": "Formal ethical clearance granted by IEC"}
    )
    assert trans_3.status_code == 200
    assert trans_3.json()["status"] == "ETHICS_APPROVED"

    # 6. Verify audit chain cryptographic integrity
    db = SessionLocal()
    try:
        is_valid, count, failure_reason = AuditService.verify_integrity(db)
        assert is_valid is True, f"Audit integrity failed: {failure_reason}"
        assert count > 0
        print(f"\nAudit Chain Verified: {count} events validated with SHA-256 hash chaining.")
    finally:
        db.close()
