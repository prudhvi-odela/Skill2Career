"""
Skill2Career - Phase 11 Career Transition & Strategic Career Planning Service
Orchestrates cross-career transition intelligence by composing validated services:
- Phase 06 ML readiness & gap analysis
- Phase 07 / 08.2 Market intelligence & provenance
- Phase 08 Recommendation engine & DAG prerequisite graph
- Phase 09A Evidence engine
- Phase 09B Learning intelligence & trajectory
- Phase 09C Career readiness interpretation
- Phase 10 Career forecasting & what-if scenarios
"""

from typing import Dict, Any, List, Optional, Set, Tuple
import math
import uuid
import numpy as np
from datetime import datetime, timezone
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_utc_now, serialize_doc, serialize_docs
from backend.ml.gap_analyzer import SkillGapAnalyzer
from backend.ml.inference import MLInferenceService
from backend.services.market_intelligence_service import MarketIntelligenceService
from backend.services.dependency_service import SkillDependencyService
from backend.services.recommendation_service import RecommendationService
from backend.services.evidence_aggregation_service import EvidenceAggregationService
from backend.services.learning_intelligence_service import LearningIntelligenceService
from backend.services.career_readiness_service import CareerReadinessService
from backend.services.career_forecast_service import CareerForecastService
from backend.schemas.career_transition_schemas import (
    TransitionStatus,
    TransferabilityClassification,
    TransitionGapCategory,
    TransitionMilestoneStatus,
    TransitionScenarioType,
    CareerProfileRef,
    TransferableSkillItem,
    SkillOverlapSummary,
    TransitionGapItem,
    PrerequisiteChainItem,
    TransferableEvidenceItem,
    TrajectoryContext,
    MarketContext,
    ForecastContext,
    TransitionMilestone,
    StrategicTransitionPlan,
    CareerTransitionAnalysisResponse,
    CareerTransitionComparisonItem,
    MultiCareerTransitionComparisonResponse,
    TransitionScenarioRequest,
    TransitionScenarioResult,
    TransitionPlanUpdateRequest,
    TransitionHistoryItem
)


