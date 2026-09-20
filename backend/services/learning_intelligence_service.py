"""
Skill2Career - Learning Intelligence & Trajectory Service (Phase 09B)
Analyzes verified learning history, snapshots, consistency, velocity, and skill progression
to generate deterministic, transparent, and evidence-grounded student learning intelligence.
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone, timedelta
import numpy as np
from bson import ObjectId
from pymongo.asynchronous.database import AsyncDatabase

from backend.schemas.learning_intelligence_schemas import (
    StagnationStatus,
    SkillProgressionStatus,
    TrajectoryDirection,
    TrajectoryConfidence,
    SkillProgressionItem,
    LearningVelocityMetrics,
    ConsistencyMetrics,
    StagnationMetrics,
    TrajectoryPoint,
    SkillLevelHistoryItem,
    LearningTrajectoryOverviewResponse
)
from backend.database.mongodb import get_utc_now, serialize_doc, serialize_docs


class LearningIntelligenceService:
    def _parse_datetime(self, val: Any) -> Optional[datetime]:
        """Safely parses string or datetime objects to a timezone-aware UTC datetime."""
        if val is None:
            return None
        if isinstance(val, datetime):
            return val if val.tzinfo else val.replace(tzinfo=timezone.utc)
        try:
            val_str = str(val).replace("Z", "+00:00")
            dt = datetime.fromisoformat(val_str)
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except Exception:
            return None

    async def record_learning_snapshot(
        self,
        student_id: str,
        db: AsyncDatabase,
        target_career_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates an immutable, point-in-time snapshot of the student's learning state.
        Idempotently protects against rapid duplicate snapshot generation within the same minute.
        """
        now = get_utc_now()
        now_str = now.isoformat()

        # 1. Fetch Profile
        profile = await db.student_profiles.find_one({"user_id": student_id})
        skills = profile.get("skills", []) if profile else []
        skill_count = len(skills)
        verified_skills = [s for s in skills if bool(s.get("verified", s.get("is_verified", False)))]
        target_cid = target_career_id or (profile.get("target_career_id") if profile else None)

        # 2. Count Artifacts
        projects_count = await db.projects.count_documents({"student_id": student_id})
        certs_count = await db.certifications.count_documents({"student_id": student_id})
        asms_count = await db.student_assessments.count_documents({"$or": [{"student_id": student_id}, {"user_id": student_id}]})
        if asms_count == 0:
            asms_count = await db.assessment_results.count_documents({"student_id": student_id})
        activities_count = await db.learning_activities.count_documents({"student_id": student_id})
        evidences_count = await db.skill_evidence.count_documents({
            "student_id": student_id,
            "verification_status": {"$in": ["SYSTEM_VERIFIED", "ASSESSMENT_VERIFIED", "MANUALLY_VERIFIED"]}
        })

        # 3. Read latest readiness prediction score if exists
        latest_pred = await db.readiness_predictions.find_one(
            {"student_id": student_id},
            sort=[("created_at", -1)]
        )
        readiness_score = float(latest_pred["readiness_score"]) if latest_pred else None

        snapshot_doc = {
            "student_id": student_id,
            "snapshot_date": now_str,
            "skill_count": skill_count,
            "verified_skill_count": len(verified_skills),
            "average_proficiency": round(avg_prof, 2),
            "target_career_id": target_cid,
            "projects_count": projects_count,
            "assessments_count": asms_count,
            "certifications_count": certs_count,
            "learning_activity_count": activities_count,
            "verified_evidence_count": evidences_count,
            "readiness_score": readiness_score,
            "skills_state": [
                {
                    "skill_id": s.get("skill_id"),
                    "name": s.get("name", s.get("skill_id")),
                    "level": float(s.get("level", 1.0)),
                    "verified": bool(s.get("verified", False))
                }
                for s in skills
            ],
            "snapshot_source": "learning_intelligence_engine",
            "created_at": now_str
        }

        await db.learning_snapshots.insert_one(snapshot_doc)
        return serialize_doc(snapshot_doc)

    async def get_student_snapshots(
        self,
        student_id: str,
        db: AsyncDatabase,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Retrieves historical snapshots for student in chronological order."""
        cursor = db.learning_snapshots.find({"student_id": student_id}).sort([("snapshot_date", 1), ("created_at", 1)]).limit(limit)
        docs = await cursor.to_list(length=limit)
        return docs

    def calculate_skill_progressions(
        self,
        current_skills: List[Dict[str, Any]],
        snapshots: List[Dict[str, Any]],
        evidences: List[Dict[str, Any]]
    ) -> List[SkillProgressionItem]:
        """
        Analyzes change in skill proficiency across snapshots.
        Adheres strictly to Phase 09B rules:
        - Single observation -> INSUFFICIENT_HISTORY
        - Does not infer decline from missing data
        - Identifies IMPROVING, STABLE, DECLINING, NEWLY_ACQUIRED
        """
        if not current_skills:
            return []

        # Map earliest snapshot skills for baseline comparison
        earliest_skills_map: Dict[str, float] = {}
        prev_skills_map: Dict[str, float] = {}

        if len(snapshots) >= 2:
            earliest_snap = snapshots[0]
            for s in earliest_snap.get("skills_state", []):
                sk_id = s.get("skill_id")
                if sk_id:
                    earliest_skills_map[sk_id] = float(s.get("level", 1.0))

            prev_snap = snapshots[-2] if len(snapshots) >= 2 else snapshots[0]
            for s in prev_snap.get("skills_state", []):
                sk_id = s.get("skill_id")
                if sk_id:
                    prev_skills_map[sk_id] = float(s.get("level", 1.0))
        elif len(snapshots) == 1:
            for s in snapshots[0].get("skills_state", []):
                sk_id = s.get("skill_id")
                if sk_id:
                    earliest_skills_map[sk_id] = float(s.get("level", 1.0))

        # Map evidences per skill
        evidence_counts: Dict[str, int] = {}
        verified_evidence_counts: Dict[str, int] = {}
        for ev in evidences:
            sk_id = ev.get("skill_id")
            if sk_id:
                evidence_counts[sk_id] = evidence_counts.get(sk_id, 0) + 1
                if ev.get("verification_status") in ["SYSTEM_VERIFIED", "ASSESSMENT_VERIFIED", "MANUALLY_VERIFIED"]:
                    verified_evidence_counts[sk_id] = verified_evidence_counts.get(sk_id, 0) + 1

        results = []
        for s in current_skills:
            sk_id = s.get("skill_id")
            sk_name = s.get("name", sk_id)
            cat = s.get("category", "General")
            curr_prof = float(s.get("level", 1.0))
            is_verified = bool(s.get("verified", False))
            ev_count = evidence_counts.get(sk_id, 0)
            ver_ev_count = verified_evidence_counts.get(sk_id, 0)

            if len(snapshots) < 2:
                # Insufficient historical snapshots
                status = SkillProgressionStatus.INSUFFICIENT_HISTORY
                prev_prof = None
                abs_change = 0.0
                obs_count = 1
                summary = f"Single observation recorded ({curr_prof:.1f} proficiency). Additional snapshot required for progression analysis."
            else:
                obs_count = len(snapshots)
                if sk_id not in earliest_skills_map:
                    # Newly acquired skill
                    status = SkillProgressionStatus.NEWLY_ACQUIRED
                    prev_prof = None
                    abs_change = curr_prof
                    summary = f"Newly acquired competency at Level {curr_prof:.1f} with {ver_ev_count} verified artifact(s)."
                else:
                    prev_prof = prev_skills_map.get(sk_id, earliest_skills_map.get(sk_id, curr_prof))
                    abs_change = round(curr_prof - prev_prof, 2)
                    
                    if abs_change > 0.05:
                        status = SkillProgressionStatus.IMPROVING
                        summary = f"Progressed +{abs_change:.1f} level (from {prev_prof:.1f} to {curr_prof:.1f}) supported by {ver_ev_count} verified checkpoint(s)."
                    elif abs_change < -0.05:
                        status = SkillProgressionStatus.DECLINING
                        summary = f"Recorded historical adjustment of {abs_change:.1f} level."
                    else:
                        status = SkillProgressionStatus.STABLE
                        summary = f"Consistent proficiency sustained at Level {curr_prof:.1f}."

            results.append(SkillProgressionItem(
                skill_id=sk_id,
                skill_name=sk_name,
                category=cat,
                current_proficiency=curr_prof,
                previous_proficiency=prev_prof,
                absolute_change=abs_change,
                status=status,
                evidence_count=ev_count,
                verified_evidence_count=ver_ev_count,
                is_verified=is_verified,
                observation_count=obs_count,
                last_updated_at=str(s.get("last_assessed_at") or ""),
                progression_summary=summary
            ))

        return results

    def calculate_learning_velocity(
        self,
        snapshots: List[Dict[str, Any]],
        activities: List[Dict[str, Any]],
        evidences: List[Dict[str, Any]]
    ) -> LearningVelocityMetrics:
        """
        Calculates time-normalized learning velocity metrics.
        Requires >= 2 snapshots separated by a measurable time interval (> 0 days).
        """
        if len(snapshots) < 2:
            return LearningVelocityMetrics(
                status="INSUFFICIENT_HISTORY",
                minimum_observations_met=False,
                skill_progression_velocity=0.0,
                evidence_velocity=0.0,
                learning_activity_velocity=0.0,
                overall_learning_velocity=0.0,
                velocity_tier="Insufficient History",
                elapsed_days=0.0,
                observation_count=len(snapshots),
                analysis_notes="At least 2 historical snapshots separated in time are required to calculate velocity."
            )

        t_earliest = self._parse_datetime(snapshots[0].get("snapshot_date") or snapshots[0].get("created_at"))
        t_latest = self._parse_datetime(snapshots[-1].get("snapshot_date") or snapshots[-1].get("created_at"))

        if not t_earliest or not t_latest:
            elapsed_days = 0.0
        else:
            elapsed_days = max(0.0, (t_latest - t_earliest).total_seconds() / 86400.0)

        if elapsed_days < 0.5:
            return LearningVelocityMetrics(
                status="INSUFFICIENT_HISTORY",
                minimum_observations_met=False,
                skill_progression_velocity=0.0,
                evidence_velocity=0.0,
                learning_activity_velocity=0.0,
                overall_learning_velocity=0.0,
                velocity_tier="Insufficient History",
                elapsed_days=round(elapsed_days, 2),
                observation_count=len(snapshots),
                analysis_notes="Snapshots span less than 1 day. Additional longitudinal observation history required."
            )

        # 1. Skill Progression Velocity (points per 30 days)
        prof_earliest = float(snapshots[0].get("average_proficiency", 1.0))
        prof_latest = float(snapshots[-1].get("average_proficiency", 1.0))
        prof_delta = max(0.0, prof_latest - prof_earliest)
        skill_velocity = round((prof_delta / elapsed_days) * 30.0, 2)

        # 2. Evidence Velocity (verified evidence per 30 days)
        ev_earliest = int(snapshots[0].get("verified_evidence_count", 0))
        ev_latest = int(snapshots[-1].get("verified_evidence_count", len(evidences)))
        ev_delta = max(0, ev_latest - ev_earliest)
        evidence_velocity = round((ev_delta / elapsed_days) * 30.0, 2)

        # 3. Learning Activity Velocity (activities completed per 7 days)
        act_count = len(activities)
        act_velocity = round((act_count / max(1.0, elapsed_days)) * 7.0, 2)

        # 4. Overall Normalized Velocity Index (0.0 to 5.0 scale)
        # Weighted combination: skill growth (60%), verified evidence (30%), active study pace (10%)
        composite_score = (
            min(2.5, skill_velocity * 2.0) +
            min(1.5, evidence_velocity * 0.5) +
            min(1.0, act_velocity * 0.2)
        )
        overall_velocity = round(float(np.clip(composite_score, 0.0, 5.0)), 2)

        if overall_velocity >= 3.5:
            tier = "High Momentum"
        elif overall_velocity >= 2.0:
            tier = "Steady Momentum"
        elif overall_velocity >= 0.8:
            tier = "Developing Momentum"
        else:
            tier = "Low Momentum"

        notes = (
            f"Observed over {elapsed_days:.1f} days across {len(snapshots)} snapshots: "
            f"+{prof_delta:.2f} skill proficiency delta ({skill_velocity:.2f}/mo) "
            f"and +{ev_delta} verified artifact(s) ({evidence_velocity:.1f}/mo)."
        )

        return LearningVelocityMetrics(
            status="SUFFICIENT_HISTORY",
            minimum_observations_met=True,
            skill_progression_velocity=skill_velocity,
            evidence_velocity=evidence_velocity,
            learning_activity_velocity=act_velocity,
            overall_learning_velocity=overall_velocity,
            velocity_tier=tier,
            elapsed_days=round(elapsed_days, 1),
            observation_count=len(snapshots),
            analysis_notes=notes
        )

    def calculate_consistency(
        self,
        activities: List[Dict[str, Any]],
        projects: List[Dict[str, Any]],
        assessments: List[Dict[str, Any]],
        evidences: List[Dict[str, Any]]
    ) -> ConsistencyMetrics:
        """
        Evaluates regularity, streaks, and study distribution across calendar days.
        Deduplicates multiple events on the same calendar day to prevent spam inflation.
        """
        # Collect all active calendar dates (YYYY-MM-DD)
        active_dates_set = set()
        day_of_week_counts = {"Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0}
        dow_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

        all_events = []
        for a in activities:
            all_events.append(a.get("completed_at") or a.get("created_at"))
        for p in projects:
            all_events.append(p.get("created_at"))
        for asm in assessments:
            all_events.append(asm.get("completed_at") or asm.get("created_at"))
        for ev in evidences:
            all_events.append(ev.get("observed_at") or ev.get("created_at"))

        parsed_dates = []
        for e in all_events:
            dt = self._parse_datetime(e)
            if dt:
                parsed_dates.append(dt)
                date_key = dt.strftime("%Y-%m-%d")
                active_dates_set.add(date_key)
                dow = dow_names[dt.weekday()]
                day_of_week_counts[dow] += 1

        active_days_count = len(active_dates_set)
        if not active_dates_set:
            return ConsistencyMetrics(
                consistency_score=0.0,
                consistency_tier="Insufficient History",
                active_learning_days_count=0,
                current_streak_days=0,
                longest_streak_days=0,
                study_frequency_per_week=0.0,
                inactive_gap_days=0,
                weekly_activity_distribution=day_of_week_counts,
                analysis_notes="No learning activity or artifact timestamps logged yet."
            )

        # Sort unique calendar days
        sorted_dates = sorted([datetime.strptime(d, "%Y-%m-%d").date() for d in active_dates_set])
        
        # Calculate streaks
        longest_streak = 1
        current_streak = 1
        temp_streak = 1
        for i in range(1, len(sorted_dates)):
            diff = (sorted_dates[i] - sorted_dates[i-1]).days
            if diff == 1:
                temp_streak += 1
                if temp_streak > longest_streak:
                    longest_streak = temp_streak
            elif diff > 1:
                temp_streak = 1

        # Check if current streak extends to today or yesterday
        today = get_utc_now().date()
        if (today - sorted_dates[-1]).days <= 1:
            # Active streak
            current_streak = temp_streak
        else:
            current_streak = 0

        # Inactive gap days
        inactive_gap = (today - sorted_dates[-1]).days

        # Frequency per week over active span
        span_days = max(7, (sorted_dates[-1] - sorted_dates[0]).days + 1)
        freq_per_week = round((active_days_count / (span_days / 7.0)), 1)

        # Bounded Consistency Score (0.0 to 100.0)
        # 40% active days ratio, 30% streak persistence, 30% study frequency
        score_calc = (
            min(40.0, active_days_count * 3.5) +
            min(30.0, longest_streak * 6.0) +
            min(30.0, freq_per_week * 8.0)
        )
        consistency_score = round(float(np.clip(score_calc, 0.0, 100.0)), 1)

        if consistency_score >= 80.0:
            tier = "High Consistency"
        elif consistency_score >= 55.0:
            tier = "Moderate Consistency"
        elif consistency_score >= 30.0:
            tier = "Developing Consistency"
        else:
            tier = "Low Consistency"

        notes = (
            f"{active_days_count} active learning day(s) logged. "
            f"Current streak: {current_streak} day(s), Longest streak: {longest_streak} day(s). "
            f"Average frequency: {freq_per_week} day(s)/week."
        )

        return ConsistencyMetrics(
            consistency_score=consistency_score,
            consistency_tier=tier,
            active_learning_days_count=active_days_count,
            current_streak_days=current_streak,
            longest_streak_days=longest_streak,
            study_frequency_per_week=freq_per_week,
            inactive_gap_days=inactive_gap,
            weekly_activity_distribution=day_of_week_counts,
            analysis_notes=notes
        )

    def detect_stagnation(
        self,
        snapshots: List[Dict[str, Any]],
        activities: List[Dict[str, Any]],
        progressions: List[SkillProgressionItem]
    ) -> StagnationMetrics:
        """
        Identifies potential learning stagnation vs active progression.
        Distinguishes active outcome-driven progression from raw activity volume.
        """
        if len(snapshots) < 2:
            return StagnationMetrics(
                status=StagnationStatus.INSUFFICIENT_HISTORY,
                days_since_last_progression=None,
                days_since_last_activity=None,
                meaningful_skill_progression_detected=False,
                analysis_summary="Insufficient historical observations to establish baseline momentum.",
                recommended_intervention="Complete technical assessments and log project milestones to establish learning trajectory."
            )

        now = get_utc_now()
        improving_skills = [p for p in progressions if p.status == SkillProgressionStatus.IMPROVING]
        has_progression = len(improving_skills) > 0

        # Parse latest activity date
        last_act_dt = None
        for a in activities:
            dt = self._parse_datetime(a.get("completed_at") or a.get("created_at"))
            if dt and (last_act_dt is None or dt > last_act_dt):
                last_act_dt = dt

        days_since_act = (now - last_act_dt).days if last_act_dt else None

        # Determine Stagnation Status
        if days_since_act is not None and days_since_act > 28:
            status = StagnationStatus.POSSIBLE_STAGNATION
            summary = f"No active learning sessions or milestones logged in {days_since_act} days."
            intervention = "Resume study roadmap with a short 30-minute practice module or project checkpoint."
        elif days_since_act is not None and days_since_act <= 3 and len(activities) > 0:
            # Check if there was a previous long gap
            status = StagnationStatus.ACTIVE_PROGRESS if has_progression else StagnationStatus.STABLE_PROGRESS
            if has_progression:
                summary = f"Active momentum observed: {len(improving_skills)} skill(s) demonstrating measurable progression."
                intervention = "Maintain current learning pace and submit project code for verification."
            else:
                summary = "Active learning participation recorded; competency levels remain stable."
                intervention = "Attempt a skill assessment checkpoint to validate recent practice into verified skill increases."
        elif has_progression:
            status = StagnationStatus.ACTIVE_PROGRESS
            summary = f"Progressing steadily with {len(improving_skills)} improving skill competencies."
            intervention = "Continue focusing on recommended high-priority career skill gaps."
        else:
            status = StagnationStatus.STABLE_PROGRESS
            summary = "Stable learning profile with sustained competency levels."
            intervention = "Take on a higher complexity project module to break through proficiency plateaus."

        return StagnationMetrics(
            status=status,
            days_since_last_progression=None if not has_progression else 0,
            days_since_last_activity=days_since_act,
            meaningful_skill_progression_detected=has_progression,
            analysis_summary=summary,
            recommended_intervention=intervention
        )

    async def get_learning_trajectory_overview(
        self,
        student_id: str,
        db: AsyncDatabase
    ) -> LearningTrajectoryOverviewResponse:
        """
        Constructs the comprehensive Learning Intelligence & Trajectory report for authenticated student.
        """
        # 1. Fetch Profile
        profile = await db.student_profiles.find_one({"user_id": student_id})
        current_skills = profile.get("skills", []) if profile else []

        # 2. Fetch Historical Artifacts & Snapshots
        snapshots = await self.get_student_snapshots(student_id, db)
        
        activities_cursor = db.learning_activities.find({"student_id": student_id})
        activities = await activities_cursor.to_list(length=200)

        projects_cursor = db.projects.find({"student_id": student_id})
        projects = await projects_cursor.to_list(length=100)

        asms_cursor = db.student_assessments.find({"$or": [{"student_id": student_id}, {"user_id": student_id}]})
        assessments = await asms_cursor.to_list(length=100)

        evidences_cursor = db.skill_evidence.find({"student_id": student_id})
        evidences = await evidences_cursor.to_list(length=200)

        # 3. Calculate Engines
        progressions = self.calculate_skill_progressions(current_skills, snapshots, evidences)
        velocity = self.calculate_learning_velocity(snapshots, activities, evidences)
        consistency = self.calculate_consistency(activities, projects, assessments, evidences)
        stagnation = self.detect_stagnation(snapshots, activities, progressions)

        # 4. Trajectory Direction
        if len(snapshots) < 2:
            direction = TrajectoryDirection.INSUFFICIENT_HISTORY
            confidence = TrajectoryConfidence.INSUFFICIENT_DATA
            conf_reason = "Single baseline observation. Longitudinal analysis requires at least 2 snapshot checkpoints."
        elif velocity.overall_learning_velocity >= 3.0:
            direction = TrajectoryDirection.ACCELERATING
            confidence = TrajectoryConfidence.HIGH if len(snapshots) >= 4 else TrajectoryConfidence.MEDIUM
            conf_reason = f"High velocity trend supported by {len(snapshots)} snapshots and {consistency.active_learning_days_count} active learning days."
        elif velocity.overall_learning_velocity >= 1.5:
            direction = TrajectoryDirection.STEADY
            confidence = TrajectoryConfidence.HIGH if len(snapshots) >= 3 else TrajectoryConfidence.MEDIUM
            conf_reason = f"Steady progression rate observed across {len(snapshots)} historical checkpoints."
        elif stagnation.status == StagnationStatus.POSSIBLE_STAGNATION:
            direction = TrajectoryDirection.STAGNANT
            confidence = TrajectoryConfidence.MEDIUM
            conf_reason = "Observed plateau in skill state change over recent historical window."
        else:
            direction = TrajectoryDirection.DECELERATING
            confidence = TrajectoryConfidence.LOW
            conf_reason = "Low rate of skill state transition observed."

        # 5. Build Trajectory Points Timeline
        timeline_points = []
        for s in snapshots:
            dt = self._parse_datetime(s.get("snapshot_date") or s.get("created_at"))
            date_label = dt.strftime("%b %d, %Y") if dt else "Checkpoint"
            timeline_points.append(TrajectoryPoint(
                timestamp=str(s.get("snapshot_date") or s.get("created_at") or ""),
                date_label=date_label,
                skill_count=int(s.get("skill_count", len(current_skills))),
                verified_skill_count=int(s.get("verified_skill_count", 0)),
                average_proficiency=float(s.get("average_proficiency", 1.0)),
                projects_count=int(s.get("projects_count", len(projects))),
                assessments_count=int(s.get("assessments_count", len(assessments))),
                certifications_count=int(s.get("certifications_count", 0)),
                learning_activity_count=int(s.get("learning_activity_count", len(activities))),
                verified_evidence_count=int(s.get("verified_evidence_count", len(evidences))),
                readiness_score=s.get("readiness_score"),
                snapshot_source=s.get("snapshot_source", "automated_snapshot")
            ))

        # Top improving skills
        top_improving = [p.skill_name for p in progressions if p.status == SkillProgressionStatus.IMPROVING][:5]

        # Executive insights
        insights = []
        if direction == TrajectoryDirection.ACCELERATING:
            insights.append("Your skill development velocity is currently accelerating above benchmark pace.")
        elif direction == TrajectoryDirection.STEADY:
            insights.append("You are sustaining steady, consistent competency growth across core skills.")
        elif direction == TrajectoryDirection.INSUFFICIENT_HISTORY:
            insights.append("Learning intelligence is currently tracking your baseline. Complete additional exercises to unlock trajectory projections.")
        
        if consistency.current_streak_days >= 3:
            insights.append(f"Active {consistency.current_streak_days}-day learning streak! Consistent practice accelerates retention.")
        
        if top_improving:
            insights.append(f"Top progressing competencies: {', '.join(top_improving)}.")

        return LearningTrajectoryOverviewResponse(
            student_id=student_id,
            generated_at=get_utc_now().isoformat(),
            total_snapshots=len(snapshots),
            trajectory_direction=direction,
            trajectory_confidence=confidence,
            confidence_rationale=conf_reason,
            velocity=velocity,
            consistency=consistency,
            stagnation=stagnation,
            skill_progressions=progressions,
            top_improving_skills=top_improving,
            trajectory_timeline=timeline_points,
            executive_insights=insights,
            engine_version="v1.0-intelligence"
        )

    async def get_skill_history(
        self,
        student_id: str,
        skill_id: str,
        db: AsyncDatabase
    ) -> List[SkillLevelHistoryItem]:
        """Retrieves chronological progression history for a specific skill."""
        snapshots = await self.get_student_snapshots(student_id, db)
        skill_doc = await db.skills.find_one({"$or": [{"skill_code": skill_id}, {"_id": skill_id}]})
        skill_name = skill_doc.get("name", skill_id) if skill_doc else skill_id

        history_items = []
        prev_level = 1.0

        for s in snapshots:
            skills_state = s.get("skills_state", [])
            item = next((sk for sk in skills_state if sk.get("skill_id") == skill_id), None)
            if item:
                curr_level = float(item.get("level", 1.0))
                change = round(curr_level - prev_level, 2)
                v_status = "VERIFIED" if bool(item.get("verified", False)) else "UNVERIFIED"
                ts = str(s.get("snapshot_date") or s.get("created_at") or "")

                history_items.append(SkillLevelHistoryItem(
                    student_id=student_id,
                    skill_id=skill_id,
                    skill_name=skill_name,
                    previous_proficiency=prev_level,
                    new_proficiency=curr_level,
                    change=change,
                    timestamp=ts,
                    source_evidence_ids=[],
                    verification_status=v_status,
                    reason=f"Snapshot observation at {curr_level:.1f} proficiency",
                    engine_version="v1.0-intelligence"
                ))
                prev_level = curr_level

        return history_items
