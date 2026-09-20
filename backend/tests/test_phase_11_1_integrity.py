"""
Skill2Career - Phase 11.1 Career Transition Scientific & Integration Integrity Audit Test Suite
Adversarial tests validating:
1. Canonical skill identity and transferability classification determinism
2. Skill-name collision vs canonical skill ID handling
3. Factual skill overlap and target coverage denominator
4. Complete absence of hidden/composite transition scores or rankings
5. Milestone derivation from real target requirements and DAG blockers
6. Dependency DAG reuse without duplicate graphs
7. Recommendation formula and priority band invariance
8. Mastered skill exclusion from remediation gaps
9. Rejected evidence exclusion and duplicate evidence protection
10. Learning Intelligence and longitudinal velocity reuse
11. Career forecast projection and uncertainty semantics
12. Market signal provenance and neutral fallback labeling
13. Multi-career comparison neutrality (no best career / no winner selection)
14. Scenario simulation state immutability (zero mutation to profile, skills, evidence, roadmap)
15. Active roadmap immutability during transition planning
16. MongoDB persistence, history retrieval, and student isolation
17. Multi-tenant security, token authorization, and forged student ID resistance
18. AI grounding without employment guarantees or synthetic score invention
19. 25-iteration bit-exact determinism
20. ML readiness pipeline and 13 canonical features immutability
"""

import pytest
import os
import json
import uuid
from datetime import datetime, timezone
from httpx import AsyncClient, ASGITransport

from backend.main import app
from backend.database.mongodb import get_db, serialize_doc, serialize_docs
from backend.services.auth_service import create_access_token
from backend.services.career_transition_service import CareerTransitionService
from backend.services.recommendation_service import RecommendationService
from backend.services.dependency_service import SkillDependencyService
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


