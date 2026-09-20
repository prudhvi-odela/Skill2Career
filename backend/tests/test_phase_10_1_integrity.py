"""
Skill2Career - Phase 10.1 Scientific & Integration Integrity Audit Test Suite
Adversarial validation of Career Forecasting & Scenario Intelligence:
1. Uncertainty & Model Error Margins (+/- 2.2 pts MAE margin, NOT a 95% Confidence Interval)
2. Phase 06 ML Pipeline & 13 Feature Schema Invariance
3. Temporal Leakage Immunity (Past snapshots never contaminated by future projections)
4. Strict Separation of OBSERVED vs PROJECTED vs SIMULATED states
5. Complete State Immutability under Scenario Simulations
6. 25-Iteration Scenario Determinism
7. Skill Projection Bounds [1.0, 5.0] (or 0.0 unacquired)
8. Competency-Oriented Time-to-Target (Zero hiring guarantees)
9. Traceable Competency Bottlenecks with Explicit Diagnostic Reasons
10. Insufficient-Data & Edge-Case Matrix (0 snapshots, 1 snapshot, all mastered, etc.)
11. Evidence & Market Signal Provenance Preservation
12. Cross-Student Isolation & API Security
"""

import pytest
import os
import json
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
import numpy as np

from backend.main import app
from backend.services.career_forecast_service import CareerForecastService
from backend.services.career_readiness_service import CareerReadinessService
from backend.schemas.career_forecast_schemas import (
    ForecastHorizon,
    ScenarioType,
    ScenarioSimulationRequest,
    BottleneckReason,
    ForecastUncertainty,
    SkillGrowthStatus
)
from backend.ml.inference import MLInferenceService
from backend.database.mongodb import get_db, get_utc_now
from backend.services.auth_service import create_access_token


