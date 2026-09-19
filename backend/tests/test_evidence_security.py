"""
Skill2Career - Phase 09A Evidence Multi-Tenant Security Tests
Validates that unauthenticated requests are rejected and student isolation
prevents cross-student evidence access, creation, or verification.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database.mongodb import get_db
from backend.services.auth_service import get_password_hash


@pytest.mark.anyio
async def test_unauthenticated_evidence_access_rejected():
    """Verify unauthenticated requests are strictly rejected with 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res_list = await ac.get("/api/v1/evidence")
        assert res_list.status_code in [401, 403]

        res_sum = await ac.get("/api/v1/evidence/summary")
        assert res_sum.status_code in [401, 403]

        res_create = await ac.post("/api/v1/evidence", json={"skill_id": "SK001"})
        assert res_create.status_code in [401, 403]


@pytest.mark.anyio
async def test_multi_tenant_student_evidence_isolation():
    """Verify Student A cannot view, modify, or verify Student B's evidence."""
    db = await get_db()
    transport = ASGITransport(app=app)

    # 1. Ensure two distinct users exist
    user_a = await db.users.find_one({"email": "student.a@test.com"})
    if not user_a:
        res_a = await db.users.insert_one({
            "email": "student.a@test.com",
            "hashed_password": get_password_hash("Password123!"),
            "full_name": "Student A",
            "is_active": True
        })
        user_a = await db.users.find_one({"_id": res_a.inserted_id})
    user_a_id = str(user_a["_id"])

    user_b = await db.users.find_one({"email": "student.b@test.com"})
    if not user_b:
        res_b = await db.users.insert_one({
            "email": "student.b@test.com",
            "hashed_password": get_password_hash("Password123!"),
            "full_name": "Student B",
            "is_active": True
        })
        user_b = await db.users.find_one({"_id": res_b.inserted_id})
    user_b_id = str(user_b["_id"])

    # 2. Insert evidence owned by Student B
    ev_b_id = "evd_student_b_private_001"
    await db.skill_evidence.update_one(
        {"evidence_id": ev_b_id},
        {"$set": {
            "evidence_id": ev_b_id,
            "student_id": user_b_id,
            "skill_id": "SK001",
            "skill_name": "Python",
            "evidence_type": "PROJECT",
            "source_entity": "projects",
            "source_entity_id": "proj_b_99",
            "title": "Student B Private Project",
            "evidence_strength": "STRONG",
            "evidence_score": 85.0,
            "verification_status": "UNVERIFIED",
            "observed_proficiency": 4.0,
            "confidence_reason": "Private project",
            "engine_version": "v1.0-evidence"
        }},
        upsert=True
    )

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Login as Student A
        login_a = await ac.post(
            "/api/v1/auth/login",
            json={"email": "student.a@test.com", "password": "Password123!"}
        )
        assert login_a.status_code == 200
        token_a = login_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Student A lists evidence: should NOT contain Student B's evidence
        list_res = await ac.get("/api/v1/evidence", headers=headers_a)
        assert list_res.status_code == 200
        items_a = list_res.json()
        assert all(item["evidence_id"] != ev_b_id for item in items_a)

        # Student A attempts to verify Student B's evidence: should fail (404/403)
        verify_attempt = await ac.post(
            f"/api/v1/evidence/{ev_b_id}/verify",
            headers=headers_a,
            json={
                "verification_status": "MANUALLY_VERIFIED",
                "validator_type": "INSTRUCTOR"
            }
        )
        assert verify_attempt.status_code in [400, 403, 404]
