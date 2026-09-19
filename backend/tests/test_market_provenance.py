"""
Skill2Career - Phase 07: Market Data Provenance Tests
Verifies data provenance metadata, licensing, source citations, and freshness calculations.
"""

import pytest
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.services.market_intelligence_service import MarketIntelligenceService


@pytest.mark.anyio
async def test_market_sources_endpoint_and_provenance():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/market/sources")
        assert res.status_code == 200
        sources = res.json()
        assert len(sources) >= 3

        source_ids = [s["source_id"] for s in sources]
        assert "SRC_BLS_2026" in source_ids
        assert "SRC_SO_DEV_2025" in source_ids

        for s in sources:
            assert "source_name" in s
            assert "provider" in s
            assert "methodology" in s
            assert "license" in s
            assert "quality_level" in s


def test_freshness_calculation_logic():
    now = datetime.now(timezone.utc)

    # 1. Fresh signal (valid until next year)
    future_date = (now + timedelta(days=120)).isoformat()
    freshness = MarketIntelligenceService.calculate_freshness(
        retrieved_at_str=now.isoformat(),
        valid_until_str=future_date
    )
    assert freshness == "fresh"

    # 2. Expiring soon signal (valid for next 15 days)
    soon_date = (now + timedelta(days=15)).isoformat()
    expiring = MarketIntelligenceService.calculate_freshness(
        retrieved_at_str=now.isoformat(),
        valid_until_str=soon_date
    )
    assert expiring == "expiring_soon"

    # 3. Stale signal (expired 10 days ago)
    past_date = (now - timedelta(days=10)).isoformat()
    stale = MarketIntelligenceService.calculate_freshness(
        retrieved_at_str=(now - timedelta(days=200)).isoformat(),
        valid_until_str=past_date
    )
    assert stale == "stale"
