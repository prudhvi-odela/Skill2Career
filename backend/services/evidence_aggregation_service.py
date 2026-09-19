"""
Skill2Career - Evidence Aggregation & Skill State Boundary Service
Deterministically aggregates multiple evidence artifacts per skill, resolves conflicts,
and safely updates student skill state while strictly preserving ML inference boundaries.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import numpy as np
from pymongo.asynchronous.database import AsyncDatabase

from backend.schemas.evidence_schemas import (
    EvidenceStrength,
    VerificationStatus,
    SkillEvidenceSummaryItem,
    StudentEvidenceSummaryResponse,
    SkillEvidenceHistoryResponse
)
from backend.services.evidence_service import EvidenceService
from backend.database.mongodb import get_utc_now, serialize_doc, serialize_docs


class EvidenceAggregationService:
    def __init__(self):
        self.evidence_service = EvidenceService()

    @staticmethod
    def calculate_skill_evidence_aggregation(
        skill_id: str,
        skill_name: str,
        category: str,
        current_prof: float,
        is_verified_in_profile: bool,
        evidence_items: List[Dict[str, Any]]
    ) -> SkillEvidenceSummaryItem:
        """
        Deterministically aggregates evidence items for a single skill.
        Prioritizes verified, direct demonstrated competency over weak participation.
        """
        if not evidence_items:
            return SkillEvidenceSummaryItem(
                skill_id=skill_id,
                skill_name=skill_name,
                category=category,
                evidence_count=0,
                verified_evidence_count=0,
                strongest_evidence_level="NONE",
                aggregated_evidence_score=0.0,
                current_student_proficiency=current_prof,
                observed_proficiency=current_prof,
                is_verified_in_profile=is_verified_in_profile,
                last_evidence_at=None,
                evidence_summary="No evidence records logged for this skill yet."
            )

        valid_items = [e for e in evidence_items if e.get("verification_status") != VerificationStatus.REJECTED.value]
        verified_items = [
            e for e in valid_items
            if e.get("verification_status") in [
                VerificationStatus.ASSESSMENT_VERIFIED.value,
                VerificationStatus.MANUALLY_VERIFIED.value,
                VerificationStatus.SYSTEM_VERIFIED.value
            ]
        ]

        # Strength hierarchy
        strength_rank = {
            EvidenceStrength.VERY_STRONG.value: 4,
            EvidenceStrength.STRONG.value: 3,
            EvidenceStrength.MODERATE.value: 2,
            EvidenceStrength.WEAK.value: 1
        }
        strength_weights = {
            EvidenceStrength.VERY_STRONG.value: 1.0,
            EvidenceStrength.STRONG.value: 0.8,
            EvidenceStrength.MODERATE.value: 0.5,
            EvidenceStrength.WEAK.value: 0.2
        }

        # Find strongest evidence level
        max_rank = 0
        strongest_level = "WEAK"
        for item in valid_items:
            st = item.get("evidence_strength", EvidenceStrength.WEAK.value)
            r = strength_rank.get(st, 1)
            if r > max_rank:
                max_rank = r
                strongest_level = st

        # Weighted observed proficiency calculation
        # If verified items exist, they strictly determine the authoritative observed proficiency.
        # Unverified items (e.g., self-reported practice) cannot dilute or inflate verified competency.
        prof_items = verified_items if verified_items else valid_items

        total_weight = 0.0
        weighted_prof_sum = 0.0
        weighted_score_sum = 0.0

        for item in prof_items:
            st = item.get("evidence_strength", EvidenceStrength.WEAK.value)
            w = strength_weights.get(st, 0.2)
            prof = float(item.get("observed_proficiency", current_prof))
            score = float(item.get("evidence_score", 50.0))

            total_weight += w
            weighted_prof_sum += w * prof
            weighted_score_sum += w * score

        if total_weight > 0:
            raw_prof = float(weighted_prof_sum / total_weight)
            # If only unverified items exist, cap observed proficiency at 3.0
            if not verified_items:
                raw_prof = min(3.0, raw_prof)
            observed_prof = round(float(np.clip(raw_prof, 1.0, 5.0)), 1)
            base_score = float(weighted_score_sum / total_weight)
        else:
            observed_prof = current_prof
            base_score = 0.0

        # Verification bonus (up to +15.0 score points for multiple verified artifacts)
        verification_bonus = min(15.0, len(verified_items) * 5.0)
        aggregated_score = round(float(np.clip(base_score + verification_bonus, 0.0, 100.0)), 1)

        # Sort items by date for last_evidence_at
        sorted_by_date = sorted(valid_items, key=lambda x: str(x.get("observed_at", x.get("created_at", ""))), reverse=True)
        last_date = sorted_by_date[0].get("observed_at") or sorted_by_date[0].get("created_at") if sorted_by_date else None

        # Build summary narrative
        type_counts: Dict[str, int] = {}
        for item in valid_items:
            et = item.get("evidence_type", "OTHER")
            type_counts[et] = type_counts.get(et, 0) + 1
        
        breakdown_str = ", ".join(f"{count} {t.replace('_', ' ').lower()}" for t, count in type_counts.items())
        summary_text = (
            f"Supported by {len(valid_items)} artifact{'s' if len(valid_items) != 1 else ''} ({breakdown_str}) "
            f"with {len(verified_items)} verified checkpoint{'s' if len(verified_items) != 1 else ''}."
        )

        return SkillEvidenceSummaryItem(
            skill_id=skill_id,
            skill_name=skill_name,
            category=category,
            evidence_count=len(evidence_items),
            verified_evidence_count=len(verified_items),
            strongest_evidence_level=strongest_level,
            aggregated_evidence_score=aggregated_score,
            current_student_proficiency=current_prof,
            observed_proficiency=observed_prof,
            is_verified_in_profile=is_verified_in_profile,
            last_evidence_at=str(last_date) if last_date else None,
            evidence_summary=summary_text
        )

    async def get_student_evidence_summary(
        self,
        student_id: str,
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """Generates comprehensive aggregated evidence summary for student."""
        # 1. Fetch Profile
        profile = await db.student_profiles.find_one({"user_id": student_id})
        skills_map = {}
        if profile:
            for s in profile.get("skills", []):
                sk_code = s.get("skill_id")
                if sk_code:
                    skills_map[sk_code] = {
                        "level": float(s.get("level", s.get("proficiency_level", 1.0))),
                        "verified": bool(s.get("verified", s.get("is_verified", False))),
                        "category": s.get("category", "General")
                    }

        # 2. Fetch all student evidence
        cursor = db.skill_evidence.find({"student_id": student_id}).sort("created_at", -1)
        all_evidence = await cursor.to_list(length=300)

        # Group by skill_id
        grouped: Dict[str, List[Dict[str, Any]]] = {}
        for ev in all_evidence:
            sk = ev.get("skill_id")
            if sk:
                grouped.setdefault(sk, []).append(ev)

        # Build skill summaries
        skills_summary_list = []
        for sk_code, ev_list in grouped.items():
            skill_doc = await db.skills.find_one({
                "$or": [{"skill_code": sk_code}, {"_id": sk_code}]
            })
            sk_name = skill_doc.get("name", sk_code) if skill_doc else ev_list[0].get("skill_name", sk_code)
            sk_cat = skill_doc.get("category", "General") if skill_doc else "General"
            
            prof_info = skills_map.get(sk_code, {"level": 1.0, "verified": False, "category": sk_cat})
            
            summary_item = self.calculate_skill_evidence_aggregation(
                skill_id=sk_code,
                skill_name=sk_name,
                category=prof_info.get("category", sk_cat),
                current_prof=prof_info["level"],
                is_verified_in_profile=prof_info["verified"],
                evidence_items=ev_list
            )
            skills_summary_list.append(summary_item)

        # Sort summary by aggregated score descending
        skills_summary_list.sort(key=lambda x: (x.verified_evidence_count, x.aggregated_evidence_score), reverse=True)

        verified_count = sum(1 for e in all_evidence if e.get("verification_status") in [
            VerificationStatus.ASSESSMENT_VERIFIED.value,
            VerificationStatus.MANUALLY_VERIFIED.value,
            VerificationStatus.SYSTEM_VERIFIED.value
        ])
        unverified_count = sum(1 for e in all_evidence if e.get("verification_status") == VerificationStatus.UNVERIFIED.value)
        rejected_count = sum(1 for e in all_evidence if e.get("verification_status") == VerificationStatus.REJECTED.value)

        # Strongest evidence items
        strong_items = [
            serialize_doc(e) for e in all_evidence
            if e.get("evidence_strength") in [EvidenceStrength.VERY_STRONG.value, EvidenceStrength.STRONG.value]
        ][:6]

        return {
            "student_id": student_id,
            "total_evidence_count": len(all_evidence),
            "verified_evidence_count": verified_count,
            "unverified_evidence_count": unverified_count,
            "rejected_evidence_count": rejected_count,
            "skills_with_evidence_count": len(grouped),
            "skills_summary": [s.model_dump() for s in skills_summary_list],
            "strongest_evidence_items": strong_items,
            "provenance_note": "Evidence represents auditable student artifacts (assessments, projects, certs, activities) establishing verified proficiency without modifying ML pipeline weights."
        }

    async def get_skill_evidence_history(
        self,
        student_id: str,
        skill_id: str,
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """Retrieves timeline and aggregation for a specific skill."""
        skill_doc = await db.skills.find_one({
            "$or": [{"skill_code": skill_id}, {"_id": skill_id}]
        })
        skill_code = skill_doc.get("skill_code", skill_id) if skill_doc else skill_id
        skill_name = skill_doc.get("name", skill_code) if skill_doc else skill_code
        category = skill_doc.get("category", "General") if skill_doc else "General"

        # Fetch evidence for skill
        cursor = db.skill_evidence.find({"student_id": student_id, "skill_id": skill_code}).sort("observed_at", -1)
        evidence_list = await cursor.to_list(length=100)

        # Profile skill info
        profile = await db.student_profiles.find_one({"user_id": student_id})
        current_lvl = 1.0
        is_verified = False
        v_source = "Self-Reported"
        if profile:
            for s in profile.get("skills", []):
                if s.get("skill_id") == skill_code:
                    current_lvl = float(s.get("level", s.get("proficiency_level", 1.0)))
                    is_verified = bool(s.get("verified", s.get("is_verified", False)))
                    v_source = s.get("verification_source", "Self-Reported")

        summary = self.calculate_skill_evidence_aggregation(
            skill_id=skill_code,
            skill_name=skill_name,
            category=category,
            current_prof=current_lvl,
            is_verified_in_profile=is_verified,
            evidence_items=evidence_list
        )

        return {
            "student_id": student_id,
            "skill_id": skill_code,
            "skill_name": skill_name,
            "current_proficiency_level": current_lvl,
            "is_verified": is_verified,
            "verification_source": v_source,
            "timeline": serialize_docs(evidence_list),
            "summary": summary.model_dump()
        }

    async def apply_evidence_to_skill_state(
        self,
        student_id: str,
        skill_id: str,
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """
        Explicitly updates authoritative student skill state in student_profiles
        from verified evidence without bypassing ML models.
        """
        history = await self.get_skill_evidence_history(student_id, skill_id, db)
        summary = history["summary"]

        if summary["verified_evidence_count"] == 0:
            return {
                "status": "unchanged",
                "message": f"No verified evidence available for '{history['skill_name']}'.",
                "skill_id": skill_id,
                "current_level": history["current_proficiency_level"],
                "is_verified": history["is_verified"]
            }

        # Safe update policy:
        # If observed proficiency from verified evidence is higher than current profile level, upgrade it
        new_level = round(float(np.clip(max(history["current_proficiency_level"], summary["observed_proficiency"]), 1.0, 5.0)), 1)
        new_source = f"Evidence Engine: {summary['verified_evidence_count']} verified artifact(s) (Score: {summary['aggregated_evidence_score']})"

        now = get_utc_now()
        profile = await db.student_profiles.find_one({"user_id": student_id})
        if not profile:
            raise ValueError(f"Student profile for user '{student_id}' not found.")

        skills_list = profile.get("skills", [])
        existing_idx = next((i for i, s in enumerate(skills_list) if s.get("skill_id") == skill_id), None)

        skill_item = {
            "skill_id": skill_id,
            "name": history["skill_name"],
            "category": summary.get("category", "General"),
            "domain": "General",
            "level": new_level,
            "verified": True,
            "verification_source": new_source,
            "years_experience": skills_list[existing_idx].get("years_experience", 1.0) if existing_idx is not None else 1.0,
            "last_assessed_at": now
        }

        if existing_idx is not None:
            skills_list[existing_idx] = skill_item
        else:
            skills_list.append(skill_item)

        await db.student_profiles.update_one(
            {"user_id": student_id},
            {"$set": {"skills": skills_list, "updated_at": now}}
        )

        return {
            "status": "updated",
            "message": f"Successfully updated '{history['skill_name']}' to Level {new_level:.1f} (Verified).",
            "skill_id": skill_id,
            "new_level": new_level,
            "is_verified": True,
            "verification_source": new_source
        }
