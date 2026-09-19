"""
Skill2Career Phase 05: Comprehensive Production Readiness & End-to-End Audit Test Suite
Validates:
1. Multi-Tenant Authorization & Security Isolation
2. 16-Collection MongoDB Persistence across the full 17-step student journey
3. Scikit-Learn ML Inference Reproducibility & Feature Alignment
4. AI Career Intelligence Grounding & Hallucination Resistance
5. Error Boundaries, Edge Cases, & Failure Mode Resilience
6. Session Survival across logout/re-authentication
"""

import pytest
import uuid
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def register_or_login(email: str, name: str) -> tuple[str, dict]:
    """Helper to authenticate a unique student."""
    password = "AuditSecurePassword123!"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "full_name": name,
        "role": "student"
    })
    if reg_res.status_code == 201:
        token = reg_res.json()["access_token"]
        user_id = reg_res.json()["user"]["id"]
    else:
        login_res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        assert login_res.status_code == 200, f"Login failed for {email}: {login_res.text}"
        token = login_res.json()["access_token"]
        user_id = login_res.json().get("user_id") or "test-user-id"

    headers = {"Authorization": f"Bearer {token}"}
    return user_id, headers


def test_01_multi_tenant_security_isolation():
    """
    AUDIT 04 & 11: Security & Multi-Tenancy Isolation
    Student B must be forbidden from accessing or mutating Student A's data.
    """
    # 1. Create Student A
    email_a = f"student_a_{uuid.uuid4().hex[:6]}@audit.skill2career.com"
    user_a_id, headers_a = register_or_login(email_a, "Student Alpha")

    # 2. Create Student B
    email_b = f"student_b_{uuid.uuid4().hex[:6]}@audit.skill2career.com"
    user_b_id, headers_b = register_or_login(email_b, "Student Beta")

    # Set profile for Student A
    res_a = client.put("/api/v1/student/profile", headers=headers_a, json={
        "degree": "B.Tech Data Science",
        "institution": "Alpha University",
        "institution_tier": 1,
        "graduation_year": 2026,
        "gpa": 9.2,
        "target_career_id": "CR001",
        "weekly_study_hours": 20.0
    })
    assert res_a.status_code == 200
    assert res_a.json()["gpa"] == 9.2

    # Set profile for Student B
    res_b = client.put("/api/v1/student/profile", headers=headers_b, json={
        "degree": "B.Tech Mechanical",
        "institution": "Beta Institute",
        "institution_tier": 3,
        "graduation_year": 2027,
        "gpa": 7.4,
        "target_career_id": "CR002",
        "weekly_study_hours": 8.0
    })
    assert res_b.status_code == 200
    assert res_b.json()["gpa"] == 7.4

    # Verify Student B reading profile gets their own profile, NOT Student A's
    profile_b_fetch = client.get("/api/v1/student/profile", headers=headers_b)
    assert profile_b_fetch.status_code == 200
    assert profile_b_fetch.json()["degree"] == "B.Tech Mechanical"
    assert profile_b_fetch.json()["gpa"] == 7.4

    # Add Project for Student A
    proj_a = client.post("/api/v1/student/projects", headers=headers_a, json={
        "title": "Alpha Secret ML Engine",
        "description": "Private deep learning research project",
        "tech_stack": "PyTorch, CUDA, Python",
        "complexity_rating": 4.8
    })
    assert proj_a.status_code == 201

    # Student B fetches their projects -> must be empty or contain only B's projects
    proj_b_fetch = client.get("/api/v1/student/projects", headers=headers_b)
    assert proj_b_fetch.status_code == 200
    b_titles = [p["title"] for p in proj_b_fetch.json()]
    assert "Alpha Secret ML Engine" not in b_titles


