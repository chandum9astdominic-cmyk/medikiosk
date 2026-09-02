from fastapi import APIRouter
from app.api.v1.routers import health, consultations, documents, doctor, patients, integrations

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(consultations.router, prefix="/consultations", tags=["consultations"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(doctor.router, prefix="/doctor", tags=["doctor"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
