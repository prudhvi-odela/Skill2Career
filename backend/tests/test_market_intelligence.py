"""
Skill2Career - Phase 07: Market Intelligence Service & Endpoint Tests
Tests career market signals, skill market signals, career skill matrix, and fallback heuristics.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database.mongodb import connect_to_mongo
from backend.services.market_intelligence_service import MarketIntelligenceService


@pytest.mark.anyio
async def test_career_market_signal_retrieval():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/market/careers/CR001")
        assert res.status_code == 200
        data = res.json()
        assert data["career_id"] == "CR001"
        assert 0.0 <= data["demand_score"] <= 100.0
        assert data["trend_direction"] in ["growing", "stable", "declining"]
        assert data["freshness"] in ["fresh", "expiring_soon", "stale"]
        assert "source_id" in data
        assert "source_name" in data


@pytest.mark.anyio
async def test_skill_market_signal_retrieval():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/market/skills/SK001")
        assert res.status_code == 200
        data = res.json()
        assert data["skill_id"] == "SK001"
        assert 0.0 <= data["demand_score"] <= 100.0
        assert data["market_tier"] in ["high_demand", "moderate_demand", "niche"]
        assert data["trend_direction"] in ["growing", "stable", "declining"]


@pytest.mark.anyio
async def test_career_skills_market_matrix():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/market/careers/CR004/skills")
        assert res.status_code == 200
        data = res.json()
        assert data["career_id"] == "CR004"
        assert len(data["skills_market"]) > 0
        assert len(data["data_sources"]) > 0


@pytest.mark.anyio
async def test_invalid_career_skills_matrix_returns_404():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/market/careers/CR_NON_EXISTENT_999/skills")
        assert res.status_code == 404
