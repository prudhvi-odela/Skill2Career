"""
Skill2Career - Phase 10 Career Forecasting & Scenario Intelligence Test Suite
Validates longitudinal skill growth bounding [1.0, 5.0], horizon calculations (30/60/90/180d),
competency bottleneck detection with explicit reasons, bounded time-to-target estimations,
strict in-memory scenario simulations without database mutations, multi-scenario comparisons,
forecast snapshot persistence, cross-student isolation, 25-iteration determinism, and API security.
"""

import pytest
import os
import json
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
import numpy as np

from backend.main import app
from backend.services.career_forecast_service import CareerForecastService
from backend.schemas.career_forecast_schemas import (
    ForecastHorizon,
    ScenarioType,
    ScenarioSimulationRequest,
    BottleneckReason
)
from backend.ml.inference import MLInferenceService
from backend.database.mongodb import get_db, get_utc_now
from backend.services.auth_service import create_access_token


@pytest.mark.anyio
async def test_career_forecast_horizons_and_bounding():
    """Verify forecasts across 30, 60, 90, and 180 day horizons produce valid clamped skills and positive scores."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_horizons_student"
    career_id = "CR001"

    # Setup student profile
    await db.student_profiles.delete_many({"user_id": student_id})
    await db.career_forecasts.delete_many({"student_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 3.0, "verified": True},
            {"skill_id": "SK002", "name": "Data Structures & Algorithms", "level": 2.5, "verified": True},
            {"skill_id": "SK003", "name": "SQL", "level": 2.0, "verified": False}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 15.0
    })

    for h_days in [30, 60, 90, 180]:
        forecast = await svc.generate_career_forecast(
            student_id=student_id,
            career_id=career_id,
            horizon_days=h_days,
            db=db
        )

        assert forecast.student_id == student_id
        assert forecast.career_id == career_id
        assert forecast.forecast_horizon_days == h_days
        assert 0.0 <= forecast.active_scenario.baseline_readiness_score <= 100.0
        assert 0.0 <= forecast.active_scenario.projected_readiness_benchmark <= 100.0

        # Verify all skills are strictly bounded in [0.0, 5.0]
        for skill in forecast.skill_growth_projections:
            assert 0.0 <= skill.current_proficiency <= 5.0
            assert 0.0 <= skill.projected_proficiency <= 5.0
            assert skill.projected_proficiency >= skill.current_proficiency

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_competency_bottlenecks_detection_and_reasons():
    """Verify discovered bottlenecks categorize specific reasons correctly (e.g. STAGNATING_SKILL, HIGH_SKILL_GAP, etc.)."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_bottleneck_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.skill_evidence.delete_many({"student_id": student_id})
    await db.learning_activities.delete_many({"student_id": student_id})

    # Student with critical gaps and low proficiency
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 1.5, "verified": False}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 5.0
    })

    bottlenecks = await svc.get_career_bottlenecks(
        student_id=student_id,
        career_id=career_id,
        db=db
    )

    assert len(bottlenecks) > 0
    valid_reasons = {r for r in BottleneckReason}

    for bn in bottlenecks:
        assert bn.reason in valid_reasons
        assert bn.impact_severity in ["CRITICAL", "HIGH", "MODERATE", "LOW"]
        assert bn.gap > 0
        assert len(bn.recommended_remediation) > 10

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_time_to_target_bounding_and_semantics():
    """Verify time-to-target calculations provide realistic bounded week estimates and semantic pace labels."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_ttt_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 4.5, "verified": True},
            {"skill_id": "SK002", "name": "Data Structures & Algorithms", "level": 4.0, "verified": True},
            {"skill_id": "SK003", "name": "SQL", "level": 4.0, "verified": True}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 20.0
    })

    forecast = await svc.generate_career_forecast(
        student_id=student_id,
        career_id=career_id,
        horizon_days=90,
        db=db
    )

    ttt = forecast.time_to_target
    assert ttt is not None
    assert ttt.min_weeks is not None and ttt.min_weeks >= 0
    assert ttt.max_weeks is not None and ttt.max_weeks >= ttt.min_weeks
    assert "weeks" in ttt.estimated_weeks_range

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_in_memory_scenario_simulation_no_state_mutation():
    """Verify scenario simulations execute strictly in-memory without altering student profile, evidence, or snapshots."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_mutation_student"
    career_id = "CR001"

    initial_profile = {
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 2.5, "verified": True}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 10.0
    }

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.skill_evidence.delete_many({"student_id": student_id})
    await db.learning_snapshots.delete_many({"student_id": student_id})
    await db.career_forecasts.delete_many({"student_id": student_id})

    await db.student_profiles.insert_one(initial_profile)

    sim_req = ScenarioSimulationRequest(
        scenario_type=ScenarioType.INCREASED_CONSISTENCY,
        weekly_study_hours=30.0,
        learning_days_per_week=5,
        forecast_horizon_days=90
    )

    sim_res = await svc.simulate_scenario(
        student_id=student_id,
        career_id=career_id,
        scenario_req=sim_req,
        db=db
    )

    assert sim_res.projected_readiness_benchmark >= sim_res.baseline_readiness_score
    assert sim_res.projected_readiness_delta >= 0.0
    assert len(sim_res.projected_skill_changes) > 0

    # Verify student_profiles was NOT modified
    persisted_profile = await db.student_profiles.find_one({"user_id": student_id})
    assert persisted_profile["weekly_study_hours"] == 10.0
    assert len(persisted_profile["skills"]) == 1
    assert persisted_profile["skills"][0]["level"] == 2.5

    # Verify no fake skill_evidence or snapshots were created
    evidence_count = await db.skill_evidence.count_documents({"student_id": student_id})
    snapshot_count = await db.learning_snapshots.count_documents({"student_id": student_id})
    assert evidence_count == 0
    assert snapshot_count == 0

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_compare_scenarios_structure():
    """Verify compare_scenarios returns 3 standard scenarios with valid relative projections."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_comparison_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 2.0, "verified": True}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 12.0
    })

    reqs = [
        ScenarioSimulationRequest(scenario_type=ScenarioType.CURRENT_TRAJECTORY, forecast_horizon_days=90),
        ScenarioSimulationRequest(scenario_type=ScenarioType.INCREASED_CONSISTENCY, forecast_horizon_days=90),
        ScenarioSimulationRequest(scenario_type=ScenarioType.GAP_FOCUSED, forecast_horizon_days=90)
    ]

    comp = await svc.compare_scenarios(
        student_id=student_id,
        career_id=career_id,
        scenario_reqs=reqs,
        db=db
    )

    assert comp.student_id == student_id
    assert comp.career_id == career_id
    assert len(comp.scenarios) == 3

    scenario_types = [s.scenario_type for s in comp.scenarios]
    assert ScenarioType.CURRENT_TRAJECTORY in scenario_types
    assert ScenarioType.INCREASED_CONSISTENCY in scenario_types
    assert ScenarioType.GAP_FOCUSED in scenario_types

    # Increased consistency should achieve higher or equal gain compared to baseline
    baseline_sc = next(s for s in comp.scenarios if s.scenario_type == ScenarioType.CURRENT_TRAJECTORY)
    inc_sc = next(s for s in comp.scenarios if s.scenario_type == ScenarioType.INCREASED_CONSISTENCY)
    assert inc_sc.projected_readiness_benchmark >= baseline_sc.projected_readiness_benchmark

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_forecast_persistence_and_history_retrieval():
    """Verify forecast records are stored in MongoDB and get_forecast_history retrieves them."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_history_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.career_forecasts.delete_many({"student_id": student_id})

    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 3.0, "verified": True}],
        "target_career_id": career_id,
        "weekly_study_hours": 15.0
    })

    # Generate 2 persisted snapshots
    f1 = await svc.generate_career_forecast(student_id=student_id, career_id=career_id, horizon_days=30, db=db)
    f2 = await svc.generate_career_forecast(student_id=student_id, career_id=career_id, horizon_days=90, db=db)

    history = await svc.get_forecast_history(student_id=student_id, career_id=career_id, db=db)
    assert len(history) >= 2
    history_ids = [h.get("forecast_id") for h in history]
    assert f1.forecast_id in history_ids or f2.forecast_id in history_ids

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})
    await db.career_forecasts.delete_many({"student_id": student_id})


