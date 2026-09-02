import enum
from typing import List, Optional
from datetime import date, datetime
from sqlalchemy import String, Boolean, ForeignKey, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.database import Base, timestamp

class UserRole(str, enum.Enum):
    patient = "patient"
    doctor = "doctor"
    admin = "admin"

class GenderType(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"
    prefer_not_to_say = "prefer_not_to_say"

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole]
    full_name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[timestamp]
    updated_at: Mapped[timestamp]

    # Relationships
    patient_profile: Mapped[Optional["Patient"]] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile: Mapped[Optional["Doctor"]] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    consent_records: Mapped[List["ConsentRecord"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date)
    gender: Mapped[Optional[GenderType]]
    blood_group: Mapped[Optional[str]] = mapped_column(String(5))
    address: Mapped[Optional[str]] = mapped_column(Text)
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(String(255))
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(String(20))
    abha_id: Mapped[Optional[str]] = mapped_column(String(20))
    medical_record_number: Mapped[Optional[str]] = mapped_column(String(50), unique=True)
    created_at: Mapped[timestamp]
    updated_at: Mapped[timestamp]

    user: Mapped["User"] = relationship(back_populates="patient_profile")
    consultations: Mapped[List["Consultation"]] = relationship(back_populates="patient")
    documents: Mapped[List["Document"]] = relationship(back_populates="patient")

class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    specialization: Mapped[Optional[str]] = mapped_column(String(100))
    registration_number: Mapped[Optional[str]] = mapped_column(String(50))
    department: Mapped[Optional[str]] = mapped_column(String(100))
    qualification: Mapped[Optional[str]] = mapped_column(String(255))
    experience_years: Mapped[Optional[int]]
    is_ayush_practitioner: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[timestamp]
    updated_at: Mapped[timestamp]

    user: Mapped["User"] = relationship(back_populates="doctor_profile")
    consultations: Mapped[List["Consultation"]] = relationship(back_populates="doctor")

class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    consent_type: Mapped[str] = mapped_column(String(50))
    is_granted: Mapped[bool] = mapped_column(Boolean)
    granted_at: Mapped[Optional[datetime]]
    revoked_at: Mapped[Optional[datetime]]
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    user_agent: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[timestamp]

    user: Mapped["User"] = relationship(back_populates="consent_records")
