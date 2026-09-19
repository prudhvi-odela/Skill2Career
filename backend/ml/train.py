import os
import sys
import json
import time
import hashlib
import numpy as np
import pandas as pd
import joblib
from datetime import datetime, timezone

# Ensure backend/ml and backend are on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.pipeline import Pipeline

from preprocessor import (
    create_preprocessor,
    create_trajectory_preprocessor,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET_COL,
    TRAJECTORY_NUM_FEATURES,
    TRAJECTORY_TARGET_COL
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)


def train_readiness_model():
    print("\n--- Training Job Readiness Models ---")
    data_path = os.path.join(DATA_DIR, "student_profiles_training.csv")
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} samples from {data_path}")

    feature_cols = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
    X = df[feature_cols]
    y = df[TARGET_COL]

    # 80% train, 10% validation, 10% test
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.10, random_state=42
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.1111, random_state=42
    )

    print(f"Split sizes -> Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

    # 1. Baseline Model (Ridge Regression Pipeline)
    baseline_pipeline = Pipeline([
        ("preprocessor", create_preprocessor()),
        ("model", Ridge(alpha=1.0))
    ])
    baseline_pipeline.fit(X_train, y_train)

    val_preds_baseline = baseline_pipeline.predict(X_val)
    test_preds_baseline = baseline_pipeline.predict(X_test)

    baseline_metrics = {
        "val_r2": round(r2_score(y_val, val_preds_baseline), 4),
        "val_mae": round(mean_absolute_error(y_val, val_preds_baseline), 4),
        "val_rmse": round(float(np.sqrt(mean_squared_error(y_val, val_preds_baseline))), 4),
        "test_r2": round(r2_score(y_test, test_preds_baseline), 4),
        "test_mae": round(mean_absolute_error(y_test, test_preds_baseline), 4),
        "test_rmse": round(float(np.sqrt(mean_squared_error(y_test, test_preds_baseline))), 4),
    }
    print(f"Baseline (Ridge) Test R2: {baseline_metrics['test_r2']}, MAE: {baseline_metrics['test_mae']}, RMSE: {baseline_metrics['test_rmse']}")

    # 2. Candidate Model (HistGradientBoostingRegressor Pipeline)
    candidate_pipeline = Pipeline([
        ("preprocessor", create_preprocessor()),
        ("model", HistGradientBoostingRegressor(
            max_iter=150,
            learning_rate=0.08,
            max_depth=6,
            random_state=42
        ))
    ])
    candidate_pipeline.fit(X_train, y_train)

    val_preds_candidate = candidate_pipeline.predict(X_val)
    test_preds_candidate = candidate_pipeline.predict(X_test)

    candidate_metrics = {
        "val_r2": round(r2_score(y_val, val_preds_candidate), 4),
        "val_mae": round(mean_absolute_error(y_val, val_preds_candidate), 4),
        "val_rmse": round(float(np.sqrt(mean_squared_error(y_val, val_preds_candidate))), 4),
        "test_r2": round(r2_score(y_test, test_preds_candidate), 4),
        "test_mae": round(mean_absolute_error(y_test, test_preds_candidate), 4),
        "test_rmse": round(float(np.sqrt(mean_squared_error(y_test, test_preds_candidate))), 4),
    }
    print(f"Candidate (HistGradientBoosting) Test R2: {candidate_metrics['test_r2']}, MAE: {candidate_metrics['test_mae']}, RMSE: {candidate_metrics['test_rmse']}")

    # Select best model based on Test R2
    best_model_name = "HistGradientBoostingRegressor" if candidate_metrics["test_r2"] >= baseline_metrics["test_r2"] else "Ridge"
    best_pipeline = candidate_pipeline if best_model_name == "HistGradientBoostingRegressor" else baseline_pipeline
    best_metrics = candidate_metrics if best_model_name == "HistGradientBoostingRegressor" else baseline_metrics

    # Save artifact
    model_artifact_path = os.path.join(ARTIFACTS_DIR, "readiness_pipeline.joblib")
    joblib.dump(best_pipeline, model_artifact_path)
    print(f"[OK] Saved best readiness model to {model_artifact_path}")

    return {
        "model_name": "job_readiness_model",
        "selected_algorithm": best_model_name,
        "features": feature_cols,
        "baseline_metrics": baseline_metrics,
        "candidate_metrics": candidate_metrics,
        "best_metrics": best_metrics,
        "artifact_file": "readiness_pipeline.joblib"
    }


def train_trajectory_model():
    print("\n--- Training Future Readiness Trajectory Model ---")
    data_path = os.path.join(DATA_DIR, "learning_trajectory_training.csv")
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} trajectory records from {data_path}")

    X = df[TRAJECTORY_NUM_FEATURES]
    y = df[TRAJECTORY_TARGET_COL]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    trajectory_pipeline = Pipeline([
        ("scaler", create_trajectory_preprocessor()),
        ("model", HistGradientBoostingRegressor(
            max_iter=120,
            learning_rate=0.07,
            max_depth=5,
            random_state=42
        ))
    ])
    trajectory_pipeline.fit(X_train, y_train)

    test_preds = trajectory_pipeline.predict(X_test)
    metrics = {
        "test_r2": round(r2_score(y_test, test_preds), 4),
        "test_mae": round(mean_absolute_error(y_test, test_preds), 4),
        "test_rmse": round(float(np.sqrt(mean_squared_error(y_test, test_preds))), 4)
    }
    print(f"Trajectory Model Test R2: {metrics['test_r2']}, MAE: {metrics['test_mae']}, RMSE: {metrics['test_rmse']}")

    artifact_path = os.path.join(ARTIFACTS_DIR, "trajectory_pipeline.joblib")
    joblib.dump(trajectory_pipeline, artifact_path)
    print(f"[OK] Saved trajectory model to {artifact_path}")

    return {
        "model_name": "future_readiness_trajectory_model",
        "algorithm": "HistGradientBoostingRegressor",
        "features": TRAJECTORY_NUM_FEATURES,
        "metrics": metrics,
        "artifact_file": "trajectory_pipeline.joblib"
    }


def main():
    start_time = time.time()
    readiness_meta = train_readiness_model()
    trajectory_meta = train_trajectory_model()

    version_hash = hashlib.sha256(f"s2c_{time.time()}".encode()).hexdigest()[:10]
    version_tag = f"v1.0.0-{version_hash}"

    metadata = {
        "version_tag": version_tag,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "readiness_model": readiness_meta,
        "trajectory_model": trajectory_meta,
        "training_duration_seconds": round(time.time() - start_time, 2)
    }

    metadata_path = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n[OK] Model version {version_tag} saved with full metadata to {metadata_path}")


if __name__ == "__main__":
    main()
