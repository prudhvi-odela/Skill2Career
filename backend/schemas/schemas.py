"""
Skill2Career Pydantic Request & Response Schemas
Type-safe API contracts with OpenAPI validation.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime


# ==================== Auth Schemas ====================
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: Optional[str] = "student"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


# ==================== Student Profile & Skills ====================
class StudentSkillBase(BaseModel):
    skill_id: str
    proficiency_level: float = Field(default=1.0, ge=1.0, le=5.0)
    years_experience: float = Field(default=0.5, ge=0.0)


class StudentSkillCreate(StudentSkillBase):
    pass


class StudentSkillUpdate(BaseModel):
    proficiency_level: float = Field(..., ge=1.0, le=5.0)
    years_experience: Optional[float] = None


class StudentSkillResponse(BaseModel):
    id: str
    skill_id: str
    skill_name: str
    category: str
    domain: str
    proficiency_level: float
    years_experience: float
    is_verified: bool
    verification_source: Optional[str] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdate(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    degree: Optional[str] = None
    major_or_branch: Optional[str] = None
    academic_year: Optional[str] = None
    institution: Optional[str] = None
    institution_tier: Optional[int] = Field(default=None, ge=1, le=3)
    graduation_year: Optional[int] = None
    gpa: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    target_career_id: Optional[str] = None
    weekly_study_hours: Optional[float] = Field(default=None, ge=0.0, le=80.0)
    interests: Optional[List[str]] = None


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    headline: Optional[str] = None
    bio: Optional[str] = None
    degree: Optional[str] = None
    major_or_branch: Optional[str] = None
    academic_year: Optional[str] = None
    institution: Optional[str] = None
    institution_tier: Optional[int] = None
    graduation_year: Optional[int] = None
    gpa: Optional[float] = None
    target_career_id: Optional[str] = None
    target_career_title: Optional[str] = None
    weekly_study_hours: Optional[float] = 0.0
    learning_velocity_index: Optional[float] = 0.0
    skills: List[StudentSkillResponse] = []
    interests: List[str] = []
    projects_count: int = 0
    certifications_count: int = 0
    experiences_count: int = 0
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== Work Experience & Internships ====================
class WorkExperienceCreate(BaseModel):
    company_name: str = Field(..., min_length=2)
    role: str = Field(..., min_length=2)
    employment_type: str = Field(default="INTERNSHIP")  # INTERNSHIP, FULL_TIME, PART_TIME, FREELANCE
    start_date: str = Field(..., description="YYYY-MM or YYYY-MM-DD")
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = ""
    responsibilities: List[str] = []
    skills_used: List[str] = []


class WorkExperienceUpdate(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    employment_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    skills_used: Optional[List[str]] = None


class WorkExperienceResponse(BaseModel):
    id: str
    student_id: str
    company_name: str
    role: str
    employment_type: str
    start_date: str
    end_date: Optional[str] = None
    is_current: bool
    description: Optional[str] = ""
    responsibilities: List[str] = []
    skills_used: List[str] = []
    verified: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== Career Schemas ====================
class CareerSkillItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    required_level: float
    importance_weight: float


class CareerRoleDetail(BaseModel):
    id: str
    title: str
    domain: str
    description: str
    min_exp_years: float
    avg_salary_usd: float
    required_skills: List[CareerSkillItem] = []


class CareerMatchItem(BaseModel):
    career_id: str
    career_title: str
    domain: str
    avg_salary_usd: float
    match_percentage: float
    fit_category: str
    rank: int
    matched_skills_count: int
    total_required_skills: int
    matched_skills: List[Dict[str, Any]] = []
    missing_skills: List[Dict[str, Any]] = []


# ==================== Analysis & ML Schemas ====================
class GapItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    domain: str
    required_level: float
    current_level: float
    gap: float
    importance: float
    priority: str
    status: str
    estimated_hours: int


class SkillGapResponse(BaseModel):
    career_id: str
    career_title: str
    domain: str
    coverage_percentage: float
    gap_percentage: float
    total_skills_required: int
    proficient_count: int
    developing_count: int
    missing_count: int
    estimated_remediation_hours: int
    gaps: List[GapItem]


class ReadinessPredictRequest(BaseModel):
    target_career_id: Optional[str] = None
    custom_skills: Optional[List[Dict[str, Any]]] = None  # Optional override for sandbox simulations


class ReadinessPredictResponse(BaseModel):
    prediction_id: Optional[str] = None
    target_career_id: str
    career_title: str
    career: Optional[Dict[str, Any]] = None
    readiness_score: float
    is_job_ready: bool
    readiness_tier: str
    feature_contributions: List[Dict[str, Any]] = []
    feature_breakdown: List[Dict[str, Any]] = []
    top_strengths: List[Dict[str, Any]] = []
    top_gaps: List[Dict[str, Any]] = []
    confidence_margin: Optional[float] = None
    model_version: str
    model_algorithm: str
    ai_explanation: Optional[str] = None
    generated_at: Optional[datetime] = None


class TrajectorySimulateRequest(BaseModel):
    weekly_study_hours: Optional[float] = Field(default=12.0, ge=1.0, le=60.0)
    learning_consistency: Optional[float] = Field(default=1.0, ge=0.5, le=2.0)
    target_career_id: Optional[str] = None


class TrajectoryPoint(BaseModel):
    week: int
    month: float
    cumulative_hours: int
    predicted_readiness: float
    is_job_ready: bool
    milestones_target: int


class TrajectoryForecastResponse(BaseModel):
    initial_readiness: float
    weekly_study_hours: float
    learning_consistency: float
    trajectory_points: List[TrajectoryPoint]
    weeks_to_readiness: Optional[int]
    model_version: str


# ==================== Projects & Certifications ====================
class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=2)
    description: str = Field(..., min_length=10)
    repo_url: Optional[str] = None
    live_url: Optional[str] = None
    tech_stack: str
    complexity_rating: float = Field(default=3.0, ge=1.0, le=5.0)


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    repo_url: Optional[str] = None
    live_url: Optional[str] = None
    tech_stack: Optional[str] = None
    complexity_rating: Optional[float] = Field(default=None, ge=1.0, le=5.0)


class ProjectResponse(BaseModel):
    id: str
    profile_id: str
    title: str
    description: str
    repo_url: Optional[str]
    live_url: Optional[str]
    tech_stack: str
    complexity_rating: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CertificationCreate(BaseModel):
    name: str = Field(..., min_length=2)
    issuer: str = Field(..., min_length=2)
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None


class CertificationUpdate(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None


class CertificationResponse(BaseModel):
    id: str
    profile_id: str
    name: str
    issuer: str
    issue_date: Optional[str]
    credential_url: Optional[str]
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== Assessments & Authoring ====================
class QuestionItem(BaseModel):
    id: str
    question_text: str
    options: List[str]
    explanation: Optional[str] = None


class QuestionCreate(BaseModel):
    question_text: str = Field(..., min_length=5)
    options: List[str] = Field(..., min_length=2)
    correct_option_index: Optional[int] = None
    correct_option: Optional[int] = None
    explanation: Optional[str] = ""
    order_idx: Optional[int] = 0

    def get_correct_option(self) -> int:
        if self.correct_option_index is not None:
            return self.correct_option_index
        if self.correct_option is not None:
            return self.correct_option
        return 0


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    options: Optional[List[str]] = None
    correct_option_index: Optional[int] = None
    correct_option: Optional[int] = None
    explanation: Optional[str] = None


class AssessmentCreate(BaseModel):
    skill_id: str = Field(..., description="Canonical skill code, e.g. SK001")
    title: str = Field(..., min_length=3)
    difficulty: str = Field(default="Intermediate")
    time_limit_minutes: Optional[int] = None
    time_limit_mins: Optional[int] = None
    pass_score: float = Field(default=70.0, ge=10.0, le=100.0)
    category: Optional[str] = None
    is_active: bool = True
    questions: List[QuestionCreate] = []

    def get_time_limit(self) -> int:
        return self.time_limit_minutes or self.time_limit_mins or 10


class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    difficulty: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    time_limit_mins: Optional[int] = None
    pass_score: Optional[float] = None
    is_active: Optional[bool] = None


class AssessmentDetailResponse(BaseModel):
    id: str
    skill_id: str
    skill_name: str
    title: str
    difficulty: str
    time_limit_mins: int
    pass_score: float
    total_questions: int
    is_active: bool = True
    questions: List[QuestionItem] = []


class AssessmentSubmitRequest(BaseModel):
    assessment_id: str
    answers: Dict[str, int]  # {question_id: selected_option_index}


class AssessmentResultResponse(BaseModel):
    assessment_id: str
    score_pct: float
    passed: bool
    pass_score: float
    proficiency_awarded: float
    skill_id: str
    skill_name: str
    correct_count: int
    total_questions: int
    explanation: Optional[str] = None


# ==================== Peer Reviews ====================
class PeerReviewRequestCreate(BaseModel):
    project_id: str
    requested_skills: List[str] = []
    skill_ids: List[str] = []
    notes: Optional[str] = None


class PeerReviewSubmit(BaseModel):
    rating: Optional[float] = None
    score: Optional[float] = None
    comment: str = Field(..., min_length=5)
    skills_verified: List[str] = []
    status: Optional[str] = None
    verification_status: Optional[str] = None

    def get_rating(self) -> float:
        return self.rating if self.rating is not None else (self.score if self.score is not None else 4.0)

    def get_status(self) -> str:
        return self.status or self.verification_status or "APPROVED"


class PeerReviewResponse(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    reviewer_id: str
    reviewer_name: Optional[str] = None
    project_id: str
    project_title: Optional[str] = None
    requested_skills: List[str] = []
    skills_verified: List[str] = []
    rating: Optional[float] = None
    comment: Optional[str] = None
    status: str  # PENDING, APPROVED, REJECTED
    created_at: datetime
    reviewed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== Roadmap ====================
class RoadmapItemResponse(BaseModel):
    id: str
    week_number: int
    title: str
    description: Optional[str]
    skill_id: Optional[str]
    skill_name: Optional[str]
    recommended_resources: List[Dict[str, str]] = []
    is_completed: bool
    completed_at: Optional[datetime] = None


class RoadmapResponse(BaseModel):
    id: str
    career_id: str
    career_title: str
    title: str
    target_completion_weeks: int
    status: str
    progress_pct: float
    items: List[RoadmapItemResponse] = []


class RoadmapItemToggle(BaseModel):
    is_completed: bool


# ==================== Model Versions & ML Admin ====================
class ModelVersionItem(BaseModel):
    id: str
    model_name: str
    version_tag: str
    algorithm: str
    metrics: Dict[str, Any]
    features: List[str]
    is_active: bool
    created_at: datetime


class DatasetListItem(BaseModel):
    id: str
    filename: str
    filepath: str
    size_bytes: int
    row_count: int
    columns_count: int
    has_quality_report: bool


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    importance_std: float
    normalized_pct: float
