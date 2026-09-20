"""
Skill2Career AI Career Intelligence Service
Grounded AI explanations, recommendations, and conversational assistance.
Strictly preserves authoritative ML model outputs with zero score hallucination.
"""

import os
import json
import logging
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime
from pymongo.asynchronous.database import AsyncDatabase

from backend.config import settings
from backend.schemas.ai_schemas import AIStructuredResponse
from backend.services.ai_context_builder import build_student_ai_context
from backend.database.mongodb import get_utc_now

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are the Skill2Career AI Career Intelligence Assistant.
Your mission is to provide personalized, grounded, and supportive career coaching to university students based strictly on their verified profile, trained machine learning models, and external market intelligence.

CORE OPERATING PRINCIPLES:
1. ML Predicts, AI Explains: Treat the provided ML readiness score, tier, top strengths, and top gaps as authoritative ground truth. Never override or invent numerical prediction scores.
2. Market Intelligence Grounding:
   - External market signals (demand score, growth trend, sample size) provide macro industry context.
   - Distinguish external market demand from the student's individual readiness benchmark.
   - Never invent market numbers or claim live real-time web scraping when data is from benchmark surveys.
   - When a market signal is marked as fallback or unavailable, explicitly state that live market demand is unobserved and a neutral baseline benchmark was applied, rather than citing it as real observed industry demand.
   - Note data freshness or expiration when relevant.
3. Zero Hallucination: Do not fabricate skills, projects, certifications, test scores, or career requirements. Only reference data present in the provided student context.
4. Provenance & Terminology:
   - Refer to career salary figures as "Industry Benchmark Data".
   - Refer to prediction intervals/margins as "Model Prediction Intervals".
   - Refer to retention multipliers as "Simulation Scenario Assumptions".
   - Never guarantee employment or job offers.
5. Actionable Guidance: Provide concrete, achievable study and portfolio actions to bridge verified skill gaps prioritizing high-demand competencies.
6. Learning Evidence Grounding:
   - When explaining skill proficiency or progress, reference verified evidence artifacts (passed assessments, complex projects, verified certifications).
   - Do not claim mastery unless supported by verified evidence. Distinguish demonstrated evidence from unverified participation.
7. Learning Intelligence & Trajectory Grounding:
   - When discussing momentum, learning velocity, consistency streaks, or stagnation status, ground observations strictly in the provided `learning_intelligence` metrics.
   - Do not confuse analytical trajectory confidence with machine learning model prediction confidence.
   - Do not guarantee employment or predict future salary outcomes based on learning velocity.
8. Career Readiness & Evidence Interpretation (Phase 09C):
   - When explaining career readiness, synthesize skill alignment, verified evidence coverage, trajectory momentum, and external market signals.
   - Explain what remains missing, why specific skills are critical, and which evidence artifacts substantiate the evaluation.
   - Never calculate a new readiness percentage, modify authoritative skill levels, or guarantee hiring.

