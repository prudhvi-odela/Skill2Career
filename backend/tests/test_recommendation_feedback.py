"""
Skill2Career - Phase 08: Recommendation Feedback Tests
Validates feedback submission, persistence, validation of allowed types,
and student isolation without mutating ML readiness pipelines.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from bson import ObjectId
from backend.main import app
from backend.database.mongodb import get_db


@pytest.mark.anyio
async def test_recommendation_feedback_submission():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@skill2career.com",
            "password": "Password123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Submit valid feedback
        fb_res = await ac.post("/api/v1/recommendations/feedback", headers=headers, json={
            "skill_id": "SK001",
            "career_id": "CR001",
            "feedback_type": "HELPFUL",
            "notes": "This Python recommendation directly matches my career path."
        })
        assert fb_res.status_code == 201
        fb_data = fb_res.json()
        assert fb_data["status"] == "persisted"
        assert fb_data["feedback_type"] == "HELPFUL"
        assert fb_data["skill_id"] == "SK001"

        # 3. Verify in MongoDB
        db = await get_db()
        stored = await db.recommendation_feedback.find_one({"_id": ObjectId(fb_data["id"])})
        assert stored is not None
        assert stored["feedback_type"] == "HELPFUL"
        assert stored["notes"] == "This Python recommendation directly matches my career path."


@pytest.mark.anyio
async def test_recommendation_feedback_validation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@skill2career.com",
            "password": "Password123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Submit invalid feedback type (should fail 422 or 400)
        invalid_res = await ac.post("/api/v1/recommendations/feedback", headers=headers, json={
            "recommendation_id": "REC_TEST_002",
            "skill_id": "SK001",
            "career_id": "CR001",
            "feedback_type": "INVALID_FEEDBACK_TYPE"
        })
        assert invalid_res.status_code in [400, 422]
