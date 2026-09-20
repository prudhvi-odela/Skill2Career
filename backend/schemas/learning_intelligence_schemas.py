"""
Skill2Career - Learning Intelligence & Trajectory Schemas (Phase 09B)
Defines structured data models for learning trajectory, velocity, consistency,
stagnation detection, and evidence-driven skill progression.
"""

from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class StagnationStatus(str, Enum):
    INSUFFICIENT_HISTORY = "INSUFFICIENT_HISTORY"
    ACTIVE_PROGRESS = "ACTIVE_PROGRESS"
    STABLE_PROGRESS = "STABLE_PROGRESS"
    POSSIBLE_STAGNATION = "POSSIBLE_STAGNATION"
    RECENTLY_RESTARTED = "RECENTLY_RESTARTED"


class SkillProgressionStatus(str, Enum):
    IMPROVING = "IMPROVING"
    STABLE = "STABLE"
    DECLINING = "DECLINING"
    NEWLY_ACQUIRED = "NEWLY_ACQUIRED"
    INSUFFICIENT_HISTORY = "INSUFFICIENT_HISTORY"


class TrajectoryDirection(str, Enum):
    ACCELERATING = "ACCELERATING"
    STEADY = "STEADY"
    DECELERATING = "DECELERATING"
    STAGNANT = "STAGNANT"
    INSUFFICIENT_HISTORY = "INSUFFICIENT_HISTORY"


class TrajectoryConfidence(str, Enum):
    """
    Analytical confidence representing data completeness, timestamp quality,
    and evidence coverage. (NOT ML model prediction confidence).
    """
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class SkillProgressionItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    current_proficiency: float
    previous_proficiency: Optional[float] = None
    absolute_change: float = 0.0
    status: SkillProgressionStatus
    evidence_count: int = 0
    verified_evidence_count: int = 0
    is_verified: bool = False
    observation_count: int = 1
    last_updated_at: Optional[str] = None
    progression_summary: str


class LearningVelocityMetrics(BaseModel):
    status: str = Field(description="SUFFICIENT_HISTORY or INSUFFICIENT_HISTORY")
    minimum_observations_met: bool
    skill_progression_velocity: float = Field(description="Proficiency points per 30-day window")
    evidence_velocity: float = Field(description="Verified evidence artifacts per 30-day window")
    learning_activity_velocity: float = Field(description="Learning activities completed per week")
    overall_learning_velocity: float = Field(description="Normalized velocity index (0.0 to 5.0 scale)")
    velocity_tier: str = Field(description="High Momentum, Steady, Low, or Insufficient History")
    elapsed_days: float = 0.0
    observation_count: int = 0
    analysis_notes: str


class ConsistencyMetrics(BaseModel):
    consistency_score: float = Field(description="Bounded consistency score (0.0 to 100.0)")
    consistency_tier: str = Field(description="High Consistency, Moderate, Developing, or Low")
    active_learning_days_count: int
    current_streak_days: int
    longest_streak_days: int
    study_frequency_per_week: float
    inactive_gap_days: int
    weekly_activity_distribution: Dict[str, int] = Field(
        default_factory=dict,
        description="Day of week activity counts"
    )
    analysis_notes: str


class StagnationMetrics(BaseModel):
    status: StagnationStatus
    days_since_last_progression: Optional[int] = None
    days_since_last_activity: Optional[int] = None
    meaningful_skill_progression_detected: bool
    analysis_summary: str
    recommended_intervention: str


class TrajectoryPoint(BaseModel):
    timestamp: str
    date_label: str
    skill_count: int
    verified_skill_count: int
    average_proficiency: float
    projects_count: int
    assessments_count: int
    certifications_count: int
    learning_activity_count: int
    verified_evidence_count: int
    readiness_score: Optional[float] = None
    snapshot_source: str = "automated_snapshot"


class SkillLevelHistoryItem(BaseModel):
    student_id: str
    skill_id: str
    skill_name: str
    previous_proficiency: float
    new_proficiency: float
    change: float
    timestamp: str
    source_evidence_ids: List[str] = Field(default_factory=list)
    verification_status: str
    reason: str
    engine_version: str = "v1.0-intelligence"


class DailyLearningLogRequest(BaseModel):
    topic: str = Field(min_length=1)
    duration_minutes: int = Field(ge=5, le=600)
    activity_type: str = "SELF_STUDY"  # SELF_STUDY, VIDEO_LECTURE, CODING_PRACTICE, PROJECT_WORK, READING
    confidence_level: int = Field(default=3, ge=1, le=5)
    notes: Optional[str] = None
    skills: List[str] = []
    take_quick_check: bool = False


class QuickCheckQuestion(BaseModel):
    id: str
    question_text: str
    options: List[str]
    skill_id: str
    explanation: Optional[str] = None


class DailyLearningLogResponse(BaseModel):
    session_id: str
    topic: str
    duration_minutes: int
    activity_type: str
    confidence_level: int
    logged_at: str
    quick_check_offered: bool
    quick_check_questions: List[QuickCheckQuestion] = []


class QuickCheckSubmitRequest(BaseModel):
    session_id: str
    topic: str
    skills: List[str] = []
    answers: Dict[str, int]  # question_id -> chosen option index


class QuickCheckResultResponse(BaseModel):
    session_id: str
    score_percentage: float
    passed: bool
    total_questions: int
    correct_count: int
    strong_topics: List[str] = []
    weak_topics: List[str] = []
    recommendation: str
    evidence_recorded: bool
    evidence_id: Optional[str] = None


class LearningTrajectoryOverviewResponse(BaseModel):
    student_id: str
    generated_at: str
    total_snapshots: int
    trajectory_direction: TrajectoryDirection
    trajectory_confidence: TrajectoryConfidence
    confidence_rationale: str
    velocity: LearningVelocityMetrics
    consistency: ConsistencyMetrics
    stagnation: StagnationMetrics
    skill_progressions: List[SkillProgressionItem]
    top_improving_skills: List[str]
    trajectory_timeline: List[TrajectoryPoint]
    executive_insights: List[str]
    engine_version: str = "v1.0-intelligence"


