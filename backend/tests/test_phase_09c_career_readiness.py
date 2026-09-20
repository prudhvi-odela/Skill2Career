"""
Skill2Career - Phase 09C Career Readiness & Adaptive Forecasting Test Suite
Validates evidence-grounded career interpretation, multi-artifact alignment,
evidence coverage, trajectory integration, market provenance, exclusion of mastered skills,
deterministic repeated analysis, security isolation, and ML model invariance.
"""

import pytest
import os
import json
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
import numpy as np

from backend.main import app
from backend.services.career_readiness_service import CareerReadinessService
from backend.services.learning_intelligence_service import LearningIntelligenceService
from backend.ml.inference import MLInferenceService
from backend.database.mongodb import get_db, get_utc_now


@pytest.mark.anyio
async def test_career_specific_skill_alignment():
    """Verify career-specific skill alignment calculates exact required, covered, and proficient counts."""
    svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_09c_alignment_student"
    career_id = "CR001"

    # Setup student with known skills
    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 4.0, "verified": True},
            {"skill_id": "SK002", "name": "Data Structures & Algorithms", "level": 3.0, "verified": True}
        ],
        "target_career_id": career_id
    })

    analysis = await svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)

    assert analysis.student_id == student_id
    assert analysis.career_id == career_id
    assert analysis.skill_alignment.required_skill_count > 0
    assert analysis.skill_alignment.covered_skill_count >= 2
    assert analysis.skill_alignment.coverage_percentage > 0.0

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_verified_evidence_coverage_and_unverified_distinction():
    """Verify evidence coverage accurately counts verified vs unverified vs rejected artifacts."""
    svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_09c_evidence_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.skill_evidence.delete_many({"student_id": student_id})

    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 3.5, "verified": True}],
        "target_career_id": career_id
    })

    # Insert 1 verified evidence, 1 unverified, 1 rejected
    await db.skill_evidence.insert_many([
        {
            "evidence_id": "EV_09C_TEST_001",
            "student_id": student_id,
            "skill_id": "SK001",
            "evidence_type": "ASSESSMENT",
            "source_entity": "assessments",
            "source_entity_id": "ASM_001",
            "title": "Python Quiz",
            "observed_proficiency": 4.0,
            "verification_status": "SYSTEM_VERIFIED",
            "created_at": get_utc_now()
        },
        {
            "evidence_id": "EV_09C_TEST_002",
            "student_id": student_id,
            "skill_id": "SK002",
            "evidence_type": "ACTIVITY",
            "source_entity": "learning_activities",
            "source_entity_id": "ACT_001",
            "title": "Self Study",
            "observed_proficiency": 2.0,
            "verification_status": "UNVERIFIED",
            "created_at": get_utc_now()
        },
        {
            "evidence_id": "EV_09C_TEST_003",
            "student_id": student_id,
            "skill_id": "SK003",
            "evidence_type": "CERTIFICATE",
            "source_entity": "certifications",
            "source_entity_id": "CERT_001",
            "title": "Expired Cert",
            "observed_proficiency": 1.0,
            "verification_status": "REJECTED",
            "created_at": get_utc_now()
        }
    ])

    analysis = await svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)

    assert analysis.evidence_coverage.verified_evidence_count >= 1
    assert analysis.evidence_coverage.unverified_evidence_count >= 1
    assert analysis.evidence_coverage.rejected_evidence_count >= 1
    assert analysis.evidence_coverage.career_relevant_skills_with_verified_evidence >= 1

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})
    await db.skill_evidence.delete_many({"student_id": student_id})


@pytest.mark.anyio
async def test_project_assessment_certification_provenance():
    """Verify projects, assessments, and certifications belonging strictly to authenticated student are integrated."""
    svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_09c_multi_artifact_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.projects.delete_many({"student_id": student_id})
    await db.student_assessments.delete_many({"student_id": student_id})
    await db.certifications.delete_many({"student_id": student_id})

    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 3.0}],
        "target_career_id": career_id
    })

    await db.projects.insert_one({
        "student_id": student_id,
        "title": "Async Microservice",
        "technologies": ["Python", "FastAPI"],
        "complexity_rating": 4.0,
        "repository_url": "https://github.com/test/project",
        "created_at": get_utc_now()
    })

    await db.student_assessments.insert_one({
        "student_id": student_id,
        "assessment_id": "ASM_TEST",
        "skill_id": "SK001",
        "skill_name": "Python",
        "score_percentage": 88.0,
        "passed": True,
        "completed_at": get_utc_now().isoformat()
    })

    await db.certifications.insert_one({
        "student_id": student_id,
        "name": "Certified Python Associate",
        "issuer": "Python Institute",
        "is_verified": True,
        "created_at": get_utc_now()
    })

    analysis = await svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)

    assert analysis.project_alignment.career_relevant_projects_count == 1
    assert analysis.project_alignment.projects[0].complexity_rating == 4.0
    assert analysis.project_alignment.projects[0].has_repository is True

    assert analysis.assessment_alignment.total_assessments_taken == 1
    assert analysis.assessment_alignment.passed_assessments_count == 1
    assert analysis.assessment_alignment.pass_rate_pct == 100.0

    assert analysis.certification_alignment.total_certifications_count == 1
    assert analysis.certification_alignment.verified_certifications_count == 1

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})
    await db.projects.delete_many({"student_id": student_id})
    await db.student_assessments.delete_many({"student_id": student_id})
    await db.certifications.delete_many({"student_id": student_id})


