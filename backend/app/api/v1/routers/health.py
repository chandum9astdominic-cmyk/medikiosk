from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

# Import engine and session factory if needed, or create a dependency.
# Assuming we will have a get_db dependency later, let's create a minimal one.
# For now, we will just use the engine from database.py directly or through a factory.

class HealthCheckResponse(BaseModel):
    status: str
    message: str
    database: str

router = APIRouter()

async def check_db_connection() -> bool:
    try:
        from sqlalchemy.ext.asyncio import create_async_engine
        from app.core.config import settings
        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        await engine.dispose()
        return True
    except Exception as e:
        return False

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Check if the API and Database are alive and responding.
    """
    db_ok = await check_db_connection()
    db_status = "ok" if db_ok else "error"
    overall_status = "ok" if db_ok else "degraded"
    
    return HealthCheckResponse(
        status=overall_status, 
        message="MediKiosk API is running",
        database=db_status
    )
