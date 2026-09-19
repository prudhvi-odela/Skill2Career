"""
Skill2Career MongoDB Database Seeder
Idempotently seeds skills taxonomy, career roles, assessment quizzes, model version metadata, and demo student profile.
"""

import os
import json
import asyncio
from datetime import datetime, timezone
import pandas as pd
from pymongo.asynchronous.database import AsyncDatabase

from backend.config import settings
from backend.database.mongodb import connect_to_mongo, close_mongo_connection, get_db, get_utc_now
from backend.database.indexes import ensure_indexes
from backend.services.auth_service import get_password_hash

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "ml", "artifacts")


ASSESSMENT_DATA = [
    {
        "skill_id": "SK001",
        "title": "Python Core Proficiency Assessment",
        "difficulty": "Intermediate",
        "time_limit_minutes": 10,
        "pass_score": 70.0,
        "is_active": True,
        "questions": [
            {
                "id": "Q_PY_01",
                "question_text": "What is the time complexity of searching a key in a standard Python dictionary in average case?",
                "options_json": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
                "correct_option_index": 0,
                "explanation": "Python dictionaries use hash tables under the hood, yielding O(1) average lookup time."
            },
            {
                "id": "Q_PY_02",
                "question_text": "How do Python list comprehensions compare with traditional for-loops?",
                "options_json": [
                    "They are slower due to extra memory allocation",
                    "They are generally faster as they execute in optimized C bytecode",
                    "They can only operate on strings",
                    "They do not return a new list"
                ],
                "correct_option_index": 1,
                "explanation": "List comprehensions run optimized bytecode loops in CPython, often outperforming manual append loops."
            },
            {
                "id": "Q_PY_03",
                "question_text": "What does the Python `*args` syntax inside a function definition denote?",
                "options_json": [
                    "Keyword arguments as a dict",
                    "Variable positional arguments packed as a tuple",
                    "Memory pointer to the arguments",
                    "Mandatory keyword-only arguments"
                ],
                "correct_option_index": 1,
                "explanation": "`*args` allows passing an arbitrary number of positional arguments which are packed into a tuple."
            },
            {
                "id": "Q_PY_04",
                "question_text": "What happens when an unhandled exception occurs inside a Python generator?",
                "options_json": [
                    "The generator restarts from the beginning",
                    "The generator terminates and cannot yield any more values",
                    "It defaults to returning None",
                    "The exception is silently ignored"
                ],
                "correct_option_index": 1,
                "explanation": "An unhandled exception causes the generator function to exit immediately, closing the generator."
            }
        ]
    },
    {
        "skill_id": "SK009",
        "title": "React Architecture & Hooks Assessment",
        "difficulty": "Intermediate",
        "time_limit_minutes": 10,
        "pass_score": 70.0,
        "is_active": True,
        "questions": [
            {
                "id": "Q_RCT_01",
                "question_text": "What is the main purpose of the `useEffect` hook with an empty dependency array `[]`?",
                "options_json": [
                    "Runs after every render",
                    "Runs only once when the component mounts",
                    "Runs whenever any state changes",
                    "Prevents the component from rendering"
                ],
                "correct_option_index": 1,
                "explanation": "An empty dependency array specifies that the effect does not depend on any props or state, so it runs only on initial mount."
            },
            {
                "id": "Q_RCT_02",
                "question_text": "Why should React state not be mutated directly (e.g. `state.count = 5`)?",
                "options_json": [
                    "It will cause syntax errors",
                    "React relies on reference equality to trigger re-renders; mutating state directly bypasses reactivity",
                    "Direct mutation slows down JavaScript",
                    "Browsers do not support object mutation"
                ],
                "correct_option_index": 1,
                "explanation": "React uses shallow comparison of state references. Direct mutation prevents React from detecting changes."
            },
            {
                "id": "Q_RCT_03",
                "question_text": "What is the primary benefit of `useCallback`?",
                "options_json": [
                    "To execute an API call automatically",
                    "To memoize a callback function reference across re-renders to prevent unnecessary child renders",
                    "To store values in localStorage",
                    "To replace Redux"
                ],
                "correct_option_index": 1,
                "explanation": "`useCallback` returns a memoized version of the callback that only changes if dependencies change."
            }
        ]
    },
    {
        "skill_id": "SK027",
        "title": "Machine Learning & Scikit-Learn Assessment",
        "difficulty": "Intermediate",
        "time_limit_minutes": 12,
        "pass_score": 75.0,
        "is_active": True,
        "questions": [
            {
                "id": "Q_ML_01",
                "question_text": "Why must feature scaling transformers (e.g. StandardScaler) be fitted only on training data?",
                "options_json": [
                    "To save CPU time",
                    "To prevent data leakage from the validation/test set into model training",
                    "Because test data cannot be converted to floats",
                    "Scikit-learn errors if fitted on test data"
                ],
                "correct_option_index": 1,
                "explanation": "Fitting scalers on validation or test sets leaks distribution statistics (mean/variance) into the model."
            },
            {
                "id": "Q_ML_02",
                "question_text": "Which metric is most appropriate for evaluating a regression model on continuous target predictions?",
                "options_json": [
                    "F1 Score and Precision",
                    "Mean Absolute Error (MAE) and R-squared (R2)",
                    "Confusion Matrix",
                    "ROC-AUC curve"
                ],
                "correct_option_index": 1,
                "explanation": "Continuous targets in regression are evaluated using MAE, RMSE, and R2 coefficients."
            },
            {
                "id": "Q_ML_03",
                "question_text": "What does a high training score combined with a low validation score typically indicate?",
                "options_json": [
                    "Underfitting (High Bias)",
                    "Overfitting (High Variance)",
                    "Optimal generalization",
                    "Zero error"
                ],
                "correct_option_index": 1,
                "explanation": "A large gap between training performance and validation performance is the classic hallmark of overfitting."
            }
        ]
    }
]


