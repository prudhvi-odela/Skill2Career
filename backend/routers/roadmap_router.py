"""
Skill2Career Personalized Roadmap Router
Generates and tracks customized weekly learning roadmaps addressing student skill gaps.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional

from backend.database.session import get_db
from backend.models.models import (
    StudentProfile, CareerRole, Roadmap, RoadmapItem, Skill
)
from backend.schemas.schemas import (
    RoadmapResponse, RoadmapItemResponse, RoadmapItemToggle
)
from backend.services.auth_service import get_current_user
from backend.ml.inference import MLInferenceService

router = APIRouter(prefix="/roadmap", tags=["Personalized Learning Roadmap"])
ml_service = MLInferenceService.get_instance()


RESOURCE_CATALOG = {
    "SK001": [{"title": "Python Deep Dive & Data Structures", "url": "https://docs.python.org/3/tutorial/"}],
    "SK002": [{"title": "Modern JavaScript ES6+ Architecture", "url": "https://javascript.info/"}],
    "SK003": [{"title": "TypeScript Handbook & Generics", "url": "https://www.typescriptlang.org/docs/"}],
    "SK008": [{"title": "PostgreSQL Performance & Query Optimization", "url": "https://use-the-index-luke.com/"}],
    "SK009": [{"title": "React 18 State Patterns & Component Design", "url": "https://react.dev/"}],
    "SK015": [{"title": "FastAPI Masterclass & Async APIs", "url": "https://fastapi.tiangolo.com/"}],
    "SK026": [{"title": "Pandas & NumPy Data Wrangling Cookbook", "url": "https://pandas.pydata.org/docs/"}],
    "SK027": [{"title": "Scikit-Learn Machine Learning Pipeline Design", "url": "https://scikit-learn.org/stable/"}],
    "SK028": [{"title": "PyTorch Deep Learning & Tensor Ops", "url": "https://pytorch.org/tutorials/"}],
    "SK034": [{"title": "Docker Mastery & Multi-Stage Builds", "url": "https://docs.docker.com/"}],
    "SK040": [{"title": "Advanced Data Structures & Algorithms", "url": "https://leetcode.com/explore/"}],
    "SK041": [{"title": "System Design Primer & Distributed Systems", "url": "https://github.com/donnemartin/system-design-primer"}],
}


@router.get("", response_model=RoadmapResponse)
def get_current_roadmap(
    target_career_id: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    chosen_career_id = target_career_id or profile.target_career_id
    if not chosen_career_id:
        chosen_career_id = "CR001"

    career = db.query(CareerRole).filter(CareerRole.id == chosen_career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career role not found.")

    roadmap = db.query(Roadmap).filter(
        Roadmap.profile_id == profile.id,
        Roadmap.career_id == chosen_career_id
    ).first()

    if not roadmap:
        # Generate new personalized roadmap
        roadmap = _generate_roadmap_for_student(profile, career, db)

    items_res = []
    completed_count = 0
    for item in roadmap.items:
        if item.is_completed:
            completed_count += 1
        items_res.append(RoadmapItemResponse(
            id=item.id,
            week_number=item.week_number,
            title=item.title,
            description=item.description,
            skill_id=item.skill_id,
            skill_name=item.skill.name if item.skill else None,
            recommended_resources=item.recommended_resources_json or [],
            is_completed=item.is_completed,
            completed_at=item.completed_at
        ))

    items_res.sort(key=lambda x: x.week_number)
    progress_pct = round((completed_count / len(items_res)) * 100.0, 1) if items_res else 0.0
    roadmap.progress_pct = progress_pct
    db.commit()

    return RoadmapResponse(
        id=roadmap.id,
        career_id=career.id,
        career_title=career.title,
        title=roadmap.title,
        target_completion_weeks=roadmap.target_completion_weeks,
        status=roadmap.status,
        progress_pct=progress_pct,
        items=items_res
    )


@router.post("/regenerate", response_model=RoadmapResponse)
def regenerate_roadmap(
    target_career_id: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    chosen_career_id = target_career_id or profile.target_career_id or "CR001"
    career = db.query(CareerRole).filter(CareerRole.id == chosen_career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career role not found.")

    # Delete existing roadmap for this career
    db.query(Roadmap).filter(
        Roadmap.profile_id == profile.id,
        Roadmap.career_id == chosen_career_id
    ).delete()
    db.commit()

    new_roadmap = _generate_roadmap_for_student(profile, career, db)
    return get_current_roadmap(chosen_career_id, current_user, db)


@router.put("/items/{item_id}", response_model=RoadmapItemResponse)
def toggle_roadmap_item(
    item_id: str,
    payload: RoadmapItemToggle,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(RoadmapItem).filter(RoadmapItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Roadmap item not found.")

    item.is_completed = payload.is_completed
    item.completed_at = datetime.now(timezone.utc) if payload.is_completed else None
    db.commit()
    db.refresh(item)

    return RoadmapItemResponse(
        id=item.id,
        week_number=item.week_number,
        title=item.title,
        description=item.description,
        skill_id=item.skill_id,
        skill_name=item.skill.name if item.skill else None,
        recommended_resources=item.recommended_resources_json or [],
        is_completed=item.is_completed,
        completed_at=item.completed_at
    )


def _generate_roadmap_for_student(profile: StudentProfile, career: CareerRole, db: Session) -> Roadmap:
    student_skills = [{"skill_id": ss.skill_id, "level": ss.proficiency_level} for ss in profile.skills]
    gap_result = ml_service.analyze_skill_gap(student_skills, career.id)

    # Sort gaps prioritizing Critical, then High, then Developing
    gaps_to_cover = [g for g in gap_result["gaps"] if g["gap"] > 0]
    if not gaps_to_cover:
        gaps_to_cover = gap_result["gaps"][:4]

    roadmap = Roadmap(
        profile_id=profile.id,
        career_id=career.id,
        title=f"Personalized Career Acceleration Path to {career.title}",
        target_completion_weeks=min(24, max(8, len(gaps_to_cover) * 2)),
        status="active",
        progress_pct=0.0
    )
    db.add(roadmap)
    db.flush()

    week = 1
    for gap in gaps_to_cover[:8]:
        s_id = gap["skill_id"]
        s_name = gap["skill_name"]
        delta = gap["gap"]
        resources = RESOURCE_CATALOG.get(s_id, [
            {"title": f"Mastering {s_name} Standard Documentation", "url": "https://devdocs.io/"},
            {"title": f"Practical Hands-On Exercises for {s_name}", "url": "https://github.com/"}
        ])

        # Milestone 1: Theory & Fundamentals
        item1 = RoadmapItem(
            roadmap_id=roadmap.id,
            skill_id=s_id,
            week_number=week,
            title=f"Week {week}: Master {s_name} Core Concepts & Patterns",
            description=f"Deep dive into foundational principles, architecture, and syntax for {s_name}. Target proficiency jump from {gap['current_level']} to {min(5.0, gap['current_level'] + 1.0)}.",
            recommended_resources_json=resources,
            is_completed=False
        )
        db.add(item1)
        week += 1

        # Milestone 2: Project implementation
        item2 = RoadmapItem(
            roadmap_id=roadmap.id,
            skill_id=s_id,
            week_number=week,
            title=f"Week {week}: Build Portfolio Implementation with {s_name}",
            description=f"Design, build, and deploy an end-to-end practical feature showcasing production-grade {s_name} patterns.",
            recommended_resources_json=resources,
            is_completed=False
        )
        db.add(item2)
        week += 1

    # Final Capstone Milestone
    capstone = RoadmapItem(
        roadmap_id=roadmap.id,
        week_number=week,
        title=f"Week {week}: Full Capstone Project & Mock Technical Interview",
        description=f"Consolidate all skills into a comprehensive portfolio project aligned with {career.title} hiring standards.",
        recommended_resources_json=[{"title": "Tech Interview Handbook", "url": "https://www.techinterviewhandbook.org/"}],
        is_completed=False
    )
    db.add(capstone)

    db.commit()
    db.refresh(roadmap)
    return roadmap
