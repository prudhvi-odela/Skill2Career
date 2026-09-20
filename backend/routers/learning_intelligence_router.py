"""
Skill2Career - Learning Intelligence & Trajectory Router (Phase 09B)
Exposes authenticated endpoints for transparent learning trajectory, velocity,
consistency metrics, stagnation detection, and evidence-grounded skill progression.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db
from backend.services.auth_service import get_current_user
from backend.services.learning_intelligence_service import LearningIntelligenceService
from backend.schemas.learning_intelligence_schemas import (
    LearningTrajectoryOverviewResponse,
    LearningVelocityMetrics,
    ConsistencyMetrics,
    StagnationMetrics,
    SkillLevelHistoryItem,
    TrajectoryPoint,
    DailyLearningLogRequest,
    DailyLearningLogResponse,
    QuickCheckQuestion,
    QuickCheckSubmitRequest,
    QuickCheckResultResponse
)

router = APIRouter(prefix="/learning-intelligence", tags=["Learning Intelligence & Trajectory Engine"])
intelligence_service = LearningIntelligenceService()


@router.get("/overview", response_model=LearningTrajectoryOverviewResponse)
async def get_learning_intelligence_overview(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves full Learning Intelligence, Trajectory, Velocity, and Consistency overview for student."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    overview = await intelligence_service.get_learning_trajectory_overview(student_id=user_id, db=db)
    return overview


@router.get("/trajectory", response_model=List[TrajectoryPoint])
async def get_trajectory_timeline(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves chronological trajectory timeline checkpoints for student."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    overview = await intelligence_service.get_learning_trajectory_overview(student_id=user_id, db=db)
    return overview.trajectory_timeline


@router.get("/velocity", response_model=LearningVelocityMetrics)
async def get_learning_velocity(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves time-normalized learning velocity and momentum metrics."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    overview = await intelligence_service.get_learning_trajectory_overview(student_id=user_id, db=db)
    return overview.velocity


@router.get("/consistency", response_model=ConsistencyMetrics)
async def get_learning_consistency(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves study regularity, streak, and calendar distribution metrics."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    overview = await intelligence_service.get_learning_trajectory_overview(student_id=user_id, db=db)
    return overview.consistency


@router.get("/stagnation", response_model=StagnationMetrics)
async def get_stagnation_analysis(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves diagnostic stagnation and momentum status."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    overview = await intelligence_service.get_learning_trajectory_overview(student_id=user_id, db=db)
    return overview.stagnation


@router.get("/skills/{skill_id}", response_model=List[SkillLevelHistoryItem])
async def get_skill_progression_history(
    skill_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves chronological level history for an individual skill."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    history = await intelligence_service.get_skill_history(
        student_id=user_id,
        skill_id=skill_id,
        db=db
    )
    return history


@router.post("/snapshot", status_code=status.HTTP_201_CREATED)
async def create_learning_snapshot(
    target_career_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Explicitly records an immutable point-in-time learning snapshot for student."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        snapshot = await intelligence_service.record_learning_snapshot(
            student_id=user_id,
            db=db,
            target_career_id=target_career_id
        )
        return {
            "status": "success",
            "message": "Learning snapshot successfully recorded.",
            "snapshot": snapshot
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Snapshot generation error: {str(e)}"
        )


@router.post("/log-session", response_model=DailyLearningLogResponse, status_code=status.HTTP_201_CREATED)
async def log_daily_learning_session(
    payload: DailyLearningLogRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Logs a daily learning activity, calculates streak & study hours, and generates a 5-question quick check.
    """
    import uuid
    from datetime import datetime, timezone
    user_id = str(current_user.get("_id") or current_user.get("id"))
    now = datetime.now(timezone.utc)
    session_id = f"SESS_{uuid.uuid4().hex[:10]}"

    # Record in learning_sessions
    session_doc = {
        "session_id": session_id,
        "student_id": user_id,
        "topic": payload.topic,
        "duration_minutes": payload.duration_minutes,
        "activity_type": payload.activity_type,
        "confidence_level": payload.confidence_level,
        "notes": payload.notes,
        "skills": payload.skills,
        "created_at": now
    }
    await db.learning_sessions.insert_one(session_doc)

    # Record in learning_activities
    hours_studied = round(payload.duration_minutes / 60.0, 2)
    await db.learning_activities.insert_one({
        "student_id": user_id,
        "title": f"Studied: {payload.topic}",
        "activity_type": payload.activity_type,
        "topic": payload.topic,
        "skills": payload.skills,
        "duration_minutes": payload.duration_minutes,
        "notes": payload.notes,
        "completed_at": now
    })

    # Update profile weekly study hours
    await db.student_profiles.update_one(
        {"user_id": user_id},
        {"$inc": {"statistics.weekly_study_hours": hours_studied}}
    )

    # Generate 5 quick check questions for topic
    quick_questions = []
    if payload.take_quick_check:
        quick_questions = [
            QuickCheckQuestion(
                id="qc_1",
                question_text=f"What is the core conceptual foundation of {payload.topic}?",
                options=["State encapsulation & control flow", "Arbitrary network routing", "Static memory bounds", "Undefined behavior"],
                skill_id=payload.skills[0] if payload.skills else "SK001",
                explanation="Core foundations structure how logic is encapsulated and executed."
            ),
            QuickCheckQuestion(
                id="qc_2",
                question_text=f"Which metric or property is most critical when designing {payload.topic} modules?",
                options=["Maintainability & edge-case correctness", "Random execution time", "Unchecked memory access", "Hardcoded global state"],
                skill_id=payload.skills[0] if payload.skills else "SK001",
                explanation="Modular software requires maintainable design and strict correctness."
            ),
            QuickCheckQuestion(
                id="qc_3",
                question_text=f"When refactoring {payload.topic}, what should be verified first?",
                options=["Unit tests & contract consistency", "Deleting comments", "Disabling compiler checks", "Skipping assertions"],
                skill_id=payload.skills[0] if payload.skills else "SK001",
                explanation="Tests verify that functional behavior remains preserved during refactoring."
            ),
            QuickCheckQuestion(
                id="qc_4",
                question_text=f"What is a common pitfall encountered when working with {payload.topic}?",
                options=["Ignoring boundary limits & null states", "Using descriptive names", "Handling exceptions", "Following style guides"],
                skill_id=payload.skills[0] if payload.skills else "SK001",
                explanation="Unhandled boundary conditions cause unexpected runtime bugs."
            ),
            QuickCheckQuestion(
                id="qc_5",
                question_text=f"How does {payload.topic} integrate with overall system architecture?",
                options=["Provides standardized interfaces for upstream components", "Bypasses all data validations", "Requires isolated single-threaded runtime", "Disables database constraints"],
                skill_id=payload.skills[0] if payload.skills else "SK001",
                explanation="Clean interfaces enable modular component integration."
            )
        ]

    return DailyLearningLogResponse(
        session_id=session_id,
        topic=payload.topic,
        duration_minutes=payload.duration_minutes,
        activity_type=payload.activity_type,
        confidence_level=payload.confidence_level,
        logged_at=now.isoformat(),
        quick_check_offered=payload.take_quick_check,
        quick_check_questions=quick_questions
    )


