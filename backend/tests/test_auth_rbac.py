import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_login_success_admin():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiia.gov.in", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "ADMIN"
    assert data["email"] == "admin@aiia.gov.in"


def test_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiia.gov.in", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_role_switcher_for_sih_demo():
    # First login as admin
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiia.gov.in", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Switch to PHARMACOVIGILANCE
    switch_resp = client.post(
        "/api/v1/auth/switch-role",
        headers=headers,
        json={"target_role": "PHARMACOVIGILANCE"}
    )
    assert switch_resp.status_code == 200
    data = switch_resp.json()
    assert data["role"] == "PHARMACOVIGILANCE"
    assert data["email"] == "pv.officer@aiia.gov.in"

    # Switch to PI
    switch_pi = client.post(
        "/api/v1/auth/switch-role",
        headers=headers,
        json={"target_role": "PI"}
    )
    assert switch_pi.status_code == 200
    assert switch_pi.json()["role"] == "PI"


def test_available_roles_endpoint():
    response = client.get("/api/v1/auth/available-roles")
    assert response.status_code == 200
    roles = response.json()
    role_names = [r["name"] for r in roles]
    expected_roles = [
        "ADMIN", "LEADERSHIP", "PI", "STUDY_COORDINATOR",
        "MONITOR", "ETHICS_COMMITTEE", "PHARMACOVIGILANCE", "REGULATOR"
    ]
    for r in expected_roles:
        assert r in role_names
