from fastapi import APIRouter, Depends, HTTPException, status
import uuid
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.models.clinical import Consultation, ConsultationStatus
from app.models.user import User, Patient, UserRole
from app.schemas.clinical import NextQuestionResponse, AnswerSubmission, ConsultationProgress
from app.services.clinical_engine import ClinicalEngine
from app.providers.llm.mock import MockLLMProvider # In a real app, use a dependency injector for the provider

router = APIRouter()

# Dependency for clinical engine
def get_clinical_engine(db: AsyncSession = Depends(get_db)):
    # Task 3 requirement: Use mock provider to avoid real API keys
    llm_provider = MockLLMProvider()
    return ClinicalEngine(db=db, llm_provider=llm_provider)

class CreateConsultationRequest(BaseModel):
    patient_id: uuid.UUID
    pathway_id: str = "triage"

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_consultation(
    request: CreateConsultationRequest,
    db: AsyncSession = Depends(get_db),
    engine: ClinicalEngine = Depends(get_clinical_engine)
):
    # Ensure patient exists in the database
    patient = await db.get(Patient, request.patient_id)
    if not patient:
        user = User(
            id=uuid.uuid4(),
            email=f"kiosk_{request.patient_id}@medikiosk.local",
            password_hash="kiosk_anonymous",
            role=UserRole.patient,
            full_name="Kiosk Patient"
        )
        db.add(user)
        await db.flush()

        patient = Patient(
            id=request.patient_id,
            user_id=user.id
        )
        db.add(patient)
        await db.flush()

    consultation = Consultation(
        patient_id=request.patient_id,
        doctor_id=None,
        status=ConsultationStatus.intake
    )
    db.add(consultation)
    await db.flush() # flush to get the ID

    try:
        await engine.initialize_session(consultation.id, request.pathway_id)
        return {"consultation_id": consultation.id, "status": "created", "pathway": request.pathway_id}
    except ValueError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        await db.rollback()
        import logging
        logging.getLogger(__name__).error(f"Error creating consultation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{consultation_id}/next-question", response_model=NextQuestionResponse)
async def get_next_question(
    consultation_id: uuid.UUID,
    language: str = "en",
    engine: ClinicalEngine = Depends(get_clinical_engine)
):
    try:
        response = await engine.get_next_question(consultation_id, language)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error getting next question: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{consultation_id}/answers", status_code=status.HTTP_200_OK)
async def submit_answer(
    consultation_id: uuid.UUID,
    question_key: str,
    answer: AnswerSubmission,
    engine: ClinicalEngine = Depends(get_clinical_engine)
):
    try:
        await engine.process_answer(consultation_id, question_key, answer)
        return {"status": "success", "message": "Answer saved and rules evaluated"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error processing answer: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{consultation_id}/progress", response_model=ConsultationProgress)
async def get_progress(
    consultation_id: uuid.UUID,
    engine: ClinicalEngine = Depends(get_clinical_engine)
):
    try:
        progress = await engine.get_progress(consultation_id)
        return progress
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error getting progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{consultation_id}/summary")
async def get_consultation_summary(
    consultation_id: uuid.UUID,
    language: str = "en",
    engine: ClinicalEngine = Depends(get_clinical_engine)
):
    try:
        summary = await engine.get_summary(consultation_id, language=language)
        return summary
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error getting summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{consultation_id}/red-flags")
async def get_red_flags(
    consultation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select
    from app.models.clinical import RedFlag
    
    result = await db.execute(select(RedFlag).where(RedFlag.consultation_id == consultation_id))
    flags = result.scalars().all()
    
    return [
        {
            "id": str(f.id),
            "consultation_id": str(f.consultation_id),
            "rule_id": f.rule_id,
            "rule_name": f.rule_name,
            "severity": f.severity,
            "message": f.message,
            "triggered_by": f.triggered_by,
            "is_acknowledged": f.is_acknowledged,
            "created_at": f.created_at.isoformat() if f.created_at else None
        } for f in flags
    ]

@router.post("/{consultation_id}/complete", status_code=status.HTTP_200_OK)
async def complete_consultation(
    consultation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    consultation = await db.get(Consultation, consultation_id)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    if consultation.status == ConsultationStatus.submitted:
        return {"status": "success", "message": "Consultation already completed"}

    consultation.status = ConsultationStatus.submitted
    
    from datetime import datetime, timezone
    consultation.submitted_at = datetime.now(timezone.utc)
    
    await db.commit()
    return {"status": "success", "message": "Consultation marked as completed"}

@router.get("/{consultation_id}/ayush", response_model=Optional[dict])
async def get_ayush_assessment(
    consultation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select
    from app.models.clinical import AyushAssessment
    
    result = await db.execute(select(AyushAssessment).where(AyushAssessment.consultation_id == consultation_id))
    ayush = result.scalars().first()
    
    if not ayush:
        raise HTTPException(status_code=404, detail="AYUSH assessment not found")
        
    return {
        "id": str(ayush.id),
        "consultation_id": str(ayush.consultation_id),
        "prakriti": ayush.prakriti,
        "vikriti": ayush.vikriti,
        "sara": ayush.sara,
        "samhanana": ayush.samhanana,
        "pramana": ayush.pramana,
        "satmya": ayush.satmya,
        "sattva": ayush.sattva,
        "ahara_shakti": ayush.ahara_shakti,
        "vyayama_shakti": ayush.vyayama_shakti,
        "vaya": ayush.vaya,
        "ahara": ayush.ahara,
        "vihara": ayush.vihara,
        "additional_notes": ayush.additional_notes,
        "source": ayush.source.name if hasattr(ayush.source, "name") else str(ayush.source),
        "verification_status": ayush.verification_status.name if hasattr(ayush.verification_status, "name") else str(ayush.verification_status)
    }

@router.post("/{consultation_id}/ayush", status_code=status.HTTP_201_CREATED)
async def create_ayush_assessment(
    consultation_id: uuid.UUID,
    data: dict,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select
    from app.models.clinical import AyushAssessment, InfoSource
    
    # Check if exists
    result = await db.execute(select(AyushAssessment).where(AyushAssessment.consultation_id == consultation_id))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="AYUSH assessment already exists for this consultation")
        
    ayush = AyushAssessment(
        consultation_id=consultation_id,
        prakriti=data.get("prakriti"),
        vikriti=data.get("vikriti"),
        sara=data.get("sara"),
        samhanana=data.get("samhanana"),
        pramana=data.get("pramana"),
        satmya=data.get("satmya"),
        sattva=data.get("sattva"),
        ahara_shakti=data.get("ahara_shakti"),
        vyayama_shakti=data.get("vyayama_shakti"),
        vaya=data.get("vaya"),
        ahara=data.get("ahara"),
        vihara=data.get("vihara"),
        additional_notes=data.get("additional_notes"),
        source=InfoSource.patient_reported
    )
    
    db.add(ayush)
    await db.commit()
    await db.refresh(ayush)
    return {"id": str(ayush.id), "status": "success"}

@router.patch("/{consultation_id}/ayush", status_code=status.HTTP_200_OK)
async def update_ayush_assessment(
    consultation_id: uuid.UUID,
    data: dict,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select
    from app.models.clinical import AyushAssessment
    
    result = await db.execute(select(AyushAssessment).where(AyushAssessment.consultation_id == consultation_id))
    ayush = result.scalars().first()
    
    if not ayush:
        raise HTTPException(status_code=404, detail="AYUSH assessment not found")
        
    for key, value in data.items():
        if hasattr(ayush, key):
            setattr(ayush, key, value)
            
    await db.commit()
    return {"status": "success", "message": "Updated successfully"}
