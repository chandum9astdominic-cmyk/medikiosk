import enum
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy import String, Boolean, ForeignKey, Text, Integer, Float, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

from app.core.database import Base, timestamp

class ConsultationStatus(str, enum.Enum):
    intake = "intake"
    in_progress = "in_progress"
    submitted = "submitted"
    under_review = "under_review"
    completed = "completed"
    cancelled = "cancelled"

class QuestionInputType(str, enum.Enum):
    text = "text"
    single_choice = "single_choice"
    multi_choice = "multi_choice"
    scale = "scale"
    yes_no = "yes_no"
    date = "date"
    voice = "voice"

class InfoSource(str, enum.Enum):
    patient_reported = "patient_reported"
    ai_extracted = "ai_extracted"
    doctor_verified = "doctor_verified"
    document_extracted = "document_extracted"

class VerificationStatus(str, enum.Enum):
    unverified = "unverified"
    confirmed = "confirmed"
    rejected = "rejected"
    edited = "edited"

class Consultation(Base):
    __tablename__ = "consultations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"))
    doctor_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("doctors.id"))
    status: Mapped[ConsultationStatus] = mapped_column(default=ConsultationStatus.intake)
    chief_complaint: Mapped[Optional[str]] = mapped_column(Text)
    complaint_category: Mapped[Optional[str]] = mapped_column(String(50))
    priority: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[timestamp]
    submitted_at: Mapped[Optional[datetime]]
    completed_at: Mapped[Optional[datetime]]
    notes: Mapped[Optional[str]] = mapped_column(Text)
    session_state: Mapped[Optional[dict]] = mapped_column(JSONB)
    created_at: Mapped[timestamp]
    updated_at: Mapped[timestamp]

    patient: Mapped["Patient"] = relationship(back_populates="consultations")
    doctor: Mapped[Optional["Doctor"]] = relationship(back_populates="consultations")
    clinical_answers: Mapped[List["ClinicalAnswer"]] = relationship(back_populates="consultation", cascade="all, delete-orphan")
    ayush_assessment: Mapped[Optional["AyushAssessment"]] = relationship(back_populates="consultation", uselist=False, cascade="all, delete-orphan")
    clinical_summary: Mapped[Optional["ClinicalSummary"]] = relationship(back_populates="consultation", uselist=False, cascade="all, delete-orphan")
    red_flags: Mapped[List["RedFlag"]] = relationship(back_populates="consultation", cascade="all, delete-orphan")
    clinical_entities: Mapped[List["ClinicalEntity"]] = relationship(back_populates="consultation", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pathway: Mapped[str] = mapped_column(String(50), index=True)
    section: Mapped[str] = mapped_column(String(50))
    clinical_field: Mapped[Optional[str]] = mapped_column(String(100))
    question_text: Mapped[dict] = mapped_column(JSONB)
    question_key: Mapped[str] = mapped_column(String(100), unique=True)
    input_type: Mapped[QuestionInputType]
    options: Mapped[Optional[dict]] = mapped_column(JSONB)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    display_order: Mapped[int] = mapped_column(Integer)
    help_text: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[timestamp]

    rules: Mapped[List["QuestionRule"]] = relationship(back_populates="question", cascade="all, delete-orphan")

class QuestionRule(Base):
    __tablename__ = "question_rules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"))
    condition_type: Mapped[str] = mapped_column(String(50))
    target_question_key: Mapped[str] = mapped_column(String(100))
    target_value: Mapped[str] = mapped_column(Text)
    operator: Mapped[str] = mapped_column(String(20), default="equals")
    created_at: Mapped[timestamp]

    question: Mapped["Question"] = relationship(back_populates="rules")

class ClinicalAnswer(Base):
    __tablename__ = "clinical_answers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("consultations.id", ondelete="CASCADE"))
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id"))
    answer_text: Mapped[Optional[str]] = mapped_column(Text)
    answer_structured: Mapped[Optional[dict]] = mapped_column(JSONB)
    answer_status: Mapped[str] = mapped_column(String(50), default="answered")
    raw_voice_text: Mapped[Optional[str]] = mapped_column(Text)
    source: Mapped[InfoSource] = mapped_column(default=InfoSource.patient_reported)
    verification_status: Mapped[VerificationStatus] = mapped_column(default=VerificationStatus.unverified)
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    verified_at: Mapped[Optional[datetime]]
    created_at: Mapped[timestamp]
    updated_at: Mapped[timestamp]

    consultation: Mapped["Consultation"] = relationship(back_populates="clinical_answers")
    question: Mapped["Question"] = relationship()

class AyushAssessment(Base):
    __tablename__ = "ayush_assessments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("consultations.id", ondelete="CASCADE"), unique=True)
    prakriti: Mapped[Optional[dict]] = mapped_column(JSONB)
    vikriti: Mapped[Optional[dict]] = mapped_column(JSONB)
    sara: Mapped[Optional[str]] = mapped_column(String(100))
    samhanana: Mapped[Optional[str]] = mapped_column(String(100))
    pramana: Mapped[Optional[str]] = mapped_column(String(100))
    satmya: Mapped[Optional[str]] = mapped_column(String(100))
    sattva: Mapped[Optional[str]] = mapped_column(String(100))
    ahara_shakti: Mapped[Optional[str]] = mapped_column(String(100))
    vyayama_shakti: Mapped[Optional[str]] = mapped_column(String(100))
    vaya: Mapped[Optional[str]] = mapped_column(String(100))
    ahara: Mapped[Optional[str]] = mapped_column(Text)
    vihara: Mapped[Optional[str]] = mapped_column(Text)
    additional_notes: Mapped[Optional[str]] = mapped_column(Text)
    source: Mapped[InfoSource] = mapped_column(default=InfoSource.patient_reported)
    verification_status: Mapped[VerificationStatus] = mapped_column(default=VerificationStatus.unverified)
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    verified_at: Mapped[Optional[datetime]]
    created_at: Mapped[timestamp]
    updated_at: Mapped[timestamp]

    consultation: Mapped["Consultation"] = relationship(back_populates="ayush_assessment")

class ClinicalSummary(Base):
    __tablename__ = "clinical_summaries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("consultations.id", ondelete="CASCADE"), unique=True)
    summary_text: Mapped[str] = mapped_column(Text)
    summary_structured: Mapped[Optional[dict]] = mapped_column(JSONB)
    generated_by: Mapped[str] = mapped_column(String(50), default="ai")
    version: Mapped[int] = mapped_column(Integer, default=1)
    verification_status: Mapped[VerificationStatus] = mapped_column(default=VerificationStatus.unverified)
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    verified_at: Mapped[Optional[datetime]]
    created_at: Mapped[timestamp]
    updated_at: Mapped[timestamp]

    consultation: Mapped["Consultation"] = relationship(back_populates="clinical_summary")

class RedFlag(Base):
    __tablename__ = "red_flags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("consultations.id", ondelete="CASCADE"))
    rule_id: Mapped[str] = mapped_column(String(50))
    rule_name: Mapped[str] = mapped_column(String(255))
    severity: Mapped[str] = mapped_column(String(20))
    message: Mapped[str] = mapped_column(Text)
    triggered_by: Mapped[dict] = mapped_column(JSONB)
    is_acknowledged: Mapped[bool] = mapped_column(Boolean, default=False)
    acknowledged_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    acknowledged_at: Mapped[Optional[datetime]]
    created_at: Mapped[timestamp]

    consultation: Mapped["Consultation"] = relationship(back_populates="red_flags")
