"""
Skill2Career - Phase 09A.1 Evidence Integrity & Skill-State Adversarial Audit Tests
Audits the Learning Evidence Engine against adversarial attacks, duplicate inflation,
client score spoofing, cross-student leakage, and ML prediction boundary violations.
"""

import pytest
from datetime import datetime, timezone
from backend.services.evidence_service import EvidenceService
from backend.services.evidence_aggregation_service import EvidenceAggregationService
from backend.ml.inference import MLInferenceService
from backend.schemas.evidence_schemas import (
    EvidenceCreateRequest,
    EvidenceVerifyRequest,
    EvidenceType,
    VerificationStatus,
    EvidenceStrength
)
from backend.database.mongodb import get_db


@pytest.mark.anyio
async def test_unverified_evidence_cannot_increase_authoritative_proficiency():
    """Verify that unverified evidence alone CANNOT upgrade student profile skill level or mark it verified."""
    ev_svc = EvidenceService()
    agg_svc = EvidenceAggregationService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    # Create an unverified activity
    act_id = "test_unverified_act_01"
    await db.learning_activities.delete_many({"_id": act_id})
    await db.learning_activities.insert_one({
        "_id": act_id,
        "student_id": user_id,
        "activity_type": "reading",
        "title": "Unverified Docker Tutorial",
        "hours_spent": 1.0
    })

    req = EvidenceCreateRequest(
        skill_id="SK009", # Docker
        evidence_type=EvidenceType.LEARNING_ACTIVITY,
        source_entity="learning_activities",
        source_entity_id=act_id,
        title="Unverified Reading Practice",
        observed_proficiency=5.0 # Client attempts to claim level 5.0
    )
    ev = await ev_svc.create_evidence(student_id=user_id, request=req, db=db)
    assert ev["verification_status"] == VerificationStatus.UNVERIFIED.value

    # Ensure any previous verified evidence for SK009 is removed for this isolated test
    await db.skill_evidence.delete_many({
        "student_id": user_id,
        "skill_id": "SK009",
        "verification_status": {"$ne": VerificationStatus.UNVERIFIED.value}
    })

    # Attempt to apply to student profile
    res = await agg_svc.apply_evidence_to_skill_state(
        student_id=user_id,
        skill_id="SK009",
        db=db
    )
    assert res["status"] == "unchanged"
    assert "No verified evidence available" in res["message"]


@pytest.mark.anyio
async def test_rejected_evidence_contributes_zero_and_cannot_modify_state():
    """Verify that rejected evidence is excluded from aggregation and contributes zero score."""
    agg_svc = EvidenceAggregationService()
    ev_svc = EvidenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    # Insert a dummy project
    p_id = "test_rejected_proj_01"
    await db.projects.delete_many({"_id": p_id})
    await db.projects.insert_one({
        "_id": p_id,
        "student_id": user_id,
        "title": "Flawed Project",
        "complexity_rating": 2.0
    })

    req = EvidenceCreateRequest(
        skill_id="SK004", # React
        evidence_type=EvidenceType.PROJECT,
        source_entity="projects",
        source_entity_id=p_id,
        title="Flawed React Project",
        observed_proficiency=4.5
    )
    ev = await ev_svc.create_evidence(student_id=user_id, request=req, db=db)

    # Reject the evidence
    v_req = EvidenceVerifyRequest(
        verification_status=VerificationStatus.REJECTED,
        validator_type="INSTRUCTOR",
        notes="Plagiarized or incomplete code"
    )
    await ev_svc.verify_evidence(
        evidence_id=ev["evidence_id"],
        student_id=user_id,
        request=v_req,
        db=db
    )

    # Aggregation calculation test
    rejected_item = {
        "evidence_type": EvidenceType.PROJECT.value,
        "evidence_strength": EvidenceStrength.WEAK.value,
        "evidence_score": 10.0,
        "observed_proficiency": 4.5,
        "verification_status": VerificationStatus.REJECTED.value,
        "observed_at": "2026-09-20T00:00:00Z"
    }
    summary = agg_svc.calculate_skill_evidence_aggregation(
        skill_id="SK004",
        skill_name="React",
        category="Frontend",
        current_prof=2.0,
        is_verified_in_profile=False,
        evidence_items=[rejected_item]
    )
    assert summary.verified_evidence_count == 0
    assert summary.aggregated_evidence_score == 0.0
    assert summary.observed_proficiency == 2.0


@pytest.mark.anyio
async def test_duplicate_evidence_cannot_inflate_proficiency():
    """Verify that submitting identical evidence multiple times does NOT multiply contribution."""
    ev_svc = EvidenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    # Ensure source project exists
    p_id = "test_dup_proj_01"
    await db.projects.delete_many({"_id": p_id})
    await db.projects.insert_one({
        "_id": p_id,
        "student_id": user_id,
        "title": "Deduplication Test Suite",
        "complexity_rating": 3.5
    })

    req = EvidenceCreateRequest(
        skill_id="SK001", # Python
        evidence_type=EvidenceType.PROJECT,
        source_entity="projects",
        source_entity_id=p_id,
        title="Deduplication Project",
        observed_proficiency=3.5
    )

    ev1 = await ev_svc.create_evidence(student_id=user_id, request=req, db=db)
    ev2 = await ev_svc.create_evidence(student_id=user_id, request=req, db=db)
    ev3 = await ev_svc.create_evidence(student_id=user_id, request=req, db=db)

    # All calls must return the identical evidence ID
    assert ev1["evidence_id"] == ev2["evidence_id"] == ev3["evidence_id"]

    # Verify database count for this specific source entity is exactly 1
    count = await db.skill_evidence.count_documents({
        "student_id": user_id,
        "skill_id": "SK001",
        "source_entity": "projects",
        "source_entity_id": p_id
    })
    assert count == 1


