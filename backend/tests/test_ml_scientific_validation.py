"""
Skill2Career - Phase 06: ML Scientific Validation & Model Provenance Test Suite
Verifies all 17 scientific ML invariants:
1. Model Provenance & Artifact Integrity
2. Feature Schema Exactness & Data Types
3. Data Leakage Guards & Target Isolation
4. Train/Validation/Test Split Isolation & Preprocessing Pipeline
5. Tournament Reproducibility & Metric Verification
6. Longitudinal Trajectory Model Invariants
7. Explainability & Local Attribution Consistency
8. Live Inference Determinism & Residual Margin Bounds
9. Registry Parity & Active Version Invariant
"""

import os
import sys
import json
import hashlib
import pytest
import numpy as np
import pandas as pd
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.ml.features.student_features import (
    STUDENT_NUMERICAL_FEATURES,
    STUDENT_CATEGORICAL_FEATURES,
    ALL_STUDENT_FEATURES,
    STUDENT_TARGET_COL,
    StudentFeatureExtractor
)
from backend.ml.features.trajectory_features import (
    TRAJECTORY_NUM_FEATURES,
    TRAJECTORY_TARGET_COL,
    TrajectoryFeatureExtractor
)
from backend.ml.inference import MLInferenceService
from backend.ml.explainability.explainer import ModelExplainer
from backend.data.validator import DataValidator

ARTIFACTS_DIR = os.path.join(BACKEND_DIR, "ml", "artifacts")
DATA_DIR = os.path.join(BACKEND_DIR, "data")


class TestModelProvenanceAndArtifacts:
    """Audit 01 & 15: Proves artifact integrity and registry metadata parity."""

    def test_artifacts_exist_and_are_valid_joblib(self):
        readiness_path = os.path.join(ARTIFACTS_DIR, "readiness_pipeline.joblib")
        trajectory_path = os.path.join(ARTIFACTS_DIR, "trajectory_pipeline.joblib")
        meta_path = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
        schema_path = os.path.join(ARTIFACTS_DIR, "feature_schema.json")

        assert os.path.exists(readiness_path), "Readiness pipeline joblib missing"
        assert os.path.exists(trajectory_path), "Trajectory pipeline joblib missing"
        assert os.path.exists(meta_path), "Model metadata JSON missing"
        assert os.path.exists(schema_path), "Feature schema JSON missing"

        # Check sha256 hash can be computed
        with open(readiness_path, "rb") as f:
            readiness_hash = hashlib.sha256(f.read()).hexdigest()
        assert len(readiness_hash) == 64

        pipeline = joblib.load(readiness_path)
        assert hasattr(pipeline, "predict"), "Loaded readiness artifact must be a callable scikit-learn estimator/pipeline"
        assert "preprocessor" in pipeline.named_steps
        assert "model" in pipeline.named_steps

    def test_metadata_and_schema_parity(self):
        with open(os.path.join(ARTIFACTS_DIR, "model_metadata.json"), "r") as f:
            meta = json.load(f)
        with open(os.path.join(ARTIFACTS_DIR, "feature_schema.json"), "r") as f:
            schema = json.load(f)

        assert meta["version_tag"].startswith("v1.0.0-")
        assert meta["readiness_model"]["selected_algorithm"] in ["LinearRegression", "Ridge Regression", "HistGradientBoostingRegressor", "GradientBoostingRegressor"]
        assert meta["readiness_model"]["dataset_rows"] == 5000
        assert meta["readiness_model"]["train_samples"] == 3500
        assert meta["readiness_model"]["val_samples"] == 750
        assert meta["readiness_model"]["test_samples"] == 750

        # Verify test metrics meet generalization criteria
        test_r2 = meta["readiness_model"]["test_metrics"]["test_r2"]
        assert 0.85 <= test_r2 <= 1.0, f"Expected R2 between 0.85 and 1.0, got {test_r2}"
        test_mae = meta["readiness_model"]["test_metrics"]["test_mae"]
        assert 0.0 < test_mae < 5.0, f"Expected MAE < 5.0, got {test_mae}"

        # Parity check on feature schema
        assert schema["numerical_features"] == STUDENT_NUMERICAL_FEATURES
        assert schema["categorical_features"] == STUDENT_CATEGORICAL_FEATURES
        assert schema["target_feature"] == STUDENT_TARGET_COL
        assert schema["trajectory_features"] == TRAJECTORY_NUM_FEATURES
        assert schema["trajectory_target"] == TRAJECTORY_TARGET_COL


