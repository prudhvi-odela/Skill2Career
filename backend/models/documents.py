"""
Skill2Career MongoDB Document Models
Typed definitions for all 16 MongoDB collections, embedded schemas, and serialization utilities.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, EmailStr


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ==================== Embedded Models ====================
class EmbeddedSkill(BaseModel):
    skill_id: str
    name: str
    category: str
    domain: str = "General"
    level: float = 1.0  # 1.0 to 5.0
    verified: bool = False
    verification_source: Optional[str] = "Self-Reported"
    years_experience: float = 0.5
    last_assessed_at: Optional[datetime] = None


class EmbeddedRequiredSkill(BaseModel):
    skill_id: str
    skill_name: str
    required_level: float = 3.0  # 1.0 to 5.0
    importance_weight: float = 0.8  # 0.1 to 1.0
    is_core: bool = True


class EmbeddedQuestion(BaseModel):
    id: str
    question_text: str
    options_json: List[str]
    correct_option_index: int
    explanation: Optional[str] = None


class EmbeddedRoadmapItem(BaseModel):
    id: str
    week: int
    skill_id: Optional[str] = None
    skill_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    estimated_hours: float = 5.0
    resources: List[Dict[str, str]] = []
    completed: bool = False
    completed_at: Optional[datetime] = None


# ==================== Top-level Document Models ====================
class UserDoc(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    hashed_password: str
    full_name: str
    role: str = "student"
    is_active: bool = True
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)


class StudentProfileDoc(BaseModel):
    id: Optional[str] = None
    user_id: str
    headline: Optional[str] = None
    bio: Optional[str] = None
    degree: str = "B.Tech Computer Science"
    institution: str = "University Institute of Technology"
    institution_tier: int = 2
    graduation_year: int = 2027
    gpa: float = 8.0
    target_career_id: Optional[str] = None
    target_career_title: Optional[str] = None
    skills: List[EmbeddedSkill] = []
    career_preferences: Dict[str, Any] = {}
    statistics: Dict[str, Any] = {
        "weekly_study_hours": 12.0,
        "learning_velocity_index": 1.0,
        "assessments_passed": 0,
        "projects_count": 0,
        "certifications_count": 0
    }
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)


class SkillDoc(BaseModel):
    id: Optional[str] = None
    skill_code: str  # e.g., SK001
    name: str
    aliases: List[str] = []
    category: str
    domain: str
    description: Optional[str] = None
    prerequisites: List[str] = []
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)


class CareerRoleDoc(BaseModel):
    id: Optional[str] = None
    career_code: str  # e.g., CR001
    title: str
    domain: str
    description: str
    required_skills: List[EmbeddedRequiredSkill] = []
    responsibilities: List[str] = []
    salary_information: Dict[str, Any] = {"average_usd": 100000.0, "currency": "USD"}
    market_metadata: Dict[str, Any] = {"min_exp_years": 0.0, "demand_tier": "High"}
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)
