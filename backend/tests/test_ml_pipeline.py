"""
Skill2Career - ML Pipeline, Validation, Feature Engineering & Inference Test Suite
Tests dataset quality audits, feature extraction, model tournament execution,
explainability generation, artifact loading, bounds checks, and API endpoints.
"""

import os
import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from backend.main import app
from backend.data.validator import DataValidator
from backend.ml.features.student_features import (
    StudentFeatureExtractor,
    STUDENT_NUMERICAL_FEATURES,
    STUDENT_CATEGORICAL_FEATURES
)
from backend.ml.features.trajectory_features import TrajectoryFeatureExtractor
from backend.ml.features.career_features import CareerFeatureExtractor
from backend.ml.explainability.explainer import ModelExplainer
from backend.ml.train import run_training_pipeline
from backend.ml.inference import MLInferenceService

client = TestClient(app)


def test_data_validator_clean_dataset():
    validator = DataValidator(target_column="readiness_score")
    data = {
        "gpa": [8.5, 7.2, 9.1, 6.8, 8.0, 7.9, 8.8, 9.0, 7.5, 8.2],
        "career_skill_match_pct": [80.0, 65.0, 90.0, 50.0, 75.0, 70.0, 85.0, 95.0, 60.0, 82.0],
        "total_skills_count": [10, 8, 14, 5, 9, 8, 12, 15, 7, 11],
        "avg_skill_proficiency": [3.8, 3.2, 4.5, 2.8, 3.5, 3.4, 4.0, 4.6, 3.0, 3.9],
        "core_cs_score": [75.0, 60.0, 90.0, 45.0, 70.0, 65.0, 80.0, 95.0, 55.0, 78.0],
        "projects_count": [3, 2, 4, 1, 3, 2, 4, 5, 2, 3],
        "avg_project_complexity": [3.5, 3.0, 4.5, 2.5, 3.5, 3.0, 4.0, 4.8, 2.8, 3.6],
        "certifications_count": [1, 0, 2, 0, 1, 1, 2, 3, 0, 1],
        "assessments_passed_pct": [80.0, 70.0, 90.0, 60.0, 75.0, 70.0, 85.0, 95.0, 65.0, 80.0],
        "weekly_study_hours": [15.0, 10.0, 20.0, 8.0, 12.0, 11.0, 18.0, 22.0, 9.0, 14.0],
        "learning_velocity_index": [1.2, 1.0, 1.5, 0.8, 1.1, 1.0, 1.3, 1.6, 0.9, 1.2],
        "degree": ["B.Tech CS"] * 10,
        "institution_tier": [2] * 10,
        "readiness_score": [78.5, 62.0, 88.0, 48.0, 72.0, 68.0, 82.0, 94.0, 58.0, 79.0]
    }
    df = pd.DataFrame(data)
    report = validator.validate_dataset(df, dataset_name="test_clean", save_report=False)
    assert report["is_valid"] is True
    assert report["status"] == "PASSED"
    assert report["rows"] == 10
    assert report["columns"] == 14
    assert len(report["errors"]) == 0


def test_data_validator_catches_errors_and_leakage():
    validator = DataValidator(target_column="readiness_score")
    # Missing required column & leaky feature
    data = {
        "gpa": [8.5, 7.2, 9.1, 6.8, 8.0],
        "leaky_target_clone": [78.5, 62.0, 88.0, 48.0, 72.0],  # Correlation 1.0
        "readiness_score": [78.5, 62.0, 88.0, 48.0, 72.0]
    }
    df = pd.DataFrame(data)
    report = validator.validate_dataset(
        df,
        dataset_name="test_leaky",
        expected_columns=["gpa", "missing_feat", "readiness_score"],
        save_report=False
    )
    assert report["is_valid"] is False
    assert any("Missing required columns" in e for e in report["errors"])
    assert any("Potential data leakage" in w or "leaky_target_clone" in str(w) for w in report["warnings"])


def test_student_feature_extractor():
    skills = [
        {"skill_id": "SK001", "level": 4.0},
        {"skill_id": "SK040", "level": 4.5},  # Core CS DSA
        {"skill_id": "SK041", "level": 4.0},  # Core CS OOP
    ]
    projects = [
        {"title": "P1", "complexity_rating": 4.0},
        {"title": "P2", "complexity_rating": 3.5}
    ]
    df = StudentFeatureExtractor.extract_features(
        student_skills=skills,
        career_skill_match_pct=82.5,
        degree="B.Tech Computer Science",
        institution_tier=1,
        gpa=8.8,
        projects=projects,
        certifications=[{"name": "C1"}],
        assessment_results=[{"passed": True}, {"passed": True}],
        weekly_study_hours=16.0,
        learning_velocity_index=1.4
    )
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 1
    assert df["gpa"].iloc[0] == 8.8
    assert df["career_skill_match_pct"].iloc[0] == 82.5
    assert df["total_skills_count"].iloc[0] == 3
    assert df["projects_count"].iloc[0] == 2
    assert df["avg_project_complexity"].iloc[0] == 3.75
    assert df["certifications_count"].iloc[0] == 1
    assert df["assessments_passed_pct"].iloc[0] == 100.0


