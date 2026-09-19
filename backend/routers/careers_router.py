"""
Skill2Career Careers Router
Exposes career roles catalog, skill requirements, and student-to-career ML matching recommendations.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database.session import get_db
from backend.models.models import CareerRole, Skill, CareerSkill, StudentProfile, StudentSkill, CareerPrediction
from backend.schemas.schemas import CareerRoleDetail, CareerSkillItem, CareerMatchItem
from backend.services.auth_service import get_current_user
from backend.ml.inference import MLInferenceService

router = APIRouter(prefix="/careers", tags=["Career Catalog & Matching"])
ml_service = MLInferenceService.get_instance()


@router.get("", response_model=List[CareerRoleDetail])
def get_all_careers(domain: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CareerRole)
    if domain:
        query = query.filter(CareerRole.domain.ilike(f"%{domain}%"))
    careers = query.all()

    results = []
    for c in careers:
        req_list = []
        for cs in c.required_skills:
            req_list.append(CareerSkillItem(
                skill_id=cs.skill_id,
                skill_name=cs.skill.name if cs.skill else cs.skill_id,
                category=cs.skill.category if cs.skill else "General",
                required_level=cs.required_level,
                importance_weight=cs.importance_weight
            ))
        results.append(CareerRoleDetail(
            id=c.id,
            title=c.title,
            domain=c.domain,
            description=c.description,
            min_exp_years=c.min_exp_years,
            avg_salary_usd=c.avg_salary_usd,
            required_skills=req_list
        ))
    return results


@router.get("/skills/catalog")
def get_skills_catalog(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Skill)
    if category:
        query = query.filter(Skill.category == category)
    skills = query.order_by(Skill.category, Skill.name).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "domain": s.domain,
            "description": s.description
        }
        for s in skills
    ]


@router.get("/matching/recommendations", response_model=List[CareerMatchItem])
def get_career_recommendations(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    student_skills_list = []
    if profile:
        for ss in profile.skills:
            student_skills_list.append({
                "skill_id": ss.skill_id,
                "skill_name": ss.skill.name if ss.skill else ss.skill_id,
                "level": ss.proficiency_level
            })

    matches = ml_service.match_careers(student_skills_list)
    version_tag = ml_service.get_model_metadata().get("version_tag", "v1.0.0-production")

    # Persist top career predictions in database
    if profile:
        db.query(CareerPrediction).filter(CareerPrediction.profile_id == profile.id).delete()
        for m in matches[:5]:
            pred = CareerPrediction(
                profile_id=profile.id,
                career_id=m["career_id"],
                match_score=m["match_percentage"],
                rank=m["rank"],
                model_version_id=version_tag
            )
            db.add(pred)
        db.commit()

    return matches


@router.get("/{career_id}", response_model=CareerRoleDetail)
def get_career_detail(career_id: str, db: Session = Depends(get_db)):
    career = db.query(CareerRole).filter(CareerRole.id == career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career role not found.")

    req_list = []
    for cs in career.required_skills:
        req_list.append(CareerSkillItem(
            skill_id=cs.skill_id,
            skill_name=cs.skill.name if cs.skill else cs.skill_id,
            category=cs.skill.category if cs.skill else "General",
            required_level=cs.required_level,
            importance_weight=cs.importance_weight
        ))

    return CareerRoleDetail(
        id=career.id,
        title=career.title,
        domain=career.domain,
        description=career.description,
        min_exp_years=career.min_exp_years,
        avg_salary_usd=career.avg_salary_usd,
        required_skills=req_list
    )
