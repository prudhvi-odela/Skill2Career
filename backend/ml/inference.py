"""
Skill2Career - ML Inference Service
Unified, production-ready inference interface for:
- Career Matching
- Skill Gap Analysis
- Real-time Job Readiness Prediction with Explainability
- Longitudinal Trajectory & Future Readiness Forecasting
- Active Model Tracking & Version Telemetry
"""

import os
import sys
import json
from typing import Dict, Any, List, Optional
import joblib
import pandas as pd
import numpy as np

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.ml.career_matcher import CareerMatcher
from backend.ml.gap_analyzer import SkillGapAnalyzer
from backend.ml.features.student_features import StudentFeatureExtractor
from backend.ml.features.trajectory_features import TrajectoryFeatureExtractor
from backend.ml.explainability.explainer import ModelExplainer

ARTIFACTS_DIR = os.path.join(CURRENT_DIR, "artifacts")


class MLInferenceService:
    _instance = None

    def __init__(self):
        self.career_matcher = CareerMatcher()
        self.gap_analyzer = SkillGapAnalyzer()
        self.readiness_model = None
        self.trajectory_model = None
        self.metadata = {}
        self.feature_schema = {}
        self.load_models()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MLInferenceService()
        return cls._instance

    def load_models(self):
        """Loads serialized joblib pipelines, schema, and metadata into memory."""
        meta_path = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "r") as f:
                    self.metadata = json.load(f)
            except Exception as e:
                print(f"[Warning] Could not load model metadata: {e}")

        schema_path = os.path.join(ARTIFACTS_DIR, "feature_schema.json")
        if os.path.exists(schema_path):
            try:
                with open(schema_path, "r") as f:
                    self.feature_schema = json.load(f)
            except Exception as e:
                print(f"[Warning] Could not load feature schema: {e}")

        readiness_path = os.path.join(ARTIFACTS_DIR, "readiness_pipeline.joblib")
        if os.path.exists(readiness_path):
            self.readiness_model = joblib.load(readiness_path)

        trajectory_path = os.path.join(ARTIFACTS_DIR, "trajectory_pipeline.joblib")
        if os.path.exists(trajectory_path):
            self.trajectory_model = joblib.load(trajectory_path)

    def get_model_metadata(self) -> Dict[str, Any]:
        return self.metadata

    def get_feature_importance(self) -> List[Dict[str, Any]]:
        return self.metadata.get("readiness_model", {}).get("feature_importance", [])

    def match_careers(self, student_skills_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return self.career_matcher.match_student_to_careers(student_skills_list)

    def analyze_skill_gap(self, student_skills_list: List[Dict[str, Any]], target_career_id: str) -> Dict[str, Any]:
        return self.gap_analyzer.analyze_gap(student_skills_list, target_career_id)

    def predict_readiness(
        self,
        student_skills_list: List[Dict[str, Any]],
        target_career_id: str,
        degree: str = "B.Tech Computer Science",
        institution_tier: int = 2,
        gpa: float = 8.0,
        projects: Optional[List[Dict[str, Any]]] = None,
        projects_count: Optional[int] = None,
        avg_project_complexity: Optional[float] = None,
        certifications: Optional[List[Dict[str, Any]]] = None,
        certifications_count: Optional[int] = None,
        assessment_results: Optional[List[Dict[str, Any]]] = None,
        assessments_passed_pct: Optional[float] = None,
        weekly_study_hours: float = 12.0,
        learning_velocity_index: float = 1.2
    ) -> Dict[str, Any]:
        """
        Executes supervised ML model prediction for current job readiness with explainability.
        """
        if self.readiness_model is None:
            self.load_models()
            if self.readiness_model is None:
                raise RuntimeError("Readiness ML model pipeline is not trained or serialized.")

        # 1. Compute career skill match % via CareerMatcher
        matches = self.career_matcher.match_student_to_careers(student_skills_list)
        target_match = next((m for m in matches if m["career_id"] == target_career_id), None)
        career_skill_match_pct = target_match["match_percentage"] if target_match else 0.0

        # Construct synthesised project / cert / assess objects if raw counts were passed
        if projects is None and projects_count is not None:
            projects = [{"complexity_rating": avg_project_complexity or 3.0} for _ in range(int(projects_count))]
        if certifications is None and certifications_count is not None:
            certifications = [{}] * int(certifications_count)

        # 2. Extract structured feature DataFrame using StudentFeatureExtractor
        df_input = StudentFeatureExtractor.extract_features(
            student_skills=student_skills_list,
            career_skill_match_pct=career_skill_match_pct,
            degree=degree,
            institution_tier=institution_tier,
            gpa=gpa,
            projects=projects or [],
            certifications=certifications or [],
            assessment_results=assessment_results or [],
            weekly_study_hours=weekly_study_hours,
            learning_velocity_index=learning_velocity_index
        )

        # If assessments_passed_pct was directly provided, override in DataFrame
        if assessments_passed_pct is not None:
            df_input["assessments_passed_pct"] = float(np.clip(assessments_passed_pct, 0.0, 100.0))
        if avg_project_complexity is not None and len(projects or []) > 0:
            df_input["avg_project_complexity"] = float(np.clip(avg_project_complexity, 1.0, 5.0))


        # 3. Predict via trained pipeline
        raw_pred = float(self.readiness_model.predict(df_input)[0])
        if np.isnan(raw_pred) or np.isinf(raw_pred):
            raise ValueError("Model produced an invalid prediction value (NaN/Inf).")

        readiness_score = round(float(np.clip(raw_pred, 5.0, 99.0)), 1)
        is_ready = readiness_score >= 75.0

        # 4. Generate local explainability and feature contributions
        input_row = df_input.iloc[0].to_dict()
        explanation = ModelExplainer.explain_instance(input_row, readiness_score)

        version_tag = self.metadata.get("version_tag", "v1.0.0-production")
        algorithm_name = self.metadata.get("readiness_model", {}).get("selected_algorithm", "LinearRegression")
        test_mae = self.metadata.get("readiness_model", {}).get("test_metrics", {}).get("test_mae", 2.2)

        # Legacy-compatible feature_contributions list for frontend widgets
        legacy_contributions = [
            {"feature": "Skill Coverage for Role", "weight": 0.45, "score": career_skill_match_pct, "status": "Strong" if career_skill_match_pct >= 70 else "Needs Improvement"},
            {"feature": "Core CS & Algorithms", "weight": 0.20, "score": float(input_row.get("core_cs_score", 30.0)), "status": "Strong" if float(input_row.get("core_cs_score", 30.0)) >= 70 else "Moderate"},
            {"feature": "Project Portfolio & Depth", "weight": 0.15, "score": min(100.0, len(projects or []) * 18 + float(input_row.get("avg_project_complexity", 1.0)) * 12), "status": "Good" if len(projects or []) >= 2 else "Low"},
            {"feature": "Assessment Pass Rate", "weight": 0.10, "score": float(input_row.get("assessments_passed_pct", 50.0)), "status": "High" if float(input_row.get("assessments_passed_pct", 50.0)) >= 75 else "Developing"},
            {"feature": "Study Velocity & Momentum", "weight": 0.10, "score": min(100.0, weekly_study_hours * 5 * learning_velocity_index), "status": "Active" if weekly_study_hours >= 10 else "Low"}
        ]

        return {
            "target_career_id": target_career_id,
            "readiness_score": readiness_score,
            "is_job_ready": is_ready,
            "readiness_tier": "Job Ready" if readiness_score >= 80 else ("Strong Candidate" if readiness_score >= 65 else ("Developing" if readiness_score >= 45 else "Early Stage")),
            "confidence_margin": round(test_mae, 1),
            "feature_contributions": legacy_contributions,
            "detailed_explanation": explanation,
            "model_version": version_tag,
            "model_algorithm": algorithm_name
        }

    def forecast_trajectory(
        self,
        current_readiness_score: float,
        weekly_study_hours: float = 12.0,
        learning_consistency: float = 1.0,
        projection_weeks: List[int] = [0, 4, 8, 12, 16, 20, 24]
    ) -> Dict[str, Any]:
        """
        Projects future readiness score trajectory across specified week intervals.
        """
        if self.trajectory_model is None:
            self.load_models()
            if self.trajectory_model is None:
                raise RuntimeError("Trajectory ML model pipeline is not trained or serialized.")

        trajectory_rows = TrajectoryFeatureExtractor.build_trajectory_dataframe(
            initial_readiness=current_readiness_score,
            weekly_study_hours=weekly_study_hours,
            learning_consistency=learning_consistency,
            projection_weeks=projection_weeks
        )

        records = []
        for r in trajectory_rows:
            w = r["week"]
            if w == 0:
                pred_score = round(current_readiness_score, 1)
            else:
                df_step = pd.DataFrame([r])
                raw_step = float(self.trajectory_model.predict(df_step)[0])
                pred_score = max(current_readiness_score, round(float(np.clip(raw_step, 0.0, 99.0)), 1))

            records.append({
                "week": w,
                "month": round(w / 4.0, 1),
                "cumulative_hours": int(r["cumulative_hours"]),
                "predicted_readiness": pred_score,
                "is_job_ready": pred_score >= 75.0,
                "milestones_target": r["milestones_completed"]
            })

        return {
            "initial_readiness": current_readiness_score,
            "weekly_study_hours": weekly_study_hours,
            "learning_consistency": learning_consistency,
            "trajectory_points": records,
            "weeks_to_readiness": next((r["week"] for r in records if r["predicted_readiness"] >= 75.0), None),
            "model_version": self.metadata.get("version_tag", "v1.0.0-production")
        }
