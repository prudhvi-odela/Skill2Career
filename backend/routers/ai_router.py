"""
Skill2Career AI Career Intelligence API Router
Exposes grounded career explanations, coaching recommendations, and natural language chat.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db
from backend.routers.auth_router import get_current_user
from backend.schemas.ai_schemas import (
    AIChatRequest,
    AIExplainGapRequest,
    AIExplainCareerRequest,
    AIExplainTrajectoryRequest,
    AIExplainTransitionRequest,
    AINextActionRequest,
    AIStructuredResponse,
    AIInteractionResponse
)
from backend.services.ai_service import get_ai_service

router = APIRouter(prefix="/ai", tags=["AI Career Intelligence"])


@router.post("/explain-readiness", response_model=AIStructuredResponse)
async def explain_readiness(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Explains why the student's current ML Job-Readiness Score is at its evaluated level,
    highlighting model feature attributions, positive strengths, and negative gap penalties.
    """
    user_id = current_user["id"]
    ai_service = get_ai_service()
    return await ai_service.explain_readiness(user_id=user_id, db=db)


@router.post("/explain-gap", response_model=AIStructuredResponse)
async def explain_skill_gap(
    payload: AIExplainGapRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Explains the priority, remediation effort, and impact of verified skill gaps for a target role.
    """
    user_id = current_user["id"]
    ai_service = get_ai_service()
    return await ai_service.explain_skill_gap(
        user_id=user_id,
        career_id=payload.career_id,
        skill_id=payload.skill_id,
        db=db
    )


@router.post("/next-action", response_model=AIStructuredResponse)
async def get_next_best_action(
    payload: AINextActionRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Synthesizes the student's highest-leverage next study or portfolio action
    to maximize readiness score improvement.
    """
    user_id = current_user["id"]
    ai_service = get_ai_service()
    return await ai_service.get_next_best_action(
        user_id=user_id,
        career_id=payload.career_id,
        db=db
    )


@router.post("/explain-career", response_model=AIStructuredResponse)
async def explain_career_match(
    payload: AIExplainCareerRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Explains why a specific career matches or challenges the student's current skills.
    """
    user_id = current_user["id"]
    ai_service = get_ai_service()
    return await ai_service.explain_career_match(
        user_id=user_id,
        career_id=payload.career_id,
        db=db
    )


@router.post("/explain-transition", response_model=AIStructuredResponse)
async def explain_career_transition(
    payload: AIExplainTransitionRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Explains the strategic transition between career profiles, highlighting transferable skills,
    gap remediation, and prerequisite milestone ordering.
    """
    user_id = current_user["id"]
    ai_service = get_ai_service()
    return await ai_service.explain_career_transition(
        user_id=user_id,
        target_career_id=payload.target_career_id,
        source_career_id=payload.source_career_id,
        db=db
    )


@router.post("/explain-trajectory", response_model=AIStructuredResponse)
async def explain_trajectory(
    payload: AIExplainTrajectoryRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Contextualizes the student's simulated 24-week growth trajectory curve and timeline milestones.
    """
    user_id = current_user["id"]
    ai_service = get_ai_service()
    return await ai_service.explain_trajectory(
        user_id=user_id,
        weekly_hours=payload.weekly_hours or 15.0,
        consistency=payload.consistency or 1.0,
        db=db
    )


@router.post("/chat", response_model=AIStructuredResponse)
async def career_chat(
    payload: AIChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Natural-language career & learning assistant query strictly grounded in student profile and curriculum.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    ai_service = get_ai_service()
    return await ai_service.chat(
        user_id=user_id,
        message=payload.message,
        conversation_id=payload.conversation_id,
        target_career_id=payload.target_career_id,
        action_type=payload.action_type,
        code_snippet=payload.code_snippet,
        db=db
    )


@router.get("/conversations")
async def list_ai_conversations(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves all conversation sessions for the authenticated student."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    ai_service = get_ai_service()
    return await ai_service.list_conversations(student_id=user_id, db=db)


@router.post("/conversations", status_code=status.HTTP_201_CREATED)
async def create_ai_conversation(
    title: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Initializes a new persistent conversation session."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    ai_service = get_ai_service()
    return await ai_service.create_conversation(student_id=user_id, title=title, db=db)


@router.get("/conversations/{conversation_id}/messages")
async def get_ai_conversation_messages(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Retrieves chronological messages for a conversation thread."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    ai_service = get_ai_service()
    return await ai_service.get_conversation_messages(student_id=user_id, conversation_id=conversation_id, db=db)


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ai_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """Deletes a conversation session and all its associated messages."""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    ai_service = get_ai_service()
    await ai_service.delete_conversation(student_id=user_id, conversation_id=conversation_id, db=db)


@router.get("/resources")
async def search_learning_resources(
    query: Optional[str] = None,
    skill_id: Optional[str] = None,
    topic: Optional[str] = None,
    db: AsyncDatabase = Depends(get_db)
):
    """Searches verified learning resources database (official documentation, tutorials, courses) with zero fabricated URLs."""
    ai_service = get_ai_service()
    return await ai_service.search_learning_resources(query=query, skill_id=skill_id, topic=topic, db=db)


@router.get("/history", response_model=List[AIInteractionResponse])
async def get_chat_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Retrieves past AI career coaching interactions for the authenticated student.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    cursor = db.ai_interactions.find({"student_id": user_id}).sort("created_at", -1).limit(limit)
    docs = await cursor.to_list(length=limit)

    results = []
    for d in docs:
        resp_data = d.get("assistant_response", {})
        results.append(AIInteractionResponse(
            id=str(d.get("_id", "")),
            student_id=d.get("student_id", user_id),
            conversation_id=d.get("conversation_id", ""),
            user_message=d.get("user_message", ""),
            assistant_response=AIStructuredResponse(**resp_data) if isinstance(resp_data, dict) else resp_data,
            context_type=d.get("context_type", "general"),
            referenced_prediction_ids=d.get("referenced_prediction_ids", []),
            created_at=d.get("created_at")
        ))
    return results
