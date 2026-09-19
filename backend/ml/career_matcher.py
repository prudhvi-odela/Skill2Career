"""
Skill2Career - Career Matching Engine
Maps student skill profiles to industry career roles using weighted vector similarity.
"""

import json
import os
import pandas as pd
import numpy as np


class CareerMatcher:
    def __init__(self, careers_csv_path=None, skills_csv_path=None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.careers_csv_path = careers_csv_path or os.path.join(base_dir, "data", "career_roles_skills.csv")
        self.skills_csv_path = skills_csv_path or os.path.join(base_dir, "data", "skills_taxonomies.csv")
        self._load_data()

    def _load_data(self):
        self.careers_df = pd.read_csv(self.careers_csv_path)
        self.skills_df = pd.read_csv(self.skills_csv_path)
        self.skills_dict = {row["skill_id"]: row.to_dict() for _, row in self.skills_df.iterrows()}
        
        # Build alias lookup map for flexible matching
        self.alias_to_id = {}
        for _, row in self.skills_df.iterrows():
            s_id = row["skill_id"]
            self.alias_to_id[row["skill_name"].lower()] = s_id
            if pd.notna(row["aliases"]):
                for alias in str(row["aliases"]).split(","):
                    self.alias_to_id[alias.strip().lower()] = s_id

    def resolve_skill_id(self, skill_name_or_id):
        """Resolves a skill name or alias to canonical skill_id."""
        if skill_name_or_id in self.skills_dict:
            return skill_name_or_id
        return self.alias_to_id.get(str(skill_name_or_id).strip().lower(), None)

    def match_student_to_careers(self, student_skills_list):
        """
        student_skills_list: List of dicts, e.g. [{"skill_id": "SK001", "level": 4}, ...]
                            or [{"skill_name": "Python", "level": 4}, ...]
        Returns a list of ranked career matches with match percentage, coverage, and breakdown.
        """
        # Normalize student skills into {skill_id: level}
        student_map = {}
        for item in student_skills_list:
            s_id = item.get("skill_id") or self.resolve_skill_id(item.get("skill_name") or item.get("name"))
            if s_id:
                student_map[s_id] = float(item.get("level", item.get("proficiency_level", 1.0)))

        results = []
        for _, career_row in self.careers_df.iterrows():
            career_id = career_row["career_id"]
            title = career_row["career_title"]
            domain = career_row["domain"]
            salary = float(career_row["avg_salary_usd"])
            req_skills = json.loads(career_row["required_skills_json"])

            total_weight = 0.0
            earned_weight = 0.0
            matched_items = []
            missing_items = []

            for req in req_skills:
                s_id = req["skill_id"]
                req_level = float(req["required_level"])
                importance = float(req["importance"])
                total_weight += importance * req_level

                skill_meta = self.skills_dict.get(s_id, {"skill_name": s_id, "category": "General"})
                skill_name = skill_meta.get("skill_name", s_id)

                if s_id in student_map:
                    stu_level = student_map[s_id]
                    # Score contribution capped at required level
                    effective_level = min(req_level, stu_level)
                    earned_weight += importance * effective_level
                    
                    matched_items.append({
                        "skill_id": s_id,
                        "skill_name": skill_name,
                        "current_level": stu_level,
                        "required_level": req_level,
                        "importance": importance,
                        "is_proficient": stu_level >= req_level
                    })
                else:
                    missing_items.append({
                        "skill_id": s_id,
                        "skill_name": skill_name,
                        "required_level": req_level,
                        "importance": importance
                    })

            match_pct = round((earned_weight / total_weight) * 100.0, 1) if total_weight > 0 else 0.0

            results.append({
                "career_id": career_id,
                "career_title": title,
                "domain": domain,
                "avg_salary_usd": salary,
                "match_percentage": match_pct,
                "matched_skills_count": len(matched_items),
                "total_required_skills": len(req_skills),
                "matched_skills": matched_items,
                "missing_skills": missing_items,
                "fit_category": "Strong Match" if match_pct >= 75 else ("Moderate Match" if match_pct >= 50 else "Growth Opportunity")
            })

        # Rank by match_percentage descending
        results.sort(key=lambda x: x["match_percentage"], reverse=True)
        for rank, item in enumerate(results, 1):
            item["rank"] = rank

        return results
