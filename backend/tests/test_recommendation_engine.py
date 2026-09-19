"""
Skill2Career - Phase 08: Deterministic Recommendation Engine Tests
Validates transparent priority formula calculation, normalization, band thresholds,
learning effort heuristics, missing signal handling, and recommendation endpoints.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.services.recommendation_service import RecommendationService
from backend.database.mongodb import get_db


def test_priority_score_and_band_formula():
    service = RecommendationService()

    # Priority formula weights:
    # 0.30 * S_gap + 0.25 * S_career + 0.20 * S_market + 0.15 * S_dep + 0.10 * S_feas
    
    # Case 1: Urgent priority (large gap, core skill, high market, blocking many, prereqs ready)
    # S_gap = (4.0 / 5.0) * 100 = 80.0
    # S_career = 0.95 * 100 = 95.0
    # S_market = 90.0
    # S_dep = min(100.0, 4 * 25.0) = 100.0
    # S_feas = 100.0 * 0.70 + 30.0 = 100.0
    # Score = 0.30*80 + 0.25*95 + 0.20*90 + 0.15*100 + 0.10*100 = 24.0 + 23.75 + 18.0 + 15.0 + 10.0 = 90.75
    score_urgent, band_urgent = service.compute_priority_score(
        gap=4.0,
        career_importance=0.95,
        market_demand=90.0,
        downstream_count=4,
        prereq_pct=100.0,
        learning_velocity=2.0
    )
    assert score_urgent == 90.8
    assert band_urgent == "URGENT"

    # Case 2: Low priority (small gap, low relevance, modest market, no dependents, incomplete prereqs)
    # S_gap = (0.5 / 5.0) * 100 = 10.0
    # S_career = 0.30 * 100 = 30.0
    # S_market = 40.0
    # S_dep = min(100.0, 0 * 25.0) = 0.0
    # S_feas = 0.0 * 0.70 + 0.0 = 0.0
    # Score = 0.30*10 + 0.25*30 + 0.20*40 + 0.15*0 + 0.10*0 = 3.0 + 7.5 + 8.0 = 18.5
    score_low, band_low = service.compute_priority_score(
        gap=0.5,
        career_importance=0.30,
        market_demand=40.0,
        downstream_count=0,
        prereq_pct=0.0,
        learning_velocity=0.0
    )
    assert score_low == 18.5
    assert band_low == "LOW"


def test_learning_effort_heuristics():
    service = RecommendationService()

    # Gap >= 3.0 or (gap >= 2.0 and not all prereqs met) -> HIGH
    assert service.estimate_learning_effort(gap=3.5, has_unmet_prereqs=False)[0] == "HIGH"
    assert service.estimate_learning_effort(gap=2.2, has_unmet_prereqs=True)[0] == "HIGH"

    # Gap >= 1.5 -> MEDIUM
    assert service.estimate_learning_effort(gap=1.8, has_unmet_prereqs=False)[0] == "MEDIUM"

    # Small gap -> LOW
    assert service.estimate_learning_effort(gap=0.8, has_unmet_prereqs=False)[0] == "LOW"


def test_rationale_generation_explainability():
    service = RecommendationService()
    rationale = service.generate_rationale(
        skill_name="FastAPI",
        career_title="Backend Developer",
        student_level=1.0,
        target_level=4.0,
        gap=3.0,
        band="URGENT",
        market_demand=88.5,
        prereqs_met=True,
        downstream_count=2
    )
    assert "FastAPI" in rationale
    assert "Backend Developer" in rationale
    assert "gap of 3.0" in rationale
    assert "market demand signal (88.5/100)" in rationale
    assert "Prerequisites are satisfied" in rationale


@pytest.mark.anyio
async def test_recommendations_authenticated_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@skill2career.com",
            "password": "Password123!"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. GET /api/v1/recommendations
        rec_res = await ac.get("/api/v1/recommendations", headers=headers)
        assert rec_res.status_code == 200
        recs = rec_res.json()
        assert isinstance(recs, list)
        assert len(recs) > 0

        first_rec = recs[0]
        assert "recommendation_id" in first_rec
        assert "priority_score" in first_rec
        assert "priority_band" in first_rec
        assert first_rec["priority_band"] in ["URGENT", "HIGH", "MODERATE", "LOW"]
        assert "rationale" in first_rec
        assert "learning_effort_level" in first_rec
        assert "engine_version" in first_rec
        assert first_rec["engine_version"] == "v2.0-adaptive"

        # 3. GET /api/v1/recommendations/{career_id}
        career_res = await ac.get("/api/v1/recommendations/CR001", headers=headers)
        assert career_res.status_code == 200
        career_recs = career_res.json()
        assert len(career_recs) > 0
        assert all(r["career_id"] == "CR001" for r in career_recs)
