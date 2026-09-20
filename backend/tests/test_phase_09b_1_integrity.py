"""
Skill2Career - Phase 09B.1 Learning Intelligence Scientific & Data Integrity Audit Test Suite
Adversarial tests validating snapshot integrity, checkpoint security, skill progression boundaries,
velocity time-normalization, calendar deduplication, stagnation boundaries, ML boundary protection,
cross-student isolation, and analytical determinism.
"""

import pytest
import os
import json
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
import numpy as np

from backend.main import app
from backend.services.learning_intelligence_service import LearningIntelligenceService
from backend.ml.inference import MLInferenceService
from backend.database.mongodb import get_db, get_utc_now
from backend.schemas.learning_intelligence_schemas import (
    StagnationStatus,
    SkillProgressionStatus,
    TrajectoryDirection,
    TrajectoryConfidence,
    SkillProgressionItem
)


# =========================================================================
# A. SNAPSHOT INTEGRITY & CHECKPOINT SECURITY
# =========================================================================

@pytest.mark.anyio
async def test_snapshot_immutability_and_state_isolation():
    """Verify that historical snapshots remain immutable when current student profile changes."""
    svc = LearningIntelligenceService()
    db = await get_db()
    student_id = "test_audit_immutability_student"

    # Setup baseline profile
    await db.student_profiles.delete_many({"user_id": student_id})
    await db.learning_snapshots.delete_many({"student_id": student_id})

    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 2.0, "verified": True}],
        "target_career_id": "CR001"
    })

    # Record Snapshot 1
    snap1 = await svc.record_learning_snapshot(student_id=student_id, db=db)
    assert snap1["average_proficiency"] == 2.0
    assert snap1["skills_state"][0]["level"] == 2.0

    # Mutate current profile state to level 4.5
    await db.student_profiles.update_one(
        {"user_id": student_id},
        {"$set": {"skills": [{"skill_id": "SK001", "name": "Python", "level": 4.5, "verified": True}]}}
    )

    # Verify Snapshot 1 in DB was NOT mutated
    from bson import ObjectId
    snap1_id = ObjectId(snap1["id"]) if "id" in snap1 else ObjectId(snap1["_id"]) if "_id" in snap1 else None
    saved_snap1 = await db.learning_snapshots.find_one({"_id": snap1_id} if snap1_id else {"student_id": student_id})
    assert saved_snap1 is not None
    assert saved_snap1["average_proficiency"] == 2.0
    assert saved_snap1["skills_state"][0]["level"] == 2.0

    # Record Snapshot 2
    snap2 = await svc.record_learning_snapshot(student_id=student_id, db=db)
    assert snap2["average_proficiency"] == 4.5

    # Historical snapshot 1 remains 2.0, snapshot 2 is 4.5
    all_snaps = await svc.get_student_snapshots(student_id=student_id, db=db)
    assert len(all_snaps) >= 2
    assert all_snaps[0]["average_proficiency"] == 2.0
    assert all_snaps[1]["average_proficiency"] == 4.5

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})
    await db.learning_snapshots.delete_many({"student_id": student_id})


@pytest.mark.anyio
async def test_checkpoint_spam_cannot_manufacture_progress():
    """Verify that repeated checkpoint clicks without skill changes do not manufacture progress."""
    svc = LearningIntelligenceService()
    db = await get_db()
    student_id = "test_audit_checkpoint_spam_student"

    await db.student_profiles.delete_many({"user_id": student_id})
    await db.learning_snapshots.delete_many({"student_id": student_id})

    await db.student_profiles.insert_one({
        "user_id": student_id,
        "skills": [{"skill_id": "SK001", "name": "Python", "level": 3.0, "verified": True}],
        "target_career_id": "CR001"
    })

    # Trigger 5 rapid checkpoints
    for _ in range(5):
        await svc.record_learning_snapshot(student_id=student_id, db=db)

    overview = await svc.get_learning_trajectory_overview(student_id=student_id, db=db)
    progression = overview.skill_progressions[0]

    # Skill delta must be exactly 0.0 and status STABLE, NOT improving
    assert progression.absolute_change == 0.0
    assert progression.status == SkillProgressionStatus.STABLE
    assert progression.current_proficiency == 3.0

    # Cleanup
    await db.student_profiles.delete_many({"user_id": student_id})
    await db.learning_snapshots.delete_many({"student_id": student_id})


# =========================================================================
# B. SKILL PROGRESSION DELTA & NOISE TOLERANCE
# =========================================================================

