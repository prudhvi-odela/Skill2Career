"""
Skill2Career ML Inference Service
Unified, production-ready inference interface for:
- Career Matching
- Skill Gap Analysis
- Real-time Job Readiness Prediction
- Longitudinal Trajectory & Future Readiness Forecasting
- Model Version Tracking & Metadata
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from career_matcher import CareerMatcher
from gap_analyzer import SkillGapAnalyzer
from preprocessor import NUMERICAL_FEATURES, CATEGORICAL_FEATURES, TRAJECTORY_NUM_FEATURES

ARTIFACTS_DIR = os.path.join(CURRENT_DIR, "artifacts")


class MLInferenceService:
    _instance = None

    def __init__(self):
        self.career_matcher = CareerMatcher()
        self.gap_analyzer = SkillGapAnalyzer()
        self.readiness_model = None
        self.trajectory_model = None
        self.metadata = {}
        self.load_models()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MLInferenceService()
        return cls._instance

    def load_models(self):
        """Loads serialized joblib pipelines and metadata into memory."""
        meta_path = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
        if os.path.exists(meta_path):
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)

        readiness_path = os.path.join(ARTIFACTS_DIR, "readiness_pipeline.joblib")
        if os.path.exists(readiness_path):
            self.readiness_model = joblib.load(readiness_path)

        trajectory_path = os.path.join(ARTIFACTS_DIR, "trajectory_pipeline.joblib")
        if os.path.exists(trajectory_path):
            self.trajectory_model = joblib.load(trajectory_path)

    def get_model_metadata(self):
        return self.metadata

    def match_careers(self, student_skills_list):
        return self.career_matcher.match_student_to_careers(student_skills_list)

    def analyze_skill_gap(self, student_skills_list, target_career_id):
        return self.gap_analyzer.analyze_gap(student_skills_list, target_career_id)

    def predict_readiness(
        self,
        student_skills_list,
        target_career_id,
        degree="B.Tech Computer Science",
        institution_tier=2,
        gpa=8.0,
        projects_count=3,
        avg_project_complexity=3.5,
        certifications_count=1,
        assessments_passed_pct=75.0,
        weekly_study_hours=12.0,
        learning_velocity_index=1.2
    ):
        """
        Executes supervised ML model prediction for current job readiness.
        """
        if self.readiness_model is None:
            self.load_models()
            if self.readiness_model is None:
                raise RuntimeError("Readiness ML model pipeline is not trained or serialized.")

        # 1. Compute career skill match % via CareerMatcher
        matches = self.career_matcher.match_student_to_careers(student_skills_list)
        target_match = next((m for m in matches if m["career_id"] == target_career_id), None)
        career_skill_match_pct = target_match["match_percentage"] if target_match else 0.0

        # 2. Compute aggregate skill stats
        total_skills_count = len(student_skills_list)
        if total_skills_count > 0:
            avg_skill_prof = float(np.mean([float(s.get("level", s.get("proficiency_level", 1.0))) for s in student_skills_list]))
        else:
            avg_skill_prof = 1.0

        # Core CS Score heuristic from student skills (DSA, OOP, System Design)
        core_cs_ids = {"SK040", "SK041", "SK042"}
        core_levels = [float(s.get("level", 1.0)) for s in student_skills_list if s.get("skill_id") in core_cs_ids]
        core_cs_score = round(float(np.mean(core_levels) / 5.0 * 100.0), 1) if core_levels else 30.0

        # 3. Construct input DataFrame
        input_data = {
            "gpa": [float(gpa)],
            "career_skill_match_pct": [float(career_skill_match_pct)],
            "total_skills_count": [int(total_skills_count)],
            "avg_skill_proficiency": [float(avg_skill_prof)],
            "core_cs_score": [float(core_cs_score)],
            "projects_count": [int(projects_count)],
            "avg_project_complexity": [float(avg_project_complexity)],
            "certifications_count": [int(certifications_count)],
            "assessments_passed_pct": [float(assessments_passed_pct)],
            "weekly_study_hours": [float(weekly_study_hours)],
            "learning_velocity_index": [float(learning_velocity_index)],
            "degree": [str(degree)],
            "institution_tier": [int(institution_tier)]
        }
        df_input = pd.DataFrame(input_data)

        # 4. Predict via trained pipeline
        raw_pred = float(self.readiness_model.predict(df_input)[0])
        readiness_score = round(float(np.clip(raw_pred, 5.0, 99.0)), 1)
        is_ready = readiness_score >= 75.0

        # 5. Feature Breakdown for UX Transparency
        feature_contributions = [
            {"feature": "Skill Coverage for Role", "weight": 0.45, "score": career_skill_match_pct, "status": "Strong" if career_skill_match_pct >= 70 else "Needs Improvement"},
            {"feature": "Core CS & Algorithms", "weight": 0.15, "score": core_cs_score, "status": "Strong" if core_cs_score >= 70 else "Moderate"},
            {"feature": "Project Portfolio & Depth", "weight": 0.15, "score": min(100.0, projects_count * 15 + avg_project_complexity * 10), "status": "Good" if projects_count >= 2 else "Low"},
            {"feature": "Assessment Pass Rate", "weight": 0.10, "score": assessments_passed_pct, "status": "High" if assessments_passed_pct >= 75 else "Developing"},
            {"feature": "Verified Certifications", "weight": 0.08, "score": min(100.0, certifications_count * 30), "status": "Verified" if certifications_count > 0 else "None"},
            {"feature": "Study Velocity & Momentum", "weight": 0.07, "score": min(100.0, weekly_study_hours * 5 * learning_velocity_index), "status": "Active" if weekly_study_hours >= 10 else "Low"}
        ]

        version_tag = self.metadata.get("version_tag", "v1.0.0-production")

        return {
            "target_career_id": target_career_id,
            "readiness_score": readiness_score,
            "is_job_ready": is_ready,
            "readiness_tier": "Job Ready" if readiness_score >= 80 else ("Strong Candidate" if readiness_score >= 65 else ("Developing" if readiness_score >= 45 else "Early Stage")),
            "feature_contributions": feature_contributions,
            "model_version": version_tag,
            "model_algorithm": self.metadata.get("readiness_model", {}).get("selected_algorithm", "HistGradientBoostingRegressor")
        }

    def forecast_trajectory(
        self,
        current_readiness_score,
        weekly_study_hours=12.0,
        learning_consistency=1.0,
        projection_weeks=[0, 4, 8, 12, 16, 20, 24]
    ):
        """
        Projects future readiness score trajectory across specified week intervals.
        """
        if self.trajectory_model is None:
            self.load_models()
            if self.trajectory_model is None:
                raise RuntimeError("Trajectory ML model pipeline is not trained or serialized.")

        records = []
        cum_hours = 0
        milestones = 0

        for w in projection_weeks:
            if w > 0:
                cum_hours += int(w * weekly_study_hours)
                milestones += int(w / 3)

            row = pd.DataFrame([{
                "initial_readiness": float(current_readiness_score),
                "weekly_study_hours": float(weekly_study_hours),
                "learning_consistency": float(learning_consistency),
                "cumulative_hours": int(cum_hours),
                "milestones_completed": int(milestones),
                "week": int(w)
            }])

            if w == 0:
                pred_score = current_readiness_score
            else:
                pred_raw = float(self.trajectory_model.predict(row)[0])
                # Ensure monotonicity
                pred_score = max(current_readiness_score, round(float(np.clip(pred_raw, 0.0, 99.0)), 1))

            records.append({
                "week": w,
                "month": round(w / 4.0, 1),
                "cumulative_hours": cum_hours,
                "predicted_readiness": pred_score,
                "is_job_ready": pred_score >= 75.0,
                "milestones_target": milestones
            })

        return {
            "initial_readiness": current_readiness_score,
            "weekly_study_hours": weekly_study_hours,
            "learning_consistency": learning_consistency,
            "trajectory_points": records,
            "weeks_to_readiness": next((r["week"] for r in records if r["predicted_readiness"] >= 75.0), None),
            "model_version": self.metadata.get("version_tag", "v1.0.0-production")
        }
