"""
Skill2Career AI Career & Learning Intelligence Schemas
Supports multi-turn conversations, educational action intents, grounded context,
and verified external web learning resources.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class WebResourceItem(BaseModel):
    title: str
    source: str
    url: str
    description: str
    resource_type: str = "Documentation"  # Documentation, Tutorial, Course, Video, Practice


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Student natural language prompt or query")
    conversation_id: Optional[str] = Field(None, description="Optional conversation session ID")
    target_career_id: Optional[str] = Field(None, description="Optional contextual target career ID")
    action_type: Optional[str] = Field(None, description="Action intent: teach_topic, 5_questions, explain_code, beginner_example, harder_problem, revision_quiz, get_resources, project_idea, debug_code")
    code_snippet: Optional[str] = Field(None, description="Optional student code to explain or debug")


class AIExplainGapRequest(BaseModel):
    career_id: Optional[str] = Field(None, description="Target career ID for gap analysis")
    skill_id: Optional[str] = Field(None, description="Specific skill ID to contextualize")


class AIExplainCareerRequest(BaseModel):
    career_id: str = Field(..., description="Career ID to explain compatibility for")


class AIExplainTrajectoryRequest(BaseModel):
    weekly_hours: Optional[float] = Field(15.0, description="Hypothetical weekly study hours commitment")
    consistency: Optional[float] = Field(1.0, description="Simulation assumption velocity multiplier")


class AINextActionRequest(BaseModel):
    career_id: Optional[str] = Field(None, description="Optional target career ID")


class AIExplainTransitionRequest(BaseModel):
    target_career_id: str = Field(..., description="Target career ID for transition explanation")
    source_career_id: Optional[str] = Field(None, description="Optional source career ID override")


class AIStructuredResponse(BaseModel):
    message: str = Field(..., description="Primary grounded explanation or guidance text")
    key_points: List[str] = Field(default_factory=list, description="Bulleted executive takeaways")
    recommended_actions: List[str] = Field(default_factory=list, description="Actionable next steps")
    referenced_skills: List[str] = Field(default_factory=list, description="Canonical skills explicitly referenced")
    referenced_careers: List[str] = Field(default_factory=list, description="Career titles/IDs referenced")
    referenced_predictions: List[str] = Field(default_factory=list, description="Prediction IDs and authoritative scores referenced")
    learning_resources: List[WebResourceItem] = Field(default_factory=list, description="Verified external learning resources")
    code_examples: List[str] = Field(default_factory=list, description="Safe educational code snippets")
    follow_up_questions: List[str] = Field(default_factory=list, description="Suggested follow-up student questions")
    warnings: List[str] = Field(default_factory=list, description="Advisory or disclaimer notes (e.g. data freshness, ethics)")
    context_type: str = Field("general_chat", description="Type of intelligence context: readiness, gap, career, trajectory, action, learning_tutor")
    conversation_id: Optional[str] = Field(None, description="Active conversation thread ID")
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="ISO UTC timestamp")
    model_used: str = Field("grounded-career-engine", description="LLM provider model or rule-based engine tag")


class AIInteractionResponse(BaseModel):
    id: str
    student_id: str
    conversation_id: str
    user_message: str
    assistant_response: AIStructuredResponse
    context_type: str
    referenced_prediction_ids: List[str] = []
    created_at: Any


class AIConversationResponse(BaseModel):
    id: str
    student_id: str
    title: str
    created_at: Any
    updated_at: Any
    message_count: int = 0
    last_message_preview: Optional[str] = None


class AIMessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str  # "user" or "assistant"
    content: str
    action_type: Optional[str] = None
    structured_data: Optional[AIStructuredResponse] = None
    created_at: Any
