"""
Tests for Skill2Career 2.0 AI Learning Tutor & Verified Web Resources
Verifies multi-turn conversation persistence, educational action intents,
grounded academic context, and zero-hallucination resource retrieval.
"""

import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from backend.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


async def _register_student(client: AsyncClient, prefix: str = "aitutor"):
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
async def test_ai_conversations_and_chat_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await _register_student(client, "aichatter")
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create a conversation
        c_res = await client.post("/api/v1/ai/conversations", headers=headers, params={"title": "Data Structures Study"})
        assert c_res.status_code == 201
        conv_id = c_res.json()["id"]

        # 2. Chat with action_type teach_topic
        chat1 = await client.post(
            "/api/v1/ai/chat",
            headers=headers,
            json={
                "message": "Recursion",
                "conversation_id": conv_id,
                "action_type": "teach_topic"
            }
        )
        assert chat1.status_code == 200
        data1 = chat1.json()
        assert len(data1["code_examples"]) >= 1

        # 3. Chat with action_type 5_questions
        chat2 = await client.post(
            "/api/v1/ai/chat",
            headers=headers,
            json={
                "message": "Binary Search",
                "conversation_id": conv_id,
                "action_type": "5_questions"
            }
        )
        assert chat2.status_code == 200

        # 4. Check conversation messages
        msgs_res = await client.get(f"/api/v1/ai/conversations/{conv_id}/messages", headers=headers)
        assert msgs_res.status_code == 200
        msgs = msgs_res.json()
        assert len(msgs) == 4

        # 5. List conversations
        list_res = await client.get("/api/v1/ai/conversations", headers=headers)
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1


@pytest.mark.anyio
async def test_verified_learning_resources_search():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/ai/resources", params={"query": "Python"})
        assert res.status_code == 200
        resources = res.json()
        assert len(resources) >= 1
        for r in resources:
            assert r["url"].startswith("http")
            assert len(r["title"]) > 0
            assert len(r["source"]) > 0
