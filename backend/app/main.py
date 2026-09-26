import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timezone

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("aiia_ctms")


from app.core.event_subscribers import register_domain_subscribers


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AIIA CTMS Platform & verifying database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized successfully.")
    try:
        from app.core.database import SessionLocal
        from app.models.identity import User
        db = SessionLocal()
        if db.query(User).count() == 0:
            logger.info("No users found in database. Running initial database seeding...")
            from scripts.seed_roles_and_users import seed as seed_users
            from scripts.seed_flagship_study import seed_flagship_study
            seed_users()
            seed_flagship_study()
            logger.info("Initial database seeding completed.")
        db.close()
    except Exception as e:
        logger.warning(f"Auto-seeding check notice: {e}")
    register_domain_subscribers()
    yield
    logger.info("AIIA CTMS Platform shutting down cleanly.")


register_domain_subscribers()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AIIA Clinical Research Intelligence, Compliance & Trial Management Platform (SIH 2026 PS-46)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception: {str(exc)} at {request.url}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": {
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected system error occurred. Please contact the platform administrator.",
                "path": str(request.url.path),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }
    )


@app.get("/health", tags=["Health"])
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# Mount API Router
app.include_router(api_router, prefix=settings.API_V1_STR)
