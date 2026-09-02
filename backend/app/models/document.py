import enum
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy import String, Boolean, ForeignKey, Text, Integer, Float, Date, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

from app.core.database import Base, timestamp
from app.models.clinical import InfoSource, VerificationStatus

class DocumentType(str, enum.Enum):
    prescription = "prescription"
    lab_report = "lab_report"
    discharge_summary = "discharge_summary"
    imaging = "imaging"
    other = "other"

class ExtractionConfidence(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"

class EntityCategory(str, enum.Enum):
    diagnosis = "diagnosis"
    medication = "medication"
    dosage = "dosage"
    investigation = "investigation"
    procedure = "procedure"
    surgery = "surgery"
    observation = "observation"
    vital_sign = "vital_sign"
    date = "date"
    other = "other"

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"))
    consultation_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("consultations.id"))
    document_type: Mapped[DocumentType] = mapped_column(default=DocumentType.other)
    original_filename: Mapped[str] = mapped_column(String(255))
    stored_filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(Text)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer)
    mime_type: Mapped[str] = mapped_column(String(50))
    ocr_text: Mapped[Optional[str]] = mapped_column(Text)
    ocr_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    processing_status: Mapped[str] = mapped_column(String(20), default="pending")
    document_date: Mapped[Optional[date]] = mapped_column(Date)
    uploaded_at: Mapped[timestamp]
    created_at: Mapped[timestamp]

    patient: Mapped["Patient"] = relationship(back_populates="documents")
    extracted_entities: Mapped[List["ExtractedEntity"]] = relationship(back_populates="document", cascade="all, delete-orphan")

class ExtractedEntity(Base):
    __tablename__ = "extracted_entities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    consultation_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("consultations.id"))
    category: Mapped[EntityCategory]
    value: Mapped[str] = mapped_column(Text)
    confidence: Mapped[ExtractionConfidence]
    confidence_score: Mapped[Optional[float]] = mapped_column(Numeric(3, 2))
    verification_status: Mapped[VerificationStatus] = mapped_column(default=VerificationStatus.unverified)
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    verified_at: Mapped[Optional[datetime]]
    page_number: Mapped[Optional[int]] = mapped_column(Integer)
    position_in_text: Mapped[Optional[int]] = mapped_column(Integer)
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSONB)
    created_at: Mapped[timestamp]
    updated_at: Mapped[timestamp]

    document: Mapped["Document"] = relationship(back_populates="extracted_entities")

class ClinicalEntity(Base):
    __tablename__ = "clinical_entities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("consultations.id", ondelete="CASCADE"))
    category: Mapped[EntityCategory]
    value: Mapped[str] = mapped_column(Text)
    normalized_value: Mapped[Optional[str]] = mapped_column(Text)
    confidence_score: Mapped[Optional[float]] = mapped_column(Numeric(3, 2))
    source: Mapped[InfoSource]
    source_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("documents.id"))
    source_answer_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("clinical_answers.id"))
    verification_status: Mapped[VerificationStatus] = mapped_column(default=VerificationStatus.unverified)
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    verified_at: Mapped[Optional[datetime]]
    event_date: Mapped[Optional[date]] = mapped_column(Date)
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSONB)
    created_at: Mapped[timestamp]
    updated_at: Mapped[timestamp]

    consultation: Mapped["Consultation"] = relationship(back_populates="clinical_entities")
