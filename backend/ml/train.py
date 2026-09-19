"""
Skill2Career - Model Training, Benchmarking & Registration Pipeline
Performs leakage-safe train/val/test splitting, compares baseline and candidate models,
evaluates generalization, computes explainability, and registers production artifacts.
"""

import os
import sys
import json
import time
import argparse
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Optional

import numpy as np
import pandas as pd
import joblib

# Ensure backend root is on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    HistGradientBoostingRegressor
)
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.pipeline import Pipeline

from backend.data.validator import DataValidator
from backend.ml.features.student_features import (
    STUDENT_NUMERICAL_FEATURES,
    STUDENT_CATEGORICAL_FEATURES,
    STUDENT_TARGET_COL
)
from backend.ml.features.trajectory_features import (
    TRAJECTORY_NUM_FEATURES,
    TRAJECTORY_TARGET_COL
)
from backend.ml.preprocessing.pipeline_builder import (
    build_tabular_preprocessor,
    build_trajectory_preprocessor
)
from backend.ml.explainability.explainer import ModelExplainer

BASE_DATA_DIR = os.path.join(BACKEND_DIR, "data")
RAW_DATA_DIR = os.path.join(BASE_DATA_DIR, "raw")
ARTIFACTS_DIR = os.path.join(CURRENT_DIR, "artifacts")
METRICS_DIR = os.path.join(CURRENT_DIR, "metrics")
EXPERIMENTS_DIR = os.path.join(CURRENT_DIR, "experiments")

for d in [ARTIFACTS_DIR, METRICS_DIR, EXPERIMENTS_DIR]:
    os.makedirs(d, exist_ok=True)


def train_and_evaluate_model(name: str, estimator, X_train, y_train, X_val, y_val, preprocessor) -> Dict[str, Any]:
    """Trains a pipeline on train split and evaluates strictly on validation split."""
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", estimator)
    ])
    start = time.time()
    pipeline.fit(X_train, y_train)
    fit_time = round(time.time() - start, 3)

    val_preds = pipeline.predict(X_val)
    val_r2 = round(float(r2_score(y_val, val_preds)), 4)
    val_mae = round(float(mean_absolute_error(y_val, val_preds)), 4)
    val_rmse = round(float(np.sqrt(mean_squared_error(y_val, val_preds))), 4)

    return {
        "model_name": name,
        "pipeline": pipeline,
        "fit_time_seconds": fit_time,
        "val_metrics": {
            "val_r2": val_r2,
            "val_mae": val_mae,
            "val_rmse": val_rmse
        }
    }