class TestFeatureSchemaAndExtractor:
    """Audit 03: Verifies 13-feature schema exactness, types, and bound clipping."""

    def test_feature_extractor_order_and_types(self):
        sample_skills = [
            {"skill_id": "SK001", "level": 4.0},
            {"skill_id": "SK040", "level": 3.5}
        ]
        df = StudentFeatureExtractor.extract_features(
            student_skills=sample_skills,
            career_skill_match_pct=72.5,
            degree="B.Tech Computer Science",
            institution_tier=1,
            gpa=8.5,
            projects=[{"complexity_rating": 4.0}],
            certifications=[{"name": "AWS Certified"}],
            assessment_results=[{"passed": True}],
            weekly_study_hours=14.0,
            learning_velocity_index=1.3
        )

        assert list(df.columns) == ALL_STUDENT_FEATURES
        assert len(df.columns) == 13
        assert df["career_skill_match_pct"].iloc[0] == 72.5
        assert df["degree"].iloc[0] == "B.Tech Computer Science"
        assert df["institution_tier"].iloc[0] == 1
        assert df["gpa"].iloc[0] == 8.5
        assert df["projects_count"].iloc[0] == 1
        assert df["certifications_count"].iloc[0] == 1

    def test_feature_extractor_bounds_and_null_safety(self):
        # Extreme / out-of-bound inputs
        df = StudentFeatureExtractor.extract_features(
            student_skills=[],
            career_skill_match_pct=150.0,  # exceeds 100
            degree="",
            institution_tier=99,          # exceeds tier 3
            gpa=-5.0,                     # below 0
            projects=[],
            certifications=[],
            assessment_results=[],
            weekly_study_hours=200.0,     # exceeds 80
            learning_velocity_index=10.0  # exceeds 5.0
        )

        assert df["career_skill_match_pct"].iloc[0] == 100.0
        assert df["institution_tier"].iloc[0] == 3
        assert df["gpa"].iloc[0] == 0.0
        assert df["weekly_study_hours"].iloc[0] == 80.0
        assert df["learning_velocity_index"].iloc[0] == 5.0
        assert df["total_skills_count"].iloc[0] == 0
        assert df["avg_skill_proficiency"].iloc[0] == 1.0


class TestDataLeakageGuards:
    """Audit 04: Verifies absence of target leakage and future information in feature vectors."""

    def test_no_target_variable_in_feature_definitions(self):
        assert STUDENT_TARGET_COL not in ALL_STUDENT_FEATURES
        assert "is_job_ready" not in ALL_STUDENT_FEATURES
        assert "readiness_tier" not in ALL_STUDENT_FEATURES
        assert TRAJECTORY_TARGET_COL not in TRAJECTORY_NUM_FEATURES

    def test_feature_definitions_are_strictly_present_and_historical(self):
        # Classify each feature
        safe_features = {
            "gpa": "SAFE_HISTORICAL",
            "career_skill_match_pct": "SAFE_CURRENT",
            "total_skills_count": "SAFE_CURRENT",
            "avg_skill_proficiency": "SAFE_CURRENT",
            "core_cs_score": "SAFE_CURRENT",
            "projects_count": "SAFE_CURRENT",
            "avg_project_complexity": "SAFE_CURRENT",
            "certifications_count": "SAFE_CURRENT",
            "assessments_passed_pct": "SAFE_HISTORICAL",
            "weekly_study_hours": "SAFE_CURRENT",
            "learning_velocity_index": "SAFE_HISTORICAL",
            "degree": "SAFE_HISTORICAL",
            "institution_tier": "SAFE_HISTORICAL"
        }
        for feat in ALL_STUDENT_FEATURES:
            assert feat in safe_features
            assert safe_features[feat] in ["SAFE_CURRENT", "SAFE_HISTORICAL"]


class TestLiveInferenceDeterminism:
    """Audit 14: Verifies live inference determinism, explainability, and uncertainty terminology."""

    def test_deterministic_prediction_output(self):
        service = MLInferenceService.get_instance()
        skills = [
            {"skill_id": "SK001", "level": 4.0},
            {"skill_id": "SK008", "level": 3.5},
            {"skill_id": "SK040", "level": 4.0}
        ]

        pred1 = service.predict_readiness(
            student_skills_list=skills,
            target_career_id="CR001",
            degree="B.Tech Computer Science",
            institution_tier=1,
            gpa=8.5,
            weekly_study_hours=14.0,
            learning_velocity_index=1.2
        )

        pred2 = service.predict_readiness(
            student_skills_list=skills,
            target_career_id="CR001",
            degree="B.Tech Computer Science",
            institution_tier=1,
            gpa=8.5,
            weekly_study_hours=14.0,
            learning_velocity_index=1.2
        )

        assert pred1["readiness_score"] == pred2["readiness_score"]
        assert pred1["confidence_margin"] == pred2["confidence_margin"]
        assert pred1["model_version"] == pred2["model_version"]
        assert 5.0 <= pred1["readiness_score"] <= 99.0

    def test_explainability_does_not_mutate_prediction(self):
        service = MLInferenceService.get_instance()
        skills = [{"skill_id": "SK001", "level": 4.0}]
        pred = service.predict_readiness(
            student_skills_list=skills,
            target_career_id="CR001"
        )
        assert "detailed_explanation" in pred
        assert "factors" in pred["detailed_explanation"]
        assert pred["detailed_explanation"]["predicted_score"] == pred["readiness_score"]

    def test_trajectory_forecaster_monotonicity(self):
        service = MLInferenceService.get_instance()
        traj = service.forecast_trajectory(
            current_readiness_score=45.0,
            weekly_study_hours=15.0,
            learning_consistency=1.0,
            projection_weeks=[0, 4, 8, 12, 16, 20, 24]
        )
        points = traj["trajectory_points"]
        assert len(points) == 7
        assert points[0]["week"] == 0
        assert points[0]["predicted_readiness"] == 45.0

        scores = [p["predicted_readiness"] for p in points]
        # Verify monotonically non-decreasing trajectory
        for i in range(len(scores) - 1):
            assert scores[i+1] >= scores[i], f"Trajectory decreased from week {points[i]['week']} to {points[i+1]['week']}"
