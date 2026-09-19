"""
Skill2Career Skill Assessment & Quiz Router
Enables automated skill verification, interactive quizzes, and proficiency elevation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database.session import get_db
from backend.models.models import (
    StudentProfile, Skill, StudentSkill, Assessment, AssessmentQuestion, AssessmentResult, LearningActivity
)
from backend.schemas.schemas import (
    AssessmentDetailResponse, QuestionItem, AssessmentSubmitRequest, AssessmentResultResponse
)
from backend.services.auth_service import get_current_user

router = APIRouter(prefix="/assessments", tags=["Skill Assessments & Quizzes"])


@router.get("", response_model=List[dict])
def list_assessments(db: Session = Depends(get_db)):
    assessments = db.query(Assessment).all()
    return [
        {
            "id": a.id,
            "skill_id": a.skill_id,
            "skill_name": a.skill.name if a.skill else a.skill_id,
            "category": a.skill.category if a.skill else "General",
            "title": a.title,
            "difficulty": a.difficulty,
            "time_limit_mins": a.time_limit_mins,
            "pass_score": a.pass_score,
            "total_questions": len(a.questions)
        }
        for a in assessments
    ]


@router.get("/{assessment_id}", response_model=AssessmentDetailResponse)
def get_assessment_quiz(assessment_id: str, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    questions = [
        QuestionItem(
            id=q.id,
            question_text=q.question_text,
            options=q.options_json
        )
        for q in assessment.questions
    ]

    return AssessmentDetailResponse(
        id=assessment.id,
        skill_id=assessment.skill_id,
        skill_name=assessment.skill.name if assessment.skill else assessment.skill_id,
        title=assessment.title,
        difficulty=assessment.difficulty,
        time_limit_mins=assessment.time_limit_mins,
        pass_score=assessment.pass_score,
        total_questions=len(questions),
        questions=questions
    )


@router.post("/submit", response_model=AssessmentResultResponse)
def submit_assessment(
    payload: AssessmentSubmitRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    assessment = db.query(Assessment).filter(Assessment.id == payload.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    questions = assessment.questions
    if not questions:
        raise HTTPException(status_code=400, detail="Assessment contains no questions.")

    correct_count = 0
    for q in questions:
        selected_idx = payload.answers.get(q.id)
        if selected_idx is not None and int(selected_idx) == q.correct_option_index:
            correct_count += 1

    score_pct = round((correct_count / len(questions)) * 100.0, 1)
    passed = score_pct >= assessment.pass_score
    proficiency_awarded = 4.0 if score_pct >= 90 else (3.5 if passed else 2.5)

    # Persist assessment result
    res = AssessmentResult(
        profile_id=profile.id,
        assessment_id=assessment.id,
        score_pct=score_pct,
        passed=passed,
        proficiency_awarded=proficiency_awarded
    )
    db.add(res)

    # If passed, upgrade and verify the student's skill in their profile
    if passed:
        student_skill = db.query(StudentSkill).filter(
            StudentSkill.profile_id == profile.id,
            StudentSkill.skill_id == assessment.skill_id
        ).first()

        if student_skill:
            student_skill.proficiency_level = max(student_skill.proficiency_level, proficiency_awarded)
            student_skill.is_verified = True
            student_skill.verification_source = f"Passed {assessment.title} ({score_pct}%)"
        else:
            student_skill = StudentSkill(
                profile_id=profile.id,
                skill_id=assessment.skill_id,
                proficiency_level=proficiency_awarded,
                is_verified=True,
                verification_source=f"Passed {assessment.title} ({score_pct}%)"
            )
            db.add(student_skill)

        # Log learning activity
        act = LearningActivity(
            profile_id=profile.id,
            activity_type="quiz",
            title=f"Completed {assessment.title} with {score_pct}% score",
            hours_spent=round(assessment.time_limit_mins / 60.0, 2)
        )
        db.add(act)

    db.commit()

    skill_name = assessment.skill.name if assessment.skill else assessment.skill_id
    explanation = (
        f"Congratulations! You scored {score_pct}% and verified your proficiency in {skill_name} at Level {proficiency_awarded}/5.0."
        if passed else
        f"You scored {score_pct}% (Pass threshold: {assessment.pass_score}%). Review the recommended learning resources and retake the quiz when ready."
    )

    return AssessmentResultResponse(
        assessment_id=assessment.id,
        score_pct=score_pct,
        passed=passed,
        pass_score=assessment.pass_score,
        proficiency_awarded=proficiency_awarded,
        skill_id=assessment.skill_id,
        skill_name=skill_name,
        correct_count=correct_count,
        total_questions=len(questions),
        explanation=explanation
    )
