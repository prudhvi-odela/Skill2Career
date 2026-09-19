"""
Skill2Career - FastAPI Backend Entrypoint (MongoDB Edition)
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database.mongodb import connect_to_mongo, close_mongo_connection, get_db
from backend.database.indexes import ensure_indexes
from backend.database.seed import seed_database
from backend.routers import (
    auth_router,
    student_router,
    careers_router,
    analysis_router,
    roadmap_router,
    assessment_router,
    ml_admin_router,
    ai_router,
    market_router,
    recommendation_router
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to MongoDB, ensure indexes, seed initial data
    try:
        db = await connect_to_mongo()
        await ensure_indexes(db)
        await seed_database()
    except Exception as e:
        print(f"[Lifespan Startup Error]: {e}")
    yield
    # Shutdown: close MongoDB connection
    await close_mongo_connection()


app = FastAPI(
    title="Skill2Career API",
    description="Skill-Gap-to-Career-Mapping Engine and Future Job-Readiness Predictor (MongoDB Powered)",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(student_router.router, prefix=settings.API_V1_STR)
app.include_router(careers_router.router, prefix=settings.API_V1_STR)
app.include_router(analysis_router.router, prefix=settings.API_V1_STR)
app.include_router(roadmap_router.router, prefix=settings.API_V1_STR)
app.include_router(assessment_router.router, prefix=settings.API_V1_STR)
app.include_router(ml_admin_router.router, prefix=settings.API_V1_STR)
app.include_router(ai_router.router, prefix=settings.API_V1_STR)
app.include_router(market_router.router, prefix=settings.API_V1_STR)
app.include_router(recommendation_router.router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "app": "Skill2Career API",
        "status": "online",
        "version": "2.0.0",
        "database": "MongoDB",
        "docs_url": "/docs"
    }


@app.get("/api/health")
async def health_check():
    db = await get_db()
    try:
        await db.command("ping")
        db_status = "MongoDB connected (healthy)"
    except Exception as e:
        db_status = f"MongoDB connection error: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "ml_models": "loaded"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
