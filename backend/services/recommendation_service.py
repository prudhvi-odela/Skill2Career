"""
Skill2Career - Deterministic Career Recommendation Engine
Calculates explainable, market-aware skill priorities from student state,
career requirements, external market signals, and prerequisite dependency graphs.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
import numpy as np
from pymongo.asynchronous.database import AsyncDatabase

from backend.ml.gap_analyzer import SkillGapAnalyzer
from backend.services.market_intelligence_service import MarketIntelligenceService
from backend.services.dependency_service import SkillDependencyService
from backend.database.mongodb import serialize_docs, get_utc_now


class RecommendationService:
    def __init__(self):
        self.gap_analyzer = SkillGapAnalyzer()
        self.market_service = MarketIntelligenceService()
        self.dependency_service = SkillDependencyService()

    @staticmethod
    def classify_priority_band(score: float, gap: float = 1.0) -> str:
        """Classifies priority band using strictly documented thresholds."""
        if gap <= 0.0:
            return "MASTERED"
        elif score >= 75.0 and gap >= 0.5:
            return "URGENT"
        elif score >= 55.0:
            return "HIGH"
        elif score >= 35.0:
            return "MODERATE"
        else:
            return "LOW"

    @staticmethod
    def estimate_learning_effort(gap: float, has_unmet_prereqs: bool = False) -> tuple[str, int]:
        """Estimates approximate planning effort level and hours."""
        if gap <= 0.0:
            return "LOW", 0
        elif gap >= 3.0 or (gap >= 2.0 and has_unmet_prereqs):
            effort = "HIGH"
            hours = int(round(min(90.0, gap * 24.0 + 15.0)))
        elif gap >= 1.5:
            effort = "MEDIUM"
            hours = int(round(gap * 22.0 + 10.0))
        else:
            effort = "LOW"
            hours = int(round(gap * 20.0 + 5.0))
        return effort, hours

    @staticmethod
    def compute_priority_score(
        gap: float,
        career_importance: float,
        market_demand: float,
        downstream_count: int,
        prereq_pct: float,
        learning_velocity: float = 1.0
    ) -> tuple[float, str]:
        """Computes deterministic priority score (0-100) and priority band."""
        if gap <= 0.0:
            return 0.0, "MASTERED"

        s_gap = min(100.0, (gap / 5.0) * 100.0)
        s_career = career_importance * 100.0
        s_market = market_demand
        s_dep = min(100.0, downstream_count * 25.0)
        s_feas = round(prereq_pct * 0.70 + min(30.0, learning_velocity * 15.0), 1)

        raw_priority = (
            0.30 * s_gap +
            0.25 * s_career +
            0.20 * s_market +
            0.15 * s_dep +
            0.10 * s_feas
        )
        priority_score = round(float(np.clip(raw_priority, 5.0, 99.5)), 1)
        priority_band = RecommendationService.classify_priority_band(priority_score, gap)
        return priority_score, priority_band

    @staticmethod
    def generate_rationale(
        skill_name: str,
        career_title: str,
        student_level: float,
        target_level: float,
        gap: float,
        band: str,
        market_demand: float,
        prereqs_met: bool,
        downstream_count: int,
        is_market_fallback: bool = False,
        market_signal_status: str = "OBSERVED"
    ) -> str:
        """Generates explainable human-readable rationale."""
        if gap <= 0.0:
            return f"{skill_name} is mastered for '{career_title}' (proficiency {student_level:.1f} meets target {target_level:.1f})."

        downstream_str = f"unlocks {downstream_count} downstream skill{'s' if downstream_count != 1 else ''}" if downstream_count > 0 else "direct domain application"
        prereq_str = "Prerequisites are satisfied" if prereqs_met else "Requires prerequisite progression"
        
        if is_market_fallback or market_signal_status == "FALLBACK_UNAVAILABLE":
            market_str = "Market signal unavailable; prioritized using neutral baseline benchmark (75.0)."
        elif market_signal_status == "STALE":
            market_str = f"External market demand signal ({market_demand:.1f}/100, STALE archive benchmark) provided for context."
        elif market_signal_status == "EXPIRING_SOON":
            market_str = f"External market demand signal ({market_demand:.1f}/100, EXPIRING SOON) confirms current role demand."
        else:
            market_str = f"External market demand signal ({market_demand:.1f}/100) confirms role demand."

        return (
            f"{skill_name} is ranked {band} for '{career_title}' with a gap of {gap:.1f} "
            f"(current: {student_level:.1f} / target: {target_level:.1f}). "
            f"{market_str} "
            f"Dependency leverage: {downstream_str}. {prereq_str}."
        )

    async def generate_recommendations_for_student(
        self,
        student_id: str,
        career_id: Optional[str],
        db: AsyncDatabase
    ) -> List[Dict[str, Any]]:
        """
        Generates deterministic, ranked skill recommendations for the student.
        Combines competency deficit, career importance, market demand, dependencies, and feasibility.
        """
        profile = await db.student_profiles.find_one({"user_id": student_id})
        effective_career_id = career_id or profile.get("target_career_id")
        if not effective_career_id:
            return []
        career_doc = await db.career_roles.find_one({
            "$or": [{"career_code": effective_career_id}, {"_id": effective_career_id}]
        })
        if not career_doc:
            raise ValueError(f"Target career '{effective_career_id}' not found in catalog.")

        career_title = career_doc.get("title", effective_career_id)
        student_skills = profile.get("skills", [])
        student_map = {
            s.get("skill_id"): float(s.get("level", s.get("proficiency_level", 1.0)))
            for s in student_skills if s.get("skill_id")
        }

        # Analyze skill gaps using existing gap analyzer
        gap_res = self.gap_analyzer.analyze_gap(student_skills, effective_career_id)
        all_gaps = gap_res.get("gaps", [])

        # Fetch career market signal
        career_mkt = await self.market_service.get_career_market_signal(effective_career_id, db)

        stats = profile.get("statistics", {})
        velocity = float(stats.get("learning_velocity_index", 1.0))
        now_str = get_utc_now().isoformat()

        recommendations = []

        for item in all_gaps:
            s_id = item["skill_id"]
            s_name = item["skill_name"]
            req_lvl = float(item["required_level"])
            cur_lvl = float(item["current_level"])
            gap = max(0.0, req_lvl - cur_lvl)
            imp = float(item["importance"])

            if gap <= 0.0:
                # Student already meets or exceeds required proficiency level
                continue

            # 1. Skill Gap Component (Normalized 0-100)
            s_gap = min(100.0, (gap / 5.0) * 100.0)

            # 2. Career Relevance Component (0-100)
            s_career = imp * 100.0

            # 3. Market Relevance Component (0-100)
            mkt_sig = await self.market_service.get_skill_market_signal(s_id, db)
            is_mkt_fallback = bool(mkt_sig.get("is_fallback", False)) if mkt_sig else True
            freshness = mkt_sig.get("freshness", "unavailable") if mkt_sig else "unavailable"

            if is_mkt_fallback or freshness == "unavailable":
                mkt_status = "FALLBACK_UNAVAILABLE"
                s_market = 75.0
                mkt_trend = "unobserved"
                mkt_source = "Neutral Baseline Fallback"
                mkt_source_refs = ["O*NET Technical Competency Matrix", "Curriculum Standards", "Neutral Baseline Fallback"]
            elif freshness == "stale":
                mkt_status = "STALE"
                s_market = float(mkt_sig.get("demand_score", 75.0))
                mkt_trend = mkt_sig.get("trend_direction", "stable")
                mkt_source = mkt_sig.get("source_name", "Industry Benchmark (Stale)")
                mkt_source_refs = [mkt_source, "O*NET Technical Competency Matrix", "Curriculum Standards"]
            elif freshness == "expiring_soon":
                mkt_status = "EXPIRING_SOON"
                s_market = float(mkt_sig.get("demand_score", 75.0))
                mkt_trend = mkt_sig.get("trend_direction", "stable")
                mkt_source = mkt_sig.get("source_name", "Industry Benchmark (Expiring)")
                mkt_source_refs = [mkt_source, "O*NET Technical Competency Matrix", "Curriculum Standards"]
            else:
                mkt_status = "OBSERVED"
                s_market = float(mkt_sig.get("demand_score", 75.0))
                mkt_trend = mkt_sig.get("trend_direction", "stable")
                mkt_source = mkt_sig.get("source_name", "Industry Benchmark")
                mkt_source_refs = [mkt_source, "O*NET Technical Competency Matrix", "Curriculum Standards"]

            # 4. Dependency Importance (0-100)
            downstream = await self.dependency_service.get_downstream_dependents(s_id, db)
            downstream_count = len(downstream)
            s_dep = min(100.0, downstream_count * 25.0)

            # 5. Learning Feasibility Component (0-100)
            prereq_eval = await self.dependency_service.evaluate_prerequisites(s_id, student_map, db)
            prereq_pct = float(prereq_eval["prerequisites_completion_pct"])
            s_feas = round(prereq_pct * 0.70 + min(30.0, velocity * 15.0), 1)

            # Priority Formula:
            # 30% Gap + 25% Career Relevance + 20% Market Demand + 15% Dependency Leverage + 10% Feasibility
            raw_priority = (
                0.30 * s_gap +
                0.25 * s_career +
                0.20 * s_market +
                0.15 * s_dep +
                0.10 * s_feas
            )
            priority_score = round(float(np.clip(raw_priority, 5.0, 99.5)), 1)
            priority_band = self.classify_priority_band(priority_score, gap)
            effort_level, planning_hours = self.estimate_learning_effort(gap)

            # Construct human-readable rationale
            prereq_status_str = (
                "all mandatory prerequisites completed"
                if prereq_eval["all_prerequisites_met"]
                else f"requires prerequisite progression in {[p['prerequisite_skill_id'] for p in prereq_eval['prerequisites'] if not p['is_met']]}"
            )
            downstream_str = f"unlocks {downstream_count} downstream skill{'s' if downstream_count != 1 else ''}" if downstream_count > 0 else "direct domain application"

            if is_mkt_fallback or mkt_status == "FALLBACK_UNAVAILABLE":
                market_desc = "Market demand signal unavailable (neutral baseline 75.0 applied)"
            elif mkt_status == "STALE":
                market_desc = f"External market demand is {s_market:.0f}/100 ({mkt_trend}, STALE archive benchmark)"
            elif mkt_status == "EXPIRING_SOON":
                market_desc = f"External market demand is {s_market:.0f}/100 ({mkt_trend}, EXPIRING SOON)"
            else:
                market_desc = f"External market demand is strong ({s_market:.0f}/100, {mkt_trend})"

            rationale = (
                f"{s_name} is ranked {priority_band} ({priority_score}/100) for '{career_title}'. "
                f"Deficit is {gap:.1f} proficiency levels (current: {cur_lvl:.1f} / target: {req_lvl:.1f}) with {imp * 100:.0f}% role criticality. "
                f"{market_desc}. Structurally, {downstream_str}; {prereq_status_str}."
            )

            rec_id = f"rec_{effective_career_id}_{s_id}"
            recommendations.append({
                "recommendation_id": rec_id,
                "student_id": student_id,
                "career_id": effective_career_id,
                "career_title": career_title,
                "skill_id": s_id,
                "skill_name": s_name,
                "category": item.get("category", "General"),
                "priority_score": priority_score,
                "priority_band": priority_band,
                "student_proficiency": cur_lvl,
                "target_proficiency": req_lvl,
                "gap": round(gap, 1),
                "career_relevance": imp,
                "market_relevance": s_market,
                "is_market_fallback": is_mkt_fallback,
                "market_signal_status": mkt_status,
                "dependency_importance": s_dep,
                "learning_feasibility": s_feas,
                "prerequisites": prereq_eval.get("prerequisites", []),
                "prerequisites_met": prereq_eval.get("all_prerequisites_met", True),
                "learning_effort_level": effort_level,
                "estimated_planning_hours": planning_hours,
                "rationale": rationale,
                "source_references": mkt_source_refs,
                "generated_at": now_str,
                "engine_version": "v2.0-adaptive"
            })

        # Sort recommendations by priority score descending
        recommendations.sort(key=lambda x: (x["priority_score"], x["gap"]), reverse=True)
        return recommendations
