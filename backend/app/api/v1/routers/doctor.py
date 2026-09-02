import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.summary_service import SummaryService
from app.schemas.summary import (
    DoctorQueueItem, DoctorConsultationSummary, EntityVerificationRequest
)
from app.models.clinical import VerificationStatus

router = APIRouter()

def get_summary_service(db: AsyncSession = Depends(get_db)):
    return SummaryService(db)

@router.get("/queue", response_model=List[DoctorQueueItem])
async def get_queue(
    service: SummaryService = Depends(get_summary_service)
):
    try:
        return await service.get_doctor_queue()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error getting queue: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/consultations/{consultation_id}/summary", response_model=DoctorConsultationSummary)
async def get_consultation_summary(
    consultation_id: uuid.UUID,
    service: SummaryService = Depends(get_summary_service)
):
    try:
        return await service.compile_consultation_summary(consultation_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error getting summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/entities/{entity_id}/verify", status_code=status.HTTP_200_OK)
async def verify_entity(
    entity_id: uuid.UUID,
    request: EntityVerificationRequest,
    is_answer: bool = Query(False, description="True if verifying a ClinicalAnswer, False if ClinicalEntity"),
    service: SummaryService = Depends(get_summary_service)
):
    try:
        v_status = VerificationStatus(request.verification_status)
        await service.verify_entity(entity_id, is_answer, v_status, request.edited_value)
        return {"status": "success", "message": "Entity verified"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error verifying entity: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/consultations/{consultation_id}/finalize", status_code=status.HTTP_200_OK)
async def finalize_consultation(
    consultation_id: uuid.UUID,
    service: SummaryService = Depends(get_summary_service)
):
    try:
        await service.finalize_consultation(consultation_id)
        return {"status": "success", "message": "Consultation finalized"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error finalizing consultation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
