"""
Skill2Career Personalized Roadmap Router (MongoDB Async)
Generates and tracks customized weekly learning roadmaps addressing student skill gaps in MongoDB.
"""

import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db, get_utc_now, serialize_doc, serialize_docs
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
async def get_current_roadmap(
    target_career_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    chosen_career_id = target_career_id or profile.get("target_career_id") or "CR001"
    career = await db.career_roles.find_one({
        "$or": [{"career_code": chosen_career_id}, {"_id": chosen_career_id}]
    })
    career_title = career.get("title", chosen_career_id) if career else chosen_career_id

    roadmap = await db.roadmaps.find_one({
        "student_id": user_id,
        "career_id": chosen_career_id
    })

    if not roadmap:
        roadmap = await _generate_roadmap_for_student(user_id, profile, chosen_career_id, career_title, db)

    items = roadmap.get("items", [])
    completed_count = len([it for it in items if it.get("completed", False)])
    progress_pct = round((completed_count / len(items)) * 100.0, 1) if items else 0.0

    items_res = [
        RoadmapItemResponse(
            id=it.get("id", str(uuid.uuid4())),
            week_number=it.get("week", 1),
            title=it.get("title", ""),
            description=it.get("description"),
            skill_id=it.get("skill_id"),
            skill_name=it.get("skill_name"),
            recommended_resources=it.get("resources", []),
            is_completed=it.get("completed", False),
            completed_at=it.get("completed_at")
        )
        for it in items
    ]

    return RoadmapResponse(
        id=str(roadmap["_id"]),
        career_id=chosen_career_id,
        career_title=career_title,
        title=roadmap.get("title", f"Personalized Career Acceleration Path to {career_title}"),
        target_completion_weeks=roadmap.get("target_completion_weeks", 16),
        status=roadmap.get("status", "active"),
        progress_pct=progress_pct,
        items=items_res
    )


@router.post("/regenerate", response_model=RoadmapResponse)
async def regenerate_roadmap(
    target_career_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    chosen_career_id = target_career_id or profile.get("target_career_id") or "CR001"
    career = await db.career_roles.find_one({
        "$or": [{"career_code": chosen_career_id}, {"_id": chosen_career_id}]
    })
    career_title = career.get("title", chosen_career_id) if career else chosen_career_id

    await db.roadmaps.delete_many({"student_id": user_id, "career_id": chosen_career_id})
    await _generate_roadmap_for_student(user_id, profile, chosen_career_id, career_title, db)

    return await get_current_roadmap(chosen_career_id, current_user, db)


@router.put("/items/{item_id}", response_model=RoadmapItemResponse)
async def toggle_roadmap_item(
    item_id: str,
    payload: RoadmapItemToggle,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    now = get_utc_now() if payload.is_completed else None

    # Update item in the roadmaps collection
    result = await db.roadmaps.update_one(
        {"student_id": user_id, "items.id": item_id},
        {
            "$set": {
                "items.$.completed": payload.is_completed,
                "items.$.completed_at": now,
                "updated_at": get_utc_now()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Roadmap milestone item not found.")

    # Retrieve updated item
    roadmap = await db.roadmaps.find_one({"student_id": user_id, "items.id": item_id})
    target_item = next((it for it in roadmap.get("items", []) if it.get("id") == item_id), None)

    return RoadmapItemResponse(
        id=target_item.get("id", item_id),
        week_number=target_item.get("week", 1),
        title=target_item.get("title", ""),
        description=target_item.get("description"),
        skill_id=target_item.get("skill_id"),
        skill_name=target_item.get("skill_name"),
        recommended_resources=target_item.get("resources", []),
        is_completed=target_item.get("completed", False),
        completed_at=target_item.get("completed_at")
    )


async def _generate_roadmap_for_student(
    user_id: str,
    profile: dict,
    career_id: str,
    career_title: str,
    db: AsyncDatabase
) -> dict:
    student_skills = [
        {"skill_id": ss.get("skill_id"), "level": float(ss.get("level", 1.0))}
        for ss in profile.get("skills", [])
    ]
    gap_result = ml_service.analyze_skill_gap(student_skills, career_id)

    gaps_to_cover = [g for g in gap_result["gaps"] if g["gap"] > 0]
    if not gaps_to_cover:
        gaps_to_cover = gap_result["gaps"][:4]

    items = []
    week = 1

    for gap in gaps_to_cover[:8]:
        s_id = gap["skill_id"]
        s_name = gap["skill_name"]
        resources = RESOURCE_CATALOG.get(s_id, [
            {"title": f"Mastering {s_name} Standard Documentation", "url": "https://devdocs.io/"},
            {"title": f"Practical Hands-On Exercises for {s_name}", "url": "https://github.com/"}
        ])

        items.append({
            "id": f"milestone_{uuid.uuid4().hex[:8]}",
            "week": week,
            "skill_id": s_id,
            "skill_name": s_name,
            "title": f"Week {week}: Master {s_name} Core Concepts & Patterns",
            "description": f"Deep dive into foundational principles, architecture, and syntax for {s_name}. Target proficiency jump from {gap['current_level']} to {min(5.0, gap['current_level'] + 1.0)}.",
            "estimated_hours": 6.0,
            "resources": resources,
            "completed": False,
            "completed_at": None
        })
        week += 1

        items.append({
            "id": f"milestone_{uuid.uuid4().hex[:8]}",
            "week": week,
            "skill_id": s_id,
            "skill_name": s_name,
            "title": f"Week {week}: Build Portfolio Implementation with {s_name}",
            "description": f"Design, build, and deploy an end-to-end practical feature showcasing production-grade {s_name} patterns.",
            "estimated_hours": 8.0,
            "resources": resources,
            "completed": False,
            "completed_at": None
        })
        week += 1

    # Capstone Milestone
    items.append({
        "id": f"milestone_{uuid.uuid4().hex[:8]}",
        "week": week,
        "skill_id": None,
        "skill_name": None,
        "title": f"Week {week}: Full Capstone Project & Mock Technical Interview",
        "description": f"Consolidate all skills into a comprehensive portfolio project aligned with {career_title} hiring standards.",
        "estimated_hours": 12.0,
        "resources": [{"title": "Tech Interview Handbook", "url": "https://www.techinterviewhandbook.org/"}],
        "completed": False,
        "completed_at": None
    })

    now = get_utc_now()
    roadmap_doc = {
        "student_id": user_id,
        "career_id": career_id,
        "title": f"Personalized Career Acceleration Path to {career_title}",
        "target_completion_weeks": min(24, max(8, len(items))),
        "status": "active",
        "overall_progress": 0.0,
        "items": items,
        "created_at": now,
        "updated_at": now
    }

    res = await db.roadmaps.insert_one(roadmap_doc)
    roadmap_doc["_id"] = res.inserted_id
    return roadmap_doc
