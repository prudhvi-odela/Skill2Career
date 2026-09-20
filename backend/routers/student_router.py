"""
Skill2Career Student Router (MongoDB Async)
Manages student profiles, embedded skill state, projects, certifications, and learning activities.
"""

from typing import List, Dict, Any
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db, get_utc_now, serialize_doc, serialize_docs
from backend.schemas.schemas import (
    ProfileUpdate, ProfileResponse, StudentSkillCreate, StudentSkillResponse,
    ProjectCreate, ProjectResponse, CertificationCreate, CertificationResponse
)
from backend.services.auth_service import get_current_user

router = APIRouter(prefix="/student", tags=["Student Management"])


async def get_or_create_profile(user_id: str, db: AsyncDatabase) -> Dict[str, Any]:
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        now = get_utc_now()
        profile_doc = {
            "user_id": user_id,
            "headline": "",
            "bio": "",
            "degree": None,
            "institution": None,
            "institution_tier": None,
            "graduation_year": None,
            "gpa": None,
            "target_career_id": None,
            "target_career_title": None,
            "skills": [],
            "statistics": {
                "weekly_study_hours": 0.0,
                "learning_velocity_index": 0.0,
                "assessments_passed": 0,
                "projects_count": 0,
                "certifications_count": 0
            },
            "created_at": now,
            "updated_at": now
        }
        res = await db.student_profiles.insert_one(profile_doc)
        profile = await db.student_profiles.find_one({"_id": res.inserted_id})
    return profile


# ==================== Profile ====================
@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = await get_or_create_profile(user_id, db)

    # Count projects and certifications
    projects_count = await db.projects.count_documents({"student_id": user_id})
    certs_count = await db.certifications.count_documents({"student_id": user_id})

    # Format embedded skills
    skills_response = []
    for ss in profile.get("skills", []):
        skills_response.append(StudentSkillResponse(
            id=ss.get("skill_id", ""),
            skill_id=ss.get("skill_id", ""),
            skill_name=ss.get("name", ss.get("skill_id", "")),
            category=ss.get("category", "General"),
            domain=ss.get("domain", "General"),
            proficiency_level=float(ss.get("level", ss.get("proficiency_level", 1.0))),
            years_experience=float(ss.get("years_experience", 0.5)),
            is_verified=bool(ss.get("verified", ss.get("is_verified", False))),
            verification_source=ss.get("verification_source", "Self-Reported"),
            updated_at=ss.get("last_assessed_at") or profile.get("updated_at")
        ))

    stats = profile.get("statistics", {})
    return ProfileResponse(
        id=str(profile["_id"]),
        user_id=user_id,
        full_name=current_user.get("full_name", ""),
        email=current_user.get("email", ""),
        headline=profile.get("headline"),
        bio=profile.get("bio"),
        degree=profile.get("degree"),
        institution=profile.get("institution"),
        institution_tier=int(profile["institution_tier"]) if profile.get("institution_tier") is not None else None,
        graduation_year=int(profile["graduation_year"]) if profile.get("graduation_year") is not None else None,
        gpa=float(profile["gpa"]) if profile.get("gpa") is not None else None,
        target_career_id=profile.get("target_career_id"),
        target_career_title=profile.get("target_career_title"),
        weekly_study_hours=float(stats.get("weekly_study_hours", 0.0)),
        learning_velocity_index=float(stats.get("learning_velocity_index", 0.0)),
        skills=skills_response,
        projects_count=projects_count,
        certifications_count=certs_count,
        created_at=profile.get("created_at")
    )


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = await get_or_create_profile(user_id, db)

    update_fields: Dict[str, Any] = {"updated_at": get_utc_now()}
    if payload.headline is not None:
        update_fields["headline"] = payload.headline
    if payload.bio is not None:
        update_fields["bio"] = payload.bio
    if payload.degree is not None:
        update_fields["degree"] = payload.degree
    if payload.institution is not None:
        update_fields["institution"] = payload.institution
    if payload.institution_tier is not None:
        update_fields["institution_tier"] = payload.institution_tier
    if payload.graduation_year is not None:
        update_fields["graduation_year"] = payload.graduation_year
    if payload.gpa is not None:
        update_fields["gpa"] = payload.gpa
    if payload.target_career_id is not None:
        career = await db.career_roles.find_one({"career_code": payload.target_career_id})
        if not career:
            raise HTTPException(status_code=400, detail="Specified target career does not exist.")
        update_fields["target_career_id"] = payload.target_career_id
        update_fields["target_career_title"] = career.get("title", "")
    if payload.weekly_study_hours is not None:
        update_fields["statistics.weekly_study_hours"] = payload.weekly_study_hours

    await db.student_profiles.update_one({"user_id": user_id}, {"$set": update_fields})
    return await get_profile(current_user, db)


