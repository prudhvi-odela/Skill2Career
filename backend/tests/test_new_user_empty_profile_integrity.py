"""
Production Integrity Test Suite: Brand-New User / Empty Profile
Comprehensive 24-Test Integrity Audit:
 1. test_01_new_student_identity_isolation
 2. test_02_new_student_has_no_demo_skills
 3. test_03_new_student_has_no_demo_projects
 4. test_04_new_student_has_no_demo_certifications
 5. test_05_new_student_has_no_demo_evidence
 6. test_06_new_student_has_no_demo_activities
 7. test_07_no_alex_chen_id_or_data_leakage
 8. test_08_no_default_12_hour_study_pace
 9. test_09_no_default_1x_velocity
10. test_10_no_fabricated_readiness_without_target_career
11. test_11_no_implicit_career_assignment
12. test_12_explicit_career_shows_canonical_requirements
13. test_13_zero_skill_coverage_with_no_skills
14. test_14_zero_projects_and_certifications_integrity
15. test_15_insufficient_learning_history_reporting
16. test_16_deterministic_empty_state_behavior
17. test_17_two_student_isolation
18. test_18_ai_context_isolated_to_authenticated_student
19. test_19_production_api_base_configuration
20. test_20_no_localhost_in_production_environment_config
21. test_21_alex_chen_demo_preservation
22. test_22_existing_security_integrity
23. test_23_ml_artifacts_integrity
24. test_24_profile_update_and_explicit_readiness_pipeline
"""

import os
import uuid
import joblib
import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database.mongodb import get_db
from backend.services.ai_context_builder import build_student_ai_context
from backend.services.learning_intelligence_service import LearningIntelligenceService


@pytest.fixture
def anyio_backend():
    return "asyncio"


# ----------------------------------------------------------------------
# Helper fixture to create a fresh student for isolated tests
# ----------------------------------------------------------------------
async def _register_new_student(client: AsyncClient):
    suffix = uuid.uuid4().hex[:8]
    email = f"student_{suffix}@example.com"
    full_name = f"New Student {suffix}"
    res = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePassword123!",
        "full_name": full_name,
        "role": "student"
    })
    assert res.status_code == 201, res.text
    data = res.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    return user_id, email, full_name, headers


@pytest.mark.anyio
async def test_01_new_student_identity_isolation():
    """Verify registration creates a distinct student identity with unique user_id and token."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        user_id, email, full_name, headers = await _register_new_student(client)
        assert user_id is not None
        assert len(user_id) > 0
        me_res = await client.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["id"] == user_id
        assert me_data["email"] == email
        assert me_data["full_name"] == full_name


@pytest.mark.anyio
async def test_02_new_student_has_no_demo_skills():
    """Verify a newly registered student has exactly 0 skills."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        _, _, _, headers = await _register_new_student(client)
        prof_res = await client.get("/api/v1/student/profile", headers=headers)
        assert prof_res.status_code == 200
        prof = prof_res.json()
        assert prof["skills"] == []
        assert len(prof["skills"]) == 0

        skills_res = await client.get("/api/v1/student/skills", headers=headers)
        assert skills_res.status_code == 200
        assert skills_res.json() == []


@pytest.mark.anyio
async def test_03_new_student_has_no_demo_projects():
    """Verify a newly registered student has 0 projects in profile and database."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = await get_db()
        user_id, _, _, headers = await _register_new_student(client)
        prof_res = await client.get("/api/v1/student/profile", headers=headers)
        assert prof_res.status_code == 200
        assert prof_res.json()["projects_count"] == 0

        db_count = await db.projects.count_documents({"student_id": user_id})
        assert db_count == 0


@pytest.mark.anyio
async def test_04_new_student_has_no_demo_certifications():
    """Verify a newly registered student has 0 certifications in profile and database."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = await get_db()
        user_id, _, _, headers = await _register_new_student(client)
        prof_res = await client.get("/api/v1/student/profile", headers=headers)
        assert prof_res.status_code == 200
        assert prof_res.json()["certifications_count"] == 0

        db_count = await db.certifications.count_documents({"student_id": user_id})
        assert db_count == 0


@pytest.mark.anyio
async def test_05_new_student_has_no_demo_evidence():
    """Verify a newly registered student has 0 skill evidence entries in the database."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = await get_db()
        user_id, _, _, headers = await _register_new_student(client)
        ev_count = await db.skill_evidence.count_documents({"student_id": user_id})
        assert ev_count == 0


@pytest.mark.anyio
async def test_06_new_student_has_no_demo_activities():
    """Verify a newly registered student has 0 learning activities in the database."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = await get_db()
        user_id, _, _, headers = await _register_new_student(client)
        act_count = await db.learning_activities.count_documents({"student_id": user_id})
        assert act_count == 0


