"""
Skill2Career Analysis & ML Inference Router (MongoDB Async)
Exposes endpoints for:
- Granular Skill Gap Analysis
- Real-time Supervised Job Readiness Prediction
- Longitudinal Trajectory & Future Readiness Forecasting
- Prediction History Audit
"""

import time
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db, get_utc_now, serialize_doc, serialize_docs
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
async def compute_skill_gap(
    target_career_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    chosen_career_id = target_career_id or profile.get("target_career_id")
    if not chosen_career_id:
        raise HTTPException(status_code=400, detail="Please specify a target career or set one in your profile.")

    student_skills_list = [
        {"skill_id": ss.get("skill_id"), "level": float(ss.get("level", 1.0))}
        for ss in profile.get("skills", [])
    ]

    gap_data = ml_service.analyze_skill_gap(student_skills_list, chosen_career_id)
    now = get_utc_now()
    version_tag = ml_service.get_model_metadata().get("version_tag", "v1.0.0-production")

    # Persist calculated skill gaps in MongoDB
    await db.skill_gaps.delete_many({"student_id": user_id, "career_id": chosen_career_id})
    if gap_data.get("gaps"):
        gap_docs = [
            {
                "student_id": user_id,
                "career_id": chosen_career_id,
                "skill_id": g["skill_id"],
                "skill_name": g["skill_name"],
                "current_level": float(g["current_level"]),
                "required_level": float(g["required_level"]),
                "gap_level": float(g["gap"]),
                "importance_weight": float(g["importance"]),
                "priority": g["priority"],
                "calculated_at": now,
                "model_version": version_tag
            }
            for g in gap_data["gaps"]
        ]
        await db.skill_gaps.insert_many(gap_docs)

    return gap_data


@router.post("/readiness", response_model=ReadinessPredictResponse)
async def predict_job_readiness(
    payload: ReadinessPredictRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    start_time = time.time()
    user_id = current_user["id"]
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    target_career_id = payload.target_career_id or profile.get("target_career_id")
    if not target_career_id:
        target_career_id = "CR001"

    career = await db.career_roles.find_one({
        "$or": [{"career_code": target_career_id}, {"_id": target_career_id}]
    })
    career_title = career.get("title", target_career_id) if career else target_career_id

    # Student skills
    if payload.custom_skills is not None:
        student_skills_list = payload.custom_skills
    else:
        student_skills_list = [
            {"skill_id": ss.get("skill_id"), "level": float(ss.get("level", 1.0))}
            for ss in profile.get("skills", [])
        ]

    # Metrics from profile & collections
    projects_count = await db.projects.count_documents({"student_id": user_id})
    certs_count = await db.certifications.count_documents({"student_id": user_id})

    # Assessments passed pct
    total_asms = await db.assessment_results.count_documents({"student_id": user_id})
    passed_asms = await db.assessment_results.count_documents({"student_id": user_id, "passed": True})
    asms_pct = round((passed_asms / total_asms) * 100.0, 1) if total_asms > 0 else 60.0

    stats = profile.get("statistics", {})
    weekly_hours = float(stats.get("weekly_study_hours", 12.0))
    learning_velocity = float(stats.get("learning_velocity_index", 1.0))

    prediction = ml_service.predict_readiness(
        student_skills_list=student_skills_list,
        target_career_id=target_career_id,
        degree=profile.get("degree", "B.Tech Computer Science"),
        institution_tier=int(profile.get("institution_tier", 2)),
        gpa=float(profile.get("gpa", 8.0)),
        projects_count=projects_count,
        avg_project_complexity=3.5,
        certifications_count=certs_count,
        assessments_passed_pct=asms_pct,
        weekly_study_hours=weekly_hours,
        learning_velocity_index=learning_velocity
    )

    # Skill Gap analysis for AI explanation
    gap_result = ml_service.analyze_skill_gap(student_skills_list, target_career_id)
    critical_gaps = [g for g in gap_result["gaps"] if g["priority"] in ["Critical", "High"]]
    proficient_skills = [g["skill_name"] for g in gap_result["gaps"] if g["status"] == "Proficient"]

    # AI narrative explanation
    ai_narrative = ai_service.explain_readiness_and_gaps(
        student_name=current_user.get("full_name", "Student"),
        career_title=career_title,
        readiness_score=prediction["readiness_score"],
        critical_gaps=critical_gaps,
        proficient_skills=proficient_skills,
        weekly_study_hours=weekly_hours
    )

    now = get_utc_now()

    # Persist prediction in MongoDB
    pred_doc = {
        "student_id": user_id,
        "career_id": target_career_id,
        "career_title": career_title,
        "prediction_type": "current_job_readiness",
        "horizon_weeks": 0,
        "readiness_score": prediction["readiness_score"],
        "is_job_ready": prediction["is_job_ready"],
        "readiness_tier": prediction["readiness_tier"],
        "feature_breakdown": prediction["feature_contributions"],
        "model_version": prediction["model_version"],
        "created_at": now
    }
    await db.readiness_predictions.insert_one(pred_doc)

    # Record learning snapshot
    snapshot_doc = {
        "student_id": user_id,
        "snapshot_date": now,
        "skill_count": len(student_skills_list),
        "average_proficiency": float(sum([s.get("level", 1.0) for s in student_skills_list]) / len(student_skills_list)) if student_skills_list else 1.0,
        "readiness_score": prediction["readiness_score"],
        "target_career_id": target_career_id,
        "learning_hours": weekly_hours * 8.0,
        "learning_velocity": learning_velocity,
        "model_version": prediction["model_version"],
        "created_at": now
    }
    await db.learning_snapshots.insert_one(snapshot_doc)

    # Audit log
    latency = round((time.time() - start_time) * 1000.0, 2)
    log_doc = {
        "student_id": user_id,
        "model_version_id": prediction["model_version"],
        "prediction_type": "current_job_readiness",
        "input_features": {"target_career_id": target_career_id, "skills_count": len(student_skills_list)},
        "output": {"readiness_score": prediction["readiness_score"], "tier": prediction["readiness_tier"]},
        "latency_ms": latency,
        "created_at": now
    }
    await db.prediction_logs.insert_one(log_doc)

    return ReadinessPredictResponse(
        target_career_id=target_career_id,
        career_title=career_title,
        readiness_score=prediction["readiness_score"],
        is_job_ready=prediction["is_job_ready"],
        readiness_tier=prediction["readiness_tier"],
        feature_contributions=prediction["feature_contributions"],
        model_version=prediction["model_version"],
        model_algorithm=prediction["model_algorithm"],
        ai_explanation=ai_narrative
    )


@router.post("/trajectory", response_model=TrajectoryForecastResponse)
async def forecast_trajectory(
    payload: TrajectorySimulateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    target_career_id = payload.target_career_id or profile.get("target_career_id") or "CR001"
    student_skills_list = [
        {"skill_id": ss.get("skill_id"), "level": float(ss.get("level", 1.0))}
        for ss in profile.get("skills", [])
    ]

    stats = profile.get("statistics", {})
    weekly_hours = payload.weekly_study_hours or float(stats.get("weekly_study_hours", 12.0))

    readiness_res = ml_service.predict_readiness(
        student_skills_list=student_skills_list,
        target_career_id=target_career_id,
        weekly_study_hours=weekly_hours
    )
    initial_score = readiness_res["readiness_score"]

    forecast = ml_service.forecast_trajectory(
        current_readiness_score=initial_score,
        weekly_study_hours=weekly_hours,
        learning_consistency=payload.learning_consistency or 1.0
    )

    return forecast


@router.get("/history")
async def get_prediction_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    cursor = db.readiness_predictions.find({"student_id": user_id}).sort("created_at", -1).limit(15)
    preds = await cursor.to_list(length=15)
    return [
        {
            "id": str(p["_id"]),
            "career_id": p.get("career_id"),
            "career_title": p.get("career_title", p.get("career_id")),
            "readiness_score": p.get("readiness_score"),
            "is_job_ready": p.get("is_job_ready", False),
            "readiness_tier": p.get("readiness_tier"),
            "model_version_id": p.get("model_version"),
            "created_at": p.get("created_at")
        }
        for p in preds
    ]
