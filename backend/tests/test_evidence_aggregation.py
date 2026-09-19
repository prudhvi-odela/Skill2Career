"""
Skill2Career - Phase 09A Evidence Aggregation & State Boundary Tests
Validates multi-artifact aggregation, conflict resolution, proficiency derivation,
and safe state updates to student profiles.
"""

import pytest
from backend.services.evidence_aggregation_service import EvidenceAggregationService
from backend.services.evidence_service import EvidenceService
from backend.schemas.evidence_schemas import (
    EvidenceCreateRequest,
    EvidenceType,
    VerificationStatus,
    EvidenceStrength
)
from backend.database.mongodb import get_db


def test_calculate_skill_evidence_aggregation_heuristics():
    """Verify aggregation correctly computes observed proficiency and ignores rejected evidence."""
    agg_svc = EvidenceAggregationService()

    evidence_items = [
        {
            "evidence_type": EvidenceType.ASSESSMENT.value,
            "evidence_strength": EvidenceStrength.VERY_STRONG.value,
            "evidence_score": 95.0,
            "observed_proficiency": 4.5,
            "verification_status": VerificationStatus.ASSESSMENT_VERIFIED.value,
            "observed_at": "2026-09-18T10:00:00Z"
        },
        {
            "evidence_type": EvidenceType.LEARNING_ACTIVITY.value,
            "evidence_strength": EvidenceStrength.WEAK.value,
            "evidence_score": 35.0,
            "observed_proficiency": 2.0,
            "verification_status": VerificationStatus.UNVERIFIED.value,
            "observed_at": "2026-09-10T10:00:00Z"
        },
        {
            "evidence_type": EvidenceType.PROJECT.value,
            "evidence_strength": EvidenceStrength.WEAK.value,
            "evidence_score": 10.0,
            "observed_proficiency": 1.0,
            "verification_status": VerificationStatus.REJECTED.value,
            "observed_at": "2026-09-01T10:00:00Z"
        }
    ]

    summary = agg_svc.calculate_skill_evidence_aggregation(
        skill_id="SK001",
        skill_name="Python",
        category="Programming",
        current_prof=3.0,
        is_verified_in_profile=False,
        evidence_items=evidence_items
    )

    assert summary.skill_id == "SK001"
    assert summary.evidence_count == 3
    assert summary.verified_evidence_count == 1
    assert summary.strongest_evidence_level == EvidenceStrength.VERY_STRONG.value
    # Observed proficiency should be strongly weighted by the assessment (weight 1.0) over the weak activity (weight 0.2)
    # (1.0*4.5 + 0.2*2.0) / 1.2 = 4.9 / 1.2 = 4.08 -> 4.1
    assert summary.observed_proficiency >= 4.0
    assert summary.aggregated_evidence_score >= 80.0


@pytest.mark.anyio
async def test_apply_evidence_to_skill_state_safe_boundary():
    """Verify apply_evidence_to_skill_state updates student profile and marks skill as verified."""
    agg_svc = EvidenceAggregationService()
    ev_svc = EvidenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    # Ensure source assessment exists in database for entity validation
    await db.student_assessments.delete_many({"_id": "sql_eval_test_99"})
    await db.student_assessments.insert_one({
        "_id": "sql_eval_test_99",
        "user_id": user_id,
        "skill_id": "SK008",
        "score_percentage": 90.0,
        "passed": True
    })

    # Log verified assessment evidence for SK008 (SQL)
    req = EvidenceCreateRequest(
        skill_id="SK008",
        evidence_type=EvidenceType.ASSESSMENT,
        source_entity="student_assessments",
        source_entity_id="sql_eval_test_99",
        title="SQL Advanced Database Quiz",
        observed_proficiency=4.2,
        source_metadata={"score_percentage": 90.0, "passed": True}
    )
    await ev_svc.create_evidence(student_id=user_id, request=req, db=db)

    # Apply to student profile
    res = await agg_svc.apply_evidence_to_skill_state(
        student_id=user_id,
        skill_id="SK008",
        db=db
    )

    assert res["status"] == "updated"
    assert res["is_verified"] is True
    assert res["new_level"] >= 4.0

    # Verify profile in MongoDB contains updated verified skill
    profile = await db.student_profiles.find_one({"user_id": user_id})
    sql_skill = next((s for s in profile.get("skills", []) if s.get("skill_id") == "SK008"), None)
    assert sql_skill is not None
    assert sql_skill["verified"] is True
    assert sql_skill["level"] >= 4.0
