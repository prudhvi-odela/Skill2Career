"""
Skill2Career ML Preprocessing & Feature Engineering
Implements leak-free feature pipelines for Student Readiness and Trajectory models.
"""

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer


NUMERICAL_FEATURES = [
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

CATEGORICAL_FEATURES = [
    "degree",
    "institution_tier"
]

TARGET_COL = "readiness_score"


def create_preprocessor():
    """
    Creates a scikit-learn ColumnTransformer for numerical and categorical features.
    """
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                StandardScaler(),
                NUMERICAL_FEATURES
            ),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_FEATURES
            )
        ],
        remainder="drop"
    )
    return preprocessor


TRAJECTORY_NUM_FEATURES = [
    "initial_readiness",
    "weekly_study_hours",
    "learning_consistency",
    "cumulative_hours",
    "milestones_completed",
    "week"
]

TRAJECTORY_TARGET_COL = "readiness_at_week"


def create_trajectory_preprocessor():
    """
    Creates a preprocessor for the Longitudinal Trajectory Forecaster.
    """
    return StandardScaler()
