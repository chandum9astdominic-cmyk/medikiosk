import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.document import DocumentTimelineResponse
from app.services.document_timeline import DocumentTimelineService

router = APIRouter()

@router.get('/{patient_id}', response_model=DocumentTimelineResponse)
async def get_patient_document_timeline(
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Return the patient's documents ordered by clinical document date."""
    try:
        return await DocumentTimelineService(db).timeline(patient_id)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Unable to build patient document timeline.',
        ) from exc
