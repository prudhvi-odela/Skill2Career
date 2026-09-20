"""
Skill2Career - Phase 09C Career Readiness & Adaptive Forecasting Schemas
Pydantic schemas for evidence-grounded career interpretation, alignment dimensions,
competency coverage, readiness factors, strengths, gaps, and next actions.
"""

from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class ReadinessFactorCategory(str, Enum):
    SKILL_ALIGNMENT = "SKILL_ALIGNMENT"
    EVIDENCE_COVERAGE = "EVIDENCE_COVERAGE"
    LEARNING_TRAJECTORY = "LEARNING_TRAJECTORY"
    PROJECT_EXPERIENCE = "PROJECT_EXPERIENCE"
    ASSESSMENT_SUPPORT = "ASSESSMENT_SUPPORT"
    CERTIFICATION_SUPPORT = "CERTIFICATION_SUPPORT"
    MARKET_ALIGNMENT = "MARKET_ALIGNMENT"


class FactorImpactType(str, Enum):
    POSITIVE = "POSITIVE"
    LIMITING = "LIMITING"
    NEUTRAL = "NEUTRAL"


class MLReadinessBenchmark(BaseModel):
    readiness_score: float = Field(..., description="Authoritative ML predicted readiness percentage (5.0 - 99.0)")
    readiness_tier: str = Field(..., description="Classification tier (e.g. Job Ready, Strong Candidate, Developing)")
    is_job_ready: bool = Field(..., description="Whether score meets the >= 75.0 benchmark")
    model_version: str = Field(..., description="Registered ML model version tag")
    confidence_margin: float = Field(..., description="Measured test MAE confidence margin (e.g. +/- 2.2)")
    model_algorithm: str = Field(default="LinearRegression", description="Algorithm name used for prediction")
    interpretation_note: str = Field(
        default="Synthetic competency benchmark evaluated by trained ML inference pipeline; does not constitute an employment guarantee.",
        description="Scientific interpretation disclaimer"
    )


class CareerSkillAlignment(BaseModel):
    required_skill_count: int = Field(..., description="Total skills required for target career role")
    covered_skill_count: int = Field(..., description="Count of required skills where student has demonstrated non-zero proficiency")
    proficient_skill_count: int = Field(..., description="Count of required skills where student meets or exceeds target level")
    missing_skill_count: int = Field(..., description="Count of required skills with 0 demonstrated competency")
    coverage_percentage: float = Field(..., description="Percentage of required skills covered (0.0 - 100.0)")
    average_requirement_gap: float = Field(..., description="Average proficiency deficit across all required skills")
    critical_skill_gaps_count: int = Field(..., description="Count of high-criticality gaps requiring remediation")


class EvidenceCoverageSummary(BaseModel):
    career_relevant_skills_with_verified_evidence: int = Field(..., description="Count of required skills supported by verified evidence")
    career_relevant_skills_without_verified_evidence: int = Field(..., description="Count of required skills lacking verified evidence")
    verified_evidence_count: int = Field(..., description="Total verified artifacts relevant to target career")
    unverified_evidence_count: int = Field(..., description="Total unverified self-reported artifacts")
    rejected_evidence_count: int = Field(..., description="Total rejected/invalidated evidence items")
    evidence_coverage_ratio: float = Field(..., description="Ratio of required skills backed by verified evidence (0.0 - 1.0)")
    coverage_evaluation: str = Field(..., description="Descriptive evaluation of evidentiary backing (e.g. Well Grounded, Developing)")


class LearningTrajectorySummary(BaseModel):
    trajectory_direction: str = Field(..., description="Longitudinal trajectory vector (e.g. ACCELERATING, STEADY, STAGNANT)")
    trajectory_confidence: str = Field(..., description="Historical data completeness confidence (INSUFFICIENT_DATA, LOW, MEDIUM, HIGH)")
    overall_learning_velocity: float = Field(..., description="Normalized 0.0 - 5.0 velocity index")
    velocity_tier: str = Field(..., description="Velocity momentum tier")
    consistency_score: float = Field(..., description="Calendar study regularity score (0.0 - 100.0)")
    consistency_tier: str = Field(..., description="Consistency tier")
    current_streak_days: int = Field(..., description="Current active learning streak")
    stagnation_status: str = Field(..., description="Momentum diagnostic (ACTIVE_PROGRESS, STABLE_PROGRESS, POSSIBLE_STAGNATION)")
    top_improving_skills: List[str] = Field(default_factory=list, description="Competencies demonstrating measurable upward progression")
    total_snapshots: int = Field(..., description="Total historical snapshots recorded")
    has_sufficient_history: bool = Field(..., description="Whether longitudinal history meets minimal threshold (>= 2 snapshots)")


