"""
Skill2Career - Career Feature Engineering Module
Calculates career requirement vectors, weighted coverage, and critical skill gap features.
"""

from typing import Dict, Any, List


class CareerFeatureExtractor:
    """
    Computes dense vector representations and weighted compatibility scores for career requirements.
    """

    @staticmethod
    def calculate_skill_overlap(
        student_skills: List[Dict[str, Any]],
        career_required_skills: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        student_map = {
            s.get("skill_id"): float(s.get("level", s.get("proficiency_level", 1.0)))
            for s in student_skills if s.get("skill_id")
        }

        total_weighted_points = 0.0
        earned_weighted_points = 0.0
        missing_core_skills = []
        critical_gaps_count = 0

        for req in career_required_skills:
            s_id = req.get("skill_id")
            req_lvl = float(req.get("required_level", 3.0))
            importance = float(req.get("importance", 1.0))
            is_core = req.get("is_core", importance >= 0.8)

            total_weighted_points += req_lvl * importance
            curr_lvl = student_map.get(s_id, 0.0)

            if curr_lvl > 0:
                effective_lvl = min(req_lvl, curr_lvl)
                earned_weighted_points += effective_lvl * importance
            else:
                if is_core:
                    missing_core_skills.append(s_id)
                critical_gaps_count += 1

        coverage_pct = round((earned_weighted_points / total_weighted_points) * 100.0, 1) if total_weighted_points > 0 else 0.0

        return {
            "career_skill_match_pct": coverage_pct,
            "missing_core_skills": missing_core_skills,
            "critical_gaps_count": critical_gaps_count,
            "total_required_count": len(career_required_skills)
        }
