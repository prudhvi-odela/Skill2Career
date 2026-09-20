"""
Skill2Career - Production FastAPI Startup & Lifespan Integrity Tests
Verifies that FastAPI lifespan startup is fast, non-blocking, does not perform
automatic database reseeding on every startup, and that /api/health and timeout
safety remain intact.
"""

import time
import pytest
from unittest.mock import patch
from httpx import AsyncClient, ASGITransport
from backend.main import app, lifespan
from backend.database.mongodb import db_manager, connect_to_mongo
from backend.config import settings


@pytest.mark.anyio
async def test_fastapi_lifespan_startup_speed_and_no_auto_seed():
    """
    Verifies that the application lifespan enters and exits quickly without calling seed_database.
    """
    start_time = time.monotonic()
    with patch("backend.database.seed.seed_database") as mock_seed:
        async with lifespan(app):
            elapsed = time.monotonic() - start_time
            # Lifespan entry must be nearly instantaneous (< 2.0 seconds)
            assert elapsed < 2.0, f"Lifespan startup took {elapsed:.2f}s, which exceeds fast startup threshold"
            # seed_database must NOT be executed during application startup
            mock_seed.assert_not_called()


@pytest.mark.anyio
async def test_mongodb_client_timeout_configuration():
    """
    Verifies that AsyncMongoClient is configured with explicit connection and server selection timeouts.
    """
    await connect_to_mongo()
    client = db_manager.client
    assert client is not None
    # Verify timeout settings are configured (5.0s / 5000ms)
    assert client.options.server_selection_timeout == 5.0
    assert client.options.pool_options.connect_timeout == 10.0


@pytest.mark.anyio
async def test_api_health_endpoint_comprehensive_status():
    """
    Verifies that /api/health responds with 200 and comprehensive diagnostic telemetry.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "database" in data
        assert "MongoDB connected" in data["database"]
        assert "ml_models" in data
        assert "loaded" in data["ml_models"]
        assert "ai_engine" in data
        assert "environment" in data
