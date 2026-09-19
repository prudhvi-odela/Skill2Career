"""
Skill2Career - Phase 07: Student-vs-Market Gap Analysis Tests
Verifies transparent skill gap prioritization combining student competency and market signals.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app


@pytest.mark.anyio
async def test_student_market_analysis_unauthenticated_rejected():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/v1/market/student-analysis", json={"target_career_id": "CR001"})
        assert res.status_code == 401


@pytest.mark.anyio
async def test_student_market_analysis_authenticated_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login demo user
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "demo@skill2career.com", "password": "Password123!"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Execute student-vs-market analysis
        res = await ac.post(
            "/api/v1/market/student-analysis",
            json={"target_career_id": "CR004"},
            headers=headers
        )
        assert res.status_code == 200
        data = res.json()
        assert data["target_career_id"] == "CR004"
        assert 0.0 <= data["ml_readiness_benchmark_score"] <= 100.0
        assert data["career_market_demand"] >= 80.0
        assert len(data["analyzed_skill_gaps"]) > 0

        first_gap = data["analyzed_skill_gaps"][0]
        assert "skill_name" in first_gap
        assert "gap" in first_gap
        assert "market_demand_score" in first_gap
        assert "priority_reason" in first_gap
        assert "source_provenance" in first_gap
        assert first_gap["priority_level"] in ["URGENT", "HIGH", "MODERATE", "LOW"]
