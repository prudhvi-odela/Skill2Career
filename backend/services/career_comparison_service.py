"""
Skill2Career - Career Comparison Service
Performs objective, multi-dimensional comparison across 2 to 5 career pathways
incorporating student competency, skill gap distributions, and external market signals.
"""

from typing import Dict, Any, List
from pymongo.asynchronous.database import AsyncDatabase

from backend.ml.career_matcher import CareerMatcher
from backend.ml.gap_analyzer import SkillGapAnalyzer
from backend.ml.inference import MLInferenceService
from backend.services.market_intelligence_service import MarketIntelligenceService


class CareerComparisonService:
    def __init__(self):
        self.career_matcher = CareerMatcher()
        self.gap_analyzer = SkillGapAnalyzer()
        self.ml_service = MLInferenceService.get_instance()
        self.market_service = MarketIntelligenceService()

    async def compare_careers(
        self,
        student_id: str,
        career_ids: List[str],
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        if len(career_ids) < 2 or len(career_ids) > 5:
            raise ValueError("Career comparison requires between 2 and 5 career IDs.")

        profile = await db.student_profiles.find_one({"user_id": student_id})
        if not profile:
            raise ValueError("Student profile not found.")

        student_skills = profile.get("skills", [])
        comparisons = []

        for cid in career_ids:
            career_doc = await db.career_roles.find_one({"$or": [{"career_code": cid}, {"_id": cid}]})
            if not career_doc:
                continue

            c_title = career_doc.get("title", cid)
            c_domain = career_doc.get("domain", "General")
            c_desc = career_doc.get("description", "")
            c_salary = float(career_doc.get("avg_salary_usd", 100000.0))

            # Match % via CareerMatcher
            matches = self.career_matcher.match_student_to_careers(student_skills)
            matched_item = next((m for m in matches if m["career_id"] == cid or m.get("career_code") == cid), None)
            skill_match_pct = matched_item["match_percentage"] if matched_item else 0.0

            # Existing readiness prediction from DB or ML inference
            latest_pred = await db.readiness_predictions.find_one(
                {"student_id": student_id, "career_id": cid},
                sort=[("created_at", -1)]
            )
            if latest_pred:
                readiness_score = float(latest_pred.get("readiness_score", 0.0))
            else:
                pred_out = self.ml_service.predict_readiness(
                    student_skills_list=student_skills,
                    target_career_id=cid,
                    degree=profile.get("degree", "B.Tech Computer Science"),
                    institution_tier=int(profile.get("institution_tier") or 2),
                    gpa=float(profile.get("gpa") or 8.0),
                    weekly_study_hours=float((profile.get("statistics") or {}).get("weekly_study_hours") or 12.0),
                    learning_velocity_index=float((profile.get("statistics") or {}).get("learning_velocity_index") or 1.0)
                )
                readiness_score = float(pred_out.get("readiness_score", 0.0))

            # Gap Analysis
            gap_res = self.gap_analyzer.analyze_gap(student_skills, cid)
            gaps_list = gap_res.get("gaps", [])
            critical_gaps = [g for g in gaps_list if g.get("priority") in ["Critical", "High"]][:4]
            proficient_skills = [g for g in gaps_list if g.get("status") == "Proficient"][:4]

            # Market Signal
            market_sig = await self.market_service.get_career_market_signal(cid, db)
            demand_score = float(market_sig.get("demand_score", 85.0))
            trend_direction = str(market_sig.get("trend_direction", "stable"))
            freshness = str(market_sig.get("freshness", "fresh"))
            source_id = str(market_sig.get("source_id", "SRC_BLS_2026"))

            comparisons.append({
                "career_id": cid,
                "career_title": c_title,
                "domain": c_domain,
                "description": c_desc,
                "avg_salary_usd": c_salary,
                "salary_provenance": "Industry Benchmark Data",
                "existing_skill_match_pct": round(skill_match_pct, 1),
                "existing_readiness_benchmark": round(readiness_score, 1),
                "critical_skill_gaps": critical_gaps,
                "top_strengths": proficient_skills,
                "market_demand_score": demand_score,
                "market_trend": trend_direction,
                "data_freshness": freshness,
                "source_id": source_id
            })

        sources = await self.market_service.get_market_sources(db)
        summary_titles = ", ".join(c["career_title"] for c in comparisons)

        return {
            "student_id": student_id,
            "comparisons": comparisons,
            "data_sources": sources,
            "comparison_summary": f"Comparative analysis of {len(comparisons)} career pathways ({summary_titles}) evaluated across current competency match, ML readiness benchmark, and external industry demand.",
            "provenance_disclaimer": "Career comparison presents side-by-side evidence to assist student decision-making. No career is declared objectively best; decisions should weigh student interest, competency gap size, and market trajectory."
        }