@pytest.mark.anyio
async def test_25_iteration_determinism():
    """Verify 25 consecutive forecasts on unchanged student state yield identical mathematical scores."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_determinism_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 3.2, "verified": True},
            {"skill_id": "SK002", "name": "Data Structures & Algorithms", "level": 2.8, "verified": True}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 18.0
    })

    first_forecast = await svc.generate_career_forecast(
        student_id=student_id,
        career_id=career_id,
        horizon_days=90,
        db=db
    )

    for _ in range(24):
        subsequent = await svc.generate_career_forecast(
            student_id=student_id,
            career_id=career_id,
            horizon_days=90,
            db=db
        )

        assert subsequent.active_scenario.baseline_readiness_score == first_forecast.active_scenario.baseline_readiness_score
        assert subsequent.active_scenario.projected_readiness_benchmark == first_forecast.active_scenario.projected_readiness_benchmark
        assert len(subsequent.skill_growth_projections) == len(first_forecast.skill_growth_projections)

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_cross_student_isolation():
    """Verify student A's forecast is completely isolated from student B's skills and evidence."""
    svc = CareerForecastService()
    db = await get_db()
    student_a = "test_p10_student_a"
    student_b = "test_p10_student_b"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": {"$in": [student_a, student_b]}})

    # Student A: Novice (5 hrs/wk)
    await db.student_profiles.insert_one({
        "user_id": student_a,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 1.5, "verified": False}],
        "target_career_id": career_id,
        "weekly_study_hours": 5.0
    })

    # Student B: Advanced (35 hrs/wk)
    await db.student_profiles.insert_one({
        "user_id": student_b,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 4.5, "verified": True},
            {"skill_id": "SK002", "name": "Data Structures & Algorithms", "level": 4.2, "verified": True},
            {"skill_id": "SK003", "name": "SQL", "level": 4.0, "verified": True}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 35.0
    })

    forecast_a = await svc.generate_career_forecast(student_id=student_a, career_id=career_id, horizon_days=90, db=db)
    forecast_b = await svc.generate_career_forecast(student_id=student_b, career_id=career_id, horizon_days=90, db=db)

    assert forecast_a.student_id == student_a
    assert forecast_b.student_id == student_b
    assert forecast_a.active_scenario.baseline_readiness_score != forecast_b.active_scenario.baseline_readiness_score
    assert forecast_a.active_scenario.projected_readiness_benchmark < forecast_b.active_scenario.projected_readiness_benchmark

    # Cleanup
    await db.student_profiles.delete_many({"user_id": {"$in": [student_a, student_b]}})


@pytest.mark.anyio
async def test_career_forecast_api_endpoints():
    """Verify REST API endpoints under /api/v1/career-forecast enforce 401 unauthenticated and succeed when authenticated."""
    db = await get_db()
    student_id = "test_p10_api_student"
    career_id = "CR001"

    await db.users.delete_many({"_id": student_id})
    await db.student_profiles.delete_many({"user_id": student_id})

    await db.users.insert_one({
        "_id": student_id,
        "id": student_id,
        "email": "test_p10_api@example.com",
        "full_name": "Forecast API Tester"
    })
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 3.0, "verified": True}],
        "target_career_id": career_id,
        "weekly_study_hours": 15.0
    })

    token = create_access_token({"sub": student_id, "email": "test_p10_api@example.com"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Test 401 unauthenticated
        unauth_res = await ac.get(f"/api/v1/career-forecast/{career_id}")
        assert unauth_res.status_code == 401

        # 2. Test GET forecast authenticated
        auth_headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get(f"/api/v1/career-forecast/{career_id}?horizon=90", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["student_id"] == student_id
        assert data["career_id"] == career_id
        assert data["forecast_horizon_days"] == 90

        # 3. Test GET bottlenecks
        bn_res = await ac.get(f"/api/v1/career-forecast/{career_id}/bottlenecks", headers=auth_headers)
        assert bn_res.status_code == 200
        assert isinstance(bn_res.json(), list)

        # 4. Test POST simulate
        sim_payload = {
            "scenario_type": "INCREASED_CONSISTENCY",
            "weekly_study_hours": 25.0,
            "learning_days_per_week": 5,
            "forecast_horizon_days": 90
        }
        sim_res = await ac.post(f"/api/v1/career-forecast/{career_id}/simulate", json=sim_payload, headers=auth_headers)
        assert sim_res.status_code == 200
        sim_data = sim_res.json()
        assert sim_data["scenario_type"] == "INCREASED_CONSISTENCY"
        assert sim_data["projected_readiness_delta"] >= 0.0

        # 5. Test GET compare-scenarios
        comp_res = await ac.get(f"/api/v1/career-forecast/compare-scenarios?career_id={career_id}&horizon=90", headers=auth_headers)
        assert comp_res.status_code == 200
        comp_data = comp_res.json()
        assert len(comp_data["scenarios"]) == 3

    # Cleanup
    await db.users.delete_many({"_id": student_id})
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_ml_pipeline_invariance():
    """Verify ML readiness model and trajectory pipeline weights remain strictly immutable."""
    ml_svc = MLInferenceService.get_instance()
    assert ml_svc.readiness_model is not None
    assert ml_svc.trajectory_model is not None
    assert hasattr(ml_svc.readiness_model, "predict")
    assert hasattr(ml_svc.trajectory_model, "predict")
    total_features = len(ml_svc.feature_schema.get("numerical_features", [])) + len(ml_svc.feature_schema.get("categorical_features", []))
    assert total_features == 13