OUTPUT FORMAT:
You must respond with valid JSON matching this schema:
{
  "message": "Clear, friendly, and structured narrative explaining the insights.",
  "key_points": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"],
  "recommended_actions": ["Specific actionable step 1", "Specific actionable step 2"],
  "referenced_skills": ["SkillName1", "SkillName2"],
  "referenced_careers": ["CareerTitle"],
  "referenced_predictions": ["PredictionId or ReadinessScore%"],
  "warnings": ["Ethical, freshness, or missing profile disclaimers if any"]
}
"""


class CareerAIService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.provider = settings.AI_PROVIDER
        self.model_name = settings.AI_MODEL_NAME

    def explain_readiness_and_gaps(
        self,
        student_name: str,
        career_title: str,
        readiness_score: float,
        critical_gaps: list,
        proficient_skills: list,
        weekly_study_hours: float
    ) -> str:
        """Synchronous helper for inline prediction narratives."""
        gap_names = [g.get("skill_name", str(g)) if isinstance(g, dict) else str(g) for g in critical_gaps[:3]]
        prof_names = [p.get("skill_name", str(p)) if isinstance(p, dict) else str(p) for p in proficient_skills[:3]]

        if readiness_score >= 75.0:
            tier_msg = "demonstrates strong competitive readiness"
        elif readiness_score >= 50.0:
            tier_msg = "is on a solid developing track"
        else:
            tier_msg = "requires targeted skill remediation"

        return (
            f"Hello {student_name}, your current ML Job-Readiness evaluation for '{career_title}' is {readiness_score:.1f}%, which {tier_msg}. "
            f"Your key technical strengths include {', '.join(prof_names) if prof_names else 'your foundational coursework'}. "
            f"To accelerate readiness, prioritize closing critical gaps in {', '.join(gap_names) if gap_names else 'advanced competencies'}."
        )

    async def explain_readiness(self, user_id: str, db: AsyncDatabase) -> AIStructuredResponse:
        """Explains why the student's ML readiness score is at its current value."""
        context = await build_student_ai_context(user_id=user_id, db=db)
        prompt = (
            f"Context:\n{json.dumps(context, indent=2)}\n\n"
            "Task: Explain why my ML Job-Readiness Score is at its current level. "
            "Detail the positive feature drivers and negative gap bottlenecks identified by the model."
        )
        return await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="readiness_explanation",
            db=db
        )

    async def explain_skill_gap(
        self,
        user_id: str,
        career_id: Optional[str],
        skill_id: Optional[str],
        db: AsyncDatabase
    ) -> AIStructuredResponse:
        """Explains why specific missing skills matter for the target career."""
        context = await build_student_ai_context(user_id=user_id, db=db, target_career_id=career_id)
        specific_clause = f"Focus particularly on skill ID '{skill_id}'." if skill_id else "Focus on the critical priority gaps."
        prompt = (
            f"Context:\n{json.dumps(context, indent=2)}\n\n"
            f"Task: Explain why my missing skills are critical for the role of {context.get('target_career', {}).get('title', 'target role')}. "
            f"{specific_clause} Explain the remediation roadmap required to close the gap."
        )
        return await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="skill_gap_explanation",
            db=db
        )

    async def get_next_best_action(
        self,
        user_id: str,
        career_id: Optional[str],
        db: AsyncDatabase
    ) -> AIStructuredResponse:
        """Recommends the single highest ROI learning action based on gaps and roadmap."""
        context = await build_student_ai_context(user_id=user_id, db=db, target_career_id=career_id)
        prompt = (
            f"Context:\n{json.dumps(context, indent=2)}\n\n"
            "Task: Recommend my Next Best Learning Action. Prioritize by highest impact on closing critical skill gaps "
            "and progressing on my weekly roadmap milestones."
        )
        return await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="next_action",
            db=db
        )

    async def explain_recommendations(
        self,
        user_id: str,
        career_id: Optional[str],
        db: AsyncDatabase
    ) -> AIStructuredResponse:
        """Explains why specific skills are ranked in the recommendation engine."""
        context = await build_student_ai_context(user_id=user_id, db=db, target_career_id=career_id)
        prompt = (
            f"Context:\n{json.dumps(context, indent=2)}\n\n"
            "Task: Explain my top prioritized skill recommendations. "
            "Detail why each skill was ranked in its priority band (URGENT/HIGH/MODERATE/LOW), "
            "how prerequisite dependencies influence the sequence, and how external market demand supports the priority."
        )
        return await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="recommendation_explanation",
            db=db
        )

    async def explain_roadmap(
        self,
        user_id: str,
        career_id: Optional[str],
        db: AsyncDatabase
    ) -> AIStructuredResponse:
        """Explains the multi-phase adaptive roadmap structure and milestones."""
        context = await build_student_ai_context(user_id=user_id, db=db, target_career_id=career_id)
        prompt = (
            f"Context:\n{json.dumps(context, indent=2)}\n\n"
            "Task: Explain the progression of my multi-phase adaptive learning roadmap. "
            "Detail how Phase 1 (Foundations), Phase 2 (Core Systems), and Phase 3 (Capstone Validation) "
            "guide me toward career readiness."
        )
        return await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="roadmap_explanation",
            db=db
        )

    async def explain_career_match(
        self,
        user_id: str,
        career_id: str,
        db: AsyncDatabase
    ) -> AIStructuredResponse:
        """Explains why a specific career matches the student's profile."""
        context = await build_student_ai_context(user_id=user_id, db=db, target_career_id=career_id)
        prompt = (
            f"Context:\n{json.dumps(context, indent=2)}\n\n"
            f"Task: Explain why the career role '{context.get('target_career', {}).get('title', career_id)}' matches or differs from my current skill profile."
        )
        return await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="career_explanation",
            db=db
        )

    async def explain_trajectory(
        self,
        user_id: str,
        weekly_hours: float,
        consistency: float,
        db: AsyncDatabase
    ) -> AIStructuredResponse:
        """Explains the factors influencing the projected trajectory without fabricating predictions."""
        context = await build_student_ai_context(user_id=user_id, db=db)
        prompt = (
            f"Context:\n{json.dumps(context, indent=2)}\n\n"
            f"Task: Explain the projected 24-week trajectory under a simulated commitment of {weekly_hours} hours/week "
            f"and a simulation pace assumption of {consistency}x. Clarify what assumptions drive the growth curve."
        )
        return await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="trajectory_explanation",
            db=db
        )

    async def explain_career_readiness(
        self,
        user_id: str,
        career_id: str,
        db: AsyncDatabase
    ) -> AIStructuredResponse:
        """Explains career-specific readiness, evidence coverage, strengths, and gaps."""
        context = await build_student_ai_context(user_id=user_id, db=db, target_career_id=career_id)
        prompt = (
            f"Context:\n{json.dumps(context, indent=2)}\n\n"
            f"Task: Explain my comprehensive career readiness for '{context.get('target_career', {}).get('title', career_id)}'. "
            "Detail my demonstrated strengths with supporting evidence, critical gaps needing remediation, "
            "how my learning trajectory influences progress, and how external market demand contextualizes this path."
        )
        return await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="career_readiness_explanation",
            db=db
        )

    async def chat(
        self,
        user_id: str,
        message: str,
        conversation_id: Optional[str],
        target_career_id: Optional[str],
        db: AsyncDatabase
    ) -> AIStructuredResponse:
        """Processes natural language student questions grounded in their profile."""
        context = await build_student_ai_context(user_id=user_id, db=db, target_career_id=target_career_id)
        prompt = (
            f"Student Profile & ML Context:\n{json.dumps(context, indent=2)}\n\n"
            f"Student Question: \"{message}\"\n\n"
            "Answer the student's question accurately using only their actual data and ML results. "
            "If the required information is not in the context, explicitly state that you do not have sufficient data."
        )
        conv_id = conversation_id or str(uuid.uuid4())
        return await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="career_chat",
            db=db,
            conversation_id=conv_id,
            user_message=message
        )

    async def _generate_response(
        self,
        user_id: str,
        prompt: str,
        context: Dict[str, Any],
        context_type: str,
        db: AsyncDatabase,
        conversation_id: Optional[str] = None,
        user_message: Optional[str] = None
    ) -> AIStructuredResponse:
        """Executes LLM inference with graceful, deterministic grounded fallback and logs interaction."""
        response_data: Optional[AIStructuredResponse] = None
        model_used = "deterministic-grounded-engine"

        # 1. Try Google Gemini API if configured
        if self.gemini_key and (self.provider in ("gemini", "auto")):
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=SYSTEM_PROMPT,
                    generation_config={"response_mime_type": "application/json", "temperature": 0.2}
                )
                gemini_res = await model.generate_content_async(prompt)
                parsed = json.loads(gemini_res.text)
                response_data = AIStructuredResponse(
                    message=parsed.get("message", ""),
                    key_points=parsed.get("key_points", []),
                    recommended_actions=parsed.get("recommended_actions", []),
                    referenced_skills=parsed.get("referenced_skills", []),
                    referenced_careers=parsed.get("referenced_careers", []),
                    referenced_predictions=parsed.get("referenced_predictions", []),
                    warnings=parsed.get("warnings", []),
                    context_type=context_type,
                    model_used="gemini-1.5-flash"
                )
                model_used = "gemini-1.5-flash"
            except Exception as e:
                logger.warning("Gemini API call failed (%s). Falling back to grounded rule engine.", e)

        # 2. Try OpenAI API if configured and Gemini not used
        if not response_data and self.openai_key and (self.provider in ("openai", "auto")):
            try:
                import openai
                client = openai.AsyncOpenAI(api_key=self.openai_key)
                completion = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2
                )
                parsed = json.loads(completion.choices[0].message.content or "{}")
                response_data = AIStructuredResponse(
                    message=parsed.get("message", ""),
                    key_points=parsed.get("key_points", []),
                    recommended_actions=parsed.get("recommended_actions", []),
                    referenced_skills=parsed.get("referenced_skills", []),
                    referenced_careers=parsed.get("referenced_careers", []),
                    referenced_predictions=parsed.get("referenced_predictions", []),
                    warnings=parsed.get("warnings", []),
                    context_type=context_type,
                    model_used="gpt-4o-mini"
                )
                model_used = "gpt-4o-mini"
            except Exception as e:
                logger.warning("OpenAI API call failed (%s). Falling back to grounded rule engine.", e)

        # 3. Grounded Deterministic Fallback Engine (Guaranteed 100% Availability)
        if not response_data:
            response_data = self._generate_grounded_fallback(context, context_type, user_message or prompt)
            model_used = response_data.model_used

        # 4. Persist Interaction into MongoDB `ai_interactions` collection
        try:
            interaction_doc = {
                "student_id": user_id,
                "conversation_id": conversation_id or str(uuid.uuid4()),
                "user_message": user_message or context_type,
                "assistant_response": response_data.model_dump(),
                "context_type": context_type,
                "referenced_prediction_ids": [context.get("ml_readiness", {}).get("prediction_id")] if context.get("ml_readiness") else [],
                "model_used": model_used,
                "created_at": get_utc_now()
            }
            await db.ai_interactions.insert_one(interaction_doc)
        except Exception as e:
            logger.error("Failed to persist AI interaction to MongoDB: %s", e)

        return response_data

    def _generate_grounded_fallback(
        self,
        context: Dict[str, Any],
        context_type: str,
        query: str
    ) -> AIStructuredResponse:
        """
        Deterministic, grounded AI rule engine that contextualizes real MongoDB + ML state
        with zero hallucination when external LLM endpoints are unavailable.
        """
        student = context.get("student", {})
        target_career = context.get("target_career") or {}
        ml_readiness = context.get("ml_readiness") or {}
        gaps = context.get("skill_gaps") or {}
        roadmap = context.get("roadmap") or {}
        skills = context.get("skills", [])

        score = ml_readiness.get("readiness_score", 0.0)
        tier = ml_readiness.get("readiness_tier", "Needs Preparation")
        career_title = target_career.get("title", "Target Technical Role")
        prediction_id = ml_readiness.get("prediction_id", "N/A")

        strengths = [s.get("feature", s) if isinstance(s, dict) else str(s) for s in ml_readiness.get("top_strengths", [])]
        gap_items = gaps.get("gaps", [])
        critical_gaps = [g.get("skill_name") for g in gap_items if g.get("priority") == "Critical"]
        high_gaps = [g.get("skill_name") for g in gap_items if g.get("priority") == "High"]

        referenced_skills = list(set(strengths[:3] + critical_gaps[:3] + high_gaps[:2]))
        referenced_careers = [career_title]
        referenced_predictions = [f"{score}% (ID: {prediction_id})"]
        warnings = [
            "Market salary figures represent static benchmark dataset entries.",
            "Predictions are computed by the registered Random Forest model and do not guarantee hiring."
        ]

        if context_type == "readiness_explanation":
            message = (
                f"Your current ML Job-Readiness Score for {career_title} is evaluated at {score}% ({tier}). "
                f"This prediction is driven primarily by your strengths in {', '.join(strengths[:3]) if strengths else 'academic foundation'}, "
                f"offset by critical competency gaps in {', '.join(critical_gaps[:3]) if critical_gaps else 'domain specialization'}."
            )
            key_points = [
                f"Authoritative Readiness Score: {score}% ({tier})",
                f"Skill Coverage: {gaps.get('coverage_percentage', 0)}% of required role competencies met",
                f"Identified {len(critical_gaps)} critical priority skill gaps requiring remediation"
            ]
            recommended_actions = [
                f"Focus immediate study on critical gaps: {', '.join(critical_gaps[:2]) if critical_gaps else 'core skills'}",
                "Take diagnostic quizzes to verify unverified competencies in your skill inventory",
                "Complete active weekly milestones in your personalized learning roadmap"
            ]

        elif context_type == "skill_gap_explanation":
            message = (
                f"For the role of {career_title}, your profile currently exhibits {len(critical_gaps)} critical gaps "
                f"and {len(high_gaps)} high-priority gaps. Closing these gaps requires approximately "
                f"~{gaps.get('estimated_remediation_hours', 0)} hours of guided learning."
            )
            key_points = [
                f"Top Gaps to Address: {', '.join(critical_gaps[:3]) if critical_gaps else 'None'}",
                f"Estimated Total Remediation: ~{gaps.get('estimated_remediation_hours', 0)} study hours",
                f"Verified Proficient Skills: {gaps.get('proficient_count', 0)}/{gaps.get('total_skills_required', 0)}"
            ]
            recommended_actions = [
                f"Prioritize Week 1 roadmap milestones for {critical_gaps[0] if critical_gaps else 'target skills'}",
                "Build a hands-on project demonstrating these skills with a public GitHub repository"
            ]

        elif context_type == "next_action":
            next_ms = roadmap.get("next_milestones", [])
            first_ms = next_ms[0] if next_ms else None
            if first_ms:
                action_text = f"Work on Week {first_ms.get('week')} milestone: '{first_ms.get('milestone')}' for {first_ms.get('skill')} (~{first_ms.get('estimated_hours')} hrs)."
            elif critical_gaps:
                action_text = f"Begin dedicated remediation for your #1 critical skill gap: {critical_gaps[0]}."
            else:
                action_text = "Take skill assessment quizzes to verify existing self-reported competencies."

            message = (
                f"Your highest-leverage next step is: {action_text} "
                "This action directly targets the largest feature gap penalty in your ML readiness evaluation."
            )
            key_points = [
                f"Next Milestone: {action_text}",
                f"Target Role: {career_title}",
                f"Active Study Commitment: {student.get('weekly_study_hours', 15)} hrs/week"
            ]
            recommended_actions = [
                action_text,
                "Log your completed study hours and check off the milestone on your roadmap"
            ]

        elif context_type == "trajectory_explanation":
            message = (
                f"Your 24-week trajectory forecaster simulates career readiness growth based on your {student.get('weekly_study_hours', 15)} hrs/week "
                "study commitment. Please note that velocity multipliers are user-defined simulation scenario assumptions rather than trained ML parameters."
            )
            key_points = [
                f"Baseline Readiness: {score}%",
                "Pace Multipliers represent scenario assumptions for retention velocity",
                "75% Job-Ready threshold is reachable through consistent milestone completion"
            ]
            recommended_actions = [
                "Maintain steady weekly study hours without long hiatuses",
                "Verify skills with assessments to validate actual retention"
            ]

        else:  # General Chat Fallback
            lower_q = query.lower()
            if "why" in lower_q and "not ready" in lower_q:
                message = (
                    f"Your current readiness score is {score}% ({tier}) for {career_title}. "
                    f"The ML model penalizes gaps in {', '.join(critical_gaps[:3]) if critical_gaps else 'advanced competencies'}. "
                    "Closing these verified gaps and building complex portfolio projects will boost your readiness score."
                )
            elif "what should i learn" in lower_q or "learn first" in lower_q:
                message = (
                    f"You should prioritize {', '.join(critical_gaps[:2]) if critical_gaps else 'your top missing competencies'} "
                    f"as they have the highest feature importance weights for {career_title}."
                )
            elif "project" in lower_q:
                message = (
                    f"To strengthen your application for {career_title}, build a project that integrates "
                    f"{', '.join(critical_gaps[:2] if critical_gaps else ['modern frameworks', 'cloud deployment'])} with public GitHub evidence."
                )
            else:
                message = (
                    f"Based on your profile for {career_title} (Readiness: {score}%), you have {len(skills)} recorded skills "
                    f"({student.get('verified_skills_count', 0)} verified) and {gaps.get('coverage_percentage', 0)}% competency coverage. "
                    f"Your top priority is closing gaps in {', '.join(critical_gaps[:2]) if critical_gaps else 'target technical domains'}."
                )

            key_points = [
                f"Current Readiness: {score}% ({tier})",
                f"Target Career: {career_title}",
                f"Critical Gaps: {', '.join(critical_gaps[:3]) if critical_gaps else 'None'}"
            ]
            recommended_actions = [
                f"Review Week 1-4 roadmap milestones for {career_title}",
                "Take skill assessment quizzes to elevate verified profile credibility"
            ]

        return AIStructuredResponse(
            message=message,
            key_points=key_points,
            recommended_actions=recommended_actions,
            referenced_skills=referenced_skills,
            referenced_careers=referenced_careers,
            referenced_predictions=referenced_predictions,
            warnings=warnings,
            context_type=context_type,
            model_used="deterministic-grounded-engine"
        )


# Singleton instance
_ai_service: Optional[CareerAIService] = None

def get_ai_service() -> CareerAIService:
    global _ai_service
    if _ai_service is None:
        _ai_service = CareerAIService()
    return _ai_service

ai_service = get_ai_service()
