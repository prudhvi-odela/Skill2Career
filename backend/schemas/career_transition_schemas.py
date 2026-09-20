"""
Skill2Career - Phase 11 Career Transition & Strategic Career Planning Schemas
Defines canonical Pydantic models for cross-career transition analysis, transferable competency classification,
prerequisite chains, transition gap remediation, milestones, scenario simulation, and multi-career comparison.
"""

from typing import Dict, Any, List, Optional
from enum import Enum
from pydantic import BaseModel, Field


class TransitionStatus(str, Enum):
    ANALYZED = "ANALYZED"
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class TransferabilityClassification(str, Enum):
    DIRECTLY_TRANSFERABLE = "DIRECTLY_TRANSFERABLE"
    PARTIALLY_TRANSFERABLE = "PARTIALLY_TRANSFERABLE"
    ADJACENT = "ADJACENT"
    NOT_YET_TRANSFERABLE = "NOT_YET_TRANSFERABLE"


class TransitionGapCategory(str, Enum):
    MISSING_SKILL = "MISSING_SKILL"
    LOW_PROFICIENCY = "LOW_PROFICIENCY"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    PREREQUISITE_BLOCKED = "PREREQUISITE_BLOCKED"
    STAGNATING_SKILL = "STAGNATING_SKILL"


class TransitionMilestoneStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    BLOCKED = "BLOCKED"
    READY = "READY"
    COMPLETED = "COMPLETED"


class TransitionScenarioType(str, Enum):
    DIRECT_TRANSITION = "DIRECT_TRANSITION"
    FOUNDATION_FIRST = "FOUNDATION_FIRST"
    GAP_FOCUSED = "GAP_FOCUSED"
    EVIDENCE_FOCUSED = "EVIDENCE_FOCUSED"


class CareerProfileRef(BaseModel):
    career_id: str
    title: str
    domain: str
    avg_salary_usd: float = 95000.0
    description: str = ""
    required_skills_count: int = 0


class TransferableSkillItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str = "General"
    student_level: float = 1.0
    source_importance: str = "CORE"
    target_importance: str = "CORE"
    target_level_required: float = 3.0
    transferability: TransferabilityClassification
    transferability_rationale: str
    supporting_evidence_count: int = 0
    verified_evidence_count: int = 0


class SkillOverlapSummary(BaseModel):
    shared_required_skills_count: int = 0
    shared_skill_ids: List[str] = Field(default_factory=list)
    source_only_skills_count: int = 0
    source_only_skill_ids: List[str] = Field(default_factory=list)
    target_only_skills_count: int = 0
    target_only_skill_ids: List[str] = Field(default_factory=list)
    shared_skill_proficiency_avg: float = 0.0
    target_skill_coverage_pct: float = 0.0


class TransitionGapItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str = "General"
    current_level: float = 0.0
    target_level_required: float = 3.0
    gap: float = 3.0
    gap_category: TransitionGapCategory
    is_critical: bool = False
    unmet_prerequisites: List[str] = Field(default_factory=list)
    priority_band: str = "HIGH"
    learning_effort_hours: int = 25
    remediation_rationale: str = ""


class PrerequisiteChainItem(BaseModel):
    target_skill_id: str
    target_skill_name: str
    prerequisite_chain: List[Dict[str, Any]] = Field(default_factory=list)
    is_blocked: bool = False
    blocking_skill_ids: List[str] = Field(default_factory=list)
    chain_completion_pct: float = 100.0


class TransferableEvidenceItem(BaseModel):
    evidence_id: str
    activity_id: Optional[str] = None
    title: str
    artifact_type: str
    skills_supported: List[str] = Field(default_factory=list)
    verification_status: str = "VERIFIED"
    is_relevant_to_target: bool = True
    relevance_rationale: str = ""


class TrajectoryContext(BaseModel):
    trajectory_direction: str = "STABLE"
    learning_velocity: float = 1.0
    consistency_score: float = 75.0
    current_streak_days: int = 0
    stagnation_flag: bool = False
    total_snapshots: int = 0
    has_sufficient_history: bool = True


class MarketContext(BaseModel):
    target_career_demand_score: float = 80.0
    target_career_trend: str = "stable"
    target_career_salary_usd: float = 95000.0
    source_id: str = "SRC_BLS_2026"
    freshness: str = "fresh"
    is_fallback: bool = False
    provenance_label: str = "VERIFIED_MARKET_SIGNAL"


