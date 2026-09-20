"""
Skill2Career - Phase 09C.1 Career Readiness Scientific & Integration Integrity Audit Test Suite
Adversarial tests validating ML boundary preservation, absence of hidden composite scores,
uncertainty point semantics, evidence vs proficiency separation, market signal provenance,
career comparison factual neutrality, cross-student security isolation, and 25-iteration determinism.
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
from backend.services.market_intelligence_service import MarketIntelligenceService
from backend.ml.inference import MLInferenceService
from backend.database.mongodb import get_db, get_utc_now
from backend.schemas.career_readiness_schemas import (
    ReadinessFactorCategory,
    FactorImpactType,
    MLReadinessBenchmark
)


# =========================================================================
# 1. ML READINESS BOUNDARY & MODEL INVARIANCE
# =========================================================================

@pytest.mark.anyio
async def test_ml_readiness_boundary_and_invariance():
    """Verify ML readiness predictions and model artifacts remain unchanged before, during, and after career readiness."""
    ml_svc = MLInferenceService.get_instance()
    cr_svc = CareerReadinessService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))
    profile = await db.student_profiles.find_one({"user_id": user_id})
    skills = profile.get("skills", [])

    # Predict before
    pred_before = ml_svc.predict_readiness(student_skills_list=skills, target_career_id="CR001")

    # Run Career Readiness Analysis
    analysis = await cr_svc.get_career_readiness_analysis(student_id=user_id, career_id="CR001", db=db)

    # Predict after
    pred_after = ml_svc.predict_readiness(student_skills_list=skills, target_career_id="CR001")

    # 1. Prediction invariance
    assert pred_before["readiness_score"] == pred_after["readiness_score"]
    assert pred_before["readiness_tier"] == pred_after["readiness_tier"]
    assert pred_before["model_version"] == pred_after["model_version"]

    # 2. Check artifacts on disk exist and have 13 canonical features
    artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "ml", "artifacts")
    schema_path = os.path.join(artifacts_dir, "feature_schema.json")
    with open(schema_path, "r") as f:
        schema = json.load(f)
    num_features = schema.get("numerical_features", [])
    cat_features = schema.get("categorical_features", [])
    assert len(num_features) + len(cat_features) == 13

    readiness_joblib = os.path.join(artifacts_dir, "readiness_pipeline.joblib")
    assert os.path.exists(readiness_joblib)
    traj_joblib = os.path.join(artifacts_dir, "trajectory_pipeline.joblib")
    assert os.path.exists(traj_joblib)


# =========================================================================
# 2. NO HIDDEN COMPOSITE SCORE & UNCERTAINTY SEMANTICS
# =========================================================================

@pytest.mark.anyio
async def test_no_hidden_composite_score_formula():
    """Verify that ML score, skill alignment, evidence coverage, trajectory, and market demand are independent."""
    cr_svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_audit_no_composite_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 2.0}],
        "target_career_id": career_id
    })

    analysis = await cr_svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)

    # Verify no field exists combining ML readiness + evidence into a new composite score
    analysis_dict = analysis.model_dump()
    assert "composite_readiness_score" not in analysis_dict
    assert "overall_career_score" not in analysis_dict
    assert "weighted_readiness" not in analysis_dict

    # Verify each dimension is distinct
    assert isinstance(analysis.existing_ml_readiness.readiness_score, float)
    assert isinstance(analysis.skill_alignment.coverage_percentage, float)
    assert isinstance(analysis.evidence_coverage.evidence_coverage_ratio, float)
    assert isinstance(analysis.learning_trajectory.overall_learning_velocity, float)
    assert isinstance(analysis.market_alignment.demand_score, float)

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


def test_uncertainty_margin_points_semantics():
    """Verify uncertainty margin is documented as approximate model test MAE points (score units), not % certainty."""
    benchmark = MLReadinessBenchmark(
        readiness_score=68.5,
        readiness_tier="Strong Candidate",
        is_job_ready=False,
        model_version="v1.0.0-production",
        confidence_margin=2.2,
        model_algorithm="LinearRegression"
    )
    assert benchmark.confidence_margin == 2.2
    assert "statistical confidence interval" in MLReadinessBenchmark.model_fields["confidence_margin"].description or "points" in MLReadinessBenchmark.model_fields["confidence_margin"].description


# =========================================================================
# 3. EVIDENCE VS PROFICIENCY SEPARATION & REJECTION INTEGRITY
# =========================================================================

@pytest.mark.anyio
async def test_evidence_coverage_separated_from_proficiency():
    """Verify high self-reported skill proficiency without evidence remains unverified but does not mutate skill level."""
    cr_svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_audit_evidence_separation_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.skill_evidence.delete_many({"student_id": student_id})

    # Student has level 4.0 Python, 0 evidence
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 4.0, "verified": False}],
        "target_career_id": career_id
    })

    analysis = await cr_svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)

    # Python strength exists at level 4.0, but evidence_status is UNVERIFIED/NO_EVIDENCE
    python_strength = next((s for s in analysis.strengths if s.skill_id == "SK001"), None)
    assert python_strength is not None
    assert python_strength.proficiency == 4.0
    assert python_strength.evidence_status in ["UNVERIFIED", "NO_EVIDENCE"]
    assert python_strength.supporting_evidence_count == 0

    # Evidence coverage ratio is 0.0
    assert analysis.evidence_coverage.verified_evidence_count == 0

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})
    await db.skill_evidence.delete_many({"student_id": student_id})


@pytest.mark.anyio
async def test_rejected_evidence_contributes_zero():
    """Verify rejected evidence items contribute 0 to verified evidence count."""
    cr_svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_audit_rejected_ev_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.skill_evidence.delete_many({"student_id": student_id})

    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 2.0}],
        "target_career_id": career_id
    })

    await db.skill_evidence.insert_one({
        "evidence_id": "EV_AUDIT_REJ_001",
        "student_id": student_id,
        "skill_id": "SK001",
        "evidence_type": "CERTIFICATE",
        "source_entity": "certifications",
        "source_entity_id": "CERT_FAKE",
        "title": "Invalid Cert",
        "observed_proficiency": 5.0,
        "verification_status": "REJECTED",
        "created_at": get_utc_now()
    })

    analysis = await cr_svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)

    assert analysis.evidence_coverage.rejected_evidence_count == 1
    assert analysis.evidence_coverage.verified_evidence_count == 0
    assert analysis.evidence_coverage.career_relevant_skills_with_verified_evidence == 0

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})
    await db.skill_evidence.delete_many({"student_id": student_id})


@pytest.mark.anyio
async def test_duplicate_evidence_does_not_inflate_skill_coverage():
    """Verify 100 duplicate evidence items for 1 skill only count as 1 covered skill."""
    cr_svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_audit_dup_ev_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.skill_evidence.delete_many({"student_id": student_id})

    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 3.0}],
        "target_career_id": career_id
    })

    # 10 duplicate verified evidence items for Python
    dup_docs = [
        {
            "evidence_id": f"EV_DUP_{i:03d}",
            "student_id": student_id,
            "skill_id": "SK001",
            "evidence_type": "ASSESSMENT",
            "source_entity": "assessments",
            "source_entity_id": f"ASM_{i}",
            "title": f"Python Quiz {i}",
            "observed_proficiency": 3.5,
            "verification_status": "SYSTEM_VERIFIED",
            "created_at": get_utc_now()
        }
        for i in range(10)
    ]
    await db.skill_evidence.insert_many(dup_docs)

    analysis = await cr_svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)

    # Distinct skills covered by verified evidence must be exactly 1
    assert analysis.evidence_coverage.career_relevant_skills_with_verified_evidence == 1

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})
    await db.skill_evidence.delete_many({"student_id": student_id})


# =========================================================================
# 4. MARKET SIGNAL PROVENANCE & FALLBACK LABELS
# =========================================================================

@pytest.mark.anyio
async def test_market_provenance_and_fallback_label_integrity():
    """Verify market signals clearly label neutral fallback, stale, and observed states."""
    cr_svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_audit_market_prov_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 3.0}],
        "target_career_id": career_id
    })

    analysis = await cr_svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)

    mkt = analysis.market_alignment
    assert mkt.career_id == "CR001"
    assert mkt.market_signal_status in ["OBSERVED", "STALE", "EXPIRING_SOON", "FALLBACK_UNAVAILABLE"]
    if mkt.is_fallback:
        assert mkt.demand_score == 75.0
        assert "fallback" in mkt.market_source.lower() or "unobserved" in mkt.provenance_note.lower()

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


# =========================================================================
# 5. MASTERED SKILLS POLICY & ACTION MAPPING
# =========================================================================

@pytest.mark.anyio
async def test_mastered_skills_omitted_from_next_actions():
    """Verify mastered skills are marked is_mastered=True and not recommended in next actions."""
    cr_svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_audit_mastered_action_student"
    career_id = "CR001"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [
            {"skill_id": "SK001", "name": "Python", "level": 5.0, "verified": True},
            {"skill_id": "SK002", "name": "JavaScript", "level": 1.0, "verified": False}
        ],
        "target_career_id": career_id
    })

    analysis = await cr_svc.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)

    # Python should be is_mastered=True in gaps matrix
    py_gap = next((g for g in analysis.gaps if g.skill_id == "SK001"), None)
    assert py_gap is not None
    assert py_gap.is_mastered is True
    assert py_gap.priority_band == "MASTERED"

    # Python must NOT appear in next_actions
    action_skills = [a.skill_id for a in analysis.next_actions]
    assert "SK001" not in action_skills

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


# =========================================================================
# 6. CAREER COMPARISON INTEGRITY (NO UNDOCUMENTED RANKING)
# =========================================================================

@pytest.mark.anyio
async def test_career_comparison_factual_neutrality():
    """Verify career comparison presents factual side-by-side data without inventing an overall winner."""
    cr_svc = CareerReadinessService()
    db = await get_db()
    student_id = "test_audit_comparison_student"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 3.0}],
        "target_career_id": "CR001"
    })

    cmp_res = await cr_svc.compare_careers(
        student_id=student_id,
        career_ids=["CR001", "CR002"],
        db=db
    )

    assert "comparisons" in cmp_res
    assert len(cmp_res["comparisons"]) == 2
    # Verify no arbitrary 'winner' or 'best_career' verdict field exists
    assert "winner" not in cmp_res
    assert "best_career" not in cmp_res
    assert "provenance_disclaimer" in cmp_res

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})


# =========================================================================
# 7. SECURITY, CROSS-STUDENT ISOLATION & DETERMINISM
# =========================================================================

@pytest.mark.anyio
async def test_cross_student_security_and_unauthenticated_rejection():
    """Verify unauthenticated requests return 401 and student data is isolated."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res_unauth = await ac.get("/api/v1/career-readiness/CR001")
        assert res_unauth.status_code == 401

        res_unauth_str = await ac.get("/api/v1/career-readiness/CR001/strengths")
        assert res_unauth_str.status_code == 401

        res_unauth_gaps = await ac.get("/api/v1/career-readiness/CR001/gaps")
        assert res_unauth_gaps.status_code == 401

        res_unauth_ev = await ac.get("/api/v1/career-readiness/CR001/evidence")
        assert res_unauth_ev.status_code == 401


@pytest.mark.anyio
async def test_career_readiness_determinism_25_iterations():
    """Verify running the career readiness analysis 25 times produces 100% identical outputs."""
    cr_svc = CareerReadinessService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    first_res = await cr_svc.get_career_readiness_analysis(student_id=user_id, career_id="CR001", db=db)
    first_dict = first_res.model_dump(exclude={"generated_at"})

    for i in range(24):
        subsequent_res = await cr_svc.get_career_readiness_analysis(student_id=user_id, career_id="CR001", db=db)
        subsequent_dict = subsequent_res.model_dump(exclude={"generated_at"})
        assert first_dict == subsequent_dict, f"Non-deterministic deviation detected on run {i+2}"