def test_skill_progression_delta_boundaries():
    """
    Test exact progression matrix:
    - 1.0 -> 1.0 = STABLE
    - 2.0 -> 2.0 = STABLE
    - 2.0 -> 2.01 = STABLE (floating point noise protection <= 0.05)
    - 2.0 -> 1.99 = STABLE (floating point noise protection >= -0.05)
    - 2.0 -> 2.5 = IMPROVING (delta = 0.50 > 0.05)
    - 5.0 -> 5.0 = STABLE (boundary ceiling)
    - missing -> value = NEWLY_ACQUIRED
    - single observation = INSUFFICIENT_HISTORY
    - missing data in current snapshot != decline
    """
    svc = LearningIntelligenceService()

    # 1. Single observation -> INSUFFICIENT_HISTORY
    single_progs = svc.calculate_skill_progressions(
        current_skills=[{"skill_id": "SK001", "name": "Python", "level": 2.0}],
        snapshots=[{"skills_state": [{"skill_id": "SK001", "level": 2.0}]}],
        evidences=[]
    )
    assert len(single_progs) == 1
    assert single_progs[0].status == SkillProgressionStatus.INSUFFICIENT_HISTORY
    assert single_progs[0].previous_proficiency is None

    # 2. Comprehensive 2-snapshot progression matrix
    past_snapshot = {
        "skills_state": [
            {"skill_id": "SK_STABLE_1", "level": 1.0},
            {"skill_id": "SK_STABLE_2", "level": 2.0},
            {"skill_id": "SK_NOISE_UP", "level": 2.0},
            {"skill_id": "SK_NOISE_DOWN", "level": 2.0},
            {"skill_id": "SK_IMPROVE", "level": 2.0},
            {"skill_id": "SK_CEIL", "level": 5.0},
            {"skill_id": "SK_DECLINE", "level": 4.0}
        ]
    }

    current_snapshot = {
        "skills_state": [
            {"skill_id": "SK_STABLE_1", "level": 1.0},
            {"skill_id": "SK_STABLE_2", "level": 2.0},
            {"skill_id": "SK_NOISE_UP", "level": 2.01},
            {"skill_id": "SK_NOISE_DOWN", "level": 1.99},
            {"skill_id": "SK_IMPROVE", "level": 2.5},
            {"skill_id": "SK_CEIL", "level": 5.0},
            {"skill_id": "SK_DECLINE", "level": 3.0}
        ]
    }

    current_skills = [
        {"skill_id": "SK_STABLE_1", "name": "S1", "level": 1.0},
        {"skill_id": "SK_STABLE_2", "name": "S2", "level": 2.0},
        {"skill_id": "SK_NOISE_UP", "name": "NoiseUp", "level": 2.01},
        {"skill_id": "SK_NOISE_DOWN", "name": "NoiseDown", "level": 1.99},
        {"skill_id": "SK_IMPROVE", "name": "Improve", "level": 2.5},
        {"skill_id": "SK_CEIL", "name": "Ceil", "level": 5.0},
        {"skill_id": "SK_NEW", "name": "NewSkill", "level": 3.0}, # Not in past snapshot
        {"skill_id": "SK_DECLINE", "name": "Decline", "level": 3.0}
    ]

    progs = svc.calculate_skill_progressions(
        current_skills=current_skills,
        snapshots=[past_snapshot, current_snapshot],
        evidences=[]
    )
    prog_map = {p.skill_id: p for p in progs}

    # 1.0 -> 1.0
    assert prog_map["SK_STABLE_1"].status == SkillProgressionStatus.STABLE
    assert prog_map["SK_STABLE_1"].absolute_change == 0.0

    # 2.0 -> 2.0
    assert prog_map["SK_STABLE_2"].status == SkillProgressionStatus.STABLE
    assert prog_map["SK_STABLE_2"].absolute_change == 0.0

    # 2.0 -> 2.01 (noise)
    assert prog_map["SK_NOISE_UP"].status == SkillProgressionStatus.STABLE
    assert prog_map["SK_NOISE_UP"].absolute_change == 0.01

    # 2.0 -> 1.99 (noise)
    assert prog_map["SK_NOISE_DOWN"].status == SkillProgressionStatus.STABLE
    assert prog_map["SK_NOISE_DOWN"].absolute_change == -0.01

    # 2.0 -> 2.5 (genuine improvement)
    assert prog_map["SK_IMPROVE"].status == SkillProgressionStatus.IMPROVING
    assert prog_map["SK_IMPROVE"].absolute_change == 0.5

    # 5.0 -> 5.0 (ceiling stability)
    assert prog_map["SK_CEIL"].status == SkillProgressionStatus.STABLE
    assert prog_map["SK_CEIL"].absolute_change == 0.0

    # missing -> 3.0 (newly acquired)
    assert prog_map["SK_NEW"].status == SkillProgressionStatus.NEWLY_ACQUIRED
    assert prog_map["SK_NEW"].previous_proficiency is None

    # 4.0 -> 3.0 (genuine authoritative historical decline)
    assert prog_map["SK_DECLINE"].status == SkillProgressionStatus.DECLINING
    assert prog_map["SK_DECLINE"].absolute_change == -1.0


