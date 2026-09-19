"""
Skill2Career Database Seeder
Seeds skills taxonomy, career roles, assessment quizzes, model version metadata, and demo student profile.
"""

import os
import json
import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.database.session import engine, SessionLocal, Base
from backend.models.models import (
    User, StudentProfile, Skill, StudentSkill, CareerRole, CareerSkill,
    Assessment, AssessmentQuestion, ModelVersion, Project, Certification, LearningActivity
)
from backend.services.auth_service import get_password_hash

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "ml", "artifacts")


ASSESSMENT_DATA = [
    {
        "skill_id": "SK001",
        "title": "Python Core Proficiency Assessment",
        "difficulty": "Intermediate",
        "time_limit_mins": 10,
        "pass_score": 70.0,
        "questions": [
            {
                "question_text": "What is the time complexity of searching a key in a standard Python dictionary in average case?",
                "options_json": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
                "correct_option_index": 0,
                "explanation": "Python dictionaries use hash tables under the hood, yielding O(1) average lookup time."
            },
            {
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
        "time_limit_mins": 10,
        "pass_score": 70.0,
        "questions": [
            {
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
        "time_limit_mins": 12,
        "pass_score": 75.0,
        "questions": [
            {
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


def seed_database():
    print("\n--- Seeding Skill2Career Relational Database ---")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Skills
        skills_csv = os.path.join(DATA_DIR, "skills_taxonomies.csv")
        if os.path.exists(skills_csv):
            skills_df = pd.read_csv(skills_csv)
            for _, row in skills_df.iterrows():
                existing = db.query(Skill).filter(Skill.id == row["skill_id"]).first()
                if not existing:
                    skill = Skill(
                        id=row["skill_id"],
                        name=row["skill_name"],
                        category=row["category"],
                        domain=row["domain"],
                        description=row["description"],
                        aliases=str(row["aliases"]) if pd.notna(row["aliases"]) else ""
                    )
                    db.add(skill)
            db.commit()
            print(f"[OK] Seeded skills from {skills_csv}")

        # 2. Seed Career Roles & Career Skills
        careers_csv = os.path.join(DATA_DIR, "career_roles_skills.csv")
        if os.path.exists(careers_csv):
            careers_df = pd.read_csv(careers_csv)
            for _, row in careers_df.iterrows():
                existing_career = db.query(CareerRole).filter(CareerRole.id == row["career_id"]).first()
                if not existing_career:
                    career = CareerRole(
                        id=row["career_id"],
                        title=row["career_title"],
                        domain=row["domain"],
                        description=row["description"],
                        min_exp_years=float(row["min_exp_years"]),
                        avg_salary_usd=float(row["avg_salary_usd"])
                    )
                    db.add(career)
                    db.commit()

                    # Add required skills
                    req_skills = json.loads(row["required_skills_json"])
                    for req in req_skills:
                        cs = CareerSkill(
                            career_id=row["career_id"],
                            skill_id=req["skill_id"],
                            required_level=float(req["required_level"]),
                            importance_weight=float(req["importance"])
                        )
                        db.add(cs)
                    db.commit()
            print(f"[OK] Seeded career roles and skill mappings from {careers_csv}")

        # 3. Seed Assessments
        for asm_data in ASSESSMENT_DATA:
            existing_asm = db.query(Assessment).filter(Assessment.skill_id == asm_data["skill_id"]).first()
            if not existing_asm:
                asm = Assessment(
                    skill_id=asm_data["skill_id"],
                    title=asm_data["title"],
                    difficulty=asm_data["difficulty"],
                    time_limit_mins=asm_data["time_limit_mins"],
                    pass_score=asm_data["pass_score"]
                )
                db.add(asm)
                db.flush()

                for q in asm_data["questions"]:
                    question = AssessmentQuestion(
                        assessment_id=asm.id,
                        question_text=q["question_text"],
                        options_json=q["options_json"],
                        correct_option_index=q["correct_option_index"],
                        explanation=q["explanation"]
                    )
                    db.add(question)
                db.commit()
        print(f"[OK] Seeded interactive skill assessments.")

        # 4. Seed Model Version
        meta_file = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
        if os.path.exists(meta_file):
            with open(meta_file, "r") as f:
                meta = json.load(f)
                v_tag = meta.get("version_tag", "v1.0.0-initial")
                existing_v = db.query(ModelVersion).filter(ModelVersion.version_tag == v_tag).first()
                if not existing_v:
                    mv = ModelVersion(
                        model_name="Skill2Career Ensemble Predictor",
                        version_tag=v_tag,
                        algorithm=meta.get("readiness_model", {}).get("selected_algorithm", "HistGradientBoostingRegressor"),
                        metrics_json=meta.get("readiness_model", {}).get("best_metrics", {}),
                        features_json=meta.get("readiness_model", {}).get("features", []),
                        artifact_path="backend/ml/artifacts/readiness_pipeline.joblib",
                        is_active=True
                    )
                    db.add(mv)
                    db.commit()
                    print(f"[OK] Seeded active ML model version: {v_tag}")

        # 5. Seed Default Demo Student User
        demo_user = db.query(User).filter(User.email == "demo@skill2career.com").first()
        if not demo_user:
            demo_user = User(
                email="demo@skill2career.com",
                hashed_password=get_password_hash("Password123!"),
                full_name="Alex Chen",
                role="student"
            )
            db.add(demo_user)
            db.flush()

            profile = StudentProfile(
                user_id=demo_user.id,
                headline="Aspiring AI Engineer & Full-Stack Developer",
                bio="Passionate computer science student building intelligent web systems and learning distributed architectures.",
                degree="B.Tech Computer Science",
                institution="National Institute of Technology",
                institution_tier=1,
                graduation_year=2026,
                gpa=8.8,
                target_career_id="CR004",  # Machine Learning Engineer
                weekly_study_hours=16.0,
                learning_velocity_index=1.4
            )
            db.add(profile)
            db.flush()

            # Seed Student Skills for demo user
            initial_student_skills = [
                ("SK001", 4.0, True, "Self-Reported"),      # Python
                ("SK008", 3.5, True, "Assessment Quiz"),    # SQL
                ("SK009", 3.0, False, "Self-Reported"),     # React
                ("SK015", 3.5, True, "Self-Reported"),      # FastAPI
                ("SK026", 4.0, True, "Assessment Quiz"),    # Pandas & NumPy
                ("SK027", 3.5, True, "Assessment Quiz"),    # Scikit-Learn
                ("SK040", 3.5, True, "Self-Reported"),      # DSA
                ("SK043", 4.0, True, "Self-Reported"),      # Git
            ]
            for s_id, lvl, verified, src in initial_student_skills:
                ss = StudentSkill(
                    profile_id=profile.id,
                    skill_id=s_id,
                    proficiency_level=lvl,
                    is_verified=verified,
                    verification_source=src
                )
                db.add(ss)

            # Seed Demo Projects
            p1 = Project(
                profile_id=profile.id,
                title="Skill2Career AI Engine",
                description="Engineered skill-gap mapping and job-readiness forecasting pipeline using FastAPI and Scikit-Learn.",
                repo_url="https://github.com/namitha-koduru/Skill2Career",
                live_url="http://localhost:5173",
                tech_stack="Python, FastAPI, Scikit-Learn, React, TypeScript",
                complexity_rating=4.5
            )
            p2 = Project(
                profile_id=profile.id,
                title="Distributed Task Queue & Caching System",
                description="Constructed an asynchronous worker queue utilizing Redis and Python asyncio with real-time WebSocket updates.",
                repo_url="https://github.com/demo/distributed-task-queue",
                live_url="https://demo-tasks.io",
                tech_stack="Python, Redis, WebSockets, Docker",
                complexity_rating=4.0
            )
            db.add_all([p1, p2])

            # Seed Demo Certification
            c1 = Certification(
                profile_id=profile.id,
                name="TensorFlow Developer Certificate",
                issuer="DeepLearning.AI / Google",
                issue_date="2025-11",
                credential_url="https://coursera.org/verify/TF-12345",
                is_verified=True
            )
            db.add(c1)

            # Seed Demo Learning Activities
            a1 = LearningActivity(
                profile_id=profile.id,
                activity_type="practice",
                title="Completed 5 Advanced LeetCode Graph Problems",
                hours_spent=3.5
            )
            a2 = LearningActivity(
                profile_id=profile.id,
                activity_type="project",
                title="Implemented Gradient Boosting Pipeline for Career Readiness",
                hours_spent=6.0
            )
            db.add_all([a1, a2])

            db.commit()
            print("[OK] Seeded demo student user: demo@skill2career.com / Password123!")

        db.close()
        print("Database seeding completed successfully.")
    except Exception as e:
        db.rollback()
        db.close()
        print(f"[ERROR] Database seeding failed: {e}")
        raise e


if __name__ == "__main__":
    seed_database()
