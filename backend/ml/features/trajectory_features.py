"""
Skill2Career - Longitudinal Trajectory Feature Engineering Module
Generates longitudinal progression features across multi-week horizons for future readiness forecasting.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np


TRAJECTORY_NUM_FEATURES = [
    "initial_readiness",
    "weekly_study_hours",
    "learning_consistency",
    "cumulative_hours",
    "milestones_completed",
    "week"
]

TRAJECTORY_TARGET_COL = "readiness_at_week"


class TrajectoryFeatureExtractor:
    """
    Extracts structured simulation time-step features for longitudinal trajectory forecasting.
    """

    @staticmethod
    def build_trajectory_dataframe(
        initial_readiness: float,
        weekly_study_hours: float = 12.0,
        learning_consistency: float = 1.0,
        projection_weeks: List[int] = [0, 4, 8, 12, 16, 20, 24]
    ) -> List[Dict[str, Any]]:
        """
        Creates a list of feature rows across specified week time-steps.
        """
        rows = []
        cum_hours = 0.0
        milestones = 0

        for w in projection_weeks:
            cum_hours = float(w * weekly_study_hours)
            milestones = int(w / 3) if w > 0 else 0

            row_dict = {
                "initial_readiness": float(np.clip(initial_readiness, 0.0, 100.0)),
                "weekly_study_hours": float(np.clip(weekly_study_hours, 0.0, 80.0)),
                "learning_consistency": float(np.clip(learning_consistency, 0.1, 2.0)),
                "cumulative_hours": float(cum_hours),
                "milestones_completed": int(milestones),
                "week": int(w)
            }
            rows.append(row_dict)


        return rows
