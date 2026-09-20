"""
Skill2Career - Phase 10 Career Forecasting & Scenario Intelligence Schemas
Pydantic schemas and enums for longitudinal skill growth forecasting, what-if scenario simulations,
competency bottleneck detection, time-to-target estimations, and uncertainty modeling.
"""

from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class ForecastHorizon(int, Enum):
    HORIZON_30 = 30
    HORIZON_60 = 60
    HORIZON_90 = 90
    HORIZON_180 = 180


class ScenarioType(str, Enum):
    CURRENT_TRAJECTORY = "CURRENT_TRAJECTORY"
    INCREASED_CONSISTENCY = "INCREASED_CONSISTENCY"
    GAP_FOCUSED = "GAP_FOCUSED"
    CUSTOM = "CUSTOM"


class SkillGrowthStatus(str, Enum):
    PROJECTED_IMPROVEMENT = "PROJECTED_IMPROVEMENT"
    PROJECTED_STABILITY = "PROJECTED_STABILITY"
    PROJECTED_SLOWDOWN = "PROJECTED_SLOWDOWN"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class BottleneckReason(str, Enum):
    HIGH_SKILL_GAP = "HIGH_SKILL_GAP"
    PREREQUISITE_BLOCKER = "PREREQUISITE_BLOCKER"
    LOW_LEARNING_VELOCITY = "LOW_LEARNING_VELOCITY"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    STAGNATING_SKILL = "STAGNATING_SKILL"
    HIGH_CAREER_RELEVANCE = "HIGH_CAREER_RELEVANCE"


class ForecastUncertainty(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class ProjectedSkillGrowthItem(BaseModel):
    skill_id: str
    skill_name: str
    current_proficiency: float = Field(..., description="Observed current proficiency level [1.0, 5.0]")
    projected_proficiency: float = Field(..., description="Projected future proficiency level [1.0, 5.0]")
    projected_change: float = Field(..., description="Projected delta over horizon")
    target_proficiency: float = Field(..., description="Target role requirement level")
    remaining_gap: float = Field(..., description="Projected remaining deficit at end of horizon")
    status: SkillGrowthStatus
    growth_velocity_monthly: float = Field(..., description="Projected growth velocity (pts/30 days)")
    rationale: str


class CompetencyBottleneckItem(BaseModel):
    skill_id: str
    skill_name: str
    current_proficiency: float
    required_proficiency: float
    gap: float
    reason: BottleneckReason
    impact_severity: str = Field(..., description="CRITICAL, HIGH, or MODERATE")
    blocking_prerequisites: List[str] = Field(default_factory=list, description="List of unmet prerequisite skill IDs")
    explanation: str
    recommended_remediation: str


class TimeToTargetEstimate(BaseModel):
    target_career_title: str
    target_career_id: str
    estimated_weeks_range: str = Field(..., description="Estimated range, e.g. '8–12 weeks' or 'INSUFFICIENT_DATA'")
    min_weeks: Optional[int] = None
    max_weeks: Optional[int] = None
    analytical_confidence: ForecastUncertainty = Field(..., description="Analytical confidence based on data completeness (NOT a statistical confidence interval)")
    basis_factors: List[str] = Field(default_factory=list)
    scenario_name: str
    disclaimer: str = "Analytical competency estimate under scenario assumptions; does not evaluate or guarantee hiring, job offers, or employment timeline."


class ScenarioSimulationRequest(BaseModel):
    scenario_type: ScenarioType = Field(default=ScenarioType.CURRENT_TRAJECTORY)
    weekly_study_hours: Optional[float] = Field(default=12.0, ge=1.0, le=80.0)
    learning_days_per_week: Optional[int] = Field(default=4, ge=1, le=7)
    focus_skill_ids: Optional[List[str]] = Field(default_factory=list)
    forecast_horizon_days: Optional[int] = Field(default=90, ge=15, le=365)


class ScenarioSimulationResult(BaseModel):
    scenario_id: str
    scenario_type: ScenarioType
    scenario_name: str
    description: str
    assumptions: List[str] = Field(default_factory=list)
    projected_velocity: float
    projected_consistency: float
    projected_skill_changes: List[ProjectedSkillGrowthItem] = Field(default_factory=list)
    projected_gap_changes: Dict[str, float] = Field(default_factory=dict, description="Skill ID to remaining gap mapping")
    baseline_readiness_score: float
    projected_readiness_benchmark: float = Field(..., description="Simulated future ML readiness benchmark score")
    projected_readiness_delta: float
    uncertainty_margin_points: float = Field(default=2.2, description="Approximate model test MAE residual error margin (+/- 2.2 points); not a 95% statistical confidence interval")
    projected_range_low: float = Field(default=0.0, description="Lower prediction range bound")
    projected_range_high: float = Field(default=100.0, description="Upper prediction range bound")
    estimated_time_to_target: TimeToTargetEstimate
    bottlenecks: List[CompetencyBottleneckItem] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)


class CareerForecastResponse(BaseModel):
    forecast_id: str
    student_id: str
    career_id: str
    career_title: str
    domain: str
    created_at: str
    forecast_horizon_days: int
    
    # Baseline Observed State
    baseline_snapshot: Dict[str, Any] = Field(..., description="Point-in-time observed student state")
    observed_learning_velocity: float
    observed_consistency_score: float
    observed_streak_days: int
    observed_trajectory_direction: str
    total_historical_snapshots: int
    has_sufficient_history: bool
    
    # Projections & Bottlenecks
    skill_growth_projections: List[ProjectedSkillGrowthItem] = Field(default_factory=list)
    bottlenecks: List[CompetencyBottleneckItem] = Field(default_factory=list)
    time_to_target: TimeToTargetEstimate
    
    # Active Scenario Outcome
    active_scenario: ScenarioSimulationResult
    
    # Analytical Range & Margin (Model Error, Not 95% CI)
    prediction_uncertainty_margin: float = Field(default=2.2, description="Approximate model test MAE residual error margin in score points (+/- 2.2 points); not a 95% statistical confidence interval")
    projected_range_low: float = Field(default=0.0, description="Lower bound of projected readiness benchmark range")
    projected_range_high: float = Field(default=100.0, description="Upper bound of projected readiness benchmark range")
    
    # Metadata & Provenance
    assumptions: List[str] = Field(default_factory=list)
    uncertainty: ForecastUncertainty
    uncertainty_rationale: str
    source_provenance: List[str] = Field(default_factory=list)
    model_version: str = "v1.0-forecast"
    status: str = "COMPLETED"
    limitations: List[str] = Field(default_factory=list)


class ScenarioComparisonResponse(BaseModel):
    student_id: str
    career_id: str
    career_title: str
    baseline_readiness_score: float
    baseline_velocity: float
    scenarios: List[ScenarioSimulationResult] = Field(default_factory=list)
    comparison_summary: str
    provenance_disclaimer: str = "Scenario comparison simulates hypothetical learning trajectories under explicit assumptions. No scenario is declared objectively best."
