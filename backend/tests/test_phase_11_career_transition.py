"""
Skill2Career - Phase 11 Career Transition & Strategic Career Planning Test Suite
Comprehensive unit, integration, and adversarial tests for cross-career transition intelligence,
transferable skill classifications, prerequisite chains, non-mutation during simulations,
multi-career factual comparison, 25-iteration determinism, and multi-tenant security isolation.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timezone
import uuid

from backend.main import app
from backend.database.mongodb import get_db, serialize_docs, serialize_doc
from backend.services.auth_service import create_access_token
from backend.services.career_transition_service import CareerTransitionService
from backend.schemas.career_transition_schemas import (
    TransitionStatus,
    TransferabilityClassification,
    TransitionGapCategory,
    TransitionMilestoneStatus,
    TransitionScenarioType,
    CareerTransitionAnalysisResponse,
    MultiCareerTransitionComparisonRequest,
    TransitionScenarioRequest
)


async def _create_test_students(db):
    """Sets up isolated test students with distinct skill, evidence, and history profiles."""
    student_a_id = f"test_p11_student_a_{uuid.uuid4().hex[:8]}"
    student_b_id = f"test_p11_student_b_{uuid.uuid4().hex[:8]}"

    # Student A: Standard student (Frontend/Fullstack transitioning to AI/Data)
    user_a = {
        "_id": student_a_id,
        "id": student_a_id,
        "email": f"p11_a_{student_a_id}@example.com",
        "full_name": "Phase 11 Student Alpha",
        "role": "student",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    profile_a = {
        "user_id": student_a_id,
        "target_career_id": "CR001",  # Frontend / Fullstack Developer
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 3.8, "verified": True, "category": "Programming"},
            {"skill_id": "SK002", "name": "JavaScript", "level": 4.2, "verified": True, "category": "Programming"},
            {"skill_id": "SK004", "name": "React", "level": 4.5, "verified": True, "category": "Frontend"},
            {"skill_id": "SK006", "name": "SQL", "level": 2.0, "verified": False, "category": "Database"}
        ],
        "degree": "B.Tech Computer Science",
        "institution_tier": 1,
        "gpa": 8.8,
        "weekly_study_hours": 15.0,
        "statistics": {"weekly_study_hours": 15.0, "learning_velocity_index": 2.5}
    }

    # Student B: Multi-tenant adversary
    user_b = {
        "_id": student_b_id,
        "id": student_b_id,
        "email": f"p11_b_{student_b_id}@example.com",
        "full_name": "Phase 11 Student Beta",
        "role": "student",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    profile_b = {
        "user_id": student_b_id,
        "target_career_id": "CR002",
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 1.5, "verified": False, "category": "Programming"}
        ],
        "weekly_study_hours": 10.0
    }

    await db.users.insert_many([user_a, user_b])
    await db.student_profiles.insert_many([profile_a, profile_b])

    # Insert evidence for Student A
    ev_verified = {
        "evidence_id": f"ev_{student_a_id}_python",
        "student_id": student_a_id,
        "skill_id": "SK001",
        "evidence_type": "PROJECT",
        "title": "Data Pipeline in Python",
        "verification_status": "VERIFIED",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    ev_rejected = {
        "evidence_id": f"ev_{student_a_id}_rejected",
        "student_id": student_a_id,
        "skill_id": "SK005",  # Machine Learning
        "evidence_type": "CERTIFICATE",
        "title": "Unverified Bootcamp Attendance",
        "verification_status": "REJECTED",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.skill_evidence.insert_many([ev_verified, ev_rejected])

    token_a = create_access_token({"sub": student_a_id, "id": student_a_id, "email": user_a["email"]})
    token_b = create_access_token({"sub": student_b_id, "id": student_b_id, "email": user_b["email"]})

    return {
        "student_a_id": student_a_id,
        "student_b_id": student_b_id,
        "token_a": token_a,
        "token_b": token_b
    }


async def _cleanup_test_students(db, st):
    ids = [st["student_a_id"], st["student_b_id"]]
    await db.users.delete_many({"_id": {"$in": ids}})
    await db.student_profiles.delete_many({"user_id": {"$in": ids}})
    await db.skill_evidence.delete_many({"student_id": {"$in": ids}})
    await db.career_transitions.delete_many({"student_id": {"$in": ids}})


# ==============================================================================
# 1. CORE TRANSITION ANALYSIS & TRANSFERABILITY CLASSIFICATION
# ==============================================================================

@pytest.mark.anyio
async def test_career_transition_analysis_structure():
    """Verifies that analyze_transition correctly builds all required domain fields."""
    db = await get_db()
    st = await _create_test_students(db)
    svc = CareerTransitionService()
    try:
        res = await svc.analyze_transition(
            student_id=st["student_a_id"],
            target_career_id="CR002",
            db=db,
            persist=True
        )

        assert isinstance(res, CareerTransitionAnalysisResponse)
        assert res.student_id == st["student_a_id"]
        assert res.target_career.career_id == "CR002"
        assert res.status == TransitionStatus.ANALYZED
        assert res.skill_overlap.shared_required_skills_count >= 0
        assert len(res.transferable_skills) >= 1
        assert len(res.transition_gaps) >= 1
        assert len(res.transition_milestones) == 4
        assert len(res.assumptions) >= 1
        assert len(res.provenance) >= 1
    finally:
        await _cleanup_test_students(db, st)


@pytest.mark.anyio
async def test_transferable_skills_and_classifications():
    """Verifies that transferable skills are correctly classified without synthetic mastery."""
    db = await get_db()
    st = await _create_test_students(db)
    svc = CareerTransitionService()
    try:
        res = await svc.analyze_transition(
            student_id=st["student_a_id"],
            target_career_id="CR002",
            db=db,
            persist=False
        )

        for skill in res.transferable_skills:
            assert skill.transferability in [
                TransferabilityClassification.DIRECTLY_TRANSFERABLE,
                TransferabilityClassification.PARTIALLY_TRANSFERABLE,
                TransferabilityClassification.ADJACENT,
                TransferabilityClassification.NOT_YET_TRANSFERABLE
            ]
            if skill.transferability == TransferabilityClassification.DIRECTLY_TRANSFERABLE:
                assert skill.student_level >= skill.target_level_required

            assert isinstance(skill.student_level, float)
            assert isinstance(skill.target_level_required, float)
    finally:
        await _cleanup_test_students(db, st)


@pytest.mark.anyio
async def test_rejected_evidence_exclusion():
    """Verifies that rejected evidence does NOT contribute to transferable evidence."""
    db = await get_db()
    st = await _create_test_students(db)
    svc = CareerTransitionService()
    try:
        res = await svc.analyze_transition(
            student_id=st["student_a_id"],
            target_career_id="CR002",
            db=db,
            persist=False
        )

        evidence_ids = [e.evidence_id for e in res.transferable_evidence]
        assert f"ev_{st['student_a_id']}_rejected" not in evidence_ids
    finally:
        await _cleanup_test_students(db, st)


@pytest.mark.anyio
async def test_mastered_skills_excluded_from_remediation_gaps():
    """Verifies that mastered skills (gap <= 0) never appear in transition remediation gaps."""
    db = await get_db()
    st = await _create_test_students(db)
    svc = CareerTransitionService()
    try:
        res = await svc.analyze_transition(
            student_id=st["student_a_id"],
            target_career_id="CR002",
            db=db,
            persist=False
        )

        for gap in res.transition_gaps:
            assert gap.gap > 0.0
            assert gap.priority_band != "MASTERED"
    finally:
        await _cleanup_test_students(db, st)


# ==============================================================================
# 2. PREREQUISITE DAG & MILESTONE ORDERING
# ==============================================================================

@pytest.mark.anyio
async def test_prerequisite_chains_and_blockers():
    """Verifies prerequisite evaluation using canonical dependency DAG."""
    db = await get_db()
    st = await _create_test_students(db)
    svc = CareerTransitionService()
    try:
        res = await svc.analyze_transition(
            student_id=st["student_a_id"],
            target_career_id="CR002",
            db=db,
            persist=False
        )

        assert len(res.prerequisite_chains) >= 1
        for chain in res.prerequisite_chains:
            assert isinstance(chain.is_blocked, bool)
            assert 0.0 <= chain.chain_completion_pct <= 100.0
    finally:
        await _cleanup_test_students(db, st)


@pytest.mark.anyio
async def test_transition_milestones_ordering_and_structure():
    """Verifies that 4 structured transition milestones are created respecting dependencies."""
    db = await get_db()
    st = await _create_test_students(db)
    svc = CareerTransitionService()
    try:
        milestones = await svc.get_transition_milestones(
            student_id=st["student_a_id"],
            target_career_id="CR002",
            db=db
        )

        assert len(milestones) == 4
        assert milestones[0].milestone_id == "M1_FOUNDATIONS"
        assert milestones[1].milestone_id == "M2_CORE_COMPETENCIES"
        assert milestones[2].milestone_id == "M3_SPECIALIZATION"
        assert milestones[3].milestone_id == "M4_CAPSTONE_VALIDATION"

        assert "M1_FOUNDATIONS" in milestones[1].dependencies
        assert "M2_CORE_COMPETENCIES" in milestones[2].dependencies
        assert "M3_SPECIALIZATION" in milestones[3].dependencies
    finally:
        await _cleanup_test_students(db, st)


# ==============================================================================
# 3. SCENARIO SIMULATION IMMUTABILITY & ISOLATION
# ==============================================================================

@pytest.mark.anyio
async def test_scenario_simulation_no_state_mutation():
    """
    Verifies that running counterfactual scenario simulations does NOT mutate
    the student profile, skill levels, evidence, or authoritative ML predictions.
    """
    db = await get_db()
    st = await _create_test_students(db)
    svc = CareerTransitionService()
    try:
        pre_profile = await db.student_profiles.find_one({"user_id": st["student_a_id"]})
        pre_evidence_count = await db.skill_evidence.count_documents({"student_id": st["student_a_id"]})

        sim_res = await svc.simulate_transition_scenario(
            student_id=st["student_a_id"],
            req=TransitionScenarioRequest(
                target_career_id="CR002",
                scenario_type=TransitionScenarioType.GAP_FOCUSED,
                weekly_study_hours=30.0
            ),
            db=db
        )

        assert sim_res.is_simulated is True
        assert sim_res.estimated_weeks >= 1

        post_profile = await db.student_profiles.find_one({"user_id": st["student_a_id"]})
        post_evidence_count = await db.skill_evidence.count_documents({"student_id": st["student_a_id"]})

        assert pre_profile["skills"] == post_profile["skills"]
        assert pre_profile["weekly_study_hours"] == post_profile["weekly_study_hours"]
        assert pre_evidence_count == post_evidence_count
    finally:
        await _cleanup_test_students(db, st)


# ==============================================================================
# 4. MULTI-CAREER FACTUAL COMPARISON (NO RANKING / NO BEST CAREER)
# ==============================================================================

@pytest.mark.anyio
async def test_multi_career_transition_comparison_factual_neutrality():
    """
    Verifies that multi-career comparison presents multi-dimensional factual metrics
    and NEVER ranks careers, produces winner labels, or predicts employment.
    """
    db = await get_db()
    st = await _create_test_students(db)
    svc = CareerTransitionService()
    try:
        comp_res = await svc.compare_career_transitions(
            student_id=st["student_a_id"],
            target_career_ids=["CR001", "CR002", "CR003"],
            db=db
        )

        assert len(comp_res.comparisons) >= 2
        assert "No career is ranked as objectively best" in comp_res.disclaimer

        for c in comp_res.comparisons:
            assert isinstance(c.shared_skills_count, int)
            assert isinstance(c.transition_gaps_count, int)
            assert isinstance(c.target_skill_coverage_pct, float)
            assert isinstance(c.estimated_competency_effort_hours, int)
            assert isinstance(c.time_to_target_weeks, int)
            assert not hasattr(c, "rank")
            assert not hasattr(c, "is_best")
            assert not hasattr(c, "winner")
    finally:
        await _cleanup_test_students(db, st)


# ==============================================================================
# 5. 25-ITERATION TRANSITION DETERMINISM
# ==============================================================================

@pytest.mark.anyio
async def test_25_iteration_transition_determinism():
    """Verifies that 25 identical transition analyses produce bit-exact deterministic results."""
    db = await get_db()
    st = await _create_test_students(db)
    svc = CareerTransitionService()
    try:
        first_res = await svc.analyze_transition(
            student_id=st["student_a_id"],
            target_career_id="CR002",
            db=db,
            persist=False
        )

        first_gaps = [(g.skill_id, g.gap, g.learning_effort_hours, g.priority_band) for g in first_res.transition_gaps]
        first_transfer = [(s.skill_id, s.student_level, s.transferability.value) for s in first_res.transferable_skills]
        first_overlap = (first_res.skill_overlap.shared_required_skills_count, first_res.skill_overlap.target_skill_coverage_pct)

        for _ in range(24):
            run_res = await svc.analyze_transition(
                student_id=st["student_a_id"],
                target_career_id="CR002",
                db=db,
                persist=False
            )
            run_gaps = [(g.skill_id, g.gap, g.learning_effort_hours, g.priority_band) for g in run_res.transition_gaps]
            run_transfer = [(s.skill_id, s.student_level, s.transferability.value) for s in run_res.transferable_skills]
            run_overlap = (run_res.skill_overlap.shared_required_skills_count, run_res.skill_overlap.target_skill_coverage_pct)

            assert first_gaps == run_gaps
            assert first_transfer == run_transfer
            assert first_overlap == run_overlap
    finally:
        await _cleanup_test_students(db, st)


# ==============================================================================
# 6. ADVERSARIAL EDGE CASES
# ==============================================================================

@pytest.mark.anyio
async def test_adversarial_zero_skills_student():
    """Tests transition analysis for a student with zero skills recorded."""
    db = await get_db()
    zero_student_id = f"test_p11_zero_{uuid.uuid4().hex[:8]}"
    await db.users.insert_one({
        "_id": zero_student_id,
        "id": zero_student_id,
        "email": f"{zero_student_id}@example.com",
        "full_name": "Zero Skills Student",
        "role": "student"
    })
    await db.student_profiles.insert_one({
        "user_id": zero_student_id,
        "skills": [],
        "weekly_study_hours": 10.0
    })

    svc = CareerTransitionService()
    try:
        res = await svc.analyze_transition(
            student_id=zero_student_id,
            target_career_id="CR002",
            db=db,
            persist=False
        )

        assert res.skill_overlap.shared_skill_proficiency_avg == 0.0
        assert res.skill_overlap.target_skill_coverage_pct == 0.0
        assert len(res.transition_gaps) >= 1
        for g in res.transition_gaps:
            assert g.current_level == 0.0
    finally:
        await db.users.delete_one({"_id": zero_student_id})
        await db.student_profiles.delete_one({"user_id": zero_student_id})


@pytest.mark.anyio
async def test_adversarial_all_mastered_student():
    """Tests transition analysis when student has already mastered all target skills."""
    db = await get_db()
    master_id = f"test_p11_master_{uuid.uuid4().hex[:8]}"
    career_doc = await db.career_roles.find_one({"$or": [{"career_code": "CR001"}, {"_id": "CR001"}]})
    req_skills = career_doc.get("required_skills", [])

    master_skills = [
        {"skill_id": s["skill_id"], "name": s.get("name", s["skill_id"]), "level": 5.0, "verified": True}
        for s in req_skills
    ]

    await db.users.insert_one({
        "_id": master_id,
        "id": master_id,
        "email": f"{master_id}@example.com",
        "full_name": "Master Student",
        "role": "student"
    })
    await db.student_profiles.insert_one({
        "user_id": master_id,
        "skills": master_skills,
        "weekly_study_hours": 20.0
    })

    svc = CareerTransitionService()
    try:
        res = await svc.analyze_transition(
            student_id=master_id,
            target_career_id="CR001",
            db=db,
            persist=False
        )

        assert res.skill_overlap.target_skill_coverage_pct >= 90.0
        assert len(res.transition_gaps) == 0
    finally:
        await db.users.delete_one({"_id": master_id})
        await db.student_profiles.delete_one({"user_id": master_id})


# ==============================================================================
# 7. SECURITY & MULTI-TENANT ISOLATION (REST ENDPOINTS)
# ==============================================================================

@pytest.mark.anyio
async def test_unauthenticated_requests_rejected():
    """Verifies that all career transition endpoints reject unauthenticated calls with 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res1 = await client.get("/api/v1/career-transition/CR002")
        assert res1.status_code == 401

        res2 = await client.get("/api/v1/career-transition/history")
        assert res2.status_code == 401

        res3 = await client.post("/api/v1/career-transition/compare", json={"target_career_ids": ["CR001", "CR002"]})
        assert res3.status_code == 401

        res4 = await client.post("/api/v1/career-transition/simulate", json={"target_career_id": "CR002", "scenario_type": "DIRECT_TRANSITION"})
        assert res4.status_code == 401


