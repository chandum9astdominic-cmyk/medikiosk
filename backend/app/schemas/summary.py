from typing import List, Dict, Optional, Any
from pydantic import BaseModel
import uuid
from datetime import datetime
from app.schemas.document import ExtractedEntityResponse

class SummaryItemProvenance(BaseModel):
    source_type: str  # "patient_reported", "document_extracted"
    source_id: Optional[str] = None  # UUID of document or answer
    confidence: Optional[float] = None

class SummaryItem(BaseModel):
    id: uuid.UUID
    category: str
    clinical_field: str
    value: str
    normalized_value: Optional[str] = None
    verification_status: str  # "unverified", "confirmed", "rejected", "edited"
    provenance: SummaryItemProvenance
    metadata: Optional[Dict[str, Any]] = None

class ClinicalSection(BaseModel):
    name: str
    items: List[SummaryItem]

class DoctorConsultationSummary(BaseModel):
    consultation_id: uuid.UUID
    patient_id: uuid.UUID
    patient_name: str
    patient_age: Optional[int]
    patient_sex: Optional[str]
    patient_mrn: Optional[str]
    status: str
    chief_complaint: Optional[str]
    
    sections: Dict[str, ClinicalSection]  # e.g. "HPI", "Past Medical History", "Medications"
    red_flags: List[Dict[str, Any]]
    documents: List[Dict[str, Any]]
    
    submitted_at: Optional[datetime]
    completed_at: Optional[datetime]

class DoctorQueueItem(BaseModel):
    consultation_id: uuid.UUID
    patient_id: uuid.UUID
    patient_name: str
    patient_age: Optional[int]
    patient_sex: Optional[str]
    status: str
    chief_complaint: Optional[str]
    priority: int
    red_flag_count: int
    document_count: int
    submitted_at: Optional[datetime]

class EntityVerificationRequest(BaseModel):
    verification_status: str  # "confirmed", "rejected", "edited"
    edited_value: Optional[str] = None