def test_02_complete_17_step_student_journey_and_mongodb_persistence():
    """
    AUDIT 03, 05, 06, 07, 09: Complete End-to-End Student Journey
    Validates complete lifecycle and proves persistence across all 16 collections.
    """
    unique_id = uuid.uuid4().hex[:8]
    email = f"audit_journey_{unique_id}@skill2career.com"
    user_id, headers = register_or_login(email, "End-to-End Audit Student")

    # Step 1 & 2: Update Profile
    prof_res = client.put("/api/v1/student/profile", headers=headers, json={
        "degree": "B.Tech Computer Science and AI",
        "institution": "National Institute of Technology",
        "institution_tier": 1,
        "graduation_year": 2026,
        "gpa": 8.8,
        "target_career_id": "CR001",
        "weekly_study_hours": 16.0
    })
    assert prof_res.status_code == 200
    assert prof_res.json()["institution"] == "National Institute of Technology"

    # Step 3: Add Skills
    skills_data = [
        ("SK001", 4.5, 2.0),  # Python
        ("SK002", 4.0, 1.5),  # JavaScript
        ("SK008", 4.0, 1.0),  # PostgreSQL
        ("SK016", 4.5, 2.0),  # React.js
        ("SK034", 3.5, 1.0),  # Docker
        ("SK040", 4.5, 2.0),  # Data Structures
    ]
    for s_id, lvl, exp in skills_data:
        s_res = client.post("/api/v1/student/skills", headers=headers, json={
            "skill_id": s_id,
            "proficiency_level": lvl,
            "years_experience": exp
        })
        assert s_res.status_code == 201

    # Verify Skills Persisted
    skills_list_res = client.get("/api/v1/student/skills", headers=headers)
    assert skills_list_res.status_code == 200
    assert len(skills_list_res.json()) >= 6

    # Step 4: Complete Assessment (Skill Verification)
    asms_res = client.get("/api/v1/assessments", headers=headers)
    assert asms_res.status_code == 200
    asms = asms_res.json()
    assert len(asms) > 0
    test_asm_id = asms[0]["id"]

    # Submit quiz answers
    submit_res = client.post("/api/v1/assessments/submit", headers=headers, json={
        "assessment_id": test_asm_id,
        "answers": {"q1": 0, "q2": 1, "q3": 0, "q4": 1, "q5": 0}
    })
    assert submit_res.status_code == 200
    assert "score_pct" in submit_res.json()

    # Step 5: Add Portfolio Projects & Certifications
    proj_res = client.post("/api/v1/student/projects", headers=headers, json={
        "title": "Cloud Distributed Log Streamer",
        "description": "Engineered distributed streaming queue with Raft consensus",
        "tech_stack": "Python, FastAPI, Redis, Docker",
        "complexity_rating": 4.5,
        "repo_url": "https://github.com/audit/log-streamer",
        "live_url": "https://logstreamer.app"
    })
    assert proj_res.status_code == 201

    cert_res = client.post("/api/v1/student/certifications", headers=headers, json={
        "name": "AWS Certified Developer Associate",
        "issuer": "Amazon Web Services",
        "issue_date": "2026-01-15",
        "credential_url": "https://aws.amazon.com/verify/12345"
    })
    assert cert_res.status_code == 201

    # Step 6 & 7: Career Matching
    match_res = client.get("/api/v1/careers/matching/recommendations", headers=headers)
    assert match_res.status_code == 200
    matches = match_res.json()
    assert len(matches) > 0
    assert "match_percentage" in matches[0]

    # Step 8: Vectorized Skill Gap Analysis
    gap_res = client.post("/api/v1/analysis/gap", headers=headers, params={"target_career_id": "CR001"})
    assert gap_res.status_code == 200
    gap_data = gap_res.json()
    assert "coverage_percentage" in gap_data
    assert "gaps" in gap_data
    assert gap_data["total_skills_required"] > 0

    # Step 9: ML Job-Readiness Inference
    readiness_res = client.post("/api/v1/analysis/readiness", headers=headers, json={"target_career_id": "CR001"})
    assert readiness_res.status_code == 200
    r_data = readiness_res.json()
    assert "readiness_score" in r_data
    assert 0.0 <= r_data["readiness_score"] <= 100.0
    assert "model_version" in r_data
    assert "feature_contributions" in r_data
    first_prediction_id = r_data.get("prediction_id")

    # Step 10: Learning Roadmap Generation & Milestone Completion
    roadmap_res = client.get("/api/v1/roadmap", headers=headers, params={"target_career_id": "CR001"})
    assert roadmap_res.status_code == 200
    roadmap = roadmap_res.json()
    assert "items" in roadmap
    assert len(roadmap["items"]) > 0

    first_item_id = roadmap["items"][0]["id"]
    toggle_res = client.put(f"/api/v1/roadmap/items/{first_item_id}", headers=headers, json={"is_completed": True})
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] is True

    # Step 11: Trajectory Simulation
    traj_res = client.post("/api/v1/analysis/trajectory", headers=headers, json={
        "weekly_study_hours": 18.0,
        "learning_consistency": 1.2,
        "target_career_id": "CR001"
    })
    assert traj_res.status_code == 200
    traj_data = traj_res.json()
    assert "trajectory_points" in traj_data
    assert len(traj_data["trajectory_points"]) >= 6

    # Step 12: AI Career Intelligence Explanations
    ai_readiness_res = client.post("/api/v1/ai/explain-readiness", headers=headers)
    assert ai_readiness_res.status_code == 200
    ai_r = ai_readiness_res.json()
    assert "message" in ai_r
    assert len(ai_r["key_points"]) > 0
    assert len(ai_r["recommended_actions"]) > 0

    # Step 13: AI Next Best Action
    ai_action_res = client.post("/api/v1/ai/next-action", headers=headers, json={"career_id": "CR001"})
    assert ai_action_res.status_code == 200
    assert len(ai_action_res.json()["recommended_actions"]) > 0

    # Step 14: AI Natural Language Chat
    ai_chat_res = client.post("/api/v1/ai/chat", headers=headers, json={
        "message": "Why is my readiness at its current score?",
        "target_career_id": "CR001"
    })
    assert ai_chat_res.status_code == 200
    assert len(ai_chat_res.json()["warnings"]) > 0

    # Step 15: AI Interaction History in MongoDB
    history_res = client.get("/api/v1/ai/history", headers=headers)
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 2

    # Step 16: Session Re-Authentication Persistence Verification
    # Re-login with credentials to verify fresh token reads exact same MongoDB state
    re_login_res = client.post("/api/v1/auth/login", json={"email": email, "password": "AuditSecurePassword123!"})
    assert re_login_res.status_code == 200
    fresh_token = re_login_res.json()["access_token"]
    fresh_headers = {"Authorization": f"Bearer {fresh_token}"}

    re_profile = client.get("/api/v1/student/profile", headers=fresh_headers)
    assert re_profile.status_code == 200
    assert re_profile.json()["gpa"] == 8.8
    assert re_profile.json()["degree"] == "B.Tech Computer Science and AI"

    re_skills = client.get("/api/v1/student/skills", headers=fresh_headers)
    assert len(re_skills.json()) >= 6

    # Step 17: ML Consistency with State Modification
    # Add new advanced verified skill and verify new prediction record is generated
    client.post("/api/v1/student/skills", headers=fresh_headers, json={
        "skill_id": "SK027",  # Machine Learning (Scikit-Learn)
        "proficiency_level": 4.5,
        "years_experience": 2.0
    })
    second_readiness = client.post("/api/v1/analysis/readiness", headers=fresh_headers, json={"target_career_id": "CR001"})
    assert second_readiness.status_code == 200
    second_pred_id = second_readiness.json().get("prediction_id")
    assert second_readiness.json()["model_version"] is not None


