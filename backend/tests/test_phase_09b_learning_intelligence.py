"""
Skill2Career - Phase 09B Learning Intelligence & Trajectory Engine Tests
Validates trajectory calculations, skill progression, time-normalized learning velocity,
study consistency with duplicate protection, stagnation detection, and ML boundaries.
"""

import pytest
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
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


def test_trajectory_with_insufficient_history():
    """Verify that fewer than 2 snapshots produces INSUFFICIENT_HISTORY with transparent notes."""
    svc = LearningIntelligenceService()

    # 1. Zero snapshots
    vel_zero = svc.calculate_learning_velocity(snapshots=[], activities=[], evidences=[])
    assert vel_zero.status == "INSUFFICIENT_HISTORY"
    assert vel_zero.minimum_observations_met is False
    assert vel_zero.overall_learning_velocity == 0.0

    # 2. One snapshot
    snap_one = [{
        "snapshot_date": "2026-09-01T00:00:00Z",
        "average_proficiency": 2.5,
        "verified_evidence_count": 1
    }]
    vel_one = svc.calculate_learning_velocity(snapshots=snap_one, activities=[], evidences=[])
    assert vel_one.status == "INSUFFICIENT_HISTORY"
    assert vel_one.minimum_observations_met is False

    # 3. Two snapshots on the exact same second (0 days elapsed)
    snap_same_time = [
        {"snapshot_date": "2026-09-01T12:00:00Z", "average_proficiency": 2.5, "verified_evidence_count": 1},
        {"snapshot_date": "2026-09-01T12:00:00Z", "average_proficiency": 2.6, "verified_evidence_count": 1}
    ]
    vel_same = svc.calculate_learning_velocity(snapshots=snap_same_time, activities=[], evidences=[])
    assert vel_same.status == "INSUFFICIENT_HISTORY"


def test_trajectory_with_valid_longitudinal_snapshots():
    """Verify that multiple snapshots separated across weeks compute time-normalized velocity and progress."""
    svc = LearningIntelligenceService()

    now = datetime(2026, 9, 20, 12, 0, 0, tzinfo=timezone.utc)
    snapshots = [
        {
            "snapshot_date": (now - timedelta(days=28)).isoformat(),
            "average_proficiency": 2.0,
            "verified_evidence_count": 1
        },
        {
            "snapshot_date": (now - timedelta(days=14)).isoformat(),
            "average_proficiency": 2.8,
            "verified_evidence_count": 3
        },
        {
            "snapshot_date": now.isoformat(),
            "average_proficiency": 3.6,
            "verified_evidence_count": 5
        }
    ]
    activities = [{"completed_at": (now - timedelta(days=i)).isoformat()} for i in range(12)]
    evidences = [{"observed_at": (now - timedelta(days=i*2)).isoformat()} for i in range(5)]

    velocity = svc.calculate_learning_velocity(snapshots=snapshots, activities=activities, evidences=evidences)
    assert velocity.status == "SUFFICIENT_HISTORY"
    assert velocity.minimum_observations_met is True
    assert velocity.elapsed_days >= 27.0
    assert velocity.skill_progression_velocity > 1.0
    assert velocity.evidence_velocity > 2.0
    assert velocity.overall_learning_velocity >= 2.0
    assert velocity.velocity_tier in ["High Momentum", "Steady Momentum"]


def test_skill_progression_categorization():
    """Verify correct classification of IMPROVING, STABLE, DECLINING, NEWLY_ACQUIRED, and INSUFFICIENT_HISTORY."""
    svc = LearningIntelligenceService()

    # Case A: Only 1 snapshot -> all skills should be INSUFFICIENT_HISTORY
    current_skills = [
        {"skill_id": "SK001", "name": "Python", "category": "Programming", "level": 3.5, "verified": True}
    ]
    progs_insufficient = svc.calculate_skill_progressions(
        current_skills=current_skills,
        snapshots=[{"skills_state": [{"skill_id": "SK001", "level": 3.5}]}],
        evidences=[]
    )
    assert progs_insufficient[0].status == SkillProgressionStatus.INSUFFICIENT_HISTORY
    assert progs_insufficient[0].previous_proficiency is None

    # Case B: 2 snapshots with varied skill trajectories
    snapshots = [
        {
            "snapshot_date": "2026-08-20T00:00:00Z",
            "skills_state": [
                {"skill_id": "SK001", "level": 2.5}, # Grew from 2.5 to 3.8
                {"skill_id": "SK002", "level": 3.0}, # Stable at 3.0
                {"skill_id": "SK004", "level": 3.5}  # Adjusted from 3.5 to 3.0
            ]
        },
        {
            "snapshot_date": "2026-09-20T00:00:00Z",
            "skills_state": [
                {"skill_id": "SK001", "level": 3.8},
                {"skill_id": "SK002", "level": 3.0},
                {"skill_id": "SK004", "level": 3.0}
            ]
        }
    ]

    current_skills_multi = [
        {"skill_id": "SK001", "name": "Python", "category": "Programming", "level": 3.8, "verified": True},
        {"skill_id": "SK002", "name": "JavaScript", "category": "Frontend", "level": 3.0, "verified": False},
        {"skill_id": "SK003", "name": "TypeScript", "category": "Frontend", "level": 3.2, "verified": True}, # New
        {"skill_id": "SK004", "name": "React", "category": "Frontend", "level": 3.0, "verified": False}
    ]

    progs = svc.calculate_skill_progressions(current_skills=current_skills_multi, snapshots=snapshots, evidences=[])
    prog_map = {p.skill_id: p for p in progs}

    # Python: 2.5 -> 3.8 = +1.3 (IMPROVING)
    assert prog_map["SK001"].status == SkillProgressionStatus.IMPROVING
    assert prog_map["SK001"].absolute_change == 1.3

    # JavaScript: 3.0 -> 3.0 = 0.0 (STABLE)
    assert prog_map["SK002"].status == SkillProgressionStatus.STABLE
    assert prog_map["SK002"].absolute_change == 0.0

    # TypeScript: not in previous snapshot (NEWLY_ACQUIRED)
    assert prog_map["SK003"].status == SkillProgressionStatus.NEWLY_ACQUIRED

    # React: 3.5 -> 3.0 = -0.5 (DECLINING)
    assert prog_map["SK004"].status == SkillProgressionStatus.DECLINING
    assert prog_map["SK004"].absolute_change == -0.5


