"""
Skill2Career Curriculum & Education Onboarding Schemas
Pydantic schemas for academic programs, branches, subjects, diagnostic baselines,
personalized learning paths, and student learning profiles.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AcademicProgramResponse(BaseModel):
    id: str
    program_code: str
    name: str  # e.g., B.Tech, BCA, MCA, B.S., M.S.
    duration_years: int
    description: str


class BranchResponse(BaseModel):
    id: str
    branch_code: str
    program_id: str
    name: str  # e.g., Computer Science & Engineering, ECE, Data Science
    category: str  # Engineering, Science, Computing, Technology
    description: str


class SubjectResourceItem(BaseModel):
    title: str
    source: str
    url: str
    resource_type: str  # Documentation, Tutorial, Course, Practice
    description: str


class SubjectResponse(BaseModel):
    id: str
    subject_code: str
    name: str
    branch_id: str
    program_id: str
    semester: int
    academic_year: int
    description: str
    is_core: bool
    canonical_skills: List[str] = []
    prerequisites: List[str] = []
    learning_resources: List[SubjectResourceItem] = []
    has_diagnostic_quiz: bool = False


class SubjectBaselineItem(BaseModel):
    subject_id: str
    subject_name: str
    rating_type: str  # "SELF_RATING", "ASSESSMENT", "SKIPPED"
    proficiency_level: float  # 1.0 to 5.0
    assessment_score: Optional[float] = None
    assessed_at: Optional[datetime] = None


class SubjectBaselineSubmitRequest(BaseModel):
    rating_type: str = "SELF_RATING"  # "SELF_RATING", "ASSESSMENT", "SKIPPED"
    proficiency_level: float = Field(default=1.0, ge=1.0, le=5.0)


class DiagnosticQuizQuestion(BaseModel):
    id: str
    question_text: str
    options: List[str]
    skill_id: str
    explanation: Optional[str] = None


class DiagnosticQuizResponse(BaseModel):
    subject_id: str
    subject_name: str
    total_questions: int
    time_limit_mins: int
    questions: List[DiagnosticQuizQuestion]


class DiagnosticSubmitRequest(BaseModel):
    answers: Dict[str, int]  # question_id -> chosen_option_index


class DiagnosticResultResponse(BaseModel):
    subject_id: str
    subject_name: str
    score: float
    passed: bool
    total_questions: int
    correct_count: int
    strong_topics: List[str] = []
    practice_needed: List[str] = []
    evidence_created: bool
    evidence_id: Optional[str] = None
    proficiency_level: float


class OnboardingCompleteRequest(BaseModel):
    program_id: str
    branch_id: str
    academic_year: int = Field(ge=1, le=5)
    interests: List[str] = []
    target_career_id: Optional[str] = None
    institution: Optional[str] = None
    weekly_study_hours: Optional[float] = 10.0


class OnboardingStatusResponse(BaseModel):
    is_onboarding_completed: bool
    program: Optional[str] = None
    branch: Optional[str] = None
    academic_year: Optional[int] = None
    target_career_id: Optional[str] = None
    target_career_title: Optional[str] = None
    total_subjects_count: int = 0
    baselined_subjects_count: int = 0


class StudentLearningProfileResponse(BaseModel):
    student_id: str
    full_name: str
    program: str
    branch: str
    academic_year: int
    institution: Optional[str] = None
    target_career_id: Optional[str] = None
    target_career_title: Optional[str] = None
    readiness_score: Optional[float] = None
    subject_strengths: List[Dict[str, Any]] = []
    subject_gaps: List[Dict[str, Any]] = []
    skill_strengths: List[Dict[str, Any]] = []
    skill_gaps: List[Dict[str, Any]] = []
    evidence_confidence: str  # "HIGH", "MEDIUM", "LOW", "INSUFFICIENT"
    total_evidence_count: int
    learning_history_summary: Dict[str, Any]
    interests: List[str] = []


class LearningPathMilestone(BaseModel):
    id: str
    step_number: int
    phase: str  # "Foundation", "Core Curriculum", "Advanced Specialization", "Career Readiness"
    subject_name: Optional[str] = None
    skill_id: str
    skill_name: str
    current_level: float
    target_level: float
    status: str  # "COMPLETED", "IN_PROGRESS", "UPCOMING", "LOCKED"
    prerequisites: List[str] = []
    recommended_resources: List[SubjectResourceItem] = []
    action_type: str  # "LEARN_SUBJECT", "PRACTICE_CODING", "TAKE_ASSESSMENT", "BUILD_PROJECT"


class PersonalizedLearningPathResponse(BaseModel):
    student_id: str
    target_career_title: Optional[str] = None
    branch_name: str
    milestones: List[LearningPathMilestone] = []
    total_milestones: int
    completed_milestones: int
    progress_percentage: float