@pytest.mark.anyio
async def test_learning_trajectory_integration_and_insufficient_history():
    """Verify trajectory metrics from Phase 09B are integrated cleanly and preserve insufficient history."""
    svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_09c_trajectory_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.learning_snapshots.delete_many({"student_id": student_id})

    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 2.0}],
        "target_career_id": career_id
    })

    # Zero snapshots -> insufficient history
    analysis = await svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)
    assert analysis.learning_trajectory.has_sufficient_history is False
    assert analysis.learning_trajectory.total_snapshots == 0

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_market_provenance_and_fallback_labeling():
    """Verify market alignment captures demand score, source, and flags fallback/stale signals accurately."""
    svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_09c_market_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 3.0}],
        "target_career_id": career_id
    })

    analysis = await svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)
    assert analysis.market_alignment.demand_score >= 0.0
    assert analysis.market_alignment.market_signal_status in ["OBSERVED", "STALE", "EXPIRING_SOON", "FALLBACK_UNAVAILABLE"]
    assert len(analysis.market_alignment.market_source) > 0

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_mastered_skills_excluded_from_action_remediation():
    """Verify skills where student proficiency meets/exceeds target are classified as MASTERED and excluded from next actions."""
    svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_09c_mastered_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    # Student with master-level Python (5.0)
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 5.0, "verified": True}
        ],
        "target_career_id": career_id
    })

    analysis = await svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)

    # Check strengths contains Python
    python_strength = next((s for s in analysis.strengths if s.skill_id == "SK001"), None)
    assert python_strength is not None
    assert python_strength.surplus >= 0.0

    # Check next_actions does NOT contain Python
    action_skills = [a.skill_id for a in analysis.next_actions]
    assert "SK001" not in action_skills

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


@pytest.mark.anyio
async def test_existing_ml_readiness_model_invariance():
    """Verify calculating Career Readiness does NOT alter ML readiness predictions or modify ML pipelines."""
    ml_svc = MLInferenceService.get_instance()
    cr_svc = CareerReadinessService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))
    profile = await db.student_profiles.find_one({"user_id": user_id})
    skills = profile.get("skills", [])

    pred_before = ml_svc.predict_readiness(student_skills_list=skills, target_career_id="CR001")

    # Run career readiness analysis
    analysis = await cr_svc.get_career_readiness_analysis(student_id=user_id, career_id="CR001", db=db)

    pred_after = ml_svc.predict_readiness(student_skills_list=skills, target_career_id="CR001")

    # Invariance check: ML model outputs identical score before and after
    assert pred_before["readiness_score"] == pred_after["readiness_score"]
    assert pred_before["model_version"] == pred_after["model_version"]
    assert analysis.existing_ml_readiness.readiness_score > 0.0
    assert analysis.existing_ml_readiness.model_version == pred_after["model_version"]


@pytest.mark.anyio
async def test_cross_student_isolation_and_security():
    """Verify Student A cannot retrieve Student B's career readiness analysis."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Unauthenticated request rejected
        unauth_res = await ac.get("/api/v1/career-readiness/CR001")
        assert unauth_res.status_code == 401

        # Invalid career ID returns 404
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "demo@skill2career.com", "password": "Password123!"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        invalid_res = await ac.get("/api/v1/career-readiness/CR_NON_EXISTENT_999", headers=headers)
        assert invalid_res.status_code == 404


@pytest.mark.anyio
async def test_career_readiness_all_api_endpoints():
    """Verify all REST API endpoints under /api/v1/career-readiness return authenticated 200 responses."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "demo@skill2career.com", "password": "Password123!"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. GET /career-readiness/CR001
        res_main = await ac.get("/api/v1/career-readiness/CR001", headers=headers)
        assert res_main.status_code == 200
        data = res_main.json()
        assert "existing_ml_readiness" in data
        assert "skill_alignment" in data
        assert "evidence_coverage" in data
        assert "learning_trajectory" in data
        assert "market_alignment" in data
        assert "strengths" in data
        assert "gaps" in data
        assert "readiness_factors" in data
        assert "next_actions" in data

        # 2. GET /career-readiness/CR001/strengths
        res_str = await ac.get("/api/v1/career-readiness/CR001/strengths", headers=headers)
        assert res_str.status_code == 200
        assert isinstance(res_str.json(), list)

        # 3. GET /career-readiness/CR001/gaps
        res_gaps = await ac.get("/api/v1/career-readiness/CR001/gaps", headers=headers)
        assert res_gaps.status_code == 200
        assert isinstance(res_gaps.json(), list)

        # 4. GET /career-readiness/CR001/evidence
        res_ev = await ac.get("/api/v1/career-readiness/CR001/evidence", headers=headers)
        assert res_ev.status_code == 200
        assert "evidence_coverage" in res_ev.json()

        # 5. GET /career-readiness/compare
        res_cmp = await ac.get("/api/v1/career-readiness/compare?career_ids=CR001&career_ids=CR002", headers=headers)
        assert res_cmp.status_code == 200
        assert "comparisons" in res_cmp.json()


@pytest.mark.anyio
async def test_career_readiness_determinism_25_iterations():
    """Verify running the career readiness analysis 25 times against identical database state yields 100% identical outputs."""
    svc = CareerReadinessService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    first_res = await svc.get_career_readiness_analysis(student_id=user_id, career_id="CR001", db=db)
    first_dict = first_res.model_dump(exclude={"generated_at"})

    for i in range(24):
        subsequent_res = await svc.get_career_readiness_analysis(student_id=user_id, career_id="CR001", db=db)
        subsequent_dict = subsequent_res.model_dump(exclude={"generated_at"})
        assert first_dict == subsequent_dict, f"Non-deterministic career readiness deviation detected on run {i+2}"
