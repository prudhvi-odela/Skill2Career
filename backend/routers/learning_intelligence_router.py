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
    TrajectoryPoint
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
