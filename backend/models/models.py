"""
Skill2Career Database Models (SQLAlchemy 2.0)
Defines all 20 relational entities with strict constraints, relationships, and indices.
"""

from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from backend.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


def get_utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student")  # student, admin, mentor
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    prediction_logs = relationship("PredictionLog", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    headline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    degree = Column(String(150), default="B.Tech Computer Science")
    institution = Column(String(255), default="University Institute of Technology")
    institution_tier = Column(Integer, default=2)
    graduation_year = Column(Integer, default=2027)
    gpa = Column(Float, default=8.0)
    target_career_id = Column(String(50), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True)
    weekly_study_hours = Column(Float, default=12.0)
    learning_velocity_index = Column(Float, default=1.0)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    user = relationship("User", back_populates="profile")
    target_career = relationship("CareerRole", back_populates="targeting_students")
    skills = relationship("StudentSkill", back_populates="profile", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="profile", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="profile", cascade="all, delete-orphan")
    learning_activities = relationship("LearningActivity", back_populates="profile", cascade="all, delete-orphan")
    learning_snapshots = relationship("LearningSnapshot", back_populates="profile", cascade="all, delete-orphan")
    assessment_results = relationship("AssessmentResult", back_populates="profile", cascade="all, delete-orphan")
    skill_gaps = relationship("SkillGap", back_populates="profile", cascade="all, delete-orphan")
    career_predictions = relationship("CareerPrediction", back_populates="profile", cascade="all, delete-orphan")
    readiness_predictions = relationship("ReadinessPrediction", back_populates="profile", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="profile", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(50), primary_key=True)  # e.g., SK001
    name = Column(String(150), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False)  # Languages, Frontend, Backend, AI & ML, etc.
    domain = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    aliases = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    student_skills = relationship("StudentSkill", back_populates="skill", cascade="all, delete-orphan")
    career_skills = relationship("CareerSkill", back_populates="skill", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="skill", cascade="all, delete-orphan")


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(50), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency_level = Column(Float, default=1.0)  # 1.0 to 5.0
    years_experience = Column(Float, default=0.5)
    is_verified = Column(Boolean, default=False)
    verification_source = Column(String(100), nullable=True)  # 'Assessment Quiz', 'GitHub Analysis', 'Self-Reported'
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    __table_args__ = (
        UniqueConstraint("profile_id", "skill_id", name="uq_student_skill"),
    )

    profile = relationship("StudentProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="student_skills")


class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(String(50), primary_key=True)  # e.g., CR001
    title = Column(String(150), unique=True, nullable=False, index=True)
    domain = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    min_exp_years = Column(Float, default=0.0)
    avg_salary_usd = Column(Float, default=100000.0)
    created_at = Column(DateTime, default=get_utc_now)

    targeting_students = relationship("StudentProfile", back_populates="target_career")
    required_skills = relationship("CareerSkill", back_populates="career", cascade="all, delete-orphan")
    skill_gaps = relationship("SkillGap", back_populates="career", cascade="all, delete-orphan")
    career_predictions = relationship("CareerPrediction", back_populates="career", cascade="all, delete-orphan")
    readiness_predictions = relationship("ReadinessPrediction", back_populates="career", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="career", cascade="all, delete-orphan")


class CareerSkill(Base):
    __tablename__ = "career_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    career_id = Column(String(50), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(50), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    required_level = Column(Float, default=3.0)  # 1.0 to 5.0
    importance_weight = Column(Float, default=0.8)  # 0.1 to 1.0

    __table_args__ = (
        UniqueConstraint("career_id", "skill_id", name="uq_career_skill"),
    )

    career = relationship("CareerRole", back_populates="required_skills")
    skill = relationship("Skill", back_populates="career_skills")


class LearningActivity(Base):
    __tablename__ = "learning_activities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    activity_type = Column(String(50), nullable=False)  # 'course', 'project', 'quiz', 'practice', 'reading'
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    hours_spent = Column(Float, default=1.0)
    completed_at = Column(DateTime, default=get_utc_now)

    profile = relationship("StudentProfile", back_populates="learning_activities")


class LearningSnapshot(Base):
    __tablename__ = "learning_snapshots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    snapshot_date = Column(DateTime, default=get_utc_now)
    total_skills = Column(Integer, default=0)
    avg_proficiency = Column(Float, default=0.0)
    readiness_score = Column(Float, default=0.0)
    cumulative_study_hours = Column(Float, default=0.0)

    profile = relationship("StudentProfile", back_populates="learning_snapshots")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    repo_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
    tech_stack = Column(String(255), nullable=False)  # comma-separated e.g. "React, FastAPI, PostgreSQL"
    complexity_rating = Column(Float, default=3.0)  # 1.0 to 5.0
    created_at = Column(DateTime, default=get_utc_now)

    profile = relationship("StudentProfile", back_populates="projects")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    issue_date = Column(String(50), nullable=True)
    credential_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)

    profile = relationship("StudentProfile", back_populates="certifications")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    skill_id = Column(String(50), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced
    time_limit_mins = Column(Integer, default=15)
    pass_score = Column(Float, default=70.0)
    created_at = Column(DateTime, default=get_utc_now)

    skill = relationship("Skill", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    results = relationship("AssessmentResult", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    options_json = Column(JSON, nullable=False)  # ["Option A", "Option B", "Option C", "Option D"]
    correct_option_index = Column(Integer, nullable=False)  # 0, 1, 2, 3
    explanation = Column(Text, nullable=True)

    assessment = relationship("Assessment", back_populates="questions")


class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    score_pct = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    proficiency_awarded = Column(Float, default=3.0)
    completed_at = Column(DateTime, default=get_utc_now)

    profile = relationship("StudentProfile", back_populates="assessment_results")
    assessment = relationship("Assessment", back_populates="results")


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(String(50), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(50), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    required_level = Column(Float, default=3.0)
    current_level = Column(Float, default=0.0)
    gap = Column(Float, default=3.0)
    priority = Column(String(50), default="High")  # Critical, High, Medium, Mastered
    status = Column(String(50), default="Missing")  # Missing, Developing, Proficient
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    profile = relationship("StudentProfile", back_populates="skill_gaps")
    career = relationship("CareerRole", back_populates="skill_gaps")
    skill = relationship("Skill")


class CareerPrediction(Base):
    __tablename__ = "career_predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(String(50), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(Float, nullable=False)
    rank = Column(Integer, default=1)
    model_version_id = Column(String(100), nullable=False)
    calculated_at = Column(DateTime, default=get_utc_now)

    profile = relationship("StudentProfile", back_populates="career_predictions")
    career = relationship("CareerRole", back_populates="career_predictions")


class ReadinessPrediction(Base):
    __tablename__ = "readiness_predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(String(50), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    readiness_score = Column(Float, nullable=False)
    is_job_ready = Column(Boolean, default=False)
    readiness_tier = Column(String(50), default="Developing")
    feature_breakdown_json = Column(JSON, nullable=True)
    model_version_id = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    profile = relationship("StudentProfile", back_populates="readiness_predictions")
    career = relationship("CareerRole", back_populates="readiness_predictions")


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(String(50), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    target_completion_weeks = Column(Integer, default=16)
    status = Column(String(50), default="active")  # active, completed, archived
    progress_pct = Column(Float, default=0.0)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    profile = relationship("StudentProfile", back_populates="roadmaps")
    career = relationship("CareerRole", back_populates="roadmaps")
    items = relationship("RoadmapItem", back_populates="roadmap", cascade="all, delete-orphan")


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(50), ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    week_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    recommended_resources_json = Column(JSON, nullable=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    roadmap = relationship("Roadmap", back_populates="items")
    skill = relationship("Skill")


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    model_name = Column(String(100), nullable=False)
    version_tag = Column(String(100), unique=True, nullable=False, index=True)
    algorithm = Column(String(100), nullable=False)
    metrics_json = Column(JSON, nullable=False)
    features_json = Column(JSON, nullable=False)
    artifact_path = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)


class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    model_version_id = Column(String(100), nullable=False)
    endpoint = Column(String(100), nullable=False)
    input_payload_json = Column(JSON, nullable=False)
    output_result_json = Column(JSON, nullable=False)
    latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship("User", back_populates="prediction_logs")
