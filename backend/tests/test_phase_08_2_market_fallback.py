"""
Skill2Career - Phase 08.2 Market Signal Fallback & Provenance Integrity Tests
Validates that missing, stale, expiring, and unavailable market intelligence signals
are correctly classified, never fabricated as real market observations, and do not mutate ML readiness.
"""

import pytest
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database.mongodb import get_db
from backend.services.market_intelligence_service import MarketIntelligenceService
from backend.services.recommendation_service import RecommendationService
from backend.services.ai_context_builder import build_student_ai_context


def test_freshness_calculation_states():
    """Verify freshness calculation for FRESH, EXPIRING_SOON, STALE, and UNAVAILABLE states."""
    now = datetime.now(timezone.utc)
    
    # 1. Unavailable when timestamps are missing
    assert MarketIntelligenceService.calculate_freshness(None, None) == "unavailable"
    assert MarketIntelligenceService.calculate_freshness("", "") == "unavailable"
    assert MarketIntelligenceService.calculate_freshness("invalid-date", "invalid-date") == "unavailable"
    
    # 2. Fresh when valid_until is far in the future
    future_date = (now + timedelta(days=90)).isoformat()
    past_retrieved = (now - timedelta(days=10)).isoformat()
    assert MarketIntelligenceService.calculate_freshness(past_retrieved, future_date) == "fresh"
    
    # 3. Expiring soon when valid_until is within 30 days
    expiring_date = (now + timedelta(days=15)).isoformat()
    assert MarketIntelligenceService.calculate_freshness(past_retrieved, expiring_date) == "expiring_soon"
    
    # 4. Stale when valid_until has passed
    stale_date = (now - timedelta(days=10)).isoformat()
    assert MarketIntelligenceService.calculate_freshness(past_retrieved, stale_date) == "stale"


@pytest.mark.anyio
async def test_missing_career_market_signal_fallback_integrity():
    """Verify that an unobserved career returns an honest fallback with zero fake provenance."""
    market_svc = MarketIntelligenceService()
    db = await get_db()
    
    signal = await market_svc.get_career_market_signal("NON_EXISTENT_CAREER_999", db)
    
    assert signal is not None
    assert signal["is_fallback"] is True
    assert signal["demand_score"] == 75.0
    assert signal["trend_direction"] == "unobserved"
    assert signal["freshness"] == "unavailable"
    assert signal["sample_size"] is None
    assert signal["source_id"] is None
    assert signal["retrieved_at"] is None
    assert signal["valid_until"] is None
    assert signal["source_name"] == "Neutral Baseline Fallback"
    assert signal["data_quality"] == "Unobserved Fallback"


@pytest.mark.anyio
async def test_missing_skill_market_signal_fallback_integrity():
    """Verify that an unobserved skill returns an honest fallback with zero fake provenance."""
    market_svc = MarketIntelligenceService()
    db = await get_db()
    
    signal = await market_svc.get_skill_market_signal("SK_NON_EXISTENT_999", db)
    
    assert signal is not None
    assert signal["is_fallback"] is True
    assert signal["demand_score"] == 75.0
    assert signal["trend_direction"] == "unobserved"
    assert signal["freshness"] == "unavailable"
    assert signal["sample_size"] is None
    assert signal["source_id"] is None
    assert signal["retrieved_at"] is None
    assert signal["valid_until"] is None
    assert signal["market_tier"] == "unobserved"
    assert signal["source_name"] == "Neutral Baseline Fallback"


@pytest.mark.anyio
async def test_recommendation_with_missing_market_signal():
    """Verify recommendation engine handles missing market signals safely without claiming external evidence."""
    rec_svc = RecommendationService()
    db = await get_db()
    
    demo_user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    assert demo_user is not None
    user_id = str(demo_user.get("_id") or demo_user.get("id"))
    
    # Generate recommendations for a role
    recs = await rec_svc.generate_recommendations_for_student(
        student_id=user_id,
        career_id="CR001",
        db=db
    )
    
    assert len(recs) > 0
    for r in recs:
        assert "is_market_fallback" in r
        assert "market_signal_status" in r
        assert r["market_signal_status"] in ["OBSERVED", "FALLBACK_UNAVAILABLE", "STALE", "EXPIRING_SOON"]
        
        if r["is_market_fallback"]:
            assert "Market demand signal unavailable" in r["rationale"] or "neutral baseline" in r["rationale"]
            assert "Neutral Baseline Fallback" in r["source_references"]


