from fastapi import APIRouter, Depends, HTTPException
import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.clinical import Consultation, ClinicalAnswer, RedFlag
from app.models.document import Document, ClinicalEntity
from app.services.document_timeline import DocumentTimelineService

router = APIRouter()


@router.get("/{patient_id}/timeline")
async def get_patient_timeline(
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Return the patient's chronological consultation/document timeline."""
    service = DocumentTimelineService(db)
    document_timeline = await service.timeline(patient_id)

    # Preserve existing consultation/history/red-flag events so this endpoint
    # remains backward compatible while adding document-date-aware events.
    timeline = []
    consultations_result = await db.execute(
        select(Consultation)
        .where(Consultation.patient_id == patient_id)
        .order_by(Consultation.created_at.desc())
    )
    consultations = consultations_result.scalars().all()

    for consultation in consultations:
        if consultation.created_at:
            timeline.append({
                "date": consultation.created_at.isoformat(),
                "type": "Consultation",
                "content": f"Chief Complaint: {consultation.chief_complaint or consultation.complaint_category or 'General'}",
                "source": "System",
                "verification": "System Verified",
            })

        answers_result = await db.execute(
            select(ClinicalAnswer).where(ClinicalAnswer.consultation_id == consultation.id)
        )
        for answer in answers_result.scalars().all():
            if answer.answer_status == "answered" and answer.created_at:
                verification = getattr(answer.verification_status, "name", str(answer.verification_status))
                timeline.append({
                    "date": answer.created_at.isoformat(),
                    "type": "Patient History",
                    "content": f"Q: {answer.question_key} - A: {answer.answer_text}",
                    "source": "Patient Reported",
                    "verification": "Verified" if verification == "verified" else "Unverified",
                })

        flags_result = await db.execute(
            select(RedFlag).where(RedFlag.consultation_id == consultation.id)
        )
        for flag in flags_result.scalars().all():
            if flag.created_at:
                timeline.append({
                    "date": flag.created_at.isoformat(),
                    "type": "Red Flag Alert",
                    "content": flag.message,
                    "source": "System Evaluated",
                    "verification": "System Generated",
                })

    # Add Phase 2 document events. The service uses document_date when it is
    # available and upload time as a safe fallback for undated documents.
    for document in document_timeline["documents"] if "documents" in document_timeline else []:
        event_date = document["document_date"] or document["uploaded_at"]
        if hasattr(event_date, "isoformat"):
            event_date = event_date.isoformat()
        timeline.append({
            "date": event_date,
            "type": "Document Upload",
            "content": f"File: {document['original_filename']} ({document['document_type']})",
            "source": "Patient Upload",
            "verification": "Uploaded",
            "document_id": str(document["id"]),
            "processing_status": document["processing_status"],
            "ocr_completed": document["ocr_completed"],
            "extracted_entities_count": document["extracted_entities_count"],
        })

    timeline.sort(key=lambda item: item["date"] or "", reverse=True)
    return timeline


@router.get("/{patient_id}/documents")
async def get_patient_documents(
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Return all Phase 2 documents for a patient in chronological order."""
    return await DocumentTimelineService(db).list_documents(patient_id)


@router.get("/{patient_id}/document-timeline")
async def get_document_timeline(
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Return a document-only timeline grouped by clinical document date."""
    return await DocumentTimelineService(db).timeline(patient_id)
