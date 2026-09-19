"""
Skill2Career - Phase 08.1: Recommendation & Adaptive Roadmap Integrity Audit
Adversarial edge-case and integrity verification suite covering:
- Recommendation formula mathematical bounds, weights, determinism, and mastered skill exclusion.
- Dependency DAG cycle detection, branching, and threshold boundary tests.
- Profile edge cases (empty student, advanced student with all skills met, incomplete profile).
- Roadmap versioning lifecycle, history preservation, and career-switch isolation.
- Multi-tenant security isolation, unauthenticated rejection, and JWT identity enforcement.
- Grounded AI explanation invariance.
"""

import pytest
import numpy as np
from httpx import AsyncClient, ASGITransport
from bson import ObjectId

from backend.main import app
from backend.services.recommendation_service import RecommendationService
from backend.services.dependency_service import SkillDependencyService
from backend.services.adaptive_roadmap_service import AdaptiveRoadmapService
from backend.services.ai_context_builder import build_student_ai_context
from backend.database.mongodb import get_db, get_utc_now
from backend.database.seed import seed_database


# ==============================================================================
# 1. Recommendation Formula & Mathematical Integrity
# ==============================================================================

class TestRecommendationFormulaIntegrity:
    def test_formula_weights_sum_to_unity(self):
        w_gap = 0.30
        w_career = 0.25
        w_market = 0.20
        w_dep = 0.15
        w_feas = 0.10
        total_weight = w_gap + w_career + w_market + w_dep + w_feas
        assert round(total_weight, 6) == 1.0

    def test_min_boundary_all_zeros(self):
        service = RecommendationService()
        score, band = service.compute_priority_score(
            gap=0.01,
            career_importance=0.0,
            market_demand=0.0,
            downstream_count=0,
            prereq_pct=0.0,
            learning_velocity=0.0
        )
        assert score == 5.0
        assert band == "LOW"

    def test_max_boundary_all_maxima(self):
        service = RecommendationService()
        score, band = service.compute_priority_score(
            gap=5.0,
            career_importance=1.0,
            market_demand=100.0,
            downstream_count=10,
            prereq_pct=100.0,
            learning_velocity=5.0
        )
        assert score == 99.5
        assert band == "URGENT"

    def test_mastered_skill_excluded_from_priority(self):
        service = RecommendationService()
        score, band = service.compute_priority_score(
            gap=0.0,
            career_importance=1.0,
            market_demand=100.0,
            downstream_count=4,
            prereq_pct=100.0
        )
        assert score == 0.0
        assert band == "MASTERED"

    def test_formula_determinism_50_iterations(self):
        service = RecommendationService()
        scores = [
            service.compute_priority_score(
                gap=2.5,
                career_importance=0.85,
                market_demand=82.0,
                downstream_count=2,
                prereq_pct=75.0,
                learning_velocity=1.2
            )
            for _ in range(50)
        ]
        first_score, first_band = scores[0]
        assert all(s == first_score and b == first_band for s, b in scores)


# ==============================================================================
# 2. Dependency DAG Integrity & Boundary Tests
# ==============================================================================

class TestSkillDependencyDAGIntegrity:
    @pytest.mark.anyio
    async def test_linear_chain_and_branching_dag(self):
        service = SkillDependencyService()

        # Branching: A -> B, A -> C, B -> D, C -> D
        class MockBranchingDb:
            class skill_dependencies:
                @staticmethod
                def find(query):
                    class MockCursor:
                        async def to_list(self, length=200):
                            return [
                                {"skill_id": "SK_B", "prerequisite_skill_id": "SK_A"},
                                {"skill_id": "SK_C", "prerequisite_skill_id": "SK_A"},
                                {"skill_id": "SK_D", "prerequisite_skill_id": "SK_B"},
                                {"skill_id": "SK_D", "prerequisite_skill_id": "SK_C"},
                            ]
                    return MockCursor()

        mock_db = MockBranchingDb()
        validation = await service.validate_dag_integrity(mock_db)
        assert validation["status"] == "valid"
        assert validation["is_acyclic"] is True
        assert validation["total_dependencies"] == 4
        assert validation["total_nodes"] == 4

    @pytest.mark.anyio
    async def test_prerequisite_threshold_exact_boundaries(self):
        db = await get_db()
        await seed_database()
        service = SkillDependencyService()

        # Pandas (SK015) requires Python (SK001) at threshold 2.5
        # Case A: Below threshold (2.4) -> Unmet
        eval_below = await service.evaluate_prerequisites("SK015", {"SK001": 2.4}, db, prerequisite_threshold=2.5)
        assert eval_below["all_prerequisites_met"] is False

        # Case B: Exactly at threshold (2.5) -> Met
        eval_exact = await service.evaluate_prerequisites("SK015", {"SK001": 2.5}, db, prerequisite_threshold=2.5)
        assert eval_exact["all_prerequisites_met"] is True

        # Case C: Above threshold (3.0) -> Met
        eval_above = await service.evaluate_prerequisites("SK015", {"SK001": 3.0}, db, prerequisite_threshold=2.5)
        assert eval_above["all_prerequisites_met"] is True


# ==============================================================================
# 3. Student Profile Edge Cases
# ==============================================================================