class ForecastContext(BaseModel):
    projected_readiness_benchmark: float = 65.0
    time_to_target_weeks: int = 12
    uncertainty_level: str = "LOW"
    critical_bottlenecks_count: int = 0
    forecast_assumptions: List[str] = Field(default_factory=list)


class TransitionMilestone(BaseModel):
    milestone_id: str
    title: str
    description: str
    order: int
    required_skill_ids: List[str] = Field(default_factory=list)
    prerequisite_skill_ids: List[str] = Field(default_factory=list)
    current_state_summary: str
    target_state_summary: str
    supporting_evidence_count: int = 0
    recommended_action_ids: List[str] = Field(default_factory=list)
    estimated_effort_hours: int = 20
    dependencies: List[str] = Field(default_factory=list)
    status: TransitionMilestoneStatus = TransitionMilestoneStatus.NOT_STARTED


class StrategicTransitionPlan(BaseModel):
    plan_id: str
    student_id: str
    source_career_id: str
    target_career_id: str
    estimated_total_effort_hours: int = 0
    estimated_total_weeks: int = 0
    milestones: List[TransitionMilestone] = Field(default_factory=list)
    created_at: str
    status: TransitionStatus = TransitionStatus.PLANNED
    assumptions: List[str] = Field(default_factory=list)


class CareerTransitionAnalysisResponse(BaseModel):
    transition_id: str
    student_id: str
    source_career: CareerProfileRef
    target_career: CareerProfileRef
    created_at: str
    status: TransitionStatus = TransitionStatus.ANALYZED
    skill_overlap: SkillOverlapSummary
    transferable_skills: List[TransferableSkillItem] = Field(default_factory=list)
    transition_gaps: List[TransitionGapItem] = Field(default_factory=list)
    prerequisite_chains: List[PrerequisiteChainItem] = Field(default_factory=list)
    transferable_evidence: List[TransferableEvidenceItem] = Field(default_factory=list)
    transition_milestones: List[TransitionMilestone] = Field(default_factory=list)
    trajectory_context: TrajectoryContext
    market_context: MarketContext
    forecast_context: ForecastContext
    priority_actions: List[Dict[str, Any]] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    provenance: List[str] = Field(default_factory=list)
    limitations: str = "Transition analysis estimates competency pathways toward target requirements; it does not predict hiring or guarantee employment."


class MultiCareerTransitionComparisonRequest(BaseModel):
    target_career_ids: List[str]


class CareerTransitionComparisonItem(BaseModel):
    target_career_id: str
    target_career_title: str
    target_domain: str
    target_avg_salary_usd: float
    shared_skills_count: int
    target_only_skills_count: int
    transferable_skills_count: int
    transition_gaps_count: int
    critical_gaps_count: int
    target_skill_coverage_pct: float
    existing_ml_readiness_benchmark: float
    estimated_competency_effort_hours: int
    market_demand_score: float
    market_trend: str
    market_freshness: str
    time_to_target_weeks: int


class MultiCareerTransitionComparisonResponse(BaseModel):
    student_id: str
    source_career: CareerProfileRef
    comparisons: List[CareerTransitionComparisonItem] = Field(default_factory=list)
    comparison_summary: str
    disclaimer: str = "Comparative career transition metrics are factual and multi-dimensional. No career is ranked as objectively best; student preferences, effort feasibility, and interest must guide decisions."


class TransitionScenarioRequest(BaseModel):
    target_career_id: str
    scenario_type: TransitionScenarioType = TransitionScenarioType.DIRECT_TRANSITION
    weekly_study_hours: float = 12.0
    focus_skill_ids: Optional[List[str]] = None


class TransitionScenarioResult(BaseModel):
    scenario_type: TransitionScenarioType
    scenario_name: str
    target_career_id: str
    projected_milestones: List[TransitionMilestone] = Field(default_factory=list)
    estimated_weeks: int = 12
    projected_skill_coverage_pct: float = 0.0
    assumptions: List[str] = Field(default_factory=list)
    is_simulated: bool = True
    notice: str = "Simulated scenario results are calculated in-memory for planning purposes and do not mutate student state or create verified evidence."


class TransitionPlanUpdateRequest(BaseModel):
    status: Optional[TransitionStatus] = None
    custom_milestones: Optional[List[TransitionMilestone]] = None
    notes: Optional[str] = None


class TransitionHistoryItem(BaseModel):
    transition_id: str
    student_id: str
    source_career_id: str
    source_career_title: str
    target_career_id: str
    target_career_title: str
    created_at: str
    status: str
    milestones_count: int
    transferable_skills_count: int
    transition_gaps_count: int
