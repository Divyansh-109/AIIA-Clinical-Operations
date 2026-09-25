import pytest
import uuid
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


def setup_interop_study():
    headers = get_auth_header("ADMIN")
    u_code = f"AIIA-INTEROP-{uuid.uuid4().hex[:6].upper()}"

    s_resp = client.post(
        "/api/v1/studies",
        headers=headers,
        json={
            "study_code": u_code,
            "title": "Interoperability & CDISC Flagship Study",
            "short_title": "CDISC Study",
            "study_type": "INTERVENTIONAL",
            "intervention": "Ayush-PCOS Herbal Extract",
            "therapeutic_area": "Ayurveda",
            "target_enrollment": 100
        }
    )
    study_id = s_resp.json()["id"]

    site_resp = client.post(
        f"/api/v1/studies/{study_id}/sites",
        headers=headers,
        json={
            "site_code": "S01",
            "site_name": "AIIA Apex Center",
            "location": "New Delhi",
            "target_enrollment": 50
        }
    )
    site_id = site_resp.json()["id"]

    client.post(
        f"/api/v1/studies/{study_id}/protocols",
        headers=headers,
        json={
            "version_number": "v1.0",
            "effective_date": "2026-09-20",
            "visits": [
                {"visit_name": "Baseline (V1)", "visit_number": 1, "target_day": 0, "rules": []}
            ]
        }
    )

    p_resp = client.post(
        f"/api/v1/studies/{study_id}/participants/screen",
        headers=headers,
        json={
            "participant_code": f"AIIA-PCOS-S01-{uuid.uuid4().hex[:4].upper()}",
            "site_id": site_id,
            "age": 29,
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

    # Complete visit with vitals
    v_resp = client.get(f"/api/v1/participants/{p_id}/visits", headers=headers)
    v_id = v_resp.json()[0]["id"]
    client.post(
        f"/api/v1/visits/{v_id}/complete",
        headers=headers,
        json={
            "actual_date": "2026-09-22",
            "assessments": [
                {"assessment_type": "VITALS", "assessment_name": "SYSBP", "numeric_value": 120.0, "unit": "mmHg"},
                {"assessment_type": "VITALS", "assessment_name": "DIABP", "numeric_value": 80.0, "unit": "mmHg"}
            ]
        }
    )

    # Report an AE
    client.post(
        "/api/v1/safety/adverse-events",
        headers=headers,
        json={
            "study_id": study_id,
            "site_id": site_id,
            "participant_id": p_id,
            "event_term": "Nausea",
            "onset_date": "2026-09-23",
            "severity": "MILD",
            "is_serious": False,
            "suspected_drug": "Ayush-PCOS Herbal Extract"
        }
    )

    return study_id, site_id, p_id


def test_fhir_and_cdisc_and_ai():
    study_id, site_id, p_id = setup_interop_study()
    headers = get_auth_header("ADMIN")

    # 1. FHIR Patient
    fhir_p = client.get(f"/api/v1/fhir/Patient/{p_id}", headers=headers)
    assert fhir_p.status_code == 200
    p_res = fhir_p.json()
    assert p_res["resourceType"] == "Patient"
    assert p_res["id"] == p_id

    # 2. FHIR ResearchStudy
    fhir_s = client.get(f"/api/v1/fhir/ResearchStudy/{study_id}", headers=headers)
    assert fhir_s.status_code == 200
    assert fhir_s.json()["resourceType"] == "ResearchStudy"

    # 3. CDISC SDTM Datasets Export
    cdisc_resp = client.post(f"/api/v1/cdisc/export/{study_id}", headers=headers)
    assert cdisc_resp.status_code == 200
    cdisc_data = cdisc_resp.json()
    assert "DM.csv" in cdisc_data["datasets"]
    assert "VS.csv" in cdisc_data["datasets"]
    assert "AE.csv" in cdisc_data["datasets"]
    assert "CM.csv" in cdisc_data["datasets"]
    assert "EX.csv" in cdisc_data["datasets"]
    assert "STUDYID,DOMAIN,USUBJID" in cdisc_data["datasets"]["DM.csv"]

    # 4. Define-XML Generation
    def_xml = client.get(f"/api/v1/cdisc/define-xml/{study_id}", headers=headers)
    assert def_xml.status_code == 200
    assert "xml" in def_xml.headers.get("content-type", "")
    assert "<ItemGroupDef OID=\"IG.DM\"" in def_xml.text

    # 5. Trial Trust Evidence Graph
    graph_resp = client.get(f"/api/v1/trial-trust/evidence-graph/{study_id}", headers=headers)
    assert graph_resp.status_code == 200
    graph_data = graph_resp.json()
    assert len(graph_data["nodes"]) >= 2
    assert len(graph_data["links"]) >= 1

    # 6. Explainable Trial Risk
    risk_resp = client.get(f"/api/v1/risk/study/{study_id}", headers=headers)
    assert risk_resp.status_code == 200
    risk_data = risk_resp.json()
    assert "verdict" in risk_data
    assert len(risk_data["contributing_factors"]) == 4

    # 7. What-If Simulator
    sim_resp = client.post(
        "/api/v1/simulation/run",
        headers=headers,
        json={"study_id": study_id, "additional_sites": 2, "recruitment_rate_multiplier": 1.25}
    )
    assert sim_resp.status_code == 200
    sim_data = sim_resp.json()
    assert sim_data["time_saved_months"] > 0

    # 8. Explainable AI: AE Narrative Extraction
    narrative_sample = "Patient reported experiencing severe headache and dizziness after evening dose, required hospital admission for monitoring."
    ai_ae_resp = client.post(
        "/api/v1/ai/extract-narrative",
        headers=headers,
        json={"narrative_text": narrative_sample}
    )
    assert ai_ae_resp.status_code == 200
    extracted = ai_ae_resp.json()
    assert extracted["extracted_event_term"] in ["Headache", "Dizziness"]
    assert extracted["extracted_severity"] == "SEVERE"
    assert extracted["is_serious_indicated"] is True
    assert extracted["human_review_required"] is True

    # 9. Clinical Data Concept Translation
    trans_resp = client.post(
        "/api/v1/ai/translate-concept",
        headers=headers,
        json={"source_concept": "SYSBP"}
    )
    assert trans_resp.status_code == 200
    trans_data = trans_resp.json()
    assert trans_data["target_domain"] == "VS"
    assert trans_data["mapped_sdtm_variable"] == "VS.SYSBP"
    assert trans_data["confidence_score"] > 0.9
