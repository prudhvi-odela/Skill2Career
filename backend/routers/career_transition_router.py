"""
Skill2Career - Career Transition & Strategic Career Planning Router (Phase 11)
Exposes authenticated REST API endpoints for career transition analysis, transferable competency discovery,
prerequisite chains, transition gap remediation, milestone planning, scenarios, and multi-career comparison.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db
from backend.services.auth_service import get_current_user
from backend.services.career_transition_service import CareerTransitionService
from backend.schemas.career_transition_schemas import (
    CareerTransitionAnalysisResponse,
    TransferableSkillItem,
    TransitionMilestone,
    TransferableEvidenceItem,
    StrategicTransitionPlan,
    MultiCareerTransitionComparisonRequest,
    MultiCareerTransitionComparisonResponse,
    TransitionScenarioRequest,
    TransitionScenarioResult,
    TransitionPlanUpdateRequest,
    TransitionHistoryItem
)

router = APIRouter(prefix="/career-transition", tags=["Career Transition & Strategic Planning"])
transition_service = CareerTransitionService()


@router.get("/history", response_model=List[TransitionHistoryItem])
async def get_transition_history(
    limit: int = Query(10, ge=1, le=50, description="Maximum history items to retrieve"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Retrieves past transition analyses for the authenticated student.
    Enforces strict student isolation.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        return await transition_service.get_transition_history(
            student_id=user_id,
            db=db,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving transition history: {str(e)}"
        )


@router.post("/compare", response_model=MultiCareerTransitionComparisonResponse)
async def compare_career_transitions(
    request: MultiCareerTransitionComparisonRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Factual multi-dimensional comparison of 2 to 5 target career transitions.
    Strict rule: Never ranks careers or declares an objective winner.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        return await transition_service.compare_career_transitions(
            student_id=user_id,
            target_career_ids=request.target_career_ids,
            db=db
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error comparing career transitions: {str(e)}"
        )


@router.post("/simulate", response_model=TransitionScenarioResult)
async def simulate_transition_scenario(
    request: TransitionScenarioRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Runs isolated, in-memory counterfactual scenario simulations for career transitions.
    Does NOT mutate student state, evidence, or active roadmaps.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        return await transition_service.simulate_transition_scenario(
            student_id=user_id,
            req=request,
            db=db
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error simulating transition scenario: {str(e)}"
        )


@router.get("/{target_career_id}", response_model=CareerTransitionAnalysisResponse)
async def analyze_career_transition(
    target_career_id: str,
    source_career_id: Optional[str] = Query(None, description="Optional source career ID override"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Performs full, evidence-grounded career transition analysis into the target career role.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        return await transition_service.analyze_transition(
            student_id=user_id,
            target_career_id=target_career_id,
            source_career_id=source_career_id,
            db=db,
            persist=True
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Career transition analysis error: {str(e)}"
        )


@router.get("/{target_career_id}/skills")
async def get_transferable_skills(
    target_career_id: str,
    source_career_id: Optional[str] = Query(None, description="Optional source career ID override"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Returns transferable skills and skill overlap analysis for target transition.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        return await transition_service.get_transferable_skills(
            student_id=user_id,
            target_career_id=target_career_id,
            source_career_id=source_career_id,
            db=db
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving transferable skills: {str(e)}"
        )


@router.get("/{target_career_id}/milestones", response_model=List[TransitionMilestone])
async def get_transition_milestones(
    target_career_id: str,
    source_career_id: Optional[str] = Query(None, description="Optional source career ID override"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Returns ordered, prerequisite-aware transition competency milestones.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        return await transition_service.get_transition_milestones(
            student_id=user_id,
            target_career_id=target_career_id,
            source_career_id=source_career_id,
            db=db
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving transition milestones: {str(e)}"
        )


@router.get("/{target_career_id}/evidence", response_model=List[TransferableEvidenceItem])
async def get_transferable_evidence(
    target_career_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Returns verified and unverified evidence items relevant to target career transition.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        return await transition_service.get_transferable_evidence(
            student_id=user_id,
            target_career_id=target_career_id,
            db=db
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving transferable evidence: {str(e)}"
        )


@router.post("/{target_career_id}/plan", response_model=StrategicTransitionPlan)
async def create_or_update_transition_plan(
    target_career_id: str,
    plan_update: TransitionPlanUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Creates or updates a student's strategic transition plan.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        return await transition_service.create_or_update_transition_plan(
            student_id=user_id,
            target_career_id=target_career_id,
            plan_update=plan_update,
            db=db
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving strategic transition plan: {str(e)}"
        )
