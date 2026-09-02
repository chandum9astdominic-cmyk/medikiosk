from datetime import datetime
from typing import Annotated, AsyncGenerator
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# Custom type for timestamp with timezone
timestamp = Annotated[
    datetime,
    mapped_column(DateTime(timezone=True), server_default=func.now())
]

class Base(DeclarativeBase):
    pass

import json
from pydantic import BaseModel

def _custom_json_serializer(obj):
    if isinstance(obj, BaseModel):
        return obj.model_dump()
    if hasattr(obj, "__dict__"):
        return obj.__dict__
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

def custom_json_dumps(obj):
    return json.dumps(obj, default=_custom_json_serializer)

engine = create_async_engine(settings.DATABASE_URL, json_serializer=custom_json_dumps, echo=False)
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

