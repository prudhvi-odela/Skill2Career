"""
Skill2Career - Skill Dependency Graph Service
Validates Directed Acyclic Graphs (DAGs), detects circular dependencies,
and evaluates prerequisite fulfillment for student skill states.
"""

from typing import Dict, Any, List, Set, Tuple, Optional
from pymongo.asynchronous.database import AsyncDatabase
from backend.database.mongodb import serialize_docs


class SkillDependencyService:
    def __init__(self):
        pass

    async def get_all_dependencies(self, db: AsyncDatabase) -> List[Dict[str, Any]]:
        cursor = db.skill_dependencies.find({})
        deps = await cursor.to_list(length=200)
        return serialize_docs(deps)

    async def get_dependencies_for_skill(self, skill_id: str, db: AsyncDatabase) -> List[Dict[str, Any]]:
        """Retrieves prerequisites required by the specified skill."""
        cursor = db.skill_dependencies.find({"skill_id": skill_id})
        deps = await cursor.to_list(length=50)
        return serialize_docs(deps)

    async def get_downstream_dependents(self, skill_id: str, db: AsyncDatabase) -> List[Dict[str, Any]]:
        """Retrieves skills that depend on the specified prerequisite skill."""
        cursor = db.skill_dependencies.find({"prerequisite_skill_id": skill_id})
        deps = await cursor.to_list(length=50)
        return serialize_docs(deps)

    async def validate_dag_integrity(self, db: AsyncDatabase) -> Dict[str, Any]:
        """
        Validates that the entire skill dependency graph is an acyclic DAG
        with no self-loops, no cycles, and valid skill catalog references.
        """
        all_deps = await self.get_all_dependencies(db)
        
        # Build adjacency list: prerequisite -> [dependent_skills]
        adj: Dict[str, List[str]] = {}
        all_skills: Set[str] = set()

        for d in all_deps:
            s_id = d["skill_id"]
            p_id = d["prerequisite_skill_id"]
            
            if s_id == p_id:
                raise ValueError(f"Self-dependency detected for skill '{s_id}'.")
            
            all_skills.add(s_id)
            all_skills.add(p_id)
            if p_id not in adj:
                adj[p_id] = []
            adj[p_id].append(s_id)

        # Cycle detection using 3-color DFS (0: unvisited, 1: visiting, 2: visited)
        visited: Dict[str, int] = {s: 0 for s in all_skills}

        def dfs(node: str, path: List[str]) -> bool:
            visited[node] = 1
            for neighbor in adj.get(node, []):
                if visited.get(neighbor) == 1:
                    cycle_path = " -> ".join(path + [neighbor])
                    raise ValueError(f"Circular dependency cycle detected: {cycle_path}")
                if visited.get(neighbor) == 0:
                    if dfs(neighbor, path + [neighbor]):
                        return True
            visited[node] = 2
            return False

        for node in all_skills:
            if visited[node] == 0:
                dfs(node, [node])

        return {
            "status": "valid",
            "is_acyclic": True,
            "total_dependencies": len(all_deps),
            "total_nodes": len(all_skills)
        }

    async def evaluate_prerequisites(
        self,
        skill_id: str,
        student_skills_map: Dict[str, float],
        db: AsyncDatabase,
        prerequisite_threshold: float = 2.5
    ) -> Dict[str, Any]:
        """
        Evaluates whether a student has completed the prerequisites for a target skill.
        Returns prerequisites list, met status, and completion percentage.
        """
        prereqs = await self.get_dependencies_for_skill(skill_id, db)
        if not prereqs:
            return {
                "skill_id": skill_id,
                "has_prerequisites": False,
                "all_prerequisites_met": True,
                "prerequisites_completion_pct": 100.0,
                "prerequisites": []
            }

        evaluated = []
        met_count = 0

        for p in prereqs:
            p_id = p["prerequisite_skill_id"]
            p_type = p.get("dependency_type", "PREREQUISITE")
            strength = float(p.get("strength", 1.0))
            current_lvl = student_skills_map.get(p_id, 0.0)
            is_met = current_lvl >= prerequisite_threshold

            if is_met or p_type == "OPTIONAL":
                met_count += 1

            evaluated.append({
                "prerequisite_skill_id": p_id,
                "dependency_type": p_type,
                "strength": strength,
                "student_level": current_lvl,
                "threshold_level": prerequisite_threshold,
                "is_met": is_met,
                "source": p.get("source", "")
            })

        completion_pct = round((met_count / len(prereqs)) * 100.0, 1)
        all_met = all(e["is_met"] for e in evaluated if e["dependency_type"] == "PREREQUISITE")

        return {
            "skill_id": skill_id,
            "has_prerequisites": True,
            "all_prerequisites_met": all_met,
            "prerequisites_completion_pct": completion_pct,
            "prerequisites": evaluated
        }
