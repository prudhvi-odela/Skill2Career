"""
Skill2Career MongoDB Database Seeder
Idempotently seeds skills taxonomy, career roles, assessment quizzes, model version metadata, and demo student profile.
"""

import os
import json
import asyncio
from datetime import datetime, timezone, timedelta
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
    },
    {
        "skill_id": "SK008",
        "title": "SQL & Relational Database Architecture Assessment",
        "difficulty": "Intermediate",
        "time_limit_minutes": 10,
        "pass_score": 70.0,
        "is_active": True,
        "questions": [
            {
                "id": "Q_SQL_01",
                "question_text": "What is the primary difference between WHERE and HAVING clauses in SQL?",
                "options_json": [
                    "WHERE filters rows before aggregation; HAVING filters groups after aggregation",
                    "WHERE only works on strings; HAVING works on numbers",
                    "HAVING is executed before WHERE",
                    "There is no functional difference"
                ],
                "correct_option_index": 0,
                "explanation": "WHERE filters source rows before grouping; HAVING applies conditions to aggregated group rows."
            },
            {
                "id": "Q_SQL_02",
                "question_text": "Which index structure is standard in B-Tree indexed relational databases for range queries?",
                "options_json": [
                    "Hash Index",
                    "B+ Tree Index",
                    "Inverted Index",
                    "Bitmap Index"
                ],
                "correct_option_index": 1,
                "explanation": "B+ Trees maintain sorted leaf nodes linked sequentially, making range scans exceptionally fast."
            },
            {
                "id": "Q_SQL_03",
                "question_text": "What does ACID isolation level SERIALIZABLE prevent?",
                "options_json": [
                    "Dirty reads, non-repeatable reads, and phantom reads",
                    "Only database deadlocks",
                    "Syntax errors in SQL statements",
                    "Disk out-of-space errors"
                ],
                "correct_option_index": 0,
                "explanation": "SERIALIZABLE is the highest isolation level, completely preventing dirty reads, non-repeatable reads, and phantom reads."
            }
        ]
    },
    {
        "skill_id": "SK003",
        "title": "TypeScript Advanced Type Systems & Interfaces Assessment",
        "difficulty": "Intermediate",
        "time_limit_minutes": 10,
        "pass_score": 70.0,
        "is_active": True,
        "questions": [
            {
                "id": "Q_TS_01",
                "question_text": "What is the key difference between TypeScript `unknown` and `any` types?",
                "options_json": [
                    "`unknown` is type-safe because operations require type narrowing or assertions before use",
                    "`unknown` can only hold string values",
                    "`any` performs compile-time validation while `unknown` does not",
                    "`unknown` is deprecated in modern TypeScript"
                ],
                "correct_option_index": 0,
                "explanation": "`unknown` represents any value but disallows invoking methods or properties without explicit type guards."
            },
            {
                "id": "Q_TS_02",
                "question_text": "What does the utility type `Record<K, T>` construct?",
                "options_json": [
                    "An object type whose property keys are K and values are T",
                    "A tuple of fixed length K",
                    "An asynchronous Promise of T",
                    "A read-only array"
                ],
                "correct_option_index": 0,
                "explanation": "`Record<K, T>` constructs a key-value mapping type with keys in K and values of type T."
            }
        ]
    },
    {
        "skill_id": "SK034",
        "title": "Docker Containerization & Virtualization Assessment",
        "difficulty": "Intermediate",
        "time_limit_minutes": 10,
        "pass_score": 70.0,
        "is_active": True,
        "questions": [
            {
                "id": "Q_DCK_01",
                "question_text": "Why are multi-stage Docker builds recommended for production deployments?",
                "options_json": [
                    "They separate build dependencies from final runtime images, significantly reducing image size and attack surface",
                    "They allow running Windows containers on macOS",
                    "They disable Linux namespaces",
                    "They make containers bypass memory limits"
                ],
                "correct_option_index": 0,
                "explanation": "Multi-stage builds allow copying only production artifacts into lightweight base images, omitting SDKs and compiler tools."
            },
            {
                "id": "Q_DCK_02",
                "question_text": "What does the `CMD` instruction in a Dockerfile do?",
                "options_json": [
                    "Specifies default command and arguments executed when a container starts",
                    "Installs Linux packages during build time",
                    "Sets filesystem permissions",
                    "Exports host environment variables"
                ],
                "correct_option_index": 0,
                "explanation": "`CMD` provides default executable and arguments for starting a container."
            }
        ]
    },
    {
        "skill_id": "SK015",
        "title": "FastAPI Asynchronous Web Services Assessment",
        "difficulty": "Intermediate",
        "time_limit_minutes": 10,
        "pass_score": 70.0,
        "is_active": True,
        "questions": [
            {
                "id": "Q_FST_01",
                "question_text": "How does FastAPI handle synchronous (`def`) endpoint functions vs asynchronous (`async def`) functions?",
                "options_json": [
                    "Synchronous endpoints are run in an external thread pool so they don't block the async event loop",
                    "Synchronous endpoints always cause immediate 500 errors",
                    "FastAPI converts all sync functions into C extensions",
                    "Both execute identically on the main async event loop"
                ],
                "correct_option_index": 0,
                "explanation": "FastAPI runs regular `def` functions in AnyIO/Starlette threadpools to prevent blocking the async event loop."
            },
            {
                "id": "Q_FST_02",
                "question_text": "What mechanism does FastAPI use for dependency injection across route handlers?",
                "options_json": [
                    "`Depends()` decorator inside route function parameter defaults",
                    "Global singleton classes",
                    "Decorator factory `@injector`",
                    "Flask application context"
                ],
                "correct_option_index": 0,
                "explanation": "FastAPI uses `Depends()` as default parameter values to evaluate and inject reusable dependencies."
            }
        ]
    },
    {
        "skill_id": "SK040",
        "title": "Data Structures & Algorithmic Analysis Assessment",
        "difficulty": "Intermediate",
        "time_limit_minutes": 12,
        "pass_score": 70.0,
        "is_active": True,
        "questions": [
            {
                "id": "Q_DSA_01",
                "question_text": "What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black)?",
                "options_json": [
                    "O(log n)",
                    "O(n)",
                    "O(1)",
                    "O(n^2)"
                ],
                "correct_option_index": 0,
                "explanation": "Balanced binary search trees maintain height O(log n), ensuring worst-case search time of O(log n)."
            },
            {
                "id": "Q_DSA_02",
                "question_text": "Which data structure is typically used to implement Breadth-First Search (BFS) on a graph?",
                "options_json": [
                    "Queue (FIFO)",
                    "Stack (LIFO)",
                    "Priority Queue",
                    "Disjoint Set Union"
                ],
                "correct_option_index": 0,
                "explanation": "BFS traverses nodes level-by-level using a First-In-First-Out (FIFO) queue."
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

    # 6. Seed Market Intelligence Data Sources & Signals
    market_sources = [
        {
            "source_id": "SRC_BLS_2026",
            "source_name": "U.S. Bureau of Labor Statistics - Occupational Outlook 2026",
            "source_type": "government_statistics",
            "source_url": "https://www.bls.gov/ooh/computer-and-information-technology/",
            "provider": "U.S. Department of Labor",
            "retrieved_at": now.isoformat(),
            "coverage": "National / North America",
            "methodology": "Macroeconomic employment surveys and 10-year occupational projections.",
            "license": "Public Domain (U.S. Government Work)",
            "quality_level": "Tier-1 Authoritative"
        },
        {
            "source_id": "SRC_SO_DEV_2025",
            "source_name": "Global Developer Ecosystem & Skill Demand Index 2025-2026",
            "source_type": "industry_survey",
            "source_url": "https://survey.stackoverflow.co/2025/",
            "provider": "Stack Overflow & Industry Consortium",
            "retrieved_at": now.isoformat(),
            "coverage": "Global Technology Markets",
            "methodology": "Annual developer census analyzing tech stack popularity and hiring velocity (65,000+ respondents).",
            "license": "Open Data Commons Open Database License (ODbL)",
            "quality_level": "Tier-1 Authoritative"
        },
        {
            "source_id": "SRC_ONET_2026",
            "source_name": "O*NET Technical Competency Matrix 2026",
            "source_type": "occupational_taxonomy",
            "source_url": "https://www.onetcenter.org/",
            "provider": "U.S. Employment and Training Administration",
            "retrieved_at": now.isoformat(),
            "coverage": "Standard Occupational Classifications",
            "methodology": "Standardized skill requirement ratings across technical job families.",
            "license": "Creative Commons Attribution 4.0 International",
            "quality_level": "Tier-1 Authoritative"
        }
    ]

    for s in market_sources:
        await db.market_data_sources.update_one(
            {"source_id": s["source_id"]},
            {"$set": {**s, "updated_at": now}, "$setOnInsert": {"created_at": now}},
            upsert=True
        )

    # Seed Career Market Signals for CR001-CR010
    career_signals = [
        {"career_id": "CR001", "region": "Global", "demand_score": 92.5, "trend_direction": "growing", "sample_size": 42000, "source_id": "SRC_BLS_2026", "data_quality": "High", "notes": "High demand for full-stack engineers with TypeScript and cloud API proficiency."},
        {"career_id": "CR002", "region": "Global", "demand_score": 88.0, "trend_direction": "growing", "sample_size": 28000, "source_id": "SRC_SO_DEV_2025", "data_quality": "High", "notes": "Frontend modern framework demand remains robust; emphasis on Next.js and web performance."},
        {"career_id": "CR003", "region": "Global", "demand_score": 94.0, "trend_direction": "growing", "sample_size": 36000, "source_id": "SRC_BLS_2026", "data_quality": "High", "notes": "Distributed microservices, asynchronous Python/Go, and cloud datastores."},
        {"career_id": "CR004", "region": "Global", "demand_score": 97.5, "trend_direction": "growing", "sample_size": 31000, "source_id": "SRC_SO_DEV_2025", "data_quality": "High", "notes": "Massive market expansion in generative AI, MLOps, and scalable model serving."},
        {"career_id": "CR005", "region": "Global", "demand_score": 91.0, "trend_direction": "growing", "sample_size": 29000, "source_id": "SRC_BLS_2026", "data_quality": "High", "notes": "Predictive modeling, business analytics, and statistical programming."},
        {"career_id": "CR006", "region": "Global", "demand_score": 95.0, "trend_direction": "growing", "sample_size": 34000, "source_id": "SRC_BLS_2026", "data_quality": "High", "notes": "Kubernetes, CI/CD pipelines, Terraform, and cloud infrastructure automation."},
        {"career_id": "CR007", "region": "Global", "demand_score": 96.0, "trend_direction": "growing", "sample_size": 25000, "source_id": "SRC_BLS_2026", "data_quality": "High", "notes": "Zero trust architecture, AppSec, OWASP, and cloud compliance."},
        {"career_id": "CR008", "region": "Global", "demand_score": 85.0, "trend_direction": "stable", "sample_size": 18000, "source_id": "SRC_SO_DEV_2025", "data_quality": "High", "notes": "Cross-platform mobile frameworks and native mobile architectures."},
        {"career_id": "CR009", "region": "Global", "demand_score": 94.5, "trend_direction": "growing", "sample_size": 32000, "source_id": "SRC_BLS_2026", "data_quality": "High", "notes": "ETL orchestration, streaming data pipelines, modern data lakehouses."},
        {"career_id": "CR010", "region": "Global", "demand_score": 89.0, "trend_direction": "stable", "sample_size": 19000, "source_id": "SRC_ONET_2026", "data_quality": "High", "notes": "Embedded C/C++, Rust systems programming, and IoT hardware integration."}
    ]

    valid_until_str = "2027-03-01T00:00:00+00:00"
    for cs in career_signals:
        await db.career_market_signals.update_one(
            {"career_id": cs["career_id"], "region": cs["region"]},
            {
                "$set": {
                    **cs,
                    "retrieved_at": now.isoformat(),
                    "valid_until": valid_until_str,
                    "updated_at": now
                },
                "$setOnInsert": {"created_at": now}
            },
            upsert=True
        )

    # Seed Skill Market Signals for key skills
    skill_signals = [
        ("SK001", 96.0, "growing", 55000, "SRC_SO_DEV_2025", "Python: #1 language for AI, data science, and backend APIs."),
        ("SK002", 95.0, "stable", 58000, "SRC_SO_DEV_2025", "JavaScript: Ubiquitous web standard across all frontend and fullstack roles."),
        ("SK003", 94.0, "growing", 48000, "SRC_SO_DEV_2025", "TypeScript: Dominant type-safe language for enterprise frontend and Node backends."),
        ("SK004", 88.0, "stable", 42000, "SRC_BLS_2026", "Java: Enterprise foundation in banking, fintech, and microservices."),
        ("SK005", 86.0, "stable", 32000, "SRC_ONET_2026", "C++: High-performance systems, game engines, and low-latency financial systems."),
        ("SK006", 91.0, "growing", 36000, "SRC_SO_DEV_2025", "Go: Standard for cloud-native infrastructure, Docker/Kubernetes tooling, and networking."),
        ("SK007", 93.0, "growing", 28000, "SRC_SO_DEV_2025", "Rust: High-growth memory-safe systems programming language."),
        ("SK008", 95.5, "stable", 60000, "SRC_BLS_2026", "SQL: Mandatory core requirement across 90%+ of all technical job roles."),
        ("SK009", 94.0, "growing", 52000, "SRC_SO_DEV_2025", "React: Leading component library for modern user interfaces."),
        ("SK011", 90.0, "growing", 35000, "SRC_SO_DEV_2025", "Next.js: Top fullstack React framework for SSR, SSG, and edge routing."),
        ("SK015", 92.0, "growing", 38000, "SRC_SO_DEV_2025", "FastAPI: Fastest-growing modern Python framework for high-throughput microservices."),
        ("SK021", 93.0, "growing", 44000, "SRC_SO_DEV_2025", "PostgreSQL: Preferred relational database for modern application architectures."),
        ("SK023", 89.0, "growing", 40000, "SRC_SO_DEV_2025", "MongoDB: Standard distributed document NoSQL database for flexible schemas."),
        ("SK026", 92.0, "growing", 42000, "SRC_BLS_2026", "Pandas & NumPy: Foundational data processing libraries in Python."),
        ("SK027", 93.5, "growing", 40000, "SRC_BLS_2026", "Scikit-Learn: Standard for classical machine learning and data modeling pipelines."),
        ("SK028", 96.0, "growing", 38000, "SRC_SO_DEV_2025", "PyTorch: #1 deep learning and generative AI research framework."),
        ("SK032", 98.0, "growing", 45000, "SRC_SO_DEV_2025", "LLMs & RAG Architecture: Highest growth technology area across all software sectors."),
        ("SK033", 94.5, "growing", 32000, "SRC_BLS_2026", "MLOps & Model Deployment: High demand for operationalizing and monitoring ML in production."),
        ("SK034", 95.0, "stable", 54000, "SRC_SO_DEV_2026", "Docker: Essential containerization standard across all modern teams."),
        ("SK035", 94.0, "growing", 41000, "SRC_BLS_2026", "Kubernetes: Container orchestration standard for cloud-scale applications."),
        ("SK036", 95.0, "growing", 50000, "SRC_BLS_2026", "AWS: Leading public cloud platform requirement."),
        ("SK038", 93.0, "growing", 46000, "SRC_SO_DEV_2025", "CI/CD Pipelines: Continuous integration and automated release workflows."),
        ("SK040", 97.0, "stable", 62000, "SRC_ONET_2026", "Data Structures & Algorithms: Universal benchmark for software engineering evaluation."),
        ("SK041", 96.0, "growing", 48000, "SRC_ONET_2026", "System Design & Architecture: Key evaluation metric for scalable distributed engineering."),
        ("SK045", 94.0, "growing", 36000, "SRC_BLS_2026", "Web Security & OWASP: Critical application security posture across all web engineering.")
    ]

    for sk_id, d_score, trend, s_size, src_id, notes in skill_signals:
        await db.skill_market_signals.update_one(
            {"skill_id": sk_id, "region": "Global"},
            {
                "$set": {
                    "skill_id": sk_id,
                    "region": "Global",
                    "demand_score": d_score,
                    "trend_direction": trend,
                    "sample_size": s_size,
                    "source_id": src_id,
                    "retrieved_at": now.isoformat(),
                    "valid_until": valid_until_str,
                    "data_quality": "High",
                    "notes": notes,
                    "updated_at": now
                },
                "$setOnInsert": {"created_at": now}
            },
            upsert=True
        )

    # 7. Seed Canonical Skill Dependencies (Acyclic Graph)
    skill_dependencies_seed = [
        ("DEP_001", "SK015", "SK001", "PREREQUISITE", 1.0, "Core Python required for FastAPI microservices"),
        ("DEP_002", "SK017", "SK001", "PREREQUISITE", 1.0, "Core Python required for Django web framework"),
        ("DEP_003", "SK026", "SK001", "PREREQUISITE", 1.0, "Core Python required for Pandas & NumPy data structures"),
        ("DEP_004", "SK027", "SK026", "PREREQUISITE", 0.9, "Pandas & NumPy required for Scikit-Learn data modeling"),
        ("DEP_005", "SK028", "SK001", "PREREQUISITE", 0.9, "Python fundamentals required for PyTorch neural architectures"),
        ("DEP_006", "SK033", "SK027", "PREREQUISITE", 0.8, "Scikit-Learn modeling pipelines required for MLOps deployment"),
        ("DEP_007", "SK032", "SK028", "PREREQUISITE", 0.9, "PyTorch & vector ops required for LLMs & RAG architectures"),
        ("DEP_008", "SK030", "SK028", "SUPPORTING", 0.8, "PyTorch supports Natural Language Processing specializations"),
        ("DEP_009", "SK031", "SK028", "SUPPORTING", 0.8, "PyTorch supports Computer Vision image pipelines"),
        ("DEP_010", "SK003", "SK002", "PREREQUISITE", 0.9, "JavaScript required for TypeScript type safety"),
        ("DEP_011", "SK016", "SK002", "PREREQUISITE", 1.0, "JavaScript runtime required for Node.js & Express"),
        ("DEP_012", "SK009", "SK012", "PREREQUISITE", 0.9, "HTML5/CSS3 required for React declarative component UI"),
        ("DEP_013", "SK009", "SK002", "PREREQUISITE", 1.0, "JavaScript syntax required for React state hooks"),
        ("DEP_014", "SK011", "SK009", "PREREQUISITE", 1.0, "React component mastery required for Next.js fullstack SSR"),
        ("DEP_015", "SK014", "SK009", "SUPPORTING", 0.8, "React context/props knowledge required for Redux state store"),
        ("DEP_016", "SK021", "SK008", "PREREQUISITE", 1.0, "ANSI SQL syntax required for advanced PostgreSQL queries"),
        ("DEP_017", "SK022", "SK008", "PREREQUISITE", 1.0, "SQL fundamentals required for MySQL database operations"),
        ("DEP_018", "SK034", "SK039", "SUPPORTING", 0.8, "Linux shell scripting supports Docker container virtualization"),
        ("DEP_019", "SK035", "SK034", "PREREQUISITE", 1.0, "Docker containerization required for Kubernetes orchestration"),
        ("DEP_020", "SK038", "SK034", "SUPPORTING", 0.8, "Docker container builds support CI/CD pipeline automation"),
        ("DEP_021", "SK035", "SK036", "SUPPORTING", 0.7, "AWS Cloud IAM/VPC knowledge supports cloud Kubernetes deployment"),
        ("DEP_022", "SK041", "SK040", "PREREQUISITE", 0.9, "Data Structures & Algorithms required for System Design & Architecture"),
        ("DEP_023", "SK041", "SK042", "PREREQUISITE", 0.9, "Object-Oriented Design patterns required for System Architecture"),
        ("DEP_024", "SK045", "SK019", "SUPPORTING", 0.8, "RESTful API design principles support Web Security & OWASP audits")
    ]

    for dep_id, sk_id, prereq_id, dep_type, strength, src_desc in skill_dependencies_seed:
        await db.skill_dependencies.update_one(
            {"skill_id": sk_id, "prerequisite_skill_id": prereq_id},
            {
                "$set": {
                    "dependency_id": dep_id,
                    "skill_id": sk_id,
                    "prerequisite_skill_id": prereq_id,
                    "dependency_type": dep_type,
                    "strength": strength,
                    "source": src_desc,
                    "updated_at": now
                },
                "$setOnInsert": {"created_at": now}
            },
            upsert=True
        )

    # 8. Seed Initial Skill Evidence for Demo Student (Phase 09A)
    from backend.services.evidence_service import EvidenceService
    ev_svc = EvidenceService()
    ev_count = await ev_svc.sync_student_artifacts_to_evidence(student_id=user_id, db=db)

    # 9. Seed Longitudinal Learning Snapshots (Phase 09B)
    demo_snapshots = [
        {
            "student_id": user_id,
            "snapshot_date": (now - timedelta(days=28)).isoformat(),
            "skill_count": 6,
            "verified_skill_count": 1,
            "average_proficiency": 2.2,
            "target_career_id": "CR001",
            "projects_count": 1,
            "assessments_count": 1,
            "certifications_count": 0,
            "learning_activity_count": 2,
            "verified_evidence_count": 1,
            "readiness_score": 45.0,
            "skills_state": [
                {"skill_id": "SK001", "name": "Python", "level": 2.5, "verified": False},
                {"skill_id": "SK002", "name": "JavaScript", "level": 2.0, "verified": False},
                {"skill_id": "SK004", "name": "React", "level": 2.0, "verified": False},
                {"skill_id": "SK008", "name": "SQL", "level": 2.0, "verified": False},
                {"skill_id": "SK015", "name": "FastAPI", "level": 2.0, "verified": False},
                {"skill_id": "SK034", "name": "Docker", "level": 2.5, "verified": True}
            ],
            "snapshot_source": "learning_intelligence_engine",
            "created_at": (now - timedelta(days=28)).isoformat()
        },
        {
            "student_id": user_id,
            "snapshot_date": (now - timedelta(days=14)).isoformat(),
            "skill_count": 7,
            "verified_skill_count": 3,
            "average_proficiency": 3.1,
            "target_career_id": "CR001",
            "projects_count": 2,
            "assessments_count": 2,
            "certifications_count": 1,
            "learning_activity_count": 6,
            "verified_evidence_count": 3,
            "readiness_score": 62.0,
            "skills_state": [
                {"skill_id": "SK001", "name": "Python", "level": 3.5, "verified": True},
                {"skill_id": "SK002", "name": "JavaScript", "level": 2.8, "verified": False},
                {"skill_id": "SK003", "name": "TypeScript", "level": 3.0, "verified": False},
                {"skill_id": "SK004", "name": "React", "level": 3.0, "verified": False},
                {"skill_id": "SK008", "name": "SQL", "level": 3.2, "verified": True},
                {"skill_id": "SK015", "name": "FastAPI", "level": 3.0, "verified": False},
                {"skill_id": "SK034", "name": "Docker", "level": 3.0, "verified": True}
            ],
            "snapshot_source": "learning_intelligence_engine",
            "created_at": (now - timedelta(days=14)).isoformat()
        },
        {
            "student_id": user_id,
            "snapshot_date": now.isoformat(),
            "skill_count": 8,
            "verified_skill_count": 5,
            "average_proficiency": 3.8,
            "target_career_id": "CR001",
            "projects_count": 3,
            "assessments_count": 3,
            "certifications_count": 1,
            "learning_activity_count": 10,
            "verified_evidence_count": 5,
            "readiness_score": 78.5,
            "skills_state": [
                {"skill_id": "SK001", "name": "Python", "level": 4.2, "verified": True},
                {"skill_id": "SK002", "name": "JavaScript", "level": 3.5, "verified": False},
                {"skill_id": "SK003", "name": "TypeScript", "level": 3.8, "verified": True},
                {"skill_id": "SK004", "name": "React", "level": 3.5, "verified": False},
                {"skill_id": "SK008", "name": "SQL", "level": 4.0, "verified": True},
                {"skill_id": "SK015", "name": "FastAPI", "level": 3.8, "verified": True},
                {"skill_id": "SK034", "name": "Docker", "level": 3.5, "verified": True},
                {"skill_id": "SK035", "name": "Kubernetes", "level": 3.0, "verified": False}
            ],
            "snapshot_source": "learning_intelligence_engine",
            "created_at": now.isoformat()
        }
    ]

    await db.learning_snapshots.delete_many({"student_id": user_id})
    await db.learning_snapshots.insert_many(demo_snapshots)

    # 10. Seed Demo Assessment Results
    await db.assessment_results.delete_many({"student_id": user_id})
    await db.assessment_results.insert_many([
        {
            "student_id": user_id,
            "assessment_id": "SK001",
            "skill_id": "SK001",
            "score": 100.0,
            "passed": True,
            "answers": {"Q_PY_01": 0, "Q_PY_02": 1, "Q_PY_03": 1, "Q_PY_04": 1},
            "completed_at": now - timedelta(days=12)
        },
        {
            "student_id": user_id,
            "assessment_id": "SK027",
            "skill_id": "SK027",
            "score": 100.0,
            "passed": True,
            "answers": {"Q_ML_01": 1, "Q_ML_02": 1, "Q_ML_03": 1},
            "completed_at": now - timedelta(days=3)
        }
    ])

    # 11. Seed Initial Adaptive Roadmaps (Phase 08)
    try:
        from backend.services.adaptive_roadmap_service import AdaptiveRoadmapService
        roadmap_svc = AdaptiveRoadmapService()
        await roadmap_svc.generate_or_get_adaptive_roadmap(student_id=user_id, target_career_id="CR004", db=db, force_regenerate=True)
        await roadmap_svc.generate_or_get_adaptive_roadmap(student_id=user_id, target_career_id="CR001", db=db, force_regenerate=True)
        print("[OK] Generated initial active adaptive roadmaps for CR004 and CR001.")
    except Exception as e:
        print(f"[Warn] Roadmap seed skip: {e}")

    # 12. Seed Initial Career Forecast (Phase 10)
    try:
        from backend.services.career_forecast_service import CareerForecastService
        forecast_svc = CareerForecastService()
        await forecast_svc.generate_career_forecast(student_id=user_id, career_id="CR004", horizon_days=90, db=db)
        print("[OK] Seeded initial career forecast calculation for CR004 (90-day horizon).")
    except Exception as e:
        print(f"[Warn] Forecast seed skip: {e}")

    # 13. Seed Initial Career Transition Plan (Phase 11)
    try:
        from backend.services.career_transition_service import CareerTransitionService
        trans_svc = CareerTransitionService()
        await trans_svc.analyze_transition(student_id=user_id, target_career_id="CR004", source_career_id="CR001", db=db, persist=True)
        print("[OK] Seeded initial career transition plan (CR001 -> CR004).")
    except Exception as e:
        print(f"[Warn] Transition plan seed skip: {e}")

    print(f"[OK] Seeded demo user ({demo_email}) and profile successfully.")
    print(f"[OK] Seeded {len(market_sources)} market data sources, {len(career_signals)} career signals, and {len(skill_signals)} skill signals.")
    print(f"[OK] Seeded {len(skill_dependencies_seed)} canonical skill dependencies.")
    print(f"[OK] Seeded {ev_count} initial verified skill evidence records.")
    print(f"[OK] Seeded {len(demo_snapshots)} longitudinal learning snapshots.")
    print("MongoDB database seeding complete.")


if __name__ == "__main__":
    asyncio.run(seed_database())

