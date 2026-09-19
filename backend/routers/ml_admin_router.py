"""
Skill2Career ML Admin & Model Versioning Router
Provides transparency into model versions, performance metrics, and retraining triggers.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database.session import get_db
from backend.models.models import ModelVersion, PredictionLog
from backend.schemas.schemas import ModelVersionItem
from backend.ml.inference import MLInferenceService
from backend.ml.train import main as train_models

router = APIRouter(prefix="/ml", tags=["ML Model Registry & Metrics"])
ml_service = MLInferenceService.get_instance()


@router.get("/versions", response_model=List[ModelVersionItem])
def list_model_versions(db: Session = Depends(get_db)):
    versions = db.query(ModelVersion).order_by(ModelVersion.created_at.desc()).all()
    results = []
    for v in versions:
        results.append(ModelVersionItem(
            id=v.id,
            model_name=v.model_name,
            version_tag=v.version_tag,
            algorithm=v.algorithm,
            metrics=v.metrics_json or {},
            features=v.features_json or [],
            is_active=v.is_active,
            created_at=v.created_at
        ))
    return results


@router.get("/metrics")
def get_active_metrics():
    meta = ml_service.get_model_metadata()
    return {
        "status": "success",
        "active_version": meta.get("version_tag", "v1.0.0-production"),
        "created_at": meta.get("created_at"),
        "training_duration_seconds": meta.get("training_duration_seconds"),
        "readiness_model": meta.get("readiness_model", {}),
        "trajectory_model": meta.get("trajectory_model", {})
    }


@router.post("/train")
def trigger_retraining(db: Session = Depends(get_db)):
    try:
        train_models()
        # Reload models in inference service
        ml_service.load_models()
        meta = ml_service.get_model_metadata()
        v_tag = meta.get("version_tag", "v1.0.0-retrained")

        # Register in database
        mv = ModelVersion(
            model_name="Skill2Career Ensemble Predictor",
            version_tag=v_tag,
            algorithm=meta.get("readiness_model", {}).get("selected_algorithm", "HistGradientBoostingRegressor"),
            metrics_json=meta.get("readiness_model", {}).get("best_metrics", {}),
            features_json=meta.get("readiness_model", {}).get("features", []),
            artifact_path="backend/ml/artifacts/readiness_pipeline.joblib",
            is_active=True
        )
        db.add(mv)
        db.commit()

        return {
            "status": "success",
            "message": "Model training completed and serialized successfully.",
            "version_tag": v_tag,
            "metrics": meta.get("readiness_model", {}).get("best_metrics", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training pipeline error: {str(e)}")