def run_training_pipeline(
    dataset_path: Optional[str] = None,
    trajectory_path: Optional[str] = None,
    target_column: str = STUDENT_TARGET_COL,
    register_mongo: bool = False
) -> Dict[str, Any]:
    start_time = time.time()
    print("=" * 70)
    print("Skill2Career ML Training Pipeline: Real AI/ML Tournament & Validation")
    print("=" * 70)

    # 1. Resolve Dataset Paths
    raw_path = dataset_path or os.path.join(RAW_DATA_DIR, "student_profiles_training.csv")
    if not os.path.exists(raw_path):
        raw_path = os.path.join(BASE_DATA_DIR, "student_profiles_training.csv")

    traj_raw_path = trajectory_path or os.path.join(RAW_DATA_DIR, "learning_trajectory_training.csv")
    if not os.path.exists(traj_raw_path):
        traj_raw_path = os.path.join(BASE_DATA_DIR, "learning_trajectory_training.csv")

    print(f"[Dataset] Loading student profiles from: {raw_path}")
    df_students = pd.read_csv(raw_path)

    # 2. Data Validation & Quality Report
    validator = DataValidator(target_column=target_column)
    quality_report = validator.validate_dataset(
        df_students,
        dataset_name="student_profiles_training",
        expected_columns=STUDENT_NUMERICAL_FEATURES + STUDENT_CATEGORICAL_FEATURES + [target_column]
    )
    print(f"[Quality] Rows: {quality_report['rows']}, Cols: {quality_report['columns']}, Status: {quality_report['status']}")
    if quality_report["errors"]:
        raise ValueError(f"Dataset validation failed with errors: {quality_report['errors']}")

    # 3. Leakage-Free 3-Way Split (70% Train, 15% Val, 15% Test)
    feature_cols = STUDENT_NUMERICAL_FEATURES + STUDENT_CATEGORICAL_FEATURES
    X = df_students[feature_cols]
    y = df_students[target_column]

    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.17647, random_state=42  # 0.17647 * 0.85 = 0.15
    )

    print(f"[Split] Train: {len(X_train)} (70%), Val: {len(X_val)} (15%), Test: {len(X_test)} (15%)")

    # 4. Preprocessor (Instantiated fresh, fit strictly inside pipeline on train fold)
    preprocessor = build_tabular_preprocessor(
        numerical_features=STUDENT_NUMERICAL_FEATURES,
        categorical_features=STUDENT_CATEGORICAL_FEATURES
    )

    # 5. Model Tournament: Baselines and Candidates
    models_to_evaluate = [
        ("DummyRegressor (Mean)", DummyRegressor(strategy="mean")),
        ("LinearRegression", LinearRegression()),
        ("Ridge Regression (alpha=1.0)", Ridge(alpha=1.0)),
        ("RandomForestRegressor", RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1)),
        ("GradientBoostingRegressor", GradientBoostingRegressor(n_estimators=100, learning_rate=0.08, max_depth=5, random_state=42)),
        ("HistGradientBoostingRegressor", HistGradientBoostingRegressor(max_iter=150, learning_rate=0.08, max_depth=6, random_state=42))
    ]

    tournament_results = []
    print("\n--- Running Model Tournament on Validation Split ---")
    for name, estimator in models_to_evaluate:
        res = train_and_evaluate_model(name, estimator, X_train, y_train, X_val, y_val, preprocessor)
        tournament_results.append(res)
        metrics = res["val_metrics"]
        print(f"  > {name:30s} | Val R2: {metrics['val_r2']:.4f} | Val MAE: {metrics['val_mae']:.4f} | Val RMSE: {metrics['val_rmse']:.4f}")

    # 6. Select Best Candidate based on Validation R2
    best_candidate = max(tournament_results, key=lambda x: x["val_metrics"]["val_r2"])
    best_name = best_candidate["model_name"]
    best_pipeline = best_candidate["pipeline"]
    print(f"\n[Winner] Selected Best Model: '{best_name}' with Validation R2 = {best_candidate['val_metrics']['val_r2']}")

    # 7. Evaluate Selected Model ONCE on Untouched Test Split
    test_preds = best_pipeline.predict(X_test)
    test_metrics = {
        "test_r2": round(float(r2_score(y_test, test_preds)), 4),
        "test_mae": round(float(mean_absolute_error(y_test, test_preds)), 4),
        "test_rmse": round(float(np.sqrt(mean_squared_error(y_test, test_preds))), 4)
    }
    print(f"[Untouched Test Evaluation] Test R2: {test_metrics['test_r2']} | Test MAE: {test_metrics['test_mae']} | Test RMSE: {test_metrics['test_rmse']}")

    # 8. Compute Explainability Metadata
    explainer = ModelExplainer(pipeline=best_pipeline, feature_names=feature_cols)
    feature_importance = explainer.compute_global_importance(X_val, y_val)

    # 9. Train Longitudinal Trajectory Model
    print(f"\n[Trajectory] Loading trajectory data from: {traj_raw_path}")
    df_traj = pd.read_csv(traj_raw_path)
    X_traj = df_traj[TRAJECTORY_NUM_FEATURES]
    y_traj = df_traj[TRAJECTORY_TARGET_COL]

    X_t_train, X_t_test, y_t_train, y_t_test = train_test_split(X_traj, y_traj, test_size=0.15, random_state=42)
    traj_pipeline = Pipeline([
        ("scaler", build_trajectory_preprocessor()),
        ("model", HistGradientBoostingRegressor(max_iter=120, learning_rate=0.07, max_depth=5, random_state=42))
    ])
    traj_pipeline.fit(X_t_train, y_t_train)
    traj_test_preds = traj_pipeline.predict(X_t_test)
    traj_metrics = {
        "test_r2": round(float(r2_score(y_t_test, traj_test_preds)), 4),
        "test_mae": round(float(mean_absolute_error(y_t_test, traj_test_preds)), 4),
        "test_rmse": round(float(np.sqrt(mean_squared_error(y_t_test, traj_test_preds))), 4)
    }
    print(f"[Trajectory Evaluation] Test R2: {traj_metrics['test_r2']} | Test MAE: {traj_metrics['test_mae']} | Test RMSE: {traj_metrics['test_rmse']}")

    # 10. Generate Version Tag and Serialize Artifacts
    version_hash = hashlib.sha256(f"skill2career_ml_{time.time()}".encode()).hexdigest()[:10]
    version_tag = f"v1.0.0-{version_hash}"
    now_utc = datetime.now(timezone.utc).isoformat()
    duration = round(time.time() - start_time, 2)

    # Save Pipelines
    readiness_art_path = os.path.join(ARTIFACTS_DIR, "readiness_pipeline.joblib")
    traj_art_path = os.path.join(ARTIFACTS_DIR, "trajectory_pipeline.joblib")
    joblib.dump(best_pipeline, readiness_art_path)
    joblib.dump(traj_pipeline, traj_art_path)

    # Feature Schema & Tournament Summary
    tournament_summary = [
        {
            "model_name": r["model_name"],
            "val_r2": r["val_metrics"]["val_r2"],
            "val_mae": r["val_metrics"]["val_mae"],
            "val_rmse": r["val_metrics"]["val_rmse"],
            "fit_time_seconds": r["fit_time_seconds"]
        }
        for r in tournament_results
    ]

    feature_schema_payload = {
        "numerical_features": STUDENT_NUMERICAL_FEATURES,
        "categorical_features": STUDENT_CATEGORICAL_FEATURES,
        "target_feature": STUDENT_TARGET_COL,
        "trajectory_features": TRAJECTORY_NUM_FEATURES,
        "trajectory_target": TRAJECTORY_TARGET_COL
    }
    with open(os.path.join(ARTIFACTS_DIR, "feature_schema.json"), "w") as f:
        json.dump(feature_schema_payload, f, indent=2)

    metadata_payload = {
        "version_tag": version_tag,
        "model_name": "Skill2Career Ensemble Predictor",
        "created_at": now_utc,
        "training_duration_seconds": duration,
        "readiness_model": {
            "selected_algorithm": best_name,
            "dataset": os.path.basename(raw_path),
            "dataset_rows": len(df_students),
            "train_samples": len(X_train),
            "val_samples": len(X_val),
            "test_samples": len(X_test),
            "features": feature_cols,
            "tournament_results": tournament_summary,
            "validation_metrics": best_candidate["val_metrics"],
            "test_metrics": test_metrics,
            "feature_importance": feature_importance,
            "artifact_file": "readiness_pipeline.joblib"
        },
        "trajectory_model": {
            "selected_algorithm": "HistGradientBoostingRegressor",
            "dataset": os.path.basename(traj_raw_path),
            "dataset_rows": len(df_traj),
            "features": TRAJECTORY_NUM_FEATURES,
            "test_metrics": traj_metrics,
            "artifact_file": "trajectory_pipeline.joblib"
        }
    }

    metadata_path = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata_payload, f, indent=2)

    # Save to metrics & experiment folders
    with open(os.path.join(METRICS_DIR, f"metrics_{version_tag}.json"), "w") as f:
        json.dump({"readiness": test_metrics, "trajectory": traj_metrics, "tournament": tournament_summary}, f, indent=2)

    with open(os.path.join(EXPERIMENTS_DIR, f"experiment_{version_tag}.json"), "w") as f:
        json.dump(metadata_payload, f, indent=2)

    print(f"\n[OK] Artifacts serialized successfully for version {version_tag}")

    # 11. Optional Synchronous MongoDB Registration (CLI or background runner)
    if register_mongo:
        try:
            from pymongo import MongoClient
            from backend.config import settings
            client = MongoClient(settings.MONGODB_URI)
            db = client[settings.MONGODB_DATABASE]
            db.model_versions.update_one(
                {"model_name": "Skill2Career Ensemble Predictor", "version_tag": version_tag},
                {
                    "$set": {
                        "model_name": "Skill2Career Ensemble Predictor",
                        "version_tag": version_tag,
                        "algorithm": best_name,
                        "dataset_version": f"v1.0-{len(df_students)}-samples",
                        "features": feature_cols,
                        "metrics": test_metrics,
                        "artifact_path": readiness_art_path,
                        "training_samples": len(df_students),
                        "training_date": now_utc,
                        "is_active": True,
                        "updated_at": datetime.now(timezone.utc)
                    },
                    "$setOnInsert": {"created_at": datetime.now(timezone.utc)}
                },
                upsert=True
            )
            # Mark previous versions inactive
            db.model_versions.update_many(
                {"model_name": "Skill2Career Ensemble Predictor", "version_tag": {"$ne": version_tag}},
                {"$set": {"is_active": False}}
            )
            print(f"[MongoDB] Successfully registered active model version '{version_tag}' in database.")
            client.close()
        except Exception as e:
            print(f"[Warning] Could not register in MongoDB directly from script: {e}")

    return metadata_payload


def main():
    parser = argparse.ArgumentParser(description="Skill2Career ML Training & Tournament Pipeline")
    parser.add_argument("--dataset", type=str, default=None, help="Path to student profiles CSV")
    parser.add_argument("--trajectory", type=str, default=None, help="Path to trajectory CSV")
    parser.add_argument("--target", type=str, default=STUDENT_TARGET_COL, help="Target column name")
    parser.add_argument("--register-mongo", action="store_true", help="Register in MongoDB model_versions")
    args = parser.parse_args()

    run_training_pipeline(
        dataset_path=args.dataset,
        trajectory_path=args.trajectory,
        target_column=args.target,
        register_mongo=args.register_mongo
    )


if __name__ == "__main__":
    main()
