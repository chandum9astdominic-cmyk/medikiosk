import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import joinedload

from app.models.clinical import (
    Consultation, ConsultationStatus, ClinicalAnswer,
    RedFlag, VerificationStatus, InfoSource, ClinicalSummary
)
from app.models.user import Patient
from app.models.document import Document, ClinicalEntity
from app.schemas.summary import (
    DoctorQueueItem, DoctorConsultationSummary, ClinicalSection,
    SummaryItem, SummaryItemProvenance
)

class SummaryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_doctor_queue(self) -> List[DoctorQueueItem]:
        # Return consultations that are submitted or under review
        # Order by priority descending, then submitted_at
        stmt = (
            select(Consultation)
            .join(Patient, Consultation.patient_id == Patient.id)
            .where(
                Consultation.status.in_([ConsultationStatus.submitted, ConsultationStatus.under_review])
            )
            .order_by(desc(Consultation.priority), desc(Consultation.submitted_at))
        )
        
        result = await self.db.execute(stmt)
        consultations = result.scalars().all()
        
        queue = []
        for c in consultations:
            # Load patient details manually for now (could be eager loaded)
            patient_stmt = select(Patient).options(joinedload(Patient.user)).where(Patient.id == c.patient_id)
            p_res = await self.db.execute(patient_stmt)
            patient = p_res.scalar_one_or_none()
            
            # Count red flags
            rf_stmt = select(RedFlag).where(RedFlag.consultation_id == c.id)
            rf_res = await self.db.execute(rf_stmt)
            rf_count = len(rf_res.scalars().all())
            
            # Count documents
            doc_stmt = select(Document).where(Document.patient_id == c.patient_id)
            doc_res = await self.db.execute(doc_stmt)
            doc_count = len(doc_res.scalars().all())
            
            # Simple age calc
            age = None
            if patient and patient.date_of_birth:
                from datetime import date
                today = date.today()
                age = today.year - patient.date_of_birth.year - ((today.month, today.day) < (patient.date_of_birth.month, patient.date_of_birth.day))

            patient_name = "Unknown"
            if patient and patient.user and patient.user.full_name:
                patient_name = patient.user.full_name

            queue.append(DoctorQueueItem(
                consultation_id=c.id,
                patient_id=c.patient_id,
                patient_name=patient_name,
                patient_age=age,
                patient_sex=patient.gender.value if (patient and patient.gender) else None,
                status=c.status.value,
                chief_complaint=c.chief_complaint,
                priority=c.priority,
                red_flag_count=rf_count,
                document_count=doc_count,
                submitted_at=c.submitted_at
            ))
            
        return queue

    async def compile_consultation_summary(self, consultation_id: uuid.UUID) -> DoctorConsultationSummary:
        # Load the consultation
        stmt = select(Consultation).where(Consultation.id == consultation_id)
        result = await self.db.execute(stmt)
        c = result.scalar_one_or_none()
        if not c:
            raise ValueError("Consultation not found")
            
        # Load Patient
        patient_stmt = select(Patient).options(joinedload(Patient.user)).where(Patient.id == c.patient_id)
        p_res = await self.db.execute(patient_stmt)
        patient = p_res.scalar_one_or_none()
        
        # Load Answers
        answers_stmt = select(ClinicalAnswer).where(ClinicalAnswer.consultation_id == consultation_id)
        answers_res = await self.db.execute(answers_stmt)
        answers = answers_res.scalars().all()
        
        # Load Entities
        entities_stmt = select(ClinicalEntity).where(ClinicalEntity.consultation_id == consultation_id)
        entities_res = await self.db.execute(entities_stmt)
        entities = entities_res.scalars().all()
        
        # Load Red Flags
        rf_stmt = select(RedFlag).where(RedFlag.consultation_id == consultation_id)
        rf_res = await self.db.execute(rf_stmt)
        red_flags = rf_res.scalars().all()
        
        # Load Documents
        doc_stmt = select(Document).where(Document.patient_id == c.patient_id)
        doc_res = await self.db.execute(doc_stmt)
        documents = doc_res.scalars().all()

        # Group data into Sections
        # standard sections: Demographics, Chief Complaint, HPI, Past Medical History, Medications, Allergies, ROS
        sections: Dict[str, ClinicalSection] = {
            "History of Present Illness": ClinicalSection(name="History of Present Illness", items=[]),
            "Past Medical History": ClinicalSection(name="Past Medical History", items=[]),
            "Medications": ClinicalSection(name="Medications", items=[]),
            "Allergies": ClinicalSection(name="Allergies", items=[]),
            "Review of Systems": ClinicalSection(name="Review of Systems", items=[]),
            "Document Extracted Entities": ClinicalSection(name="Document Extracted Entities", items=[])
        }
        
        # Map clinical fields to sections
        # This mapping is naive; in a real app, it would be data-driven.
        def get_section_for_field(field_name: str) -> str:
            field_name = field_name.lower()
            if "history" in field_name and "present" not in field_name:
                return "Past Medical History"
            if "medication" in field_name or "drug" in field_name:
                return "Medications"
            if "allergy" in field_name:
                return "Allergies"
            if "system" in field_name or "ros" in field_name:
                return "Review of Systems"
            return "History of Present Illness" # Default
            
        for ans in answers:
            if not ans.answer_structured:
                continue
                
            field = ans.answer_structured.get("clinical_field", "Unknown")
            sec_name = get_section_for_field(field)
            
            sections[sec_name].items.append(SummaryItem(
                id=ans.id,
                category=sec_name,
                clinical_field=field,
                value=ans.answer_structured.get("value", ans.answer_text or "Unknown"),
                verification_status=ans.verification_status.value,
                provenance=SummaryItemProvenance(
                    source_type=ans.source.value,
                    source_id=str(ans.id)
                )
            ))
            
        for ent in entities:
            sec_name = "Document Extracted Entities"
            # Attempt to put it in a specific section if we know it
            if ent.entity_category.lower() == "medication": sec_name = "Medications"
            
            sections[sec_name].items.append(SummaryItem(
                id=ent.id,
                category=sec_name,
                clinical_field=ent.entity_category,
                value=ent.value,
                normalized_value=ent.normalized_value,
                verification_status=ent.verification_status.value,
                provenance=SummaryItemProvenance(
                    source_type=ent.source.value,
                    confidence=ent.confidence
                )
            ))
            
        age = None
        if patient and patient.date_of_birth:
            from datetime import date
            today = date.today()
            age = today.year - patient.date_of_birth.year - ((today.month, today.day) < (patient.date_of_birth.month, patient.date_of_birth.day))

        patient_name = "Unknown"
        if patient and patient.user and patient.user.full_name:
            patient_name = patient.user.full_name

        summary = DoctorConsultationSummary(
            consultation_id=c.id,
            patient_id=c.patient_id,
            patient_name=patient_name,
            patient_age=age,
            patient_sex=patient.gender.value if (patient and patient.gender) else None,
            patient_mrn=patient.medical_record_number if patient else None,
            status=c.status.value,
            chief_complaint=c.chief_complaint,
            sections=sections,
            red_flags=[{"id": str(rf.id), "rule": rf.rule_name, "severity": rf.severity, "message": rf.message} for rf in red_flags],
            documents=[{"id": str(d.id), "filename": d.filename, "document_type": d.document_type.value if hasattr(d.document_type, "value") else str(d.document_type)} for d in documents],
            submitted_at=c.submitted_at,
            completed_at=c.completed_at
        )
        
        return summary

    async def verify_entity(self, entity_id: uuid.UUID, is_answer: bool, verification_status: VerificationStatus, edited_value: Optional[str] = None):
        """Allows doctor to verify or edit an entity or answer."""
        if is_answer:
            stmt = select(ClinicalAnswer).where(ClinicalAnswer.id == entity_id)
            res = await self.db.execute(stmt)
            obj = res.scalar_one_or_none()
        else:
            stmt = select(ClinicalEntity).where(ClinicalEntity.id == entity_id)
            res = await self.db.execute(stmt)
            obj = res.scalar_one_or_none()
            
        if not obj:
            raise ValueError(f"{'Answer' if is_answer else 'Entity'} not found")
            
        obj.verification_status = verification_status
        if edited_value and is_answer:
            if not obj.answer_structured:
                obj.answer_structured = {}
            # Create a copy so SQLAlchemy detects the mutation
            new_structured = dict(obj.answer_structured)
            new_structured["value"] = edited_value
            obj.answer_structured = new_structured
            obj.answer_text = edited_value
        elif edited_value and not is_answer:
            obj.value = edited_value
            
        await self.db.commit()
        return obj

    async def finalize_consultation(self, consultation_id: uuid.UUID):
        stmt = select(Consultation).where(Consultation.id == consultation_id)
        result = await self.db.execute(stmt)
        c = result.scalar_one_or_none()
        if not c:
            raise ValueError("Consultation not found")
            
        c.status = ConsultationStatus.completed
        from datetime import datetime, timezone
        c.completed_at = datetime.now(timezone.utc)
        await self.db.commit()
        return c
