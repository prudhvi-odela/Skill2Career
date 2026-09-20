"""
Tests for Skill2Career 2.0 Daily Learning Loop
Verifies session logging, study hours accumulation, 5-question quick check grading,
evidence recording, and learning snapshots.
"""

import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from backend.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


async def _register_student(client: AsyncClient, prefix: str = "daily"):
    suffix = uuid.uuid4().hex[:8]
    res = await client.post("/api/v1/auth/register", json={
        "email": f"{prefix}_{suffix}@example.com",
        "password": "SecurePassword123!",
        "full_name": f"{prefix.capitalize()} {suffix}",
        "role": "student"
    })
    assert res.status_code == 201, res.text
    data = res.json()
    return data["access_token"], data["user"]["id"]


@pytest.mark.anyio
async def test_daily_learning_session_and_quick_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await _register_student(client, "dailystud")
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Log Session with quick check requested
        log_res = await client.post(
            "/api/v1/learning-intelligence/log-session",
            headers=headers,
            json={
                "topic": "Graph Algorithms and BFS",
                "duration_minutes": 60,
                "activity_type": "SELF_STUDY",
                "confidence_level": 4,
                "notes": "Studied adjacency list representations.",
                "skills": ["SK040"],
                "take_quick_check": True
            }
        )
        assert log_res.status_code == 201
        log_data = log_res.json()
        assert log_data["quick_check_offered"]
        assert len(log_data["quick_check_questions"]) == 5

        # 2. Submit Quick Check answers
        sess_id = log_data["session_id"]
        qc_res = await client.post(
            "/api/v1/learning-intelligence/quick-check/submit",
            headers=headers,
            json={
                "session_id": sess_id,
                "topic": "Graph Algorithms and BFS",
                "skills": ["SK040"],
                "answers": {"qc_1": 0, "qc_2": 0, "qc_3": 0, "qc_4": 0, "qc_5": 0}
            }
        )
        assert qc_res.status_code == 200
        qc_data = qc_res.json()
        assert qc_data["score_percentage"] == 100.0
        assert qc_data["passed"]
        assert qc_data["evidence_recorded"]
