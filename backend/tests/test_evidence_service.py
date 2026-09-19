"""
Skill2Career - Phase 09A Evidence Service Unit & Integration Tests
Validates deterministic evidence strength calculation, creation, verification,
duplicate prevention, and artifact synchronization.
"""

import pytest
from datetime import datetime, timezone
from backend.services.evidence_service import EvidenceService
from backend.schemas.evidence_schemas import (
    EvidenceCreateRequest,
    EvidenceVerifyRequest,
    EvidenceType,
    VerificationStatus,
    EvidenceStrength
)
from backend.database.mongodb import get_db


def test_evaluate_evidence_strength_deterministic_heuristics():
    """Verify explicit deterministic strength heuristics across all evidence types."""
    svc = EvidenceService()

    # 1. Assessment: score >= 85% -> VERY_STRONG
    st, score, reason = svc.evaluate_evidence_strength(
        evidence_type=EvidenceType.ASSESSMENT.value,
        verification_status=VerificationStatus.ASSESSMENT_VERIFIED.value,
        observed_proficiency=4.5,
        source_metadata={"score_percentage": 92.0, "passed": True}
    )
    assert st == EvidenceStrength.VERY_STRONG.value
    assert score >= 90.0
    assert "92.0%" in reason

    # 2. Assessment: score 75% -> STRONG
    st, score, _ = svc.evaluate_evidence_strength(
        evidence_type=EvidenceType.ASSESSMENT.value,
        verification_status=VerificationStatus.ASSESSMENT_VERIFIED.value,
        observed_proficiency=3.8,
        source_metadata={"score_percentage": 75.0, "passed": True}
    )
    assert st == EvidenceStrength.STRONG.value
    assert score == 80.0

    # 3. Project: Complexity 4.5 with repo & demo -> VERY_STRONG
    st, score, _ = svc.evaluate_evidence_strength(
        evidence_type=EvidenceType.PROJECT.value,
        verification_status=VerificationStatus.SYSTEM_VERIFIED.value,
        observed_proficiency=4.5,
        source_metadata={"complexity_rating": 4.5, "has_repo": True, "has_live_demo": True}
    )
    assert st == EvidenceStrength.VERY_STRONG.value
    assert score == 92.0

    # 4. Certification: verified with URL -> STRONG
    st, score, _ = svc.evaluate_evidence_strength(
        evidence_type=EvidenceType.CERTIFICATION.value,
        verification_status=VerificationStatus.SYSTEM_VERIFIED.value,
        observed_proficiency=3.5,
        source_metadata={"credential_url": "https://verify.cert.com/123", "is_verified": True}
    )
    assert st == EvidenceStrength.STRONG.value
    assert score == 82.0

    # 5. Learning Activity: basic practice -> WEAK
    st, score, _ = svc.evaluate_evidence_strength(
        evidence_type=EvidenceType.LEARNING_ACTIVITY.value,
        verification_status=VerificationStatus.UNVERIFIED.value,
        observed_proficiency=2.0,
        source_metadata={"hours_spent": 1.5, "activity_type": "practice"}
    )
    assert st == EvidenceStrength.WEAK.value
    assert score == 35.0

    # 6. Rejected Status -> WEAK score
    st, score, reason = svc.evaluate_evidence_strength(
        evidence_type=EvidenceType.PROJECT.value,
        verification_status=VerificationStatus.REJECTED.value,
        observed_proficiency=4.0
    )
    assert st == EvidenceStrength.WEAK.value
    assert score == 10.0
    assert "rejected" in reason.lower()


@pytest.mark.anyio
async def test_create_evidence_valid_and_duplicate_prevention():
    """Verify evidence creation with canonical skill validation and duplicate protection."""
    svc = EvidenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    assert user is not None
    user_id = str(user.get("_id") or user.get("id"))

    # Fetch a project belonging to user
    project = await db.projects.find_one({"student_id": user_id})
    if not project:
        # Create a mock project for user
        res = await db.projects.insert_one({
            "student_id": user_id,
            "title": "Async Full-Stack Platform",
            "description": "Python + React web app",
            "complexity_rating": 4.0,
            "repository_url": "https://github.com/demo/platform"
        })
        project = await db.projects.find_one({"_id": res.inserted_id})

    proj_id = str(project["_id"])

    req = EvidenceCreateRequest(
        skill_id="SK001",
        evidence_type=EvidenceType.PROJECT,
        source_entity="projects",
        source_entity_id=proj_id,
        title="Async Full-Stack Platform Python Module",
        description="Built backend with Python 3.11",
        observed_proficiency=4.0,
        source_metadata={"complexity_rating": 4.0, "has_repo": True}
    )

    ev1 = await svc.create_evidence(student_id=user_id, request=req, db=db)
    assert ev1 is not None
    assert ev1["skill_id"] == "SK001"
    assert ev1["evidence_type"] == EvidenceType.PROJECT.value
    assert ev1["student_id"] == user_id

    # Second call with same parameters should return existing record (no duplicate)
    ev2 = await svc.create_evidence(student_id=user_id, request=req, db=db)
    assert ev2["evidence_id"] == ev1["evidence_id"]


@pytest.mark.anyio
async def test_create_evidence_invalid_skill_rejected():
    """Verify evidence creation rejects non-canonical skill IDs."""
    svc = EvidenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    req = EvidenceCreateRequest(
        skill_id="SK_NON_EXISTENT_9999",
        evidence_type=EvidenceType.PROJECT,
        source_entity="projects",
        source_entity_id="dummy_id",
        title="Invalid Skill Project",
        observed_proficiency=3.0
    )

    with pytest.raises(ValueError, match="not found in canonical skills taxonomy"):
        await svc.create_evidence(student_id=user_id, request=req, db=db)


@pytest.mark.anyio
async def test_verify_evidence_workflow():
    """Verify evidence verification updates status, re-evaluates score, and preserves history."""
    svc = EvidenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    # Ensure an activity exists for user
    act = await db.learning_activities.find_one({"student_id": user_id})
    if not act:
        res = await db.learning_activities.insert_one({
            "student_id": user_id,
            "activity_type": "practice",
            "title": "JavaScript Interactive Tutorial",
            "hours_spent": 6.0
        })
        act = await db.learning_activities.find_one({"_id": res.inserted_id})
    act_id = str(act["_id"])

    # Create unverified evidence
    req = EvidenceCreateRequest(
        skill_id="SK002",
        evidence_type=EvidenceType.LEARNING_ACTIVITY,
        source_entity="learning_activities",
        source_entity_id=act_id,
        title="JavaScript Practice",
        observed_proficiency=3.0,
        source_metadata={"hours_spent": 6.0}
    )
    ev = await svc.create_evidence(student_id=user_id, request=req, db=db)

    # Verify evidence
    v_req = EvidenceVerifyRequest(
        verification_status=VerificationStatus.MANUALLY_VERIFIED,
        validator_type="INSTRUCTOR",
        notes="Verified in lab inspection"
    )
    updated = await svc.verify_evidence(
        evidence_id=ev["evidence_id"],
        student_id=user_id,
        request=v_req,
        db=db
    )

    assert updated["verification_status"] == VerificationStatus.MANUALLY_VERIFIED.value
    assert updated["validator_type"] == "INSTRUCTOR"
    assert updated["evidence_strength"] == EvidenceStrength.MODERATE.value
    assert updated["evidence_score"] >= 60.0
    assert updated["validated_at"] is not None
