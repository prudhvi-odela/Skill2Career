"""
Skill2Career - Adaptive Multi-Phase Roadmap Service
Transforms prioritized recommendations and dependency graphs into an ordered,
versioned, multi-phase adaptive learning journey persisted in MongoDB.
"""

from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timezone
from pymongo.asynchronous.database import AsyncDatabase

from backend.services.recommendation_service import RecommendationService
from backend.services.market_intelligence_service import MarketIntelligenceService
from backend.ml.inference import MLInferenceService
from backend.database.mongodb import get_utc_now, serialize_doc, serialize_docs


class AdaptiveRoadmapService:
    def __init__(self):
        self.rec_service = RecommendationService()
        self.market_service = MarketIntelligenceService()
        self.ml_service = MLInferenceService.get_instance()

    async def generate_or_get_adaptive_roadmap(
        self,
        student_id: str,
        target_career_id: Optional[str],
        db: AsyncDatabase,
        force_regenerate: bool = False
    ) -> Dict[str, Any]:
        """
        Retrieves current active roadmap for student, or generates a new versioned adaptive roadmap.
        """
        profile = await db.student_profiles.find_one({"user_id": student_id})
        effective_career_id = target_career_id or profile.get("target_career_id")
        if not effective_career_id:
            raise ValueError("No target career specified. Please select a target career to generate your learning roadmap.")

        if not force_regenerate:
            existing = await db.roadmaps.find_one({
                "student_id": student_id,
                "career_id": effective_career_id,
                "is_current": True
            })
            if existing and "phases" in existing:
                return serialize_doc(existing)

        # Generate new versioned roadmap
        return await self._build_and_persist_roadmap(
            student_id=student_id,
            profile=profile,
            career_id=effective_career_id,
            db=db
        )

    async def _build_and_persist_roadmap(
        self,
        student_id: str,
        profile: Dict[str, Any],
        career_id: str,
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        career_doc = await db.career_roles.find_one({
            "$or": [{"career_code": career_id}, {"_id": career_id}]
        })
        career_title = career_doc.get("title", career_id) if career_doc else career_id

        # 1. Generate prioritized recommendations
        recommendations = await self.rec_service.generate_recommendations_for_student(
            student_id=student_id,
            career_id=career_id,
            db=db
        )

        # 2. Retrieve Authoritative ML readiness benchmark & market demand
        latest_pred = await db.readiness_predictions.find_one(
            {"student_id": student_id, "career_id": career_id},
            sort=[("created_at", -1)]
        )
        ml_score = float(latest_pred.get("readiness_score", 65.0)) if latest_pred else 65.0

        career_mkt = await self.market_service.get_career_market_signal(career_id, db)
        market_demand = float(career_mkt.get("demand_score", 85.0))

        # 3. Partition recommendations into 3 Adaptive Phases
        # Phase 1: High priority prerequisites & fundamentals
        # Phase 2: Core professional competencies & system building
        # Phase 3: Advanced specializations, capstone portfolio & validation
        phase1_skills = [r for r in recommendations if not r.get("prerequisites_met", True) or r["priority_band"] == "URGENT"][:4]
        if not phase1_skills:
            phase1_skills = recommendations[:3]

        remaining_after_p1 = [r for r in recommendations if r not in phase1_skills]
        phase2_skills = [r for r in remaining_after_p1 if r["priority_band"] in ["HIGH", "MODERATE"]][:4]
        if not phase2_skills and remaining_after_p1:
            phase2_skills = remaining_after_p1[:3]

        remaining_after_p2 = [r for r in remaining_after_p1 if r not in phase2_skills]
        phase3_skills = remaining_after_p2[:4]

        # Milestone Resource Catalog
        resource_map = {
            "SK001": [{"title": "Python 3 Official Standard Tutorial", "url": "https://docs.python.org/3/tutorial/"}],
            "SK002": [{"title": "Modern JavaScript ES6+ & Async Patterns", "url": "https://javascript.info/"}],
            "SK003": [{"title": "TypeScript Handbook & Generics", "url": "https://www.typescriptlang.org/docs/"}],
            "SK008": [{"title": "Relational Database SQL & Query Indexing", "url": "https://use-the-index-luke.com/"}],
            "SK009": [{"title": "React 18 Declarative Components & Hooks", "url": "https://react.dev/"}],
            "SK015": [{"title": "FastAPI High-Throughput Async REST APIs", "url": "https://fastapi.tiangolo.com/"}],
            "SK026": [{"title": "Pandas & NumPy Vectorized Operations", "url": "https://pandas.pydata.org/docs/"}],
            "SK027": [{"title": "Scikit-Learn ML Pipelines & Validation", "url": "https://scikit-learn.org/stable/"}],
            "SK028": [{"title": "PyTorch Neural Networks & Tensors", "url": "https://pytorch.org/tutorials/"}],
            "SK032": [{"title": "LLMs & RAG Vector Retrieval Architectures", "url": "https://huggingface.co/"}],
            "SK034": [{"title": "Docker Multi-Stage Containerization", "url": "https://docs.docker.com/"}],
            "SK040": [{"title": "LeetCode Algorithms & Data Structures", "url": "https://leetcode.com/explore/"}],
            "SK041": [{"title": "System Design Primer & Distributed Systems", "url": "https://github.com/donnemartin/system-design-primer"}]
        }

        def build_phase_milestones(skill_recs: List[Dict[str, Any]], phase_num: int) -> List[Dict[str, Any]]:
            milestones = []
            for r in skill_recs:
                s_id = r["skill_id"]
                s_name = r["skill_name"]
                res = resource_map.get(s_id, [{"title": f"{s_name} Documentation & Reference", "url": "https://devdocs.io/"}])

                # Concept milestone
                milestones.append({
                    "id": f"ms_{uuid.uuid4().hex[:8]}",
                    "title": f"Master {s_name} Core Principles & Syntax",
                    "description": f"Target proficiency jump from {r['student_proficiency']:.1f} to {min(5.0, r['student_proficiency'] + 1.0):.1f}. Study core architectures and foundational patterns.",
                    "skill_id": s_id,
                    "skill_name": s_name,
                    "milestone_type": "concept",
                    "estimated_hours": float(r.get("estimated_planning_hours", 20)) * 0.4,
                    "resources": res,
                    "is_completed": False,
                    "completed_at": None
                })
                # Practical feature milestone
                milestones.append({
                    "id": f"ms_{uuid.uuid4().hex[:8]}",
                    "title": f"Implement Practical Hands-On Feature with {s_name}",
                    "description": f"Build and test a runnable module applying {s_name} in the context of {career_title}.",
                    "skill_id": s_id,
                    "skill_name": s_name,
                    "milestone_type": "practical_project",
                    "estimated_hours": float(r.get("estimated_planning_hours", 20)) * 0.6,
                    "resources": res,
                    "is_completed": False,
                    "completed_at": None
                })
            return milestones

        # Build 3 Phases
        if recommendations:
            phase1_milestones = build_phase_milestones(phase1_skills, 1)
            phase2_milestones = build_phase_milestones(phase2_skills, 2)
            phase3_milestones = build_phase_milestones(phase3_skills, 3)
        else:
            # Mastery roadmap when student already meets all baseline skill proficiencies
            phase1_milestones = [{
                "id": f"ms_mastery_1_{uuid.uuid4().hex[:8]}",
                "title": f"Review Advanced Architectures in {career_title}",
                "description": f"All baseline skill proficiencies are met. Conduct comprehensive deep-dive into advanced system trade-offs and performance tuning.",
                "skill_id": None,
                "skill_name": "Advanced Architecture",
                "milestone_type": "concept",
                "estimated_hours": 10.0,
                "resources": [{"title": f"{career_title} Advanced System Engineering", "url": "https://github.com/"}],
                "is_completed": False,
                "completed_at": None
            }]
            phase2_milestones = [{
                "id": f"ms_mastery_2_{uuid.uuid4().hex[:8]}",
                "title": f"Build High-Scale Distributed System Component",
                "description": f"Design and implement a production-scale module showcasing senior-level engineering standards.",
                "skill_id": None,
                "skill_name": "Applied Systems",
                "milestone_type": "practical_project",
                "estimated_hours": 16.0,
                "resources": [{"title": "System Design & Distributed Patterns", "url": "https://github.com/"}],
                "is_completed": False,
                "completed_at": None
            }]
            phase3_milestones = []

        # Capstone milestone for Phase 3
        phase3_milestones.append({
            "id": f"ms_capstone_{uuid.uuid4().hex[:8]}",
            "title": f"Complete End-to-End {career_title} Capstone Project",
            "description": f"Synthesize all learned competencies into a deployed repository project demonstrating full-stack engineering excellence.",
            "skill_id": None,
            "skill_name": None,
            "milestone_type": "capstone",
            "estimated_hours": 24.0,
            "resources": [{"title": "Engineering Portfolio Best Practices", "url": "https://github.com/"}],
            "is_completed": False,
            "completed_at": None
        })

        phases = [
            {
                "phase_id": "phase_1_foundations",
                "phase_order": 1,
                "title": "Phase 1: Essential Foundations & Prerequisite Resolution",
                "description": "Resolve critical prerequisite dependencies and strengthen high-leverage foundational skills.",
                "focus_skills": [r["skill_name"] for r in phase1_skills] if phase1_skills else ["Advanced System Architecture"],
                "status": "IN_PROGRESS",
                "milestones": phase1_milestones,
                "project_suggestion": {
                    "title": f"Foundational {career_title} Component Architecture",
                    "tech_stack": ", ".join(r["skill_name"] for r in phase1_skills[:3]) if phase1_skills else "Full Stack Architecture"
                },
                "assessment_checkpoint": {
                    "title": "Phase 1 Fundamentals Diagnostic Quiz",
                    "recommended_score_pct": 75.0
                },
                "rationale": "High-priority bottlenecks must be addressed first to unlock downstream competencies." if phase1_skills else "Baseline competencies verified; focus on architecture mastery."
            },
            {
                "phase_id": "phase_2_core_systems",
                "phase_order": 2,
                "title": "Phase 2: Core Engineering & Practical Systems",
                "description": "Develop hands-on proficiency in central frameworks, database backends, and system architectures.",
                "focus_skills": [r["skill_name"] for r in phase2_skills] if phase2_skills else ["Applied Systems Engineering"],
                "status": "NOT_STARTED",
                "milestones": phase2_milestones,
                "project_suggestion": {
                    "title": f"Scalable Microservices Architecture for {career_title}",
                    "tech_stack": ", ".join(r["skill_name"] for r in phase2_skills[:3]) if phase2_skills else "Distributed Services"
                },
                "assessment_checkpoint": {
                    "title": "Phase 2 Applied Architecture Assessment",
                    "recommended_score_pct": 80.0
                },
                "rationale": "Applied systems engineering transforms conceptual foundation into verified industry ability."
            },
            {
                "phase_id": "phase_3_advanced_capstone",
                "phase_order": 3,
                "title": "Phase 3: Advanced Specialization & Capstone Validation",
                "description": "Master high-demand specialized tools, complete an end-to-end capstone, and prepare for interviews.",
                "focus_skills": [r["skill_name"] for r in phase3_skills] if phase3_skills else ["Comprehensive Portfolio Capstone"],
                "status": "NOT_STARTED",
                "milestones": phase3_milestones,
                "project_suggestion": {
                    "title": f"Production-Grade Portfolio Capstone for {career_title}",
                    "tech_stack": "Comprehensive Stack Integration"
                },
                "assessment_checkpoint": {
                    "title": "Career Readiness Comprehensive Evaluation",
                    "recommended_score_pct": 85.0
                },
                "rationale": "Final portfolio capstone directly validates competitive job-readiness for technical hiring."
            }
        ]

        # Determine version
        latest_roadmap = await db.roadmaps.find_one(
            {"student_id": student_id, "career_id": career_id},
            sort=[("version", -1)]
        )
        new_version = (latest_roadmap.get("version", 0) + 1) if latest_roadmap else 1

        # Mark all previous roadmaps as not current
        await db.roadmaps.update_many(
            {"student_id": student_id, "career_id": career_id},
            {"$set": {"is_current": False}}
        )

        now = get_utc_now()
        roadmap_doc = {
            "student_id": student_id,
            "career_id": career_id,
            "career_title": career_title,
            "title": f"Adaptive Career Acceleration Path to {career_title}",
            "version": new_version,
            "is_current": True,
            "target_completion_weeks": 16,
            "status": "active",
            "overall_progress_pct": 0.0,
            "phases": phases,
            "recommendations_summary": recommendations[:8],
            "ml_readiness_benchmark": ml_score,
            "market_demand_index": market_demand,
            "generated_at": now.isoformat(),
            "engine_version": "v2.0-adaptive",
            "provenance_note": "Adaptive roadmap generated from deterministic priority scoring and skill dependency graph. Authoritative ML readiness is preserved.",
            "created_at": now,
            "updated_at": now
        }

        res = await db.roadmaps.insert_one(roadmap_doc)
        roadmap_doc["_id"] = str(res.inserted_id)
        roadmap_doc["id"] = str(res.inserted_id)
        return serialize_doc(roadmap_doc)

    async def update_milestone_progress(
        self,
        student_id: str,
        milestone_id: str,
        is_completed: bool,
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """
        Toggles completion state of a milestone in the active roadmap and updates overall progress.
        """
        now = get_utc_now()
        comp_time = now.isoformat() if is_completed else None

        # Find roadmap that contains this milestone
        roadmap = await db.roadmaps.find_one({
            "student_id": student_id,
            "$or": [
                {"phases.milestones.id": milestone_id},
                {"items.id": milestone_id}
            ]
        })
        if not roadmap:
            roadmap = await db.roadmaps.find_one({"student_id": student_id, "is_current": True})
        if not roadmap:
            roadmap = await db.roadmaps.find_one({"student_id": student_id})
        if not roadmap:
            raise ValueError("Active roadmap not found.")

        phases = roadmap.get("phases", [])
        total_milestones = 0
        completed_milestones = 0
        milestone_found = False

        for phase in phases:
            phase_total = len(phase.get("milestones", []))
            phase_completed = 0
            for ms in phase.get("milestones", []):
                total_milestones += 1
                if ms.get("id") == milestone_id:
                    ms["is_completed"] = is_completed
                    ms["completed_at"] = comp_time
                    milestone_found = True
                if ms.get("is_completed", False):
                    completed_milestones += 1
                    phase_completed += 1

            # Update phase status
            if phase_completed == phase_total and phase_total > 0:
                phase["status"] = "COMPLETED"
            elif phase_completed > 0:
                phase["status"] = "IN_PROGRESS"

        if not milestone_found:
            # Also check legacy items array
            items = roadmap.get("items", [])
            for it in items:
                if it.get("id") == milestone_id:
                    it["completed"] = is_completed
                    it["completed_at"] = now if is_completed else None
                    milestone_found = True

        if not milestone_found:
            raise ValueError(f"Milestone item '{milestone_id}' not found.")

        if total_milestones > 0:
            overall_progress = round((completed_milestones / total_milestones) * 100.0, 1)
        else:
            items = roadmap.get("items", [])
            if items:
                comp_items = len([it for it in items if it.get("completed")])
                overall_progress = round((comp_items / len(items)) * 100.0, 1)
            else:
                overall_progress = 0.0

        update_set = {
            "overall_progress_pct": overall_progress,
            "updated_at": now
        }
        if phases:
            update_set["phases"] = phases
        if "items" in roadmap:
            update_set["items"] = roadmap["items"]

        await db.roadmaps.update_one(
            {"_id": roadmap["_id"]},
            {"$set": update_set}
        )

        roadmap["phases"] = phases
        roadmap["overall_progress_pct"] = overall_progress
        return serialize_doc(roadmap)

    async def get_roadmap_history(
        self,
        student_id: str,
        career_id: Optional[str],
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """Retrieves all versioned roadmaps for the student."""
        query = {"student_id": student_id}
        if career_id:
            query["career_id"] = career_id

        cursor = db.roadmaps.find(query).sort("version", -1)
        versions = await cursor.to_list(length=20)

        effective_cid = career_id or (versions[0].get("career_id") if versions else "CR001")
        return {
            "student_id": student_id,
            "career_id": effective_cid,
            "total_versions": len(versions),
            "versions": serialize_docs(versions)
        }