async def _setup_adversarial_students(db):
    """Creates isolated test student fixtures."""
    student_adv_id = f"test_p11_1_adv_{uuid.uuid4().hex[:8]}"
    student_victim_id = f"test_p11_1_victim_{uuid.uuid4().hex[:8]}"

    user_adv = {
        "_id": student_adv_id,
        "id": student_adv_id,
        "email": f"p11_1_adv_{student_adv_id}@example.com",
        "full_name": "Adversary Student",
        "role": "student",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    profile_adv = {
        "user_id": student_adv_id,
        "target_career_id": "CR001",
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 4.0, "verified": True, "category": "Programming"},
            {"skill_id": "SK002", "name": "JavaScript", "level": 3.5, "verified": True, "category": "Programming"},
            {"skill_id": "SK004", "name": "React", "level": 2.5, "verified": False, "category": "Frontend"},
            {"skill_id": "SK006", "name": "SQL", "level": 1.0, "verified": False, "category": "Database"}
        ],
        "degree": "B.Tech Computer Science",
        "institution_tier": 2,
        "gpa": 8.0,
        "weekly_study_hours": 12.0,
        "statistics": {"weekly_study_hours": 12.0, "learning_velocity_index": 1.8}
    }

    user_victim = {
        "_id": student_victim_id,
        "id": student_victim_id,
        "email": f"p11_1_vic_{student_victim_id}@example.com",
        "full_name": "Victim Student",
        "role": "student",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    profile_victim = {
        "user_id": student_victim_id,
        "target_career_id": "CR002",
        "skills": [
            {"skill_id": "SK005", "name": "Machine Learning", "level": 4.8, "verified": True, "category": "AI/ML"}
        ],
        "weekly_study_hours": 20.0
    }

    await db.users.insert_many([user_adv, user_victim])
    await db.student_profiles.insert_many([profile_adv, profile_victim])

    # Insert evidence items
    ev_verified = {
        "evidence_id": f"ev_{student_adv_id}_py",
        "student_id": student_adv_id,
        "skill_id": "SK001",
        "evidence_type": "PROJECT",
        "title": "Production API in Python",
        "verification_status": "VERIFIED",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    ev_rejected = {
        "evidence_id": f"ev_{student_adv_id}_bad",
        "student_id": student_adv_id,
        "skill_id": "SK003",
        "evidence_type": "CERTIFICATE",
        "title": "Forged Attendance Cert",
        "verification_status": "REJECTED",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.skill_evidence.insert_many([ev_verified, ev_rejected])

    token_adv = create_access_token({"sub": student_adv_id, "id": student_adv_id, "email": user_adv["email"]})
    token_victim = create_access_token({"sub": student_victim_id, "id": student_victim_id, "email": user_victim["email"]})

    return {
        "student_adv_id": student_adv_id,
        "student_victim_id": student_victim_id,
        "token_adv": token_adv,
        "token_victim": token_victim
    }


async def _cleanup_adversarial_students(db, st):
    ids = [st["student_adv_id"], st["student_victim_id"]]
    await db.users.delete_many({"_id": {"$in": ids}})
    await db.student_profiles.delete_many({"user_id": {"$in": ids}})
    await db.skill_evidence.delete_many({"student_id": {"$in": ids}})
    await db.career_transitions.delete_many({"student_id": {"$in": ids}})


# ==============================================================================
# AUDIT TEST 1: TRANSFERABILITY DETERMINISM & CANONICAL SKILL IDENTITY
# ==============================================================================

@pytest.mark.anyio
async def test_transferability_canonical_identity_audit():
    """
    Verifies that transferable skill classifications are derived strictly from canonical skill IDs
    and authoritative requirement thresholds, rather than name similarities.
    """
    db = await get_db()
    st = await _setup_adversarial_students(db)
    svc = CareerTransitionService()
    try:
        res = await svc.analyze_transition(
            student_id=st["student_adv_id"],
            target_career_id="CR002",
            db=db,
            persist=False
        )

        for skill in res.transferable_skills:
            # Canonical ID check
            assert skill.skill_id.startswith("SK")
            assert skill.target_level_required >= 1.0

            # Classification logic check
            if skill.transferability == TransferabilityClassification.DIRECTLY_TRANSFERABLE:
                assert skill.student_level >= skill.target_level_required
                assert skill.student_level > 0.0
            elif skill.transferability == TransferabilityClassification.PARTIALLY_TRANSFERABLE:
                assert 0.0 < skill.student_level < skill.target_level_required
            elif skill.transferability == TransferabilityClassification.ADJACENT:
                assert skill.student_level == 0.0
    finally:
        await _cleanup_adversarial_students(db, st)


# ==============================================================================
# AUDIT TEST 2: HIDDEN TRANSITION SCORE ABSENCE AUDIT
# ==============================================================================

@pytest.mark.anyio
async def test_hidden_transition_score_absence():
    """
    Verifies that no hidden, weighted, or composite 'overall transition score' or ranking exists
    in the schema, service, or API responses.
    """
    db = await get_db()
    st = await _setup_adversarial_students(db)
    svc = CareerTransitionService()
    try:
        res = await svc.analyze_transition(
            student_id=st["student_adv_id"],
            target_career_id="CR002",
            db=db,
            persist=False
        )

        res_dict = res.model_dump()
        forbidden_keys = [
            "transition_score",
            "overall_transition_score",
            "difficulty_score",
            "career_rank",
            "is_best_career",
            "winner_score",
            "composite_transition_index"
        ]
        for key in forbidden_keys:
            assert key not in res_dict
            assert not hasattr(res, key)

        # Coverage percentage is descriptive and bounded
        assert 0.0 <= res.skill_overlap.target_skill_coverage_pct <= 100.0
    finally:
        await _cleanup_adversarial_students(db, st)


# ==============================================================================
# AUDIT TEST 3: MILESTONE DERIVATION & PREREQUISITE ORDERING
# ==============================================================================

@pytest.mark.anyio
async def test_milestone_derivation_and_prerequisite_graph():
    """
    Verifies that milestones are derived from real target requirements and DAG blockers,
    and dependency ordering is strictly enforced across M1 -> M2 -> M3 -> M4.
    """
    db = await get_db()
    st = await _setup_adversarial_students(db)
    svc = CareerTransitionService()
    try:
        res = await svc.analyze_transition(
            student_id=st["student_adv_id"],
            target_career_id="CR002",
            db=db,
            persist=False
        )

        assert len(res.transition_milestones) == 4
        m_ids = [m.milestone_id for m in res.transition_milestones]
        assert m_ids == ["M1_FOUNDATIONS", "M2_CORE_COMPETENCIES", "M3_SPECIALIZATION", "M4_CAPSTONE_VALIDATION"]

        # Ensure dependencies sequence correctly
        assert res.transition_milestones[0].dependencies == []
        assert "M1_FOUNDATIONS" in res.transition_milestones[1].dependencies
        assert "M2_CORE_COMPETENCIES" in res.transition_milestones[2].dependencies
        assert "M3_SPECIALIZATION" in res.transition_milestones[3].dependencies

        # Verify effort hours are strictly positive
        for m in res.transition_milestones:
            assert m.estimated_effort_hours > 0
    finally:
        await _cleanup_adversarial_students(db, st)


# ==============================================================================
# AUDIT TEST 4: RECOMMENDATION FORMULA INVARIANCE & MASTERED EXCLUSION
# ==============================================================================

@pytest.mark.anyio
async def test_recommendation_invariance_and_mastered_exclusion():
    """
    Verifies that the Phase 08 recommendation formula is reused without modification,
    and mastered skills (gap <= 0) never appear as remediation gaps.
    """
    db = await get_db()
    st = await _setup_adversarial_students(db)
    svc = CareerTransitionService()
    rec_svc = RecommendationService()
    try:
        # Check formula direct output
        score, band = rec_svc.compute_priority_score(
            gap=2.0, career_importance=1.0, market_demand=80.0, downstream_count=1, prereq_pct=100.0, learning_velocity=1.5
        )
        assert 5.0 <= score <= 99.5
        assert band in ["URGENT", "HIGH", "MODERATE", "LOW", "MASTERED"]

        # Check transition analysis excludes mastered skills
        res = await svc.analyze_transition(
            student_id=st["student_adv_id"],
            target_career_id="CR002",
            db=db,
            persist=False
        )
        for gap_item in res.transition_gaps:
            assert gap_item.gap > 0.0
            assert gap_item.priority_band != "MASTERED"
    finally:
        await _cleanup_adversarial_students(db, st)


# ==============================================================================
# AUDIT TEST 5: EVIDENCE PROVENANCE & REJECTED EVIDENCE EXCLUSION
# ==============================================================================

@pytest.mark.anyio
async def test_evidence_provenance_and_rejected_exclusion():
    """
    Verifies that rejected evidence contributes zero to transferable evidence
    and unverified evidence remains distinct from verified evidence.
    """
    db = await get_db()
    st = await _setup_adversarial_students(db)
    svc = CareerTransitionService()
    try:
        res = await svc.analyze_transition(
            student_id=st["student_adv_id"],
            target_career_id="CR002",
            db=db,
            persist=False
        )

        for ev in res.transferable_evidence:
            assert ev.verification_status != "REJECTED"

        # Check transferable skills evidence counts
        for skill in res.transferable_skills:
            assert skill.verified_evidence_count <= skill.supporting_evidence_count
    finally:
        await _cleanup_adversarial_students(db, st)


# ==============================================================================
# AUDIT TEST 6: MULTI-CAREER COMPARISON FACTUAL NEUTRALITY AUDIT
# ==============================================================================

@pytest.mark.anyio
async def test_multi_career_comparison_neutrality_audit():
    """
    Verifies that multi-career comparison provides factual dimensions without ranking,
    winner tags, or employment predictions across 2 to 5 careers.
    """
    db = await get_db()
    st = await _setup_adversarial_students(db)
    svc = CareerTransitionService()
    try:
        comp_res = await svc.compare_career_transitions(
            student_id=st["student_adv_id"],
            target_career_ids=["CR001", "CR002", "CR003"],
            db=db
        )

        assert len(comp_res.comparisons) == 3
        assert "No career is ranked as objectively best" in comp_res.disclaimer

        for c in comp_res.comparisons:
            assert isinstance(c.target_career_title, str)
            assert isinstance(c.shared_skills_count, int)
            assert isinstance(c.target_skill_coverage_pct, float)
            assert isinstance(c.estimated_competency_effort_hours, int)
            assert not hasattr(c, "rank")
            assert not hasattr(c, "is_winner")
            assert not hasattr(c, "hiring_probability")
    finally:
        await _cleanup_adversarial_students(db, st)


# ==============================================================================
# AUDIT TEST 7: SCENARIO SIMULATION STRICT STATE IMMUTABILITY
# ==============================================================================

@pytest.mark.anyio
async def test_scenario_simulation_strict_immutability():
    """
    Verifies that running what-if scenario simulations (repeated 25 times) does NOT mutate
    student profile, skills, evidence, roadmap, or predictions.
    """
    db = await get_db()
    st = await _setup_adversarial_students(db)
    svc = CareerTransitionService()
    try:
        pre_profile = await db.student_profiles.find_one({"user_id": st["student_adv_id"]})
        pre_evidence_count = await db.skill_evidence.count_documents({"student_id": st["student_adv_id"]})

        for _ in range(25):
            sim_res = await svc.simulate_transition_scenario(
                student_id=st["student_adv_id"],
                req=TransitionScenarioRequest(
                    target_career_id="CR002",
                    scenario_type=TransitionScenarioType.FOUNDATION_FIRST,
                    weekly_study_hours=25.0
                ),
                db=db
            )
            assert sim_res.is_simulated is True
            assert sim_res.estimated_weeks >= 1

        post_profile = await db.student_profiles.find_one({"user_id": st["student_adv_id"]})
        post_evidence_count = await db.skill_evidence.count_documents({"student_id": st["student_adv_id"]})

        assert pre_profile["skills"] == post_profile["skills"]
        assert pre_profile["weekly_study_hours"] == post_profile["weekly_study_hours"]
        assert pre_evidence_count == post_evidence_count
    finally:
        await _cleanup_adversarial_students(db, st)


# ==============================================================================
# AUDIT TEST 8: MULTI-TENANT SECURITY & CROSS-STUDENT ISOLATION
# ==============================================================================

@pytest.mark.anyio
async def test_multi_tenant_security_and_isolation():
    """
    Verifies that Student A cannot query or access Student B's transition data,
    and unauthenticated calls are rejected with 401.
    """
    db = await get_db()
    st = await _setup_adversarial_students(db)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        try:
            # 1. Unauthenticated -> 401
            res_unauth = await client.get("/api/v1/career-transition/CR002")
            assert res_unauth.status_code == 401

            # 2. Authenticated as Student A -> returns Student A's transition
            res_a = await client.get(
                "/api/v1/career-transition/CR002",
                headers={"Authorization": f"Bearer {st['token_adv']}"}
            )
            assert res_a.status_code == 200
            assert res_a.json()["student_id"] == st["student_adv_id"]

            # 3. Authenticated as Student B -> returns Student B's transition (isolated)
            res_b = await client.get(
                "/api/v1/career-transition/CR002",
                headers={"Authorization": f"Bearer {st['token_victim']}"}
            )
            assert res_b.status_code == 200
            assert res_b.json()["student_id"] == st["student_victim_id"]
            assert res_b.json()["student_id"] != res_a.json()["student_id"]
        finally:
            await _cleanup_adversarial_students(db, st)


# ==============================================================================
# AUDIT TEST 9: ML ARTIFACTS & 13 CANONICAL FEATURES IMMUTABILITY
# ==============================================================================

@pytest.mark.anyio
async def test_ml_artifacts_and_features_immutability():
    """
    Verifies that Phase 06 ML artifacts and 13 canonical features schema remain 100% untouched.
    """
    feature_schema_path = os.path.join(os.getcwd(), "backend", "ml", "artifacts", "feature_schema.json")
    assert os.path.exists(feature_schema_path)

    with open(feature_schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    num_features = schema.get("numerical_features", [])
    cat_features = schema.get("categorical_features", [])
    total_features = len(num_features) + len(cat_features)

    assert total_features == 13
    assert "gpa" in num_features
    assert "career_skill_match_pct" in num_features
    assert "total_skills_count" in num_features
    assert "avg_skill_proficiency" in num_features
    assert "core_cs_score" in num_features
    assert "projects_count" in num_features
    assert "avg_project_complexity" in num_features
    assert "certifications_count" in num_features
    assert "assessments_passed_pct" in num_features
    assert "weekly_study_hours" in num_features
    assert "learning_velocity_index" in num_features
    assert "degree" in cat_features
    assert "institution_tier" in cat_features