@pytest.mark.anyio
async def test_07_no_alex_chen_id_or_data_leakage():
    """Verify new user ID does not match Alex Chen demo user and demo profile is not cloned."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = await get_db()
        user_id, _, _, headers = await _register_new_student(client)
        demo_user = await db.users.find_one({"email": "demo@skill2career.com"})
        if demo_user:
            assert str(demo_user["_id"]) != user_id
            assert demo_user["email"] != "student_"

        prof_res = await client.get("/api/v1/student/profile", headers=headers)
        prof = prof_res.json()
        assert prof.get("full_name") != "Alex Chen"


@pytest.mark.anyio
async def test_08_no_default_12_hour_study_pace():
    """Verify registration initializes weekly_study_hours to 0.0 (no hardcoded 12h pace)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        _, _, _, headers = await _register_new_student(client)
        prof_res = await client.get("/api/v1/student/profile", headers=headers)
        assert prof_res.status_code == 200
        assert prof_res.json()["weekly_study_hours"] == 0.0


@pytest.mark.anyio
async def test_09_no_default_1x_velocity():
    """Verify registration initializes learning_velocity_index to 0.0 (no hardcoded 1.0x velocity)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        _, _, _, headers = await _register_new_student(client)
        prof_res = await client.get("/api/v1/student/profile", headers=headers)
        assert prof_res.status_code == 200
        assert prof_res.json()["learning_velocity_index"] == 0.0


@pytest.mark.anyio
async def test_10_no_fabricated_readiness_without_target_career():
    """Verify readiness analysis without an explicit target career returns 400 (no silent fallback)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        _, _, _, headers = await _register_new_student(client)
        ready_res = await client.post("/api/v1/analysis/readiness", headers=headers, json={})
        assert ready_res.status_code == 400
        assert "No target career specified" in ready_res.json()["detail"]


@pytest.mark.anyio
async def test_11_no_implicit_career_assignment():
    """Verify new student profile has target_career_id=None and target_career_title=None."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        _, _, _, headers = await _register_new_student(client)
        prof_res = await client.get("/api/v1/student/profile", headers=headers)
        assert prof_res.status_code == 200
        prof = prof_res.json()
        assert prof["target_career_id"] is None
        assert prof["target_career_title"] is None


@pytest.mark.anyio
async def test_12_explicit_career_shows_canonical_requirements():
    """Verify explicit target career CR001 shows canonical requirements (16 skills required, all gaps)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        _, _, _, headers = await _register_new_student(client)
        gap_res = await client.post("/api/v1/analysis/gap?target_career_id=CR001", headers=headers)
        assert gap_res.status_code == 200
        gap_data = gap_res.json()
        assert gap_data["career_id"] == "CR001"
        assert gap_data["total_skills_required"] == 16
        assert len(gap_data["gaps"]) == 16
        for g in gap_data["gaps"]:
            assert g["current_level"] == 0.0
            assert g["gap"] == g["required_level"]


@pytest.mark.anyio
async def test_13_zero_skill_coverage_with_no_skills():
    """Verify skill gap analysis reports exactly 0.0% coverage when student has no skills."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        _, _, _, headers = await _register_new_student(client)
        gap_res = await client.post("/api/v1/analysis/gap?target_career_id=CR001", headers=headers)
        assert gap_res.status_code == 200
        assert gap_res.json()["coverage_percentage"] == 0.0


@pytest.mark.anyio
async def test_14_zero_projects_and_certifications_integrity():
    """Verify endpoints for projects and certifications return empty lists for new student."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        _, _, _, headers = await _register_new_student(client)
        proj_res = await client.get("/api/v1/student/projects", headers=headers)
        assert proj_res.status_code == 200
        assert proj_res.json() == []

        cert_res = await client.get("/api/v1/student/certifications", headers=headers)
        assert cert_res.status_code == 200
        assert cert_res.json() == []


