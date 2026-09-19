"""
Skill2Career Analysis & ML Inference Router
Exposes endpoints for:
- Granular Skill Gap Analysis
- Real-time Supervised Job Readiness Prediction
- Longitudinal Trajectory & Future Readiness Forecasting
- Prediction History Audit
"""

import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database.session import get_db
from backend.models.models import (
    StudentProfile, CareerRole, SkillGap, ReadinessPrediction, PredictionLog, LearningSnapshot
)
from backend.schemas.schemas import (
    SkillGapResponse, GapItem, ReadinessPredictRequest, ReadinessPredictResponse,
    TrajectorySimulateRequest, TrajectoryForecastResponse
)
from backend.services.auth_service import get_current_user
from backend.services.ai_service import ai_service
from backend.ml.inference import MLInferenceService

router = APIRouter(prefix="/analysis", tags=["Skill Gap & Readiness Analysis"])
ml_service = MLInferenceService.get_instance()


@router.post("/gap", response_model=SkillGapResponse)
def compute_skill_gap(
    target_career_id: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    chosen_career_id = target_career_id or profile.target_career_id
    if not chosen_career_id:
        raise HTTPException(status_code=400, detail="Please specify a target career or set one in your profile.")

    student_skills_list = [
        {"skill_id": ss.skill_id, "level": ss.proficiency_level}
        for ss in profile.skills
    ]

    gap_data = ml_service.analyze_skill_gap(student_skills_list, chosen_career_id)

    # Persist calculated skill gaps in database
    db.query(SkillGap).filter(
        SkillGap.profile_id == profile.id,
        SkillGap.career_id == chosen_career_id
    ).delete()

    for g in gap_data["gaps"]:
        db_gap = SkillGap(
            profile_id=profile.id,
            career_id=chosen_career_id,
            skill_id=g["skill_id"],
            required_level=g["required_level"],
            current_level=g["current_level"],
            gap=g["gap"],
            priority=g["priority"],
            status=g["status"]
        )
        db.add(db_gap)
    db.commit()

    return gap_data


@router.post("/readiness", response_model=ReadinessPredictResponse)
def predict_job_readiness(
    payload: ReadinessPredictRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_time = time.time()
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    target_career_id = payload.target_career_id or profile.target_career_id
    if not target_career_id:
        raise HTTPException(status_code=400, detail="No target career specified.")

    career = db.query(CareerRole).filter(CareerRole.id == target_career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Target career role does not exist.")

    # Student skills
    if payload.custom_skills is not None:
        student_skills_list = payload.custom_skills
    else:
        student_skills_list = [
            {"skill_id": ss.skill_id, "level": ss.proficiency_level}
            for ss in profile.skills
        ]

    # Metrics from profile
    projects_count = len(profile.projects)
    avg_complexity = float(np_mean([p.complexity_rating for p in profile.projects])) if projects_count > 0 else 2.5
    certs_count = len(profile.certifications)

    # Assessments passed pct
    total_asms = len(profile.assessment_results)
    passed_asms = len([a for a in profile.assessment_results if a.passed])
    asms_pct = round((passed_asms / total_asms) * 100.0, 1) if total_asms > 0 else 60.0

    prediction = ml_service.predict_readiness(
        student_skills_list=student_skills_list,
        target_career_id=target_career_id,
        degree=profile.degree,
        institution_tier=profile.institution_tier,
        gpa=profile.gpa,
        projects_count=projects_count,
        avg_project_complexity=avg_complexity,
        certifications_count=certs_count,
        assessments_passed_pct=asms_pct,
        weekly_study_hours=profile.weekly_study_hours,
        learning_velocity_index=profile.learning_velocity_index
    )

    # Skill Gap analysis for AI explanation
    gap_result = ml_service.analyze_skill_gap(student_skills_list, target_career_id)
    critical_gaps = [g for g in gap_result["gaps"] if g["priority"] in ["Critical", "High"]]
    proficient_skills = [g["skill_name"] for g in gap_result["gaps"] if g["status"] == "Proficient"]

    # AI narrative explanation
    ai_narrative = ai_service.explain_readiness_and_gaps(
        student_name=current_user.full_name,
        career_title=career.title,
        readiness_score=prediction["readiness_score"],
        critical_gaps=critical_gaps,
        proficient_skills=proficient_skills,
        weekly_study_hours=profile.weekly_study_hours
    )

    # Persist prediction in DB
    db_pred = ReadinessPrediction(
        profile_id=profile.id,
        career_id=target_career_id,
        readiness_score=prediction["readiness_score"],
        is_job_ready=prediction["is_job_ready"],
        readiness_tier=prediction["readiness_tier"],
        feature_breakdown_json=prediction["feature_contributions"],
        model_version_id=prediction["model_version"]
    )
    db.add(db_pred)

    # Also record a learning snapshot
    snapshot = LearningSnapshot(
        profile_id=profile.id,
        total_skills=len(student_skills_list),
        avg_proficiency=float(np_mean([s.get("level", 1.0) for s in student_skills_list])) if student_skills_list else 1.0,
        readiness_score=prediction["readiness_score"],
        cumulative_study_hours=profile.weekly_study_hours * 8.0
    )
    db.add(snapshot)

    # Audit log
    latency = round((time.time() - start_time) * 1000.0, 2)
    log = PredictionLog(
        user_id=current_user.id,
        model_version_id=prediction["model_version"],
        endpoint="/api/v1/analysis/readiness",
        input_payload_json={"target_career_id": target_career_id, "skills_count": len(student_skills_list)},
        output_result_json={"readiness_score": prediction["readiness_score"], "tier": prediction["readiness_tier"]},
        latency_ms=latency
    )
    db.add(log)
    db.commit()

    return ReadinessPredictResponse(
        target_career_id=target_career_id,
        career_title=career.title,
        readiness_score=prediction["readiness_score"],
        is_job_ready=prediction["is_job_ready"],
        readiness_tier=prediction["readiness_tier"],
        feature_contributions=prediction["feature_contributions"],
        model_version=prediction["model_version"],
        model_algorithm=prediction["model_algorithm"],
        ai_explanation=ai_narrative
    )


@router.post("/trajectory", response_model=TrajectoryForecastResponse)
def forecast_trajectory(
    payload: TrajectorySimulateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    target_career_id = payload.target_career_id or profile.target_career_id
    if not target_career_id:
        target_career_id = "CR001"

    student_skills_list = [{"skill_id": ss.skill_id, "level": ss.proficiency_level} for ss in profile.skills]
    
    # Get current readiness as baseline
    readiness_res = ml_service.predict_readiness(
        student_skills_list=student_skills_list,
        target_career_id=target_career_id,
        weekly_study_hours=payload.weekly_study_hours or profile.weekly_study_hours
    )
    initial_score = readiness_res["readiness_score"]

    forecast = ml_service.forecast_trajectory(
        current_readiness_score=initial_score,
        weekly_study_hours=payload.weekly_study_hours or profile.weekly_study_hours,
        learning_consistency=payload.learning_consistency or 1.0
    )

    return forecast


@router.get("/history")
def get_prediction_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        return []

    preds = db.query(ReadinessPrediction).filter(
        ReadinessPrediction.profile_id == profile.id
    ).order_by(ReadinessPrediction.created_at.desc()).limit(15).all()

    return [
        {
            "id": p.id,
            "career_id": p.career_id,
            "career_title": p.career.title if p.career else p.career_id,
            "readiness_score": p.readiness_score,
            "is_job_ready": p.is_job_ready,
            "readiness_tier": p.readiness_tier,
            "model_version_id": p.model_version_id,
            "created_at": p.created_at
        }
        for p in preds
    ]


def np_mean(vals):
    return sum(vals) / len(vals) if vals else 0.0
