"""
Skill2Career - Career Forecasting & Scenario Intelligence Router (Phase 10)
Exposes authenticated REST API endpoints for longitudinal career forecasting,
competency bottlenecks, time-to-target estimations, in-memory what-if scenario simulations,
and multi-scenario comparisons.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db
from backend.services.auth_service import get_current_user
from backend.services.career_forecast_service import CareerForecastService
from backend.schemas.career_forecast_schemas import (
    CareerForecastResponse,
    ScenarioSimulationRequest,
    ScenarioSimulationResult,
    ScenarioComparisonResponse,
    ForecastHorizon,
    CompetencyBottleneckItem
)

router = APIRouter(prefix="/career-forecast", tags=["Career Forecasting & Scenario Intelligence"])
forecast_service = CareerForecastService()


@router.get("/compare-scenarios", response_model=ScenarioComparisonResponse)
async def compare_scenarios(
    career_id: str = Query(..., description="Target career ID"),
    horizon: int = Query(90, description="Projection horizon in days (30, 60, 90, 180)"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Compares standard predefined scenarios (Current Trajectory, Increased Consistency, Gap Focused)
    side-by-side for the target career.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        reqs = [
            ScenarioSimulationRequest(scenario_type="CURRENT_TRAJECTORY", forecast_horizon_days=horizon),
            ScenarioSimulationRequest(scenario_type="INCREASED_CONSISTENCY", forecast_horizon_days=horizon),
            ScenarioSimulationRequest(scenario_type="GAP_FOCUSED", forecast_horizon_days=horizon)
        ]
        comparison = await forecast_service.compare_scenarios(
            student_id=user_id,
            career_id=career_id,
            scenario_reqs=reqs,
            db=db
        )
        return comparison
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Scenario comparison error: {str(e)}")


@router.get("/{career_id}", response_model=CareerForecastResponse)
async def generate_or_get_forecast(
    career_id: str,
    horizon: int = Query(90, description="Projection horizon in days (30, 60, 90, 180)"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Retrieves or generates a longitudinal career forecast for a target career and horizon.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        forecast = await forecast_service.generate_career_forecast(
            student_id=user_id,
            career_id=career_id,
            horizon_days=horizon,
            db=db
        )
        return forecast
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Forecast generation error: {str(e)}")


@router.get("/{career_id}/history", response_model=List[Dict[str, Any]])
async def get_forecast_history(
    career_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Retrieves chronological past forecast records for auditing trajectory progression.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        history = await forecast_service.get_forecast_history(
            student_id=user_id,
            career_id=career_id,
            db=db
        )
        return history
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Forecast history error: {str(e)}")


@router.get("/{career_id}/bottlenecks", response_model=List[CompetencyBottleneckItem])
async def get_career_bottlenecks(
    career_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Retrieves detected competency bottlenecks restricting career progression.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        bottlenecks = await forecast_service.get_career_bottlenecks(
            student_id=user_id,
            career_id=career_id,
            db=db
        )
        return bottlenecks
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Bottlenecks error: {str(e)}")


@router.post("/{career_id}/simulate", response_model=ScenarioSimulationResult)
async def simulate_scenario(
    career_id: str,
    request: ScenarioSimulationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    """
    Simulates a what-if scenario strictly in-memory without modifying student profile or evidence state.
    """
    user_id = str(current_user.get("_id") or current_user.get("id"))
    try:
        result = await forecast_service.simulate_scenario(
            student_id=user_id,
            career_id=career_id,
            scenario_req=request,
            db=db
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Scenario simulation error: {str(e)}")
