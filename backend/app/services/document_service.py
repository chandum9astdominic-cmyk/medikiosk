import os
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.document import Document, DocumentType, ExtractedEntity, ClinicalEntity
from app.models.clinical import Consultation, InfoSource, VerificationStatus
from app.models.user import Patient
from app.providers.storage.base import BaseStorageProvider
from app.providers.storage.local import LocalStorageProvider
from app.providers.ocr.base import BaseOCRProvider
from app.providers.ocr.mock import MockOCRProvider
from app.services.document_extractor import DocumentExtractor, ExtractedEntityData
from app.schemas.document import DocumentUploadResponse, DocumentResponse, ExtractedEntityResponse, DocumentProcessingResponse, DocumentOCRResponse

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/tiff": ".tiff",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

class DocumentService:
    """
    Service managing document lifecycle, storage, OCR processing, and clinical entity extraction.
    """

    def __init__(
        self,
        db: AsyncSession,
        storage_provider: Optional[BaseStorageProvider] = None,
        ocr_provider: Optional[BaseOCRProvider] = None,
        extractor: Optional[DocumentExtractor] = None,
    ):
        self.db = db
        self.storage = storage_provider or LocalStorageProvider()
        self.ocr = ocr_provider or MockOCRProvider()
        self.extractor = extractor or DocumentExtractor()

    async def upload_document(
        self,
        patient_id: uuid.UUID,
        filename: str,
        content: bytes,
        mime_type: str,
        document_type: str = "other",
        consultation_id: Optional[uuid.UUID] = None,
    ) -> Document:
        """Validate, store, and record an uploaded medical document."""
        # 1. Validation
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise ValueError(f"File size exceeds maximum permitted limit of {MAX_FILE_SIZE_BYTES // (1024*1024)}MB")

        # Sanitize mime type / extension
        clean_mime = mime_type.lower().split(";")[0].strip()
        if clean_mime not in ALLOWED_MIME_TYPES:
            # Fallback check on extension
            ext = os.path.splitext(filename)[1].lower()
            if ext not in ALLOWED_MIME_TYPES.values():
                raise ValueError(f"Unsupported file type: {mime_type}. Allowed types: PDF, PNG, JPEG, TIFF.")

        # Verify patient exists (or create demo patient mapping if missing in dev)
        patient = await self.db.get(Patient, patient_id)
        if not patient:
            # In development/test mode, patient might be synthetic UUID
            logger.info(f"Patient {patient_id} not explicitly found in DB; continuing with foreign key reference.")

        # Map document_type enum
        try:
            doc_type_enum = DocumentType(document_type.lower())
        except ValueError:
            doc_type_enum = DocumentType.other

        # 2. Safe file storage
        file_uuid = uuid.uuid4()
        clean_basename = os.path.basename(filename).replace(" ", "_")
        stored_filename = f"{file_uuid}_{clean_basename}"
        
        saved_path = await self.storage.save_file(stored_filename, content)

        # 3. Create Database Record
        doc = Document(
            id=file_uuid,
            patient_id=patient_id,
            consultation_id=consultation_id,
            document_type=doc_type_enum,
            original_filename=filename,
            stored_filename=stored_filename,
            file_path=saved_path,
            file_size_bytes=len(content),
            mime_type=clean_mime,
            processing_status="uploaded",
            ocr_completed=False,
        )

        self.db.add(doc)
        await self.db.commit()
        await self.db.refresh(doc)
        return doc

    async def process_document(
        self,
        document_id: uuid.UUID,
        language: str = "en"
    ) -> DocumentProcessingResponse:
        """
        Execute OCR processing and clinical entity extraction on an uploaded document.
        """
        doc = await self.db.get(Document, document_id)
        if not doc:
            raise ValueError(f"Document {document_id} not found")

        doc.processing_status = "processing"
        await self.db.commit()

        try:
            # 1. OCR Extraction
            ocr_result = await self.ocr.process_document(doc.file_path, language=language)
            doc.ocr_text = ocr_result.raw_text
            doc.ocr_completed = True

            # 2. Entity Extraction
            extracted_items = self.extractor.extract(ocr_result)

            # 3. Persist Extracted Entities
            saved_entities = []
            for item in extracted_items:
                entity_uuid = uuid.uuid4()
                ee = ExtractedEntity(
                    id=entity_uuid,
                    document_id=doc.id,
                    consultation_id=doc.consultation_id,
                    category=item.category,
                    value=item.value,
                    confidence=item.confidence,
                    confidence_score=item.confidence_score,
                    verification_status=item.verification_status,
                    page_number=item.page_number,
                    position_in_text=item.position_in_text,
                    metadata_={
                        "normalized_value": item.normalized_value,
                        **item.metadata
                    }
                )
                self.db.add(ee)
                saved_entities.append(ee)

                # If consultation is linked, also create a ClinicalEntity for physician briefing
                if doc.consultation_id:
                    ce = ClinicalEntity(
                        id=uuid.uuid4(),
                        consultation_id=doc.consultation_id,
                        category=item.category,
                        value=item.value,
                        normalized_value=item.normalized_value,
                        confidence_score=item.confidence_score,
                        source=InfoSource.document_extracted,
                        source_document_id=doc.id,
                        verification_status=VerificationStatus.unverified,
                        metadata_=item.metadata
                    )
                    self.db.add(ce)

            doc.processing_status = "processed"
            await self.db.commit()
            await self.db.refresh(doc)

            # Build response
            entity_responses = [
                ExtractedEntityResponse(
                    id=e.id or entity_uuid,
                    document_id=e.document_id,
                    consultation_id=e.consultation_id,
                    category=e.category.value if hasattr(e.category, "value") else str(e.category),
                    value=e.value,
                    normalized_value=e.metadata_.get("normalized_value") if e.metadata_ else None,
                    confidence=e.confidence.value if hasattr(e.confidence, "value") else str(e.confidence),
                    confidence_score=float(e.confidence_score) if e.confidence_score is not None else None,
                    verification_status=e.verification_status.value if hasattr(e.verification_status, "value") else str(e.verification_status),
                    page_number=e.page_number,
                    position_in_text=e.position_in_text,
                    metadata=e.metadata_,
                    created_at=e.created_at or datetime.now(timezone.utc)
                )
                for e in saved_entities
            ]

            return DocumentProcessingResponse(
                document_id=doc.id,
                processing_status=doc.processing_status,
                ocr_completed=doc.ocr_completed,
                extracted_entities_count=len(saved_entities),
                ocr_preview=doc.ocr_text[:200] if doc.ocr_text else None,
                entities=entity_responses
            )

        except Exception as e:
            logger.error(f"Failed to process document {document_id}: {e}")
            doc.processing_status = "failed"
            await self.db.commit()
            raise

    async def get_document(self, document_id: uuid.UUID) -> DocumentResponse:
        """Fetch document metadata and entity count."""
        doc = await self.db.get(Document, document_id)
        if not doc:
            raise ValueError(f"Document {document_id} not found")

        result = await self.db.execute(
            select(ExtractedEntity).where(ExtractedEntity.document_id == document_id)
        )
        entities = result.scalars().all()

        return DocumentResponse(
            id=doc.id,
            patient_id=doc.patient_id,
            consultation_id=doc.consultation_id,
            document_type=doc.document_type.value if hasattr(doc.document_type, "value") else str(doc.document_type),
            original_filename=doc.original_filename,
            file_size_bytes=doc.file_size_bytes,
            mime_type=doc.mime_type,
            ocr_completed=doc.ocr_completed,
            processing_status=doc.processing_status,
            document_date=doc.document_date,
            uploaded_at=doc.uploaded_at or datetime.now(timezone.utc),
            extracted_entities_count=len(entities)
        )

    async def get_document_ocr(self, document_id: uuid.UUID) -> DocumentOCRResponse:
        """Fetch raw OCR text and metadata."""
        doc = await self.db.get(Document, document_id)
        if not doc:
            raise ValueError(f"Document {document_id} not found")

        return DocumentOCRResponse(
            document_id=doc.id,
            ocr_completed=doc.ocr_completed,
            processing_status=doc.processing_status,
            raw_text=doc.ocr_text,
            language="en",
            confidence=0.95 if doc.ocr_completed else None,
            pages_count=1 if doc.ocr_completed else 0
        )

    async def get_document_entities(self, document_id: uuid.UUID) -> List[ExtractedEntityResponse]:
        """Fetch all clinical entities extracted from a document."""
        result = await self.db.execute(
            select(ExtractedEntity).where(ExtractedEntity.document_id == document_id)
        )
        entities = result.scalars().all()

        return [
            ExtractedEntityResponse(
                id=e.id,
                document_id=e.document_id,
                consultation_id=e.consultation_id,
                category=e.category.value if hasattr(e.category, "value") else str(e.category),
                value=e.value,
                normalized_value=e.metadata_.get("normalized_value") if e.metadata_ else None,
                confidence=e.confidence.value if hasattr(e.confidence, "value") else str(e.confidence),
                confidence_score=float(e.confidence_score) if e.confidence_score is not None else None,
                verification_status=e.verification_status.value if hasattr(e.verification_status, "value") else str(e.verification_status),
                page_number=e.page_number,
                position_in_text=e.position_in_text,
                metadata=e.metadata_,
                created_at=e.created_at or datetime.now(timezone.utc)
            )
            for e in entities
        ]

    async def get_patient_documents(self, patient_id: uuid.UUID) -> List[DocumentResponse]:
        """List all documents uploaded for a given patient."""
        result = await self.db.execute(
            select(Document).where(Document.patient_id == patient_id).order_by(Document.uploaded_at.desc())
        )
        docs = result.scalars().all()

        responses = []
        for d in docs:
            ee_res = await self.db.execute(
                select(ExtractedEntity).where(ExtractedEntity.document_id == d.id)
            )
            entities = ee_res.scalars().all()
            responses.append(
                DocumentResponse(
                    id=d.id,
                    patient_id=d.patient_id,
                    consultation_id=d.consultation_id,
                    document_type=d.document_type.value if hasattr(d.document_type, "value") else str(d.document_type),
                    original_filename=d.original_filename,
                    file_size_bytes=d.file_size_bytes,
                    mime_type=d.mime_type,
                    ocr_completed=d.ocr_completed,
                    processing_status=d.processing_status,
                    document_date=d.document_date,
                    uploaded_at=d.uploaded_at,
                    extracted_entities_count=len(entities)
                )
            )
        return responses
