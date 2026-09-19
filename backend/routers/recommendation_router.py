"""
Skill2Career - Recommendation Router
Exposes endpoints for deterministic, prioritized skill recommendations and student feedback.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db, get_utc_now, serialize_doc
from backend.services.auth_service import get_current_user
from backend.services.recommendation_service import RecommendationService
from backend.schemas.recommendation_schemas import (
    SkillRecommendationResponse,
    RecommendationFeedbackCreate,
    RecommendationFeedbackResponse
)

router = APIRouter(prefix="/recommendations", tags=["Career Recommendations"])
rec_service = RecommendationService()


@router.get("", response_model=List[SkillRecommendationResponse])
async def get_current_recommendations(
    career_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves ranked, deterministic skill recommendations for the authenticated student."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        recommendations = await rec_service.generate_recommendations_for_student(
            student_id=user_id,
            career_id=career_id,
            db=db
        )
        return recommendations
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Recommendation error: {str(e)}")


@router.get("/{career_id}", response_model=List[SkillRecommendationResponse])
async def get_career_recommendations(
    career_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves ranked skill recommendations for a specific career target."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        recommendations = await rec_service.generate_recommendations_for_student(
            student_id=user_id,
            career_id=career_id,
            db=db
        )
        return recommendations
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Recommendation error: {str(e)}")


@router.post("/generate", response_model=List[SkillRecommendationResponse])
async def generate_recommendations(
    career_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Generates fresh deterministic recommendations reflecting latest student progress."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        recommendations = await rec_service.generate_recommendations_for_student(
            student_id=user_id,
            career_id=career_id,
            db=db
        )
        return recommendations
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Recommendation error: {str(e)}")


ALLOWED_FEEDBACK_TYPES = {"HELPFUL", "NOT_HELPFUL", "ALREADY_KNOW_THIS", "TOO_DIFFICULT", "NOT_RELEVANT"}


@router.post("/feedback", response_model=RecommendationFeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_recommendation_feedback(
    feedback: RecommendationFeedbackCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Persists student qualitative feedback on skill recommendations without modifying ML models."""
    if feedback.feedback_type not in ALLOWED_FEEDBACK_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid feedback_type '{feedback.feedback_type}'. Allowed types: {list(ALLOWED_FEEDBACK_TYPES)}"
        )

    user_id = str(current_user.get("_id") or current_user.get("id"))
    now = get_utc_now()
    doc = {
        "student_id": user_id,
        "skill_id": feedback.skill_id,
        "career_id": feedback.career_id,
        "feedback_type": feedback.feedback_type,
        "notes": feedback.notes,
        "created_at": now
    }
    res = await db.recommendation_feedback.insert_one(doc)
    return RecommendationFeedbackResponse(
        id=str(res.inserted_id),
        student_id=user_id,
        skill_id=feedback.skill_id,
        career_id=feedback.career_id,
        feedback_type=feedback.feedback_type,
        notes=feedback.notes,
        created_at=now.isoformat(),
        status="persisted"
    )
