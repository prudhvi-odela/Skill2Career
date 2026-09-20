"""
Skill2Career Student Router (MongoDB Async)
Manages student profiles, embedded skill state, projects, certifications, work experiences, and learning activities.
"""

from typing import List, Dict, Any, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db, get_utc_now, serialize_doc, serialize_docs
from backend.schemas.schemas import (
    ProfileUpdate, ProfileResponse, StudentSkillCreate, StudentSkillResponse,
    ProjectCreate, ProjectUpdate, ProjectResponse,
    CertificationCreate, CertificationUpdate, CertificationResponse,
    WorkExperienceCreate, WorkExperienceUpdate, WorkExperienceResponse
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
            "major_or_branch": None,
            "academic_year": None,
            "institution": None,
            "institution_tier": None,
            "graduation_year": None,
            "gpa": None,
            "target_career_id": None,
            "target_career_title": None,
            "skills": [],
            "interests": [],
            "statistics": {
                "weekly_study_hours": 0.0,
                "learning_velocity_index": 0.0,
                "assessments_passed": 0,
                "projects_count": 0,
                "certifications_count": 0,
                "experiences_count": 0
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

    # Count projects, certifications, and work experiences
    projects_count = await db.projects.count_documents({"student_id": user_id})
    certs_count = await db.certifications.count_documents({"student_id": user_id})
    experiences_count = await db.work_experiences.count_documents({"student_id": user_id})

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
        major_or_branch=profile.get("major_or_branch"),
        academic_year=profile.get("academic_year"),
        institution=profile.get("institution"),
        institution_tier=int(profile["institution_tier"]) if profile.get("institution_tier") is not None else None,
        graduation_year=int(profile["graduation_year"]) if profile.get("graduation_year") is not None else None,
        gpa=float(profile["gpa"]) if profile.get("gpa") is not None else None,
        target_career_id=profile.get("target_career_id"),
        target_career_title=profile.get("target_career_title"),
        weekly_study_hours=float(stats.get("weekly_study_hours", 0.0)),
        learning_velocity_index=float(stats.get("learning_velocity_index", 0.0)),
        skills=skills_response,
        interests=profile.get("interests", []),
        projects_count=projects_count,
        certifications_count=certs_count,
        experiences_count=experiences_count,
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
    if payload.major_or_branch is not None:
        update_fields["major_or_branch"] = payload.major_or_branch
    if payload.academic_year is not None:
        update_fields["academic_year"] = payload.academic_year
    if payload.institution is not None:
        update_fields["institution"] = payload.institution
    if payload.institution_tier is not None:
        update_fields["institution_tier"] = payload.institution_tier
    if payload.graduation_year is not None:
        update_fields["graduation_year"] = payload.graduation_year
    if payload.gpa is not None:
        update_fields["gpa"] = payload.gpa
    if payload.target_career_id is not None:
        if payload.target_career_id == "":
            update_fields["target_career_id"] = None
            update_fields["target_career_title"] = None
        else:
            career = await db.career_roles.find_one({
                "$or": [{"career_code": payload.target_career_id}, {"_id": payload.target_career_id}]
            })
            if not career:
                raise HTTPException(status_code=400, detail="Specified target career does not exist.")
            update_fields["target_career_id"] = payload.target_career_id
            update_fields["target_career_title"] = career.get("title", "")
    if payload.weekly_study_hours is not None:
        update_fields["statistics.weekly_study_hours"] = payload.weekly_study_hours
    if payload.interests is not None:
        update_fields["interests"] = payload.interests

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
            created_at=p.get("created_at"),
            updated_at=p.get("updated_at")
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
        created_at=now,
        updated_at=now
    )


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    payload: ProjectUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    query = {"student_id": user_id}
    if ObjectId.is_valid(project_id):
        query["_id"] = ObjectId(project_id)
    else:
        query["_id"] = project_id

    project = await db.projects.find_one(query)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized.")

    now = get_utc_now()
    update_data = {"updated_at": now}
    if payload.title is not None:
        update_data["title"] = payload.title
    if payload.description is not None:
        update_data["description"] = payload.description
    if payload.repo_url is not None:
        update_data["repository_url"] = payload.repo_url
    if payload.live_url is not None:
        update_data["live_url"] = payload.live_url
    if payload.tech_stack is not None:
        update_data["technologies"] = payload.tech_stack
    if payload.complexity_rating is not None:
        update_data["complexity_rating"] = float(payload.complexity_rating)

    await db.projects.update_one({"_id": project["_id"]}, {"$set": update_data})
    updated_doc = await db.projects.find_one({"_id": project["_id"]})

    return ProjectResponse(
        id=str(updated_doc["_id"]),
        profile_id=user_id,
        title=updated_doc["title"],
        description=updated_doc["description"],
        repo_url=updated_doc.get("repository_url"),
        live_url=updated_doc.get("live_url"),
        tech_stack=updated_doc.get("technologies", ""),
        complexity_rating=float(updated_doc.get("complexity_rating", 3.0)),
        created_at=updated_doc.get("created_at"),
        updated_at=updated_doc.get("updated_at")
    )


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    query = {"student_id": user_id}
    if ObjectId.is_valid(project_id):
        query["_id"] = ObjectId(project_id)
    else:
        query["_id"] = project_id

    del_res = await db.projects.delete_one(query)
    if del_res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized.")

    await db.student_profiles.update_one(
        {"user_id": user_id},
        {"$inc": {"statistics.projects_count": -1}}
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
            created_at=c.get("created_at"),
            updated_at=c.get("updated_at")
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
        "created_at": now,
        "updated_at": now
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
        created_at=now,
        updated_at=now
    )


@router.put("/certifications/{certification_id}", response_model=CertificationResponse)
async def update_certification(
    certification_id: str,
    payload: CertificationUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    query = {"student_id": user_id}
    if ObjectId.is_valid(certification_id):
        query["_id"] = ObjectId(certification_id)
    else:
        query["_id"] = certification_id

    cert = await db.certifications.find_one(query)
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found or unauthorized.")

    now = get_utc_now()
    update_data = {"updated_at": now}
    if payload.name is not None:
        update_data["name"] = payload.name
    if payload.issuer is not None:
        update_data["issuer"] = payload.issuer
    if payload.issue_date is not None:
        update_data["issue_date"] = payload.issue_date
    if payload.credential_url is not None:
        update_data["credential_url"] = payload.credential_url

    await db.certifications.update_one({"_id": cert["_id"]}, {"$set": update_data})
    updated_doc = await db.certifications.find_one({"_id": cert["_id"]})

    return CertificationResponse(
        id=str(updated_doc["_id"]),
        profile_id=user_id,
        name=updated_doc["name"],
        issuer=updated_doc["issuer"],
        issue_date=updated_doc.get("issue_date"),
        credential_url=updated_doc.get("credential_url"),
        is_verified=bool(updated_doc.get("is_verified", True)),
        created_at=updated_doc.get("created_at"),
        updated_at=updated_doc.get("updated_at")
    )


@router.delete("/certifications/{certification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certification(
    certification_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    query = {"student_id": user_id}
    if ObjectId.is_valid(certification_id):
        query["_id"] = ObjectId(certification_id)
    else:
        query["_id"] = certification_id

    del_res = await db.certifications.delete_one(query)
    if del_res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Certification not found or unauthorized.")

    await db.student_profiles.update_one(
        {"user_id": user_id},
        {"$inc": {"statistics.certifications_count": -1}}
    )


# ==================== Work Experience & Internships ====================
@router.get("/work-experiences", response_model=List[WorkExperienceResponse])
async def get_work_experiences(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    cursor = db.work_experiences.find({"student_id": user_id}).sort("start_date", -1)
    experiences = await cursor.to_list(length=100)
    return [
        WorkExperienceResponse(
            id=str(e["_id"]),
            student_id=e["student_id"],
            company_name=e["company_name"],
            role=e["role"],
            employment_type=e.get("employment_type", "INTERNSHIP"),
            start_date=e["start_date"],
            end_date=e.get("end_date"),
            is_current=bool(e.get("is_current", False)),
            description=e.get("description", ""),
            responsibilities=e.get("responsibilities", []),
            skills_used=e.get("skills_used", []),
            verified=bool(e.get("verified", False)),
            created_at=e.get("created_at", get_utc_now()),
            updated_at=e.get("updated_at")
        )
        for e in experiences
    ]


@router.post("/work-experiences", response_model=WorkExperienceResponse, status_code=status.HTTP_201_CREATED)
async def create_work_experience(
    payload: WorkExperienceCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    now = get_utc_now()
    doc = {
        "student_id": user_id,
        "company_name": payload.company_name,
        "role": payload.role,
        "employment_type": payload.employment_type,
        "start_date": payload.start_date,
        "end_date": payload.end_date if not payload.is_current else None,
        "is_current": payload.is_current,
        "description": payload.description or "",
        "responsibilities": payload.responsibilities,
        "skills_used": payload.skills_used,
        "verified": False,
        "created_at": now,
        "updated_at": now
    }
    res = await db.work_experiences.insert_one(doc)

    await db.student_profiles.update_one(
        {"user_id": user_id},
        {"$inc": {"statistics.experiences_count": 1}}
    )

    return WorkExperienceResponse(
        id=str(res.inserted_id),
        student_id=user_id,
        company_name=payload.company_name,
        role=payload.role,
        employment_type=payload.employment_type,
        start_date=payload.start_date,
        end_date=payload.end_date if not payload.is_current else None,
        is_current=payload.is_current,
        description=payload.description or "",
        responsibilities=payload.responsibilities,
        skills_used=payload.skills_used,
        verified=False,
        created_at=now,
        updated_at=now
    )


@router.get("/work-experiences/{experience_id}", response_model=WorkExperienceResponse)
async def get_work_experience_detail(
    experience_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    query = {"student_id": user_id}
    if ObjectId.is_valid(experience_id):
        query["_id"] = ObjectId(experience_id)
    else:
        query["_id"] = experience_id

    doc = await db.work_experiences.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Work experience not found.")

    return WorkExperienceResponse(
        id=str(doc["_id"]),
        student_id=user_id,
        company_name=doc["company_name"],
        role=doc["role"],
        employment_type=doc.get("employment_type", "INTERNSHIP"),
        start_date=doc["start_date"],
        end_date=doc.get("end_date"),
        is_current=bool(doc.get("is_current", False)),
        description=doc.get("description", ""),
        responsibilities=doc.get("responsibilities", []),
        skills_used=doc.get("skills_used", []),
        verified=bool(doc.get("verified", False)),
        created_at=doc.get("created_at", get_utc_now()),
        updated_at=doc.get("updated_at")
    )


@router.put("/work-experiences/{experience_id}", response_model=WorkExperienceResponse)
async def update_work_experience(
    experience_id: str,
    payload: WorkExperienceUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    query = {"student_id": user_id}
    if ObjectId.is_valid(experience_id):
        query["_id"] = ObjectId(experience_id)
    else:
        query["_id"] = experience_id

    doc = await db.work_experiences.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Work experience not found or unauthorized.")

    now = get_utc_now()
    update_data = {"updated_at": now}
    if payload.company_name is not None:
        update_data["company_name"] = payload.company_name
    if payload.role is not None:
        update_data["role"] = payload.role
    if payload.employment_type is not None:
        update_data["employment_type"] = payload.employment_type
    if payload.start_date is not None:
        update_data["start_date"] = payload.start_date
    if payload.is_current is not None:
        update_data["is_current"] = payload.is_current
        if payload.is_current:
            update_data["end_date"] = None
    if payload.end_date is not None and not payload.is_current:
        update_data["end_date"] = payload.end_date
    if payload.description is not None:
        update_data["description"] = payload.description
    if payload.responsibilities is not None:
        update_data["responsibilities"] = payload.responsibilities
    if payload.skills_used is not None:
        update_data["skills_used"] = payload.skills_used

    await db.work_experiences.update_one({"_id": doc["_id"]}, {"$set": update_data})
    updated_doc = await db.work_experiences.find_one({"_id": doc["_id"]})

    return WorkExperienceResponse(
        id=str(updated_doc["_id"]),
        student_id=user_id,
        company_name=updated_doc["company_name"],
        role=updated_doc["role"],
        employment_type=updated_doc.get("employment_type", "INTERNSHIP"),
        start_date=updated_doc["start_date"],
        end_date=updated_doc.get("end_date"),
        is_current=bool(updated_doc.get("is_current", False)),
        description=updated_doc.get("description", ""),
        responsibilities=updated_doc.get("responsibilities", []),
        skills_used=updated_doc.get("skills_used", []),
        verified=bool(updated_doc.get("verified", False)),
        created_at=updated_doc.get("created_at", get_utc_now()),
        updated_at=updated_doc.get("updated_at")
    )


@router.delete("/work-experiences/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_experience(
    experience_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    query = {"student_id": user_id}
    if ObjectId.is_valid(experience_id):
        query["_id"] = ObjectId(experience_id)
    else:
        query["_id"] = experience_id

    del_res = await db.work_experiences.delete_one(query)
    if del_res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Work experience not found or unauthorized.")

    await db.student_profiles.update_one(
        {"user_id": user_id},
        {"$inc": {"statistics.experiences_count": -1}}
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
