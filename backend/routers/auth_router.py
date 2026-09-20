"""
Skill2Career Auth Router (MongoDB Async)
Endpoints for student registration, login, and current authenticated user retrieval.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from backend.database.mongodb import get_db, get_utc_now, serialize_doc
from backend.schemas.schemas import UserRegister, UserLogin, Token
from backend.services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncDatabase = Depends(get_db)):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    now = get_utc_now()
    user_doc = {
        "email": payload.email.lower(),
        "hashed_password": get_password_hash(payload.password),
        "full_name": payload.full_name,
        "role": payload.role or "student",
        "is_active": True,
        "created_at": now,
        "updated_at": now
    }
    user_res = await db.users.insert_one(user_doc)
    user_id = str(user_res.inserted_id)

    # Create associated clean empty student profile in MongoDB
    profile_doc = {
        "user_id": user_id,
        "headline": "",
        "bio": "",
        "degree": None,
        "institution": None,
        "institution_tier": None,
        "graduation_year": None,
        "gpa": None,
        "target_career_id": None,
        "target_career_title": None,
        "skills": [],
        "statistics": {
            "weekly_study_hours": 0.0,
            "learning_velocity_index": 0.0,
            "assessments_passed": 0,
            "projects_count": 0,
            "certifications_count": 0
        },
        "created_at": now,
        "updated_at": now
    }
    prof_res = await db.student_profiles.insert_one(profile_doc)

    access_token = create_access_token(data={"sub": user_id, "email": payload.email.lower(), "role": payload.role or "student"})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": payload.email.lower(),
            "full_name": payload.full_name,
            "role": payload.role or "student",
            "profile_id": str(prof_res.inserted_id)
        }
    }


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncDatabase = Depends(get_db)):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(user["_id"])
    profile = await db.student_profiles.find_one({"user_id": user_id})
    profile_id = str(profile["_id"]) if profile else None

    access_token = create_access_token(data={"sub": user_id, "email": user["email"], "role": user.get("role", "student")})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user["email"],
            "full_name": user.get("full_name", ""),
            "role": user.get("role", "student"),
            "profile_id": profile_id
        }
    }


@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncDatabase = Depends(get_db)
):
    user_id = current_user["id"]
    profile = await db.student_profiles.find_one({"user_id": user_id})
    return {
        "id": user_id,
        "email": current_user["email"],
        "full_name": current_user.get("full_name", ""),
        "role": current_user.get("role", "student"),
        "profile_id": str(profile["_id"]) if profile else None,
        "target_career_id": profile.get("target_career_id") if profile else None
    }
