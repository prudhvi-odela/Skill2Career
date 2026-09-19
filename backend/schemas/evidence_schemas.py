"""
Skill2Career - Learning Evidence Schemas
Defines request and response models, enumerations, and aggregation structures
for the Learning Evidence Engine.
"""

from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime


class EvidenceType(str, Enum):
    LEARNING_ACTIVITY = "LEARNING_ACTIVITY"
    PROJECT = "PROJECT"
    ASSESSMENT = "ASSESSMENT"
    CERTIFICATION = "CERTIFICATION"
    MANUAL_VERIFICATION = "MANUAL_VERIFICATION"


class VerificationStatus(str, Enum):
    UNVERIFIED = "UNVERIFIED"
    SYSTEM_VERIFIED = "SYSTEM_VERIFIED"
    ASSESSMENT_VERIFIED = "ASSESSMENT_VERIFIED"
    MANUALLY_VERIFIED = "MANUALLY_VERIFIED"
    REJECTED = "REJECTED"


class EvidenceStrength(str, Enum):
    WEAK = "WEAK"
    MODERATE = "MODERATE"
    STRONG = "STRONG"
    VERY_STRONG = "VERY_STRONG"


class EvidenceCreateRequest(BaseModel):
    skill_id: str = Field(..., description="Canonical skill ID (e.g. SK001)")
    evidence_type: EvidenceType
    source_entity: str = Field(..., description="projects, certifications, assessments, or learning_activities")
    source_entity_id: str = Field(..., description="MongoDB ID of the source artifact")
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    observed_proficiency: float = Field(..., ge=0.5, le=5.0, description="Observed proficiency level 0.5-5.0")
    source_metadata: Optional[Dict[str, Any]] = None


class EvidenceVerifyRequest(BaseModel):
    verification_status: VerificationStatus
    validator_type: str = Field(..., description="ASSESSMENT_ENGINE, INSTRUCTOR, PEER_REVIEW, or AUTOMATED_RULE")
    notes: Optional[str] = None


class SkillEvidenceItemResponse(BaseModel):
    id: Optional[str] = None
    evidence_id: str
    student_id: str
    skill_id: str
    skill_name: Optional[str] = None
    evidence_type: str
    source_entity: str
    source_entity_id: str
    title: str
    description: Optional[str] = None
    evidence_strength: str
    evidence_score: float = Field(..., ge=0.0, le=100.0, description="Deterministic evidence score 0-100")
    verification_status: str
    observed_proficiency: float
    created_at: str
    observed_at: str
    validated_at: Optional[str] = None
    validator_type: Optional[str] = None
    source_metadata: Optional[Dict[str, Any]] = None
    confidence_reason: str
    engine_version: str = "v1.0-evidence"


class SkillEvidenceSummaryItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    evidence_count: int
    verified_evidence_count: int
    strongest_evidence_level: str
    aggregated_evidence_score: float
    current_student_proficiency: float
    observed_proficiency: float
    is_verified_in_profile: bool
    last_evidence_at: Optional[str] = None
    evidence_summary: str


class StudentEvidenceSummaryResponse(BaseModel):
    student_id: str
    total_evidence_count: int
    verified_evidence_count: int
    unverified_evidence_count: int
    rejected_evidence_count: int
    skills_with_evidence_count: int
    skills_summary: List[SkillEvidenceSummaryItem]
    strongest_evidence_items: List[SkillEvidenceItemResponse]
    provenance_note: str


class SkillEvidenceHistoryResponse(BaseModel):
    student_id: str
    skill_id: str
    skill_name: str
    current_proficiency_level: float
    is_verified: bool
    verification_source: str
    timeline: List[SkillEvidenceItemResponse]
    summary: SkillEvidenceSummaryItem
