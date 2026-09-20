import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from backend.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


async def _register_user(client: AsyncClient, prefix: str = "stud", role: str = "student"):
    suffix = uuid.uuid4().hex[:8]
    res = await client.post("/api/v1/auth/register", json={
        "email": f"{prefix}_{suffix}@example.com",
        "password": "SecurePassword123!",
        "full_name": f"{prefix.capitalize()} {suffix}",
        "role": role
    })
    assert res.status_code == 201, res.text
    data = res.json()
    return data["access_token"], data["user"]["id"]


@pytest.mark.anyio
async def test_assessment_authoring_and_quiz_execution():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token_author, _ = await _register_user(client, "author", "admin")
        token_student, _ = await _register_user(client, "quiz_taker", "student")

        headers_author = {"Authorization": f"Bearer {token_author}"}
        headers_student = {"Authorization": f"Bearer {token_student}"}

        # 1. Author an assessment
        create_res = await client.post(
            "/api/v1/assessments",
            headers=headers_author,
            json={
                "skill_id": "SK034",
                "title": f"Docker Containerization Fundamentals {uuid.uuid4().hex[:4]}",
                "category": "DevOps",
                "difficulty": "INTERMEDIATE",
                "time_limit_mins": 15,
                "pass_score": 70,
                "questions": [
                    {
                        "question_text": "What is the primary difference between a Docker image and a Docker container?",
                        "options": [
                            "An image is a running instance of a container",
                            "A container is a runnable, isolated instance of an image",
                            "Images can only run on Linux, containers run anywhere",
                            "They are identical terms"
                        ],
                        "correct_option": 1,
                        "explanation": "A container is a live running instance with a writable layer instantiated from an immutable image.",
                        "order_idx": 0
                    },
                    {
                        "question_text": "Which Dockerfile instruction specifies the default executable?",
                        "options": ["RUN", "ENTRYPOINT", "ENV", "EXPOSE"],
                        "correct_option": 1,
                        "explanation": "ENTRYPOINT specifies the command that is always executed when the container starts.",
                        "order_idx": 1
                    }
                ]
            }
        )
        assert create_res.status_code == 201
        asm_data = create_res.json()
        asm_id = asm_data["id"]

        # 2. Student retrieves the assessment quiz questions (without answers exposed)
        quiz_res = await client.get(f"/api/v1/assessments/{asm_id}", headers=headers_student)
        assert quiz_res.status_code == 200
        quiz = quiz_res.json()
        assert len(quiz["questions"]) == 2
        # Ensure correct answers are NOT leaked in quiz endpoint
        assert "correct_option" not in quiz["questions"][0]

        # 3. Student submits correct answers
        q0_id = quiz["questions"][0]["id"]
        q1_id = quiz["questions"][1]["id"]
        submit_res = await client.post(
            "/api/v1/assessments/submit",
            headers=headers_student,
            json={
                "assessment_id": asm_id,
                "answers": {
                    q0_id: 1,
                    q1_id: 1
                }
            }
        )
        assert submit_res.status_code == 200
        res_data = submit_res.json()
        assert res_data["passed"] is True
        assert res_data["score_pct"] == 100.0


@pytest.mark.anyio
async def test_peer_review_evidence_flow_and_self_review_prevention():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token_a, _ = await _register_user(client, "peer_a", "student")
        token_b, _ = await _register_user(client, "peer_b", "student")

        headers_a = {"Authorization": f"Bearer {token_a}"}
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 1. Student A creates a project
        proj_res = await client.post(
            "/api/v1/student/projects",
            headers=headers_a,
            json={
                "title": "High-Throughput Message Broker",
                "description": "Custom pub-sub engine with zero-copy ring buffers",
                "tech_stack": "Rust, Tokio, Async",
                "complexity_rating": 4.5
            }
        )
        assert proj_res.status_code == 201
        project_id = proj_res.json()["id"]

        # 2. Student A requests peer review
        req_res = await client.post(
            "/api/v1/evidence/peer-reviews/request",
            headers=headers_a,
            json={
                "project_id": project_id,
                "skill_ids": ["SK001", "SK040"],
                "notes": "Please review concurrency design and unit tests"
            }
        )
        assert req_res.status_code == 201
        review_req = req_res.json()
        review_id = review_req["id"]
        assert review_req["status"] == "PENDING"

        # 3. Self-review prevention: Student A cannot review their own project
        self_review_res = await client.post(
            f"/api/v1/evidence/peer-reviews/{review_id}/submit",
            headers=headers_a,
            json={
                "score": 5.0,
                "comment": "I reviewed myself and I am great",
                "verification_status": "APPROVED"
            }
        )
        assert self_review_res.status_code == 400

        # 4. Student B views pending reviews
        pending_res = await client.get("/api/v1/evidence/peer-reviews/pending", headers=headers_b)
        assert pending_res.status_code == 200
        pending_list = pending_res.json()
        assert len(pending_list) >= 1
        assert any(r["id"] == review_id for r in pending_list)

        # 5. Student B submits evaluation and approves the peer review
        submit_res = await client.post(
            f"/api/v1/evidence/peer-reviews/{review_id}/submit",
            headers=headers_b,
            json={
                "score": 4.5,
                "comment": "Excellent ring buffer implementation with clear unit tests.",
                "verification_status": "APPROVED"
            }
        )
        assert submit_res.status_code == 200
        assert submit_res.json()["status"] == "APPROVED"

        # 6. Verify skill evidence was created in the evidence engine
        evidence_res = await client.get("/api/v1/evidence", headers=headers_a)
        assert evidence_res.status_code == 200
        items = evidence_res.json()
        peer_evidence = [e for e in items if e.get("evidence_type") == "PEER_REVIEW"]
        assert len(peer_evidence) >= 1
        assert peer_evidence[0]["verification_status"] == "APPROVED"
