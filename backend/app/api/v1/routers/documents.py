from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
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
    storage = LocalStorageProvider()
    ocr = MockOCRProvider()
    extractor = DocumentExtractor()
    return DocumentService(db=db, storage_provider=storage, ocr_provider=ocr, extractor=extractor)

@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    patient_id: uuid.UUID = Form(...),
    consultation_id: Optional[uuid.UUID] = Form(None),
    document_type: str = Form("other"),
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_document_service)
):
    """
    Upload a medical document (Prescription, Lab Report, Discharge Summary).
    Safely stores the document and records its metadata.
    """
    try:
        content = await file.read()
        doc = await service.upload_document(
            patient_id=patient_id,
            filename=file.filename or "uploaded_document",
            content=content,
            mime_type=file.content_type or "application/octet-stream",
            document_type=document_type,
            consultation_id=consultation_id
        )
        from datetime import datetime, timezone
        return DocumentUploadResponse(
            document_id=doc.id,
            patient_id=doc.patient_id,
            consultation_id=doc.consultation_id,
            document_type=doc.document_type.value if hasattr(doc.document_type, "value") else str(doc.document_type),
            original_filename=doc.original_filename,
            stored_filename=doc.stored_filename,
            file_size_bytes=doc.file_size_bytes,
            mime_type=doc.mime_type,
            processing_status=doc.processing_status,
            uploaded_at=doc.uploaded_at or datetime.now(timezone.utc)
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload document.")

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    service: DocumentService = Depends(get_document_service)
):
    """Fetch document metadata, status, and entity counts."""
    try:
        return await service.get_document(document_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/{document_id}/process", response_model=DocumentProcessingResponse)
async def process_document(
    document_id: uuid.UUID,
    language: str = "en",
    service: DocumentService = Depends(get_document_service)
):
    """
    Trigger OCR extraction and clinical entity parsing on an uploaded document.
    """
    try:
        return await service.process_document(document_id, language=language)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"OCR processing failed: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="OCR processing failed.")

@router.get("/{document_id}/ocr", response_model=DocumentOCRResponse)
async def get_document_ocr(
    document_id: uuid.UUID,
    service: DocumentService = Depends(get_document_service)
):
    """Retrieve raw OCR text output and confidence."""
    try:
        return await service.get_document_ocr(document_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/{document_id}/entities", response_model=List[ExtractedEntityResponse])
async def get_document_entities(
    document_id: uuid.UUID,
    service: DocumentService = Depends(get_document_service)
):
    """Retrieve all structured clinical entities extracted from the document."""
    try:
        return await service.get_document_entities(document_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/patient/{patient_id}", response_model=List[DocumentResponse])
async def get_patient_documents(
    patient_id: uuid.UUID,
    service: DocumentService = Depends(get_document_service)
):
    """List all documents uploaded for a specific patient."""
    try:
        return await service.get_patient_documents(patient_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
