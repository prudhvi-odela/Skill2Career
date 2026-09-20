"""
Skill2Career - Learning Evidence Router
Exposes authenticated endpoints for skill evidence recording, validation,
aggregation, peer review, and auditable skill-state synchronization.
"""

import uuid
from typing import List, Optional, Dict, Any
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db, get_utc_now
from backend.services.auth_service import get_current_user
from backend.services.evidence_service import EvidenceService
from backend.services.evidence_aggregation_service import EvidenceAggregationService
from backend.schemas.evidence_schemas import (
    EvidenceCreateRequest,
    EvidenceVerifyRequest,
    SkillEvidenceItemResponse,
    StudentEvidenceSummaryResponse,
    SkillEvidenceHistoryResponse
)
from backend.schemas.schemas import (
    PeerReviewRequestCreate,
    PeerReviewSubmit,
    PeerReviewResponse
)

router = APIRouter(prefix="/evidence", tags=["Learning Evidence Engine"])
evidence_service = EvidenceService()
aggregation_service = EvidenceAggregationService()


@router.get("", response_model=List[SkillEvidenceItemResponse])
async def list_evidence(
    skill_id: Optional[str] = Query(None, description="Filter by canonical skill ID"),
    evidence_type: Optional[str] = Query(None, description="Filter by evidence type"),
    verification_status: Optional[str] = Query(None, description="Filter by verification status"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves all evidence records for the authenticated student."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    evidence_list = await evidence_service.get_student_evidence(
        student_id=user_id,
        db=db,
        skill_id=skill_id,
        evidence_type=evidence_type,
        verification_status=verification_status
    )
    return evidence_list


@router.get("/summary", response_model=StudentEvidenceSummaryResponse)
async def get_evidence_summary(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves aggregated evidence overview and per-skill metrics for the authenticated student."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    summary = await aggregation_service.get_student_evidence_summary(student_id=user_id, db=db)
    return summary


@router.get("/skills/{skill_id}", response_model=List[SkillEvidenceItemResponse])
async def get_skill_evidence(
    skill_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves all evidence records supporting a specific skill for the authenticated student."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    evidence_list = await evidence_service.get_student_evidence(
        student_id=user_id,
        skill_id=skill_id,
        db=db
    )
    return evidence_list


@router.get("/skills/{skill_id}/history", response_model=SkillEvidenceHistoryResponse)
async def get_skill_evidence_history(
    skill_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves chronological evidence timeline and aggregated metrics for a specific skill."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    history = await aggregation_service.get_skill_evidence_history(
        student_id=user_id,
        skill_id=skill_id,
        db=db
    )
    return history


@router.post("", response_model=SkillEvidenceItemResponse, status_code=status.HTTP_201_CREATED)
async def create_evidence(
    payload: EvidenceCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Creates a new evidence record referencing a canonical skill and verified student artifact."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        evidence = await evidence_service.create_evidence(
            student_id=user_id,
            request=payload,
            db=db
        )
        return evidence
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Evidence creation error: {str(e)}")


@router.post("/{evidence_id}/verify", response_model=SkillEvidenceItemResponse)
async def verify_evidence(
    evidence_id: str,
    payload: EvidenceVerifyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Updates verification status and re-evaluates strength for eligible evidence."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        updated = await evidence_service.verify_evidence(
            evidence_id=evidence_id,
            student_id=user_id,
            request=payload,
            db=db
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Verification error: {str(e)}")


@router.post("/skills/{skill_id}/apply-state")
async def apply_evidence_to_skill_state(
    skill_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Explicitly updates student profile skill state from verified evidence.
    Feeds authoritative student state into existing ML and recommendation pipelines.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        result = await aggregation_service.apply_evidence_to_skill_state(
            student_id=user_id,
            skill_id=skill_id,
            db=db
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"State update error: {str(e)}")


@router.post("/sync-artifacts")
async def sync_artifacts(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Synchronizes all existing student projects, certifications, assessments, and activities into evidence records."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        count = await evidence_service.sync_student_artifacts_to_evidence(student_id=user_id, db=db)
        return {
            "status": "success",
            "message": f"Successfully synchronized {count} new evidence records from existing artifacts.",
            "synced_count": count
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Artifact synchronization error: {str(e)}")


# ==================== Peer Review Endpoints ====================
@router.post("/peer-reviews/request", response_model=PeerReviewResponse, status_code=status.HTTP_201_CREATED)
async def request_peer_review(
    payload: PeerReviewRequestCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Student requests a peer review for one of their projects."""
    user_id = str(current_user.get("_id") or current_user.get("id"))

    # Validate project belongs to student
    proj_query = {"student_id": user_id}
    if ObjectId.is_valid(payload.project_id):
        proj_query["_id"] = ObjectId(payload.project_id)
    else:
        proj_query["_id"] = payload.project_id

    project = await db.projects.find_one(proj_query)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized.")

    now = get_utc_now()
    skills = payload.requested_skills or payload.skill_ids
    doc = {
        "student_id": user_id,
        "student_name": current_user.get("full_name", "Student"),
        "reviewer_id": "",
        "reviewer_name": "",
        "project_id": str(project["_id"]),
        "project_title": project.get("title", "Project"),
        "requested_skills": skills,
        "skills_verified": [],
        "rating": None,
        "comment": payload.notes or "",
        "status": "PENDING",
        "created_at": now,
        "reviewed_at": None
    }
    res = await db.peer_reviews.insert_one(doc)

    return PeerReviewResponse(
        id=str(res.inserted_id),
        student_id=user_id,
        student_name=current_user.get("full_name", "Student"),
        reviewer_id="",
        reviewer_name="",
        project_id=str(project["_id"]),
        project_title=project.get("title", "Project"),
        requested_skills=skills,
        skills_verified=[],
        rating=None,
        comment=payload.notes or "",
        status="PENDING",
        created_at=now,
        reviewed_at=None
    )


@router.get("/peer-reviews/pending", response_model=List[PeerReviewResponse])
async def get_pending_peer_reviews(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves peer review requests open to other students (excluding own requests)."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    cursor = db.peer_reviews.find({
        "status": "PENDING",
        "student_id": {"$ne": user_id}
    }).sort("created_at", -1).limit(50)
    reviews = await cursor.to_list(length=50)

    return [
        PeerReviewResponse(
            id=str(r["_id"]),
            student_id=r["student_id"],
            student_name=r.get("student_name", "Peer Student"),
            reviewer_id=r.get("reviewer_id", ""),
            reviewer_name=r.get("reviewer_name", ""),
            project_id=r["project_id"],
            project_title=r.get("project_title", "Project"),
            requested_skills=r.get("requested_skills", []),
            skills_verified=r.get("skills_verified", []),
            rating=r.get("rating"),
            comment=r.get("comment"),
            status=r["status"],
            created_at=r["created_at"],
            reviewed_at=r.get("reviewed_at")
        )
        for r in reviews
    ]


@router.get("/peer-reviews/mine", response_model=List[PeerReviewResponse])
async def get_my_peer_reviews(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves peer reviews requested by or conducted for the authenticated student."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    cursor = db.peer_reviews.find({"student_id": user_id}).sort("created_at", -1).limit(50)
    reviews = await cursor.to_list(length=50)

    return [
        PeerReviewResponse(
            id=str(r["_id"]),
            student_id=r["student_id"],
            student_name=r.get("student_name", "Student"),
            reviewer_id=r.get("reviewer_id", ""),
            reviewer_name=r.get("reviewer_name", ""),
            project_id=r["project_id"],
            project_title=r.get("project_title", "Project"),
            requested_skills=r.get("requested_skills", []),
            skills_verified=r.get("skills_verified", []),
            rating=r.get("rating"),
            comment=r.get("comment"),
            status=r["status"],
            created_at=r["created_at"],
            reviewed_at=r.get("reviewed_at")
        )
        for r in reviews
    ]


@router.post("/peer-reviews/{review_id}/submit", response_model=PeerReviewResponse)
async def submit_peer_review(
    review_id: str,
    payload: PeerReviewSubmit,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Peer student reviews and submits endorsement for a peer's project evidence."""
    user_id = str(current_user.get("_id") or current_user.get("id"))

    query = {}
    if ObjectId.is_valid(review_id):
        query["_id"] = ObjectId(review_id)
    else:
        query["_id"] = review_id

    review = await db.peer_reviews.find_one(query)
    if not review:
        raise HTTPException(status_code=404, detail="Peer review request not found.")

    if review["student_id"] == user_id:
        raise HTTPException(status_code=400, detail="Students cannot review their own projects.")

    now = get_utc_now()
    reviewer_name = current_user.get("full_name", "Peer Reviewer")
    final_rating = payload.get_rating()
    final_status = payload.get_status()

    update_fields = {
        "reviewer_id": user_id,
        "reviewer_name": reviewer_name,
        "rating": final_rating,
        "comment": payload.comment,
        "skills_verified": payload.skills_verified,
        "status": final_status,
        "reviewed_at": now
    }
    await db.peer_reviews.update_one({"_id": review["_id"]}, {"$set": update_fields})

    # If approved, generate verified skill_evidence items for the author student
    if final_status == "APPROVED":
        target_skills = payload.skills_verified or review.get("requested_skills", [])
        for sk_id in target_skills:
            ev_doc = {
                "evidence_id": f"EV_PEER_{review['project_id']}_{sk_id}_{uuid.uuid4().hex[:6]}",
                "student_id": review["student_id"],
                "skill_id": sk_id,
                "evidence_type": "PEER_REVIEW",
                "source_entity": "peer_review",
                "source_entity_id": str(review["_id"]),
                "title": f"Peer Validated: {review.get('project_title', 'Project')}",
                "description": f"Reviewed by {reviewer_name}: {payload.comment[:100]}",
                "observed_proficiency": min(5.0, max(1.0, float(final_rating))),
                "evidence_strength": "STRONG" if final_rating >= 4.0 else "MODERATE",
                "evidence_score": float(final_rating * 20.0),
                "confidence_score": 0.85,
                "confidence_reason": "Structured peer review endorsement with code review.",
                "verification_status": "APPROVED",
                "validator_type": "PEER_REVIEW",
                "validator_id": user_id,
                "created_at": now,
                "observed_at": now
            }
            await db.skill_evidence.update_one(
                {"student_id": review["student_id"], "skill_id": sk_id, "evidence_type": "PEER_REVIEW", "source_entity_id": str(review["_id"])},
                {"$set": ev_doc},
                upsert=True
            )

    return PeerReviewResponse(
        id=str(review["_id"]),
        student_id=review["student_id"],
        student_name=review.get("student_name", "Student"),
        reviewer_id=user_id,
        reviewer_name=reviewer_name,
        project_id=review["project_id"],
        project_title=review.get("project_title", "Project"),
        requested_skills=review.get("requested_skills", []),
        skills_verified=payload.skills_verified,
        rating=final_rating,
        comment=payload.comment,
        status=final_status,
        created_at=review["created_at"],
        reviewed_at=now
    )