class MarketAlignmentSummary(BaseModel):
    career_id: str
    career_title: str
    demand_score: float = Field(..., description="Macro industry demand index (0.0 - 100.0)")
    trend_direction: str = Field(..., description="Observed market demand growth direction")
    market_signal_status: str = Field(..., description="Provenance state (OBSERVED, STALE, EXPIRING_SOON, FALLBACK_UNAVAILABLE)")
    market_source: str = Field(..., description="Authoritative external market data source")
    data_freshness: str = Field(..., description="Signal freshness classification")
    is_fallback: bool = Field(..., description="Whether neutral baseline fallback (75.0) is active")
    provenance_note: str = Field(..., description="Provenance description")


class ProjectAlignmentItem(BaseModel):
    project_id: str
    title: str
    technologies: List[str] = Field(default_factory=list)
    complexity_rating: float = Field(default=3.0)
    aligned_skills: List[str] = Field(default_factory=list)
    has_repository: bool = Field(default=False)
    has_live_demo: bool = Field(default=False)


class ProjectAlignmentSummary(BaseModel):
    career_relevant_projects_count: int
    covered_skills_via_projects: List[str] = Field(default_factory=list)
    projects: List[ProjectAlignmentItem] = Field(default_factory=list)
    project_evidence_gaps: List[str] = Field(default_factory=list, description="Required role skills not yet demonstrated in projects")


class AssessmentAlignmentItem(BaseModel):
    assessment_id: str
    skill_id: str
    skill_name: str
    score_percentage: float
    passed: bool
    verified_at: Optional[str] = None


class AssessmentAlignmentSummary(BaseModel):
    total_assessments_taken: int
    passed_assessments_count: int
    pass_rate_pct: float
    verified_skills_via_assessments: List[str] = Field(default_factory=list)
    assessments: List[AssessmentAlignmentItem] = Field(default_factory=list)


class CertificationAlignmentItem(BaseModel):
    certification_id: str
    name: str
    issuer: str
    aligned_skills: List[str] = Field(default_factory=list)
    is_verified: bool = Field(default=False)


class CertificationAlignmentSummary(BaseModel):
    total_certifications_count: int
    verified_certifications_count: int
    certifications: List[CertificationAlignmentItem] = Field(default_factory=list)


class CareerStrengthItem(BaseModel):
    skill_id: str
    skill_name: str
    proficiency: float
    required_proficiency: float
    surplus: float
    career_relevance: float
    category: str
    evidence_status: str = Field(..., description="VERIFIED, UNVERIFIED, or NO_EVIDENCE")
    supporting_evidence_count: int
    trajectory_status: str = Field(..., description="IMPROVING, STABLE, DECLINING, NEWLY_ACQUIRED, or INSUFFICIENT_HISTORY")
    strength_rationale: str


class CareerGapItem(BaseModel):
    skill_id: str
    skill_name: str
    current_proficiency: float
    required_proficiency: float
    gap: float
    career_relevance: float
    market_relevance: float
    category: str
    evidence_status: str
    trajectory_status: str
    priority_score: float
    priority_band: str
    is_mastered: bool
    gap_rationale: str


class CareerReadinessFactorItem(BaseModel):
    category: ReadinessFactorCategory
    factor_title: str
    impact_type: FactorImpactType
    description: str
    evidence_source: str


class CareerActionItem(BaseModel):
    action_id: str
    skill_id: str
    skill_name: str
    action_type: str = Field(..., description="STUDY_MODULE, PROJECT_BUILD, ASSESSMENT_VERIFICATION, PREREQUISITE_STUDY")
    priority_band: str
    priority_score: float
    learning_effort_level: str
    estimated_planning_hours: int
    rationale: str
    recommendation_id: Optional[str] = None


class CareerReadinessAnalysisResponse(BaseModel):
    student_id: str
    career_id: str
    career_title: str
    domain: str
    avg_salary_usd: float
    salary_provenance: str = "Industry Benchmark Data"
    
    # Core Components
    existing_ml_readiness: MLReadinessBenchmark
    skill_alignment: CareerSkillAlignment
    evidence_coverage: EvidenceCoverageSummary
    learning_trajectory: LearningTrajectorySummary
    market_alignment: MarketAlignmentSummary
    project_alignment: ProjectAlignmentSummary
    assessment_alignment: AssessmentAlignmentSummary
    certification_alignment: CertificationAlignmentSummary
    
    # Grounded Details
    strengths: List[CareerStrengthItem] = Field(default_factory=list)
    gaps: List[CareerGapItem] = Field(default_factory=list)
    readiness_factors: List[CareerReadinessFactorItem] = Field(default_factory=list)
    next_actions: List[CareerActionItem] = Field(default_factory=list)
    
    # Telemetry
    provenance_notes: List[str] = Field(default_factory=list)
    generated_at: str
    engine_version: str = "v1.0-career-readiness"