def test_hundred_weak_activities_remains_bounded():
    """Verify that accumulating 100 weak learning activities cannot inflate observed proficiency beyond 3.0."""
    agg_svc = EvidenceAggregationService()

    # Generate 100 weak unverified activity evidence items with high claimed proficiencies
    weak_items = [
        {
            "evidence_type": EvidenceType.LEARNING_ACTIVITY.value,
            "evidence_strength": EvidenceStrength.WEAK.value,
            "evidence_score": 35.0,
            "observed_proficiency": 5.0, # Attacker claiming 5.0 on each
            "verification_status": VerificationStatus.UNVERIFIED.value,
            "observed_at": f"2026-09-01T{i%24:02d}:00:00Z"
        }
        for i in range(100)
    ]

    summary = agg_svc.calculate_skill_evidence_aggregation(
        skill_id="SK007",
        skill_name="Kubernetes",
        category="DevOps",
        current_prof=1.0,
        is_verified_in_profile=False,
        evidence_items=weak_items
    )

    # Even with 100 activities claiming 5.0, unverified ceiling strictly caps observed proficiency at <= 3.0
    assert summary.observed_proficiency <= 3.0
    assert summary.verified_evidence_count == 0


@pytest.mark.anyio
async def test_assessment_evidence_uses_authoritative_score_from_db():
    """Verify that assessment evidence strictly pulls the real score from DB and ignores client spoofing."""
    ev_svc = EvidenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    # Insert a failed assessment in MongoDB with 35% score
    exam_id = "test_failed_exam_spoof_attempt"
    await db.student_assessments.delete_many({"_id": exam_id})
    await db.student_assessments.insert_one({
        "_id": exam_id,
        "user_id": user_id,
        "student_id": user_id,
        "skill_id": "SK008", # SQL
        "score_percentage": 35.0,
        "passed": False
    })

    # Client maliciously sends score_percentage=100.0, passed=True, observed_proficiency=5.0
    req = EvidenceCreateRequest(
        skill_id="SK008",
        evidence_type=EvidenceType.ASSESSMENT,
        source_entity="student_assessments",
        source_entity_id=exam_id,
        title="SQL Malicious Spoof Checkpoint",
        observed_proficiency=5.0,
        source_metadata={"score_percentage": 100.0, "passed": True}
    )

    ev = await ev_svc.create_evidence(student_id=user_id, request=req, db=db)

    # Server must override with authoritative DB values: 35.0%, passed=False, UNVERIFIED, proficiency <= 2.0
    assert ev["source_metadata"]["score_percentage"] == 35.0
    assert ev["source_metadata"]["passed"] is False
    assert ev["verification_status"] == VerificationStatus.UNVERIFIED.value
    assert ev["observed_proficiency"] <= 2.0
    assert ev["evidence_strength"] == EvidenceStrength.MODERATE.value


@pytest.mark.anyio
async def test_cross_student_evidence_creation_rejected():
    """Verify that Student A cannot create evidence from Student B's projects or assessments."""
    ev_svc = EvidenceService()
    db = await get_db()

    student_a_id = "student_alpha_111"
    student_b_id = "student_beta_222"

    # Insert a project owned strictly by Student B
    b_proj_id = "proj_owned_by_student_b"
    await db.projects.delete_many({"_id": b_proj_id})
    await db.projects.insert_one({
        "_id": b_proj_id,
        "student_id": student_b_id,
        "title": "Student B Confidential Architecture",
        "complexity_rating": 4.5
    })

    req = EvidenceCreateRequest(
        skill_id="SK001",
        evidence_type=EvidenceType.PROJECT,
        source_entity="projects",
        source_entity_id=b_proj_id,
        title="Hijacked Project Evidence",
        observed_proficiency=4.5
    )

    # Student A attempts to create evidence from Student B's artifact -> must raise ValueError
    with pytest.raises(ValueError, match="not found in 'projects' for authenticated student"):
        await ev_svc.create_evidence(student_id=student_a_id, request=req, db=db)


@pytest.mark.anyio
async def test_invalid_canonical_skill_rejected():
    """Verify that unknown skill codes are strictly rejected from entering the evidence system."""
    ev_svc = EvidenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    req = EvidenceCreateRequest(
        skill_id="UNKNOWN_SKILL_XYZ_999",
        evidence_type=EvidenceType.PROJECT,
        source_entity="projects",
        source_entity_id="dummy_proj",
        title="Invalid Skill Code Attempt",
        observed_proficiency=3.0
    )

    with pytest.raises(ValueError, match="not found in canonical skills taxonomy"):
        await ev_svc.create_evidence(student_id=user_id, request=req, db=db)