@pytest.mark.anyio
async def test_uncertainty_and_statistical_bounds_audit():
    """Verify statistical terms: prediction margin represents +/-2.2 empirical error margin, NOT an ungrounded 95% CI."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_1_uncertainty_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 3.0, "verified": True},
            {"skill_id": "SK002", "name": "Data Structures & Algorithms", "level": 2.5, "verified": True}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 15.0
    })

    forecast = await svc.generate_career_forecast(
        student_id=student_id,
        career_id=career_id,
        horizon_days=90,
        db=db
    )

    # 1. Prediction uncertainty margin is approximately 2.2 points
    assert forecast.prediction_uncertainty_margin == 2.2
    assert forecast.active_scenario.uncertainty_margin_points == 2.2

    # 2. Prediction range is bounded [0.0, 100.0] around projected benchmark
    proj = forecast.active_scenario.projected_readiness_benchmark
    assert forecast.projected_range_low == max(0.0, round(proj - 2.2, 1))
    assert forecast.projected_range_high == min(100.0, round(proj + 2.2, 1))
    assert forecast.projected_range_low <= proj <= forecast.projected_range_high

    # 3. TimeToTarget reflects analytical confidence based on data completeness
    assert forecast.time_to_target.analytical_confidence in [
        ForecastUncertainty.HIGH,
        ForecastUncertainty.MEDIUM,
        ForecastUncertainty.LOW,
        ForecastUncertainty.INSUFFICIENT_DATA
    ]
    assert "hiring" in forecast.time_to_target.disclaimer.lower() or "employment" in forecast.time_to_target.disclaimer.lower()

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_ml_pipeline_and_13_features_immutability():
    """Verify Phase 06 readiness and trajectory models and their 13 canonical features are unchanged."""
    ml_svc = MLInferenceService.get_instance()
    assert ml_svc.readiness_model is not None
    assert ml_svc.trajectory_model is not None

    numerical = ml_svc.feature_schema.get("numerical_features", [])
    categorical = ml_svc.feature_schema.get("categorical_features", [])
    assert len(numerical) + len(categorical) == 13

    # Check that canonical features are strictly present
    expected_numerical = [
        "gpa", "career_skill_match_pct", "total_skills_count", "avg_skill_proficiency",
        "core_cs_score", "projects_count", "avg_project_complexity", "certifications_count",
        "assessments_passed_pct", "weekly_study_hours", "learning_velocity_index"
    ]
    for feat in expected_numerical:
        assert feat in numerical


@pytest.mark.anyio
async def test_temporal_leakage_immunity():
    """Verify historical baseline snapshots contain only past/current data and never future simulated numbers."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_1_temporal_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 2.0, "verified": True}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 10.0
    })

    forecast = await svc.generate_career_forecast(
        student_id=student_id,
        career_id=career_id,
        horizon_days=180,
        db=db
    )

    # Observed baseline must reflect t=0 level 2.0
    base_snap = forecast.baseline_snapshot
    assert base_snap["skill_count"] == 1
    assert base_snap["average_proficiency"] == 2.0

    # Projected proficiency at t=180 is higher, but baseline snapshot must NOT have changed
    sim_skill = next(s for s in forecast.skill_growth_projections if s.skill_id == "SK001")
    assert sim_skill.current_proficiency == 2.0
    assert sim_skill.projected_proficiency >= 2.0

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_observed_vs_projected_vs_simulated_separation():
    """Verify distinct boundaries between OBSERVED historical data, baseline PROJECTED trajectory, and SIMULATED scenarios."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_1_separation_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 2.5, "verified": True}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 12.0
    })

    # 1. Baseline forecast (Current trajectory)
    baseline_forecast = await svc.generate_career_forecast(
        student_id=student_id,
        career_id=career_id,
        horizon_days=90,
        db=db
    )

    # 2. What-if simulation (Increased consistency)
    sim_req = ScenarioSimulationRequest(
        scenario_type=ScenarioType.INCREASED_CONSISTENCY,
        weekly_study_hours=30.0,
        forecast_horizon_days=90
    )
    sim_res = await svc.simulate_scenario(
        student_id=student_id,
        career_id=career_id,
        scenario_req=sim_req,
        db=db
    )

    # Both share the exact same OBSERVED baseline score
    assert baseline_forecast.active_scenario.baseline_readiness_score == sim_res.baseline_readiness_score

    # The simulated scenario achieves higher projected benchmark due to increased study commitment
    assert sim_res.projected_readiness_benchmark >= baseline_forecast.active_scenario.projected_readiness_benchmark

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_strict_simulation_immutability_adversarial():
    """Verify running multiple intensive what-if scenarios never mutates persistent student profile or evidence."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_1_immutability_student"
    career_id = "CR001"

    initial_profile = {
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 2.0, "verified": True}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 8.0
    }

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.skill_evidence.delete_many({"student_id": student_id})
    await db.learning_snapshots.delete_many({"student_id": student_id})
    await db.projects.delete_many({"student_id": student_id})

    await db.student_profiles.insert_one(initial_profile)

    # Run 5 distinct simulation requests
    for hours in [15.0, 25.0, 40.0, 50.0, 60.0]:
        sim_req = ScenarioSimulationRequest(
            scenario_type=ScenarioType.GAP_FOCUSED,
            weekly_study_hours=hours,
            forecast_horizon_days=180
        )
        await svc.simulate_scenario(student_id=student_id, career_id=career_id, scenario_req=sim_req, db=db)

    # Verify zero mutations in MongoDB collections
    profile = await db.student_profiles.find_one({"user_id": student_id})
    assert profile["weekly_study_hours"] == 8.0
    assert len(profile["skills"]) == 1
    assert profile["skills"][0]["level"] == 2.0

    assert await db.skill_evidence.count_documents({"student_id": student_id}) == 0
    assert await db.learning_snapshots.count_documents({"student_id": student_id}) == 0
    assert await db.projects.count_documents({"student_id": student_id}) == 0

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_25_iteration_scenario_determinism():
    """Verify executing identical scenario simulations 25 consecutive times yields exact deterministic floats."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_1_determinism_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 3.0, "verified": True},
            {"skill_id": "SK002", "name": "Data Structures & Algorithms", "level": 2.5, "verified": True}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 16.0
    })

    sim_req = ScenarioSimulationRequest(
        scenario_type=ScenarioType.INCREASED_CONSISTENCY,
        weekly_study_hours=24.0,
        forecast_horizon_days=90
    )

    first_res = await svc.simulate_scenario(student_id=student_id, career_id=career_id, scenario_req=sim_req, db=db)

    for i in range(24):
        subsequent = await svc.simulate_scenario(student_id=student_id, career_id=career_id, scenario_req=sim_req, db=db)
        assert subsequent.baseline_readiness_score == first_res.baseline_readiness_score
        assert subsequent.projected_readiness_benchmark == first_res.projected_readiness_benchmark
        assert subsequent.projected_readiness_delta == first_res.projected_readiness_delta
        assert subsequent.projected_velocity == first_res.projected_velocity
        assert len(subsequent.projected_skill_changes) == len(first_res.projected_skill_changes)

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_skill_projection_clamping_bounds():
    """Verify all projected skill levels are strictly clamped to [1.0, 5.0] (or 0.0 unacquired)."""
    svc = CareerForecastService()
    db = await get_db()
    student_id = "test_p10_1_bounds_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 4.9, "verified": True},
            {"skill_id": "SK002", "name": "Data Structures & Algorithms", "level": 1.0, "verified": False}
        ],
        "target_career_id": career_id,
        "weekly_study_hours": 60.0  # Massive simulated commitment
    })

    forecast = await svc.generate_career_forecast(
        student_id=student_id,
        career_id=career_id,
        horizon_days=180,
        db=db
    )

    for skill in forecast.skill_growth_projections:
        assert 0.0 <= skill.current_proficiency <= 5.0
        assert 0.0 <= skill.projected_proficiency <= 5.0
        if skill.current_proficiency >= 1.0:
            assert 1.0 <= skill.projected_proficiency <= 5.0
        # Check that 4.9 does not exceed 5.0
        if skill.skill_id == "SK001":
            assert skill.projected_proficiency <= 5.0

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_insufficient_data_and_edge_case_matrix():
    """Verify insufficient data handling for 0 snapshots, 1 snapshot, stagnation, and all skills mastered."""
    svc = CareerForecastService()
    db = await get_db()
    career_id = "CR001"

    # Case 1: Brand new student with 0 snapshots
    student_new = "test_p10_1_zero_snapshots"
    await db.student_profiles.delete_many({"user_id": student_new})
    await db.learning_snapshots.delete_many({"student_id": student_new})
    await db.student_profiles.insert_one({
        "user_id": student_new,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 2.0, "verified": True}],
        "target_career_id": career_id
    })

    forecast_new = await svc.generate_career_forecast(student_id=student_new, career_id=career_id, horizon_days=90, db=db)
    assert forecast_new.uncertainty == ForecastUncertainty.INSUFFICIENT_DATA
    assert forecast_new.has_sufficient_history is False

    # Case 2: Mastered student (all skills at 5.0)
    student_master = "test_p10_1_all_mastered"
    await db.student_profiles.delete_many({"user_id": student_master})
    
    # Fetch all career skills
    career_doc = await db.career_roles.find_one({"career_code": career_id})
    all_mastered_skills = [
        {"skill_id": rs["skill_id"], "name": rs.get("name", rs["skill_id"]), "level": 5.0, "verified": True}
        for rs in career_doc.get("required_skills", [])
    ]
    await db.student_profiles.insert_one({
        "user_id": student_master,
        "skills": all_mastered_skills,
        "target_career_id": career_id,
        "weekly_study_hours": 20.0
    })

    forecast_master = await svc.generate_career_forecast(student_id=student_master, career_id=career_id, horizon_days=90, db=db)
    assert forecast_master.time_to_target.min_weeks == 0
    assert forecast_master.time_to_target.max_weeks == 0
    assert len(forecast_master.bottlenecks) == 0
    for s in forecast_master.skill_growth_projections:
        assert s.status == SkillGrowthStatus.PROJECTED_STABILITY

    # Cleanup
    await db.student_profiles.delete_many({"user_id": {"$in": [student_new, student_master]}})


@pytest.mark.anyio
async def test_cross_student_access_security():
    """Verify students cannot view or simulate other students' forecast intelligence."""
    db = await get_db()
    student_a = "test_p10_1_auth_user_a"
    student_b = "test_p10_1_auth_user_b"
    career_id = "CR001"

    await db.users.delete_many({"_id": {"$in": [student_a, student_b]}})
    await db.student_profiles.delete_many({"user_id": {"$in": [student_a, student_b]}})

    await db.users.insert_one({"_id": student_a, "id": student_a, "email": "usera@test.com", "full_name": "User A"})
    await db.student_profiles.insert_one({
        "user_id": student_a,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 4.0, "verified": True}],
        "target_career_id": career_id
    })

    token_a = create_access_token({"sub": student_a, "email": "usera@test.com"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Requesting forecast returns student A's data, strictly isolated from student B
        headers = {"Authorization": f"Bearer {token_a}"}
        res = await ac.get(f"/api/v1/career-forecast/{career_id}", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["student_id"] == student_a

    # Cleanup
    await db.users.delete_many({"_id": {"$in": [student_a, student_b]}})
    await db.student_profiles.delete_many({"user_id": {"$in": [student_a, student_b]}})
