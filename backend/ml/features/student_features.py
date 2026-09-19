"""
Skill2Career - Student Feature Engineering Module
Transforms student profile entities, embedded skills, projects, certifications,
and assessments into structured, validated feature vectors for model training and real-time inference.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd


STUDENT_NUMERICAL_FEATURES = [
    "gpa",
    "career_skill_match_pct",
    "total_skills_count",
    "avg_skill_proficiency",
    "core_cs_score",
    "projects_count",
    "avg_project_complexity",
    "certifications_count",
    "assessments_passed_pct",
    "weekly_study_hours",
    "learning_velocity_index"
]

STUDENT_CATEGORICAL_FEATURES = [
    "degree",
    "institution_tier"
]

ALL_STUDENT_FEATURES = STUDENT_NUMERICAL_FEATURES + STUDENT_CATEGORICAL_FEATURES
STUDENT_TARGET_COL = "readiness_score"

CORE_CS_SKILL_IDS = {"SK040", "SK041", "SK042"}  # DSA, OOP, System Design


class StudentFeatureExtractor:
    """
    Extracts, validates, and formats structured student features from raw inputs
    or live MongoDB document graphs for ML training and real-time inference.
    """

    @staticmethod
    def extract_features(
        student_skills: List[Dict[str, Any]],
        career_skill_match_pct: float,
        degree: str = "B.Tech Computer Science",
        institution_tier: int = 2,
        gpa: float = 8.0,
        projects: Optional[List[Dict[str, Any]]] = None,
        certifications: Optional[List[Dict[str, Any]]] = None,
        assessment_results: Optional[List[Dict[str, Any]]] = None,
        weekly_study_hours: float = 12.0,
        learning_velocity_index: float = 1.2
    ) -> pd.DataFrame:
        """
        Builds a single-row DataFrame suitable for passing into the trained scikit-learn Pipeline.
        """
        projects = projects or []
        certifications = certifications or []
        assessment_results = assessment_results or []

        # 1. Skill metrics
        total_skills_count = len(student_skills)
        if total_skills_count > 0:
            levels = [float(s.get("level", s.get("proficiency_level", 1.0))) for s in student_skills]
            avg_skill_proficiency = float(np.mean(levels))
        else:
            avg_skill_proficiency = 1.0

        # Core CS Score heuristic
        core_levels = [
            float(s.get("level", s.get("proficiency_level", 1.0)))
            for s in student_skills
            if s.get("skill_id") in CORE_CS_SKILL_IDS
        ]
        if core_levels:
            core_cs_score = round(float(np.mean(core_levels) / 5.0 * 100.0), 1)
        else:
            core_cs_score = 30.0

        # 2. Projects metrics
        projects_count = len(projects)
        if projects_count > 0:
            complexities = [float(p.get("complexity_rating", 3.0)) for p in projects]
            avg_project_complexity = float(np.mean(complexities))
        else:
            avg_project_complexity = 1.0

        # 3. Certifications metrics
        certifications_count = len(certifications)

        # 4. Assessment metrics
        if assessment_results:
            passed_count = sum(1 for a in assessment_results if a.get("passed", False) or a.get("score_pct", a.get("score", 0)) >= 70)
            assessments_passed_pct = round((passed_count / len(assessment_results)) * 100.0, 1)
        else:
            assessments_passed_pct = 70.0

        # Clamp and validate ranges
        gpa_val = float(np.clip(gpa, 0.0, 10.0))
        career_match_val = float(np.clip(career_skill_match_pct, 0.0, 100.0))
        avg_skill_val = float(np.clip(avg_skill_proficiency, 1.0, 5.0))
        core_cs_val = float(np.clip(core_cs_score, 0.0, 100.0))
        avg_proj_val = float(np.clip(avg_project_complexity, 1.0, 5.0))
        assess_val = float(np.clip(assessments_passed_pct, 0.0, 100.0))
        study_hours_val = float(np.clip(weekly_study_hours, 0.0, 80.0))
        velocity_val = float(np.clip(learning_velocity_index, 0.1, 5.0))
        tier_val = int(np.clip(institution_tier, 1, 3))

        feature_dict = {
            "gpa": [gpa_val],
            "career_skill_match_pct": [career_match_val],
            "total_skills_count": [int(total_skills_count)],
            "avg_skill_proficiency": [avg_skill_val],
            "core_cs_score": [core_cs_val],
            "projects_count": [int(projects_count)],
            "avg_project_complexity": [avg_proj_val],
            "certifications_count": [int(certifications_count)],
            "assessments_passed_pct": [assess_val],
            "weekly_study_hours": [study_hours_val],
            "learning_velocity_index": [velocity_val],
            "degree": [str(degree or "B.Tech Computer Science")],
            "institution_tier": [tier_val]
        }

        df_features = pd.DataFrame(feature_dict)
        # Ensure exact column ordering as trained
        return df_features[ALL_STUDENT_FEATURES]

    @classmethod
    def build_features_from_student_profile(
        cls,
        profile_doc: Dict[str, Any],
        career_skill_match_pct: float,
        projects: Optional[List[Dict[str, Any]]] = None,
        certifications: Optional[List[Dict[str, Any]]] = None,
        assessment_results: Optional[List[Dict[str, Any]]] = None,
        weekly_study_hours: Optional[float] = None,
        learning_velocity: Optional[float] = None
    ) -> pd.DataFrame:
        """
        Builds feature vector directly from MongoDB student domain objects with strict schema validation.
        """
        if not profile_doc:
            raise ValueError("Student profile document cannot be null or empty.")

        # Validate required academic fields
        gpa = profile_doc.get("gpa")
        if gpa is None:
            raise ValueError("Missing required academic feature 'gpa' in student profile.")

        degree = profile_doc.get("degree") or "B.Tech Computer Science"
        tier = profile_doc.get("institution_tier") or 2

        stats = profile_doc.get("statistics", {})
        study_hours = weekly_study_hours if weekly_study_hours is not None else float(stats.get("weekly_study_hours", 12.0))
        velocity = learning_velocity if learning_velocity is not None else float(stats.get("learning_velocity_index", 1.0))

        student_skills = profile_doc.get("skills", [])

        return cls.extract_features(
            student_skills=student_skills,
            career_skill_match_pct=career_skill_match_pct,
            degree=str(degree),
            institution_tier=int(tier),
            gpa=float(gpa),
            projects=projects or [],
            certifications=certifications or [],
            assessment_results=assessment_results or [],
            weekly_study_hours=float(study_hours),
            learning_velocity_index=float(velocity)
        )
