"""
Skill2Career - Market Intelligence Router
Exposes endpoints for career market signals, skill demand matrices,
student-vs-market gap prioritization, and multi-career comparison.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db
from backend.services.auth_service import get_current_user
from backend.services.market_intelligence_service import MarketIntelligenceService
from backend.services.career_comparison_service import CareerComparisonService
from backend.schemas.market_schemas import (
    MarketDataSourceResponse,
    CareerMarketSignalResponse,
    SkillMarketSignalResponse,
    CareerSkillMarketMatrixResponse,
    StudentMarketAnalysisRequest,
    StudentMarketAnalysisResponse,
    CareerComparisonRequest,
    CareerComparisonResponse
)

router = APIRouter(prefix="/market", tags=["Career Market Intelligence"])
market_service = MarketIntelligenceService()
comparison_service = CareerComparisonService()


@router.get("/sources", response_model=List[MarketDataSourceResponse])
async def get_market_sources(db: AsyncDatabase = Depends(get_db)):
    """Retrieves all active market intelligence data sources with licensing and provenance."""
    sources = await market_service.get_market_sources(db)
    return sources


@router.get("/careers/{career_id}", response_model=CareerMarketSignalResponse)
async def get_career_market_signal(
    career_id: str,
    region: str = "Global",
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves market demand index, growth trend, sample size, and provenance for a career."""
    signal = await market_service.get_career_market_signal(career_id=career_id, db=db, region=region)
    if not signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No market signal found for career '{career_id}'"
        )
    return signal


@router.get("/skills/{skill_id}", response_model=SkillMarketSignalResponse)
async def get_skill_market_signal(
    skill_id: str,
    region: str = "Global",
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves market demand index, category, tier, and provenance for an individual skill."""
    signal = await market_service.get_skill_market_signal(skill_id=skill_id, db=db, region=region)
    if not signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No market signal found for skill '{skill_id}'"
        )
    return signal


@router.get("/careers/{career_id}/skills", response_model=CareerSkillMarketMatrixResponse)
async def get_career_skills_market(
    career_id: str,
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves complete skill demand matrix and market signals for all required skills of a career."""
    career_doc = await db.career_roles.find_one({"$or": [{"career_code": career_id}, {"_id": career_id}]})
    if not career_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career role '{career_id}' not found in taxonomy."
        )
    matrix = await market_service.get_career_skills_market(career_id=career_id, db=db)
    return matrix


@router.post("/student-analysis", response_model=StudentMarketAnalysisResponse)
async def analyze_student_market(
    request: StudentMarketAnalysisRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Performs authenticated student-vs-market analysis.
    Prioritizes skill gaps transparently against external market demand while preserving authoritative ML readiness.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        analysis = await market_service.analyze_student_market(
            student_id=user_id,
            target_career_id=request.target_career_id,
            db=db
        )
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Market analysis error: {str(e)}")


@router.post("/career-comparison", response_model=CareerComparisonResponse)
async def compare_careers(
    request: CareerComparisonRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Performs multi-career comparison for authenticated student across 2 to 5 career pathways.
    Presents objective evidence including skill match, readiness benchmark, and market demand.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        comparison = await comparison_service.compare_careers(
            student_id=user_id,
            career_ids=request.career_ids,
            db=db
        )
        return comparison
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Career comparison error: {str(e)}")