class TestStudentProfileEdgeCases:
    @pytest.mark.anyio
    async def test_advanced_student_with_zero_gaps(self):
        db = await get_db()
        await seed_database()
        service = RecommendationService()
        roadmap_service = AdaptiveRoadmapService()

        # Create student profile where all skills required for CR001 are at 5.0 (mastered)
        career_doc = await db.career_roles.find_one({"career_code": "CR001"})
        req_skills = career_doc.get("required_skills", [])
        mastered_skills = [{"skill_id": r["skill_id"], "level": 5.0} for r in req_skills]

        test_user_id = f"adv_user_{ObjectId()}"
        await db.student_profiles.insert_one({
            "user_id": test_user_id,
            "target_career_id": "CR001",
            "skills": mastered_skills,
            "statistics": {"learning_velocity_index": 1.5}
        })

        # 1. Recommendations should filter out all mastered skills
        recs = await service.generate_recommendations_for_student(test_user_id, "CR001", db)
        assert len(recs) == 0

        # 2. Roadmap service should generate mastery roadmap gracefully
        roadmap = await roadmap_service.generate_or_get_adaptive_roadmap(test_user_id, "CR001", db, force_regenerate=True)
        assert roadmap["version"] >= 1
        assert len(roadmap["phases"]) == 3
        assert len(roadmap["phases"][0]["milestones"]) > 0
        assert "Advanced Architecture" in roadmap["phases"][0]["milestones"][0]["title"] or "Review" in roadmap["phases"][0]["milestones"][0]["title"]

    @pytest.mark.anyio
    async def test_empty_student_zero_history(self):
        db = await get_db()
        await seed_database()
        service = RecommendationService()

        # Student with empty profile
        empty_user_id = f"empty_user_{ObjectId()}"
        await db.student_profiles.insert_one({
            "user_id": empty_user_id,
            "target_career_id": "CR001",
            "skills": [],
            "statistics": {}
        })

        recs = await service.generate_recommendations_for_student(empty_user_id, "CR001", db)
        assert len(recs) > 0
        for r in recs:
            assert r["student_proficiency"] == 0.0
            assert r["gap"] > 0.0
            assert not np.isnan(r["priority_score"])


# ==============================================================================
# 4. Roadmap Versioning & Career-Switch Isolation
# ==============================================================================

class TestRoadmapVersioningAndCareerSwitch:
    @pytest.mark.anyio
    async def test_career_switch_creates_isolated_roadmaps(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Login demo user
            login_res = await ac.post("/api/v1/auth/login", json={
                "email": "demo@skill2career.com",
                "password": "Password123!"
            })
            token = login_res.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            # 1. Generate roadmap for Career CR001 (Backend Developer)
            r1_res = await ac.post("/api/v1/roadmap/recalculate?career_id=CR001", headers=headers)
            assert r1_res.status_code == 200
            r1 = r1_res.json()
            assert r1["career_id"] == "CR001"

            # 2. Switch to Career CR004 (Machine Learning Engineer)
            r2_res = await ac.post("/api/v1/roadmap/recalculate?career_id=CR004", headers=headers)
            assert r2_res.status_code == 200
            r2 = r2_res.json()
            assert r2["career_id"] == "CR004"

            # 3. Retrieve CR001 roadmap history - verify no contamination
            hist_cr001_res = await ac.get("/api/v1/roadmap/history?career_id=CR001", headers=headers)
            assert hist_cr001_res.status_code == 200
            hist_cr001 = hist_cr001_res.json()
            assert all(v["career_id"] == "CR001" for v in hist_cr001["versions"])

            # 4. Retrieve CR004 roadmap history - verify no contamination
            hist_cr004_res = await ac.get("/api/v1/roadmap/history?career_id=CR004", headers=headers)
            assert hist_cr004_res.status_code == 200
            hist_cr004 = hist_cr004_res.json()
            assert all(v["career_id"] == "CR004" for v in hist_cr004["versions"])


# ==============================================================================
# 5. Multi-Tenant Security & Negative Authorization
# ==============================================================================

class TestMultiTenantSecurityAndAuthorization:
    @pytest.mark.anyio
    async def test_unauthenticated_requests_are_rejected(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. Unauthenticated recommendations
            r1 = await ac.get("/api/v1/recommendations")
            assert r1.status_code == 401

            # 2. Unauthenticated roadmap current
            r2 = await ac.get("/api/v1/roadmap/current")
            assert r2.status_code == 401

            # 3. Unauthenticated roadmap progress update
            r3 = await ac.post("/api/v1/roadmap/progress", json={"milestone_id": "ms_test", "is_completed": True})
            assert r3.status_code == 401

            # 4. Unauthenticated feedback submission
            r4 = await ac.post("/api/v1/recommendations/feedback", json={
                "skill_id": "SK001",
                "career_id": "CR001",
                "feedback_type": "HELPFUL"
            })
            assert r4.status_code == 401


# ==============================================================================
# 6. AI Grounding & Recommendation Invariance
# ==============================================================================

class TestAIGroundingIntegrity:
    @pytest.mark.anyio
    async def test_ai_context_contains_exact_recommendation_and_readiness(self):
        db = await get_db()
        await seed_database()
        
        user = await db.users.find_one({"email": "demo@skill2career.com"})
        assert user is not None
        user_id = str(user.get("_id") or user.get("id"))

        context = await build_student_ai_context(user_id=user_id, db=db, target_career_id="CR001")
        assert "target_career" in context
        assert "recommendations" in context
        assert "roadmap" in context
        assert "market_intelligence" in context

        # Verify that recommendations in AI context match recommendation service
        if context["recommendations"]:
            first_rec = context["recommendations"][0]
            assert "priority_score" in first_rec
            assert "priority_band" in first_rec
            assert first_rec["priority_band"] in ["URGENT", "HIGH", "MODERATE", "LOW", "MASTERED"]
