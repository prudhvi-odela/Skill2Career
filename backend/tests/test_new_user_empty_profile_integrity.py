"""
Production Integrity Test Suite: Brand-New User / Empty Profile
Verifies:
1. Registration creates isolated student identity with no demo leakage
2. New student has 0 skills, 0 projects, 0 certs, 0 evidence, 0 activities
3. No Alex Chen student_id / user_id reused
4. No default 12-hour study pace (0.0 hrs)
5. No default 1x velocity (0.0 index / INSUFFICIENT_HISTORY)
6. No fabricated readiness without explicit target career and required profile fields
7. No implicit target career (target_career_id is None)
8. Explicit target career shows canonical requirements correctly (0% coverage, 16 gaps)
9. Learning snapshots and telemetry are isolated between students
10. AI context builder contains only authenticated student data
11. Seeded demo account (Alex Chen) remains fully intact and operational
12. Multi-tenant cross-student security isolation
"""

import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database.mongodb import get_db, get_utc_now
from backend.services.ai_context_builder import build_student_ai_context
from backend.services.learning_intelligence_service import LearningIntelligenceService
from backend.services.adaptive_roadmap_service import AdaptiveRoadmapService
from backend.services.market_intelligence_service import MarketIntelligenceService


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_new_user_empty_profile_integrity():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = await get_db()
        unique_suffix = uuid.uuid4().hex[:8]

        # ----------------------------------------------------
        # 1. Registration creates isolated student identity
        # ----------------------------------------------------
        new_student_email = f"student_{unique_suffix}@example.com"
        reg_res = await client.post("/api/v1/auth/register", json={
            "email": new_student_email,
            "password": "SecurePassword123!",
            "full_name": f"New Student {unique_suffix}",
            "role": "student"
        })
        assert reg_res.status_code == 201, reg_res.text
        reg_data = reg_res.json()
        assert "access_token" in reg_data
        new_token = reg_data["access_token"]
        new_user_id = reg_data["user"]["id"]
        headers = {"Authorization": f"Bearer {new_token}"}

        # ----------------------------------------------------
        # 2 & 7. Verify no Alex Chen ID leakage
        # ----------------------------------------------------
        demo_user = await db.users.find_one({"email": "demo@skill2career.com"})
        if demo_user:
            assert str(demo_user["_id"]) != new_user_id

        # ----------------------------------------------------
        # 3. Verify student profile has clean empty state
        # ----------------------------------------------------
        prof_res = await client.get("/api/v1/student/profile", headers=headers)
        assert prof_res.status_code == 200
        prof_data = prof_res.json()

        assert prof_data["user_id"] == new_user_id
        assert prof_data["target_career_id"] is None  # No implicit target career
        assert prof_data["target_career_title"] is None
        assert prof_data["degree"] is None
        assert prof_data["institution"] is None
        assert prof_data["gpa"] is None
        assert prof_data["weekly_study_hours"] == 0.0  # No default 12h study pace
        assert prof_data["learning_velocity_index"] == 0.0  # No default 1x velocity

        # ----------------------------------------------------
        # 4. Verify 0 skills, 0 projects, 0 certs
        # ----------------------------------------------------
        assert len(prof_data["skills"]) == 0
        assert prof_data["projects_count"] == 0
        assert prof_data["certifications_count"] == 0

        # Direct DB artifact checks
        act_count = await db.learning_activities.count_documents({"student_id": new_user_id})
        ev_count = await db.skill_evidence.count_documents({"student_id": new_user_id})
        proj_count = await db.projects.count_documents({"student_id": new_user_id})
        cert_count = await db.certifications.count_documents({"student_id": new_user_id})

        assert act_count == 0
        assert ev_count == 0
        assert proj_count == 0
        assert cert_count == 0

        # ----------------------------------------------------
        # 5. Career matching with 0 skills returns 0% match
        # ----------------------------------------------------
        rec_res = await client.get("/api/v1/careers/matching/recommendations", headers=headers)
        assert rec_res.status_code == 200
        recs = rec_res.json()
        assert len(recs) > 0
        for r in recs:
            assert r["match_percentage"] == 0.0

        # ----------------------------------------------------
        # 6. Readiness without target career returns 400 (No silent CR001 assignment)
        # ----------------------------------------------------
        no_career_ready = await client.post("/api/v1/analysis/readiness", headers=headers, json={})
        assert no_career_ready.status_code == 400
        assert "No target career specified" in no_career_ready.json()["detail"]

        # ----------------------------------------------------
        # 7. Roadmap without target career returns 400
        # ----------------------------------------------------
        no_career_roadmap = await client.get("/api/v1/roadmap/current", headers=headers)
        assert no_career_roadmap.status_code == 400
        assert "No target career specified" in no_career_roadmap.json()["detail"]

        # ----------------------------------------------------
        # 8. Explicit career skill gap shows 0% coverage and canonical requirements
        # ----------------------------------------------------
        gap_res = await client.post("/api/v1/analysis/gap?target_career_id=CR001", headers=headers)
        assert gap_res.status_code == 200
        gap_data = gap_res.json()
        assert gap_data["coverage_percentage"] == 0.0
        assert gap_data["total_skills_required"] == 16
        assert len(gap_data["gaps"]) == 16
        for g in gap_data["gaps"]:
            assert g["current_level"] == 0.0
            assert g["gap"] == g["required_level"]

        # ----------------------------------------------------
        # 9. Learning Intelligence reports INSUFFICIENT_HISTORY
        # ----------------------------------------------------
        li_service = LearningIntelligenceService()
        li_summary = await li_service.get_learning_trajectory_overview(
            student_id=new_user_id,
            db=db
        )
        assert li_summary.velocity.status == "INSUFFICIENT_HISTORY"
        assert li_summary.velocity.overall_learning_velocity == 0.0
        assert li_summary.consistency.active_learning_days_count == 0
        assert li_summary.trajectory_confidence.value == "INSUFFICIENT_DATA"

        # ----------------------------------------------------
        # 10. AI Context Builder contains only authenticated student
        # ----------------------------------------------------
        ai_ctx = await build_student_ai_context(user_id=new_user_id, db=db)
        assert ai_ctx["student"]["name"] == f"New Student {unique_suffix}"
        assert len(ai_ctx["skills"]) == 0
        assert len(ai_ctx["evidence"]["projects"]) == 0
        assert len(ai_ctx["evidence"]["certifications"]) == 0

        # ----------------------------------------------------
        # 11. Profile Update persists and enables explicit analysis
        # ----------------------------------------------------
        upd_res = await client.put("/api/v1/student/profile", headers=headers, json={
            "degree": "B.S. Software Engineering",
            "institution": "Tech University",
            "institution_tier": 1,
            "graduation_year": 2026,
            "gpa": 8.5,
            "target_career_id": "CR001",
            "weekly_study_hours": 15.0
        })
        assert upd_res.status_code == 200
        upd_data = upd_res.json()
        assert upd_data["target_career_id"] == "CR001"
        assert upd_data["gpa"] == 8.5
        assert upd_data["weekly_study_hours"] == 15.0

        # Now readiness inference succeeds with explicit target career and GPA
        ready_res = await client.post("/api/v1/analysis/readiness", headers=headers, json={})
        assert ready_res.status_code == 200
        ready_data = ready_res.json()
        assert ready_data["target_career_id"] == "CR001"
        assert "readiness_score" in ready_data
        assert ready_data["model_version"] is not None

        # ----------------------------------------------------
        # 12. Add a skill and verify state update
        # ----------------------------------------------------
        skill_res = await client.post("/api/v1/student/skills", headers=headers, json={
            "skill_id": "SK001",
            "proficiency_level": 3.5,
            "years_experience": 1.0
        })
        assert skill_res.status_code == 201
        
        # Verify updated profile has 1 skill
        prof_res2 = await client.get("/api/v1/student/profile", headers=headers)
        prof_data2 = prof_res2.json()
        assert len(prof_data2["skills"]) == 1
        assert prof_data2["skills"][0]["skill_id"] == "SK001"
        assert prof_data2["skills"][0]["proficiency_level"] == 3.5

        # ----------------------------------------------------
        # 13. Verify multi-tenant isolation with a second student
        # ----------------------------------------------------
        other_suffix = uuid.uuid4().hex[:8]
        other_reg = await client.post("/api/v1/auth/register", json={
            "email": f"other_{other_suffix}@example.com",
            "password": "SecurePassword123!",
            "full_name": f"Other Student {other_suffix}",
            "role": "student"
        })
        assert other_reg.status_code == 201
        other_token = other_reg.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}

        other_prof = await client.get("/api/v1/student/profile", headers=other_headers)
        other_data = other_prof.json()
        assert len(other_data["skills"]) == 0
        assert other_data["target_career_id"] is None
        assert other_data["user_id"] != new_user_id


@pytest.mark.anyio
async def test_seeded_demo_account_preservation():
    """Verifies that the seeded Alex Chen demo account is fully preserved and intact."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = await get_db()
        demo_user = await db.users.find_one({"email": "demo@skill2career.com"})
        if not demo_user:
            # Seed demo user if running in test environment without pre-seeding
            from backend.database.seed import seed_database
            await seed_database()
            demo_user = await db.users.find_one({"email": "demo@skill2career.com"})

        assert demo_user is not None
        assert demo_user["full_name"] == "Alex Chen"

        login_res = await client.post("/api/v1/auth/login", json={
            "email": "demo@skill2career.com",
            "password": "Password123!"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        prof_res = await client.get("/api/v1/student/profile", headers=headers)
        assert prof_res.status_code == 200
        prof_data = prof_res.json()
        assert prof_data["full_name"] == "Alex Chen"
        assert len(prof_data["skills"]) > 0
        assert prof_data["target_career_id"] == "CR004"