def test_rationale_generator_provenance_honesty():
    """Verify generate_rationale wording across fallback, stale, expiring, and observed states."""
    # 1. Fallback State
    fb_rationale = RecommendationService.generate_rationale(
        skill_name="Kubernetes",
        career_title="DevOps Engineer",
        student_level=1.0,
        target_level=4.0,
        gap=3.0,
        band="URGENT",
        market_demand=75.0,
        prereqs_met=True,
        downstream_count=2,
        is_market_fallback=True,
        market_signal_status="FALLBACK_UNAVAILABLE"
    )
    assert "Market signal unavailable; prioritized using neutral baseline benchmark (75.0)." in fb_rationale
    assert "confirms role demand" not in fb_rationale

    # 2. Stale State
    stale_rationale = RecommendationService.generate_rationale(
        skill_name="Kubernetes",
        career_title="DevOps Engineer",
        student_level=1.0,
        target_level=4.0,
        gap=3.0,
        band="HIGH",
        market_demand=88.0,
        prereqs_met=True,
        downstream_count=1,
        is_market_fallback=False,
        market_signal_status="STALE"
    )
    assert "STALE archive benchmark" in stale_rationale

    # 3. Expiring Soon State
    exp_rationale = RecommendationService.generate_rationale(
        skill_name="Kubernetes",
        career_title="DevOps Engineer",
        student_level=1.0,
        target_level=4.0,
        gap=3.0,
        band="HIGH",
        market_demand=88.0,
        prereqs_met=True,
        downstream_count=1,
        is_market_fallback=False,
        market_signal_status="EXPIRING_SOON"
    )
    assert "EXPIRING SOON" in exp_rationale

    # 4. Observed Fresh State
    obs_rationale = RecommendationService.generate_rationale(
        skill_name="Kubernetes",
        career_title="DevOps Engineer",
        student_level=1.0,
        target_level=4.0,
        gap=3.0,
        band="HIGH",
        market_demand=95.0,
        prereqs_met=True,
        downstream_count=1,
        is_market_fallback=False,
        market_signal_status="OBSERVED"
    )
    assert "External market demand signal (95.0/100) confirms role demand." in obs_rationale


@pytest.mark.anyio
async def test_ai_context_builder_market_provenance():
    """Verify AI context builder includes exact is_fallback status and avoids fake market telemetry."""
    db = await get_db()
    demo_user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    assert demo_user is not None
    user_id = str(demo_user.get("_id") or demo_user.get("id"))
    
    context = await build_student_ai_context(user_id=user_id, db=db, target_career_id="CR001")
    
    assert "market_intelligence" in context
    mkt = context["market_intelligence"]
    assert mkt is not None
    assert "is_fallback" in mkt
    assert isinstance(mkt["is_fallback"], bool)
    assert "data_freshness" in mkt


@pytest.mark.anyio
async def test_market_endpoints_fallback_and_observed_api():
    """Verify HTTP market endpoints correctly serialize observed vs fallback responses."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Observed career signal
        res_obs = await ac.get("/api/v1/market/careers/CR001")
        assert res_obs.status_code == 200
        data_obs = res_obs.json()
        assert data_obs["career_id"] == "CR001"
        assert data_obs["is_fallback"] is False
        assert data_obs["freshness"] in ["fresh", "expiring_soon", "stale"]
        assert data_obs["sample_size"] is not None
        assert data_obs["source_id"] is not None

        # 2. Fallback career signal for non-existent role
        res_fb = await ac.get("/api/v1/market/careers/CR_UNKNOWN_999")
        assert res_fb.status_code == 200
        data_fb = res_fb.json()
        assert data_fb["career_id"] == "CR_UNKNOWN_999"
        assert data_fb["is_fallback"] is True
        assert data_fb["freshness"] == "unavailable"
        assert data_fb["sample_size"] is None
        assert data_fb["source_id"] is None
        assert data_fb["source_name"] == "Neutral Baseline Fallback"

        # 3. Fallback skill signal for non-existent skill
        res_sk_fb = await ac.get("/api/v1/market/skills/SK_UNKNOWN_999")
        assert res_sk_fb.status_code == 200
        data_sk_fb = res_sk_fb.json()
        assert data_sk_fb["skill_id"] == "SK_UNKNOWN_999"
        assert data_sk_fb["is_fallback"] is True
        assert data_sk_fb["freshness"] == "unavailable"
        assert data_sk_fb["sample_size"] is None
        assert data_sk_fb["source_id"] is None
        assert data_sk_fb["market_tier"] == "unobserved"