async def seed_database():
    print("\n--- Seeding Skill2Career MongoDB Database ---")
    db: AsyncDatabase = await connect_to_mongo()
    await ensure_indexes(db)

    now = get_utc_now()

    # 1. Seed Skills Taxonomy
    skills_csv = os.path.join(DATA_DIR, "skills_taxonomies.csv")
    if os.path.exists(skills_csv):
        skills_df = pd.read_csv(skills_csv)
        for _, row in skills_df.iterrows():
            aliases_list = [a.strip() for a in str(row["aliases"]).split(",")] if pd.notna(row["aliases"]) else []
            await db.skills.update_one(
                {"skill_code": row["skill_id"]},
                {
                    "$set": {
                        "skill_code": row["skill_id"],
                        "name": row["skill_name"],
                        "category": row["category"],
                        "domain": row["domain"],
                        "description": row["description"],
                        "aliases": aliases_list,
                        "updated_at": now
                    },
                    "$setOnInsert": {
                        "created_at": now
                    }
                },
                upsert=True
            )
        print(f"[OK] Seeded/updated {len(skills_df)} skills in 'skills' collection.")

    # 2. Seed Career Roles & Required Skills
    careers_csv = os.path.join(DATA_DIR, "career_roles_skills.csv")
    skills_map = {row["skill_id"]: row["skill_name"] for _, row in pd.read_csv(skills_csv).iterrows()} if os.path.exists(skills_csv) else {}

    if os.path.exists(careers_csv):
        careers_df = pd.read_csv(careers_csv)
        for _, row in careers_df.iterrows():
            req_skills_raw = json.loads(row["required_skills_json"])
            embedded_req_skills = [
                {
                    "skill_id": r["skill_id"],
                    "skill_name": skills_map.get(r["skill_id"], r["skill_id"]),
                    "required_level": float(r["required_level"]),
                    "importance_weight": float(r["importance"]),
                    "is_core": float(r["importance"]) >= 0.8
                }
                for r in req_skills_raw
            ]

            await db.career_roles.update_one(
                {"career_code": row["career_id"]},
                {
                    "$set": {
                        "career_code": row["career_id"],
                        "title": row["career_title"],
                        "domain": row["domain"],
                        "description": row["description"],
                        "required_skills": embedded_req_skills,
                        "salary_information": {
                            "average_usd": float(row["avg_salary_usd"]),
                            "currency": "USD"
                        },
                        "market_metadata": {
                            "min_exp_years": float(row["min_exp_years"]),
                            "demand_tier": "High"
                        },
                        "updated_at": now
                    },
                    "$setOnInsert": {
                        "created_at": now
                    }
                },
                upsert=True
            )
        print(f"[OK] Seeded/updated {len(careers_df)} career roles in 'career_roles' collection.")

    # 3. Seed Assessment Quizzes
    for asm in ASSESSMENT_DATA:
        await db.assessments.update_one(
            {"skill_id": asm["skill_id"]},
            {
                "$set": {
                    "skill_id": asm["skill_id"],
                    "title": asm["title"],
                    "difficulty": asm["difficulty"],
                    "time_limit_minutes": asm["time_limit_minutes"],
                    "pass_score": asm["pass_score"],
                    "is_active": asm["is_active"],
                    "questions": asm["questions"],
                    "updated_at": now
                },
                "$setOnInsert": {
                    "created_at": now
                }
            },
            upsert=True
        )
    print(f"[OK] Seeded {len(ASSESSMENT_DATA)} assessment quizzes in 'assessments' collection.")

    # 4. Seed Active ML Model Version
    meta_file = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
    if os.path.exists(meta_file):
        with open(meta_file, "r") as f:
            meta = json.load(f)
            v_tag = meta.get("version_tag", "v1.0.0-initial")
            await db.model_versions.update_one(
                {"model_name": "Skill2Career Ensemble Predictor", "version_tag": v_tag},
                {
                    "$set": {
                        "model_name": "Skill2Career Ensemble Predictor",
                        "version_tag": v_tag,
                        "algorithm": meta.get("readiness_model", {}).get("selected_algorithm", "HistGradientBoostingRegressor"),
                        "dataset_version": "v1.0-benchmark-5k",
                        "features": meta.get("readiness_model", {}).get("features", []),
                        "metrics": meta.get("readiness_model", {}).get("best_metrics", {}),
                        "artifact_path": "backend/ml/artifacts/readiness_pipeline.joblib",
                        "training_samples": 5000,
                        "training_date": meta.get("created_at", now.isoformat()),
                        "is_active": True
                    },
                    "$setOnInsert": {
                        "created_at": now
                    }
                },
                upsert=True
            )
        print(f"[OK] Seeded active ML model version: {v_tag}")

    # 5. Seed Demo Student Account & Profile
    demo_email = "demo@skill2career.com"
    demo_user = await db.users.find_one({"email": demo_email})
    
    if not demo_user:
        hashed_pwd = get_password_hash("Password123!")
        user_res = await db.users.insert_one({
            "email": demo_email,
            "hashed_password": hashed_pwd,
            "full_name": "Alex Chen",
            "role": "student",
            "is_active": True,
            "created_at": now,
            "updated_at": now
        })
        user_id = str(user_res.inserted_id)
    else:
        user_id = str(demo_user["_id"])

    # Initial Embedded Skills
    initial_skills = [
        {"skill_id": "SK001", "name": "Python", "category": "Languages", "domain": "General", "level": 4.0, "verified": True, "verification_source": "Self-Reported", "years_experience": 2.0},
        {"skill_id": "SK008", "name": "SQL", "category": "Languages", "domain": "Databases", "level": 3.5, "verified": True, "verification_source": "Assessment Quiz", "years_experience": 1.5},
        {"skill_id": "SK009", "name": "React", "category": "Frontend", "domain": "Web Development", "level": 3.0, "verified": False, "verification_source": "Self-Reported", "years_experience": 1.0},
        {"skill_id": "SK015", "name": "FastAPI", "category": "Backend", "domain": "Backend & APIs", "level": 3.5, "verified": True, "verification_source": "Self-Reported", "years_experience": 1.0},
        {"skill_id": "SK026", "name": "Pandas & NumPy", "category": "AI & ML", "domain": "Data Analysis", "level": 4.0, "verified": True, "verification_source": "Assessment Quiz", "years_experience": 2.0},
        {"skill_id": "SK027", "name": "Scikit-Learn", "category": "AI & ML", "domain": "Machine Learning", "level": 3.5, "verified": True, "verification_source": "Assessment Quiz", "years_experience": 1.5},
        {"skill_id": "SK040", "name": "Data Structures & Algorithms", "category": "Core CS", "domain": "Fundamentals", "level": 3.5, "verified": True, "verification_source": "Self-Reported", "years_experience": 2.0},
        {"skill_id": "SK043", "name": "Git & Version Control", "category": "Software Tools", "domain": "Collaboration", "level": 4.0, "verified": True, "verification_source": "Self-Reported", "years_experience": 2.0}
    ]

    await db.student_profiles.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "headline": "Aspiring AI Engineer & Full-Stack Developer",
                "bio": "Passionate computer science student building intelligent web systems and learning distributed architectures.",
                "degree": "B.Tech Computer Science",
                "institution": "National Institute of Technology",
                "institution_tier": 1,
                "graduation_year": 2026,
                "gpa": 8.8,
                "target_career_id": "CR004",  # Machine Learning Engineer
                "target_career_title": "Machine Learning Engineer",
                "skills": initial_skills,
                "statistics": {
                    "weekly_study_hours": 16.0,
                    "learning_velocity_index": 1.4,
                    "assessments_passed": 3,
                    "projects_count": 2,
                    "certifications_count": 1
                },
                "updated_at": now
            },
            "$setOnInsert": {
                "created_at": now
            }
        },
        upsert=True
    )

    # Seed Demo Projects
    await db.projects.delete_many({"student_id": user_id})
    await db.projects.insert_many([
        {
            "student_id": user_id,
            "title": "Skill2Career AI Engine",
            "description": "Engineered skill-gap mapping and job-readiness forecasting pipeline using FastAPI and Scikit-Learn.",
            "repository_url": "https://github.com/namitha-koduru/Skill2Career",
            "live_url": "http://localhost:5173",
            "technologies": "Python, FastAPI, Scikit-Learn, React, TypeScript, MongoDB",
            "complexity_rating": 4.5,
            "created_at": now,
            "updated_at": now
        },
        {
            "student_id": user_id,
            "title": "Distributed Task Queue & Caching System",
            "description": "Constructed an asynchronous worker queue utilizing Redis and Python asyncio with real-time WebSocket updates.",
            "repository_url": "https://github.com/demo/distributed-task-queue",
            "live_url": "https://demo-tasks.io",
            "technologies": "Python, Redis, WebSockets, Docker",
            "complexity_rating": 4.0,
            "created_at": now,
            "updated_at": now
        }
    ])

    # Seed Demo Certifications
    await db.certifications.delete_many({"student_id": user_id})
    await db.certifications.insert_one({
        "student_id": user_id,
        "name": "TensorFlow Developer Certificate",
        "issuer": "DeepLearning.AI / Google",
        "issue_date": "2025-11",
        "credential_url": "https://coursera.org/verify/TF-12345",
        "is_verified": True,
        "created_at": now
    })

    # Seed Demo Learning Activities
    await db.learning_activities.delete_many({"student_id": user_id})
    await db.learning_activities.insert_many([
        {
            "student_id": user_id,
            "activity_type": "practice",
            "title": "Completed 5 Advanced LeetCode Graph Problems",
            "description": "Solved BFS/DFS and topological sort coding challenges.",
            "hours_spent": 3.5,
            "completion_percentage": 100.0,
            "completed_at": now,
            "created_at": now
        },
        {
            "student_id": user_id,
            "activity_type": "project",
            "title": "Implemented Gradient Boosting Pipeline for Career Readiness",
            "description": "Trained and evaluated HistGradientBoostingRegressor on 5k student profile benchmark dataset.",
            "hours_spent": 6.0,
            "completion_percentage": 100.0,
            "completed_at": now,
            "created_at": now
        }
    ])

    print(f"[OK] Seeded demo user ({demo_email}) and profile successfully.")
    print("MongoDB database seeding complete.")


if __name__ == "__main__":
    asyncio.run(seed_database())
