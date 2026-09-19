"""
Skill2Career - Personalized Adaptive Roadmap Router (MongoDB Async)
Generates, recalculates, and tracks versioned multi-phase adaptive learning journeys in MongoDB.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db, get_utc_now, serialize_doc, serialize_docs
from backend.services.auth_service import get_current_user
from backend.services.adaptive_roadmap_service import AdaptiveRoadmapService
from backend.schemas.schemas import (
    RoadmapResponse, RoadmapItemResponse, RoadmapItemToggle
)
from backend.schemas.recommendation_schemas import (
    AdaptiveRoadmapResponse,
    RoadmapProgressUpdate,
    RoadmapHistoryResponse
)

router = APIRouter(prefix="/roadmap", tags=["Personalized Learning Roadmap"])
roadmap_service = AdaptiveRoadmapService()


# ==================== Phase 08 Adaptive Roadmap Endpoints ====================

@router.get("/current", response_model=AdaptiveRoadmapResponse)
async def get_current_adaptive_roadmap(
    career_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves the current active multi-phase adaptive roadmap for the authenticated student."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        roadmap = await roadmap_service.generate_or_get_adaptive_roadmap(
            student_id=user_id,
            target_career_id=career_id,
            db=db,
            force_regenerate=False
        )
        return roadmap
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Roadmap error: {str(e)}")


@router.post("/recalculate", response_model=AdaptiveRoadmapResponse)
async def recalculate_roadmap(
    career_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Recalculates adaptive roadmap reflecting latest student competency changes, creating a new version."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        roadmap = await roadmap_service.generate_or_get_adaptive_roadmap(
            student_id=user_id,
            target_career_id=career_id,
            db=db,
            force_regenerate=True
        )
        return roadmap
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Recalculation error: {str(e)}")


@router.get("/history", response_model=RoadmapHistoryResponse)
async def get_roadmap_history(
    career_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves historical roadmap versions for the authenticated student."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        history = await roadmap_service.get_roadmap_history(
            student_id=user_id,
            career_id=career_id,
            db=db
        )
        return history
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"History error: {str(e)}")


@router.post("/progress", response_model=AdaptiveRoadmapResponse)
async def update_roadmap_progress(
    payload: RoadmapProgressUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Persists milestone progress updates and recalculates overall completion."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        updated = await roadmap_service.update_milestone_progress(
            student_id=user_id,
            milestone_id=payload.milestone_id,
            is_completed=payload.is_completed,
            db=db
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Progress error: {str(e)}")


# ==================== Legacy Backward-Compatible Endpoints ====================

@router.get("", response_model=RoadmapResponse)
async def get_current_roadmap_legacy(
    target_career_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Legacy backward-compatible roadmap retrieval."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    chosen_career_id = target_career_id or profile.get("target_career_id") or "CR001"
    career = await db.career_roles.find_one({
        "$or": [{"career_code": chosen_career_id}, {"_id": chosen_career_id}]
    })
    career_title = career.get("title", chosen_career_id) if career else chosen_career_id

    # Generate or get adaptive roadmap
    adaptive = await roadmap_service.generate_or_get_adaptive_roadmap(
        student_id=user_id,
        target_career_id=chosen_career_id,
        db=db,
        force_regenerate=False
    )

    # Flatten phase milestones to legacy items
    items_res = []
    week_counter = 1
    for phase in adaptive.get("phases", []):
        for ms in phase.get("milestones", []):
            items_res.append(
                RoadmapItemResponse(
                    id=ms.get("id", f"ms_{week_counter}"),
                    week_number=week_counter,
                    title=ms.get("title", ""),
                    description=ms.get("description"),
                    skill_id=ms.get("skill_id"),
                    skill_name=ms.get("skill_name"),
                    recommended_resources=ms.get("resources", []),
                    is_completed=ms.get("is_completed", False),
                    completed_at=ms.get("completed_at")
                )
            )
            week_counter += 1

    completed_count = len([it for it in items_res if it.is_completed])
    progress_pct = round((completed_count / len(items_res)) * 100.0, 1) if items_res else 0.0

    return RoadmapResponse(
        id=str(adaptive.get("id") or adaptive.get("_id")),
        career_id=chosen_career_id,
        career_title=career_title,
        title=adaptive.get("title", f"Personalized Career Acceleration Path to {career_title}"),
        target_completion_weeks=adaptive.get("target_completion_weeks", 16),
        status=adaptive.get("status", "active"),
        progress_pct=progress_pct,
        items=items_res
    )


@router.post("/regenerate", response_model=RoadmapResponse)
async def regenerate_roadmap_legacy(
    target_career_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Legacy backward-compatible roadmap regeneration."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    await roadmap_service.generate_or_get_adaptive_roadmap(
        student_id=user_id,
        target_career_id=target_career_id,
        db=db,
        force_regenerate=True
    )
    return await get_current_roadmap_legacy(target_career_id, current_user, db)


@router.put("/items/{item_id}", response_model=RoadmapItemResponse)
async def toggle_roadmap_item_legacy(
    item_id: str,
    payload: RoadmapItemToggle,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Legacy backward-compatible milestone toggle."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        updated_roadmap = await roadmap_service.update_milestone_progress(
            student_id=user_id,
            milestone_id=item_id,
            is_completed=payload.is_completed,
            db=db
        )
        # Find updated milestone
        target_ms = None
        week_num = 1
        for p in updated_roadmap.get("phases", []):
            for ms in p.get("milestones", []):
                if ms.get("id") == item_id:
                    target_ms = ms
                    break
                week_num += 1
            if target_ms:
                break

        if not target_ms:
            raise HTTPException(status_code=404, detail="Roadmap milestone item not found.")

        return RoadmapItemResponse(
            id=target_ms.get("id", item_id),
            week_number=week_num,
            title=target_ms.get("title", ""),
            description=target_ms.get("description"),
            skill_id=target_ms.get("skill_id"),
            skill_name=target_ms.get("skill_name"),
            recommended_resources=target_ms.get("resources", []),
            is_completed=target_ms.get("is_completed", False),
            completed_at=target_ms.get("completed_at")
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Roadmap milestone item not found.")
