"""
Skill2Career - Career Readiness & Adaptive Forecasting Router (Phase 09C)
Exposes authenticated REST API endpoints for evidence-grounded career interpretation,
strengths, gaps, multi-source evidence coverage, and side-by-side career comparisons.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db
from backend.services.auth_service import get_current_user
from backend.services.career_readiness_service import CareerReadinessService
from backend.schemas.career_readiness_schemas import (
    CareerReadinessAnalysisResponse,
    CareerStrengthItem,
    CareerGapItem
)

router = APIRouter(prefix="/career-readiness", tags=["Career Readiness & Adaptive Forecasting"])
readiness_service = CareerReadinessService()


@router.get("/compare")
async def compare_careers(
    career_ids: List[str] = Query(..., description="List of 2 to 5 career codes to compare"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Compares 2 to 5 career pathways side-by-side using authoritative ML, competency, and market signals."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        res = await readiness_service.compare_careers(
            student_id=user_id,
            career_ids=career_ids,
            db=db
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Comparison error: {str(e)}")


@router.get("/{career_id}", response_model=CareerReadinessAnalysisResponse)
async def get_career_readiness(
    career_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves full evidence-grounded career readiness analysis for student and target career."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        analysis = await readiness_service.get_career_readiness_analysis(
            student_id=user_id,
            career_id=career_id,
            db=db
        )
        return analysis
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Readiness analysis error: {str(e)}")


@router.get("/{career_id}/strengths", response_model=List[CareerStrengthItem])
async def get_career_strengths(
    career_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves verified and demonstrated strengths for target career."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        strengths = await readiness_service.get_career_strengths(
            student_id=user_id,
            career_id=career_id,
            db=db
        )
        return strengths
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Strengths analysis error: {str(e)}")


@router.get("/{career_id}/gaps", response_model=List[CareerGapItem])
async def get_career_gaps(
    career_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves prioritized competency gaps for target career."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        gaps = await readiness_service.get_career_gaps(
            student_id=user_id,
            career_id=career_id,
            db=db
        )
        return gaps
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Gaps analysis error: {str(e)}")


@router.get("/{career_id}/evidence")
async def get_career_evidence(
    career_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves multi-artifact evidence alignment for target career."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        evidence = await readiness_service.get_career_evidence(
            student_id=user_id,
            career_id=career_id,
            db=db
        )
        return evidence
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Evidence retrieval error: {str(e)}")
