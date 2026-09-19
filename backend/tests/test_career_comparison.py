"""
Skill2Career - Phase 07: Multi-Career Comparison Tests
Verifies multi-dimensional comparison across 2 to 5 careers without declaring an objectively best option.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app


@pytest.mark.anyio
async def test_career_comparison_requires_at_least_two_careers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "demo@skill2career.com", "password": "Password123!"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Request with only 1 career ID should fail validation
        res = await ac.post(
            "/api/v1/market/career-comparison",
            json={"career_ids": ["CR001"]},
            headers=headers
        )
        assert res.status_code in [400, 422]


@pytest.mark.anyio
async def test_career_comparison_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "demo@skill2career.com", "password": "Password123!"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Compare 3 careers: CR001 (Full-Stack), CR003 (Backend), CR004 (ML Engineer)
        res = await ac.post(
            "/api/v1/market/career-comparison",
            json={"career_ids": ["CR001", "CR003", "CR004"]},
            headers=headers
        )
        assert res.status_code == 200
        data = res.json()
        assert len(data["comparisons"]) == 3
        assert "provenance_disclaimer" in data
        assert "data_sources" in data

        for item in data["comparisons"]:
            assert item["career_id"] in ["CR001", "CR003", "CR004"]
            assert 0.0 <= item["existing_skill_match_pct"] <= 100.0
            assert 0.0 <= item["market_demand_score"] <= 100.0
            assert item["avg_salary_usd"] > 0
            assert item["salary_provenance"] == "Industry Benchmark Data"
            assert item["data_freshness"] in ["fresh", "expiring_soon", "stale"]
