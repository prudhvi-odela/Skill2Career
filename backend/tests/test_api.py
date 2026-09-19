"""
Skill2Career Backend Integration & Unit Tests
Tests authentication, student profile, ML inference endpoints, roadmaps, and assessments.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_root_and_health():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["app"] == "Skill2Career API"

    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"


def test_auth_login_demo_user():
    response = client.post("/api/v1/auth/login", json={
        "email": "demo@skill2career.com",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@skill2career.com"


def test_student_profile_and_skills():
    # 1. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@skill2career.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get profile
    profile_res = client.get("/api/v1/student/profile", headers=headers)
    assert profile_res.status_code == 200
    profile_data = profile_res.json()
    assert profile_data["email"] == "demo@skill2career.com"
    assert len(profile_data["skills"]) > 0

    # 3. Add a new skill
    skill_res = client.post("/api/v1/student/skills", headers=headers, json={
        "skill_id": "SK034",  # Docker
        "proficiency_level": 4.0,
        "years_experience": 1.5
    })
    assert skill_res.status_code == 201
    assert skill_res.json()["skill_id"] == "SK034"
    assert skill_res.json()["proficiency_level"] == 4.0


def test_careers_and_matching():
    # 1. Get careers catalog
    careers_res = client.get("/api/v1/careers")
    assert careers_res.status_code == 200
    careers = careers_res.json()
    assert len(careers) >= 5

    # 2. Get authenticated recommendations
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@skill2career.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    rec_res = client.get("/api/v1/careers/matching/recommendations", headers=headers)
    assert rec_res.status_code == 200
    matches = rec_res.json()
    assert len(matches) > 0
    assert "match_percentage" in matches[0]


def test_analysis_gap_and_readiness():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@skill2career.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Gap analysis
    gap_res = client.post("/api/v1/analysis/gap", headers=headers, params={"target_career_id": "CR004"})
    assert gap_res.status_code == 200
    gap_data = gap_res.json()
    assert "coverage_percentage" in gap_data
    assert "gaps" in gap_data
    assert len(gap_data["gaps"]) > 0

    # Readiness prediction
    ready_res = client.post("/api/v1/analysis/readiness", headers=headers, json={"target_career_id": "CR004"})
    assert ready_res.status_code == 200
    ready_data = ready_res.json()
    assert "readiness_score" in ready_data
    assert ready_data["readiness_score"] > 0
    assert "feature_contributions" in ready_data
    assert "model_version" in ready_data

    # Trajectory forecast
    traj_res = client.post("/api/v1/analysis/trajectory", headers=headers, json={"weekly_study_hours": 15.0})
    assert traj_res.status_code == 200
    traj_data = traj_res.json()
    assert len(traj_data["trajectory_points"]) == 7


def test_roadmap_and_assessment():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@skill2career.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get roadmap
    roadmap_res = client.get("/api/v1/roadmap", headers=headers, params={"target_career_id": "CR004"})
    assert roadmap_res.status_code == 200
    roadmap_data = roadmap_res.json()
    assert len(roadmap_data["items"]) > 0

    # List assessments
    asm_res = client.get("/api/v1/assessments")
    assert asm_res.status_code == 200
    asms = asm_res.json()
    assert len(asms) > 0

    # Submit quiz
    asm_id = asms[0]["id"]
    quiz_res = client.get(f"/api/v1/assessments/{asm_id}")
    assert quiz_res.status_code == 200
    quiz_data = quiz_res.json()

    answers = {q["id"]: 0 for q in quiz_data["questions"]}
    submit_res = client.post("/api/v1/assessments/submit", headers=headers, json={
        "assessment_id": asm_id,
        "answers": answers
    })
    assert submit_res.status_code == 200
    assert "score_pct" in submit_res.json()


def test_ml_versions():
    res = client.get("/api/v1/ml/versions")
    assert res.status_code == 200
    versions = res.json()
    assert len(versions) > 0