@router.post("/quick-check/submit", response_model=QuickCheckResultResponse)
async def submit_quick_check_quiz(
    payload: QuickCheckSubmitRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Evaluates answers for the 5-question daily check, records verified evidence, and triggers trajectory update.
    """
    from datetime import datetime, timezone
    from backend.services.evidence_service import EvidenceService

    user_id = str(current_user.get("_id") or current_user.get("id"))
    now = datetime.now(timezone.utc)
    ev_service = EvidenceService()

    total_q = 5
    correct_count = 0
    # Option index 0 is correct in standard generated quick questions
    for q_id, opt_idx in payload.answers.items():
        if opt_idx == 0:
            correct_count += 1

    score_pct = (correct_count / total_q) * 100.0
    passed = score_pct >= 60.0

    strong_topics = [payload.topic] if passed else []
    weak_topics = [] if passed else [payload.topic]
    recommendation = (
        f"Great mastery of {payload.topic}! Continue with your next roadmap milestone."
        if passed else
        f"Review {payload.topic} concepts and try a hands-on problem in the Practice Lab."
    )

    evidence_recorded = False
    evidence_id = None
    if passed and payload.skills:
        try:
            from backend.schemas.evidence_schemas import EvidenceCreateRequest, EvidenceType
            
            act_doc = await db.learning_activities.find_one({"student_id": user_id, "topic": payload.topic})
            if act_doc:
                act_id = str(act_doc["_id"])
            else:
                ins = await db.learning_activities.insert_one({
                    "student_id": user_id,
                    "title": f"Studied: {payload.topic}",
                    "activity_type": "SELF_STUDY",
                    "topic": payload.topic,
                    "skills": payload.skills,
                    "duration_minutes": 30,
                    "notes": "Daily learning session",
                    "completed_at": now
                })
                act_id = str(ins.inserted_id)

            req = EvidenceCreateRequest(
                skill_id=payload.skills[0],
                evidence_type=EvidenceType.LEARNING_ACTIVITY,
                source_entity="learning_activities",
                source_entity_id=act_id,
                title=f"Daily Quick Check: {payload.topic}",
                description=f"Scored {score_pct:.1f}% ({correct_count}/{total_q}) on daily learning comprehension test.",
                observed_proficiency=3.5 if score_pct >= 80.0 else 3.0,
                source_metadata={
                    "topic": payload.topic,
                    "score_percentage": score_pct,
                    "session_id": payload.session_id,
                    "hours_spent": 1.0,
                    "passed": True
                }
            )
            ev_res = await ev_service.create_evidence(
                student_id=user_id,
                request=req,
                db=db
            )
            evidence_recorded = True
            evidence_id = ev_res.get("evidence_id")
        except Exception:
            evidence_recorded = False

    # Record point in time learning snapshot
    try:
        await intelligence_service.record_learning_snapshot(student_id=user_id, db=db)
    except Exception:
        pass

    return QuickCheckResultResponse(
        session_id=payload.session_id,
        score_percentage=score_pct,
        passed=passed,
        total_questions=total_q,
        correct_count=correct_count,
        strong_topics=strong_topics,
        weak_topics=weak_topics,
        recommendation=recommendation,
        evidence_recorded=evidence_recorded,
        evidence_id=evidence_id
    )

