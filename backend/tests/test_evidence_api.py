"""
Skill2Career - Phase 09A Evidence API Tests
Validates all authenticated evidence endpoints: listing, creation, verification,
aggregation summary, skill history, and artifact synchronization.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database.mongodb import get_db


@pytest.mark.anyio
async def test_evidence_api_crud_flow():
    """Verify full evidence API lifecycle with authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login as demo user
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "demo@skill2career.com", "password": "Password123!"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Sync artifacts into evidence
        sync_res = await ac.post("/api/v1/evidence/sync-artifacts", headers=headers)
        assert sync_res.status_code == 200
        assert "synced_count" in sync_res.json()

        # 3. Get evidence summary
        sum_res = await ac.get("/api/v1/evidence/summary", headers=headers)
        assert sum_res.status_code == 200
        summary_data = sum_res.json()
        assert "total_evidence_count" in summary_data
        assert "skills_summary" in summary_data
        assert summary_data["total_evidence_count"] >= 1

        # 4. List evidence with filter
        list_res = await ac.get("/api/v1/evidence", headers=headers)
        assert list_res.status_code == 200
        ev_items = list_res.json()
        assert len(ev_items) >= 1

        ev_id = ev_items[0]["evidence_id"]
        sk_id = ev_items[0]["skill_id"]

        # 5. Get skill evidence history
        hist_res = await ac.get(f"/api/v1/evidence/skills/{sk_id}/history", headers=headers)
        assert hist_res.status_code == 200
        hist_data = hist_res.json()
        assert hist_data["skill_id"] == sk_id
        assert len(hist_data["timeline"]) >= 1

        # 6. Verify evidence endpoint
        v_res = await ac.post(
            f"/api/v1/evidence/{ev_id}/verify",
            headers=headers,
            json={
                "verification_status": "MANUALLY_VERIFIED",
                "validator_type": "INSTRUCTOR",
                "notes": "Verified by instructor"
            }
        )
        assert v_res.status_code == 200
        assert v_res.json()["verification_status"] == "MANUALLY_VERIFIED"

        # 7. Apply evidence to skill state
        apply_res = await ac.post(f"/api/v1/evidence/skills/{sk_id}/apply-state", headers=headers)
        assert apply_res.status_code == 200
        assert "status" in apply_res.json()
