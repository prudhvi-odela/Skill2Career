"""
Skill2Career - Phase 10 Career Forecasting & Scenario Intelligence Engine
Provides longitudinal career forecasting, skill growth projections, competency bottleneck detection,
time-to-target estimation, and isolated what-if scenario intelligence.
"""

from typing import Dict, Any, List, Optional, Tuple
import math
import numpy as np
from datetime import datetime, timezone, timedelta
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_utc_now, serialize_doc, serialize_docs
from backend.ml.inference import MLInferenceService
from backend.ml.gap_analyzer import SkillGapAnalyzer
from backend.services.learning_intelligence_service import LearningIntelligenceService
from backend.services.career_readiness_service import CareerReadinessService
from backend.services.dependency_service import SkillDependencyService
from backend.services.market_intelligence_service import MarketIntelligenceService
from backend.services.recommendation_service import RecommendationService
from backend.schemas.career_forecast_schemas import (
    ForecastHorizon,
    ScenarioType,
    SkillGrowthStatus,
    BottleneckReason,
    ForecastUncertainty,
    ProjectedSkillGrowthItem,
    CompetencyBottleneckItem,
    TimeToTargetEstimate,
    ScenarioSimulationRequest,
    ScenarioSimulationResult,
    CareerForecastResponse,
    ScenarioComparisonResponse
)


