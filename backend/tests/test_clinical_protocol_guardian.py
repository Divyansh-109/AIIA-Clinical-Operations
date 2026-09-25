import pytest
import uuid
from datetime import date, timedelta
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


def setup_test_study():
    headers = get_auth_header("ADMIN")
    unique_code = f"AIIA-PCOS-PG-{uuid.uuid4().hex[:6].upper()}"

    # Create Study
    study_resp = client.post(
        "/api/v1/studies",
        headers=headers,
        json={
            "study_code": unique_code,
            "title": "Study with Protocol Guardian Rules",
            "short_title": "PG Test Study",
            "study_type": "INTERVENTIONAL",
            "intervention": "Herbal Compound A",
            "therapeutic_area": "Ayurveda",
            "phase": "PHASE_II",
            "design": "Double Blind",
            "target_enrollment": 50
        }
    )
    study_id = study_resp.json()["id"]

    # Add Site
    site_resp = client.post(
        f"/api/v1/studies/{study_id}/sites",
        headers=headers,
        json={
            "site_code": "S01",
            "site_name": "AIIA New Delhi",
            "location": "New Delhi",
            "target_enrollment": 50
        }
    )
    site_id = site_resp.json()["id"]

    # Add Protocol with visit definitions & assessment rules
    proto_resp = client.post(
        f"/api/v1/studies/{study_id}/protocols",
        headers=headers,
        json={
            "version_number": "v1.0",
            "effective_date": "2026-09-20",
            "visits": [
                {
                    "visit_name": "Baseline (V1)",
                    "visit_number": 1,
                    "target_day": 0,
                    "lower_window_days": 0,
                    "upper_window_days": 2,
                    "is_mandatory": True,
                    "rules": [
                        {"rule_type": "REQUIRED_ASSESSMENT", "rule_code": "SYSBP_REQ", "parameters": {}},
                        {"rule_type": "REQUIRED_ASSESSMENT", "rule_code": "DIABP_REQ", "parameters": {}}
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
                        {"rule_type": "REQUIRED_ASSESSMENT", "rule_code": "FASTING_BG_REQ", "parameters": {}}
                    ]
                }
            ]
        }
    )

    return study_id, site_id


def test_participant_screening_and_enrollment():
    study_id, site_id = setup_test_study()
    coord_headers = get_auth_header("STUDY_COORDINATOR")

    # 1. Screen participant
    p_code = f"AIIA-PCOS-S01-{uuid.uuid4().hex[:4].upper()}"
    screen_resp = client.post(
        f"/api/v1/studies/{study_id}/participants/screen",
        headers=coord_headers,
        json={
            "participant_code": p_code,
            "site_id": site_id,
            "age": 28,
            "gender": "FEMALE",
            "screening_date": "2026-09-20",
            "eligibility_status": "ELIGIBLE"
        }
    )
    assert screen_resp.status_code == 200
    p_data = screen_resp.json()
    p_id = p_data["id"]
    assert p_data["status"] == "SCREENED"

    # 2. Enroll participant (Day 0)
    enroll_resp = client.post(
        f"/api/v1/participants/{p_id}/enroll",
        headers=coord_headers,
        json={"enrollment_date": "2026-09-22"}
    )
    assert enroll_resp.status_code == 200
    assert enroll_resp.json()["status"] == "ENROLLED"

    # 3. Verify auto-generated visit schedule
    visits_resp = client.get(f"/api/v1/participants/{p_id}/visits", headers=coord_headers)
    assert visits_resp.status_code == 200
    visits = visits_resp.json()
    assert len(visits) == 2
    assert visits[0]["visit_name"] == "Baseline (V1)"
    assert visits[1]["visit_name"] == "Week 4 (V2)"
    v1_id = visits[0]["id"]
    v2_id = visits[1]["id"]

    # 4. Complete Baseline Visit V1 Compliantly (Day 0)
    complete_v1 = client.post(
        f"/api/v1/visits/{v1_id}/complete",
        headers=coord_headers,
        json={
            "actual_date": "2026-09-22",
            "assessments": [
                {"assessment_type": "VITALS", "assessment_name": "SYSBP", "numeric_value": 118.0, "unit": "mmHg"},
                {"assessment_type": "VITALS", "assessment_name": "DIABP", "numeric_value": 78.0, "unit": "mmHg"}
            ]
        }
    )
    assert complete_v1.status_code == 200
    v1_res = complete_v1.json()["result"]
    assert v1_res["guardian_status"] == "COMPLIANT"
    assert len(v1_res["deviations"]) == 0

    # 5. Complete Week 4 Visit V2 with OUT-OF-WINDOW + MISSING LAB ASSESSMENT
    # Expected target day 28 (allowed 25-31). We simulate attendance on Day 45 (2026-11-06)
    # And omit FASTING_BG_REQ
    complete_v2 = client.post(
        f"/api/v1/visits/{v2_id}/complete",
        headers=coord_headers,
        json={
            "actual_date": "2026-11-06",  # Day 45
            "assessments": [
                {"assessment_type": "VITALS", "assessment_name": "SYSBP", "numeric_value": 122.0, "unit": "mmHg"}
                # Missing FASTING_BG_REQ
            ]
        }
    )
    assert complete_v2.status_code == 200
    v2_res = complete_v2.json()["result"]
    assert v2_res["guardian_status"] == "DEVIATION"
    assert len(v2_res["deviations"]) == 2  # Out of window + Missing assessment!

    # 6. Verify deviations in study deviation list
    devs_resp = client.get(f"/api/v1/deviations/study/{study_id}", headers=coord_headers)
    assert devs_resp.status_code == 200
    devs = devs_resp.json()
    assert len(devs) >= 2
    types = [d["deviation_type"] for d in devs]
    assert "OUT_OF_WINDOW_VISIT" in types
    assert "MISSING_ASSESSMENT" in types

    # 7. Test Amendment Impact Analyzer
    impact_resp = client.post(
        "/api/v1/protocols/impact-analysis",
        headers=coord_headers,
        json={"study_id": study_id, "old_version": "v1.0", "new_version": "v2.0"}
    )
    assert impact_resp.status_code == 200
    impact_data = impact_resp.json()
    assert impact_data["reconsent_required"] is True
    assert impact_data["affected_participants_count"] >= 1
