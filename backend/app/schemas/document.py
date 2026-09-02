import enum
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field

from app.models.document import DocumentType, EntityCategory, ExtractionConfidence
from app.models.clinical import VerificationStatus, InfoSource

# --- OCR Result Models ---

class OCRBoundingBox(BaseModel):
    x: int = 0
    y: int = 0
    width: int = 0
    height: int = 0

class OCRLine(BaseModel):
    line_number: int
    text: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    bounding_box: Optional[OCRBoundingBox] = None

class OCRPage(BaseModel):
    page_number: int
    raw_text: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    language: str = "en"
    lines: List[OCRLine] = []

class OCRResult(BaseModel):
    raw_text: str
    language: str = "en"
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    pages: List[OCRPage] = []
    processing_status: str = "completed"
    provider_name: str = "mock"

# --- Document API Schemas ---

class DocumentUploadResponse(BaseModel):
    document_id: uuid.UUID
    patient_id: uuid.UUID
    consultation_id: Optional[uuid.UUID] = None
    document_type: str
    original_filename: str
    stored_filename: str
    file_size_bytes: Optional[int] = None
    mime_type: str
    processing_status: str
    uploaded_at: datetime

class DocumentResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    consultation_id: Optional[uuid.UUID] = None
    document_type: str
    original_filename: str
    file_size_bytes: Optional[int] = None
    mime_type: str
    ocr_completed: bool
    processing_status: str
    document_date: Optional[date] = None
    uploaded_at: datetime
    extracted_entities_count: int = 0

class ExtractedEntityResponse(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    consultation_id: Optional[uuid.UUID] = None
    category: str
    value: str
    normalized_value: Optional[str] = None
    confidence: str
    confidence_score: Optional[float] = None
    verification_status: str
    page_number: Optional[int] = None
    position_in_text: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

class DocumentOCRResponse(BaseModel):
    document_id: uuid.UUID
    ocr_completed: bool
    processing_status: str
    raw_text: Optional[str] = None
    language: Optional[str] = "en"
    confidence: Optional[float] = None
    pages_count: int = 0

class DocumentProcessingResponse(BaseModel):
    document_id: uuid.UUID
    processing_status: str
    ocr_completed: bool
    extracted_entities_count: int
    ocr_preview: Optional[str] = None
    entities: List[ExtractedEntityResponse] = []
