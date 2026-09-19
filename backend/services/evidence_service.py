"""
Skill2Career - Learning Evidence Service
Evaluates, validates, and records deterministic evidence of student skill development
connecting projects, certifications, assessment results, and learning activities.
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
import uuid
from bson import ObjectId
from pymongo.asynchronous.database import AsyncDatabase

from backend.schemas.evidence_schemas import (
    EvidenceCreateRequest,
    EvidenceVerifyRequest,
    EvidenceType,
    VerificationStatus,
    EvidenceStrength
)
from backend.database.mongodb import get_utc_now, serialize_doc, serialize_docs


class EvidenceService:
    @staticmethod
    def evaluate_evidence_strength(
        evidence_type: str,
        verification_status: str,
        observed_proficiency: float,
        source_metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, float, str]:
        """
        Determines deterministic evidence strength level, numerical score (0-100),
        and transparent confidence rationale based on documented heuristics.
        """
        meta = source_metadata or {}
        
        if verification_status == VerificationStatus.REJECTED.value:
            return (
                EvidenceStrength.WEAK.value,
                10.0,
                "Evidence was reviewed and rejected as insufficient proof of competency."
            )

        if evidence_type == EvidenceType.ASSESSMENT.value:
            score_pct = float(meta.get("score_percentage", 80.0))
            passed = bool(meta.get("passed", True))
            if passed and score_pct >= 85.0:
                return (
                    EvidenceStrength.VERY_STRONG.value,
                    95.0,
                    f"Direct high-scoring assessment performance ({score_pct:.1f}% score)."
                )
            elif passed:
                return (
                    EvidenceStrength.STRONG.value,
                    80.0,
                    f"Verified assessment competency checkpoint ({score_pct:.1f}% pass)."
                )
            else:
                return (
                    EvidenceStrength.MODERATE.value,
                    50.0,
                    f"Assessment attempt completed ({score_pct:.1f}% score) demonstrating domain practice."
                )

        elif evidence_type == EvidenceType.PROJECT.value:
            complexity = float(meta.get("complexity_rating", 3.0))
            has_repo = bool(meta.get("has_repo", meta.get("repository_url", False)))
            has_demo = bool(meta.get("has_live_demo", meta.get("live_url", False)))
            is_verified = verification_status in [VerificationStatus.SYSTEM_VERIFIED.value, VerificationStatus.MANUALLY_VERIFIED.value]

            if complexity >= 4.0 and (has_repo or has_demo) and is_verified:
                return (
                    EvidenceStrength.VERY_STRONG.value,
                    92.0,
                    f"High-complexity project (Rating {complexity:.1f}/5.0) with verified repository demonstration."
                )
            elif complexity >= 3.0 and (has_repo or has_demo):
                return (
                    EvidenceStrength.STRONG.value,
                    78.0,
                    f"Practical project implementation (Rating {complexity:.1f}/5.0) with verifiable code artifacts."
                )
            else:
                return (
                    EvidenceStrength.MODERATE.value,
                    60.0,
                    f"Demonstrated applied project work (Rating {complexity:.1f}/5.0)."
                )

        elif evidence_type == EvidenceType.CERTIFICATION.value:
            has_url = bool(meta.get("credential_url"))
            is_verified = bool(meta.get("is_verified", True))
            if is_verified and has_url:
                return (
                    EvidenceStrength.STRONG.value,
                    82.0,
                    f"Verified industry certification from {meta.get('issuer', 'accredited authority')}."
                )
            else:
                return (
                    EvidenceStrength.MODERATE.value,
                    58.0,
                    f"Supporting certification credential documentation ({meta.get('issuer', 'Self-Reported')})."
                )

        elif evidence_type == EvidenceType.LEARNING_ACTIVITY.value:
            hours = float(meta.get("hours_spent", 2.0))
            act_type = str(meta.get("activity_type", "practice"))
            if act_type == "project" or hours >= 5.0:
                return (
                    EvidenceStrength.MODERATE.value,
                    62.0,
                    f"Substantial active learning commitment ({hours:.1f} hours spent on {act_type})."
                )
            else:
                return (
                    EvidenceStrength.WEAK.value,
                    35.0,
                    f"Foundational learning practice session ({hours:.1f} hours spent)."
                )

        elif evidence_type == EvidenceType.MANUAL_VERIFICATION.value:
            validator = str(meta.get("validator_type", "INSTRUCTOR"))
            if validator in ["INSTRUCTOR", "FACULTY_EVALUATOR"]:
                return (
                    EvidenceStrength.VERY_STRONG.value,
                    95.0,
                    "Direct assessment and endorsement by accredited instructor/evaluator."
                )
            else:
                return (
                    EvidenceStrength.STRONG.value,
                    80.0,
                    f"Manual verification confirmed via {validator}."
                )

        return (
            EvidenceStrength.WEAK.value,
            40.0,
            "Documented student activity with baseline confidence."
        )

    async def create_evidence(
        self,
        student_id: str,
        request: EvidenceCreateRequest,
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """Creates a validated evidence record referencing a canonical skill and existing artifact."""
        # 1. Validate Canonical Skill
        skill_doc = await db.skills.find_one({
            "$or": [{"skill_code": request.skill_id}, {"_id": request.skill_id}]
        })
        if not skill_doc:
            raise ValueError(f"Skill '{request.skill_id}' not found in canonical skills taxonomy.")
        
        skill_code = skill_doc.get("skill_code", request.skill_id)
        skill_name = skill_doc.get("name", skill_code)

        # 2. Validate Source Entity Belongs to Student (if applicable)
        source_entity = request.source_entity.lower().strip()
        source_entity_id = request.source_entity_id.strip()

        # Check existing source collections
        if source_entity in ["projects", "project"]:
            source_col = db.projects
        elif source_entity in ["certifications", "certification"]:
            source_col = db.certifications
        elif source_entity in ["student_assessments", "assessments", "assessment_results"]:
            source_col = db.student_assessments
        elif source_entity in ["learning_activities", "activity"]:
            source_col = db.learning_activities
        else:
            source_col = None

        # Authoritative properties derived directly from database record (prevents client spoofing)
        effective_metadata = dict(request.source_metadata or {})
        effective_prof = float(request.observed_proficiency)

        if source_col is not None:
            # Check ID and student ownership
            try:
                obj_id = ObjectId(source_entity_id) if ObjectId.is_valid(source_entity_id) else source_entity_id
                source_doc = await source_col.find_one({
                    "$and": [
                        {"$or": [{"_id": obj_id}, {"_id": source_entity_id}, {"id": source_entity_id}]},
                        {"$or": [
                            {"student_id": student_id},
                            {"user_id": student_id},
                            {"student_id": ObjectId(student_id) if ObjectId.is_valid(student_id) else student_id},
                            {"user_id": ObjectId(student_id) if ObjectId.is_valid(student_id) else student_id}
                        ]}
                    ]
                })
            except Exception:
                source_doc = await source_col.find_one({
                    "$and": [
                        {"$or": [{"_id": source_entity_id}, {"id": source_entity_id}]},
                        {"$or": [{"student_id": student_id}, {"user_id": student_id}]}
                    ]
                })

            if not source_doc:
                raise ValueError(
                    f"Source artifact '{source_entity_id}' not found in '{source_entity}' for authenticated student."
                )

            # Derive authoritative metadata from canonical source document
            if source_entity in ["student_assessments", "assessments", "assessment_results"]:
                db_score = float(source_doc.get("score_percentage", source_doc.get("score", 0.0)))
                db_passed = bool(source_doc.get("passed", db_score >= 70.0))
                effective_metadata["score_percentage"] = db_score
                effective_metadata["passed"] = db_passed
                
                # Derive proficiency directly from authoritative score
                if db_passed:
                    if db_score >= 90.0:
                        effective_prof = 4.8
                    elif db_score >= 80.0:
                        effective_prof = 4.0
                    else:
                        effective_prof = 3.5
                    v_status = VerificationStatus.ASSESSMENT_VERIFIED.value
                else:
                    effective_prof = min(2.0, max(1.0, round(db_score / 40.0, 1)))
                    v_status = VerificationStatus.UNVERIFIED.value

            elif source_entity in ["projects", "project"]:
                db_complexity = float(source_doc.get("complexity_rating", source_doc.get("complexity", 3.0)))
                db_repo = source_doc.get("repository_url") or source_doc.get("github_url") or ""
                db_demo = source_doc.get("live_url") or source_doc.get("demo_url") or ""
                effective_metadata["complexity_rating"] = db_complexity
                effective_metadata["has_repo"] = bool(db_repo)
                effective_metadata["has_live_demo"] = bool(db_demo)
                if db_repo:
                    effective_metadata["repository_url"] = db_repo

                # Bounded by project complexity
                max_proj_prof = min(5.0, max(1.5, db_complexity))
                effective_prof = min(float(request.observed_proficiency), max_proj_prof)
                v_status = VerificationStatus.SYSTEM_VERIFIED.value

            elif source_entity in ["certifications", "certification"]:
                db_issuer = source_doc.get("issuer", "Self-Reported")
                db_verified = bool(source_doc.get("is_verified", source_doc.get("verified", True)))
                db_url = source_doc.get("credential_url") or source_doc.get("certificate_url") or ""
                effective_metadata["issuer"] = db_issuer
                effective_metadata["is_verified"] = db_verified
                if db_url:
                    effective_metadata["credential_url"] = db_url

                # Certifications are supporting evidence (cap at 4.0 without assessment)
                effective_prof = min(4.0, float(request.observed_proficiency))
                v_status = VerificationStatus.SYSTEM_VERIFIED.value if (db_verified and db_url) else VerificationStatus.UNVERIFIED.value

            elif source_entity in ["learning_activities", "activity"]:
                db_hours = float(source_doc.get("hours_spent", source_doc.get("duration_hours", 2.0)))
                db_type = str(source_doc.get("activity_type", "practice"))
                effective_metadata["hours_spent"] = db_hours
                effective_metadata["activity_type"] = db_type
                
                # Learning activities represent practice/exposure; capped at 3.0 and unverified by default
                effective_prof = min(3.0, float(request.observed_proficiency))
                v_status = VerificationStatus.UNVERIFIED.value
            else:
                effective_prof = min(5.0, max(1.0, float(request.observed_proficiency)))
                v_status = VerificationStatus.UNVERIFIED.value
        else:
            # Free-standing manual verification or peer review
            if request.evidence_type == EvidenceType.MANUAL_VERIFICATION:
                v_status = VerificationStatus.MANUALLY_VERIFIED.value
            else:
                v_status = VerificationStatus.UNVERIFIED.value
            effective_prof = min(5.0, max(1.0, float(request.observed_proficiency)))

        # 3. Check for Duplicate Evidence
        existing = await db.skill_evidence.find_one({
            "student_id": student_id,
            "skill_id": skill_code,
            "source_entity": source_entity,
            "source_entity_id": source_entity_id
        })
        if existing:
            return serialize_doc(existing)

        # 4. Evaluate Strength with authoritative data
        strength, score, reason = self.evaluate_evidence_strength(
            evidence_type=request.evidence_type.value,
            verification_status=v_status,
            observed_proficiency=effective_prof,
            source_metadata=effective_metadata
        )

        now = get_utc_now()
        now_str = now.isoformat()
        evidence_id = f"evd_{uuid.uuid4().hex[:12]}"

        evidence_doc = {
            "evidence_id": evidence_id,
            "student_id": student_id,
            "skill_id": skill_code,
            "skill_name": skill_name,
            "evidence_type": request.evidence_type.value,
            "source_entity": source_entity,
            "source_entity_id": source_entity_id,
            "title": request.title,
            "description": request.description or f"Demonstrated evidence for {skill_name}",
            "evidence_strength": strength,
            "evidence_score": score,
            "verification_status": v_status,
            "observed_proficiency": float(effective_prof),
            "created_at": now_str,
            "observed_at": now_str,
            "validated_at": now_str if v_status != VerificationStatus.UNVERIFIED.value else None,
            "validator_type": "AUTOMATED_RULE" if v_status != VerificationStatus.UNVERIFIED.value else None,
            "source_metadata": effective_metadata,
            "confidence_reason": reason,
            "engine_version": "v1.0-evidence"
        }

        await db.skill_evidence.insert_one(evidence_doc)
        return serialize_doc(evidence_doc)

    async def verify_evidence(
        self,
        evidence_id: str,
        student_id: str,
        request: EvidenceVerifyRequest,
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """Validates or updates verification status of eligible evidence."""
        evidence_doc = await db.skill_evidence.find_one({
            "evidence_id": evidence_id,
            "student_id": student_id
        })
        if not evidence_doc:
            raise ValueError(f"Evidence record '{evidence_id}' not found for authenticated student.")

        # Re-evaluate strength with new verification status
        strength, score, reason = self.evaluate_evidence_strength(
            evidence_type=evidence_doc["evidence_type"],
            verification_status=request.verification_status.value,
            observed_proficiency=evidence_doc["observed_proficiency"],
            source_metadata=evidence_doc.get("source_metadata", {})
        )

        now_str = get_utc_now().isoformat()
        update_fields = {
            "verification_status": request.verification_status.value,
            "validator_type": request.validator_type,
            "validated_at": now_str,
            "evidence_strength": strength,
            "evidence_score": score,
            "confidence_reason": reason
        }
        if request.notes:
            update_fields["verification_notes"] = request.notes

        await db.skill_evidence.update_one(
            {"evidence_id": evidence_id, "student_id": student_id},
            {"$set": update_fields}
        )

        updated_doc = await db.skill_evidence.find_one({"evidence_id": evidence_id})
        return serialize_doc(updated_doc)

    async def get_student_evidence(
        self,
        student_id: str,
        db: AsyncDatabase,
        skill_id: Optional[str] = None,
        evidence_type: Optional[str] = None,
        verification_status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves filtered list of student evidence."""
        query: Dict[str, Any] = {"student_id": student_id}
        if skill_id:
            query["skill_id"] = skill_id
        if evidence_type:
            query["evidence_type"] = evidence_type
        if verification_status:
            query["verification_status"] = verification_status

        cursor = db.skill_evidence.find(query).sort("created_at", -1)
        evidence_list = await cursor.to_list(length=200)
        return serialize_docs(evidence_list)

    async def sync_student_artifacts_to_evidence(
        self,
        student_id: str,
        db: AsyncDatabase
    ) -> int:
        """
        Idempotently synchronizes existing projects, certifications, assessments,
        and learning activities into auditable skill evidence records.
        """
        created_count = 0

        # 1. Projects
        projects_cursor = db.projects.find({"student_id": student_id})
        projects = await projects_cursor.to_list(length=50)
        for p in projects:
            p_id = str(p.get("_id") or p.get("id"))
            p_title = p.get("title", "Project Artifact")
            tech_stack = p.get("technologies", "")
            complexity = float(p.get("complexity_rating", 3.0))

            # Match technologies to canonical skills
            for tech in [t.strip() for t in tech_stack.split(",") if t.strip()]:
                skill = await db.skills.find_one({
                    "$or": [{"name": {"$regex": f"^{tech}$", "$options": "i"}}, {"aliases": tech}]
                })
                if skill:
                    sk_code = skill["skill_code"]
                    sk_name = skill["name"]
                    existing = await db.skill_evidence.find_one({
                        "student_id": student_id,
                        "skill_id": sk_code,
                        "source_entity": "projects",
                        "source_entity_id": p_id
                    })
                    if not existing:
                        meta = {
                            "complexity_rating": complexity,
                            "repository_url": p.get("repository_url"),
                            "live_url": p.get("live_url"),
                            "has_repo": bool(p.get("repository_url")),
                            "has_live_demo": bool(p.get("live_url"))
                        }
                        strength, score, reason = self.evaluate_evidence_strength(
                            evidence_type=EvidenceType.PROJECT.value,
                            verification_status=VerificationStatus.SYSTEM_VERIFIED.value,
                            observed_proficiency=min(5.0, max(2.0, complexity)),
                            source_metadata=meta
                        )
                        now_str = get_utc_now().isoformat()
                        await db.skill_evidence.insert_one({
                            "evidence_id": f"evd_{uuid.uuid4().hex[:12]}",
                            "student_id": student_id,
                            "skill_id": sk_code,
                            "skill_name": sk_name,
                            "evidence_type": EvidenceType.PROJECT.value,
                            "source_entity": "projects",
                            "source_entity_id": p_id,
                            "title": f"Project: {p_title}",
                            "description": f"Applied implementation in project '{p_title}'.",
                            "evidence_strength": strength,
                            "evidence_score": score,
                            "verification_status": VerificationStatus.SYSTEM_VERIFIED.value,
                            "observed_proficiency": min(5.0, max(2.0, complexity)),
                            "created_at": now_str,
                            "observed_at": p.get("created_at", now_str),
                            "validated_at": now_str,
                            "validator_type": "AUTOMATED_RULE",
                            "source_metadata": meta,
                            "confidence_reason": reason,
                            "engine_version": "v1.0-evidence"
                        })
                        created_count += 1

        # 2. Certifications
        certs_cursor = db.certifications.find({"student_id": student_id})
        certs = await certs_cursor.to_list(length=50)
        for c in certs:
            c_id = str(c.get("_id") or c.get("id"))
            c_name = c.get("name", "Certification")
            issuer = c.get("issuer", "Authority")

            # Match certification name to skill
            skill = await db.skills.find_one({
                "$or": [{"name": {"$regex": c_name.split()[0], "$options": "i"}}]
            })
            if skill:
                sk_code = skill["skill_code"]
                sk_name = skill["name"]
                existing = await db.skill_evidence.find_one({
                    "student_id": student_id,
                    "skill_id": sk_code,
                    "source_entity": "certifications",
                    "source_entity_id": c_id
                })
                if not existing:
                    meta = {
                        "issuer": issuer,
                        "credential_url": c.get("credential_url"),
                        "is_verified": bool(c.get("is_verified", True))
                    }
                    strength, score, reason = self.evaluate_evidence_strength(
                        evidence_type=EvidenceType.CERTIFICATION.value,
                        verification_status=VerificationStatus.SYSTEM_VERIFIED.value,
                        observed_proficiency=3.5,
                        source_metadata=meta
                    )
                    now_str = get_utc_now().isoformat()
                    await db.skill_evidence.insert_one({
                        "evidence_id": f"evd_{uuid.uuid4().hex[:12]}",
                        "student_id": student_id,
                        "skill_id": sk_code,
                        "skill_name": sk_name,
                        "evidence_type": EvidenceType.CERTIFICATION.value,
                        "source_entity": "certifications",
                        "source_entity_id": c_id,
                        "title": f"Certification: {c_name}",
                        "description": f"Verified credential issued by {issuer}.",
                        "evidence_strength": strength,
                        "evidence_score": score,
                        "verification_status": VerificationStatus.SYSTEM_VERIFIED.value,
                        "observed_proficiency": 3.5,
                        "created_at": now_str,
                        "observed_at": c.get("created_at", now_str),
                        "validated_at": now_str,
                        "validator_type": "AUTOMATED_RULE",
                        "source_metadata": meta,
                        "confidence_reason": reason,
                        "engine_version": "v1.0-evidence"
                    })
                    created_count += 1

        # 3. Assessments
        assessments_cursor = db.student_assessments.find({"student_id": student_id})
        assessments = await assessments_cursor.to_list(length=50)
        for a in assessments:
            a_id = str(a.get("_id") or a.get("id"))
            sk_id = a.get("skill_id")
            score_pct = float(a.get("score_percentage", 80.0))
            passed = bool(a.get("passed", True))

            if sk_id:
                skill = await db.skills.find_one({
                    "$or": [{"skill_code": sk_id}, {"_id": sk_id}]
                })
                sk_name = skill.get("name", sk_id) if skill else sk_id
                existing = await db.skill_evidence.find_one({
                    "student_id": student_id,
                    "skill_id": sk_id,
                    "source_entity": "student_assessments",
                    "source_entity_id": a_id
                })
                if not existing:
                    meta = {"score_percentage": score_pct, "passed": passed}
                    prof_level = min(5.0, max(2.0, (score_pct / 100.0) * 5.0))
                    strength, score, reason = self.evaluate_evidence_strength(
                        evidence_type=EvidenceType.ASSESSMENT.value,
                        verification_status=VerificationStatus.ASSESSMENT_VERIFIED.value if passed else VerificationStatus.UNVERIFIED.value,
                        observed_proficiency=prof_level,
                        source_metadata=meta
                    )
                    now_str = get_utc_now().isoformat()
                    await db.skill_evidence.insert_one({
                        "evidence_id": f"evd_{uuid.uuid4().hex[:12]}",
                        "student_id": student_id,
                        "skill_id": sk_id,
                        "skill_name": sk_name,
                        "evidence_type": EvidenceType.ASSESSMENT.value,
                        "source_entity": "student_assessments",
                        "source_entity_id": a_id,
                        "title": f"Assessment Checkpoint: {sk_name}",
                        "description": f"Scored {score_pct:.1f}% on technical assessment.",
                        "evidence_strength": strength,
                        "evidence_score": score,
                        "verification_status": VerificationStatus.ASSESSMENT_VERIFIED.value if passed else VerificationStatus.UNVERIFIED.value,
                        "observed_proficiency": prof_level,
                        "created_at": now_str,
                        "observed_at": a.get("completed_at", now_str),
                        "validated_at": now_str if passed else None,
                        "validator_type": "ASSESSMENT_ENGINE" if passed else None,
                        "source_metadata": meta,
                        "confidence_reason": reason,
                        "engine_version": "v1.0-evidence"
                    })
                    created_count += 1

        # 4. Learning Activities
        activities_cursor = db.learning_activities.find({"student_id": student_id})
        activities = await activities_cursor.to_list(length=50)
        for act in activities:
            act_id = str(act.get("_id") or act.get("id"))
            act_skills = act.get("skills", [])
            act_title = act.get("title", "Practice Exercise")
            hours = float(act.get("hours_spent", 2.0))

            for sk_id in act_skills:
                skill = await db.skills.find_one({
                    "$or": [{"skill_code": sk_id}, {"_id": sk_id}]
                })
                if skill:
                    sk_code = skill["skill_code"]
                    sk_name = skill["name"]
                    existing = await db.skill_evidence.find_one({
                        "student_id": student_id,
                        "skill_id": sk_code,
                        "source_entity": "learning_activities",
                        "source_entity_id": act_id
                    })
                    if not existing:
                        meta = {
                            "activity_type": act.get("activity_type", "practice"),
                            "hours_spent": hours
                        }
                        strength, score, reason = self.evaluate_evidence_strength(
                            evidence_type=EvidenceType.LEARNING_ACTIVITY.value,
                            verification_status=VerificationStatus.UNVERIFIED.value,
                            observed_proficiency=2.5,
                            source_metadata=meta
                        )
                        now_str = get_utc_now().isoformat()
                        await db.skill_evidence.insert_one({
                            "evidence_id": f"evd_{uuid.uuid4().hex[:12]}",
                            "student_id": student_id,
                            "skill_id": sk_code,
                            "skill_name": sk_name,
                            "evidence_type": EvidenceType.LEARNING_ACTIVITY.value,
                            "source_entity": "learning_activities",
                            "source_entity_id": act_id,
                            "title": act_title,
                            "description": act.get("description", f"Completed {hours:.1f}h of practical exercise."),
                            "evidence_strength": strength,
                            "evidence_score": score,
                            "verification_status": VerificationStatus.UNVERIFIED.value,
                            "observed_proficiency": 2.5,
                            "created_at": now_str,
                            "observed_at": act.get("completed_at", now_str),
                            "validated_at": None,
                            "validator_type": None,
                            "source_metadata": meta,
                            "confidence_reason": reason,
                            "engine_version": "v1.0-evidence"
                        })
                        created_count += 1

        return created_count