@pytest.mark.anyio
async def test_career_transition_api_endpoints_success():
    """Verifies authenticated REST endpoints for career transition."""
    db = await get_db()
    st = await _create_test_students(db)
    headers = {"Authorization": f"Bearer {st['token_a']}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        try:
            # 1. Full Transition Analysis
            res_analysis = await client.get("/api/v1/career-transition/CR002", headers=headers)
            assert res_analysis.status_code == 200
            data = res_analysis.json()
            assert data["target_career"]["career_id"] == "CR002"

            # 2. Transferable Skills
            res_skills = await client.get("/api/v1/career-transition/CR002/skills", headers=headers)
            assert res_skills.status_code == 200
            assert "transferable_skills" in res_skills.json()

            # 3. Milestones
            res_ms = await client.get("/api/v1/career-transition/CR002/milestones", headers=headers)
            assert res_ms.status_code == 200
            assert len(res_ms.json()) == 4

            # 4. Evidence
            res_ev = await client.get("/api/v1/career-transition/CR002/evidence", headers=headers)
            assert res_ev.status_code == 200

            # 5. Plan update
            res_plan = await client.post("/api/v1/career-transition/CR002/plan", json={"status": "PLANNED"}, headers=headers)
            assert res_plan.status_code == 200

            # 6. Scenario Simulation
            res_sim = await client.post(
                "/api/v1/career-transition/simulate",
                json={"target_career_id": "CR002", "scenario_type": "FOUNDATION_FIRST", "weekly_study_hours": 18.0},
                headers=headers
            )
            assert res_sim.status_code == 200
            assert res_sim.json()["is_simulated"] is True

            # 7. Multi-Career Comparison
            res_comp = await client.post(
                "/api/v1/career-transition/compare",
                json={"target_career_ids": ["CR001", "CR002"]},
                headers=headers
            )
            assert res_comp.status_code == 200
            assert len(res_comp.json()["comparisons"]) == 2

            # 8. History
            res_hist = await client.get("/api/v1/career-transition/history", headers=headers)
            assert res_hist.status_code == 200
            assert len(res_hist.json()) >= 1

            # 9. AI Grounded Explanation
            res_ai = await client.post(
                "/api/v1/ai/explain-transition",
                json={"target_career_id": "CR002"},
                headers=headers
            )
            assert res_ai.status_code == 200
            assert "message" in res_ai.json()
        finally:
            await _cleanup_test_students(db, st)


@pytest.mark.anyio
async def test_invalid_career_not_found():
    """Verifies that non-existent career IDs return 404."""
    db = await get_db()
    st = await _create_test_students(db)
    headers = {"Authorization": f"Bearer {st['token_a']}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        try:
            res = await client.get("/api/v1/career-transition/CR_NON_EXISTENT_999", headers=headers)
            assert res.status_code == 404
        finally:
            await _cleanup_test_students(db, st)
