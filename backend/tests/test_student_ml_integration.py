"""
Skill2Career - End-to-End Student to ML Pipeline Integration Tests
Validates real MongoDB student profile -> feature extraction -> model inference -> explainability -> persistence.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_full_student_ml_pipeline_integration():
    # 1. Register a fresh student account
    email = "integration_student@skill2career.com"
    password = "SecurePassword123!"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Alex Integration Student",
        "role": "student"
    })
    # If already registered in a previous run, log in
    if reg_res.status_code == 201:
        token = reg_res.json()["access_token"]
    else:
        login_res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Update Student Profile (GPA, Degree, Institution, Study commitment)
    profile_update_res = client.put("/api/v1/student/profile", headers=headers, json={
        "degree": "B.Tech Computer Science",
        "institution": "Apex Institute of Technology",
        "institution_tier": 1,
        "graduation_year": 2026,
        "gpa": 8.9,
        "target_career_id": "CR001",
        "weekly_study_hours": 18.0
    })
    assert profile_update_res.status_code == 200
    assert profile_update_res.json()["gpa"] == 8.9

    # 3. Add Verified & Technical Skills
    skills_to_add = [
        ("SK001", 4.5),  # Python
        ("SK002", 4.0),  # JavaScript
        ("SK016", 4.5),  # React.js
        ("SK034", 4.0),  # Docker
        ("SK040", 4.5),  # Data Structures & Algorithms
        ("SK041", 4.0),  # Object-Oriented Programming
        ("SK042", 3.5),  # System Design
        ("SK046", 4.5),  # Git & GitHub
    ]
    for s_id, lvl in skills_to_add:
        s_res = client.post("/api/v1/student/skills", headers=headers, json={
            "skill_id": s_id,
            "proficiency_level": lvl,
            "years_experience": 1.5
        })
        assert s_res.status_code == 201

    # 4. Add Projects to MongoDB
    p1_res = client.post("/api/v1/student/projects", headers=headers, json={
        "title": "Distributed Cloud Data Pipeline",
        "description": "High-throughput asynchronous ETL pipeline built with Python, FastAPI, and MongoDB.",
        "tech_stack": "Python, FastAPI, MongoDB, Docker",
        "complexity_rating": 4.5
    })
    assert p1_res.status_code == 201

    p2_res = client.post("/api/v1/student/projects", headers=headers, json={
        "title": "NextGen Career AI Platform",
        "description": "Interactive career recommendation engine with real-time ML readiness scoring.",
        "tech_stack": "React, TypeScript, Scikit-Learn, PyMongo",
        "complexity_rating": 4.0
    })
    assert p2_res.status_code == 201

    # 5. Add Certification to MongoDB
    c_res = client.post("/api/v1/student/certifications", headers=headers, json={
        "name": "AWS Certified Solutions Architect",
        "issuer": "Amazon Web Services",
        "issue_date": "2026-02",
        "credential_url": "https://aws.amazon.com/verify/12345"
    })
    assert c_res.status_code == 201

    # 6. Submit Technical Assessment
    asm_res = client.get("/api/v1/assessments")
    assert asm_res.status_code == 200
    asms = asm_res.json()
    if len(asms) > 0:
        first_asm = asms[0]
        quiz_res = client.get(f"/api/v1/assessments/{first_asm['id']}")
        quiz = quiz_res.json()
        answers = {q["id"]: 0 for q in quiz["questions"]}
        sub_res = client.post("/api/v1/assessments/submit", headers=headers, json={
            "assessment_id": first_asm["id"],
            "answers": answers
        })
        assert sub_res.status_code == 200

    # 7. Execute Real Readiness Prediction from MongoDB Documents
    readiness_res = client.post("/api/v1/analysis/readiness", headers=headers, json={
        "target_career_id": "CR001"
    })
    assert readiness_res.status_code == 200
    r_data = readiness_res.json()

    # Verify structured fields
    assert "prediction_id" in r_data and r_data["prediction_id"] is not None
    assert 0.0 <= r_data["readiness_score"] <= 100.0
    assert r_data["readiness_tier"] in ["Early Stage", "Developing", "Strong Candidate", "Job Ready"]
    assert "model_version" in r_data
    assert len(r_data["top_strengths"]) > 0
    assert len(r_data["feature_breakdown"]) > 0
    assert r_data["career"]["id"] == "CR001"


    # 8. Verify Career Matching Persistence
    match_res = client.get("/api/v1/careers/match", headers=headers)
    assert match_res.status_code == 200
    matches = match_res.json()
    assert len(matches) > 0
    assert 0.0 <= matches[0]["match_percentage"] <= 100.0
    assert "rank" in matches[0]


    # 9. Verify Skill Gap Persistence
    gap_res = client.post("/api/v1/analysis/gap", headers=headers, params={"target_career_id": "CR001"})
    assert gap_res.status_code == 200
    gap_data = gap_res.json()
    assert "coverage_percentage" in gap_data
    assert len(gap_data["gaps"]) > 0

    # 10. Verify Prediction History Retrieval
    hist_res = client.get("/api/v1/analysis/history", headers=headers)
    assert hist_res.status_code == 200
    hist = hist_res.json()
    assert len(hist) > 0
    assert hist[0]["prediction_id"] == r_data["prediction_id"]
    assert hist[0]["readiness_score"] == r_data["readiness_score"]
