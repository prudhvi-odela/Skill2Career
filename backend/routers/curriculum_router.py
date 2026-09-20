"""
Skill2Career Curriculum, Branch Catalog, and Onboarding Router
Exposes database-driven curriculum catalogs, branch subjects, diagnostic baselines,
onboarding completion, student learning profiles, and personalized learning paths.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db
from backend.services.auth_service import get_current_user
from backend.services.curriculum_service import CurriculumService
from backend.schemas.curriculum_schemas import (
    AcademicProgramResponse,
    BranchResponse,
    SubjectResponse,
    SubjectBaselineSubmitRequest,
    DiagnosticQuizResponse,
    DiagnosticSubmitRequest,
    DiagnosticResultResponse,
    OnboardingCompleteRequest,
    OnboardingStatusResponse,
    StudentLearningProfileResponse,
    PersonalizedLearningPathResponse
)

router = APIRouter(prefix="/curriculum", tags=["Curriculum & Education Engine"])
curriculum_service = CurriculumService()


@router.get("/programs", response_model=List[AcademicProgramResponse])
async def list_academic_programs(db: AsyncDatabase = Depends(get_db)):
    """Retrieves all supported degree programs (B.Tech, B.S., BCA, M.S., MCA)."""
    return await curriculum_service.get_academic_programs(db=db)


@router.get("/programs/{program_id}/branches", response_model=List[BranchResponse])
async def list_program_branches(program_id: str, db: AsyncDatabase = Depends(get_db)):
    """Retrieves academic branches belonging to a degree program."""
    return await curriculum_service.get_branches_by_program(program_id=program_id, db=db)


@router.get("/branches/{branch_id}/subjects", response_model=List[SubjectResponse])
async def list_branch_subjects(branch_id: str, db: AsyncDatabase = Depends(get_db)):
    """Retrieves standard curriculum subjects for an academic branch."""
    return await curriculum_service.get_subjects_by_branch(branch_id=branch_id, db=db)


@router.get("/student/onboarding-status", response_model=OnboardingStatusResponse)
async def get_student_onboarding_status(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Checks whether the student has completed initial academic onboarding."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await curriculum_service.get_onboarding_status(student_id=user_id, db=db)


@router.post("/onboarding/complete", status_code=status.HTTP_200_OK)
async def complete_student_onboarding(
    payload: OnboardingCompleteRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Saves first-time academic profile information and initializes curriculum."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await curriculum_service.complete_onboarding(
        student_id=user_id,
        program_id=payload.program_id,
        branch_id=payload.branch_id,
        academic_year=payload.academic_year,
        interests=payload.interests,
        target_career_id=payload.target_career_id,
        institution=payload.institution,
        weekly_study_hours=payload.weekly_study_hours,
        db=db
    )


@router.post("/subjects/{subject_id}/baseline", status_code=status.HTTP_200_OK)
async def record_subject_baseline_rating(
    subject_id: str,
    payload: SubjectBaselineSubmitRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Records student's self-reported baseline proficiency level for a subject."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        return await curriculum_service.record_subject_baseline(
            student_id=user_id,
            subject_id=subject_id,
            rating_type=payload.rating_type,
            proficiency_level=payload.proficiency_level,
            db=db
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/subjects/{subject_id}/diagnostic-quiz", response_model=DiagnosticQuizResponse)
async def get_subject_diagnostic_quiz(
    subject_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves diagnostic baseline questions for a curriculum subject."""
    try:
        return await curriculum_service.get_subject_diagnostic_quiz(subject_id=subject_id, db=db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/subjects/{subject_id}/submit-diagnostic", response_model=DiagnosticResultResponse)
async def submit_subject_diagnostic_test(
    subject_id: str,
    payload: DiagnosticSubmitRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Submits answers for a subject diagnostic test, computing score and creating skill evidence."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        return await curriculum_service.submit_diagnostic_quiz(
            student_id=user_id,
            subject_id=subject_id,
            answers=payload.answers,
            db=db
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/student/learning-profile", response_model=StudentLearningProfileResponse)
async def get_student_learning_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Returns the comprehensive student learning profile synthesizing academic background, subject strengths/gaps, skill strengths/gaps, and evidence confidence."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await curriculum_service.get_student_learning_profile(student_id=user_id, db=db)


@router.get("/student/personalized-learning-path", response_model=PersonalizedLearningPathResponse)
async def get_personalized_learning_path(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Generates an individual personalized learning trajectory connecting curriculum, skill gaps, and career target."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await curriculum_service.get_personalized_learning_path(student_id=user_id, db=db)
