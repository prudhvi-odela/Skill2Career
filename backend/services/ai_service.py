"""
Skill2Career AI & LLM Explanation Service
Provides contextual narrative explanations for skill gaps, career recommendations, and learning strategy.
Uses Google Gemini API if configured, with a domain-aware expert heuristic generator as robust fallback.
"""

import os
from backend.config import settings


class AIService:
    _instance = None

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[AI Service] Gemini client init notice: {e}")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = AIService()
        return cls._instance

    def explain_readiness_and_gaps(
        self,
        student_name: str,
        career_title: str,
        readiness_score: float,
        critical_gaps: list[dict],
        proficient_skills: list[str],
        weekly_study_hours: float
    ) -> str:
        """
        Generates structured, motivating, and actionable advice tailored to student's exact ML evaluation.
        """
        gaps_summary = ", ".join([f"{g.get('skill_name')} (Gap: {g.get('gap')}/5)" for g in critical_gaps[:4]]) or "None detected"
        proficient_summary = ", ".join(proficient_skills[:5]) or "Foundational stages"

        prompt = f"""You are a senior tech career coach analyzing student {student_name}'s job-readiness for '{career_title}'.
ML Model Readiness Score: {readiness_score:.1f}%
Strong Proficient Skills: {proficient_summary}
Critical Priority Skill Gaps: {gaps_summary}
Weekly Study Hours: {weekly_study_hours} hrs/week

Provide a concise, 3-paragraph executive career coaching brief:
1. Candid evaluation of current readiness and strengths.
2. High-impact remediation strategy focusing strictly on the critical skill gaps.
3. Realistic timeline forecast based on study velocity."""

        if self.client:
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"[AI Service] Gemini fallback invoked: {e}")

        # Domain-aware rule-based AI generator (Deterministic & Grounded)
        return self._generate_heuristic_explanation(
            student_name, career_title, readiness_score, critical_gaps, proficient_skills, weekly_study_hours
        )

    def _generate_heuristic_explanation(
        self,
        student_name: str,
        career_title: str,
        readiness_score: float,
        critical_gaps: list[dict],
        proficient_skills: list[str],
        weekly_study_hours: float
    ) -> str:
        tier_text = "exhibits strong core competencies" if readiness_score >= 75 else (
            "has built solid momentum and fundamentals" if readiness_score >= 50 else
            "is in early foundational development"
        )
        
        strengths_part = (
            f"Your existing proficiency in {', '.join(proficient_skills[:3])} gives you an excellent base."
            if proficient_skills else
            "Your profile shows strong potential as you establish your technical baseline."
        )

        top_gap_names = [g.get("skill_name") for g in critical_gaps[:3]]
        if top_gap_names:
            gap_part = (
                f"To accelerate readiness for {career_title}, your highest return-on-investment is closing gaps in "
                f"{', '.join(top_gap_names)}. Focusing on hands-on project implementations rather than passive tutorials "
                f"will dramatically improve your readiness score."
            )
        else:
            gap_part = f"You have met all primary requirements for {career_title}. Focus on building end-to-end portfolio projects and mock technical interviews."

        est_weeks = max(4, int((80.0 - min(80.0, readiness_score)) / (weekly_study_hours * 0.12))) if readiness_score < 75 else 0
        timeline_part = (
            f"At your current commitment of {weekly_study_hours} hours/week, you are projected to reach competitive job-readiness in approximately {est_weeks} weeks."
            if est_weeks > 0 else
            "You are currently positioned within the target hiring threshold for entry-to-mid career roles."
        )

        return f"{student_name} {tier_text} for the **{career_title}** role ({readiness_score:.1f}% Readiness). {strengths_part}\n\n{gap_part}\n\n{timeline_part}"


ai_service = AIService.get_instance()
