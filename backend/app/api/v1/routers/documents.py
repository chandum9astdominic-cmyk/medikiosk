from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.document_service import DocumentService
from app.providers.storage.local import LocalStorageProvider
from app.providers.ocr.mock import MockOCRProvider
from app.services.document_extractor import DocumentExtractor
from app.schemas.document import (
    DocumentUploadResponse,
    DocumentResponse,
    DocumentOCRResponse,
    DocumentProcessingResponse,
    ExtractedEntityResponse,
)

router = APIRouter()

def get_document_service(db: AsyncSession = Depends(get_db)) -> DocumentService:
    return DocumentService(
        db=db,
        storage_provider=LocalStorageProvider(),
        ocr_provider=MockOCRProvider(),
        extractor=DocumentExtractor(),
    )

@router.post('/upload', response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    patient_id: uuid.UUID = Form(...),
    consultation_id: Optional[uuid.UUID] = Form(None),
    document_type: str = Form('other'),
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_document_service),
):
    try:
        content = await file.read()
        doc = await service.upload_document(
            patient_id=patient_id,
            filename=file.filename or 'uploaded_document',
            content=content,
            mime_type=file.content_type or 'application/octet-stream',
            document_type=document_type,
            consultation_id=consultation_id,
        )
        return DocumentUploadResponse(
            document_id=doc.id,
            patient_id=doc.patient_id,
            consultation_id=doc.consultation_id,
            document_type=doc.document_type.value,
            original_filename=doc.original_filename,
            stored_filename=doc.stored_filename,
            file_size_bytes=doc.file_size_bytes,
            mime_type=doc.mime_type,
            processing_status=doc.processing_status,
            uploaded_at=doc.uploaded_at,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail='Failed to upload document.') from exc

@router.get('/{document_id}', response_model=DocumentResponse)
async def get_document(document_id: uuid.UUID, service: DocumentService = Depends(get_document_service)):
    try:
        return await service.get_document(document_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

@router.get('/{document_id}/file')
async def get_document_file(document_id: uuid.UUID, service: DocumentService = Depends(get_document_service)):
    try:
        doc = await service.get_document_model(document_id)
        return FileResponse(path=doc.file_path, media_type=doc.mime_type, filename=doc.original_filename)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

@router.post('/{document_id}/process', response_model=DocumentProcessingResponse)
async def process_document(
    document_id: uuid.UUID,
    language: str = 'en',
    service: DocumentService = Depends(get_document_service),
):
    try:
        return await service.process_document(document_id, language=language)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail='OCR processing failed.') from exc

@router.get('/{document_id}/ocr', response_model=DocumentOCRResponse)
async def get_document_ocr(document_id: uuid.UUID, service: DocumentService = Depends(get_document_service)):
    try:
        return await service.get_document_ocr(document_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

@router.get('/{document_id}/entities', response_model=List[ExtractedEntityResponse])
async def get_document_entities(document_id: uuid.UUID, service: DocumentService = Depends(get_document_service)):
    try:
        return await service.get_document_entities(document_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

@router.get('/patient/{patient_id}', response_model=List[DocumentResponse])
async def get_patient_documents(patient_id: uuid.UUID, service: DocumentService = Depends(get_document_service)):
    return await service.get_patient_documents(patient_id)