@pytest.mark.anyio
async def test_15_insufficient_learning_history_reporting():
    """Verify LearningIntelligenceService reports INSUFFICIENT_HISTORY and 0 active days."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = await get_db()
        user_id, _, _, _ = await _register_new_student(client)
        li_service = LearningIntelligenceService()
        li_summary = await li_service.get_learning_trajectory_overview(
            student_id=user_id,
            db=db
        )
        assert li_summary.velocity.status == "INSUFFICIENT_HISTORY"
        assert li_summary.velocity.overall_learning_velocity == 0.0
        assert li_summary.consistency.active_learning_days_count == 0
        assert li_summary.trajectory_confidence.value == "INSUFFICIENT_DATA"


@pytest.mark.anyio
async def test_16_deterministic_empty_state_behavior():
    """Verify repeated career recommendations return deterministic 0.0% match without errors."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        _, _, _, headers = await _register_new_student(client)
        for _ in range(3):
            rec_res = await client.get("/api/v1/careers/matching/recommendations", headers=headers)
            assert rec_res.status_code == 200
            recs = rec_res.json()
            assert len(recs) > 0
            for r in recs:
                assert r["match_percentage"] == 0.0


@pytest.mark.anyio
async def test_17_two_student_isolation():
    """Verify two distinct students cannot access or leak each other's data."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        u1_id, _, _, h1 = await _register_new_student(client)
        u2_id, _, _, h2 = await _register_new_student(client)

        assert u1_id != u2_id

        # Student 1 adds a skill
        add_res = await client.post("/api/v1/student/skills", headers=h1, json={
            "skill_id": "SK001",
            "proficiency_level": 4.0,
            "years_experience": 2.0
        })
        assert add_res.status_code == 201

        # Student 2 still has 0 skills
        s2_skills = await client.get("/api/v1/student/skills", headers=h2)
        assert s2_skills.status_code == 200
        assert s2_skills.json() == []

        # Student 1 has 1 skill
        s1_skills = await client.get("/api/v1/student/skills", headers=h1)
        assert s1_skills.status_code == 200
        assert len(s1_skills.json()) == 1


@pytest.mark.anyio
async def test_18_ai_context_isolated_to_authenticated_student():
    """Verify AI context builder extracts only authenticated student data and empty evidence."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = await get_db()
        user_id, _, full_name, _ = await _register_new_student(client)
        ai_ctx = await build_student_ai_context(user_id=user_id, db=db)

        assert ai_ctx["student"]["name"] == full_name
        assert len(ai_ctx["skills"]) == 0
        assert len(ai_ctx["evidence"]["projects"]) == 0
        assert len(ai_ctx["evidence"]["certifications"]) == 0


@pytest.mark.anyio
def test_19_production_api_base_configuration():
    """Verify frontend production configuration targets Render backend API."""
    env_example_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", ".env.example")
    assert os.path.exists(env_example_path)
    with open(env_example_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "https://skill2career-backend.onrender.com/api/v1" in content


@pytest.mark.anyio
def test_20_no_localhost_in_production_environment_config():
    """Verify frontend .env.example defines Render backend as authoritative production URL."""
    env_example_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", ".env.example")
    with open(env_example_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip() and not line.strip().startswith("#")]
    for line in lines:
        if line.startswith("VITE_API_BASE_URL="):
            assert "onrender.com" in line
            assert "localhost" not in line


@pytest.mark.anyio
async def test_21_alex_chen_demo_preservation():
    """Verify seeded Alex Chen demo account remains fully intact and operational."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = await get_db()
        demo_user = await db.users.find_one({"email": "demo@skill2career.com"})
        if not demo_user:
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


@pytest.mark.anyio
async def test_22_existing_security_integrity():
    """Verify unauthenticated requests to student endpoints are rejected with 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/student/profile")
        assert res.status_code in (401, 403)


def test_23_ml_artifacts_integrity():
    """Verify ML artifact files exist and load successfully without modification."""
    artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "ml", "artifacts")
    readiness_path = os.path.join(artifacts_dir, "readiness_pipeline.joblib")
    trajectory_path = os.path.join(artifacts_dir, "trajectory_pipeline.joblib")

    assert os.path.exists(readiness_path), f"Missing {readiness_path}"
    assert os.path.exists(trajectory_path), f"Missing {trajectory_path}"

    readiness_model = joblib.load(readiness_path)
    trajectory_model = joblib.load(trajectory_path)
    assert readiness_model is not None
    assert trajectory_model is not None


@pytest.mark.anyio
async def test_24_profile_update_and_explicit_readiness_pipeline():
    """Verify student profile update persists and unlocks explicit readiness ML prediction."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        _, _, _, headers = await _register_new_student(client)

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

        ready_res = await client.post("/api/v1/analysis/readiness", headers=headers, json={})
        assert ready_res.status_code == 200
        ready_data = ready_res.json()
        assert ready_data["target_career_id"] == "CR001"
        assert "readiness_score" in ready_data
        assert ready_data["model_version"] is not None