def test_trajectory_and_career_feature_extractors():
    # 1. Trajectory extractor
    rows = TrajectoryFeatureExtractor.build_trajectory_dataframe(
        initial_readiness=65.0,
        weekly_study_hours=14.0,
        learning_consistency=1.2,
        projection_weeks=[0, 4, 8, 12]
    )
    assert len(rows) == 4
    assert rows[0]["week"] == 0
    assert rows[0]["initial_readiness"] == 65.0
    assert rows[3]["week"] == 12
    assert rows[3]["cumulative_hours"] == 12 * 14.0

    # 2. Career feature extractor
    student_skills = [{"skill_id": "SK001", "level": 4.0}, {"skill_id": "SK002", "level": 3.0}]
    req_skills = [
        {"skill_id": "SK001", "required_level": 4.0, "importance": 1.0, "is_core": True},
        {"skill_id": "SK002", "required_level": 4.0, "importance": 0.8, "is_core": False},
        {"skill_id": "SK003", "required_level": 3.0, "importance": 0.9, "is_core": True}
    ]
    overlap = CareerFeatureExtractor.calculate_skill_overlap(student_skills, req_skills)
    assert "career_skill_match_pct" in overlap
    assert overlap["career_skill_match_pct"] > 0.0
    assert "SK003" in overlap["missing_core_skills"]


def test_model_explainer_local_instance():
    row = {
        "career_skill_match_pct": 85.0,
        "core_cs_score": 80.0,
        "projects_count": 3,
        "avg_project_complexity": 4.0,
        "assessments_passed_pct": 90.0,
        "weekly_study_hours": 15.0,
        "learning_velocity_index": 1.3
    }
    explanation = ModelExplainer.explain_instance(row, predicted_score=84.5)
    assert explanation["predicted_score"] == 84.5
    assert len(explanation["factors"]) >= 5
    assert len(explanation["top_positive_factors"]) > 0
    assert len(explanation["narrative_explanation"]) > 10


def test_ml_inference_service_readiness_and_trajectory():
    service = MLInferenceService.get_instance()
    skills = [
        {"skill_id": "SK001", "level": 4.0},
        {"skill_id": "SK002", "level": 4.0},
        {"skill_id": "SK040", "level": 4.0}
    ]
    # Test readiness prediction
    pred = service.predict_readiness(
        student_skills_list=skills,
        target_career_id="CR001",
        degree="B.Tech Computer Science",
        institution_tier=2,
        gpa=8.2,
        weekly_study_hours=14.0
    )
    assert 0.0 <= pred["readiness_score"] <= 100.0
    assert isinstance(pred["is_job_ready"], bool)
    assert "model_version" in pred
    assert len(pred["feature_contributions"]) > 0

    # Test trajectory forecasting
    traj = service.forecast_trajectory(current_readiness_score=pred["readiness_score"], weekly_study_hours=15.0)
    assert len(traj["trajectory_points"]) == 7
    # Monotonicity check
    scores = [p["predicted_readiness"] for p in traj["trajectory_points"]]
    assert all(scores[i] <= scores[i+1] for i in range(len(scores)-1))


def test_ml_admin_api_endpoints():
    # 1. Datasets list
    d_res = client.get("/api/v1/ml/datasets")
    assert d_res.status_code == 200
    datasets = d_res.json()
    assert len(datasets) > 0
    assert any("student_profiles_training" in d["id"] for d in datasets)

    # 2. Quality report
    q_res = client.get("/api/v1/ml/datasets/student_profiles_training/quality")
    assert q_res.status_code == 200
    q_data = q_res.json()
    assert q_data["status"] == "PASSED"
    assert q_data["rows"] >= 1000

    # 3. Model versions list
    v_res = client.get("/api/v1/ml/versions")
    assert v_res.status_code == 200
    versions = v_res.json()
    assert len(versions) > 0

    # 4. Feature importance
    f_res = client.get("/api/v1/ml/feature-importance")
    assert f_res.status_code == 200
    feats = f_res.json()
    assert len(feats) > 0
    assert feats[0]["normalized_pct"] > 0
