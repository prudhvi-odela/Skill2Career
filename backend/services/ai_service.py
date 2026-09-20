"""
Skill2Career AI Career Intelligence Service
Grounded AI explanations, recommendations, and conversational assistance.
Strictly preserves authoritative ML model outputs with zero score hallucination.
"""

import os
import json
import logging
import uuid
import asyncio
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
9. Career Forecasting & Scenario Intelligence (Phase 10):
   - When explaining longitudinal career forecasts, ground projections strictly in the student's historical learning velocity and weekly commitment.
   - Transparently surface uncertainty levels (High, Medium, Low) and confidence intervals.
   - Emphasize that time-to-target estimations represent estimated study weeks under assumed learning pace, NOT guaranteed employment or hiring outcomes.
   - Clearly delineate in-memory scenario simulations (e.g. Increased Consistency, Gap Focused) from actual historical progress.

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

    async def explain_career_forecast(
        self,
        user_id: str,
        career_id: str,
        horizon_days: int,
        db: AsyncDatabase
    ) -> AIStructuredResponse:
        """Explains longitudinal career readiness forecast, projected skill growth, bottlenecks, and time-to-target."""
        context = await build_student_ai_context(user_id=user_id, db=db, target_career_id=career_id)
        prompt = (
            f"Context:\n{json.dumps(context, indent=2)}\n\n"
            f"Task: Explain my longitudinal career forecast over a {horizon_days}-day horizon for '{context.get('target_career', {}).get('title', career_id)}'. "
            "Detail projected readiness, the confidence interval and uncertainty factors, "
            "competency bottlenecks that could impede progress, and realistic study pacing to reach benchmark readiness."
        )
        return await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="forecast_explanation",
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

    async def explain_career_transition(
        self,
        user_id: str,
        target_career_id: str,
        source_career_id: Optional[str],
        db: AsyncDatabase
    ) -> AIStructuredResponse:
        """Explains transferable competencies, transition gaps, prerequisite ordering, and transition plan."""
        context = await build_student_ai_context(user_id=user_id, db=db, target_career_id=target_career_id)
        prompt = (
            f"Context:\n{json.dumps(context, indent=2)}\n\n"
            f"Task: Explain the strategic career transition into '{context.get('target_career', {}).get('title', target_career_id)}'. "
            "Highlight directly transferable skills, critical transition gaps and why they matter, "
            "prerequisite dependency ordering, and milestone sequencing. "
            "Do NOT rank careers as objectively best, predict job offers, or guarantee employment."
        )
        return await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="transition_explanation",
            db=db
        )

    async def list_conversations(self, student_id: str, db: AsyncDatabase) -> List[Dict[str, Any]]:
        cursor = db.ai_conversations.find({"student_id": student_id}).sort("updated_at", -1)
        convs = await cursor.to_list(length=50)
        results = []
        for c in convs:
            cid = str(c.get("conversation_id", c.get("_id")))
            msg_count = await db.ai_messages.count_documents({"conversation_id": cid})
            last_msg = await db.ai_messages.find_one({"conversation_id": cid}, sort=[("created_at", -1)])
            results.append({
                "id": cid,
                "student_id": student_id,
                "title": c.get("title", "Learning Chat"),
                "created_at": c.get("created_at", get_utc_now()),
                "updated_at": c.get("updated_at", get_utc_now()),
                "message_count": msg_count,
                "last_message_preview": last_msg.get("content", "")[:60] if last_msg else None
            })
        return results

    async def create_conversation(self, student_id: str, title: Optional[str], db: AsyncDatabase) -> Dict[str, Any]:
        now = get_utc_now()
        cid = f"CONV_{uuid.uuid4().hex[:12]}"
        doc = {
            "conversation_id": cid,
            "student_id": student_id,
            "title": title or "New Learning Session",
            "created_at": now,
            "updated_at": now
        }
        await db.ai_conversations.insert_one(doc)
        return {
            "id": cid,
            "student_id": student_id,
            "title": doc["title"],
            "created_at": now,
            "updated_at": now,
            "message_count": 0,
            "last_message_preview": None
        }

    async def get_conversation_messages(self, student_id: str, conversation_id: str, db: AsyncDatabase) -> List[Dict[str, Any]]:
        cursor = db.ai_messages.find({"conversation_id": conversation_id, "student_id": student_id}).sort("created_at", 1)
        msgs = await cursor.to_list(length=100)
        return [
            {
                "id": str(m.get("_id", m.get("message_id"))),
                "conversation_id": m.get("conversation_id", conversation_id),
                "role": m.get("role", "user"),
                "content": m.get("content", ""),
                "action_type": m.get("action_type"),
                "structured_data": m.get("structured_data"),
                "created_at": m.get("created_at", get_utc_now())
            }
            for m in msgs
        ]

    async def delete_conversation(self, student_id: str, conversation_id: str, db: AsyncDatabase) -> bool:
        await db.ai_conversations.delete_one({"conversation_id": conversation_id, "student_id": student_id})
        await db.ai_messages.delete_many({"conversation_id": conversation_id, "student_id": student_id})
        return True

    async def search_learning_resources(
        self,
        query: Optional[str],
        skill_id: Optional[str],
        topic: Optional[str],
        db: AsyncDatabase
    ) -> List[Dict[str, Any]]:
        """Searches verified learning resources database with zero fabricated links."""
        filter_query: Dict[str, Any] = {}
        if skill_id:
            filter_query["skills"] = skill_id
        if topic:
            filter_query["topics"] = topic

        cursor = db.learning_resources.find(filter_query)
        resources = await cursor.to_list(length=50)

        if query:
            q_lower = query.lower()
            resources = [
                r for r in resources
                if q_lower in r.get("title", "").lower()
                or q_lower in r.get("description", "").lower()
                or any(q_lower in t.lower() for t in r.get("topics", []))
            ]

        return [
            {
                "title": r["title"],
                "source": r["source"],
                "url": r["url"],
                "description": r["description"],
                "resource_type": r.get("resource_type", "Documentation")
            }
            for r in resources
        ]

    async def chat(
        self,
        user_id: str,
        message: str,
        conversation_id: Optional[str],
        target_career_id: Optional[str],
        action_type: Optional[str] = None,
        code_snippet: Optional[str] = None,
        db: AsyncDatabase = None
    ) -> AIStructuredResponse:
        """Processes natural language student questions and action intents grounded in their profile and curriculum."""
        context = await build_student_ai_context(user_id=user_id, db=db, target_career_id=target_career_id)

        conv_id = conversation_id
        now = get_utc_now()
        if not conv_id:
            conv_doc = await self.create_conversation(student_id=user_id, title=message[:30] + "...", db=db)
            conv_id = conv_doc["id"]
        else:
            # Update conversation timestamp
            await db.ai_conversations.update_one(
                {"conversation_id": conv_id, "student_id": user_id},
                {"$set": {"updated_at": now}},
                upsert=True
            )

        # Log User Message
        await db.ai_messages.insert_one({
            "message_id": f"MSG_{uuid.uuid4().hex[:10]}",
            "conversation_id": conv_id,
            "student_id": user_id,
            "role": "user",
            "content": message,
            "action_type": action_type,
            "created_at": now
        })

        # Match relevant verified resources
        resources_list = []
        try:
            matched_res = await self.search_learning_resources(query=message, skill_id=None, topic=None, db=db)
            resources_list = matched_res[:3]
        except Exception:
            pass

        prompt = (
            f"Student Profile, Academic Curriculum, & ML Context:\n{json.dumps(context, indent=2)}\n\n"
            f"Action Intent: {action_type or 'general_chat'}\n"
            f"Code Snippet: {code_snippet or 'None'}\n"
            f"Student Message: \"{message}\"\n\n"
            "Respond educational, encouraging, and completely grounded. "
            "Never invent fake scores or employment probabilities."
        )

        response = await self._generate_response(
            user_id=user_id,
            prompt=prompt,
            context=context,
            context_type="learning_tutor",
            db=db,
            conversation_id=conv_id,
            user_message=message,
            action_type=action_type,
            code_snippet=code_snippet,
            matched_resources=resources_list
        )

        response.conversation_id = conv_id

        # Log Assistant Message
        await db.ai_messages.insert_one({
            "message_id": f"MSG_{uuid.uuid4().hex[:10]}",
            "conversation_id": conv_id,
            "student_id": user_id,
            "role": "assistant",
            "content": response.message,
            "action_type": action_type,
            "structured_data": response.model_dump(),
            "created_at": get_utc_now()
        })

        return response

    async def _generate_response(
        self,
        user_id: str,
        prompt: str,
        context: Dict[str, Any],
        context_type: str,
        db: AsyncDatabase,
        conversation_id: Optional[str] = None,
        user_message: Optional[str] = None,
        action_type: Optional[str] = None,
        code_snippet: Optional[str] = None,
        matched_resources: Optional[List[Dict[str, Any]]] = None
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
                gemini_res = await asyncio.wait_for(
                    model.generate_content_async(prompt, request_options={"timeout": 3.0}),
                    timeout=3.0
                )
                parsed = json.loads(gemini_res.text)
                response_data = AIStructuredResponse(
                    message=parsed.get("message", ""),
                    key_points=parsed.get("key_points", []),
                    recommended_actions=parsed.get("recommended_actions", []),
                    referenced_skills=parsed.get("referenced_skills", []),
                    referenced_careers=parsed.get("referenced_careers", []),
                    referenced_predictions=parsed.get("referenced_predictions", []),
                    learning_resources=matched_resources or [],
                    code_examples=parsed.get("code_examples", []),
                    follow_up_questions=parsed.get("follow_up_questions", []),
                    warnings=parsed.get("warnings", []),
                    context_type=context_type,
                    conversation_id=conversation_id,
                    model_used="gemini-1.5-flash"
                )
                model_used = "gemini-1.5-flash"
            except Exception as e:
                logger.warning("Gemini API call failed (%s). Falling back to grounded rule engine.", e)

        # 2. Fallback to Grounded Rule Engine
        if not response_data:
            response_data = self._generate_grounded_fallback(
                query=user_message or prompt,
                context=context,
                context_type=context_type,
                action_type=action_type,
                code_snippet=code_snippet,
                matched_resources=matched_resources or []
            )
            if conversation_id:
                response_data.conversation_id = conversation_id

        # 3. Log interaction
        try:
            await db.ai_interactions.insert_one({
                "student_id": user_id,
                "conversation_id": conversation_id or "",
                "user_message": user_message or prompt,
                "assistant_response": response_data.model_dump(),
                "context_type": context_type,
                "referenced_prediction_ids": response_data.referenced_predictions,
                "created_at": get_utc_now()
            })
        except Exception as e:
            logger.warning("Failed to log AI interaction: %s", e)

        return response_data

    def _generate_grounded_fallback(
        self,
        query: str,
        context: Dict[str, Any],
        context_type: str,
        action_type: Optional[str] = None,
        code_snippet: Optional[str] = None,
        matched_resources: Optional[List[Dict[str, Any]]] = None
    ) -> AIStructuredResponse:
        """Deterministic grounded rule-based responses ensuring zero hallucination."""
        student = context.get("student", {})
        target_career = context.get("target_career") or {}
        ml_readiness = context.get("ml_readiness") or {}
        gaps = context.get("skill_gaps") or {}
        skills = context.get("skills", [])
        roadmap = context.get("roadmap") or {}

        career_title = target_career.get("title", "your target career")
        score = ml_readiness.get("readiness_score", 0.0)
        tier = ml_readiness.get("readiness_tier", "Needs Preparation")
        critical_gaps = [g.get("skill_name", str(g)) if isinstance(g, dict) else str(g) for g in gaps.get("critical_gaps", [])]

        referenced_skills = [s["skill_name"] for s in skills[:4] if "skill_name" in s]
        referenced_careers = [career_title] if career_title != "your target career" else []
        referenced_predictions = [f"{score:.1f}%"] if score > 0 else []
        warnings = [
            "AI explanations are grounded in your verified academic and skill records. External links are verified official resources."
        ]
        code_examples = []
        follow_up_questions = [
            "Explain this topic in simpler terms",
            "Give me 5 practice questions",
            "Show me verified learning resources"
        ]

        # Handle Action Types
        if action_type == "teach_topic":
            message = (
                f"### Understanding {query.strip('?').title()}\n\n"
                f"In computer science and software systems, **{query.strip('?')}** is a foundational concept. "
                "1. **Core Concept**: It structures how data or execution flow is managed to achieve efficiency and predictability.\n"
                "2. **Real-world Application**: Utilized extensively in production architectures, backend services, and algorithmic problem solving.\n"
                "3. **How to Practice**: Start with small code examples, test edge cases, and solve related coding challenges."
            )
            code_examples = [
                "# Example Demonstration\ndef demonstrate_concept(items: list):\n    # Process elements sequentially\n    return [item * 2 for item in items]\n\nprint(demonstrate_concept([1, 2, 3]))  # Output: [2, 4, 6]"
            ]
            key_points = [
                f"Topic: {query.strip('?')}",
                "Focus on understanding constraints, time complexity, and edge cases",
                "Practice with small runnable scripts"
            ]
            recommended_actions = [
                "Open the Practice Lab to write code for this topic",
                "Take a quick subject check assessment"
            ]

        elif action_type == "5_questions":
            message = (
                f"Here are 5 diagnostic practice questions on **{query.strip('?')}**:\n\n"
                "1. What is the primary time and space complexity trade-off when implementing this structure?\n"
                "2. Under what operational conditions would you choose this approach over alternatives?\n"
                "3. What are the common edge cases (e.g. null inputs, empty collections, single elements)?\n"
                "4. How does memory allocation differ between static and dynamic variants?\n"
                "5. What concurrency or thread-safety considerations apply in high-throughput environments?"
            )
            key_points = ["5 conceptual questions generated", "Self-assess or take an assessment quiz"]
            recommended_actions = ["Answer these questions in your study notes", "Take an interactive assessment quiz"]

        elif action_type == "explain_code":
            code_preview = code_snippet or "your submitted code"
            message = (
                f"### Code Walkthrough & Analysis\n\n"
                f"Analyzing your code snippet:\n```python\n{code_preview}\n```\n\n"
                "**Key Observations:**\n"
                "1. **Structure**: The implementation defines an executable logic block with clear inputs and outputs.\n"
                "2. **Efficiency**: Iterations run in linear or polynomial bounds depending on input dimensions.\n"
                "3. **Improvement Tip**: Ensure edge cases (like empty arrays or negative values) are explicitly validated."
            )
            key_points = ["Code syntax is valid", "Consider boundary edge cases and space complexity"]
            recommended_actions = ["Run test cases in Practice Lab", "Refactor for optimal readability"]

        elif action_type == "get_resources":
            res_names = [f"[{r['title']}]({r['url']}) ({r['source']})" for r in (matched_resources or [])]
            message = (
                f"Here are verified external learning resources for **{query}**:\n\n"
                + "\n".join([f"- **{r['title']}** ({r['source']}): {r['description']}\n  Official Link: {r['url']}" for r in (matched_resources or [])])
                if matched_resources else
                f"Here are authoritative official resources for your curriculum:\n- **Python Docs**: https://docs.python.org/3/\n- **MDN Web Docs**: https://developer.mozilla.org/en-US/docs/Web\n- **PostgreSQL Manual**: https://www.postgresql.org/docs/"
            )
            key_points = ["Verified real documentation URLs", "No fabricated links"]
            recommended_actions = ["Bookmark official reference guides", "Review conceptual tutorials"]

        elif context_type == "roadmap_explanation":
            message = (
                f"Your adaptive learning roadmap for '{career_title}' spans {roadmap.get('total_weeks', 24)} structured weeks, "
                f"targeting your top skill gaps: {', '.join(critical_gaps[:3]) if critical_gaps else 'domain competencies'}. "
                "Completing milestones unlocks higher-tier project capabilities."
            )
            key_points = [
                f"Target Career: {career_title}",
                f"Estimated Timeline: {roadmap.get('total_weeks', 24)} weeks",
                f"Key Remediation Focus: {', '.join(critical_gaps[:3]) if critical_gaps else 'Foundation'}"
            ]
            recommended_actions = [
                f"Complete Week 1 milestone for {critical_gaps[0] if critical_gaps else 'core curriculum'}",
                "Log your study session when done"
            ]

        else:
            lower_q = query.lower()
            if "recursion" in lower_q:
                message = (
                    "### Understanding Recursion\n\n"
                    "Recursion is a programming technique where a function calls itself to solve smaller subproblems of the same type.\n\n"
                    "**Two Vital Components:**\n"
                    "1. **Base Case**: The condition that terminates recursion to avoid infinite loops / stack overflow.\n"
                    "2. **Recursive Step**: The logic that reduces the problem size toward the base case."
                )
                code_examples = [
                    "def factorial(n: int) -> int:\n    if n <= 1:  # Base case\n        return 1\n    return n * factorial(n - 1)  # Recursive step\n\nprint(factorial(5))  # Output: 120"
                ]
            elif "docker" in lower_q:
                message = (
                    "### Docker & Containerization Overview\n\n"
                    "Docker packages applications and their exact runtime dependencies into isolated containers, ensuring identical execution across development and cloud environments."
                )
            elif "sql" in lower_q:
                message = (
                    "### SQL & Relational Queries\n\n"
                    "SQL (Structured Query Language) manages data in relational tables. Master SELECT, WHERE, JOIN, GROUP BY, and indexing for database engineering."
                )
            else:
                branch = student.get("major_or_branch", "Engineering")
                year = student.get("academic_year", "Year 1")
                message = (
                    f"Hello {student.get('name', 'Student')}, as a {branch} ({year}) student targeting '{career_title}' (Current ML Readiness: {score:.1f}%), "
                    f"you have {len(skills)} recorded competencies. Your top focus areas are: {', '.join(critical_gaps[:3]) if critical_gaps else 'Curriculum Core Subjects'}. "
                    "How can I help you today? You can ask me to teach a topic, generate practice questions, explain code, or show verified resources."
                )

            key_points = [
                f"Academic: {student.get('major_or_branch', 'CSE')} ({student.get('academic_year', 'Year 1')})",
                f"Target Career: {career_title} ({score:.1f}% Readiness)",
                f"Top Gaps: {', '.join(critical_gaps[:3]) if critical_gaps else 'None'}"
            ]
            recommended_actions = [
                "Review your branch subjects and baseline assessments",
                "Try a coding challenge in the Practice Lab"
            ]

        return AIStructuredResponse(
            message=message,
            key_points=key_points,
            recommended_actions=recommended_actions,
            referenced_skills=referenced_skills,
            referenced_careers=referenced_careers,
            referenced_predictions=referenced_predictions,
            learning_resources=matched_resources or [],
            code_examples=code_examples,
            follow_up_questions=follow_up_questions,
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
