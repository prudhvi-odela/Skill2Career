"""
Skill2Career - Skill Gap Analysis Engine
Performs granular, vectorized gap analysis between a student's profile and target career requirements.
"""

import json
import os
import pandas as pd


class SkillGapAnalyzer:
    def __init__(self, careers_csv_path=None, skills_csv_path=None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.careers_csv_path = careers_csv_path or os.path.join(base_dir, "data", "career_roles_skills.csv")
        self.skills_csv_path = skills_csv_path or os.path.join(base_dir, "data", "skills_taxonomies.csv")
        self._load_data()

    def _load_data(self):
        self.careers_df = pd.read_csv(self.careers_csv_path)
        self.skills_df = pd.read_csv(self.skills_csv_path)
        self.skills_dict = {row["skill_id"]: row.to_dict() for _, row in self.skills_df.iterrows()}
        self.careers_dict = {row["career_id"]: row.to_dict() for _, row in self.careers_df.iterrows()}

    def analyze_gap(self, student_skills_list, target_career_id):
        """
        Analyzes the exact skill gaps for a student aiming for target_career_id.
        Returns itemized gaps, priority scoring, remediation hours, and readiness metrics.
        """
        if target_career_id not in self.careers_dict:
            raise ValueError(f"Target career '{target_career_id}' not found in catalog.")

        career_row = self.careers_dict[target_career_id]
        req_skills = json.loads(career_row["required_skills_json"])

        student_map = {}
        for item in student_skills_list:
            s_id = item.get("skill_id")
            if s_id:
                student_map[s_id] = float(item.get("level", item.get("proficiency_level", 1.0)))

        gaps = []
        total_req_points = 0.0
        gap_points = 0.0
        proficient_count = 0
        developing_count = 0
        missing_count = 0
        estimated_total_hours = 0

        for req in req_skills:
            s_id = req["skill_id"]
            req_lvl = float(req["required_level"])
            imp = float(req["importance"])
            curr_lvl = float(student_map.get(s_id, 0.0))

            delta = max(0.0, req_lvl - curr_lvl)
            total_req_points += req_lvl * imp
            gap_points += delta * imp

            skill_info = self.skills_dict.get(s_id, {
                "skill_name": s_id,
                "category": "General",
                "domain": "General"
            })

            # Determine status
            if curr_lvl >= req_lvl:
                status = "Proficient"
                proficient_count += 1
            elif curr_lvl > 0:
                status = "Developing"
                developing_count += 1
            else:
                status = "Missing"
                missing_count += 1

            # Priority assignment based on delta and importance
            priority_score = delta * imp
            if priority_score >= 2.5 or (delta >= 3.0 and imp >= 0.8):
                priority = "Critical"
            elif priority_score >= 1.5:
                priority = "High"
            elif priority_score > 0.0:
                priority = "Medium"
            else:
                priority = "Mastered"

            # Estimated remediation hours: ~25 hours per skill level gap * importance modifier
            remediation_hours = int(delta * 25.0 * (0.8 + 0.4 * imp))
            estimated_total_hours += remediation_hours

            gaps.append({
                "skill_id": s_id,
                "skill_name": skill_info["skill_name"],
                "category": skill_info["category"],
                "domain": skill_info["domain"],
                "required_level": req_lvl,
                "current_level": curr_lvl,
                "gap": round(delta, 1),
                "importance": imp,
                "priority": priority,
                "status": status,
                "estimated_hours": remediation_hours
            })

        # Sort gaps: Critical first, then High, Medium, Mastered
        priority_order = {"Critical": 0, "High": 1, "Medium": 2, "Mastered": 3}
        gaps.sort(key=lambda x: (priority_order.get(x["priority"], 9), -x["gap"]))

        gap_percentage = round((gap_points / total_req_points) * 100.0, 1) if total_req_points > 0 else 0.0
        coverage_percentage = max(0.0, round(100.0 - gap_percentage, 1))

        return {
            "career_id": target_career_id,
            "career_title": career_row["career_title"],
            "domain": career_row["domain"],
            "coverage_percentage": coverage_percentage,
            "gap_percentage": gap_percentage,
            "total_skills_required": len(req_skills),
            "proficient_count": proficient_count,
            "developing_count": developing_count,
            "missing_count": missing_count,
            "estimated_remediation_hours": estimated_total_hours,
            "gaps": gaps
        }