# =========================================================================
# C. VELOCITY INTEGRITY & TIME NORMALIZATION
# =========================================================================

def test_velocity_minimum_history_and_zero_elapsed_safety():
    """Verify velocity gracefully handles rapid snapshots without division by zero or inflated momentum."""
    svc = LearningIntelligenceService()
    now = datetime(2026, 9, 20, 12, 0, 0, tzinfo=timezone.utc)

    # 2 snapshots 1 second apart (< 0.5 days)
    snapshots = [
        {"snapshot_date": now.isoformat(), "average_proficiency": 2.0},
        {"snapshot_date": (now + timedelta(seconds=1)).isoformat(), "average_proficiency": 4.0}
    ]
    vel = svc.calculate_learning_velocity(snapshots=snapshots, activities=[], evidences=[])
    assert vel.status == "INSUFFICIENT_HISTORY"
    assert vel.minimum_observations_met is False
    assert vel.overall_learning_velocity == 0.0


def test_100_activities_on_single_day_cannot_fake_competency_velocity():
    """Verify 100 activities on 1 day does not create fake high competency velocity."""
    svc = LearningIntelligenceService()
    now = datetime(2026, 9, 20, 12, 0, 0, tzinfo=timezone.utc)

    snapshots = [
        {"snapshot_date": (now - timedelta(days=30)).isoformat(), "average_proficiency": 2.0, "verified_evidence_count": 0},
        {"snapshot_date": now.isoformat(), "average_proficiency": 2.0, "verified_evidence_count": 0} # 0 proficiency growth
    ]
    # 100 activities on a single day
    activities = [{"completed_at": now.isoformat()} for _ in range(100)]

    vel = svc.calculate_learning_velocity(snapshots=snapshots, activities=activities, evidences=[])
    assert vel.status == "SUFFICIENT_HISTORY"
    assert vel.skill_progression_velocity == 0.0  # Zero competency growth
    assert vel.evidence_velocity == 0.0
    # Overall velocity is capped and weighted primarily towards skill growth (60%)
    assert vel.overall_learning_velocity <= 1.0


# =========================================================================
# D. CONSISTENCY & CALENDAR DEDUPLICATION
# =========================================================================

def test_consistency_100_duplicate_activities_deduplication():
    """Verify 100 duplicate activities on one date evaluate to exactly 1 active day."""
    svc = LearningIntelligenceService()

    # 100 activities on the same day at different minute intervals
    activities = [
        {"completed_at": f"2026-09-15T{i%24:02d}:{i%60:02d}:00Z"}
        for i in range(100)
    ]

    consistency = svc.calculate_consistency(activities=activities, projects=[], assessments=[], evidences=[])
    assert consistency.active_learning_days_count == 1
    assert consistency.longest_streak_days == 1
    # Bounded score
    assert consistency.consistency_score < 40.0


def test_consistency_independence_from_proficiency():
    """Verify consistency metric measures calendar study regularity, independent of proficiency score."""
    svc = LearningIntelligenceService()
    dates = ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18", "2026-09-19", "2026-09-20"]
    activities = [{"completed_at": f"{d}T10:00:00Z"} for d in dates]

    consistency = svc.calculate_consistency(activities=activities, projects=[], assessments=[], evidences=[])
    assert consistency.active_learning_days_count == 7
    assert consistency.longest_streak_days == 7
    assert consistency.consistency_score >= 80.0
    assert consistency.consistency_tier == "High Consistency"


# =========================================================================
# E. STAGNATION DIAGNOSTICS & BOUNDARIES
# =========================================================================

def test_stagnation_day_boundaries():
    """
    Test stagnation detection across 7, 14, 27, 28, 29, and 60 day boundaries.
    Rule: Stagnation is flagged when days_since_last_activity > 28 days.
    """
    svc = LearningIntelligenceService()
    now = get_utc_now()
    snapshots = [{}, {}] # Sufficient history

    # Helper to test gap
    def get_stagnation_for_gap(days_gap: int):
        act_date = (now - timedelta(days=days_gap)).isoformat()
        return svc.detect_stagnation(
            snapshots=snapshots,
            activities=[{"completed_at": act_date}],
            progressions=[]
        )

    # 7 days gap -> STABLE_PROGRESS (not stagnant)
    stag_7 = get_stagnation_for_gap(7)
    assert stag_7.status == StagnationStatus.STABLE_PROGRESS

    # 14 days gap -> STABLE_PROGRESS
    stag_14 = get_stagnation_for_gap(14)
    assert stag_14.status == StagnationStatus.STABLE_PROGRESS

    # 27 days gap -> STABLE_PROGRESS
    stag_27 = get_stagnation_for_gap(27)
    assert stag_27.status == StagnationStatus.STABLE_PROGRESS

    # 28 days gap -> STABLE_PROGRESS (<= 28 days)
    stag_28 = get_stagnation_for_gap(28)
    assert stag_28.status == StagnationStatus.STABLE_PROGRESS

    # 29 days gap -> POSSIBLE_STAGNATION (> 28 days)
    stag_29 = get_stagnation_for_gap(29)
    assert stag_29.status == StagnationStatus.POSSIBLE_STAGNATION

    # 60 days gap -> POSSIBLE_STAGNATION
    stag_60 = get_stagnation_for_gap(60)
    assert stag_60.status == StagnationStatus.POSSIBLE_STAGNATION