class CareerForecastService:
    def __init__(self):
        self.ml_service = MLInferenceService.get_instance()
        self.gap_analyzer = SkillGapAnalyzer()
        self.learning_intelligence_service = LearningIntelligenceService()
        self.career_readiness_service = CareerReadinessService()
        self.dependency_service = SkillDependencyService()
        self.market_service = MarketIntelligenceService()
        self.recommendation_service = RecommendationService()

    async def generate_career_forecast(
        self,
        student_id: str,
        career_id: str,
        horizon_days: int = 90,
        db: AsyncDatabase = None,
        scenario_params: Optional[ScenarioSimulationRequest] = None
    ) -> CareerForecastResponse:
        """
        Generates a comprehensive longitudinal career forecast under baseline or specified scenario conditions.
        """
        # 1. Fetch Profile & Career Role
        profile = await db.student_profiles.find_one({"user_id": student_id})
        if not profile:
            raise ValueError(f"Student profile for user '{student_id}' not found.")

        career_doc = await db.career_roles.find_one({
            "$or": [{"career_code": career_id}, {"_id": career_id}]
        })
        if not career_doc:
            raise ValueError(f"Target career role '{career_id}' not found.")

        career_code = career_doc.get("career_code", career_id)
        career_title = career_doc.get("title", career_id)
        domain = career_doc.get("domain", "Technology")

        # 2. Retrieve Authoritative Career Readiness & Learning Intelligence
        readiness_analysis = await self.career_readiness_service.get_career_readiness_analysis(
            student_id=student_id,
            career_id=career_code,
            db=db
        )
        li_overview = await self.learning_intelligence_service.get_learning_trajectory_overview(
            student_id=student_id,
            db=db
        )

        has_sufficient_history = li_overview.total_snapshots >= 2
        obs_velocity = float(li_overview.velocity.overall_learning_velocity)
        obs_consistency = float(li_overview.consistency.consistency_score)
        obs_streak = int(li_overview.consistency.current_streak_days)
        obs_direction = str(li_overview.trajectory_direction.value)

        # Baseline snapshot dictionary
        baseline_snapshot = {
            "average_proficiency": round(float(np.mean([float(s.get("level", 1.0)) for s in profile.get("skills", [])])) if profile.get("skills") else 1.0, 2),
            "skill_count": len(profile.get("skills", [])),
            "verified_skills_count": sum(1 for s in profile.get("skills", []) if s.get("verified")),
            "ml_readiness_score": readiness_analysis.existing_ml_readiness.readiness_score,
            "ml_readiness_tier": readiness_analysis.existing_ml_readiness.readiness_tier,
            "skill_coverage_pct": readiness_analysis.skill_alignment.coverage_percentage,
            "verified_evidence_count": readiness_analysis.evidence_coverage.verified_evidence_count,
            "timestamp": get_utc_now().isoformat()
        }

        # 3. Simulate Active Scenario (Defaults to CURRENT_TRAJECTORY)
        req = scenario_params or ScenarioSimulationRequest(
            scenario_type=ScenarioType.CURRENT_TRAJECTORY,
            weekly_study_hours=float(profile.get("weekly_study_hours", 12.0)),
            learning_days_per_week=4,
            forecast_horizon_days=horizon_days
        )

        active_sim = await self._run_in_memory_simulation(
            student_id=student_id,
            career_doc=career_doc,
            profile=profile,
            readiness_analysis=readiness_analysis,
            li_overview=li_overview,
            scenario_req=req,
            db=db
        )

        # 4. Determine Forecast Uncertainty
        if not has_sufficient_history:
            uncertainty = ForecastUncertainty.INSUFFICIENT_DATA
            unc_rationale = "Fewer than 2 longitudinal snapshot checkpoints recorded. Forecast represents baseline curriculum trajectory."
        elif horizon_days > 120:
            uncertainty = ForecastUncertainty.MEDIUM
            unc_rationale = f"Extended {horizon_days}-day projection window incorporates compounding scenario variance."
        elif obs_consistency >= 70.0 and obs_velocity >= 2.0:
            uncertainty = ForecastUncertainty.LOW
            unc_rationale = f"Supported by high study consistency ({obs_consistency:.0f}%) and steady velocity ({obs_velocity:.1f}/5.0)."
        else:
            uncertainty = ForecastUncertainty.MEDIUM
            unc_rationale = f"Moderate historical momentum ({obs_velocity:.1f}/5.0 velocity) observed across {li_overview.total_snapshots} snapshots."

        # 5. Compile Provenance & Limitations
        provenance = [
            f"Baseline ML readiness ({readiness_analysis.existing_ml_readiness.readiness_score:.1f}%) sourced from authoritative inference model.",
            f"Historical velocity ({obs_velocity:.1f}/5.0) and study consistency ({obs_consistency:.0f}%) sourced from Learning Intelligence engine.",
            f"Canonical competency requirements derived from '{career_title}' ({career_code}) role taxonomy.",
            f"Horizon of {horizon_days} days simulated under scenario '{active_sim.scenario_name}'."
        ]

        limitations = [
            "Projections describe skill progression under explicit scenario assumptions and do not guarantee future performance.",
            "Forecasts evaluate competency targets; they do not predict employment or guarantee hiring outcomes.",
            "Actual skill acquisition depends on active project execution and verified technical assessment completion."
        ]

        import uuid
        forecast_id = f"fc_{career_code}_{student_id}_{horizon_days}d_{uuid.uuid4().hex[:10]}"
        proj_score = active_sim.projected_readiness_benchmark
        margin = 2.2
        range_low = max(0.0, round(proj_score - margin, 1))
        range_high = min(100.0, round(proj_score + margin, 1))

        forecast_response = CareerForecastResponse(
            forecast_id=forecast_id,
            student_id=student_id,
            career_id=career_code,
            career_title=career_title,
            domain=domain,
            created_at=get_utc_now().isoformat(),
            forecast_horizon_days=horizon_days,
            baseline_snapshot=baseline_snapshot,
            observed_learning_velocity=obs_velocity,
            observed_consistency_score=obs_consistency,
            observed_streak_days=obs_streak,
            observed_trajectory_direction=obs_direction,
            total_historical_snapshots=li_overview.total_snapshots,
            has_sufficient_history=has_sufficient_history,
            skill_growth_projections=active_sim.projected_skill_changes,
            bottlenecks=active_sim.bottlenecks,
            time_to_target=active_sim.estimated_time_to_target,
            active_scenario=active_sim,
            prediction_uncertainty_margin=margin,
            projected_range_low=range_low,
            projected_range_high=range_high,
            assumptions=active_sim.assumptions,
            uncertainty=uncertainty,
            uncertainty_rationale=unc_rationale,
            source_provenance=provenance,
            model_version="v1.0-forecast",
            status="COMPLETED",
            limitations=limitations
        )

        # 6. Persist to MongoDB `career_forecasts` for longitudinal tracking
        try:
            doc_to_save = forecast_response.model_dump()
            await db.career_forecasts.update_one(
                {"forecast_id": forecast_id, "student_id": student_id},
                {"$set": doc_to_save},
                upsert=True
            )
        except Exception:
            pass

        return forecast_response

    async def _run_in_memory_simulation(
        self,
        student_id: str,
        career_doc: Dict[str, Any],
        profile: Dict[str, Any],
        readiness_analysis: Any,
        li_overview: Any,
        scenario_req: ScenarioSimulationRequest,
        db: AsyncDatabase
    ) -> ScenarioSimulationResult:
        """
        Executes isolated in-memory what-if scenario simulation without mutating database state.
        """
        career_code = career_doc.get("career_code", "CR001")
        career_title = career_doc.get("title", "Target Role")
        horizon_days = scenario_req.forecast_horizon_days or 90
        stype = scenario_req.scenario_type

        student_skills = profile.get("skills", [])
        student_skill_map = {
            s.get("skill_id"): float(s.get("level", s.get("proficiency_level", 1.0)))
            for s in student_skills if s.get("skill_id")
        }

        # Analyze canonical gaps
        gap_res = self.gap_analyzer.analyze_gap(student_skills, career_code)
        all_gaps = gap_res.get("gaps", [])

        # Suffix and assumptions
        assumptions = []
        if stype == ScenarioType.CURRENT_TRAJECTORY:
            sname = "Continue Current Trajectory"
            sdesc = "Projects forward using observed study pace and consistency without behavioral change."
            weekly_hrs = float(scenario_req.weekly_study_hours or profile.get("weekly_study_hours", 12.0))
            velocity_mult = 1.0
            assumptions.append(f"Maintains baseline commitment of {weekly_hrs:.1f} study hours/week.")
            assumptions.append("Preserves observed historical learning velocity and retention pace.")
        elif stype == ScenarioType.INCREASED_CONSISTENCY:
            sname = "Increase Learning Consistency"
            sdesc = "Simulates regular study sessions and elevated retention multiplier."
            weekly_hrs = float(scenario_req.weekly_study_hours or 18.0)
            velocity_mult = 1.35
            assumptions.append(f"Increases weekly commitment to {weekly_hrs:.1f} study hours across 5+ days/week.")
            assumptions.append("Elevated practice consistency accelerates retention velocity by ~35%.")
        elif stype == ScenarioType.GAP_FOCUSED:
            sname = "Focus on Critical Skill Gaps"
            sdesc = "Prioritizes 100% of remediation effort onto top high-impact career gaps."
            weekly_hrs = float(scenario_req.weekly_study_hours or 15.0)
            velocity_mult = 1.25
            assumptions.append(f"Allocates dedicated study hours ({weekly_hrs:.1f} hrs/wk) to top critical gaps.")
            assumptions.append("Sequences prerequisite milestones to unblock downstream competencies.")
        else:
            sname = "Custom Scenario"
            sdesc = "Custom parameterized what-if learning simulation."
            weekly_hrs = float(scenario_req.weekly_study_hours or 12.0)
            velocity_mult = 1.0 + (weekly_hrs - 12.0) * 0.03
            assumptions.append(f"Custom study commitment: {weekly_hrs:.1f} hrs/week across {scenario_req.learning_days_per_week or 4} days/week.")

        obs_vel = float(li_overview.velocity.overall_learning_velocity)
        proj_velocity = round(float(np.clip(max(0.8, obs_vel * velocity_mult), 0.5, 5.0)), 2)
        proj_consistency = round(float(np.clip(li_overview.consistency.consistency_score * (1.15 if stype == ScenarioType.INCREASED_CONSISTENCY else 1.0), 10.0, 100.0)), 1)

        # Baseline growth rate in points per 30 days
        base_pts_per_mo = max(0.15, (proj_velocity / 5.0) * 0.45)

        # Project skill growth for all required skills
        projected_skills: List[ProjectedSkillGrowthItem] = []
        projected_skill_map: Dict[str, float] = {}
        projected_gaps_map: Dict[str, float] = {}

        focus_set = set(scenario_req.focus_skill_ids or [])
        if stype == ScenarioType.GAP_FOCUSED and not focus_set:
            # Pick top 3 critical gaps as default focus
            focus_set = {g["skill_id"] for g in all_gaps if g.get("priority") in ["Critical", "High"] and float(g.get("gap", 0.0)) > 0.0}

        horizon_months = horizon_days / 30.0

        for g in all_gaps:
            s_id = g["skill_id"]
            s_name = g["skill_name"]
            cur_lvl = float(g.get("current_level", 0.0))
            req_lvl = float(g.get("required_level", 3.0))
            deficit = max(0.0, req_lvl - cur_lvl)

            # Monthly skill growth calculation
            if deficit <= 0.0:
                # Mastered skill remains stable
                proj_delta = 0.0
                growth_rate = 0.0
                status = SkillGrowthStatus.PROJECTED_STABILITY
                rationale = f"{s_name} is already mastered (Level {cur_lvl:.1f} >= {req_lvl:.1f}); proficiency sustained."
            else:
                # Skill growth calculation
                skill_mult = 1.5 if s_id in focus_set else 0.85
                growth_rate = round(base_pts_per_mo * skill_mult, 2)
                raw_growth = round(growth_rate * horizon_months, 2)
                # Ensure growth does not exceed needed deficit plus small buffer, and total <= 5.0
                proj_delta = min(deficit, raw_growth)
                new_lvl = round(float(np.clip(cur_lvl + proj_delta, 1.0, 5.0)), 1)
                proj_delta = round(new_lvl - cur_lvl, 2)

                if proj_delta > 0.05:
                    status = SkillGrowthStatus.PROJECTED_IMPROVEMENT
                    rationale = f"Projected growth +{proj_delta:.1f} level (from {cur_lvl:.1f} to {new_lvl:.1f}) over {horizon_days} days ({growth_rate:.2f}/mo pace)."
                else:
                    status = SkillGrowthStatus.PROJECTED_STABILITY
                    rationale = f"Proficiency projected to hold steady at Level {cur_lvl:.1f}."

            projected_lvl = round(float(np.clip(cur_lvl + proj_delta, 1.0, 5.0)), 1)
            remaining_gap = max(0.0, round(req_lvl - projected_lvl, 1))

            projected_skill_map[s_id] = projected_lvl
            projected_gaps_map[s_id] = remaining_gap

            projected_skills.append(ProjectedSkillGrowthItem(
                skill_id=s_id,
                skill_name=s_name,
                current_proficiency=cur_lvl,
                projected_proficiency=projected_lvl,
                projected_change=proj_delta,
                target_proficiency=req_lvl,
                remaining_gap=remaining_gap,
                status=status,
                growth_velocity_monthly=growth_rate if deficit > 0 else 0.0,
                rationale=rationale
            ))

        # 5. Detect Competency Bottlenecks
        bottlenecks: List[CompetencyBottleneckItem] = []
        for g in all_gaps:
            s_id = g["skill_id"]
            s_name = g["skill_name"]
            cur_lvl = float(g.get("current_level", 0.0))
            req_lvl = float(g.get("required_level", 3.0))
            deficit = max(0.0, req_lvl - cur_lvl)
            imp = float(g.get("importance", 0.5))

            if deficit <= 0.0:
                continue

            # Evaluate prerequisites
            prereq_eval = await self.dependency_service.evaluate_prerequisites(s_id, student_skill_map, db)
            unmet_prereqs = [p["prerequisite_skill_id"] for p in prereq_eval.get("prerequisites", []) if not p.get("is_met")]

            if unmet_prereqs:
                bottlenecks.append(CompetencyBottleneckItem(
                    skill_id=s_id,
                    skill_name=s_name,
                    current_proficiency=cur_lvl,
                    required_proficiency=req_lvl,
                    gap=round(deficit, 1),
                    reason=BottleneckReason.PREREQUISITE_BLOCKER,
                    impact_severity="CRITICAL",
                    blocking_prerequisites=unmet_prereqs,
                    explanation=f"Cannot effectively advance {s_name} until prerequisite competencies ({', '.join(unmet_prereqs)}) are satisfied.",
                    recommended_remediation=f"Complete prerequisite study modules in {', '.join(unmet_prereqs)} before attempting {s_name} capstones."
                ))
            elif deficit >= 2.5 and imp >= 0.7:
                bottlenecks.append(CompetencyBottleneckItem(
                    skill_id=s_id,
                    skill_name=s_name,
                    current_proficiency=cur_lvl,
                    required_proficiency=req_lvl,
                    gap=round(deficit, 1),
                    reason=BottleneckReason.HIGH_SKILL_GAP,
                    impact_severity="HIGH",
                    blocking_prerequisites=[],
                    explanation=f"Significant proficiency gap ({deficit:.1f} levels) in role-critical domain ({imp * 100:.0f}% importance).",
                    recommended_remediation=f"Dedicate structured project practice to close the {deficit:.1f} level deficit."
                ))
            elif obs_vel < 1.0 and deficit >= 1.5:
                bottlenecks.append(CompetencyBottleneckItem(
                    skill_id=s_id,
                    skill_name=s_name,
                    current_proficiency=cur_lvl,
                    required_proficiency=req_lvl,
                    gap=round(deficit, 1),
                    reason=BottleneckReason.LOW_LEARNING_VELOCITY,
                    impact_severity="MODERATE",
                    blocking_prerequisites=[],
                    explanation=f"Current study velocity ({obs_vel:.1f}/5.0) slows closure of {s_name} gap.",
                    recommended_remediation="Increase weekly study consistency to build momentum."
                ))
            elif imp >= 0.8 and deficit > 0.5:
                bottlenecks.append(CompetencyBottleneckItem(
                    skill_id=s_id,
                    skill_name=s_name,
                    current_proficiency=cur_lvl,
                    required_proficiency=req_lvl,
                    gap=round(deficit, 1),
                    reason=BottleneckReason.HIGH_CAREER_RELEVANCE,
                    impact_severity="HIGH",
                    blocking_prerequisites=[],
                    explanation=f"{s_name} is essential for {career_title} ({imp * 100:.0f}% importance weight).",
                    recommended_remediation=f"Prioritize hands-on remediation for {s_name} in learning roadmap."
                ))
            else:
                bottlenecks.append(CompetencyBottleneckItem(
                    skill_id=s_id,
                    skill_name=s_name,
                    current_proficiency=cur_lvl,
                    required_proficiency=req_lvl,
                    gap=round(deficit, 1),
                    reason=BottleneckReason.HIGH_SKILL_GAP,
                    impact_severity="MODERATE",
                    blocking_prerequisites=[],
                    explanation=f"Demonstrated proficiency ({cur_lvl:.1f}) is below target requirement ({req_lvl:.1f}).",
                    recommended_remediation=f"Complete course modules targeting {s_name}."
                ))

        # Sort bottlenecks: CRITICAL first, then HIGH, then MODERATE
        sev_order = {"CRITICAL": 0, "HIGH": 1, "MODERATE": 2}
        bottlenecks.sort(key=lambda b: (sev_order.get(b.impact_severity, 3), b.gap), reverse=False)

        # 6. Time-to-Target Competency Estimation
        total_remaining_deficit = sum(
            max(0.0, float(g.get("required_level", 3.0)) - float(g.get("current_level", 0.0)))
            for g in all_gaps if float(g.get("importance", 0.5)) >= 0.5
        )

        if total_remaining_deficit <= 0.0:
            time_range_str = "0 weeks (Target Competencies Met)"
            min_w, max_w = 0, 0
            tt_confidence = ForecastUncertainty.HIGH
        elif not li_overview.total_snapshots >= 2 and obs_vel <= 0.0:
            time_range_str = "12–16 weeks (Baseline Estimate)"
            min_w, max_w = 12, 16
            tt_confidence = ForecastUncertainty.INSUFFICIENT_DATA
        else:
            monthly_capacity = max(0.4, (proj_velocity / 5.0) * 1.5)
            est_months = total_remaining_deficit / monthly_capacity
            mid_weeks = int(round(est_months * 4.3))
            min_w = max(2, int(mid_weeks * 0.8))
            max_w = max(min_w + 2, int(mid_weeks * 1.25))
            time_range_str = f"{min_w}–{max_w} weeks"
            tt_confidence = ForecastUncertainty.MEDIUM if li_overview.total_snapshots >= 2 else ForecastUncertainty.LOW

        time_to_target = TimeToTargetEstimate(
            target_career_title=career_title,
            target_career_id=career_code,
            estimated_weeks_range=time_range_str,
            min_weeks=min_w,
            max_weeks=max_w,
            analytical_confidence=tt_confidence,
            basis_factors=[
                f"Total critical deficit: {total_remaining_deficit:.1f} levels across role skills",
                f"Simulated learning velocity: {proj_velocity:.1f}/5.0 index",
                f"Weekly study commitment: {weekly_hrs:.1f} hours/week",
                f"Prerequisite blockers identified: {len([b for b in bottlenecks if b.reason == BottleneckReason.PREREQUISITE_BLOCKER])}"
            ],
            scenario_name=sname
        )

        # 7. Projected ML Readiness Benchmark Simulation (In-Memory)
        base_ml_score = readiness_analysis.existing_ml_readiness.readiness_score
        # Build simulated skills list from projected proficiencies
        simulated_skills_list = [
            {
                "skill_id": s_id,
                "name": g.get("skill_name", s_id),
                "level": projected_skill_map.get(s_id, float(g.get("current_level", 1.0))),
                "verified": bool(g.get("current_level", 0) >= g.get("required_level", 1.0))
            }
            for g in all_gaps
            for s_id in [g["skill_id"]]
        ]

        try:
            pred_sim = self.ml_service.predict_readiness(
                student_skills_list=simulated_skills_list,
                target_career_id=career_code,
                degree=profile.get("degree", "B.Tech Computer Science"),
                institution_tier=int(profile.get("institution_tier", 2)),
                gpa=float(profile.get("gpa", 8.0)),
                weekly_study_hours=weekly_hrs,
                learning_velocity_index=min(2.5, proj_velocity)
            )
            proj_ml_score = float(pred_sim.get("readiness_score", base_ml_score))
        except Exception:
            # Conservative linear projection fallback
            proj_ml_score = round(float(np.clip(base_ml_score + (proj_velocity * 2.5 * horizon_months), 5.0, 99.0)), 1)

        proj_delta_ml = round(proj_ml_score - base_ml_score, 1)
        sim_margin = 2.2

        sim_id = f"sim_{career_code}_{stype.value.lower()}_{horizon_days}d"
        return ScenarioSimulationResult(
            scenario_id=sim_id,
            scenario_type=stype,
            scenario_name=sname,
            description=sdesc,
            assumptions=assumptions,
            projected_velocity=proj_velocity,
            projected_consistency=proj_consistency,
            projected_skill_changes=projected_skills,
            projected_gap_changes=projected_gaps_map,
            baseline_readiness_score=base_ml_score,
            projected_readiness_benchmark=proj_ml_score,
            projected_readiness_delta=proj_delta_ml,
            uncertainty_margin_points=sim_margin,
            projected_range_low=max(0.0, round(proj_ml_score - sim_margin, 1)),
            projected_range_high=min(100.0, round(proj_ml_score + sim_margin, 1)),
            estimated_time_to_target=time_to_target,
            bottlenecks=bottlenecks,
            limitations=[
                "Scenario execution simulates outcomes under hypothetical assumptions.",
                "Simulated scores do not mutate authoritative student records.",
                "Actual readiness progression requires validated assessment and project verification."
            ]
        )

    async def simulate_scenario(
        self,
        student_id: str,
        career_id: str,
        scenario_req: ScenarioSimulationRequest,
        db: AsyncDatabase
    ) -> ScenarioSimulationResult:
        """Simulates an isolated learning scenario without persisting state mutations."""
        profile = await db.student_profiles.find_one({"user_id": student_id})
        if not profile:
            raise ValueError(f"Student profile for user '{student_id}' not found.")

        career_doc = await db.career_roles.find_one({
            "$or": [{"career_code": career_id}, {"_id": career_id}]
        })
        if not career_doc:
            raise ValueError(f"Target career role '{career_id}' not found.")

        readiness_analysis = await self.career_readiness_service.get_career_readiness_analysis(
            student_id=student_id,
            career_id=career_doc.get("career_code", career_id),
            db=db
        )
        li_overview = await self.learning_intelligence_service.get_learning_trajectory_overview(
            student_id=student_id,
            db=db
        )

        return await self._run_in_memory_simulation(
            student_id=student_id,
            career_doc=career_doc,
            profile=profile,
            readiness_analysis=readiness_analysis,
            li_overview=li_overview,
            scenario_req=scenario_req,
            db=db
        )

    async def compare_scenarios(
        self,
        student_id: str,
        career_id: str,
        scenario_reqs: List[ScenarioSimulationRequest],
        db: AsyncDatabase
    ) -> ScenarioComparisonResponse:
        """Compares multiple learning scenarios side-by-side."""
        if not scenario_reqs:
            # Default 3 standard scenarios
            scenario_reqs = [
                ScenarioSimulationRequest(scenario_type=ScenarioType.CURRENT_TRAJECTORY, forecast_horizon_days=90),
                ScenarioSimulationRequest(scenario_type=ScenarioType.INCREASED_CONSISTENCY, forecast_horizon_days=90),
                ScenarioSimulationRequest(scenario_type=ScenarioType.GAP_FOCUSED, forecast_horizon_days=90)
            ]

        results = []
        for req in scenario_reqs[:4]:
            sim = await self.simulate_scenario(student_id=student_id, career_id=career_id, scenario_req=req, db=db)
            results.append(sim)

        career_doc = await db.career_roles.find_one({
            "$or": [{"career_code": career_id}, {"_id": career_id}]
        })
        career_title = career_doc.get("title", career_id) if career_doc else career_id

        summary = (
            f"Compared {len(results)} learning scenarios for '{career_title}'. "
            f"Baseline readiness is {results[0].baseline_readiness_score:.1f}%. "
            f"Simulated 90-day outcomes range from {min(r.projected_readiness_benchmark for r in results):.1f}% "
            f"to {max(r.projected_readiness_benchmark for r in results):.1f}% depending on study commitment and gap focus."
        )

        return ScenarioComparisonResponse(
            student_id=student_id,
            career_id=career_id,
            career_title=career_title,
            baseline_readiness_score=results[0].baseline_readiness_score if results else 0.0,
            baseline_velocity=results[0].projected_velocity if results else 1.0,
            scenarios=results,
            comparison_summary=summary,
            provenance_disclaimer="Scenario comparison presents analytical simulations side-by-side to assist student planning. No scenario is declared objectively best."
        )

    async def get_career_bottlenecks(
        self,
        student_id: str,
        career_id: str,
        db: AsyncDatabase
    ) -> List[CompetencyBottleneckItem]:
        """Retrieves prioritized competency bottlenecks for target career."""
        forecast = await self.generate_career_forecast(student_id=student_id, career_id=career_id, horizon_days=90, db=db)
        return forecast.bottlenecks

    async def get_forecast_history(
        self,
        student_id: str,
        career_id: str,
        db: AsyncDatabase
    ) -> List[Dict[str, Any]]:
        """Retrieves chronological forecast history for student and career."""
        cursor = db.career_forecasts.find(
            {"student_id": student_id, "career_id": career_id}
        ).sort("created_at", -1).limit(20)
        docs = await cursor.to_list(length=20)
        return serialize_docs(docs)