def test_consistency_calculation_and_duplicate_protection():
    """Verify that multiple events on the same calendar day count as 1 active day and streaks are accurate."""
    svc = LearningIntelligenceService()

    # 10 activities logged on the same calendar day (2026-09-18)
    spam_activities = [
        {"completed_at": f"2026-09-18T{h:02d}:30:00Z"}
        for h in range(10)
    ]
    # 2 activities on consecutive days
    spread_activities = spam_activities + [
        {"completed_at": "2026-09-19T10:00:00Z"},
        {"completed_at": "2026-09-20T10:00:00Z"}
    ]

    consistency = svc.calculate_consistency(
        activities=spread_activities,
        projects=[],
        assessments=[],
        evidences=[]
    )

    # Distinct active days should be exactly 3 (Sep 18, 19, 20), despite 12 total activities
    assert consistency.active_learning_days_count == 3
    assert consistency.longest_streak_days == 3
    assert consistency.consistency_score > 0.0
    assert consistency.consistency_score <= 100.0


def test_stagnation_detection_active_vs_plateau():
    """Verify stagnation diagnostic correctly differentiates active progress from sustained inactivity."""
    svc = LearningIntelligenceService()
    now = datetime(2026, 9, 20, 12, 0, 0, tzinfo=timezone.utc)

    # 1. Insufficient history (<2 snapshots)
    stag_insuf = svc.detect_stagnation(snapshots=[{}], activities=[], progressions=[])
    assert stag_insuf.status == StagnationStatus.INSUFFICIENT_HISTORY

    # 2. Inactive for 35 days -> POSSIBLE_STAGNATION
    old_activity = [{"completed_at": (now - timedelta(days=35)).isoformat()}]
    stag_inactive = svc.detect_stagnation(
        snapshots=[{}, {}],
        activities=old_activity,
        progressions=[]
    )
    assert stag_inactive.status == StagnationStatus.POSSIBLE_STAGNATION

    # 3. Active in last 2 days with improving skill -> ACTIVE_PROGRESS
    recent_activity = [{"completed_at": (now - timedelta(days=1)).isoformat()}]
    improving_item = SkillProgressionItem(
        skill_id="SK001",
        skill_name="Python",
        category="Programming",
        current_proficiency=4.0,
        previous_proficiency=3.0,
        absolute_change=1.0,
        status=SkillProgressionStatus.IMPROVING,
        progression_summary="Improving"
    )
    stag_active = svc.detect_stagnation(
        snapshots=[{}, {}],
        activities=recent_activity,
        progressions=[improving_item]
    )
    assert stag_active.status == StagnationStatus.ACTIVE_PROGRESS
    assert stag_active.meaningful_skill_progression_detected is True


@pytest.mark.anyio
async def test_record_snapshot_and_get_overview_integration():
    """Verify full end-to-end overview generation from MongoDB for authenticated student."""
    svc = LearningIntelligenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    # Record fresh snapshot
    snap_res = await svc.record_learning_snapshot(student_id=user_id, db=db)
    assert snap_res["student_id"] == user_id
    assert "average_proficiency" in snap_res

    # Retrieve full overview
    overview = await svc.get_learning_trajectory_overview(student_id=user_id, db=db)
    assert overview.student_id == user_id
    assert overview.total_snapshots >= 1
    assert len(overview.skill_progressions) > 0
    assert overview.trajectory_direction in [
        TrajectoryDirection.ACCELERATING,
        TrajectoryDirection.STEADY,
        TrajectoryDirection.DECELERATING,
        TrajectoryDirection.STAGNANT,
        TrajectoryDirection.INSUFFICIENT_HISTORY
    ]
    assert overview.velocity is not None
    assert overview.consistency is not None


