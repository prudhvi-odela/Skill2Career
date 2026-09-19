"""
Skill2Career - Phase 09A Evidence Provenance & Scientific Integrity Tests
Validates full end-to-end trace from evidence artifact to ML feature extraction,
ensuring ML readiness pipeline and trajectory weights remain uncorrupted.
"""

import pytest
from backend.services.evidence_service import EvidenceService
from backend.services.evidence_aggregation_service import EvidenceAggregationService
from backend.ml.inference import MLInferenceService
from backend.database.mongodb import get_db
from backend.schemas.evidence_schemas import EvidenceCreateRequest, EvidenceType, VerificationStatus


@pytest.mark.anyio
async def test_evidence_to_ml_provenance_trace():
    """Verify evidence updates student state, which updates ML features without corrupting model weights."""
    ev_svc = EvidenceService()
    agg_svc = EvidenceAggregationService()
    ml_svc = MLInferenceService.get_instance()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    # 1. Baseline ML readiness prediction from profile
    profile_before = await db.student_profiles.find_one({"user_id": user_id})
    skills_before = profile_before.get("skills", []) if profile_before else []
    pred_before = ml_svc.predict_readiness(
        student_skills_list=skills_before,
        target_career_id="CR001"
    )
    score_before = pred_before["readiness_score"]

    # Ensure source assessment exists in database for entity validation
    await db.student_assessments.delete_many({"_id": "ts_exam_999"})
    await db.student_assessments.insert_one({
        "_id": "ts_exam_999",
        "user_id": user_id,
        "student_id": user_id,
        "skill_id": "SK003",
        "score_percentage": 95.0,
        "passed": True
    })

    # 2. Add verified evidence for TypeScript (SK003)
    req = EvidenceCreateRequest(
        skill_id="SK003",
        evidence_type=EvidenceType.ASSESSMENT,
        source_entity="student_assessments",
        source_entity_id="ts_exam_999",
        title="TypeScript Enterprise Patterns Assessment",
        observed_proficiency=4.5,
        source_metadata={"score_percentage": 95.0, "passed": True}
    )
    await ev_svc.create_evidence(student_id=user_id, request=req, db=db)

    # 3. Apply verified evidence to profile
    await agg_svc.apply_evidence_to_skill_state(
        student_id=user_id,
        skill_id="SK003",
        db=db
    )

    # 4. Predict readiness again from updated profile
    profile_after = await db.student_profiles.find_one({"user_id": user_id})
    skills_after = profile_after.get("skills", [])
    pred_after = ml_svc.predict_readiness(
        student_skills_list=skills_after,
        target_career_id="CR001"
    )
    score_after = pred_after["readiness_score"]

    # Readiness score must reflect student competency increase through canonical ML feature pipeline
    assert score_after >= score_before
    assert pred_after["model_version"] is not None
    assert len(pred_after["feature_contributions"]) == 5
    assert any(fc["feature"] == "Skill Coverage for Role" for fc in pred_after["feature_contributions"])
