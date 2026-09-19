"""
Skill2Career Student Router
Manages student profiles, skills inventory, projects, certifications, and learning activities.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database.session import get_db
from backend.models.models import (
    User, StudentProfile, Skill, StudentSkill, Project, Certification, LearningActivity, LearningSnapshot, CareerRole
)
from backend.schemas.schemas import (
    ProfileUpdate, ProfileResponse, StudentSkillCreate, StudentSkillUpdate, StudentSkillResponse,
    ProjectCreate, ProjectResponse, CertificationCreate, CertificationResponse
)
from backend.services.auth_service import get_current_user

router = APIRouter(prefix="/student", tags=["Student Management"])


def get_or_create_profile(user: User, db: Session) -> StudentProfile:
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# ==================== Profile ====================
@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_or_create_profile(current_user, db)
    
    # Format student skills
    skills_response = []
    for ss in profile.skills:
        skills_response.append(StudentSkillResponse(
            id=ss.id,
            skill_id=ss.skill_id,
            skill_name=ss.skill.name if ss.skill else ss.skill_id,
            category=ss.skill.category if ss.skill else "General",
            domain=ss.skill.domain if ss.skill else "General",
            proficiency_level=ss.proficiency_level,
            years_experience=ss.years_experience,
            is_verified=ss.is_verified,
            verification_source=ss.verification_source,
            updated_at=ss.updated_at
        ))

    target_title = profile.target_career.title if profile.target_career else None

    return ProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        headline=profile.headline,
        bio=profile.bio,
        degree=profile.degree,
        institution=profile.institution,
        institution_tier=profile.institution_tier,
        graduation_year=profile.graduation_year,
        gpa=profile.gpa,
        target_career_id=profile.target_career_id,
        target_career_title=target_title,
        weekly_study_hours=profile.weekly_study_hours,
        learning_velocity_index=profile.learning_velocity_index,
        skills=skills_response,
        projects_count=len(profile.projects),
        certifications_count=len(profile.certifications),
        created_at=profile.created_at
    )


@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)

    if payload.headline is not None:
        profile.headline = payload.headline
    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.degree is not None:
        profile.degree = payload.degree
    if payload.institution is not None:
        profile.institution = payload.institution
    if payload.institution_tier is not None:
        profile.institution_tier = payload.institution_tier
    if payload.graduation_year is not None:
        profile.graduation_year = payload.graduation_year
    if payload.gpa is not None:
        profile.gpa = payload.gpa
    if payload.target_career_id is not None:
        # Validate career exists
        career = db.query(CareerRole).filter(CareerRole.id == payload.target_career_id).first()
        if not career:
            raise HTTPException(status_code=400, detail="Specified target career does not exist.")
        profile.target_career_id = payload.target_career_id
    if payload.weekly_study_hours is not None:
        profile.weekly_study_hours = payload.weekly_study_hours

    db.commit()
    db.refresh(profile)
    return get_profile(current_user, db)


# ==================== Skills ====================
@router.get("/skills", response_model=List[StudentSkillResponse])
def get_student_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_or_create_profile(current_user, db)
    results = []
    for ss in profile.skills:
        results.append(StudentSkillResponse(
            id=ss.id,
            skill_id=ss.skill_id,
            skill_name=ss.skill.name if ss.skill else ss.skill_id,
            category=ss.skill.category if ss.skill else "General",
            domain=ss.skill.domain if ss.skill else "General",
            proficiency_level=ss.proficiency_level,
            years_experience=ss.years_experience,
            is_verified=ss.is_verified,
            verification_source=ss.verification_source,
            updated_at=ss.updated_at
        ))
    return results


@router.post("/skills", response_model=StudentSkillResponse, status_code=status.HTTP_201_CREATED)
def add_or_update_student_skill(
    payload: StudentSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    
    # Check if skill exists in catalog
    skill = db.query(Skill).filter(Skill.id == payload.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill '{payload.skill_id}' not found in catalog.")

    existing_ss = db.query(StudentSkill).filter(
        StudentSkill.profile_id == profile.id,
        StudentSkill.skill_id == payload.skill_id
    ).first()

    if existing_ss:
        existing_ss.proficiency_level = payload.proficiency_level
        existing_ss.years_experience = payload.years_experience
        db.commit()
        db.refresh(existing_ss)
        ss = existing_ss
    else:
        ss = StudentSkill(
            profile_id=profile.id,
            skill_id=payload.skill_id,
            proficiency_level=payload.proficiency_level,
            years_experience=payload.years_experience,
            is_verified=False,
            verification_source="Self-Reported"
        )
        db.add(ss)
        db.commit()
        db.refresh(ss)

    return StudentSkillResponse(
        id=ss.id,
        skill_id=ss.skill_id,
        skill_name=skill.name,
        category=skill.category,
        domain=skill.domain,
        proficiency_level=ss.proficiency_level,
        years_experience=ss.years_experience,
        is_verified=ss.is_verified,
        verification_source=ss.verification_source,
        updated_at=ss.updated_at
    )


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    ss = db.query(StudentSkill).filter(
        StudentSkill.profile_id == profile.id,
        StudentSkill.skill_id == skill_id
    ).first()
    if not ss:
        raise HTTPException(status_code=404, detail="Skill not found in student inventory.")
    db.delete(ss)
    db.commit()


# ==================== Projects ====================
@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_or_create_profile(current_user, db)
    return profile.projects


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    project = Project(
        profile_id=profile.id,
        title=payload.title,
        description=payload.description,
        repo_url=payload.repo_url,
        live_url=payload.live_url,
        tech_stack=payload.tech_stack,
        complexity_rating=payload.complexity_rating
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


# ==================== Certifications ====================
@router.get("/certifications", response_model=List[CertificationResponse])
def get_certifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_or_create_profile(current_user, db)
    return profile.certifications


@router.post("/certifications", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED)
def create_certification(
    payload: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    cert = Certification(
        profile_id=profile.id,
        name=payload.name,
        issuer=payload.issuer,
        issue_date=payload.issue_date,
        credential_url=payload.credential_url,
        is_verified=True
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


# ==================== Activities ====================
@router.get("/activities")
def get_activities(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_or_create_profile(current_user, db)
    activities = db.query(LearningActivity).filter(
        LearningActivity.profile_id == profile.id
    ).order_by(LearningActivity.completed_at.desc()).limit(20).all()
    return [
        {
            "id": a.id,
            "activity_type": a.activity_type,
            "title": a.title,
            "description": a.description,
            "hours_spent": a.hours_spent,
            "completed_at": a.completed_at
        }
        for a in activities
    ]
