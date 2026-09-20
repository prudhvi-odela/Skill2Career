"""
Skill2Career Practice & Code Lab Router
Exposes coding problems catalog, problem details, sandboxed test execution, and student attempt logs.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db
from backend.services.auth_service import get_current_user
from backend.services.practice_service import PracticeService
from backend.schemas.practice_schemas import (
    PracticeProblemListItem,
    PracticeProblemDetailResponse,
    CodeSubmitRequest,
    CodeExecutionResultResponse,
    PracticeAttemptHistoryItem
)

router = APIRouter(prefix="/practice", tags=["Practice & Coding Lab"])
practice_service = PracticeService()


@router.get("/problems", response_model=List[PracticeProblemListItem])
async def list_practice_problems(
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    skill_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves practice problems filtered by difficulty, category, or skill."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await practice_service.list_problems(
        student_id=user_id,
        difficulty=difficulty,
        category=category,
        skill_id=skill_id,
        db=db
    )


@router.get("/problems/{problem_id}", response_model=PracticeProblemDetailResponse)
async def get_practice_problem(
    problem_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves practice problem description, starter code templates, and sample test cases."""
    try:
        return await practice_service.get_problem_detail(problem_id=problem_id, db=db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/problems/{problem_id}/submit", response_model=CodeExecutionResultResponse)
async def submit_code_solution(
    problem_id: str,
    payload: CodeSubmitRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Runs sandboxed code execution against test cases with safety limits and logs the attempt."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        return await practice_service.execute_and_submit(
            student_id=user_id,
            problem_id=problem_id,
            language=payload.language,
            code=payload.code,
            db=db
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/attempts", response_model=List[PracticeAttemptHistoryItem])
async def get_my_practice_attempts(
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves the authenticated student's past practice and coding attempts."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await practice_service.get_student_attempts(student_id=user_id, limit=limit, db=db)
