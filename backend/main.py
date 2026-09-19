"""
Skill2Career - FastAPI Backend Entrypoint
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database.session import engine, Base
from backend.database.seed import seed_database
from backend.routers import (
    auth_router,
    student_router,
    careers_router,
    analysis_router,
    roadmap_router,
    assessment_router,
    ml_admin_router
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables & seed if empty
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"[Lifespan Notice] Seed check: {e}")
    yield


app = FastAPI(
    title="Skill2Career API",
    description="Skill-Gap-to-Career-Mapping Engine and Future Job-Readiness Predictor",
    version="1.0.0",
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


@app.get("/")
def root():
    return {
        "app": "Skill2Career API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_models": "loaded"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
