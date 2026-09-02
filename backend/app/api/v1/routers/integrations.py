from fastapi import APIRouter, Depends, HTTPException, status
import uuid
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.user import Patient
from app.models.clinical import Consultation, ClinicalAnswer, RedFlag
from app.models.document import Document, ClinicalEntity
from app.providers.integrations.abha import MockABHAAdapter
from app.providers.integrations.fhir import MockFHIRAdapter

router = APIRouter()

# --- MOCK ABHA ---
@router.post("/abha/mock/link")
async def link_mock_abha(
    patient_id: uuid.UUID,
    abha_number: str,
    db: AsyncSession = Depends(get_db)
):
    """
    DEMO / MOCK - No live ABDM connection.
    Links a mock ABHA ID to a patient.
    """
    patient = await db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    adapter = MockABHAAdapter()
    result = await adapter.link_abha(str(patient_id), abha_number)
    
    if result.get("status") == "success":
        patient.abha_id = abha_number
        await db.commit()
        
    return result

# --- MOCK FHIR ---
@router.get("/fhir/mock/{consultation_id}")
async def get_mock_fhir(
    consultation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    FHIR DEMO / MOCK.
    Generates a mock FHIR bundle from verified/available consultation data.
    """
    # 1. Fetch Consultation & Patient
    consultation = await db.get(Consultation, consultation_id)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
        
    patient = await db.get(Patient, consultation.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # 2. Fetch Answers, Entities, Documents
    answers = (await db.execute(select(ClinicalAnswer).where(ClinicalAnswer.consultation_id == consultation_id))).scalars().all()
    documents = (await db.execute(select(Document).where(Document.consultation_id == consultation_id))).scalars().all()
    entities = []
    for doc in documents:
        doc_entities = (await db.execute(select(ClinicalEntity).where(ClinicalEntity.document_id == doc.id))).scalars().all()
        entities.extend(doc_entities)
        
    # 3. Use adapter to generate FHIR
    adapter = MockFHIRAdapter()
    fhir_bundle = adapter.generate_bundle(patient, consultation, answers, documents, entities)
    
    return fhir_bundle
