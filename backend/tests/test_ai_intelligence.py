"""
Skill2Career AI Career Intelligence Test Suite
Tests grounded context building, explainability, deterministic fallback,
conversational chat, and interaction persistence in MongoDB via FastAPI TestClient.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def get_auth_token():
    """Logs in or registers a test student and returns auth headers."""
    email = "ai_test_student@skill2career.com"
    password = "SecurePassword123!"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "AI Intelligence Student",
        "role": "student"
    })
    if reg_res.status_code == 201:
        token = reg_res.json()["access_token"]
    else:
        login_res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_ai_career_intelligence_full_suite():
    """
    End-to-end test validating:
    1. Student profile & skills setup
    2. POST /api/v1/ai/explain-readiness
    3. POST /api/v1/ai/explain-gap
    4. POST /api/v1/ai/next-action
    5. POST /api/v1/ai/explain-career
    6. POST /api/v1/ai/explain-trajectory
    7. POST /api/v1/ai/chat (natural language grounding)
    8. GET /api/v1/ai/history (MongoDB interaction persistence)
    """
    headers = get_auth_token()

    # 1. Ensure student profile and skills are configured
    client.put("/api/v1/student/profile", headers=headers, json={
        "degree": "B.Tech Computer Science",
        "institution": "Tech University",
        "institution_tier": 1,
        "graduation_year": 2026,
        "gpa": 8.5,
        "target_career_id": "CR001",
        "weekly_study_hours": 16.0
    })

    client.post("/api/v1/student/skills", headers=headers, json={
        "skill_id": "SK001",
        "proficiency_level": 4.5,
        "years_experience": 2.0
    })
    client.post("/api/v1/student/skills", headers=headers, json={
        "skill_id": "SK009",
        "proficiency_level": 4.0,
        "years_experience": 1.5
    })

    # Trigger ML readiness prediction first so authoritative result is cached
    readiness_res = client.post("/api/v1/analysis/readiness", headers=headers, json={"target_career_id": "CR001"})
    assert readiness_res.status_code == 200, f"Readiness prediction failed: {readiness_res.text}"
    readiness_data = readiness_res.json()
    assert "readiness_score" in readiness_data

    # 2. Test Explain Readiness
    explain_res = client.post("/api/v1/ai/explain-readiness", headers=headers)
    assert explain_res.status_code == 200, f"Explain readiness failed: {explain_res.text}"
    exp_body = explain_res.json()
    assert "message" in exp_body
    assert len(exp_body["message"]) > 15
    assert len(exp_body["key_points"]) > 0
    assert len(exp_body["recommended_actions"]) > 0
    assert exp_body["context_type"] == "readiness_explanation"

    # 3. Test Explain Skill Gap
    gap_res = client.post("/api/v1/ai/explain-gap", headers=headers, json={"career_id": "CR001"})
    assert gap_res.status_code == 200, f"Explain gap failed: {gap_res.text}"
    gap_body = gap_res.json()
    assert "message" in gap_body
    assert gap_body["context_type"] == "skill_gap_explanation"
    assert len(gap_body["referenced_careers"]) > 0

    # 4. Test Next Best Action
    action_res = client.post("/api/v1/ai/next-action", headers=headers, json={"career_id": "CR001"})
    assert action_res.status_code == 200, f"Next action failed: {action_res.text}"
    act_body = action_res.json()
    assert len(act_body["recommended_actions"]) > 0
    assert act_body["context_type"] == "next_action"

    # 5. Test Explain Career Match
    career_res = client.post("/api/v1/ai/explain-career", headers=headers, json={"career_id": "CR001"})
    assert career_res.status_code == 200, f"Explain career failed: {career_res.text}"
    car_body = career_res.json()
    assert "message" in car_body
    assert car_body["context_type"] == "career_explanation"

    # 6. Test Explain Trajectory
    traj_res = client.post("/api/v1/ai/explain-trajectory", headers=headers, json={
        "weekly_hours": 20.0,
        "consistency": 1.2
    })
    assert traj_res.status_code == 200, f"Explain trajectory failed: {traj_res.text}"
    traj_body = traj_res.json()
    assert "message" in traj_body
    assert traj_body["context_type"] == "trajectory_explanation"

    # 7. Test Career Chat (Natural language grounded queries)
    chat_res = client.post("/api/v1/ai/chat", headers=headers, json={
        "message": "Why am I not ready for this role and what projects should I build?",
        "target_career_id": "CR001"
    })
    assert chat_res.status_code == 200, f"Chat failed: {chat_res.text}"
    chat_body = chat_res.json()
    assert "message" in chat_body
    assert len(chat_body["key_points"]) > 0
    assert len(chat_body["recommended_actions"]) > 0
    assert len(chat_body["warnings"]) > 0
    assert chat_body["context_type"] == "career_chat"

    # 8. Test Interaction Persistence in MongoDB
    history_res = client.get("/api/v1/ai/history", headers=headers)
    assert history_res.status_code == 200, f"History fetch failed: {history_res.text}"
    history = history_res.json()
    assert isinstance(history, list)
    assert len(history) >= 1
    assert history[0]["user_message"] is not None
    assert history[0]["assistant_response"] is not None
