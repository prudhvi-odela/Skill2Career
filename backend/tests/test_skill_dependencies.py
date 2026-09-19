"""
Skill2Career - Phase 08: Skill Dependency Engine Tests
Validates DAG acyclicity, cycle detection, self-loop rejection,
prerequisite evaluation, and downstream dependency counts.
"""

import pytest
from backend.services.dependency_service import SkillDependencyService
from backend.database.mongodb import get_db
from backend.database.seed import seed_database


@pytest.mark.anyio
async def test_seeded_dependency_dag_integrity():
    db = await get_db()
    await seed_database()
    service = SkillDependencyService()
    
    validation = await service.validate_dag_integrity(db)
    assert validation["status"] == "valid"
    assert validation["is_acyclic"] is True
    assert validation["total_dependencies"] >= 20
    assert validation["total_nodes"] >= 15


@pytest.mark.anyio
async def test_cycle_detection_in_dag():
    service = SkillDependencyService()
    
    # Mock a database with a circular dependency (A -> B -> C -> A)
    class MockDbCycle:
        class skill_dependencies:
            @staticmethod
            def find(query):
                class MockCursor:
                    async def to_list(self, length=200):
                        return [
                            {"skill_id": "SK_B", "prerequisite_skill_id": "SK_A"},
                            {"skill_id": "SK_C", "prerequisite_skill_id": "SK_B"},
                            {"skill_id": "SK_A", "prerequisite_skill_id": "SK_C"},
                        ]
                return MockCursor()

    mock_db = MockDbCycle()
    with pytest.raises(ValueError, match="Circular dependency cycle detected"):
        await service.validate_dag_integrity(mock_db)


@pytest.mark.anyio
async def test_self_dependency_detection():
    service = SkillDependencyService()
    
    class MockDbSelfLoop:
        class skill_dependencies:
            @staticmethod
            def find(query):
                class MockCursor:
                    async def to_list(self, length=200):
                        return [
                            {"skill_id": "SK_PYTHON", "prerequisite_skill_id": "SK_PYTHON"}
                        ]
                return MockCursor()

    mock_db = MockDbSelfLoop()
    with pytest.raises(ValueError, match="Self-dependency detected"):
        await service.validate_dag_integrity(mock_db)


@pytest.mark.anyio
async def test_prerequisite_evaluation_logic():
    db = await get_db()
    await seed_database()
    service = SkillDependencyService()

    # Pandas (SK015) has Python (SK001) as prerequisite
    # 1. Student without Python (level 1.0 < threshold 2.5)
    student_skills_unmet = {"SK001": 1.0}
    eval_unmet = await service.evaluate_prerequisites("SK015", student_skills_unmet, db, prerequisite_threshold=2.5)
    assert eval_unmet["has_prerequisites"] is True
    assert eval_unmet["all_prerequisites_met"] is False
    assert eval_unmet["prerequisites_completion_pct"] < 100.0

    # 2. Student with proficient Python (level 4.0 >= threshold 2.5)
    student_skills_met = {"SK001": 4.0}
    eval_met = await service.evaluate_prerequisites("SK015", student_skills_met, db, prerequisite_threshold=2.5)
    assert eval_met["has_prerequisites"] is True
    assert eval_met["all_prerequisites_met"] is True
    assert eval_met["prerequisites_completion_pct"] == 100.0


@pytest.mark.anyio
async def test_downstream_dependents_query():
    db = await get_db()
    await seed_database()
    service = SkillDependencyService()

    # Python (SK001) has multiple downstream dependents (Pandas SK015, Scikit-Learn SK017, Django SK026, PyTorch SK028)
    downstream = await service.get_downstream_dependents("SK001", db)
    assert len(downstream) >= 3
    dependent_skill_ids = [d["skill_id"] for d in downstream]
    assert "SK015" in dependent_skill_ids or "SK017" in dependent_skill_ids
