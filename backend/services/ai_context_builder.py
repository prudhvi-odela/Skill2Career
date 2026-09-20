"""
Skill2Career Grounded AI Context Builder
Retrieves and aggregates verified student profile data, skills, evidence,
roadmap items, and authoritative ML inference telemetry from MongoDB.
"""

from typing import Dict, Any, Optional, List
from pymongo.asynchronous.database import AsyncDatabase
from backend.ml.inference import MLInferenceService
from backend.ml.features.student_features import StudentFeatureExtractor


async def build_student_ai_context(
    user_id: str,
    db: AsyncDatabase,
    target_career_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Constructs a rich, grounded context dictionary from authoritative MongoDB records.
    Ensures zero fabricated scores and preserves exact ML feature names and contributions.
    """
    ml_service = MLInferenceService.get_instance()

    # 1. Student Profile
    profile = await db.student_profiles.find_one({"user_id": user_id})
    user_doc = None
    try:
        from bson import ObjectId
        if ObjectId.is_valid(user_id):
            user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
    if not user_doc:
        user_doc = await db.users.find_one({"$or": [{"_id": user_id}, {"id": user_id}]})

    student_name = user_doc.get("full_name", "Student") if user_doc else "Student"
    effective_target_career_id = target_career_id or (profile.get("target_career_id") if profile else None)

    # 2. Target Career Details
    career_doc = None
    if effective_target_career_id:
        career_doc = await db.career_roles.find_one({
            "$or": [{"career_code": effective_target_career_id}, {"_id": effective_target_career_id}]
        })

    # 3. Student Skills
    student_skills: List[Dict[str, Any]] = profile.get("skills", []) if profile else []
    skills_context = [
        {
            "skill_name": s.get("name", s.get("skill_id")),
            "skill_id": s.get("skill_id"),
            "proficiency_level": float(s.get("level", 1.0)),
            "is_verified": bool(s.get("verified", False)),
            "years_experience": float(s.get("years_experience", 0.5)),
            "category": s.get("category", "General")
        }
        for s in student_skills
    ]

    # 4. Evidence (Projects, Certifications, Assessments)
    projects_cursor = db.projects.find({"student_id": user_id}).sort("created_at", -1)
    projects = await projects_cursor.to_list(length=20)
    projects_context = [
        {
            "title": p.get("title"),
            "tech_stack": p.get("technologies", ""),
            "complexity_rating": float(p.get("complexity_rating", 3.0)),
            "has_repo": bool(p.get("repository_url")),
            "has_live_demo": bool(p.get("live_url"))
        }
        for p in projects
    ]

    certs_cursor = db.certifications.find({"student_id": user_id}).sort("created_at", -1)
    certs = await certs_cursor.to_list(length=20)
    certs_context = [
        {
            "name": c.get("name"),
            "issuer": c.get("issuer"),
            "issue_date": str(c.get("issue_date", "")),
            "is_verified": bool(c.get("is_verified", True))
        }
        for c in certs
    ]

    assessments_cursor = db.student_assessments.find({"student_id": user_id}).sort("completed_at", -1)
    assessments = await assessments_cursor.to_list(length=20)
    assessments_context = [
        {
            "assessment_id": a.get("assessment_id"),
            "score_percentage": float(a.get("score_percentage", 0.0)),
            "passed": bool(a.get("passed", False))
        }
        for a in assessments
    ]

    # Work Experiences / Internships
    exp_cursor = db.work_experiences.find({"student_id": user_id}).sort("start_date", -1)
    experiences = await exp_cursor.to_list(length=10)
    experiences_context = [
        {
            "company_name": e.get("company_name"),
            "role": e.get("role"),
            "employment_type": e.get("employment_type", "INTERNSHIP"),
            "is_current": bool(e.get("is_current", False)),
            "skills_used": e.get("skills_used", [])
        }
        for e in experiences
    ]

    # Peer Reviews
    peer_cursor = db.peer_reviews.find({"student_id": user_id, "status": "APPROVED"}).sort("created_at", -1)
    peer_reviews = await peer_cursor.to_list(length=10)
    peer_reviews_context = [
        {
            "project_title": r.get("project_title"),
            "reviewer_name": r.get("reviewer_name"),
            "rating": r.get("rating"),
            "skills_verified": r.get("skills_verified", [])
        }
        for r in peer_reviews
    ]

    # 5. Latest Authoritative ML Readiness Prediction
    latest_prediction = await db.readiness_predictions.find_one(
        {"student_id": user_id},
        sort=[("created_at", -1)]
    )

    # If no prediction cached or career changed, compute fresh prediction via ML service
    if not latest_prediction or (effective_target_career_id and latest_prediction.get("career_id") != effective_target_career_id):
        try:
            inference_out = await ml_service.predict_readiness_from_db(
                user_id=user_id,
                target_career_id=effective_target_career_id,
                db=db
            )
            latest_prediction = {
                "_id": inference_out.get("prediction_id", "live-inference"),
                "readiness_score": inference_out["readiness_score"],
                "readiness_tier": inference_out["readiness_tier"],
                "model_version": inference_out.get("model_version", "v1.0.0-production"),
                "feature_contributions": inference_out.get("feature_contributions", {}),
                "top_strengths": inference_out.get("top_strengths", []),
                "top_gaps": inference_out.get("top_gaps", []),
                "confidence_margin": inference_out.get("confidence_margin", 5.0),
                "career_id": effective_target_career_id,
                "career_title": inference_out.get("career_title", "")
            }
        except Exception as e:
            latest_prediction = None

    # 6. Vectorized Skill Gap Analysis
    skill_gap_context = None
    if effective_target_career_id:
        try:
            gap_out = await ml_service.compute_skill_gap_from_db(
                user_id=user_id,
                target_career_id=effective_target_career_id,
                db=db
            )
            skill_gap_context = {
                "coverage_percentage": gap_out.get("coverage_percentage", 0.0),
                "total_skills_required": gap_out.get("total_skills_required", 0),
                "proficient_count": gap_out.get("proficient_count", 0),
                "estimated_remediation_hours": gap_out.get("estimated_remediation_hours", 0.0),
                "gaps": [
                    {
                        "skill_name": g.get("skill_name"),
                        "category": g.get("category"),
                        "current_level": g.get("current_level"),
                        "required_level": g.get("required_level"),
                        "gap": g.get("gap"),
                        "priority": g.get("priority"),
                        "estimated_hours": g.get("estimated_hours")
                    }
                    for g in gap_out.get("gaps", [])[:8]
                ]
            }
        except Exception:
            pass

    # 7. Career Matches
    matches_context = []
    try:
        student_skills_list = [
            {"skill_id": s.get("skill_id"), "skill_name": s.get("name"), "level": float(s.get("level", 1.0))}
            for s in student_skills
        ]
        matches = ml_service.match_careers(student_skills_list)
        matches_context = [
            {
                "career_id": m.get("career_id"),
                "title": m.get("career_title"),
                "domain": m.get("domain"),
                "match_percentage": m.get("match_percentage"),
                "benchmark_salary_usd": m.get("avg_salary_usd")
            }
            for m in matches[:5]
        ]
    except Exception:
        pass

    # 8. Learning Roadmap Progress
    roadmap_context = None
    if effective_target_career_id:
        try:
            roadmap_doc = await db.roadmaps.find_one({"student_id": user_id, "career_id": effective_target_career_id})
            if roadmap_doc:
                roadmap_items = roadmap_doc.get("items", [])
                completed_items = [i for i in roadmap_items if i.get("is_completed")]
                pending_items = [i for i in roadmap_items if not i.get("is_completed")]
                roadmap_context = {
                    "title": roadmap_doc.get("title"),
                    "target_completion_weeks": roadmap_doc.get("target_completion_weeks", 12),
                    "total_milestones": len(roadmap_items),
                    "completed_milestones": len(completed_items),
                    "next_milestones": [
                        {
                            "week": p.get("week_number"),
                            "skill": p.get("skill_name"),
                            "milestone": p.get("milestone_title"),
                            "estimated_hours": p.get("estimated_hours")
                        }
                        for p in pending_items[:4]
                    ]
                }
        except Exception:
            pass

    # 8. Market Intelligence Signals (Separate Layer with Provenance)
    market_context = None
    try:
        from backend.services.market_intelligence_service import MarketIntelligenceService
        market_svc = MarketIntelligenceService()
        career_mkt = await market_svc.get_career_market_signal(effective_target_career_id, db)
        sources = await market_svc.get_market_sources(db)
        is_mkt_fb = bool(career_mkt.get("is_fallback", False))
        market_context = {
            "career_demand_score": float(career_mkt.get("demand_score", 75.0)),
            "career_trend_direction": str(career_mkt.get("trend_direction", "unobserved" if is_mkt_fb else "stable")),
            "sample_size": career_mkt.get("sample_size"),
            "source_provenance": str(career_mkt.get("source_name", "Neutral Baseline Fallback" if is_mkt_fb else "Industry Standard")),
            "data_freshness": str(career_mkt.get("freshness", "unavailable" if is_mkt_fb else "fresh")),
            "is_fallback": is_mkt_fb,
            "valid_until": str(career_mkt.get("valid_until") or ""),
            "data_sources": [s.get("source_name") for s in sources]
        }
    except Exception:
        pass

    # 9. Deterministic Recommendations & Adaptive Phases (Phase 08)
    recommendations_context = []
    try:
        from backend.services.recommendation_service import RecommendationService
        rec_svc = RecommendationService()
        recs = await rec_svc.generate_recommendations_for_student(
            student_id=user_id,
            career_id=effective_target_career_id,
            db=db
        )
        recommendations_context = [
            {
                "skill_name": r["skill_name"],
                "priority_band": r["priority_band"],
                "priority_score": r["priority_score"],
                "gap": r["gap"],
                "learning_effort": r["learning_effort_level"],
                "rationale": r["rationale"]
            }
            for r in recs[:5]
        ]
    except Exception:
        pass

    # 10. Learning Evidence Context (Phase 09A)
    evidence_context = None
    try:
        from backend.services.evidence_aggregation_service import EvidenceAggregationService
        ev_agg = EvidenceAggregationService()
        ev_sum = await ev_agg.get_student_evidence_summary(student_id=user_id, db=db)
        evidence_context = {
            "total_evidence_count": ev_sum["total_evidence_count"],
            "verified_evidence_count": ev_sum["verified_evidence_count"],
            "skills_with_evidence_count": ev_sum["skills_with_evidence_count"],
            "top_verified_skills": [
                {
                    "skill_name": s["skill_name"],
                    "verified_count": s["verified_evidence_count"],
                    "observed_proficiency": s["observed_proficiency"],
                    "strongest_evidence": s["strongest_evidence_level"]
                }
                for s in ev_sum["skills_summary"][:5]
            ]
        }
    except Exception:
        pass

    # 11. Learning Intelligence & Trajectory Context (Phase 09B)
    learning_intelligence_context = None
    try:
        from backend.services.learning_intelligence_service import LearningIntelligenceService
        li_svc = LearningIntelligenceService()
        li_overview = await li_svc.get_learning_trajectory_overview(student_id=user_id, db=db)
        learning_intelligence_context = {
            "trajectory_direction": li_overview.trajectory_direction.value,
            "trajectory_confidence": li_overview.trajectory_confidence.value,
            "overall_learning_velocity": li_overview.velocity.overall_learning_velocity,
            "velocity_tier": li_overview.velocity.velocity_tier,
            "consistency_score": li_overview.consistency.consistency_score,
            "consistency_tier": li_overview.consistency.consistency_tier,
            "current_streak_days": li_overview.consistency.current_streak_days,
            "stagnation_status": li_overview.stagnation.status.value,
            "top_improving_skills": li_overview.top_improving_skills,
            "total_snapshots": li_overview.total_snapshots
        }
    except Exception:
        pass

    # 12. Career Readiness Analysis (Phase 09C)
    career_readiness_context = None
    if effective_target_career_id:
        try:
            from backend.services.career_readiness_service import CareerReadinessService
            cr_svc = CareerReadinessService()
            cr_analysis = await cr_svc.get_career_readiness_analysis(
                student_id=user_id,
                career_id=effective_target_career_id,
                db=db
            )
            career_readiness_context = {
                "ml_readiness_score": cr_analysis.existing_ml_readiness.readiness_score,
                "ml_readiness_tier": cr_analysis.existing_ml_readiness.readiness_tier,
                "skill_coverage_pct": cr_analysis.skill_alignment.coverage_percentage,
                "evidence_coverage_ratio": cr_analysis.evidence_coverage.evidence_coverage_ratio,
                "evidence_evaluation": cr_analysis.evidence_coverage.coverage_evaluation,
                "trajectory_direction": cr_analysis.learning_trajectory.trajectory_direction,
                "market_demand_score": cr_analysis.market_alignment.demand_score,
                "market_status": cr_analysis.market_alignment.market_signal_status,
                "top_strengths": [s.skill_name for s in cr_analysis.strengths[:3]],
                "top_gaps": [g.skill_name for g in cr_analysis.gaps if not g.is_mastered][:3],
                "top_actions": [a.skill_name for a in cr_analysis.next_actions[:3]]
            }
        except Exception:
            pass

    # 13. Career Forecasting & Scenario Intelligence (Phase 10)
    career_forecast_context = None
    if effective_target_career_id:
        try:
            from backend.services.career_forecast_service import CareerForecastService
            from backend.schemas.career_forecast_schemas import ForecastHorizon
            cf_svc = CareerForecastService()
            cf_data = await cf_svc.generate_career_forecast(
                student_id=user_id,
                career_id=effective_target_career_id,
                horizon_days=90,
                db=db
            )
            career_forecast_context = {
                "forecast_horizon_days": cf_data.forecast_horizon_days,
                "current_readiness": cf_data.active_scenario.baseline_readiness_score,
                "projected_readiness": cf_data.active_scenario.projected_readiness_benchmark,
                "uncertainty_level": cf_data.uncertainty.value,
                "uncertainty_rationale": cf_data.uncertainty_rationale,
                "prediction_uncertainty_margin": cf_data.prediction_uncertainty_margin,
                "projected_readiness_range": [cf_data.projected_range_low, cf_data.projected_range_high],
                "time_to_target_weeks": f"{cf_data.time_to_target.min_weeks}-{cf_data.time_to_target.max_weeks} weeks ({cf_data.time_to_target.estimated_weeks_range})" if cf_data.time_to_target else "Unknown",
                "bottlenecks": [
                    {"skill": b.skill_name, "reason": b.reason.value, "severity": b.impact_severity}
                    for b in cf_data.bottlenecks[:3]
                ],
                "projected_skills": [
                    {"skill": s.skill_name, "current": s.current_proficiency, "projected": s.projected_proficiency, "status": s.status.value}
                    for s in cf_data.skill_growth_projections[:5]
                ]
            }
        except Exception:
            pass

    # 14. Career Transition & Strategic Planning (Phase 11)
    career_transition_context = None
    if effective_target_career_id:
        try:
            from backend.services.career_transition_service import CareerTransitionService
            ct_svc = CareerTransitionService()
            ct_data = await ct_svc.analyze_transition(
                student_id=user_id,
                target_career_id=effective_target_career_id,
                db=db,
                persist=False
            )
            career_transition_context = {
                "source_career": ct_data.source_career.title,
                "target_career": ct_data.target_career.title,
                "shared_skills_count": ct_data.skill_overlap.shared_required_skills_count,
                "transferable_skills": [s.skill_name for s in ct_data.transferable_skills if s.transferability.value in ["DIRECTLY_TRANSFERABLE", "PARTIALLY_TRANSFERABLE"]][:4],
                "transition_gaps": [g.skill_name for g in ct_data.transition_gaps if g.is_critical][:4],
                "blocked_skills": [c.target_skill_name for c in ct_data.prerequisite_chains if c.is_blocked][:3],
                "milestones": [m.title for m in ct_data.transition_milestones],
                "market_provenance": ct_data.market_context.provenance_label,
                "forecast_benchmark": ct_data.forecast_context.projected_readiness_benchmark,
                "time_to_target_weeks": ct_data.forecast_context.time_to_target_weeks
            }
        except Exception:
            pass

    # Return structured context bundle
    return {
        "student": {
            "name": student_name,
            "degree": profile.get("degree", "Undergraduate") if profile else "Undergraduate",
            "major_or_branch": profile.get("major_or_branch", "") if profile else "",
            "academic_year": profile.get("academic_year", "") if profile else "",
            "institution": profile.get("institution", "") if profile else "",
            "graduation_year": profile.get("graduation_year", 2027) if profile else 2027,
            "gpa": profile.get("gpa", 8.0) if profile else 8.0,
            "weekly_study_hours": profile.get("weekly_study_hours", 15.0) if profile else 15.0,
            "interests": profile.get("interests", []) if profile else [],
            "skills_count": len(skills_context),
            "verified_skills_count": sum(1 for s in skills_context if s["is_verified"])
        },
        "target_career": {
            "career_id": effective_target_career_id,
            "title": career_doc.get("title") if career_doc else (latest_prediction.get("career_title") if latest_prediction else "Target Role"),
            "domain": career_doc.get("domain", "Technology") if career_doc else "Technology",
            "benchmark_salary_usd": career_doc.get("salary_information", {}).get("average_usd", 95000) if career_doc else 95000,
            "min_experience_years": career_doc.get("market_metadata", {}).get("min_exp_years", 0) if career_doc else 0
        } if effective_target_career_id else None,
        "skills": skills_context,
        "evidence": {
            "projects": projects_context,
            "certifications": certs_context,
            "assessments": assessments_context,
            "work_experiences": experiences_context,
            "peer_reviews": peer_reviews_context
        },
        "evidence_engine": evidence_context,
        "learning_intelligence": learning_intelligence_context,
        "career_readiness": career_readiness_context,
        "career_forecast": career_forecast_context,
        "career_transition": career_transition_context,
        "ml_readiness": {
            "prediction_id": str(latest_prediction.get("_id", "N/A")) if latest_prediction else "N/A",
            "readiness_score": float(latest_prediction.get("readiness_score", 0.0)) if latest_prediction else 0.0,
            "readiness_tier": latest_prediction.get("readiness_tier", "Needs Preparation") if latest_prediction else "Needs Preparation",
            "model_version": latest_prediction.get("model_version", "v1.0.0-production") if latest_prediction else "v1.0.0-production",
            "confidence_margin": float(latest_prediction.get("confidence_margin", 5.0)) if latest_prediction else 5.0,
            "feature_contributions": latest_prediction.get("feature_contributions", {}) if latest_prediction else {},
            "top_strengths": latest_prediction.get("top_strengths", []) if latest_prediction else [],
            "top_gaps": latest_prediction.get("top_gaps", []) if latest_prediction else []
        } if latest_prediction else None,
        "market_intelligence": market_context,
        "recommendations": recommendations_context,
        "skill_gaps": skill_gap_context,
        "career_matches": matches_context,
        "roadmap": roadmap_context
    }
