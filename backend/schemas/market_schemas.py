"""
Skill2Career - Market Intelligence Schemas
Defines request and response models for career market signals, skill market signals,
data provenance, student-vs-market analysis, and multi-career comparison.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class MarketDataSourceResponse(BaseModel):
    id: Optional[str] = None
    source_id: str
    source_name: str
    source_type: str
    source_url: str
    provider: str
    retrieved_at: str
    coverage: str
    methodology: str
    license: str
    quality_level: str


class CareerMarketSignalResponse(BaseModel):
    career_id: str
    career_title: Optional[str] = None
    region: str = "Global"
    demand_score: float = Field(..., ge=0.0, le=100.0, description="Market demand index 0-100")
    trend_direction: str = Field(..., description="growing, stable, or declining")
    sample_size: int = Field(..., ge=0)
    source_id: str
    source_name: Optional[str] = None
    retrieved_at: str
    valid_until: str
    data_quality: str = "High"
    freshness: str = Field(..., description="fresh, expiring_soon, or stale")
    notes: Optional[str] = None


class SkillMarketSignalResponse(BaseModel):
    skill_id: str
    skill_name: Optional[str] = None
    category: Optional[str] = None
    region: str = "Global"
    demand_score: float = Field(..., ge=0.0, le=100.0)
    trend_direction: str = Field(..., description="growing, stable, or declining")
    sample_size: int = Field(..., ge=0)
    market_tier: str = Field(..., description="high_demand, moderate_demand, or niche")
    source_id: str
    source_name: Optional[str] = None
    retrieved_at: str
    valid_until: str
    data_quality: str = "High"
    freshness: str = Field(..., description="fresh, expiring_soon, or stale")
    notes: Optional[str] = None


class CareerSkillMarketMatrixResponse(BaseModel):
    career_id: str
    career_title: str
    career_market_signal: Optional[CareerMarketSignalResponse] = None
    skills_market: List[SkillMarketSignalResponse] = []
    data_sources: List[MarketDataSourceResponse] = []


class StudentMarketAnalysisRequest(BaseModel):
    target_career_id: Optional[str] = None


class StudentMarketSkillGapItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    student_proficiency: float = Field(..., ge=0.0, le=5.0)
    required_proficiency: float = Field(..., ge=0.0, le=5.0)
    gap: float = Field(..., description="Deficit between required and student proficiency")
    is_critical_gap: bool
    market_demand_score: float = Field(..., ge=0.0, le=100.0)
    market_trend: str
    priority_level: str = Field(..., description="URGENT, HIGH, MODERATE, LOW")
    priority_reason: str
    source_provenance: str


class StudentMarketAnalysisResponse(BaseModel):
    student_id: str
    target_career_id: str
    target_career_title: str
    ml_readiness_benchmark_score: float
    career_market_demand: float
    career_market_trend: str
    analyzed_skill_gaps: List[StudentMarketSkillGapItem]
    top_priority_market_skills: List[str]
    data_sources: List[MarketDataSourceResponse]
    provenance_note: str


class CareerComparisonRequest(BaseModel):
    career_ids: List[str] = Field(..., min_length=2, max_length=5, description="List of 2 to 5 career IDs to compare")


class CareerComparisonItem(BaseModel):
    career_id: str
    career_title: str
    domain: str
    description: str
    avg_salary_usd: float
    salary_provenance: str = "Industry Benchmark Data"
    existing_skill_match_pct: float
    existing_readiness_benchmark: Optional[float] = None
    critical_skill_gaps: List[Dict[str, Any]] = []
    top_strengths: List[Dict[str, Any]] = []
    market_demand_score: float
    market_trend: str
    data_freshness: str
    source_id: str


class CareerComparisonResponse(BaseModel):
    student_id: str
    comparisons: List[CareerComparisonItem]
    data_sources: List[MarketDataSourceResponse]
    comparison_summary: str
    provenance_disclaimer: str