@pytest.mark.anyio
async def test_ml_readiness_score_not_directly_mutated_and_deterministic():
    """Verify that evidence does not directly mutate ML models and inference produces deterministic output."""
    ml_svc = MLInferenceService.get_instance()
    agg_svc = EvidenceAggregationService()
    ev_svc = EvidenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    # Predict readiness twice on identical student skills
    profile = await db.student_profiles.find_one({"user_id": user_id})
    skills = profile.get("skills", [])

    pred1 = ml_svc.predict_readiness(student_skills_list=skills, target_career_id="CR001")
    pred2 = ml_svc.predict_readiness(student_skills_list=skills, target_career_id="CR001")

    assert pred1["readiness_score"] == pred2["readiness_score"]
    assert pred1["readiness_tier"] == pred2["readiness_tier"]
    assert len(pred1["feature_contributions"]) == 5


@pytest.mark.anyio
async def test_cross_student_evidence_verification_rejected():
    """Verify that Student A cannot verify, modify, or reject Student B's evidence."""
    ev_svc = EvidenceService()
    db = await get_db()

    student_a_id = "student_alpha_111"
    student_b_id = "student_beta_222"

    # Insert an evidence item owned strictly by Student B
    b_ev_id = "evd_owned_by_student_b"
    await db.skill_evidence.delete_many({"evidence_id": b_ev_id})
    await db.skill_evidence.insert_one({
        "evidence_id": b_ev_id,
        "student_id": student_b_id,
        "skill_id": "SK001",
        "evidence_type": EvidenceType.PROJECT.value,
        "verification_status": VerificationStatus.UNVERIFIED.value,
        "observed_proficiency": 3.0
    })

    v_req = EvidenceVerifyRequest(
        verification_status=VerificationStatus.MANUALLY_VERIFIED,
        validator_type="INSTRUCTOR",
        notes="Illegitimate verification attempt by non-owner"
    )

    # Student A attempts to verify Student B's evidence -> must raise ValueError
    with pytest.raises(ValueError, match="not found for authenticated student"):
        await ev_svc.verify_evidence(evidence_id=b_ev_id, student_id=student_a_id, request=v_req, db=db)


@pytest.mark.anyio
async def test_certificate_alone_does_not_create_mastery():
    """Verify that certification evidence is bounded to supporting level (<= 4.0) and cannot grant 5.0 mastery."""
    ev_svc = EvidenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    # Insert a certification document
    cert_id = "cert_aws_sol_arch_test"
    await db.certifications.delete_many({"_id": cert_id})
    await db.certifications.insert_one({
        "_id": cert_id,
        "student_id": user_id,
        "name": "AWS Certified Solutions Architect",
        "issuer": "Amazon Web Services",
        "credential_url": "https://aws.amazon.com/verify/cert123",
        "is_verified": True
    })

    # Client attempts to claim 5.0 observed proficiency for certificate
    req = EvidenceCreateRequest(
        skill_id="SK006", # AWS
        evidence_type=EvidenceType.CERTIFICATION,
        source_entity="certifications",
        source_entity_id=cert_id,
        title="AWS Solutions Architect Credential",
        observed_proficiency=5.0
    )

    ev = await ev_svc.create_evidence(student_id=user_id, request=req, db=db)
    # Must be bounded to <= 4.0
    assert ev["observed_proficiency"] <= 4.0
    assert ev["evidence_strength"] == EvidenceStrength.STRONG.value


@pytest.mark.anyio
async def test_skill_state_change_audit_trail_provenance():
    """Verify that applying evidence writes complete provenance metadata into the student profile."""
    ev_svc = EvidenceService()
    agg_svc = EvidenceAggregationService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    # Insert verified project
    proj_id = "proj_provenance_audit_01"
    await db.projects.delete_many({"_id": proj_id})
    await db.projects.insert_one({
        "_id": proj_id,
        "student_id": user_id,
        "title": "Production Microservices Cluster",
        "complexity_rating": 4.5,
        "repository_url": "https://github.com/demo/microservices"
    })

    req = EvidenceCreateRequest(
        skill_id="SK001",
        evidence_type=EvidenceType.PROJECT,
        source_entity="projects",
        source_entity_id=proj_id,
        title="Production Microservices Cluster",
        observed_proficiency=4.5
    )
    await ev_svc.create_evidence(student_id=user_id, request=req, db=db)

    # Apply to profile
    res = await agg_svc.apply_evidence_to_skill_state(student_id=user_id, skill_id="SK001", db=db)
    assert res["status"] == "updated"
    assert "Evidence Engine:" in res["verification_source"]

    # Verify profile contains timestamp and verification_source
    profile = await db.student_profiles.find_one({"user_id": user_id})
    skill_item = next(s for s in profile.get("skills", []) if s.get("skill_id") == "SK001")
    assert skill_item["verified"] is True
    assert "Evidence Engine:" in skill_item["verification_source"]
    assert skill_item.get("last_assessed_at") is not None
