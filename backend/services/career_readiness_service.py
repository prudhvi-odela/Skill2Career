"""
Skill2Career - Phase 09C Career Readiness & Adaptive Forecasting Engine
Unifies student authoritative skill state, verified learning evidence, longitudinal learning intelligence,
career requirements, market intelligence, and existing ML predictions into an evidence-grounded interpretation layer.
"""

from typing import Dict, Any, List, Optional
import uuid
import numpy as np
from pymongo.asynchronous.database import AsyncDatabase

from backend.ml.gap_analyzer import SkillGapAnalyzer
from backend.ml.career_matcher import CareerMatcher
from backend.ml.inference import MLInferenceService
from backend.services.market_intelligence_service import MarketIntelligenceService
from backend.services.recommendation_service import RecommendationService
from backend.services.evidence_aggregation_service import EvidenceAggregationService
from backend.services.learning_intelligence_service import LearningIntelligenceService
from backend.services.career_comparison_service import CareerComparisonService
from backend.database.mongodb import get_utc_now
from backend.schemas.career_readiness_schemas import (
    ReadinessFactorCategory,
    FactorImpactType,
    MLReadinessBenchmark,
    CareerSkillAlignment,
    EvidenceCoverageSummary,
    LearningTrajectorySummary,
    MarketAlignmentSummary,
    ProjectAlignmentSummary,
    ProjectAlignmentItem,
    AssessmentAlignmentSummary,
    AssessmentAlignmentItem,
    CertificationAlignmentSummary,
    CertificationAlignmentItem,
    CareerStrengthItem,
    CareerGapItem,
    CareerReadinessFactorItem,
    CareerActionItem,
    CareerReadinessAnalysisResponse
)


