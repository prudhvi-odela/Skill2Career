"""
Skill2Career Careers Router (MongoDB Async)
Exposes career roles catalog, skill requirements, and student-to-career ML matching recommendations.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db, get_utc_now, serialize_doc, serialize_docs
from backend.schemas.schemas import CareerRoleDetail, CareerSkillItem, CareerMatchItem
from backend.services.auth_service import get_current_user
from backend.ml.inference import MLInferenceService

router = APIRouter(prefix="/careers", tags=["Career Catalog & Matching"])
ml_service = MLInferenceService.get_instance()


@router.get("", response_model=List[CareerRoleDetail])
async def get_all_careers(domain: Optional[str] = None, db: AsyncDatabase = Depends(get_db)):
    query = {}
    if domain:
        query["domain"] = {"$regex": domain, "$options": "i"}

    cursor = db.career_roles.find(query)
    careers = await cursor.to_list(length=100)

    results = []
    for c in careers:
        req_list = [
            CareerSkillItem(
                skill_id=rs.get("skill_id", ""),
                skill_name=rs.get("skill_name", rs.get("skill_id", "")),
                category="General",
                required_level=float(rs.get("required_level", 3.0)),
                importance_weight=float(rs.get("importance_weight", 0.8))
            )
            for rs in c.get("required_skills", [])
        ]
        results.append(CareerRoleDetail(
            id=c.get("career_code", str(c["_id"])),
            title=c.get("title", ""),
            domain=c.get("domain", ""),
            description=c.get("description", ""),
            min_exp_years=float(c.get("market_metadata", {}).get("min_exp_years", 0.0)),
            avg_salary_usd=float(c.get("salary_information", {}).get("average_usd", 100000.0)),
            required_skills=req_list
        ))
    return results


@router.get("/skills/catalog")
async def get_skills_catalog(category: Optional[str] = None, db: AsyncDatabase = Depends(get_db)):
    query = {}
    if category:
        query["category"] = category

    cursor = db.skills.find(query).sort([("category", 1), ("name", 1)])
    skills = await cursor.to_list(length=200)
    return [
        {
            "id": s.get("skill_code", str(s["_id"])),
            "skill_code": s.get("skill_code"),
            "name": s.get("name"),
            "category": s.get("category"),
            "domain": s.get("domain"),
            "description": s.get("description")
        }
        for s in skills
    ]


@router.get("/matching/recommendations", response_model=List[CareerMatchItem])
async def get_career_recommendations(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = await db.student_profiles.find_one({"user_id": user_id})

    student_skills_list = []
    if profile:
        for ss in profile.get("skills", []):
            student_skills_list.append({
                "skill_id": ss.get("skill_id"),
                "skill_name": ss.get("name"),
                "level": float(ss.get("level", 1.0))
            })

    matches = ml_service.match_careers(student_skills_list)
    version_tag = ml_service.get_model_metadata().get("version_tag", "v1.0.0-production")
    now = get_utc_now()

    # Persist predictions in MongoDB
    await db.career_predictions.delete_many({"student_id": user_id})
    if matches:
        pred_docs = [
            {
                "student_id": user_id,
                "career_id": m["career_id"],
                "match_score": float(m["match_percentage"]),
                "skill_coverage_score": float(m["match_percentage"]),
                "rank": int(m["rank"]),
                "model_version": version_tag,
                "created_at": now
            }
            for m in matches[:5]
        ]
        await db.career_predictions.insert_many(pred_docs)

    return matches


@router.get("/{career_id}", response_model=CareerRoleDetail)
async def get_career_detail(career_id: str, db: AsyncDatabase = Depends(get_db)):
    career = await db.career_roles.find_one({
        "$or": [{"career_code": career_id}, {"_id": career_id}]
    })
    if not career:
        raise HTTPException(status_code=404, detail="Career role not found.")

    req_list = [
        CareerSkillItem(
            skill_id=rs.get("skill_id", ""),
            skill_name=rs.get("skill_name", rs.get("skill_id", "")),
            category="General",
            required_level=float(rs.get("required_level", 3.0)),
            importance_weight=float(rs.get("importance_weight", 0.8))
        )
        for rs in career.get("required_skills", [])
    ]

    return CareerRoleDetail(
        id=career.get("career_code", str(career["_id"])),
        title=career.get("title", ""),
        domain=career.get("domain", ""),
        description=career.get("description", ""),
        min_exp_years=float(career.get("market_metadata", {}).get("min_exp_years", 0.0)),
        avg_salary_usd=float(career.get("salary_information", {}).get("average_usd", 100000.0)),
        required_skills=req_list
    )