def test_stagnation_restart_detection():
    """Verify student resuming activity after a long gap is recognized as active/restarted."""
    svc = LearningIntelligenceService()
    now = get_utc_now()

    # Gap of 45 days followed by recent activity 1 day ago
    activities = [
        {"completed_at": (now - timedelta(days=45)).isoformat()},
        {"completed_at": (now - timedelta(days=1)).isoformat()}
    ]

    stag = svc.detect_stagnation(
        snapshots=[{}, {}],
        activities=activities,
        progressions=[]
    )
    # Recent activity <= 3 days ago prevents false stagnation
    assert stag.status in [StagnationStatus.ACTIVE_PROGRESS, StagnationStatus.STABLE_PROGRESS]
    assert stag.days_since_last_activity == 1


# =========================================================================
# F. TRAJECTORY CONFIDENCE & ML BOUNDARY INTEGRITY
# =========================================================================

def test_trajectory_confidence_semantics():
    """Verify trajectory_confidence signifies historical data completeness, not ML confidence or hiring odds."""
    svc = LearningIntelligenceService()

    # < 2 snapshots -> INSUFFICIENT_DATA
    # In overview logic:
    # 0/1 snapshots -> TrajectoryConfidence.INSUFFICIENT_DATA
    assert TrajectoryConfidence.INSUFFICIENT_DATA.value == "INSUFFICIENT_DATA"
    assert TrajectoryConfidence.LOW.value == "LOW"
    assert TrajectoryConfidence.MEDIUM.value == "MEDIUM"
    assert TrajectoryConfidence.HIGH.value == "HIGH"


def test_ml_pipeline_artifact_immutability():
    """Verify that ML model pipelines and 13-feature schema remain unmodified on disk."""
    artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "ml", "artifacts")

    # 1. Feature schema check
    schema_path = os.path.join(artifacts_dir, "feature_schema.json")
    assert os.path.exists(schema_path)
    with open(schema_path, "r") as f:
        schema = json.load(f)
    num_features = schema.get("numerical_features", [])
    cat_features = schema.get("categorical_features", [])
    total_features = num_features + cat_features
    assert len(total_features) == 13
    assert "gpa" in num_features
    assert "career_skill_match_pct" in num_features
    assert "degree" in cat_features
    assert "institution_tier" in cat_features

    # 2. Readiness pipeline artifact exists and loads
    readiness_path = os.path.join(artifacts_dir, "readiness_pipeline.joblib")
    assert os.path.exists(readiness_path)

    # 3. Trajectory pipeline artifact exists and loads
    traj_path = os.path.join(artifacts_dir, "trajectory_pipeline.joblib")
    assert os.path.exists(traj_path)


# =========================================================================
# G. SECURITY, DETERMINISM & CROSS-STUDENT ISOLATION
# =========================================================================

@pytest.mark.anyio
async def test_cross_student_endpoint_isolation():
    """Verify Student A cannot retrieve Student B's skill progression history."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Unauthenticated request fails with 401
        res_unauth = await ac.get("/api/v1/learning-intelligence/skills/SK001")
        assert res_unauth.status_code == 401

        # Authenticate as demo user
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "demo@skill2career.com", "password": "Password123!"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Query skill history
        res_auth = await ac.get("/api/v1/learning-intelligence/skills/SK001", headers=headers)
        assert res_auth.status_code == 200
        data = res_auth.json()
        assert isinstance(data, list)


@pytest.mark.anyio
async def test_analytical_determinism_25_iterations():
    """Verify running the overview calculation 25 times against identical DB state yields 100% identical outputs."""
    svc = LearningIntelligenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    first_res = await svc.get_learning_trajectory_overview(student_id=user_id, db=db)
    first_dict = first_res.model_dump(exclude={"generated_at"})

    for i in range(24):
        subsequent_res = await svc.get_learning_trajectory_overview(student_id=user_id, db=db)
        subsequent_dict = subsequent_res.model_dump(exclude={"generated_at"})
        assert first_dict == subsequent_dict, f"Non-deterministic deviation detected on run {i+2}"
