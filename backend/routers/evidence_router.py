"""
Skill2Career - Learning Evidence Router
Exposes authenticated endpoints for skill evidence recording, validation,
aggregation, and auditable skill-state synchronization.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db
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
