"""
Tests for Skill2Career 2.0 Curriculum Engine & Education Onboarding
Verifies programs, branches, subjects, diagnostic test evaluation, evidence recording,
student learning profiles, and personalized learning path construction.
"""

import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from backend.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


async def _register_student(client: AsyncClient, prefix: str = "curric"):
    suffix = uuid.uuid4().hex[:8]
    res = await client.post("/api/v1/auth/register", json={
        "email": f"{prefix}_{suffix}@example.com",
        "password": "SecurePassword123!",
        "full_name": f"{prefix.capitalize()} {suffix}",
        "role": "student"
    })
    assert res.status_code == 201, res.text
    data = res.json()
    return data["access_token"], data["user"]["id"]


@pytest.mark.anyio
async def test_get_academic_programs():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/curriculum/programs")
        assert res.status_code == 200
        programs = res.json()
        assert len(programs) >= 5
        codes = [p["program_code"] for p in programs]
        assert "BTECH" in codes
        assert "BCA" in codes


@pytest.mark.anyio
async def test_get_branches_and_subjects():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Get branches
        b_res = await client.get("/api/v1/curriculum/programs/BTECH/branches")
        assert b_res.status_code == 200
        branches = b_res.json()
        assert len(branches) >= 6
        codes = [b["branch_code"] for b in branches]
        assert "CSE" in codes

        # Get subjects for CSE
        s_res = await client.get("/api/v1/curriculum/branches/CSE/subjects")
        assert s_res.status_code == 200
        subjects = s_res.json()
        assert len(subjects) >= 4
        names = [s["name"] for s in subjects]
        assert any("Data Structures" in n for n in names)


@pytest.mark.anyio
async def test_onboarding_and_learning_profile_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await _register_student(client, "onboarder")
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Onboarding status before
        st_res = await client.get("/api/v1/curriculum/student/onboarding-status", headers=headers)
        assert st_res.status_code == 200
        assert not st_res.json()["is_onboarding_completed"]

        # 2. Complete onboarding
        comp_res = await client.post(
            "/api/v1/curriculum/onboarding/complete",
            headers=headers,
            json={
                "program_id": "BTECH",
                "branch_id": "CSE",
                "academic_year": 3,
                "interests": ["Machine Learning", "Distributed Systems"],
                "target_career_id": "CR001",
                "institution": "Apex University of Tech",
                "weekly_study_hours": 15.0
            }
        )
        assert comp_res.status_code == 200
        assert comp_res.json()["status"] == "success"

        # 3. Onboarding status after
        st_after = await client.get("/api/v1/curriculum/student/onboarding-status", headers=headers)
        assert st_after.status_code == 200
        assert st_after.json()["is_onboarding_completed"]
        assert st_after.json()["branch"] == "CSE"

        # 4. Record baseline rating
        rate_res = await client.post(
            "/api/v1/curriculum/subjects/CSE_DSA_201/baseline",
            headers=headers,
            json={"rating_type": "SELF_RATING", "proficiency_level": 4.0}
        )
        assert rate_res.status_code == 200

        # 5. Diagnostic quiz test
        quiz_res = await client.get("/api/v1/curriculum/subjects/CSE_DSA_201/diagnostic-quiz", headers=headers)
        assert quiz_res.status_code == 200
        quiz_data = quiz_res.json()
        assert len(quiz_data["questions"]) >= 3

        # Submit diagnostic
        answers = {q["id"]: 1 for q in quiz_data["questions"]}
        sub_diag = await client.post(
            "/api/v1/curriculum/subjects/CSE_DSA_201/submit-diagnostic",
            headers=headers,
            json={"answers": answers}
        )
        assert sub_diag.status_code == 200
        assert "score" in sub_diag.json()

        # 6. Get Learning Profile
        lp_res = await client.get("/api/v1/curriculum/student/learning-profile", headers=headers)
        assert lp_res.status_code == 200
        lp_data = lp_res.json()
        assert lp_data["branch"] == "CSE"
        assert lp_data["academic_year"] == 3

        # 7. Get Personalized Learning Path
        path_res = await client.get("/api/v1/curriculum/student/personalized-learning-path", headers=headers)
        assert path_res.status_code == 200
        path_data = path_res.json()
        assert path_data["total_milestones"] >= 3
