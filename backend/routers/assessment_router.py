"""
Skill2Career Skill Assessment & Quiz Router (MongoDB Async)
Enables automated skill verification, interactive quizzes, proficiency elevation, and authoring in MongoDB.
"""

import uuid
from typing import List, Dict, Any, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db, get_utc_now, serialize_doc, serialize_docs
from backend.schemas.schemas import (
    AssessmentDetailResponse, QuestionItem, AssessmentSubmitRequest, AssessmentResultResponse,
    AssessmentCreate, AssessmentUpdate, QuestionCreate, QuestionUpdate
)
from backend.services.auth_service import get_current_user

router = APIRouter(prefix="/assessments", tags=["Skill Assessments & Quizzes"])


@router.get("", response_model=List[dict])
async def list_assessments(db: AsyncDatabase = Depends(get_db)):
    cursor = db.assessments.find({"is_active": True})
    assessments = await cursor.to_list(length=50)

    # Lookup skill names
    skills_cursor = db.skills.find({})
    skills_list = await skills_cursor.to_list(length=200)
    skills_map = {s["skill_code"]: s for s in skills_list}

    results = []
    for a in assessments:
        s_info = skills_map.get(a["skill_id"], {})
        results.append({
            "id": a.get("skill_id", str(a["_id"])),
            "skill_id": a["skill_id"],
            "skill_name": s_info.get("name", a["skill_id"]),
            "category": s_info.get("category", "General"),
            "title": a.get("title", ""),
            "difficulty": a.get("difficulty", "Intermediate"),
            "time_limit_mins": int(a.get("time_limit_minutes", 10)),
            "pass_score": float(a.get("pass_score", 70.0)),
            "total_questions": len(a.get("questions", [])),
            "is_active": a.get("is_active", True)
        })
    return results


@router.get("/{assessment_id}", response_model=AssessmentDetailResponse)
async def get_assessment_quiz(assessment_id: str, db: AsyncDatabase = Depends(get_db)):
    query = {"$or": [{"skill_id": assessment_id}, {"_id": assessment_id}]}
    if ObjectId.is_valid(assessment_id):
        query["$or"].append({"_id": ObjectId(assessment_id)})

    assessment = await db.assessments.find_one(query)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    skill_doc = await db.skills.find_one({"skill_code": assessment["skill_id"]})
    skill_name = skill_doc.get("name", assessment["skill_id"]) if skill_doc else assessment["skill_id"]

    questions = [
        QuestionItem(
            id=q.get("id", str(i)),
            question_text=q["question_text"],
            options=q.get("options_json", q.get("options", [])),
            explanation=q.get("explanation", "")
        )
        for i, q in enumerate(assessment.get("questions", []))
    ]

    return AssessmentDetailResponse(
        id=assessment.get("skill_id", str(assessment["_id"])),
        skill_id=assessment["skill_id"],
        skill_name=skill_name,
        title=assessment.get("title", ""),
        difficulty=assessment.get("difficulty", "Intermediate"),
        time_limit_mins=int(assessment.get("time_limit_minutes", 10)),
        pass_score=float(assessment.get("pass_score", 70.0)),
        total_questions=len(questions),
        is_active=assessment.get("is_active", True),
        questions=questions
    )