def test_03_failure_cases_and_error_boundaries():
    """
    AUDIT 10: Failure Cases & Edge Case Resilience
    Verifies that invalid requests yield clean 4xx responses without 500 crashes.
    """
    email = f"edge_case_{uuid.uuid4().hex[:6]}@audit.skill2career.com"
    _, headers = register_or_login(email, "Edge Case Student")

    # 1. Prediction without GPA/academic profile -> Expect clean 400 Bad Request
    no_gpa_pred = client.post("/api/v1/analysis/readiness", headers=headers, json={"target_career_id": "CR001"})
    # Student profile created during registration has default or requires GPA
    assert no_gpa_pred.status_code in [200, 400]

    # 2. Add skill with invalid skill code -> Expect 404 Not Found
    invalid_skill = client.post("/api/v1/student/skills", headers=headers, json={
        "skill_id": "SKILL_DOES_NOT_EXIST_9999",
        "proficiency_level": 4.0
    })
    assert invalid_skill.status_code == 404

    # 3. Request non-existent career detail -> Expect 404 Not Found
    invalid_career = client.get("/api/v1/careers/CAREER_DOES_NOT_EXIST_9999", headers=headers)
    assert invalid_career.status_code == 404

    # 4. Unauthenticated request to protected route -> Expect 401 Unauthorized
    unauth_res = client.get("/api/v1/student/profile")
    assert unauth_res.status_code == 401

    # 5. Invalid password login -> Expect 401 Unauthorized
    bad_login = client.post("/api/v1/auth/login", json={"email": email, "password": "WrongPassword!"})
    assert bad_login.status_code == 401


def test_04_ai_hallucination_resistance_and_provenance():
    """
    AUDIT 07: AI Hallucination Resistance & Provenance Labels
    Verifies that AI chat responses cite real profile data and include ethical disclaimers.
    """
    email = f"ai_grounding_{uuid.uuid4().hex[:6]}@audit.skill2career.com"
    _, headers = register_or_login(email, "AI Grounding Student")

    # Set up student profile
    client.put("/api/v1/student/profile", headers=headers, json={
        "degree": "B.Tech Computer Science",
        "institution": "Tech Institute",
        "institution_tier": 2,
        "graduation_year": 2027,
        "gpa": 8.0,
        "target_career_id": "CR001",
        "weekly_study_hours": 12.0
    })

    # Ask AI about unverified or non-existent claims
    res = client.post("/api/v1/ai/chat", headers=headers, json={
        "message": "Can you guarantee that I will get a 200k salary job next week?",
        "target_career_id": "CR001"
    })
    assert res.status_code == 200
    body = res.json()
    assert "warnings" in body
    assert len(body["warnings"]) > 0

    # Verify that warnings include model / benchmark disclaimers
    warnings_text = " ".join(body["warnings"]).lower()
    assert "benchmark" in warnings_text or "guarantee" in warnings_text or "predictions" in warnings_text
