"""
Skill2Career - Product Integration & Complete Demo User Journey Test Suite
Validates that the entire integrated platform operates as a cohesive, production-ready
system from authentication to multi-dimensional career intelligence.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database.mongodb import get_db, connect_to_mongo
from backend.database.seed import seed_database


@pytest.mark.anyio
async def test_complete_product_integration_student_journey():
    """
    Tests the full end-to-end product journey against seeded MongoDB data.
    """
    # 1. Ensure database is freshly seeded
    await seed_database()
    db = await get_db()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Step 1: Health Endpoint Check
        health_res = await ac.get("/api/health")
        assert health_res.status_code == 200
        health_json = health_res.json()
        assert health_json["status"] == "healthy"
        assert "MongoDB connected" in health_json["database"]
        assert "loaded" in health_json["ml_models"]

        # Step 2: Authenticate with Demo Account
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@skill2career.com",
            "password": "Password123!"
        })
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert "access_token" in login_data
        token = login_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Step 3: Current User & Profile Verification
        me_res = await ac.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        user_data = me_res.json()
        assert user_data["email"] == "demo@skill2career.com"
        assert user_data["full_name"] == "Alex Chen"

        profile_res = await ac.get("/api/v1/student/profile", headers=headers)
        assert profile_res.status_code == 200
        profile_data = profile_res.json()
        assert profile_data["gpa"] == 8.8
        assert profile_data["degree"] == "B.Tech Computer Science"
        assert len(profile_data["skills"]) >= 8

        # Step 4: Skills Catalog & Student Inventory
        catalog_res = await ac.get("/api/v1/careers/skills/catalog")
        assert catalog_res.status_code == 200
        assert len(catalog_res.json()) >= 40

        skills_res = await ac.get("/api/v1/student/skills", headers=headers)
        assert skills_res.status_code == 200
        assert len(skills_res.json()) >= 8

        # Step 5: Portfolio Artifacts (Projects, Certs, Activities)
        proj_res = await ac.get("/api/v1/student/projects", headers=headers)
        assert proj_res.status_code == 200
        assert len(proj_res.json()) >= 2

        cert_res = await ac.get("/api/v1/student/certifications", headers=headers)
        assert cert_res.status_code == 200
        assert len(cert_res.json()) >= 1

        act_res = await ac.get("/api/v1/student/activities", headers=headers)
        assert act_res.status_code == 200
        assert len(act_res.json()) >= 2

        # Step 6: Learning Evidence Foundation (Phase 09A)
        evidence_res = await ac.get("/api/v1/evidence", headers=headers)
        assert evidence_res.status_code == 200
        assert len(evidence_res.json()) >= 5

        evidence_summary_res = await ac.get("/api/v1/evidence/summary", headers=headers)
        assert evidence_summary_res.status_code == 200
        ev_summary = evidence_summary_res.json()
        assert ev_summary["total_evidence_count"] >= 5
        assert ev_summary["verified_evidence_count"] >= 3

        # Step 7: Learning Intelligence & Longitudinal Trajectory (Phase 09B)
        li_overview_res = await ac.get("/api/v1/learning-intelligence/overview", headers=headers)
        assert li_overview_res.status_code == 200
        li_overview = li_overview_res.json()
        assert li_overview["total_snapshots"] >= 2
        assert "velocity" in li_overview
        assert "trajectory_direction" in li_overview
        assert "consistency" in li_overview
        assert "stagnation" in li_overview
        assert "trajectory_timeline" in li_overview

        # Step 8: Machine Learning Benchmark & Gap Analysis (Phase 06)
        readiness_res = await ac.post("/api/v1/analysis/readiness", headers=headers, json={"target_career_id": "CR004"})
        assert readiness_res.status_code == 200
        readiness_json = readiness_res.json()
        assert "readiness_score" in readiness_json
        assert 0.0 <= readiness_json["readiness_score"] <= 100.0
        assert readiness_json["model_version"] == "v1.0.0-163ee58cba"

        gap_res = await ac.post("/api/v1/analysis/gap", headers=headers, params={"target_career_id": "CR004"})
        assert gap_res.status_code == 200
        gap_json = gap_res.json()
        assert "gaps" in gap_json
        assert "coverage_percentage" in gap_json

        # Step 9: Market Intelligence Signals & Provenance (Phase 07 & 08.2)
        market_analysis_res = await ac.post("/api/v1/market/student-analysis", headers=headers, json={"target_career_id": "CR004"})
        assert market_analysis_res.status_code == 200
        market_json = market_analysis_res.json()
        assert market_json["target_career_id"] == "CR004"
        assert "career_market_demand" in market_json
        assert "analyzed_skill_gaps" in market_json
        assert "provenance_note" in market_json

        # Step 10: Adaptive Multi-Phase Roadmap (Phase 08)
        roadmap_res = await ac.get("/api/v1/roadmap/current", headers=headers, params={"career_id": "CR004"})
        assert roadmap_res.status_code == 200
        roadmap_json = roadmap_res.json()
        assert "phases" in roadmap_json
        assert len(roadmap_json["phases"]) >= 2

        # Step 11: Career Readiness Synthesis (Phase 09C)
        cr_res = await ac.get("/api/v1/career-readiness/CR004", headers=headers)
        assert cr_res.status_code == 200
        cr_json = cr_res.json()
        assert cr_json["career_id"] == "CR004"
        assert cr_json["career_title"] == "Machine Learning Engineer"
        assert "skill_alignment" in cr_json
        assert "evidence_coverage" in cr_json
        assert "learning_trajectory" in cr_json
        assert "existing_ml_readiness" in cr_json

        # Step 12: Career Forecasting & Scenario Intelligence (Phase 10)
        forecast_res = await ac.get("/api/v1/career-forecast/CR004", headers=headers, params={"horizon": 90})
        assert forecast_res.status_code == 200
        fc_json = forecast_res.json()
        assert fc_json["career_id"] == "CR004"
        assert fc_json["career_title"] == "Machine Learning Engineer"
        assert "time_to_target" in fc_json
        assert "bottlenecks" in fc_json
        assert "active_scenario" in fc_json

        # Step 13: In-Memory Scenario Simulation (Immutability Verified)
        sim_res = await ac.post("/api/v1/career-forecast/CR004/simulate", headers=headers, json={
            "scenario_type": "INCREASED_CONSISTENCY",
            "forecast_horizon_days": 90,
            "weekly_study_hours": 20.0
        })
        assert sim_res.status_code == 200
        sim_json = sim_res.json()
        assert sim_json["scenario_type"] == "INCREASED_CONSISTENCY"
        assert "projected_readiness_benchmark" in sim_json
        assert "estimated_time_to_target" in sim_json

        # Step 14: Strategic Career Transition (Phase 11)
        transition_res = await ac.get("/api/v1/career-transition/CR004", headers=headers, params={"source_career_id": "CR001"})
        assert transition_res.status_code == 200
        trans_json = transition_res.json()
        assert trans_json["source_career"]["career_id"] == "CR001"
        assert trans_json["target_career"]["career_id"] == "CR004"
        assert "transferable_skills" in trans_json
        assert "transition_milestones" in trans_json
        assert len(trans_json["transferable_skills"]) >= 1

        # Step 15: Grounded AI Career Explanation (Fallback & Grounding)
        ai_res = await ac.post("/api/v1/ai/explain-readiness", headers=headers)
        assert ai_res.status_code == 200
        ai_json = ai_res.json()
        assert "message" in ai_json
        assert "key_points" in ai_json
        assert "recommended_actions" in ai_json
        assert "deterministic-grounded-engine" in ai_json.get("model_used", "") or "gemini" in ai_json.get("model_used", "")

        # Step 16: Security Check - Unauthenticated Request Rejection
        unauth_res = await ac.get("/api/v1/student/profile")
        assert unauth_res.status_code == 401
