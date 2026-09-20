"""
Skill2Career Curriculum & Learning Path Service
Orchestrates branch-specific curriculum management, subject baselines, diagnostic quiz grading,
evidence-linked skill baseline updates, student learning profiles, and personalized learning paths.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_utc_now
from backend.services.evidence_service import EvidenceService
from backend.ml.inference import MLInferenceService


class CurriculumService:
    def __init__(self):
        self.evidence_service = EvidenceService()
        self.ml_service = MLInferenceService.get_instance()

    async def get_academic_programs(self, db: AsyncDatabase) -> List[Dict[str, Any]]:
        cursor = db.academic_programs.find({}).sort("program_code", 1)
        programs = await cursor.to_list(length=50)
        return [
            {
                "id": p.get("program_code", str(p.get("_id"))),
                "program_code": p["program_code"],
                "name": p["name"],
                "duration_years": int(p.get("duration_years", 4)),
                "description": p.get("description", "")
            }
            for p in programs
        ]

    async def get_branches_by_program(self, program_id: str, db: AsyncDatabase) -> List[Dict[str, Any]]:
        cursor = db.branches.find({"$or": [{"program_id": program_id.upper()}, {"program_id": program_id}]})
        branches = await cursor.to_list(length=50)
        return [
            {
                "id": b.get("branch_code", str(b.get("_id"))),
                "branch_code": b["branch_code"],
                "program_id": b.get("program_id", program_id),
                "name": b["name"],
                "category": b.get("category", "Engineering"),
                "description": b.get("description", "")
            }
            for b in branches
        ]

    async def get_subjects_by_branch(self, branch_id: str, db: AsyncDatabase) -> List[Dict[str, Any]]:
        clean_branch = branch_id.upper().strip()
        cursor = db.subjects.find({"branch_id": clean_branch}).sort([("academic_year", 1), ("semester", 1)])
        subjects = await cursor.to_list(length=100)
        return [
            {
                "id": s.get("subject_code", str(s.get("_id"))),
                "subject_code": s["subject_code"],
                "name": s["name"],
                "branch_id": s["branch_id"],
                "program_id": s.get("program_id", "BTECH"),
                "semester": int(s.get("semester", 1)),
                "academic_year": int(s.get("academic_year", 1)),
                "description": s.get("description", ""),
                "is_core": bool(s.get("is_core", True)),
                "canonical_skills": s.get("canonical_skills", []),
                "prerequisites": s.get("prerequisites", []),
                "learning_resources": s.get("learning_resources", []),
                "has_diagnostic_quiz": len(s.get("diagnostic_questions", [])) > 0
            }
            for s in subjects
        ]

    async def complete_onboarding(
        self,
        student_id: str,
        program_id: str,
        branch_id: str,
        academic_year: int,
        interests: List[str],
        target_career_id: Optional[str],
        institution: Optional[str],
        weekly_study_hours: Optional[float],
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """Saves first-time academic onboarding data into student_profile and marks onboarding completed."""
        now = get_utc_now()
        update_data: Dict[str, Any] = {
            "degree": program_id.upper(),
            "major_or_branch": branch_id.upper(),
            "academic_year": academic_year,
            "interests": interests,
            "is_onboarding_completed": True,
            "updated_at": now
        }
        if institution:
            update_data["institution"] = institution
        if weekly_study_hours is not None:
            update_data["statistics.weekly_study_hours"] = weekly_study_hours

        if target_career_id:
            career_doc = await db.career_roles.find_one({
                "$or": [{"career_code": target_career_id}, {"_id": target_career_id}]
            })
            if career_doc:
                update_data["target_career_id"] = career_doc.get("career_code", target_career_id)
                update_data["target_career_title"] = career_doc.get("title", "")

        await db.student_profiles.update_one(
            {"user_id": student_id},
            {"$set": update_data},
            upsert=True
        )

        return {
            "status": "success",
            "message": "Academic onboarding successfully completed.",
            "program": program_id,
            "branch": branch_id,
            "academic_year": academic_year
        }

    async def get_onboarding_status(self, student_id: str, db: AsyncDatabase) -> Dict[str, Any]:
        profile = await db.student_profiles.find_one({"user_id": student_id})
        if not profile:
            return {
                "is_onboarding_completed": False,
                "program": None,
                "branch": None,
                "academic_year": None,
                "target_career_id": None,
                "target_career_title": None,
                "total_subjects_count": 0,
                "baselined_subjects_count": 0
            }

        branch = profile.get("major_or_branch")
        total_subjects = 0
        if branch:
            total_subjects = await db.subjects.count_documents({"branch_id": branch.upper()})

        baselined_count = await db.subject_baselines.count_documents({"student_id": student_id})
        is_completed = bool(profile.get("is_onboarding_completed", False)) or bool(branch and profile.get("academic_year"))

        return {
            "is_onboarding_completed": is_completed,
            "program": profile.get("degree"),
            "branch": profile.get("major_or_branch"),
            "academic_year": profile.get("academic_year"),
            "target_career_id": profile.get("target_career_id"),
            "target_career_title": profile.get("target_career_title"),
            "total_subjects_count": total_subjects,
            "baselined_subjects_count": baselined_count
        }

    async def record_subject_baseline(
        self,
        student_id: str,
        subject_id: str,
        rating_type: str,
        proficiency_level: float,
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """Stores subject self-rating or skipped baseline truthfully."""
        now = get_utc_now()
        subject = await db.subjects.find_one({"$or": [{"subject_code": subject_id}, {"_id": subject_id}]})
        if not subject:
            raise ValueError("Subject not found")

        baseline_doc = {
            "student_id": student_id,
            "subject_id": subject["subject_code"],
            "subject_name": subject["name"],
            "rating_type": rating_type,
            "proficiency_level": proficiency_level,
            "assessment_score": None,
            "assessed_at": now
        }

        await db.subject_baselines.update_one(
            {"student_id": student_id, "subject_id": subject["subject_code"]},
            {"$set": baseline_doc},
            upsert=True
        )

        return {
            "status": "success",
            "subject_id": subject["subject_code"],
            "subject_name": subject["name"],
            "rating_type": rating_type,
            "proficiency_level": proficiency_level
        }

    async def get_subject_diagnostic_quiz(self, subject_id: str, db: AsyncDatabase) -> Dict[str, Any]:
        subject = await db.subjects.find_one({"$or": [{"subject_code": subject_id}, {"_id": subject_id}]})
        if not subject:
            raise ValueError("Subject not found")

        questions = subject.get("diagnostic_questions", [])
        clean_questions = [
            {
                "id": q.get("id", str(i)),
                "question_text": q["question_text"],
                "options": q.get("options", []),
                "skill_id": q.get("skill_id", subject.get("canonical_skills", [""])[0] if subject.get("canonical_skills") else "")
            }
            for i, q in enumerate(questions)
        ]

        return {
            "subject_id": subject["subject_code"],
            "subject_name": subject["name"],
            "total_questions": len(clean_questions),
            "time_limit_mins": 10,
            "questions": clean_questions
        }

    async def submit_diagnostic_quiz(
        self,
        student_id: str,
        subject_id: str,
        answers: Dict[str, int],
        db: AsyncDatabase
    ) -> Dict[str, Any]:
        """Evaluates student diagnostic test and records verified evidence."""
        now = get_utc_now()
        subject = await db.subjects.find_one({"$or": [{"subject_code": subject_id}, {"_id": subject_id}]})
        if not subject:
            raise ValueError("Subject not found")

        questions = subject.get("diagnostic_questions", [])
        if not questions:
            raise ValueError("Subject has no diagnostic questions configured.")

        correct_count = 0
        strong_topics = []
        practice_needed = []

        for q in questions:
            qid = q.get("id")
            chosen = answers.get(qid)
            is_correct = chosen is not None and chosen == q.get("correct_option_index")
            topic_label = q.get("skill_id") or subject["name"]

            if is_correct:
                correct_count += 1
                if topic_label not in strong_topics:
                    strong_topics.append(topic_label)
            else:
                if topic_label not in practice_needed:
                    practice_needed.append(topic_label)

        score_pct = (correct_count / len(questions)) * 100.0 if questions else 0.0
        passed = score_pct >= 60.0

        # Calculate evaluated proficiency level from 1.0 to 5.0
        if score_pct >= 90.0:
            level = 4.5
        elif score_pct >= 75.0:
            level = 3.5
        elif score_pct >= 60.0:
            level = 3.0
        elif score_pct >= 40.0:
            level = 2.0
        else:
            level = 1.0

        # Record into subject_baselines
        await db.subject_baselines.update_one(
            {"student_id": student_id, "subject_id": subject["subject_code"]},
            {"$set": {
                "student_id": student_id,
                "subject_id": subject["subject_code"],
                "subject_name": subject["name"],
                "rating_type": "ASSESSMENT",
                "proficiency_level": level,
                "assessment_score": score_pct,
                "assessed_at": now
            }},
            upsert=True
        )

        # Record authoritative skill evidence if canonical skills are associated
        evidence_created = False
        evidence_id = None
        for skill_id in subject.get("canonical_skills", []):
            try:
                ev_res = await self.evidence_service.create_evidence(
                    student_id=student_id,
                    skill_id=skill_id,
                    evidence_type="ASSESSMENT",
                    source_entity="SUBJECT_DIAGNOSTIC",
                    source_entity_id=subject["subject_code"],
                    title=f"Diagnostic Assessment: {subject['name']}",
                    description=f"Scored {score_pct:.1f}% ({correct_count}/{len(questions)}) on branch diagnostic test.",
                    observed_proficiency=level,
                    source_metadata={
                        "score_percentage": score_pct,
                        "subject_code": subject["subject_code"],
                        "total_questions": len(questions),
                        "passed": passed
                    },
                    db=db
                )
                evidence_created = True
                evidence_id = ev_res.get("evidence_id")
            except Exception as e:
                print(f"[Warn] Evidence creation for diagnostic: {e}")

        return {
            "subject_id": subject["subject_code"],
            "subject_name": subject["name"],
            "score": score_pct,
            "passed": passed,
            "total_questions": len(questions),
            "correct_count": correct_count,
            "strong_topics": strong_topics,
            "practice_needed": practice_needed,
            "evidence_created": evidence_created,
            "evidence_id": evidence_id,
            "proficiency_level": level
        }

    async def get_student_learning_profile(self, student_id: str, db: AsyncDatabase) -> Dict[str, Any]:
        """Synthesizes academic background, subject strengths/gaps, skill strengths/gaps, and evidence confidence."""
        profile = await db.student_profiles.find_one({"user_id": student_id})
        user_doc = await db.users.find_one({"$or": [{"_id": student_id}, {"id": student_id}]})
        if not user_doc:
            try:
                from bson import ObjectId
                if ObjectId.is_valid(student_id):
                    user_doc = await db.users.find_one({"_id": ObjectId(student_id)})
            except Exception:
                pass

        full_name = user_doc.get("full_name", "Student") if user_doc else "Student"
        branch = (profile.get("major_or_branch") if profile else None) or "CSE"
        program = (profile.get("degree") if profile else None) or "B.Tech"
        academic_year = int(profile.get("academic_year", 1) if profile else 1)
        target_career_id = profile.get("target_career_id") if profile else None
        target_career_title = profile.get("target_career_title") if profile else None

        # Fetch subject baselines
        baselines_cursor = db.subject_baselines.find({"student_id": student_id})
        baselines = await baselines_cursor.to_list(length=100)
        baselines_map = {b["subject_id"]: b for b in baselines}

        # Fetch branch subjects
        subjects_cursor = db.subjects.find({"branch_id": branch.upper()})
        branch_subjects = await subjects_cursor.to_list(length=100)

        subject_strengths = []
        subject_gaps = []

        for sub in branch_subjects:
            b_data = baselines_map.get(sub["subject_code"])
            if b_data:
                prof = float(b_data.get("proficiency_level", 1.0))
                item = {
                    "subject_code": sub["subject_code"],
                    "subject_name": sub["name"],
                    "proficiency_level": prof,
                    "rating_type": b_data.get("rating_type", "SELF_RATING"),
                    "assessment_score": b_data.get("assessment_score")
                }
                if prof >= 3.5:
                    subject_strengths.append(item)
                elif prof < 3.0:
                    subject_gaps.append(item)
            else:
                # Subject not yet evaluated -> gap
                subject_gaps.append({
                    "subject_code": sub["subject_code"],
                    "subject_name": sub["name"],
                    "proficiency_level": 0.0,
                    "rating_type": "UNASSESSED",
                    "assessment_score": None
                })

        # Fetch verified skills
        skills = profile.get("skills", []) if profile else []
        skill_strengths = []
        skill_gaps = []
        for s in skills:
            lvl = float(s.get("level", 1.0))
            s_item = {
                "skill_id": s.get("skill_id"),
                "skill_name": s.get("name", s.get("skill_id")),
                "level": lvl,
                "verified": bool(s.get("verified", False))
            }
            if lvl >= 3.0:
                skill_strengths.append(s_item)
            else:
                skill_gaps.append(s_item)

        # Count evidence
        ev_count = await db.skill_evidence.count_documents({"student_id": student_id})
        verified_ev_count = await db.skill_evidence.count_documents({
            "student_id": student_id,
            "verification_status": "VERIFIED"
        })

        if verified_ev_count >= 5:
            confidence = "HIGH"
        elif verified_ev_count >= 2:
            confidence = "MEDIUM"
        elif verified_ev_count >= 1:
            confidence = "LOW"
        else:
            confidence = "INSUFFICIENT"

        # Learning history summary
        activities_count = await db.learning_activities.count_documents({"student_id": student_id})
        practices_count = await db.practice_attempts.count_documents({"student_id": student_id})

        return {
            "student_id": student_id,
            "full_name": full_name,
            "program": program,
            "branch": branch,
            "academic_year": academic_year,
            "institution": profile.get("institution") if profile else None,
            "target_career_id": target_career_id,
            "target_career_title": target_career_title,
            "readiness_score": None,
            "subject_strengths": subject_strengths,
            "subject_gaps": subject_gaps,
            "skill_strengths": skill_strengths,
            "skill_gaps": skill_gaps,
            "evidence_confidence": confidence,
            "total_evidence_count": ev_count,
            "learning_history_summary": {
                "total_activities": activities_count,
                "coding_challenges_attempted": practices_count,
                "weekly_study_hours": float(profile.get("statistics", {}).get("weekly_study_hours", 0.0)) if profile else 0.0
            },
            "interests": profile.get("interests", []) if profile else []
        }

    async def get_personalized_learning_path(self, student_id: str, db: AsyncDatabase) -> Dict[str, Any]:
        """Constructs an individual personalized learning trajectory connecting curriculum, skill gaps, and career target."""
        profile = await db.student_profiles.find_one({"user_id": student_id})
        branch = (profile.get("major_or_branch") if profile else None) or "CSE"
        target_career_id = profile.get("target_career_id") if profile else None
        target_career_title = profile.get("target_career_title") if profile else None

        # Fetch branch subjects
        subjects_cursor = db.subjects.find({"branch_id": branch.upper()}).sort([("academic_year", 1), ("semester", 1)])
        subjects = await subjects_cursor.to_list(length=100)

        # Fetch subject baselines
        baselines_cursor = db.subject_baselines.find({"student_id": student_id})
        baselines = await baselines_cursor.to_list(length=100)
        baselines_map = {b["subject_id"]: b for b in baselines}

        # Fetch student skills
        skills_map = {s.get("skill_id"): s for s in (profile.get("skills", []) if profile else [])}

        milestones = []
        step = 1

        # Phase 1: Foundation (Year 1 subjects)
        for s in [sub for sub in subjects if sub.get("academic_year") == 1]:
            b_info = baselines_map.get(s["subject_code"], {})
            cur_level = float(b_info.get("proficiency_level", 1.0))
            completed = cur_level >= 3.0
            milestones.append({
                "id": f"milestone_{step}",
                "step_number": step,
                "phase": "Foundation",
                "subject_name": s["name"],
                "skill_id": s.get("canonical_skills", ["SK001"])[0] if s.get("canonical_skills") else "SK001",
                "skill_name": s["name"],
                "current_level": cur_level,
                "target_level": 4.0,
                "status": "COMPLETED" if completed else ("IN_PROGRESS" if step == 1 else "UPCOMING"),
                "prerequisites": s.get("prerequisites", []),
                "recommended_resources": s.get("learning_resources", []),
                "action_type": "LEARN_SUBJECT"
            })
            step += 1

        # Phase 2: Core Curriculum (Year 2 subjects)
        for s in [sub for sub in subjects if sub.get("academic_year") == 2]:
            b_info = baselines_map.get(s["subject_code"], {})
            cur_level = float(b_info.get("proficiency_level", 1.0))
            completed = cur_level >= 3.0
            milestones.append({
                "id": f"milestone_{step}",
                "step_number": step,
                "phase": "Core Curriculum",
                "subject_name": s["name"],
                "skill_id": s.get("canonical_skills", ["SK040"])[0] if s.get("canonical_skills") else "SK040",
                "skill_name": s["name"],
                "current_level": cur_level,
                "target_level": 4.0,
                "status": "COMPLETED" if completed else "UPCOMING",
                "prerequisites": s.get("prerequisites", []),
                "recommended_resources": s.get("learning_resources", []),
                "action_type": "PRACTICE_CODING" if "DSA" in s.get("subject_code", "") else "LEARN_SUBJECT"
            })
            step += 1

        # Phase 3: Advanced Specialization (Year 3 & 4 subjects)
        for s in [sub for sub in subjects if sub.get("academic_year", 3) >= 3]:
            b_info = baselines_map.get(s["subject_code"], {})
            cur_level = float(b_info.get("proficiency_level", 1.0))
            completed = cur_level >= 3.0
            milestones.append({
                "id": f"milestone_{step}",
                "step_number": step,
                "phase": "Advanced Specialization",
                "subject_name": s["name"],
                "skill_id": s.get("canonical_skills", ["SK015"])[0] if s.get("canonical_skills") else "SK015",
                "skill_name": s["name"],
                "current_level": cur_level,
                "target_level": 4.0,
                "status": "COMPLETED" if completed else "UPCOMING",
                "prerequisites": s.get("prerequisites", []),
                "recommended_resources": s.get("learning_resources", []),
                "action_type": "BUILD_PROJECT" if "WEB" in s.get("subject_code", "") else "LEARN_SUBJECT"
            })
            step += 1

        # Phase 4: Career Readiness & Gaps (Target Career Specific)
        if target_career_id:
            try:
                student_skills_list = [
                    {"skill_id": s.get("skill_id"), "level": float(s.get("level", 1.0))}
                    for s in (profile.get("skills", []) if profile else [])
                ]
                gap_analysis = self.ml_service.analyze_skill_gap(student_skills_list, target_career_id)
                critical_gaps = [g for g in gap_analysis.get("gaps", []) if g.get("priority") in ("Critical", "High")]
                for g in critical_gaps[:3]:
                    s_id = g.get("skill_id")
                    cur_s = skills_map.get(s_id, {})
                    cur_lvl = float(cur_s.get("level", 1.0))
                    milestones.append({
                        "id": f"milestone_{step}",
                        "step_number": step,
                        "phase": "Career Readiness",
                        "subject_name": f"Target Gap: {g.get('skill_name', s_id)}",
                        "skill_id": s_id,
                        "skill_name": g.get("skill_name", s_id),
                        "current_level": cur_lvl,
                        "target_level": float(g.get("required_level", 4.0)),
                        "status": "IN_PROGRESS" if cur_lvl > 1.0 else "UPCOMING",
                        "prerequisites": [],
                        "recommended_resources": [],
                        "action_type": "TAKE_ASSESSMENT"
                    })
                    step += 1
            except Exception as e:
                print(f"[Warn] Learning path gap enrichment: {e}")

        completed_count = len([m for m in milestones if m["status"] == "COMPLETED"])
        progress_pct = (completed_count / len(milestones) * 100.0) if milestones else 0.0

        return {
            "student_id": student_id,
            "target_career_title": target_career_title,
            "branch_name": branch,
            "milestones": milestones,
            "total_milestones": len(milestones),
            "completed_milestones": completed_count,
            "progress_percentage": round(progress_pct, 1)
        }