class CareerTransitionService:
    def __init__(self):
        self.gap_analyzer = SkillGapAnalyzer()
        self.ml_service = MLInferenceService.get_instance()
        self.market_service = MarketIntelligenceService()
        self.dependency_service = SkillDependencyService()
        self.recommendation_service = RecommendationService()
        self.evidence_aggregation_service = EvidenceAggregationService()
        self.learning_intelligence_service = LearningIntelligenceService()
        self.career_readiness_service = CareerReadinessService()
        self.career_forecast_service = CareerForecastService()

    async def _resolve_career_doc(self, career_id: str, db: AsyncDatabase) -> Dict[str, Any]:
        """Resolves career document by code or _id."""
        doc = await db.career_roles.find_one({"$or": [{"career_code": career_id}, {"_id": career_id}]})
        if not doc:
            raise ValueError(f"Career '{career_id}' not found in canonical taxonomy.")
        return doc

    async def analyze_transition(
        self,
        student_id: str,
        target_career_id: str,
        source_career_id: Optional[str] = None,
        db: AsyncDatabase = None,
        persist: bool = True
    ) -> CareerTransitionAnalysisResponse:
        """
        Performs comprehensive, evidence-grounded career transition analysis from a student's
        current/source career state into a target career role.
        """
        # 1. Fetch Profile & Resolve Careers
        profile = await db.student_profiles.find_one({"user_id": student_id})
        eff_source_id = source_career_id or profile.get("target_career_id")
        if not eff_source_id:
            raise ValueError("No baseline/source career specified. Please provide a source career ID or set a target career in your profile.")
        source_doc = await self._resolve_career_doc(eff_source_id, db)
        target_doc = await self._resolve_career_doc(target_career_id, db)

        source_code = source_doc.get("career_code", eff_source_id)
        target_code = target_doc.get("career_code", target_career_id)

        student_skills = profile.get("skills", [])
        student_skill_map = {
            s.get("skill_id"): float(s.get("level", s.get("proficiency_level", 1.0)))
            for s in student_skills if s.get("skill_id")
        }

        # 2. Build Career References
        source_req_skills = source_doc.get("required_skills", [])
        target_req_skills = target_doc.get("required_skills", [])

        source_ref = CareerProfileRef(
            career_id=source_code,
            title=source_doc.get("title", source_code),
            domain=source_doc.get("domain", "General"),
            avg_salary_usd=float(source_doc.get("avg_salary_usd", 90000.0)),
            description=source_doc.get("description", ""),
            required_skills_count=len(source_req_skills)
        )

        target_ref = CareerProfileRef(
            career_id=target_code,
            title=target_doc.get("title", target_code),
            domain=target_doc.get("domain", "General"),
            avg_salary_usd=float(target_doc.get("avg_salary_usd", 100000.0)),
            description=target_doc.get("description", ""),
            required_skills_count=len(target_req_skills)
        )

        # 3. Analyze Skill Overlap
        source_skill_ids = {s.get("skill_id") for s in source_req_skills if s.get("skill_id")}
        target_skill_ids = {s.get("skill_id") for s in target_req_skills if s.get("skill_id")}

        shared_skill_ids = sorted(list(source_skill_ids.intersection(target_skill_ids)))
        source_only_skill_ids = sorted(list(source_skill_ids - target_skill_ids))
        target_only_skill_ids = sorted(list(target_skill_ids - source_skill_ids))

        shared_proficiencies = [student_skill_map.get(sid, 0.0) for sid in shared_skill_ids]
        shared_avg_prof = round(float(np.mean(shared_proficiencies)), 2) if shared_proficiencies else 0.0

        target_gaps_res = self.gap_analyzer.analyze_gap(student_skills, target_code)
        target_coverage_pct = float(target_gaps_res.get("coverage_percentage", 0.0))

        skill_overlap = SkillOverlapSummary(
            shared_required_skills_count=len(shared_skill_ids),
            shared_skill_ids=shared_skill_ids,
            source_only_skills_count=len(source_only_skill_ids),
            source_only_skill_ids=source_only_skill_ids,
            target_only_skills_count=len(target_only_skill_ids),
            target_only_skill_ids=target_only_skill_ids,
            shared_skill_proficiency_avg=shared_avg_prof,
            target_skill_coverage_pct=target_coverage_pct
        )

        # 4. Fetch Evidence Counts for Student Skills
        evidence_cursor = db.skill_evidence.find({"student_id": student_id})
        evidence_docs = await evidence_cursor.to_list(length=500)

        # Filter out rejected evidence
        valid_evidence = [e for e in evidence_docs if e.get("verification_status") != "REJECTED"]
        verified_evidence = [e for e in valid_evidence if e.get("verification_status") == "VERIFIED"]

        skill_total_ev_count: Dict[str, int] = {}
        skill_ver_ev_count: Dict[str, int] = {}
        for ev in valid_evidence:
            s_id = ev.get("skill_id")
            if s_id:
                skill_total_ev_count[s_id] = skill_total_ev_count.get(s_id, 0) + 1
                if ev.get("verification_status") == "VERIFIED":
                    skill_ver_ev_count[s_id] = skill_ver_ev_count.get(s_id, 0) + 1

        # 5. Classify Transferable Skills
        # Transferable skills are skills student possesses that are relevant to target career or shared across roles
        transferable_skills: List[TransferableSkillItem] = []
        target_req_map = {
            s.get("skill_id"): float(s.get("min_proficiency", s.get("required_level", 3.0)))
            for s in target_req_skills if s.get("skill_id")
        }
        target_imp_map = {
            s.get("skill_id"): str(s.get("importance", "CORE"))
            for s in target_req_skills if s.get("skill_id")
        }
        source_imp_map = {
            s.get("skill_id"): str(s.get("importance", "CORE"))
            for s in source_req_skills if s.get("skill_id")
        }

        # Check all skills student has that are in target requirements or shared
        all_candidate_transfer_ids = set(student_skill_map.keys()).intersection(target_skill_ids).union(set(shared_skill_ids))
        for sid in sorted(list(all_candidate_transfer_ids)):
            curr_lvl = student_skill_map.get(sid, 0.0)
            tgt_req_lvl = target_req_map.get(sid, 3.0)
            src_imp = source_imp_map.get(sid, "CORE")
            tgt_imp = target_imp_map.get(sid, "CORE")

            skill_doc = await db.skills.find_one({"$or": [{"skill_code": sid}, {"_id": sid}]})
            s_name = skill_doc.get("name", sid) if skill_doc else sid
            s_cat = skill_doc.get("category", "General") if skill_doc else "General"

            # Determine classification
            if curr_lvl >= tgt_req_lvl and curr_lvl > 0:
                classification = TransferabilityClassification.DIRECTLY_TRANSFERABLE
                rationale = f"Proficiency ({curr_lvl:.1f}) meets or exceeds target requirement ({tgt_req_lvl:.1f})."
            elif curr_lvl > 0:
                classification = TransferabilityClassification.PARTIALLY_TRANSFERABLE
                rationale = f"Demonstrated proficiency ({curr_lvl:.1f}) partially fulfills target requirement ({tgt_req_lvl:.1f})."
            elif sid in target_skill_ids:
                classification = TransferabilityClassification.ADJACENT
                rationale = "Required for target role and present in source domain curriculum; student has not yet established baseline level."
            else:
                classification = TransferabilityClassification.NOT_YET_TRANSFERABLE
                rationale = "Skill not currently established in student profile."

            transferable_skills.append(TransferableSkillItem(
                skill_id=sid,
                skill_name=s_name,
                category=s_cat,
                student_level=curr_lvl,
                source_importance=src_imp,
                target_importance=tgt_imp,
                target_level_required=tgt_req_lvl,
                transferability=classification,
                transferability_rationale=rationale,
                supporting_evidence_count=skill_total_ev_count.get(sid, 0),
                verified_evidence_count=skill_ver_ev_count.get(sid, 0)
            ))

        # 6. Evaluate Prerequisite Chains for Target Requirements
        prereq_chains: List[PrerequisiteChainItem] = []
        blocked_skills_map: Dict[str, List[str]] = {}

        for tr in target_req_skills:
            tsid = tr.get("skill_id")
            if not tsid:
                continue
            skill_doc = await db.skills.find_one({"$or": [{"skill_code": tsid}, {"_id": tsid}]})
            tsname = skill_doc.get("name", tsid) if skill_doc else tsid

            prereq_eval = await self.dependency_service.evaluate_prerequisites(
                skill_id=tsid,
                student_skills_map=student_skill_map,
                db=db
            )

            blocking = [
                p["prerequisite_skill_id"]
                for p in prereq_eval.get("prerequisites", [])
                if not p.get("is_met") and p.get("dependency_type") == "PREREQUISITE"
            ]
            if blocking:
                blocked_skills_map[tsid] = blocking

            prereq_chains.append(PrerequisiteChainItem(
                target_skill_id=tsid,
                target_skill_name=tsname,
                prerequisite_chain=prereq_eval.get("prerequisites", []),
                is_blocked=len(blocking) > 0,
                blocking_skill_ids=blocking,
                chain_completion_pct=float(prereq_eval.get("prerequisites_completion_pct", 100.0))
            ))

        # 7. Identify Transition Gaps
        # Gaps are target career requirements that are not yet mastered (gap > 0)
        target_gaps = target_gaps_res.get("gaps", [])
        transition_gaps: List[TransitionGapItem] = []

        # Retrieve Learning Intelligence for stagnation checks
        li_overview = await self.learning_intelligence_service.get_learning_trajectory_overview(
            student_id=student_id,
            db=db
        )
        stagnating_skills = {
            s.skill_id for s in (li_overview.skill_progressions or [])
            if getattr(s, 'growth_rate', 0.0) <= 0.0 or getattr(s, 'is_stagnating', False)
        }

        for g in target_gaps:
            sid = g.get("skill_id")
            cur_lvl = float(g.get("current_level", 0.0))
            req_lvl = float(g.get("required_level", 3.0))
            gap_val = max(0.0, req_lvl - cur_lvl)

            # Mastered skills (gap <= 0) must NOT appear as remediation gaps
            if gap_val <= 0.0:
                continue

            s_name = g.get("skill_name", sid)
            s_cat = g.get("category", "General")
            is_crit = g.get("priority") in ["Critical", "High"]
            unmet_p = blocked_skills_map.get(sid, [])

            # Classify gap category
            if cur_lvl == 0.0:
                gap_cat = TransitionGapCategory.MISSING_SKILL
            elif unmet_p:
                gap_cat = TransitionGapCategory.PREREQUISITE_BLOCKED
            elif sid in stagnating_skills:
                gap_cat = TransitionGapCategory.STAGNATING_SKILL
            elif cur_lvl > 0.0 and skill_ver_ev_count.get(sid, 0) == 0:
                gap_cat = TransitionGapCategory.INSUFFICIENT_EVIDENCE
            else:
                gap_cat = TransitionGapCategory.LOW_PROFICIENCY

            effort_level, effort_hours = self.recommendation_service.estimate_learning_effort(
                gap=gap_val,
                has_unmet_prereqs=len(unmet_p) > 0
            )

            p_score, p_band = self.recommendation_service.compute_priority_score(
                gap=gap_val,
                career_importance=1.0 if is_crit else 0.7,
                market_demand=80.0,
                downstream_count=len(unmet_p),
                prereq_pct=100.0 if not unmet_p else 50.0,
                learning_velocity=float(li_overview.velocity.overall_learning_velocity)
            )

            rationale = self.recommendation_service.generate_rationale(
                skill_name=s_name,
                career_title=target_ref.title,
                student_level=cur_lvl,
                target_level=req_lvl,
                gap=gap_val,
                band=p_band,
                market_demand=80.0,
                prereqs_met=len(unmet_p) == 0,
                downstream_count=len(unmet_p)
            )

            transition_gaps.append(TransitionGapItem(
                skill_id=sid,
                skill_name=s_name,
                category=s_cat,
                current_level=cur_lvl,
                target_level_required=req_lvl,
                gap=round(gap_val, 2),
                gap_category=gap_cat,
                is_critical=is_crit,
                unmet_prerequisites=unmet_p,
                priority_band=p_band,
                learning_effort_hours=effort_hours,
                remediation_rationale=rationale
            ))

        # Sort gaps by priority score / urgency
        band_order = {"URGENT": 0, "HIGH": 1, "MODERATE": 2, "LOW": 3, "MASTERED": 4}
        transition_gaps.sort(key=lambda x: (band_order.get(x.priority_band, 5), -x.gap))

        # 8. Transferable Evidence
        # Evidence items that match target career skills
        transferable_evidence: List[TransferableEvidenceItem] = []
        for ev in valid_evidence:
            ev_skill = ev.get("skill_id")
            is_rel = ev_skill in target_skill_ids
            if is_rel:
                transferable_evidence.append(TransferableEvidenceItem(
                    evidence_id=str(ev.get("evidence_id", ev.get("_id", ""))),
                    activity_id=ev.get("source_entity_id"),
                    title=ev.get("title", f"Evidence for {ev_skill}"),
                    artifact_type=ev.get("evidence_type", "PROJECT"),
                    skills_supported=[ev_skill] if ev_skill else [],
                    verification_status=ev.get("verification_status", "VERIFIED"),
                    is_relevant_to_target=True,
                    relevance_rationale=f"Directly supports competency '{ev_skill}' required for target role '{target_ref.title}'."
                ))

        # 9. Learning Trajectory Context (Phase 09B)
        is_stag = False
        if hasattr(li_overview.stagnation, 'status'):
            st_val = li_overview.stagnation.status.value if hasattr(li_overview.stagnation.status, 'value') else str(li_overview.stagnation.status)
            is_stag = st_val == "STAGNATING"

        trajectory_context = TrajectoryContext(
            trajectory_direction=str(li_overview.trajectory_direction.value),
            learning_velocity=float(li_overview.velocity.overall_learning_velocity),
            consistency_score=float(li_overview.consistency.consistency_score),
            current_streak_days=int(li_overview.consistency.current_streak_days),
            stagnation_flag=is_stag,
            total_snapshots=int(li_overview.total_snapshots),
            has_sufficient_history=li_overview.total_snapshots >= 2
        )

        # 10. Market Context (Phase 07 / 08.2)
        market_sig = await self.market_service.get_career_market_signal(target_code, db)
        market_context = MarketContext(
            target_career_demand_score=float(market_sig.get("demand_score", 80.0)),
            target_career_trend=str(market_sig.get("trend_direction", "stable")),
            target_career_salary_usd=float(target_doc.get("avg_salary_usd", 95000.0)),
            source_id=str(market_sig.get("source_id", "SRC_BLS_2026")),
            freshness=str(market_sig.get("freshness", "fresh")),
            is_fallback=bool(market_sig.get("is_fallback", False)),
            provenance_label=str(market_sig.get("provenance_label", "VERIFIED_MARKET_SIGNAL"))
        )

        # 11. Forecast Context (Phase 10)
        try:
            forecast_res = await self.career_forecast_service.generate_career_forecast(
                student_id=student_id,
                career_id=target_code,
                horizon_days=90,
                db=db
            )
            forecast_context = ForecastContext(
                projected_readiness_benchmark=forecast_res.active_scenario.projected_readiness_benchmark,
                time_to_target_weeks=forecast_res.time_to_target.estimated_weeks,
                uncertainty_level=forecast_res.uncertainty_level.value,
                critical_bottlenecks_count=len(forecast_res.critical_bottlenecks),
                forecast_assumptions=forecast_res.active_scenario.assumptions
            )
        except Exception:
            forecast_context = ForecastContext(
                projected_readiness_benchmark=target_coverage_pct,
                time_to_target_weeks=12,
                uncertainty_level="MEDIUM",
                critical_bottlenecks_count=len([g for g in transition_gaps if g.is_critical]),
                forecast_assumptions=["Standard study commitment of 12 hours/week."]
            )

        # 12. Transition Milestones
        transition_milestones = self._build_transition_milestones(
            transition_gaps=transition_gaps,
            prereq_chains=prereq_chains,
            student_skill_map=student_skill_map,
            transferable_skills=transferable_skills
        )

        # 13. Priority Actions (Reusing Recommendation Engine)
        priority_actions: List[Dict[str, Any]] = []
        for idx, gap_item in enumerate(transition_gaps[:6], start=1):
            priority_actions.append({
                "action_id": f"ACT_{target_code}_{gap_item.skill_id}",
                "priority_rank": idx,
                "skill_id": gap_item.skill_id,
                "skill_name": gap_item.skill_name,
                "priority_band": gap_item.priority_band,
                "gap": gap_item.gap,
                "learning_effort_hours": gap_item.learning_effort_hours,
                "unmet_prerequisites": gap_item.unmet_prerequisites,
                "rationale": gap_item.remediation_rationale
            })

        # 14. Compile Provenance & Assumptions
        provenance = [
            f"Source profile: '{source_ref.title}' ({source_ref.career_id}), Target profile: '{target_ref.title}' ({target_ref.career_id}).",
            f"Authoritative student skill state ({len(student_skills)} skills) sourced from MongoDB.",
            f"Prerequisite dependencies verified via canonical skill DAG ({len(prereq_chains)} evaluated).",
            f"Learning velocity ({trajectory_context.learning_velocity:.1f}/5.0) and streak ({trajectory_context.current_streak_days}d) sourced from Learning Intelligence.",
            f"Market context ({market_context.provenance_label}) sourced from {market_context.source_id}."
        ]

        assumptions = [
            "Consistent weekly study commitment based on student profile.",
            "Prerequisite competencies are completed sequentially before advanced modules.",
            "Evidence must be verified to confirm full competency transition.",
            "Market conditions reflect latest captured signals."
        ]

        # 15. Create Transition Response
        transition_id = f"trans_{student_id[:8]}_{target_code}_{uuid.uuid4().hex[:8]}"
        created_at = get_utc_now().isoformat()

        response = CareerTransitionAnalysisResponse(
            transition_id=transition_id,
            student_id=student_id,
            source_career=source_ref,
            target_career=target_ref,
            created_at=created_at,
            status=TransitionStatus.ANALYZED,
            skill_overlap=skill_overlap,
            transferable_skills=transferable_skills,
            transition_gaps=transition_gaps,
            prerequisite_chains=prereq_chains,
            transferable_evidence=transferable_evidence,
            transition_milestones=transition_milestones,
            trajectory_context=trajectory_context,
            market_context=market_context,
            forecast_context=forecast_context,
            priority_actions=priority_actions,
            assumptions=assumptions,
            provenance=provenance
        )

        # 16. MongoDB Persistence
        if persist and db is not None:
            doc_to_save = response.model_dump()
            doc_to_save["_id"] = transition_id
            await db.career_transitions.replace_one(
                {"transition_id": transition_id},
                doc_to_save,
                upsert=True
            )

        return response

    def _build_transition_milestones(
        self,
        transition_gaps: List[TransitionGapItem],
        prereq_chains: List[PrerequisiteChainItem],
        student_skill_map: Dict[str, float],
        transferable_skills: List[TransferableSkillItem]
    ) -> List[TransitionMilestone]:
        """
        Constructs an ordered, evidence-grounded milestone pathway respecting prerequisite DAG ordering.
        """
        milestones: List[TransitionMilestone] = []

        # Identify blocked skills vs foundational prerequisite skills
        blocked_skill_ids = {
            chain.target_skill_id
            for chain in prereq_chains if chain.is_blocked
        }
        blocking_prereqs = set()
        for chain in prereq_chains:
            for b in chain.blocking_skill_ids:
                blocking_prereqs.add(b)

        # Milestone 1: Foundational Prerequisites & Blockers
        m1_skills = [g for g in transition_gaps if g.skill_id in blocking_prereqs or (g.gap_category == TransitionGapCategory.PREREQUISITE_BLOCKED and not g.is_critical)]
        if not m1_skills:
            m1_skills = [g for g in transition_gaps if g.current_level == 0.0][:2]
        
        m1_skill_ids = [g.skill_id for g in m1_skills]
        m1_effort = sum(g.learning_effort_hours for g in m1_skills) or 20
        m1_status = TransitionMilestoneStatus.READY if len(m1_skills) > 0 else TransitionMilestoneStatus.COMPLETED

        milestones.append(TransitionMilestone(
            milestone_id="M1_FOUNDATIONS",
            title="Phase 1: Foundation & Prerequisites",
            description="Establish prerequisite foundational competencies and clear dependency blockers.",
            order=1,
            required_skill_ids=m1_skill_ids,
            prerequisite_skill_ids=[],
            current_state_summary=f"{len(m1_skills)} foundational/prerequisite competencies identified.",
            target_state_summary="Resolve foundational blockers to unlock intermediate domain pathways.",
            supporting_evidence_count=0,
            recommended_action_ids=[f"ACT_M1_{sid}" for sid in m1_skill_ids],
            estimated_effort_hours=m1_effort,
            dependencies=[],
            status=m1_status
        ))

        # Milestone 2: Core Domain Competencies
        m2_skills = [g for g in transition_gaps if g.is_critical and g.skill_id not in m1_skill_ids]
        if not m2_skills:
            m2_skills = [g for g in transition_gaps if g.skill_id not in m1_skill_ids][:3]
        
        m2_skill_ids = [g.skill_id for g in m2_skills]
        m2_effort = sum(g.learning_effort_hours for g in m2_skills) or 35
        m2_status = TransitionMilestoneStatus.BLOCKED if any(g.skill_id in blocked_skill_ids for g in m2_skills) else TransitionMilestoneStatus.NOT_STARTED

        milestones.append(TransitionMilestone(
            milestone_id="M2_CORE_COMPETENCIES",
            title="Phase 2: Core Domain Competencies",
            description="Bridge critical skill gaps required for primary job responsibilities.",
            order=2,
            required_skill_ids=m2_skill_ids,
            prerequisite_skill_ids=m1_skill_ids,
            current_state_summary=f"{len(m2_skills)} core domain gaps identified.",
            target_state_summary="Attain proficient rating across all high-importance target career requirements.",
            supporting_evidence_count=0,
            recommended_action_ids=[f"ACT_M2_{sid}" for sid in m2_skill_ids],
            estimated_effort_hours=m2_effort,
            dependencies=["M1_FOUNDATIONS"],
            status=m2_status
        ))

        # Milestone 3: Specialization & Evidence Verification
        m3_skills = [g for g in transition_gaps if g.skill_id not in m1_skill_ids and g.skill_id not in m2_skill_ids]
        m3_skill_ids = [g.skill_id for g in m3_skills]
        m3_effort = sum(g.learning_effort_hours for g in m3_skills) or 25

        milestones.append(TransitionMilestone(
            milestone_id="M3_SPECIALIZATION",
            title="Phase 3: Specialization & Evidence Verification",
            description="Complete secondary competencies and establish auditable portfolio evidence.",
            order=3,
            required_skill_ids=m3_skill_ids,
            prerequisite_skill_ids=m2_skill_ids,
            current_state_summary=f"{len(m3_skills)} specialized target competencies remaining.",
            target_state_summary="Produce verified project artifacts and pass formal assessments.",
            supporting_evidence_count=0,
            recommended_action_ids=[f"ACT_M3_{sid}" for sid in m3_skill_ids],
            estimated_effort_hours=m3_effort,
            dependencies=["M2_CORE_COMPETENCIES"],
            status=TransitionMilestoneStatus.NOT_STARTED
        ))

        # Milestone 4: Capstone & Transition Readiness Validation
        milestones.append(TransitionMilestone(
            milestone_id="M4_CAPSTONE_VALIDATION",
            title="Phase 4: Capstone & Transition Readiness Validation",
            description="Synthesize all acquired competencies into a comprehensive production capstone.",
            order=4,
            required_skill_ids=m2_skill_ids[:2] + m3_skill_ids[:2],
            prerequisite_skill_ids=m3_skill_ids,
            current_state_summary="Pre-transition evaluation.",
            target_state_summary="Validate full target competency profile alignment.",
            supporting_evidence_count=0,
            recommended_action_ids=["ACT_M4_CAPSTONE"],
            estimated_effort_hours=30,
            dependencies=["M3_SPECIALIZATION"],
            status=TransitionMilestoneStatus.NOT_STARTED
        ))

        return milestones

    async def get_transferable_skills(
        self,
        student_id: str,
        target_career_id: str,
        source_career_id: Optional[str] = None,
        db: AsyncDatabase = None
    ) -> Dict[str, Any]:
        """Returns transferable skills and skill overlap analysis."""
        analysis = await self.analyze_transition(
            student_id=student_id,
            target_career_id=target_career_id,
            source_career_id=source_career_id,
            db=db,
            persist=False
        )
        return {
            "student_id": student_id,
            "source_career": analysis.source_career,
            "target_career": analysis.target_career,
            "skill_overlap": analysis.skill_overlap,
            "transferable_skills": analysis.transferable_skills,
            "transition_gaps": analysis.transition_gaps
        }

    async def get_transition_milestones(
        self,
        student_id: str,
        target_career_id: str,
        source_career_id: Optional[str] = None,
        db: AsyncDatabase = None
    ) -> List[TransitionMilestone]:
        """Returns ordered transition milestones."""
        analysis = await self.analyze_transition(
            student_id=student_id,
            target_career_id=target_career_id,
            source_career_id=source_career_id,
            db=db,
            persist=False
        )
        return analysis.transition_milestones

    async def get_transferable_evidence(
        self,
        student_id: str,
        target_career_id: str,
        db: AsyncDatabase = None
    ) -> List[TransferableEvidenceItem]:
        """Returns evidence items relevant to target career."""
        analysis = await self.analyze_transition(
            student_id=student_id,
            target_career_id=target_career_id,
            db=db,
            persist=False
        )
        return analysis.transferable_evidence

    async def create_or_update_transition_plan(
        self,
        student_id: str,
        target_career_id: str,
        plan_update: TransitionPlanUpdateRequest,
        db: AsyncDatabase
    ) -> StrategicTransitionPlan:
        """
        Creates or updates a student's strategic transition plan.
        """
        analysis = await self.analyze_transition(
            student_id=student_id,
            target_career_id=target_career_id,
            db=db,
            persist=True
        )

        milestones = plan_update.custom_milestones or analysis.transition_milestones
        total_hours = sum(m.estimated_effort_hours for m in milestones)
        total_weeks = max(1, int(math.ceil(total_hours / 12.0)))

        plan_id = f"plan_{student_id[:8]}_{target_career_id}_{uuid.uuid4().hex[:6]}"
        created_at = get_utc_now().isoformat()
        status = plan_update.status or TransitionStatus.PLANNED

        plan = StrategicTransitionPlan(
            plan_id=plan_id,
            student_id=student_id,
            source_career_id=analysis.source_career.career_id,
            target_career_id=analysis.target_career.career_id,
            estimated_total_effort_hours=total_hours,
            estimated_total_weeks=total_weeks,
            milestones=milestones,
            created_at=created_at,
            status=status,
            assumptions=analysis.assumptions
        )

        await db.career_transitions.update_one(
            {"student_id": student_id, "target_career_id": target_career_id},
            {"$set": {
                "plan": plan.model_dump(),
                "status": status.value,
                "updated_at": created_at
            }},
            upsert=True
        )

        return plan

    async def compare_career_transitions(
        self,
        student_id: str,
        target_career_ids: List[str],
        db: AsyncDatabase
    ) -> MultiCareerTransitionComparisonResponse:
        """
        Factual, multi-dimensional comparison of multiple career transition options.
        Strict rule: Does not rank careers or declare an objective winner.
        """
        if len(target_career_ids) < 2 or len(target_career_ids) > 5:
            raise ValueError("Multi-career transition comparison requires between 2 and 5 target career IDs.")

        profile = await db.student_profiles.find_one({"user_id": student_id})
        if not profile:
            raise ValueError(f"Student profile for user '{student_id}' not found.")

        source_id = profile.get("target_career_id") or "CR001"
        source_doc = await self._resolve_career_doc(source_id, db)
        source_ref = CareerProfileRef(
            career_id=source_doc.get("career_code", source_id),
            title=source_doc.get("title", source_id),
            domain=source_doc.get("domain", "General"),
            avg_salary_usd=float(source_doc.get("avg_salary_usd", 90000.0)),
            description=source_doc.get("description", ""),
            required_skills_count=len(source_doc.get("required_skills", []))
        )

        comparisons: List[CareerTransitionComparisonItem] = []

        for cid in target_career_ids:
            try:
                analysis = await self.analyze_transition(
                    student_id=student_id,
                    target_career_id=cid,
                    source_career_id=source_id,
                    db=db,
                    persist=False
                )

                total_effort = sum(g.learning_effort_hours for g in analysis.transition_gaps)
                critical_gaps = [g for g in analysis.transition_gaps if g.is_critical]

                comparisons.append(CareerTransitionComparisonItem(
                    target_career_id=analysis.target_career.career_id,
                    target_career_title=analysis.target_career.title,
                    target_domain=analysis.target_career.domain,
                    target_avg_salary_usd=analysis.target_career.avg_salary_usd,
                    shared_skills_count=analysis.skill_overlap.shared_required_skills_count,
                    target_only_skills_count=analysis.skill_overlap.target_only_skills_count,
                    transferable_skills_count=len([s for s in analysis.transferable_skills if s.transferability in [TransferabilityClassification.DIRECTLY_TRANSFERABLE, TransferabilityClassification.PARTIALLY_TRANSFERABLE]]),
                    transition_gaps_count=len(analysis.transition_gaps),
                    critical_gaps_count=len(critical_gaps),
                    target_skill_coverage_pct=analysis.skill_overlap.target_skill_coverage_pct,
                    existing_ml_readiness_benchmark=analysis.forecast_context.projected_readiness_benchmark,
                    estimated_competency_effort_hours=total_effort,
                    market_demand_score=analysis.market_context.target_career_demand_score,
                    market_trend=analysis.market_context.target_career_trend,
                    market_freshness=analysis.market_context.freshness,
                    time_to_target_weeks=analysis.forecast_context.time_to_target_weeks
                ))
            except Exception as e:
                continue

        summary = f"Factual comparison of {len(comparisons)} target career transitions from source profile '{source_ref.title}'."

        return MultiCareerTransitionComparisonResponse(
            student_id=student_id,
            source_career=source_ref,
            comparisons=comparisons,
            comparison_summary=summary
        )

    async def simulate_transition_scenario(
        self,
        student_id: str,
        req: TransitionScenarioRequest,
        db: AsyncDatabase
    ) -> TransitionScenarioResult:
        """
        Runs isolated, in-memory counterfactual scenario simulations for career transitions.
        Strict rule: Does NOT mutate student profile, skill state, evidence, or active roadmaps.
        """
        analysis = await self.analyze_transition(
            student_id=student_id,
            target_career_id=req.target_career_id,
            db=db,
            persist=False
        )

        study_hours = max(2.0, float(req.weekly_study_hours))
        scenario_type = req.scenario_type

        # Compute scenario-specific milestones & effort
        base_milestones = analysis.transition_milestones
        projected_milestones: List[TransitionMilestone] = []

        if scenario_type == TransitionScenarioType.FOUNDATION_FIRST:
            name = "Foundation-First Pathway"
            assumptions = [
                f"Prioritize clearing all prerequisite blockers at {study_hours:.1f} hours/week.",
                "Sequential progression ensures zero blocked core modules."
            ]
            # Accelerate M1, hold M2/M3
            for m in base_milestones:
                m_copy = m.model_copy()
                if m.milestone_id == "M1_FOUNDATIONS":
                    m_copy.status = TransitionMilestoneStatus.IN_PROGRESS
                    m_copy.estimated_effort_hours = max(10, int(m.estimated_effort_hours * 0.85))
                projected_milestones.append(m_copy)

        elif scenario_type == TransitionScenarioType.GAP_FOCUSED:
            name = "Critical-Gap Focused Pathway"
            assumptions = [
                f"Concentrate high intensity ({study_hours:.1f} hrs/wk) on critical high-weight gaps.",
                "Simultaneous foundational remediation alongside core practice."
            ]
            for m in base_milestones:
                m_copy = m.model_copy()
                if m.milestone_id == "M2_CORE_COMPETENCIES":
                    m_copy.status = TransitionMilestoneStatus.IN_PROGRESS
                    m_copy.estimated_effort_hours = max(15, int(m.estimated_effort_hours * 0.80))
                projected_milestones.append(m_copy)

        elif scenario_type == TransitionScenarioType.EVIDENCE_FOCUSED:
            name = "Evidence-Driven Verification Pathway"
            assumptions = [
                f"Emphasize project and assessment completion at {study_hours:.1f} hrs/wk.",
                "Verified artifacts establish auditable proof of competency."
            ]
            for m in base_milestones:
                m_copy = m.model_copy()
                if m.milestone_id == "M3_SPECIALIZATION":
                    m_copy.status = TransitionMilestoneStatus.READY
                projected_milestones.append(m_copy)

        else:
            name = "Direct Linear Pathway"
            assumptions = [
                f"Balanced curriculum progression at {study_hours:.1f} hours/week.",
                "Uniform distribution of study hours across all milestones."
            ]
            projected_milestones = [m.model_copy() for m in base_milestones]

        total_hours = sum(m.estimated_effort_hours for m in projected_milestones)
        est_weeks = max(1, int(math.ceil(total_hours / study_hours)))
        proj_coverage = min(100.0, round(analysis.skill_overlap.target_skill_coverage_pct + (40.0 * (study_hours / 20.0)), 1))

        return TransitionScenarioResult(
            scenario_type=scenario_type,
            scenario_name=name,
            target_career_id=req.target_career_id,
            projected_milestones=projected_milestones,
            estimated_weeks=est_weeks,
            projected_skill_coverage_pct=proj_coverage,
            assumptions=assumptions,
            is_simulated=True
        )

    async def get_transition_history(
        self,
        student_id: str,
        db: AsyncDatabase,
        limit: int = 10
    ) -> List[TransitionHistoryItem]:
        """Retrieves past transition analyses for the authenticated student."""
        cursor = db.career_transitions.find({"student_id": student_id}).sort("created_at", -1).limit(limit)
        docs = await cursor.to_list(length=limit)

        history: List[TransitionHistoryItem] = []
        for doc in docs:
            src = doc.get("source_career", {})
            tgt = doc.get("target_career", {})
            history.append(TransitionHistoryItem(
                transition_id=doc.get("transition_id", str(doc.get("_id", ""))),
                student_id=doc.get("student_id", student_id),
                source_career_id=src.get("career_id", doc.get("source_career_id", "")),
                source_career_title=src.get("title", "Source Career"),
                target_career_id=tgt.get("career_id", doc.get("target_career_id", "")),
                target_career_title=tgt.get("title", "Target Career"),
                created_at=doc.get("created_at", get_utc_now().isoformat()),
                status=doc.get("status", "ANALYZED"),
                milestones_count=len(doc.get("transition_milestones", doc.get("milestones", []))),
                transferable_skills_count=len(doc.get("transferable_skills", [])),
                transition_gaps_count=len(doc.get("transition_gaps", []))
            ))

        return history