# ==================== Skills ====================
@router.get("/skills", response_model=List[StudentSkillResponse])
async def get_student_skills(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = await get_or_create_profile(user_id, db)
    results = []
    for ss in profile.get("skills", []):
        results.append(StudentSkillResponse(
            id=ss.get("skill_id", ""),
            skill_id=ss.get("skill_id", ""),
            skill_name=ss.get("name", ss.get("skill_id", "")),
            category=ss.get("category", "General"),
            domain=ss.get("domain", "General"),
            proficiency_level=float(ss.get("level", ss.get("proficiency_level", 1.0))),
            years_experience=float(ss.get("years_experience", 0.5)),
            is_verified=bool(ss.get("verified", ss.get("is_verified", False))),
            verification_source=ss.get("verification_source", "Self-Reported"),
            updated_at=ss.get("last_assessed_at") or profile.get("updated_at")
        ))
    return results


@router.post("/skills", response_model=StudentSkillResponse, status_code=status.HTTP_201_CREATED)
async def add_or_update_student_skill(
    payload: StudentSkillCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = await get_or_create_profile(user_id, db)

    # Validate skill against taxonomy
    skill_doc = await db.skills.find_one({"skill_code": payload.skill_id})
    if not skill_doc:
        raise HTTPException(status_code=404, detail=f"Skill '{payload.skill_id}' not found in canonical taxonomy.")

    now = get_utc_now()
    skills_list = profile.get("skills", [])
    existing_idx = next((i for i, s in enumerate(skills_list) if s.get("skill_id") == payload.skill_id), None)

    skill_item = {
        "skill_id": payload.skill_id,
        "name": skill_doc.get("name", payload.skill_id),
        "category": skill_doc.get("category", "General"),
        "domain": skill_doc.get("domain", "General"),
        "level": float(payload.proficiency_level),
        "verified": False if existing_idx is None else skills_list[existing_idx].get("verified", False),
        "verification_source": "Self-Reported" if existing_idx is None else skills_list[existing_idx].get("verification_source", "Self-Reported"),
        "years_experience": float(payload.years_experience) if payload.years_experience is not None else 0.5,
        "last_assessed_at": now
    }

    if existing_idx is not None:
        skills_list[existing_idx] = skill_item
    else:
        skills_list.append(skill_item)

    await db.student_profiles.update_one(
        {"user_id": user_id},
        {"$set": {"skills": skills_list, "updated_at": now}}
    )

    return StudentSkillResponse(
        id=skill_item["skill_id"],
        skill_id=skill_item["skill_id"],
        skill_name=skill_item["name"],
        category=skill_item["category"],
        domain=skill_item["domain"],
        proficiency_level=skill_item["level"],
        years_experience=skill_item["years_experience"],
        is_verified=skill_item["verified"],
        verification_source=skill_item["verification_source"],
        updated_at=now
    )


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student_skill(
    skill_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    await db.student_profiles.update_one(
        {"user_id": user_id},
        {"$pull": {"skills": {"skill_id": skill_id}}, "$set": {"updated_at": get_utc_now()}}
    )


# ==================== Projects ====================
@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    cursor = db.projects.find({"student_id": user_id}).sort("created_at", -1)
    projects = await cursor.to_list(length=100)
    return [
        ProjectResponse(
            id=str(p["_id"]),
            profile_id=p["student_id"],
            title=p["title"],
            description=p["description"],
            repo_url=p.get("repository_url"),
            live_url=p.get("live_url"),
            tech_stack=p.get("technologies", ""),
            complexity_rating=float(p.get("complexity_rating", 3.0)),
            created_at=p.get("created_at")
        )
        for p in projects
    ]


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    now = get_utc_now()
    doc = {
        "student_id": user_id,
        "title": payload.title,
        "description": payload.description,
        "repository_url": payload.repo_url,
        "live_url": payload.live_url,
        "technologies": payload.tech_stack,
        "complexity_rating": float(payload.complexity_rating),
        "created_at": now,
        "updated_at": now
    }
    res = await db.projects.insert_one(doc)

    # Update profile stats
    await db.student_profiles.update_one(
        {"user_id": user_id},
        {"$inc": {"statistics.projects_count": 1}}
    )

    return ProjectResponse(
        id=str(res.inserted_id),
        profile_id=user_id,
        title=payload.title,
        description=payload.description,
        repo_url=payload.repo_url,
        live_url=payload.live_url,
        tech_stack=payload.tech_stack,
        complexity_rating=payload.complexity_rating,
        created_at=now
    )


# ==================== Certifications ====================
@router.get("/certifications", response_model=List[CertificationResponse])
async def get_certifications(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    cursor = db.certifications.find({"student_id": user_id}).sort("created_at", -1)
    certs = await cursor.to_list(length=100)
    return [
        CertificationResponse(
            id=str(c["_id"]),
            profile_id=c["student_id"],
            name=c["name"],
            issuer=c["issuer"],
            issue_date=c.get("issue_date"),
            credential_url=c.get("credential_url"),
            is_verified=bool(c.get("is_verified", True)),
            created_at=c.get("created_at")
        )
        for c in certs
    ]


@router.post("/certifications", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED)
async def create_certification(
    payload: CertificationCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    now = get_utc_now()
    doc = {
        "student_id": user_id,
        "name": payload.name,
        "issuer": payload.issuer,
        "issue_date": payload.issue_date,
        "credential_url": payload.credential_url,
        "is_verified": True,
        "created_at": now
    }
    res = await db.certifications.insert_one(doc)

    await db.student_profiles.update_one(
        {"user_id": user_id},
        {"$inc": {"statistics.certifications_count": 1}}
    )

    return CertificationResponse(
        id=str(res.inserted_id),
        profile_id=user_id,
        name=payload.name,
        issuer=payload.issuer,
        issue_date=payload.issue_date,
        credential_url=payload.credential_url,
        is_verified=True,
        created_at=now
    )


# ==================== Activities ====================
@router.get("/activities")
async def get_activities(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    cursor = db.learning_activities.find({"student_id": user_id}).sort("completed_at", -1).limit(20)
    acts = await cursor.to_list(length=20)
    return serialize_docs(acts)
