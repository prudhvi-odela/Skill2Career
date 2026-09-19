"""
Skill2Career ML Admin & Model Versioning Router (MongoDB Async)
Provides transparency into model versions, performance metrics, and retraining triggers in MongoDB.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db, get_utc_now, serialize_doc, serialize_docs
from backend.schemas.schemas import ModelVersionItem
from backend.ml.inference import MLInferenceService
from backend.ml.train import main as train_models

router = APIRouter(prefix="/ml", tags=["ML Model Registry & Metrics"])
ml_service = MLInferenceService.get_instance()


@router.get("/versions", response_model=List[ModelVersionItem])
async def list_model_versions(db: AsyncDatabase = Depends(get_db)):
    cursor = db.model_versions.find({}).sort("created_at", -1)
    versions = await cursor.to_list(length=50)
    results = []
    for v in versions:
        results.append(ModelVersionItem(
            id=str(v["_id"]),
            model_name=v.get("model_name", "Skill2Career Ensemble Predictor"),
            version_tag=v.get("version_tag", ""),
            algorithm=v.get("algorithm", "HistGradientBoostingRegressor"),
            metrics=v.get("metrics", {}),
            features=v.get("features", []),
            is_active=v.get("is_active", True),
            created_at=v.get("created_at")
        ))
    return results


@router.get("/metrics")
async def get_active_metrics():
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
async def trigger_retraining(db: AsyncDatabase = Depends(get_db)):
    try:
        train_models()
        # Reload models in inference service
        ml_service.load_models()
        meta = ml_service.get_model_metadata()
        v_tag = meta.get("version_tag", "v1.0.0-retrained")
        now = get_utc_now()

        # Register in MongoDB model_versions collection
        await db.model_versions.update_one(
            {"model_name": "Skill2Career Ensemble Predictor", "version_tag": v_tag},
            {
                "$set": {
                    "model_name": "Skill2Career Ensemble Predictor",
                    "version_tag": v_tag,
                    "algorithm": meta.get("readiness_model", {}).get("selected_algorithm", "HistGradientBoostingRegressor"),
                    "dataset_version": "v1.0-benchmark-5k",
                    "features": meta.get("readiness_model", {}).get("features", []),
                    "metrics": meta.get("readiness_model", {}).get("best_metrics", {}),
                    "artifact_path": "backend/ml/artifacts/readiness_pipeline.joblib",
                    "training_samples": 5000,
                    "training_date": now.isoformat(),
                    "is_active": True,
                    "updated_at": now
                },
                "$setOnInsert": {
                    "created_at": now
                }
            },
            upsert=True
        )

        return {
            "status": "success",
            "message": "Model training completed and registered in MongoDB successfully.",
            "version_tag": v_tag,
            "metrics": meta.get("readiness_model", {}).get("best_metrics", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training pipeline error: {str(e)}")