@router.post("/submit", response_model=AssessmentResultResponse)
async def submit_assessment(
    payload: AssessmentSubmitRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    query = {"$or": [{"skill_id": payload.assessment_id}, {"_id": payload.assessment_id}]}
    if ObjectId.is_valid(payload.assessment_id):
        query["$or"].append({"_id": ObjectId(payload.assessment_id)})

    assessment = await db.assessments.find_one(query)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    questions = assessment.get("questions", [])
    if not questions:
        raise HTTPException(status_code=400, detail="Assessment contains no questions.")

    correct_count = 0
    for q in questions:
        q_id = q.get("id")
        selected_idx = payload.answers.get(q_id)
        if selected_idx is not None and int(selected_idx) == int(q["correct_option_index"]):
            correct_count += 1

    score_pct = round((correct_count / len(questions)) * 100.0, 1)
    pass_score = float(assessment.get("pass_score", 70.0))
    passed = score_pct >= pass_score
    proficiency_awarded = 4.0 if score_pct >= 90 else (3.5 if passed else 2.5)

    now = get_utc_now()

    # Persist assessment result in MongoDB
    result_doc = {
        "student_id": user_id,
        "assessment_id": assessment.get("skill_id", str(assessment["_id"])),
        "skill_id": assessment["skill_id"],
        "score": score_pct,
        "passed": passed,
        "answers": payload.answers,
        "completed_at": now
    }
    await db.assessment_results.insert_one(result_doc)

    skill_doc = await db.skills.find_one({"skill_code": assessment["skill_id"]})
    skill_name = skill_doc.get("name", assessment["skill_id"]) if skill_doc else assessment["skill_id"]

    # If passed, upgrade and verify skill in student_profiles
    if passed:
        skills_list = profile.get("skills", [])
        existing_idx = next((i for i, s in enumerate(skills_list) if s.get("skill_id") == assessment["skill_id"]), None)

        skill_item = {
            "skill_id": assessment["skill_id"],
            "name": skill_name,
            "category": skill_doc.get("category", "General") if skill_doc else "General",
            "domain": skill_doc.get("domain", "General") if skill_doc else "General",
            "level": max(skills_list[existing_idx].get("level", 1.0), proficiency_awarded) if existing_idx is not None else proficiency_awarded,
            "verified": True,
            "verification_source": f"Passed {assessment.get('title')} ({score_pct}%)",
            "years_experience": skills_list[existing_idx].get("years_experience", 1.0) if existing_idx is not None else 1.0,
            "last_assessed_at": now
        }

        if existing_idx is not None:
            skills_list[existing_idx] = skill_item
        else:
            skills_list.append(skill_item)

        await db.student_profiles.update_one(
            {"user_id": user_id},
            {
                "$set": {"skills": skills_list, "updated_at": now},
                "$inc": {"statistics.assessments_passed": 1}
            }
        )

        # Log learning activity
        act_doc = {
            "student_id": user_id,
            "activity_type": "quiz",
            "title": f"Completed {assessment.get('title')} with {score_pct}% score",
            "description": f"Verified proficiency in {skill_name} at Level {proficiency_awarded}/5.0",
            "skills": [assessment["skill_id"]],
            "hours_spent": round(float(assessment.get("time_limit_minutes", 10)) / 60.0, 2),
            "completion_percentage": 100.0,
            "completed_at": now,
            "created_at": now
        }
        await db.learning_activities.insert_one(act_doc)

    explanation = (
        f"Congratulations! You scored {score_pct}% and verified your proficiency in {skill_name} at Level {proficiency_awarded}/5.0."
        if passed else
        f"You scored {score_pct}% (Pass threshold: {pass_score}%). Review the recommended learning resources and retake the quiz when ready."
    )

    return AssessmentResultResponse(
        assessment_id=assessment.get("skill_id", str(assessment["_id"])),
        score_pct=score_pct,
        passed=passed,
        pass_score=pass_score,
        proficiency_awarded=proficiency_awarded,
        skill_id=assessment["skill_id"],
        skill_name=skill_name,
        correct_count=correct_count,
        total_questions=len(questions),
        explanation=explanation
    )


# ==================== Assessment Authoring API ====================
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_assessment(
    payload: AssessmentCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Creates a new skill assessment in the catalog."""
    # Validate skill exists
    skill_doc = await db.skills.find_one({"skill_code": payload.skill_id})
    if not skill_doc:
        raise HTTPException(status_code=400, detail=f"Skill '{payload.skill_id}' does not exist in canonical taxonomy.")

    now = get_utc_now()
    formatted_questions = [
        {
            "id": f"Q_{payload.skill_id}_{uuid.uuid4().hex[:6]}",
            "question_text": q.question_text,
            "options_json": q.options,
            "correct_option_index": q.get_correct_option(),
            "explanation": q.explanation or ""
        }
        for q in payload.questions
    ]

    doc = {
        "skill_id": payload.skill_id,
        "title": payload.title,
        "difficulty": payload.difficulty,
        "time_limit_minutes": payload.get_time_limit(),
        "pass_score": payload.pass_score,
        "is_active": payload.is_active,
        "questions": formatted_questions,
        "created_by": current_user.get("id", str(current_user.get("_id", ""))),
        "updated_at": now
    }

    res = await db.assessments.update_one(
        {"skill_id": payload.skill_id},
        {"$set": doc, "$setOnInsert": {"created_at": now}},
        upsert=True
    )

    return {
        "status": "success",
        "id": payload.skill_id,
        "title": payload.title,
        "message": f"Assessment for '{payload.skill_id}' successfully created/updated.",
        "skill_id": payload.skill_id,
        "total_questions": len(formatted_questions)
    }


@router.put("/{assessment_id}")
async def update_assessment_metadata(
    assessment_id: str,
    payload: AssessmentUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    query = {"$or": [{"skill_id": assessment_id}, {"_id": assessment_id}]}
    if ObjectId.is_valid(assessment_id):
        query["$or"].append({"_id": ObjectId(assessment_id)})

    assessment = await db.assessments.find_one(query)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    update_fields = {"updated_at": get_utc_now()}
    if payload.title is not None:
        update_fields["title"] = payload.title
    if payload.difficulty is not None:
        update_fields["difficulty"] = payload.difficulty
    if payload.time_limit_minutes is not None:
        update_fields["time_limit_minutes"] = payload.time_limit_minutes
    if payload.pass_score is not None:
        update_fields["pass_score"] = payload.pass_score
    if payload.is_active is not None:
        update_fields["is_active"] = payload.is_active

    await db.assessments.update_one({"_id": assessment["_id"]}, {"$set": update_fields})
    return {"status": "success", "message": "Assessment updated."}


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    query = {"$or": [{"skill_id": assessment_id}, {"_id": assessment_id}]}
    if ObjectId.is_valid(assessment_id):
        query["$or"].append({"_id": ObjectId(assessment_id)})

    del_res = await db.assessments.delete_one(query)
    if del_res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Assessment not found.")


@router.post("/{assessment_id}/questions", status_code=status.HTTP_201_CREATED)
async def add_assessment_question(
    assessment_id: str,
    payload: QuestionCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    query = {"$or": [{"skill_id": assessment_id}, {"_id": assessment_id}]}
    if ObjectId.is_valid(assessment_id):
        query["$or"].append({"_id": ObjectId(assessment_id)})

    assessment = await db.assessments.find_one(query)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    q_id = f"Q_{assessment.get('skill_id', 'GEN')}_{uuid.uuid4().hex[:6]}"
    new_q = {
        "id": q_id,
        "question_text": payload.question_text,
        "options_json": payload.options,
        "correct_option_index": payload.correct_option_index,
        "explanation": payload.explanation or ""
    }

    await db.assessments.update_one(
        {"_id": assessment["_id"]},
        {
            "$push": {"questions": new_q},
            "$set": {"updated_at": get_utc_now()}
        }
    )
    return {"status": "success", "question_id": q_id, "question": new_q}


@router.delete("/{assessment_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment_question(
    assessment_id: str,
    question_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    query = {"$or": [{"skill_id": assessment_id}, {"_id": assessment_id}]}
    if ObjectId.is_valid(assessment_id):
        query["$or"].append({"_id": ObjectId(assessment_id)})

    assessment = await db.assessments.find_one(query)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    await db.assessments.update_one(
        {"_id": assessment["_id"]},
        {
            "$pull": {"questions": {"id": question_id}},
            "$set": {"updated_at": get_utc_now()}
        }
    )
