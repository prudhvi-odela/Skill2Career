"""
Skill2Career - Recommendation and Adaptive Roadmap Schemas
Defines structured request/response models for skill dependencies, prioritized recommendations,
multi-phase adaptive roadmaps, progress tracking, and feedback.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class SkillDependencyResponse(BaseModel):
    dependency_id: str
    skill_id: str
    skill_name: Optional[str] = None
    prerequisite_skill_id: str
    prerequisite_skill_name: Optional[str] = None
    dependency_type: str = Field(..., description="PREREQUISITE, SUPPORTING, or OPTIONAL")
    strength: float = Field(..., ge=0.0, le=1.0)
    source: str


class SkillRecommendationResponse(BaseModel):
    recommendation_id: str
    student_id: str
    career_id: str
    career_title: str
    skill_id: str
    skill_name: str
    category: str
    priority_score: float = Field(..., ge=0.0, le=100.0, description="Normalized deterministic priority score 0-100")
    priority_band: str = Field(..., description="URGENT, HIGH, MODERATE, LOW")
    student_proficiency: float = Field(..., ge=0.0, le=5.0)
    target_proficiency: float = Field(..., ge=0.0, le=5.0)
    gap: float
    career_relevance: float = Field(..., ge=0.0, le=1.0)
    market_relevance: float = Field(..., ge=0.0, le=100.0)
    dependency_importance: float = Field(..., ge=0.0, le=100.0)
    learning_feasibility: float = Field(..., ge=0.0, le=100.0)
    prerequisites: List[Dict[str, Any]] = []
    prerequisites_met: bool = True
    learning_effort_level: str = Field(..., description="LOW, MEDIUM, HIGH")
    estimated_planning_hours: int
    rationale: str
    is_market_fallback: bool = False
    market_signal_status: str = Field("OBSERVED", description="OBSERVED, FALLBACK_UNAVAILABLE, STALE, or EXPIRING_SOON")
    source_references: List[str] = []
    generated_at: str
    engine_version: str = "v2.0-adaptive"


class AdaptiveRoadmapMilestone(BaseModel):
    id: str
    title: str
    description: str
    skill_id: Optional[str] = None
    skill_name: Optional[str] = None
    milestone_type: str = Field(..., description="concept, practical_project, assessment, or capstone")
    estimated_hours: float
    resources: List[Dict[str, Any]] = []
    is_completed: bool = False
    completed_at: Optional[str] = None


class AdaptiveRoadmapPhase(BaseModel):
    phase_id: str
    phase_order: int
    title: str
    description: str
    focus_skills: List[str] = []
    status: str = Field(..., description="NOT_STARTED, IN_PROGRESS, COMPLETED")
    milestones: List[AdaptiveRoadmapMilestone] = []
    project_suggestion: Optional[Dict[str, Any]] = None
    assessment_checkpoint: Optional[Dict[str, Any]] = None
    rationale: str


class AdaptiveRoadmapResponse(BaseModel):
    id: Optional[str] = None
    student_id: str
    career_id: str
    career_title: str = ""
    title: str = ""
    version: int = 1
    is_current: bool = True
    target_completion_weeks: int = 16
    status: str = "active"
    overall_progress_pct: float = 0.0
    phases: List[AdaptiveRoadmapPhase] = []
    recommendations_summary: List[Dict[str, Any]] = []
    ml_readiness_benchmark: Optional[float] = None
    market_demand_index: Optional[float] = None
    generated_at: str = ""
    engine_version: str = "v2.0-adaptive"
    provenance_note: str = ""


class RoadmapProgressUpdate(BaseModel):
    milestone_id: str
    is_completed: bool


class RoadmapHistoryResponse(BaseModel):
    student_id: str
    career_id: str
    total_versions: int
    versions: List[AdaptiveRoadmapResponse]


class RecommendationFeedbackCreate(BaseModel):
    skill_id: str
    career_id: str
    feedback_type: str = Field(..., description="HELPFUL, NOT_HELPFUL, ALREADY_KNOW_THIS, TOO_DIFFICULT, NOT_RELEVANT")
    notes: Optional[str] = None


class RecommendationFeedbackResponse(BaseModel):
    id: Optional[str] = None
    student_id: str
    skill_id: str
    career_id: str
    feedback_type: str
    notes: Optional[str] = None
    created_at: str
    status: str = "persisted"