@pytest.mark.anyio
async def test_learning_intelligence_api_endpoints():
    """Verify all REST API endpoints under /api/v1/learning-intelligence return valid authenticated responses."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login to get token
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "demo@skill2career.com", "password": "Password123!"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. GET /overview
        res_ov = await ac.get("/api/v1/learning-intelligence/overview", headers=headers)
        assert res_ov.status_code == 200
        data_ov = res_ov.json()
        assert "velocity" in data_ov
        assert "consistency" in data_ov
        assert "skill_progressions" in data_ov

        # 2. GET /trajectory
        res_tr = await ac.get("/api/v1/learning-intelligence/trajectory", headers=headers)
        assert res_tr.status_code == 200
        assert isinstance(res_tr.json(), list)

        # 3. GET /velocity
        res_vel = await ac.get("/api/v1/learning-intelligence/velocity", headers=headers)
        assert res_vel.status_code == 200
        assert "overall_learning_velocity" in res_vel.json()

        # 4. GET /consistency
        res_con = await ac.get("/api/v1/learning-intelligence/consistency", headers=headers)
        assert res_con.status_code == 200
        assert "consistency_score" in res_con.json()

        # 5. GET /stagnation
        res_stag = await ac.get("/api/v1/learning-intelligence/stagnation", headers=headers)
        assert res_stag.status_code == 200
        assert "status" in res_stag.json()

        # 6. GET /skills/SK001
        res_sk = await ac.get("/api/v1/learning-intelligence/skills/SK001", headers=headers)
        assert res_sk.status_code == 200
        assert isinstance(res_sk.json(), list)

        # 7. POST /snapshot
        res_snap = await ac.post("/api/v1/learning-intelligence/snapshot", headers=headers)
        assert res_snap.status_code == 201


@pytest.mark.anyio
async def test_unauthenticated_requests_rejected():
    """Verify that unauthenticated requests to learning intelligence endpoints return 401 Unauthorized."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/learning-intelligence/overview")
        assert res.status_code == 401


@pytest.mark.anyio
async def test_ml_readiness_model_invariance_and_non_mutation():
    """Verify that calculating learning intelligence does not alter trained ML models or readiness inference."""
    ml_svc = MLInferenceService.get_instance()
    li_svc = LearningIntelligenceService()
    db = await get_db()

    user = await db.users.find_one({"email": "demo@skill2career.com"}) or await db.users.find_one({})
    user_id = str(user.get("_id") or user.get("id"))

    profile = await db.student_profiles.find_one({"user_id": user_id})
    skills = profile.get("skills", [])

    # ML prediction before
    pred_before = ml_svc.predict_readiness(student_skills_list=skills, target_career_id="CR001")

    # Run Learning Intelligence computations
    await li_svc.get_learning_trajectory_overview(student_id=user_id, db=db)

    # ML prediction after
    pred_after = ml_svc.predict_readiness(student_skills_list=skills, target_career_id="CR001")

    # Must be 100% identical
    assert pred_before["readiness_score"] == pred_after["readiness_score"]
    assert pred_before["readiness_tier"] == pred_after["readiness_tier"]
    assert pred_before["model_version"] == pred_after["model_version"]


@pytest.mark.anyio
async def test_cross_student_snapshot_and_overview_isolation():
    """Verify Student A cannot retrieve or modify Student B's trajectory data."""
    svc = LearningIntelligenceService()
    db = await get_db()

    student_a_id = "student_alpha_111"
    student_b_id = "student_beta_222"

    # Insert snapshots strictly for Student B
    await db.learning_snapshots.delete_many({"student_id": student_b_id})
    await db.learning_snapshots.insert_one({
        "student_id": student_b_id,
        "snapshot_date": "2026-09-01T00:00:00Z",
        "skill_count": 5,
        "average_proficiency": 3.0,
        "verified_evidence_count": 2
    })

    # Student A queries overview -> must not see Student B snapshots
    a_snapshots = await svc.get_student_snapshots(student_id=student_a_id, db=db)
    assert not any(s.get("student_id") == student_b_id for s in a_snapshots)


@pytest.mark.anyio
async def test_brand_new_student_empty_state():
    """Verify brand new student with 0 history returns clean empty metrics without server error."""
    svc = LearningIntelligenceService()
    db = await get_db()

    new_student_id = "brand_new_student_000"
    overview = await svc.get_learning_trajectory_overview(student_id=new_student_id, db=db)

    assert overview.total_snapshots == 0
    assert overview.trajectory_direction == TrajectoryDirection.INSUFFICIENT_HISTORY
    assert overview.velocity.status == "INSUFFICIENT_HISTORY"
    assert overview.consistency.active_learning_days_count == 0
    assert overview.stagnation.status == StagnationStatus.INSUFFICIENT_HISTORY
