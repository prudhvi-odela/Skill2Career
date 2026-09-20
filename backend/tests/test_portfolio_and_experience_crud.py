import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from backend.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


async def _register_student(client: AsyncClient, prefix: str = "stud"):
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
async def test_project_update_and_delete_with_ownership():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token_a, _ = await _register_student(client, "alpha")
        token_b, _ = await _register_student(client, "beta")

        headers_a = {"Authorization": f"Bearer {token_a}"}
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 1. Student A creates a project
        create_res = await client.post(
            "/api/v1/student/projects",
            headers=headers_a,
            json={
                "title": "Distributed File System",
                "description": "Raft-based distributed file store",
                "tech_stack": "Go, gRPC, Docker",
                "repo_url": "https://github.com/alpha/dfs",
                "complexity_rating": 4.5
            }
        )
        assert create_res.status_code == 201
        project_id = create_res.json()["id"]

        # 2. Student B cannot edit Student A's project (404 isolation)
        unauth_edit = await client.put(
            f"/api/v1/student/projects/{project_id}",
            headers=headers_b,
            json={"title": "Hacked Title"}
        )
        assert unauth_edit.status_code == 404

        # 3. Student A successfully edits their project
        edit_res = await client.put(
            f"/api/v1/student/projects/{project_id}",
            headers=headers_a,
            json={"title": "Distributed Storage Engine v2", "complexity_rating": 4.8}
        )
        assert edit_res.status_code == 200
        assert edit_res.json()["title"] == "Distributed Storage Engine v2"
        assert edit_res.json()["complexity_rating"] == 4.8

        # 4. Student B cannot delete Student A's project
        unauth_del = await client.delete(
            f"/api/v1/student/projects/{project_id}",
            headers=headers_b
        )
        assert unauth_del.status_code == 404

        # 5. Student A deletes their project
        del_res = await client.delete(
            f"/api/v1/student/projects/{project_id}",
            headers=headers_a
        )
        assert del_res.status_code in (200, 204)


@pytest.mark.anyio
async def test_certification_update_and_delete_with_ownership():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token_a, _ = await _register_student(client, "alpha_cert")
        token_b, _ = await _register_student(client, "beta_cert")

        headers_a = {"Authorization": f"Bearer {token_a}"}
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 1. Student A creates a certification
        create_res = await client.post(
            "/api/v1/student/certifications",
            headers=headers_a,
            json={
                "name": "AWS Certified Solutions Architect",
                "issuer": "Amazon Web Services",
                "issue_date": "2025-06-15",
                "credential_url": "https://aws.amazon.com/verify/12345"
            }
        )
        assert create_res.status_code == 201
        cert_id = create_res.json()["id"]

        # 2. Student B cannot edit Student A's certification
        unauth_edit = await client.put(
            f"/api/v1/student/certifications/{cert_id}",
            headers=headers_b,
            json={"name": "Hacked Cert"}
        )
        assert unauth_edit.status_code == 404

        # 3. Student A edits certification
        edit_res = await client.put(
            f"/api/v1/student/certifications/{cert_id}",
            headers=headers_a,
            json={"name": "AWS Certified Solutions Architect - Professional"}
        )
        assert edit_res.status_code == 200
        assert edit_res.json()["name"] == "AWS Certified Solutions Architect - Professional"

        # 4. Student A deletes certification
        del_res = await client.delete(
            f"/api/v1/student/certifications/{cert_id}",
            headers=headers_a
        )
        assert del_res.status_code in (200, 204)


@pytest.mark.anyio
async def test_work_experience_full_crud_and_isolation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token_a, _ = await _register_student(client, "alpha_exp")
        token_b, _ = await _register_student(client, "beta_exp")

        headers_a = {"Authorization": f"Bearer {token_a}"}
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 1. Empty state
        list_res = await client.get("/api/v1/student/work-experiences", headers=headers_a)
        assert list_res.status_code == 200
        assert list_res.json() == []

        # 2. Create work experience
        create_res = await client.post(
            "/api/v1/student/work-experiences",
            headers=headers_a,
            json={
                "company_name": "CloudScale Systems",
                "role": "Backend Engineering Intern",
                "employment_type": "INTERNSHIP",
                "start_date": "2025-05-01",
                "end_date": "2025-08-31",
                "is_current": False,
                "description": "Architected low-latency microservices with FastAPI and PostgreSQL",
                "responsibilities": ["Reduced query latency by 35%", "Implemented async Redis caching layer"],
                "skills_used": ["Python", "FastAPI", "PostgreSQL", "Docker"]
            }
        )
        assert create_res.status_code == 201
        exp_data = create_res.json()
        exp_id = exp_data["id"]
        assert exp_data["company_name"] == "CloudScale Systems"
        assert exp_data["employment_type"] == "INTERNSHIP"
        assert len(exp_data["skills_used"]) == 4

        # 3. Read single experience
        get_one = await client.get(f"/api/v1/student/work-experiences/{exp_id}", headers=headers_a)
        assert get_one.status_code == 200
        assert get_one.json()["role"] == "Backend Engineering Intern"

        # 4. Cross-tenant isolation: Student B cannot see or edit Student A's experience
        b_get = await client.get(f"/api/v1/student/work-experiences/{exp_id}", headers=headers_b)
        assert b_get.status_code == 404

        b_list = await client.get("/api/v1/student/work-experiences", headers=headers_b)
        assert b_list.status_code == 200
        assert len(b_list.json()) == 0

        # 5. Update experience
        update_res = await client.put(
            f"/api/v1/student/work-experiences/{exp_id}",
            headers=headers_a,
            json={
                "role": "Lead Backend Engineering Intern",
                "is_current": True,
                "end_date": None
            }
        )
        assert update_res.status_code == 200
        assert update_res.json()["role"] == "Lead Backend Engineering Intern"
        assert update_res.json()["is_current"] is True

        # 6. Delete experience
        del_res = await client.delete(f"/api/v1/student/work-experiences/{exp_id}", headers=headers_a)
        assert del_res.status_code in (200, 204)

        # Verify deletion
        list_after_del = await client.get("/api/v1/student/work-experiences", headers=headers_a)
        assert len(list_after_del.json()) == 0


@pytest.mark.anyio
async def test_student_profile_granularity_updates():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await _register_student(client, "profile_stud")
        headers = {"Authorization": f"Bearer {token}"}

        # Update profile with major, academic year, and interests
        update_res = await client.put(
            "/api/v1/student/profile",
            headers=headers,
            json={
                "major_or_branch": "Computer Science and Engineering",
                "academic_year": "Year 3",
                "interests": ["Artificial Intelligence", "Distributed Systems", "Cloud Computing"],
                "degree": "B.Tech Honours"
            }
        )
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["major_or_branch"] == "Computer Science and Engineering"
        assert updated["academic_year"] == "Year 3"
        assert len(updated["interests"]) == 3
        assert updated["degree"] == "B.Tech Honours"

        # Verify retrieval from GET /student/profile
        get_res = await client.get("/api/v1/student/profile", headers=headers)
        assert get_res.status_code == 200
        prof = get_res.json()
        assert prof["major_or_branch"] == "Computer Science and Engineering"
        assert prof["academic_year"] == "Year 3"
        assert "Distributed Systems" in prof["interests"]
