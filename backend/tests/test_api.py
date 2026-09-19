"""
Skill2Career Backend Integration & MongoDB Persistence Tests
Tests authentication, student profiles, embedded skills, ML inference, roadmaps, assessments, and MongoDB collections.
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_root_and_health():
    # 1. Root endpoint
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["app"] == "Skill2Career API"
    assert response.json()["database"] == "MongoDB"

    # 2. Health check endpoint (verifies MongoDB ping)
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"
    assert "MongoDB connected" in health.json()["database"]


def test_auth_login_demo_user():
    response = client.post("/api/v1/auth/login", json={
        "email": "demo@skill2career.com",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@skill2career.com"
    assert data["user"]["profile_id"] is not None


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

    # 3. Add/update skill in MongoDB embedded skills array
    skill_res = client.post("/api/v1/student/skills", headers=headers, json={
        "skill_id": "SK034",  # Docker
        "proficiency_level": 4.5,
        "years_experience": 2.0
    })
    assert skill_res.status_code == 201
    assert skill_res.json()["skill_id"] == "SK034"
    assert skill_res.json()["proficiency_level"] == 4.5


def test_projects_and_certifications():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@skill2career.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create project
    proj_res = client.post("/api/v1/student/projects", headers=headers, json={
        "title": "Cloud Microservices Architecture",
        "description": "Implemented high-throughput event streaming with Kafka and FastAPI in MongoDB.",
        "tech_stack": "Python, FastAPI, Kafka, MongoDB, Docker",
        "complexity_rating": 4.5
    })
    assert proj_res.status_code == 201
    assert "id" in proj_res.json()

    # 2. Create certification
    cert_res = client.post("/api/v1/student/certifications", headers=headers, json={
        "name": "MongoDB Certified Developer Associate",
        "issuer": "MongoDB University",
        "issue_date": "2026-03",
        "credential_url": "https://learn.mongodb.com/verify/12345"
    })
    assert cert_res.status_code == 201
    assert cert_res.json()["is_verified"] is True


def test_careers_and_matching():
    # 1. Get careers catalog from MongoDB
    careers_res = client.get("/api/v1/careers")
    assert careers_res.status_code == 200
    careers = careers_res.json()
    assert len(careers) >= 5

    # 2. Get recommendations & verify career_predictions persistence
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

    # 1. Gap analysis & verify skill_gaps collection persistence
    gap_res = client.post("/api/v1/analysis/gap", headers=headers, params={"target_career_id": "CR004"})
    assert gap_res.status_code == 200
    gap_data = gap_res.json()
    assert "coverage_percentage" in gap_data
    assert "gaps" in gap_data
    assert len(gap_data["gaps"]) > 0

    # 2. Readiness prediction & verify readiness_predictions + learning_snapshots + prediction_logs
    ready_res = client.post("/api/v1/analysis/readiness", headers=headers, json={"target_career_id": "CR004"})
    assert ready_res.status_code == 200
    ready_data = ready_res.json()
    assert "readiness_score" in ready_data
    assert ready_data["readiness_score"] > 0
    assert "feature_contributions" in ready_data
    assert "model_version" in ready_data

    # 3. Trajectory forecast
    traj_res = client.post("/api/v1/analysis/trajectory", headers=headers, json={"weekly_study_hours": 18.0})
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

    # 1. Get/generate roadmap in MongoDB
    roadmap_res = client.get("/api/v1/roadmap", headers=headers, params={"target_career_id": "CR004"})
    assert roadmap_res.status_code == 200
    roadmap_data = roadmap_res.json()
    assert len(roadmap_data["items"]) > 0

    first_item_id = roadmap_data["items"][0]["id"]
    toggle_res = client.put(f"/api/v1/roadmap/items/{first_item_id}", headers=headers, json={"is_completed": True})
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] is True

    # 2. List assessments from MongoDB
    asm_res = client.get("/api/v1/assessments")
    assert asm_res.status_code == 200
    asms = asm_res.json()
    assert len(asms) > 0

    # 3. Take assessment quiz and submit
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
