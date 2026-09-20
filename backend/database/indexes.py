"""
Skill2Career MongoDB Index Definitions
Initializes production indexes across all 16 MongoDB collections for high query performance and uniqueness constraints.
"""

from pymongo import ASCENDING, DESCENDING
from pymongo.asynchronous.database import AsyncDatabase


async def ensure_indexes(db: AsyncDatabase):
    """Creates all required indexes asynchronously."""
    print("[MongoDB] Ensuring collection indexes...")

    # 1. users
    await db.users.create_index([("email", ASCENDING)], unique=True)

    # 2. student_profiles
    await db.student_profiles.create_index([("user_id", ASCENDING)], unique=True)
    await db.student_profiles.create_index([("target_career_id", ASCENDING)])
    await db.student_profiles.create_index([("skills.skill_id", ASCENDING)])

    # 3. skills
    await db.skills.create_index([("skill_code", ASCENDING)], unique=True)
    await db.skills.create_index([("name", ASCENDING)], unique=True)
    await db.skills.create_index([("aliases", ASCENDING)])

    # 4. career_roles
    await db.career_roles.create_index([("career_code", ASCENDING)], unique=True)
    await db.career_roles.create_index([("domain", ASCENDING)])
    await db.career_roles.create_index([("required_skills.skill_id", ASCENDING)])

    # 5. learning_activities
    await db.learning_activities.create_index([("student_id", ASCENDING)])
    await db.learning_activities.create_index([("student_id", ASCENDING), ("completed_at", DESCENDING)])
    await db.learning_activities.create_index([("skills", ASCENDING)])

    # 6. learning_snapshots
    await db.learning_snapshots.create_index([("student_id", ASCENDING), ("snapshot_date", DESCENDING)])
    await db.learning_snapshots.create_index([("student_id", ASCENDING), ("target_career_id", ASCENDING)])

    # 7. projects
    await db.projects.create_index([("student_id", ASCENDING)])
    await db.projects.create_index([("student_id", ASCENDING), ("created_at", DESCENDING)])

    # 8. certifications
    await db.certifications.create_index([("student_id", ASCENDING)])

    # 9. assessments
    await db.assessments.create_index([("skill_id", ASCENDING)])

    # 10. assessment_results
    await db.assessment_results.create_index([("student_id", ASCENDING)])
    await db.assessment_results.create_index([("student_id", ASCENDING), ("skill_id", ASCENDING)])
    await db.assessment_results.create_index([("student_id", ASCENDING), ("completed_at", DESCENDING)])

    # 11. skill_gaps
    await db.skill_gaps.create_index([("student_id", ASCENDING), ("career_id", ASCENDING)])
    await db.skill_gaps.create_index([("student_id", ASCENDING), ("priority", ASCENDING)])

    # 12. career_predictions
    await db.career_predictions.create_index([("student_id", ASCENDING), ("created_at", DESCENDING)])
    await db.career_predictions.create_index([("student_id", ASCENDING), ("match_score", DESCENDING)])

    # 13. readiness_predictions
    await db.readiness_predictions.create_index([("student_id", ASCENDING), ("career_id", ASCENDING), ("created_at", DESCENDING)])
    await db.readiness_predictions.create_index([("student_id", ASCENDING), ("prediction_type", ASCENDING)])

    # 14. roadmaps
    await db.roadmaps.create_index([("student_id", ASCENDING), ("career_id", ASCENDING)])
    await db.roadmaps.create_index([("student_id", ASCENDING), ("career_id", ASCENDING), ("is_current", ASCENDING)])
    await db.roadmaps.create_index([("student_id", ASCENDING), ("career_id", ASCENDING), ("version", DESCENDING)])

    # 15. model_versions
    await db.model_versions.create_index([("model_name", ASCENDING), ("version_tag", ASCENDING)], unique=True)
    await db.model_versions.create_index([("model_name", ASCENDING), ("is_active", ASCENDING)])

    # 16. prediction_logs
    await db.prediction_logs.create_index([("student_id", ASCENDING), ("created_at", DESCENDING)])
    await db.prediction_logs.create_index([("model_version_id", ASCENDING), ("created_at", DESCENDING)])

    # 17. career_market_signals
    await db.career_market_signals.create_index([("career_id", ASCENDING), ("region", ASCENDING)], unique=True)
    await db.career_market_signals.create_index([("career_id", ASCENDING)])
    await db.career_market_signals.create_index([("source_id", ASCENDING)])
    await db.career_market_signals.create_index([("retrieved_at", DESCENDING)])

    # 18. skill_market_signals
    await db.skill_market_signals.create_index([("skill_id", ASCENDING), ("region", ASCENDING)], unique=True)
    await db.skill_market_signals.create_index([("skill_id", ASCENDING)])
    await db.skill_market_signals.create_index([("source_id", ASCENDING)])
    await db.skill_market_signals.create_index([("retrieved_at", DESCENDING)])

    # 19. market_data_sources
    await db.market_data_sources.create_index([("source_id", ASCENDING)], unique=True)
    await db.market_data_sources.create_index([("source_name", ASCENDING)])
    await db.market_data_sources.create_index([("provider", ASCENDING)])

    # 20. skill_dependencies
    await db.skill_dependencies.create_index([("skill_id", ASCENDING), ("prerequisite_skill_id", ASCENDING)], unique=True)
    await db.skill_dependencies.create_index([("skill_id", ASCENDING)])
    await db.skill_dependencies.create_index([("prerequisite_skill_id", ASCENDING)])
    await db.skill_dependencies.create_index([("dependency_type", ASCENDING)])

    # 21. recommendation_feedback
    await db.recommendation_feedback.create_index([("student_id", ASCENDING), ("skill_id", ASCENDING), ("career_id", ASCENDING)])
    await db.recommendation_feedback.create_index([("student_id", ASCENDING), ("created_at", DESCENDING)])

    # 22. skill_evidence (Phase 09A)
    await db.skill_evidence.create_index([("evidence_id", ASCENDING)], unique=True)
    await db.skill_evidence.create_index([("student_id", ASCENDING)])
    await db.skill_evidence.create_index([("skill_id", ASCENDING)])
    await db.skill_evidence.create_index([("student_id", ASCENDING), ("skill_id", ASCENDING)])
    await db.skill_evidence.create_index([("student_id", ASCENDING), ("evidence_type", ASCENDING)])
    await db.skill_evidence.create_index([("student_id", ASCENDING), ("created_at", DESCENDING)])
    await db.skill_evidence.create_index([("source_entity", ASCENDING), ("source_entity_id", ASCENDING)])
    await db.skill_evidence.create_index([("verification_status", ASCENDING)])

    # 23. skill_state_history (Phase 09B)
    await db.skill_state_history.create_index([("student_id", ASCENDING), ("skill_id", ASCENDING), ("timestamp", DESCENDING)])
    await db.skill_state_history.create_index([("student_id", ASCENDING), ("timestamp", DESCENDING)])

    # 24. career_forecasts (Phase 10)
    await db.career_forecasts.create_index([("forecast_id", ASCENDING)], unique=True)
    await db.career_forecasts.create_index([("student_id", ASCENDING), ("career_id", ASCENDING), ("horizon", ASCENDING), ("created_at", DESCENDING)])
    await db.career_forecasts.create_index([("student_id", ASCENDING), ("created_at", DESCENDING)])

    # 25. career_transitions (Phase 11)
    await db.career_transitions.create_index([("transition_id", ASCENDING)], unique=True)
    await db.career_transitions.create_index([("student_id", ASCENDING), ("target_career_id", ASCENDING)])
    await db.career_transitions.create_index([("student_id", ASCENDING), ("created_at", DESCENDING)])

    print("[MongoDB] All collection indexes successfully created and verified.")
    return True


if __name__ == "__main__":
    import asyncio
    from backend.database.mongodb import connect_to_mongo, close_mongo_connection
    async def _run_indexes():
        print("--- Ensuring Skill2Career MongoDB Indexes ---")
        db = await connect_to_mongo()
        await ensure_indexes(db)
        await close_mongo_connection()
        print("Done.")
    asyncio.run(_run_indexes())