class CareerReadinessService:
    def __init__(self):
        self.gap_analyzer = SkillGapAnalyzer()
        self.career_matcher = CareerMatcher()
        self.ml_service = MLInferenceService.get_instance()
        self.market_service = MarketIntelligenceService()
        self.recommendation_service = RecommendationService()
        self.evidence_aggregation_service = EvidenceAggregationService()
        self.learning_intelligence_service = LearningIntelligenceService()
        self.career_comparison_service = CareerComparisonService()

    async def get_career_readiness_analysis(
        self,
        student_id: str,
        career_id: str,
        db: AsyncDatabase
    ) -> CareerReadinessAnalysisResponse:
        """
        Constructs comprehensive, evidence-grounded career readiness analysis for student and target career role.
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
        avg_salary = float(career_doc.get("avg_salary_usd", 95000.0))

        student_skills = profile.get("skills", [])
        student_skill_map = {
            s.get("skill_id"): float(s.get("level", s.get("proficiency_level", 1.0)))
            for s in student_skills if s.get("skill_id")
        }

        # 2. Existing ML Readiness Prediction (Authoritative ML Pipeline)
        latest_pred = await db.readiness_predictions.find_one(
            {"student_id": student_id, "career_id": career_code},
            sort=[("created_at", -1)]
        )
        if latest_pred:
            ml_score = float(latest_pred.get("readiness_score", 0.0))
            ml_tier = str(latest_pred.get("readiness_tier", "Needs Preparation"))
            ml_version = str(latest_pred.get("model_version", "v1.0.0-production"))
            ml_margin = float(latest_pred.get("confidence_margin", 2.2))
            ml_algo = str(latest_pred.get("model_algorithm", "LinearRegression"))
        else:
            pred_out = self.ml_service.predict_readiness(
                student_skills_list=student_skills,
                target_career_id=career_code,
                degree=profile.get("degree", "B.Tech Computer Science"),
                institution_tier=int(profile.get("institution_tier", 2)),
                gpa=float(profile.get("gpa", 8.0)),
                weekly_study_hours=float(profile.get("statistics", {}).get("weekly_study_hours", 12.0)),
                learning_velocity_index=float(profile.get("statistics", {}).get("learning_velocity_index", 1.0))
            )
            ml_score = float(pred_out.get("readiness_score", 0.0))
            ml_tier = str(pred_out.get("readiness_tier", "Needs Preparation"))
            ml_version = str(pred_out.get("model_version", "v1.0.0-production"))
            ml_margin = float(pred_out.get("confidence_margin", 2.2))
            ml_algo = str(pred_out.get("model_algorithm", "LinearRegression"))

        ml_benchmark = MLReadinessBenchmark(
            readiness_score=ml_score,
            readiness_tier=ml_tier,
            is_job_ready=ml_score >= 75.0,
            model_version=ml_version,
            confidence_margin=ml_margin,
            model_algorithm=ml_algo,
            interpretation_note="Synthetic competency benchmark evaluated by trained ML inference pipeline; does not constitute an employment guarantee."
        )

        # 3. Canonical Skill Alignment & Gaps (Gap Analyzer)
        gap_res = self.gap_analyzer.analyze_gap(student_skills, career_code)
        all_gaps = gap_res.get("gaps", [])
        total_req = gap_res.get("total_skills_required", len(all_gaps))
        proficient_count = gap_res.get("proficient_count", 0)
        coverage_pct = float(gap_res.get("coverage_percentage", 0.0))

        covered_skills = [g for g in all_gaps if float(g.get("current_level", 0.0)) > 0.0]
        missing_skills = [g for g in all_gaps if float(g.get("current_level", 0.0)) == 0.0]
        req_deficits = [max(0.0, float(g.get("gap", 0.0))) for g in all_gaps]
        avg_gap = round(float(np.mean(req_deficits)), 2) if req_deficits else 0.0
        critical_gaps_list = [g for g in all_gaps if g.get("priority") in ["Critical", "High"] and float(g.get("gap", 0.0)) > 0.0]

        skill_alignment = CareerSkillAlignment(
            required_skill_count=total_req,
            covered_skill_count=len(covered_skills),
            proficient_skill_count=proficient_count,
            missing_skill_count=len(missing_skills),
            coverage_percentage=coverage_pct,
            average_requirement_gap=avg_gap,
            critical_skill_gaps_count=len(critical_gaps_list)
        )

        # 4. Evidence Coverage & Multi-Artifact Alignment (Phase 09A Evidence Engine)
        ev_summary = await self.evidence_aggregation_service.get_student_evidence_summary(student_id=student_id, db=db)
        ev_skills_map = {
            s["skill_id"]: s for s in ev_summary.get("skills_summary", [])
        }

        # Direct query for rejected vs unverified evidence
        rejected_ev_count = await db.skill_evidence.count_documents({
            "student_id": student_id,
            "verification_status": "REJECTED"
        })
        unverified_ev_count = await db.skill_evidence.count_documents({
            "student_id": student_id,
            "verification_status": "UNVERIFIED"
        })

        req_skill_ids = [g["skill_id"] for g in all_gaps]
        skills_with_verified_ev = [
            sid for sid in req_skill_ids
            if sid in ev_skills_map and ev_skills_map[sid].get("verified_evidence_count", 0) > 0
        ]
        skills_without_verified_ev = [sid for sid in req_skill_ids if sid not in skills_with_verified_ev]
        
        career_verified_ev_count = sum(
            ev_skills_map[sid].get("verified_evidence_count", 0)
            for sid in req_skill_ids if sid in ev_skills_map
        )
        ev_ratio = round(len(skills_with_verified_ev) / max(1, total_req), 2)
        ev_eval = "Well Grounded" if ev_ratio >= 0.7 else ("Moderately Backed" if ev_ratio >= 0.4 else "Developing Evidence")

        evidence_coverage = EvidenceCoverageSummary(
            career_relevant_skills_with_verified_evidence=len(skills_with_verified_ev),
            career_relevant_skills_without_verified_evidence=len(skills_without_verified_ev),
            verified_evidence_count=career_verified_ev_count,
            unverified_evidence_count=unverified_ev_count,
            rejected_evidence_count=rejected_ev_count,
            evidence_coverage_ratio=ev_ratio,
            coverage_evaluation=ev_eval
        )

        # 5. Longitudinal Learning Intelligence & Trajectory (Phase 09B)
        li_overview = await self.learning_intelligence_service.get_learning_trajectory_overview(student_id=student_id, db=db)
        prog_map = {p.skill_id: p for p in li_overview.skill_progressions}

        learning_trajectory = LearningTrajectorySummary(
            trajectory_direction=li_overview.trajectory_direction.value,
            trajectory_confidence=li_overview.trajectory_confidence.value,
            overall_learning_velocity=li_overview.velocity.overall_learning_velocity,
            velocity_tier=li_overview.velocity.velocity_tier,
            consistency_score=li_overview.consistency.consistency_score,
            consistency_tier=li_overview.consistency.consistency_tier,
            current_streak_days=li_overview.consistency.current_streak_days,
            stagnation_status=li_overview.stagnation.status.value,
            top_improving_skills=li_overview.top_improving_skills,
            total_snapshots=li_overview.total_snapshots,
            has_sufficient_history=li_overview.total_snapshots >= 2
        )

        # 6. External Market Intelligence (Phase 07 / 08.2)
        career_mkt = await self.market_service.get_career_market_signal(career_code, db)
        is_mkt_fb = bool(career_mkt.get("is_fallback", False))
        mkt_freshness = str(career_mkt.get("freshness", "unavailable" if is_mkt_fb else "fresh"))
        
        if is_mkt_fb or mkt_freshness == "unavailable":
            mkt_status = "FALLBACK_UNAVAILABLE"
            mkt_src = "Neutral Baseline Fallback"
            mkt_prov_note = "Live market signal unobserved; neutral baseline benchmark (75.0) applied."
        elif mkt_freshness == "stale":
            mkt_status = "STALE"
            mkt_src = str(career_mkt.get("source_name", "Industry Benchmark (Stale)"))
            mkt_prov_note = f"Market demand signal ({career_mkt.get('demand_score', 75.0):.1f}/100) from historical benchmark archive."
        elif mkt_freshness == "expiring_soon":
            mkt_status = "EXPIRING_SOON"
            mkt_src = str(career_mkt.get("source_name", "Industry Benchmark (Expiring)"))
            mkt_prov_note = f"Market demand signal ({career_mkt.get('demand_score', 75.0):.1f}/100) expiring soon; verification recommended."
        else:
            mkt_status = "OBSERVED"
            mkt_src = str(career_mkt.get("source_name", "Industry Benchmark"))
            mkt_prov_note = f"Authoritative market demand signal ({career_mkt.get('demand_score', 75.0):.1f}/100) confirms role demand."

        market_alignment = MarketAlignmentSummary(
            career_id=career_code,
            career_title=career_title,
            demand_score=float(career_mkt.get("demand_score", 75.0)),
            trend_direction=str(career_mkt.get("trend_direction", "unobserved" if is_mkt_fb else "stable")),
            market_signal_status=mkt_status,
            market_source=mkt_src,
            data_freshness=mkt_freshness,
            is_fallback=is_mkt_fb,
            provenance_note=mkt_prov_note
        )

        # 7. Project Alignment
        projects_cursor = db.projects.find({"student_id": student_id})
        projects_raw = await projects_cursor.to_list(length=50)
        project_items = []
        covered_via_projects = set()

        for p in projects_raw:
            p_skills = p.get("technologies", []) if isinstance(p.get("technologies"), list) else [str(p.get("technologies", ""))]
            if isinstance(p.get("skills"), list):
                p_skills += p.get("skills")
            
            # Map project skills to career required skills
            aligned = [sid for sid in req_skill_ids if any(sid.lower() in str(ps).lower() or str(ps).lower() in sid.lower() for ps in p_skills)]
            for a in aligned:
                covered_via_projects.add(a)

            project_items.append(ProjectAlignmentItem(
                project_id=str(p.get("_id") or p.get("project_id", "")),
                title=str(p.get("title", "Project")),
                technologies=p_skills,
                complexity_rating=float(p.get("complexity_rating", 3.0)),
                aligned_skills=aligned,
                has_repository=bool(p.get("repository_url")),
                has_live_demo=bool(p.get("live_url"))
            ))

        proj_gaps = [sid for sid in req_skill_ids if sid not in covered_via_projects]
        project_alignment = ProjectAlignmentSummary(
            career_relevant_projects_count=len(project_items),
            covered_skills_via_projects=list(covered_via_projects),
            projects=project_items,
            project_evidence_gaps=proj_gaps
        )

        # 8. Assessment Alignment
        asms_cursor = db.student_assessments.find({"$or": [{"student_id": student_id}, {"user_id": student_id}]})
        asms_raw = await asms_cursor.to_list(length=50)
        if not asms_raw:
            asms_raw = await db.assessment_results.find({"student_id": student_id}).to_list(length=50)

        asm_items = []
        verified_via_asms = set()
        passed_count = 0

        for a in asms_raw:
            a_id = str(a.get("assessment_id") or a.get("_id", ""))
            sk_id = str(a.get("skill_id", "GEN001"))
            sk_name = str(a.get("skill_name", sk_id))
            score_pct = float(a.get("score_percentage", a.get("score", 0.0)))
            is_passed = bool(a.get("passed", score_pct >= 70.0))
            if is_passed:
                passed_count += 1
                if sk_id in req_skill_ids:
                    verified_via_asms.add(sk_id)

            asm_items.append(AssessmentAlignmentItem(
                assessment_id=a_id,
                skill_id=sk_id,
                skill_name=sk_name,
                score_percentage=score_pct,
                passed=is_passed,
                verified_at=str(a.get("completed_at") or a.get("created_at") or "")
            ))

        pass_rate = round((passed_count / len(asm_items)) * 100.0, 1) if asm_items else 0.0
        assessment_alignment = AssessmentAlignmentSummary(
            total_assessments_taken=len(asm_items),
            passed_assessments_count=passed_count,
            pass_rate_pct=pass_rate,
            verified_skills_via_assessments=list(verified_via_asms),
            assessments=asm_items
        )

        # 9. Certification Alignment
        certs_cursor = db.certifications.find({"student_id": student_id})
        certs_raw = await certs_cursor.to_list(length=50)
        cert_items = []
        verified_certs_count = 0

        for c in certs_raw:
            is_ver = bool(c.get("is_verified", True))
            if is_ver:
                verified_certs_count += 1
            cert_items.append(CertificationAlignmentItem(
                certification_id=str(c.get("_id") or c.get("id", "")),
                name=str(c.get("name", "Certification")),
                issuer=str(c.get("issuer", "Authority")),
                aligned_skills=c.get("skills", []),
                is_verified=is_ver
            ))

        certification_alignment = CertificationAlignmentSummary(
            total_certifications_count=len(cert_items),
            verified_certifications_count=verified_certs_count,
            certifications=cert_items
        )

        # 10. Evidence-Backed Strengths
        strengths = []
        for g in all_gaps:
            s_id = g["skill_id"]
            s_name = g["skill_name"]
            req_lvl = float(g["required_level"])
            cur_lvl = float(g["current_level"])
            imp = float(g["importance"])
            cat = g.get("category", "General")

            # A strength is a skill that meets/exceeds target OR has proficiency >= 3.0 with positive surplus/alignment
            if cur_lvl >= req_lvl or (cur_lvl >= 2.5 and (req_lvl - cur_lvl) <= 0.5):
                surplus = round(cur_lvl - req_lvl, 2)
                ev_info = ev_skills_map.get(s_id)
                ver_count = ev_info.get("verified_evidence_count", 0) if ev_info else 0
                ev_status = "VERIFIED" if ver_count > 0 else ("UNVERIFIED" if ev_info else "NO_EVIDENCE")

                prog_item = prog_map.get(s_id)
                traj_status = prog_item.status.value if prog_item else "INSUFFICIENT_HISTORY"

                rationale = (
                    f"Proficiency Level {cur_lvl:.1f} meets target {req_lvl:.1f} for '{career_title}' "
                    f"({surplus:+.1f} surplus). Supported by {ver_count} verified artifact(s); trajectory is {traj_status}."
                )

                strengths.append(CareerStrengthItem(
                    skill_id=s_id,
                    skill_name=s_name,
                    proficiency=cur_lvl,
                    required_proficiency=req_lvl,
                    surplus=surplus,
                    career_relevance=imp,
                    category=cat,
                    evidence_status=ev_status,
                    supporting_evidence_count=ver_count,
                    trajectory_status=traj_status,
                    strength_rationale=rationale
                ))

        # Sort strengths by proficiency surplus descending and relevance
        strengths.sort(key=lambda x: (x.surplus, x.career_relevance), reverse=True)

        # 11. Career Gaps (Excluding Mastered Skills from Remediation)
        # Fetch deterministic recommendations to align priorities
        recs = await self.recommendation_service.generate_recommendations_for_student(
            student_id=student_id,
            career_id=career_code,
            db=db
        )
        rec_map = {r["skill_id"]: r for r in recs}

        gaps = []
        for g in all_gaps:
            s_id = g["skill_id"]
            s_name = g["skill_name"]
            req_lvl = float(g["required_level"])
            cur_lvl = float(g["current_level"])
            deficit = max(0.0, req_lvl - cur_lvl)
            imp = float(g["importance"])
            cat = g.get("category", "General")
            is_mastered = deficit <= 0.0

            rec = rec_map.get(s_id)
            if rec:
                p_score = rec["priority_score"]
                p_band = rec["priority_band"]
                mkt_rel = rec["market_relevance"]
                rationale = rec["rationale"]
            else:
                p_score = 0.0 if is_mastered else 40.0
                p_band = "MASTERED" if is_mastered else "MODERATE"
                mkt_rel = 75.0
                rationale = f"{s_name} is mastered." if is_mastered else f"Deficit of {deficit:.1f} levels."

            ev_info = ev_skills_map.get(s_id)
            ver_count = ev_info.get("verified_evidence_count", 0) if ev_info else 0
            ev_status = "VERIFIED" if ver_count > 0 else ("UNVERIFIED" if ev_info else "NO_EVIDENCE")

            prog_item = prog_map.get(s_id)
            traj_status = prog_item.status.value if prog_item else "INSUFFICIENT_HISTORY"

            gaps.append(CareerGapItem(
                skill_id=s_id,
                skill_name=s_name,
                current_proficiency=cur_lvl,
                required_proficiency=req_lvl,
                gap=round(deficit, 1),
                career_relevance=imp,
                market_relevance=mkt_rel,
                category=cat,
                evidence_status=ev_status,
                trajectory_status=traj_status,
                priority_score=p_score,
                priority_band=p_band,
                is_mastered=is_mastered,
                gap_rationale=rationale
            ))

        # Sort gaps: non-mastered first by priority_score descending, then mastered
        gaps.sort(key=lambda x: (not x.is_mastered, x.priority_score, x.gap), reverse=True)

        # 12. Observable Readiness Factors (Categorized Positive, Limiting, Neutral)
        readiness_factors = []

        # SKILL_ALIGNMENT
        if coverage_pct >= 70.0:
            readiness_factors.append(CareerReadinessFactorItem(
                category=ReadinessFactorCategory.SKILL_ALIGNMENT,
                factor_title="High Competency Coverage",
                impact_type=FactorImpactType.POSITIVE,
                description=f"Student covers {coverage_pct:.0f}% of required skills for {career_title}.",
                evidence_source="Gap Analyzer Matrix"
            ))
        else:
            readiness_factors.append(CareerReadinessFactorItem(
                category=ReadinessFactorCategory.SKILL_ALIGNMENT,
                factor_title="Core Competency Deficits",
                impact_type=FactorImpactType.LIMITING,
                description=f"Coverage is at {coverage_pct:.0f}% with {len(critical_gaps_list)} critical gaps requiring remediation.",
                evidence_source="Gap Analyzer Matrix"
            ))

        # EVIDENCE_COVERAGE
        if ev_ratio >= 0.6:
            readiness_factors.append(CareerReadinessFactorItem(
                category=ReadinessFactorCategory.EVIDENCE_COVERAGE,
                factor_title="Strong Evidentiary Grounding",
                impact_type=FactorImpactType.POSITIVE,
                description=f"{len(skills_with_verified_ev)}/{total_req} required skills are supported by verified artifacts.",
                evidence_source="Skill Evidence Ledger"
            ))
        else:
            readiness_factors.append(CareerReadinessFactorItem(
                category=ReadinessFactorCategory.EVIDENCE_COVERAGE,
                factor_title="Unverified Competency Claims",
                impact_type=FactorImpactType.LIMITING,
                description=f"{len(skills_without_verified_ev)} required skills rely on self-reporting without verified artifact backing.",
                evidence_source="Skill Evidence Ledger"
            ))

        # LEARNING_TRAJECTORY
        if li_overview.velocity.overall_learning_velocity >= 2.0:
            readiness_factors.append(CareerReadinessFactorItem(
                category=ReadinessFactorCategory.LEARNING_TRAJECTORY,
                factor_title="Positive Learning Momentum",
                impact_type=FactorImpactType.POSITIVE,
                description=f"Sustaining {li_overview.velocity.velocity_tier} ({li_overview.velocity.overall_learning_velocity:.1f}/5.0 index) with {li_overview.consistency.current_streak_days}-day streak.",
                evidence_source="Learning Intelligence Engine"
            ))
        else:
            readiness_factors.append(CareerReadinessFactorItem(
                category=ReadinessFactorCategory.LEARNING_TRAJECTORY,
                factor_title="Developing Study Cadence",
                impact_type=FactorImpactType.NEUTRAL,
                description=f"Learning velocity is at {li_overview.velocity.overall_learning_velocity:.1f}/5.0; additional weekly sessions recommended.",
                evidence_source="Learning Intelligence Engine"
            ))

        # PROJECT_EXPERIENCE
        if len(project_items) >= 2:
            readiness_factors.append(CareerReadinessFactorItem(
                category=ReadinessFactorCategory.PROJECT_EXPERIENCE,
                factor_title="Demonstrated Project Portfolio",
                impact_type=FactorImpactType.POSITIVE,
                description=f"{len(project_items)} hands-on projects cover {len(covered_via_projects)} career-relevant competencies.",
                evidence_source="Student Project Repository"
            ))
        else:
            readiness_factors.append(CareerReadinessFactorItem(
                category=ReadinessFactorCategory.PROJECT_EXPERIENCE,
                factor_title="Limited Project Depth",
                impact_type=FactorImpactType.LIMITING,
                description="Additional end-to-end technical projects are needed to demonstrate practical domain competence.",
                evidence_source="Student Project Repository"
            ))

        # ASSESSMENT_SUPPORT
        if passed_count > 0:
            readiness_factors.append(CareerReadinessFactorItem(
                category=ReadinessFactorCategory.ASSESSMENT_SUPPORT,
                factor_title="Verified Technical Assessments",
                impact_type=FactorImpactType.POSITIVE,
                description=f"{passed_count} technical assessments passed with a {pass_rate:.1f}% pass rate.",
                evidence_source="Assessment Evaluation Logs"
            ))
        else:
            readiness_factors.append(CareerReadinessFactorItem(
                category=ReadinessFactorCategory.ASSESSMENT_SUPPORT,
                factor_title="No Assessment Verification",
                impact_type=FactorImpactType.NEUTRAL,
                description="Technical assessments have not yet been completed to substantiate skill proficiency.",
                evidence_source="Assessment Evaluation Logs"
            ))

        # MARKET_ALIGNMENT
        if market_alignment.demand_score >= 70.0:
            readiness_factors.append(CareerReadinessFactorItem(
                category=ReadinessFactorCategory.MARKET_ALIGNMENT,
                factor_title="Favorable External Market Demand",
                impact_type=FactorImpactType.POSITIVE,
                description=f"Industry demand index is {market_alignment.demand_score:.1f}/100 ({market_alignment.market_source}).",
                evidence_source="Career Market Signals"
            ))

        # 13. Concrete Next Actions (Mapped from Gaps & Recommendations)
        next_actions = []
        for r in recs[:6]:
            s_id = r["skill_id"]
            s_name = r["skill_name"]
            p_band = r["priority_band"]
            p_score = r["priority_score"]
            effort = r["learning_effort_level"]
            hours = r["estimated_planning_hours"]
            rationale = r["rationale"]

            # Determine action type based on evidence and dependencies
            ev_info = ev_skills_map.get(s_id)
            if not r.get("prerequisites_met", True):
                act_type = "PREREQUISITE_STUDY"
            elif s_id in covered_via_projects and (ev_info is None or ev_info.get("verified_evidence_count", 0) == 0):
                act_type = "ASSESSMENT_VERIFICATION"
            elif effort == "HIGH":
                act_type = "PROJECT_BUILD"
            else:
                act_type = "STUDY_MODULE"

            next_actions.append(CareerActionItem(
                action_id=f"act_{career_code}_{s_id}",
                skill_id=s_id,
                skill_name=s_name,
                action_type=act_type,
                priority_band=p_band,
                priority_score=p_score,
                learning_effort_level=effort,
                estimated_planning_hours=hours,
                rationale=rationale,
                recommendation_id=r.get("recommendation_id") or f"rec_{career_code}_{s_id}"
            ))

        # 14. Provenance Notes
        provenance = [
            f"Career requirements derived from authoritative taxonomy for role '{career_title}' ({career_code}).",
            f"Job readiness score ({ml_score:.1f}%) computed by registered {ml_algo} pipeline ({ml_version}).",
            f"Evidence coverage derived from {career_verified_ev_count} verified artifacts in Skill Evidence Ledger.",
            f"Market demand signal ({market_alignment.demand_score:.1f}/100) provided by {market_alignment.market_source}.",
            "This analysis interprets observational skill progression and does not guarantee employment or hiring outcomes."
        ]

        return CareerReadinessAnalysisResponse(
            student_id=student_id,
            career_id=career_code,
            career_title=career_title,
            domain=domain,
            avg_salary_usd=avg_salary,
            salary_provenance="Industry Benchmark Data",
            existing_ml_readiness=ml_benchmark,
            skill_alignment=skill_alignment,
            evidence_coverage=evidence_coverage,
            learning_trajectory=learning_trajectory,
            market_alignment=market_alignment,
            project_alignment=project_alignment,
            assessment_alignment=assessment_alignment,
            certification_alignment=certification_alignment,
            strengths=strengths,
            gaps=gaps,
            readiness_factors=readiness_factors,
            next_actions=next_actions,
            provenance_notes=provenance,
            generated_at=get_utc_now().isoformat(),
            engine_version="v1.0-career-readiness"
        )

    async def get_career_strengths(
        self,
        student_id: str,
        career_id: str,
        db: AsyncDatabase
    ) -> List[CareerStrengthItem]:
        """Retrieves verified and demonstrated strengths for target career."""
        analysis = await self.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)
        return analysis.strengths

    async def get_career_gaps(
        self,
        student_id: str,
        career_id: str,
        db: AsyncDatabase
    ) -> List[CareerGapItem]:
        """Retrieves prioritized competency gaps for target career."""
        analysis = await self.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)
        return analysis.gaps

    async def get_career_evidence(
        self,
        student_id: str,
        career_id: str,
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """Retrieves multi-artifact evidence alignment for target career."""
        analysis = await self.get_career_readiness_analysis(student_id=student_id, career_id=career_id, db=db)
        return {
            "evidence_coverage": analysis.evidence_coverage,
            "project_alignment": analysis.project_alignment,
            "assessment_alignment": analysis.assessment_alignment,
            "certification_alignment": analysis.certification_alignment
        }

    async def compare_careers(
        self,
        student_id: str,
        career_ids: List[str],
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """Compares multiple career pathways side-by-side using existing comparison infrastructure."""
        return await self.career_comparison_service.compare_careers(
            student_id=student_id,
            career_ids=career_ids,
            db=db
        )
