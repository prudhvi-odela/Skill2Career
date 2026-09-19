"""
Skill2Career - Phase 08: Adaptive Roadmap Service & Persistence Tests
Validates multi-phase sequencing, milestone progress updating, versioning,
recalculation triggers, and roadmap history retrieval with student isolation.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database.mongodb import get_db


@pytest.mark.anyio
async def test_adaptive_roadmap_current_and_phases():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@skill2career.com",
            "password": "Password123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get current roadmap
        roadmap_res = await ac.get("/api/v1/roadmap/current", headers=headers)
        assert roadmap_res.status_code == 200
        roadmap = roadmap_res.json()

        assert "id" in roadmap or "_id" in roadmap
        assert "phases" in roadmap
        assert len(roadmap["phases"]) >= 2
        assert "version" in roadmap
        assert roadmap["is_current"] is True

        phase_1 = roadmap["phases"][0]
        assert phase_1["phase_order"] == 1
        assert "focus_skills" in phase_1
        assert "milestones" in phase_1
        assert "status" in phase_1
        assert len(phase_1["milestones"]) > 0


@pytest.mark.anyio
async def test_roadmap_progress_update():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@skill2career.com",
            "password": "Password123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get current roadmap
        curr_res = await ac.get("/api/v1/roadmap/current", headers=headers)
        roadmap = curr_res.json()
        phase_1 = roadmap["phases"][0]
        first_milestone = phase_1["milestones"][0]
        milestone_id = first_milestone["id"]

        # 3. Update progress for this milestone
        progress_res = await ac.post("/api/v1/roadmap/progress", headers=headers, json={
            "milestone_id": milestone_id,
            "is_completed": True
        })
        assert progress_res.status_code == 200
        updated = progress_res.json()
        assert updated["overall_progress_pct"] > 0.0

        # Check that the item is completed
        upd_phase_1 = next(p for p in updated["phases"] if p["phase_id"] == phase_1["phase_id"])
        ms = next(m for m in upd_phase_1["milestones"] if m["id"] == milestone_id)
        assert ms["is_completed"] is True


@pytest.mark.anyio
async def test_roadmap_recalculation_and_versioning():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@skill2career.com",
            "password": "Password123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get initial version for CR001
        initial_res = await ac.get("/api/v1/roadmap/current?career_id=CR001", headers=headers)
        initial_version = initial_res.json()["version"]

        # 3. Trigger recalculation for CR001
        recalc_res = await ac.post("/api/v1/roadmap/recalculate?career_id=CR001", headers=headers)
        assert recalc_res.status_code == 200
        recalculated = recalc_res.json()
        assert recalculated["version"] >= initial_version + 1
        assert recalculated["is_current"] is True

        # 4. Check history retrieval
        history_res = await ac.get("/api/v1/roadmap/history?career_id=CR001", headers=headers)
        assert history_res.status_code == 200
        history = history_res.json()
        assert history["total_versions"] >= 2
        assert len(history["versions"]) >= 2
        # Ensure latest is first
        assert history["versions"][0]["version"] >= history["versions"][1]["version"]
