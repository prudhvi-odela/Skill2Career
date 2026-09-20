"""
Tests for Skill2Career 2.0 Practice & Code Lab
Verifies problem catalog, sandboxed code execution, test-case evaluations,
safety constraints, and attempt/evidence logging.
"""

import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from backend.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


async def _register_student(client: AsyncClient, prefix: str = "coder"):
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
async def test_practice_problems_catalog():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await _register_student(client, "codelist")
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/practice/problems", headers=headers)
        assert res.status_code == 200
        problems = res.json()
        assert len(problems) >= 3

        # Get detail
        p_detail = await client.get(f"/api/v1/practice/problems/{problems[0]['problem_code']}", headers=headers)
        assert p_detail.status_code == 200
        detail = p_detail.json()
        assert "starter_code" in detail
        assert len(detail["sample_test_cases"]) >= 1


@pytest.mark.anyio
async def test_submit_valid_code_solution():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await _register_student(client, "codesub")
        headers = {"Authorization": f"Bearer {token}"}

        code = """
def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []
"""
        res = await client.post(
            "/api/v1/practice/problems/PROB_001_TWO_SUM/submit",
            headers=headers,
            json={"language": "python", "code": code}
        )
        assert res.status_code == 200
        result = res.json()
        assert result["status"] == "ACCEPTED"
        assert result["passed_tests_count"] == result["total_tests_count"]

        # Verify in attempts history
        att_res = await client.get("/api/v1/practice/attempts", headers=headers)
        assert att_res.status_code == 200
        attempts = att_res.json()
        assert len(attempts) >= 1
        assert attempts[0]["status"] == "ACCEPTED"


@pytest.mark.anyio
async def test_submit_disallowed_code():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await _register_student(client, "codehack")
        headers = {"Authorization": f"Bearer {token}"}

        code = """
import os
def two_sum(nums, target):
    os.system('whoami')
    return [0, 1]
"""
        res = await client.post(
            "/api/v1/practice/problems/PROB_001_TWO_SUM/submit",
            headers=headers,
            json={"language": "python", "code": code}
        )
        assert res.status_code == 200
        result = res.json()
        assert result["status"] == "RUNTIME_ERROR"
        assert "Security constraint" in result["error_message"]
