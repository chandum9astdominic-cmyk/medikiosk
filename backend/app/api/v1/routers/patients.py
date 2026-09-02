from fastapi import APIRouter, Depends, HTTPException, status
import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.clinical import Consultation, ClinicalAnswer, RedFlag
from app.models.document import Document, ClinicalEntity

router = APIRouter()

@router.get("/{patient_id}/timeline")
async def get_patient_timeline(
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve chronological medical information timeline for a patient.
    """
    timeline = []
    
    # 1. Get Consultations
    consultations_result = await db.execute(
        select(Consultation).where(Consultation.patient_id == patient_id).order_by(Consultation.created_at.desc())
    )
    consultations = consultations_result.scalars().all()
    
    for c in consultations:
        # Add consultation event
        timeline.append({
            "date": c.created_at.isoformat() if c.created_at else "Date not provided",
            "type": "Consultation",
            "content": f"Chief Complaint: {c.chief_complaint or c.complaint_category or 'General'}",
            "source": "System",
            "verification": "System Verified",
            "timestamp": c.created_at.timestamp() if c.created_at else 0
        })
        
        # Add Clinical Answers
        answers_result = await db.execute(
            select(ClinicalAnswer).where(ClinicalAnswer.consultation_id == c.id)
        )
        answers = answers_result.scalars().all()
        for a in answers:
            if a.answer_status in ["answered"]:
                timeline.append({
                    "date": a.created_at.isoformat() if a.created_at else "Date not provided",
                    "type": "Patient History",
                    "content": f"Q: {a.question_key} - A: {a.answer_text}",
                    "source": "Patient Reported",
                    "verification": "Verified" if a.verification_status.name == "verified" else "Unverified",
                    "timestamp": a.created_at.timestamp() if a.created_at else 0
                })
        
        # Add Red Flags
        flags_result = await db.execute(select(RedFlag).where(RedFlag.consultation_id == c.id))
        flags = flags_result.scalars().all()
        for f in flags:
            timeline.append({
                "date": f.created_at.isoformat() if f.created_at else "Date not provided",
                "type": "Red Flag Alert",
                "content": f.message,
                "source": "System Evaluated",
                "verification": "System Generated",
                "timestamp": f.created_at.timestamp() if f.created_at else 0
            })
        
        # Add Documents & Entities
        docs_result = await db.execute(select(Document).where(Document.consultation_id == c.id))
        docs = docs_result.scalars().all()
        for d in docs:
            timeline.append({
                "date": d.uploaded_at.isoformat() if d.uploaded_at else "Date not provided",
                "type": "Document Upload",
                "content": f"File: {d.original_filename} ({d.document_type.name if hasattr(d.document_type, 'name') else str(d.document_type)})",
                "source": "Patient Upload",
                "verification": "Uploaded",
                "timestamp": d.uploaded_at.timestamp() if d.uploaded_at else 0
            })
            
            # Add Entities extracted from this document
            entities_result = await db.execute(select(ClinicalEntity).where(ClinicalEntity.document_id == d.id))
            entities = entities_result.scalars().all()
            for e in entities:
                timeline.append({
                    "date": d.uploaded_at.isoformat() if d.uploaded_at else "Date not provided",
                    "type": "Extracted Data",
                    "content": f"{e.entity_type}: {e.normalized_value or e.raw_value}",
                    "source": f"Extracted from {d.original_filename}",
                    "verification": "Verified" if e.verification_status.name == "verified" else "Unverified",
                    "timestamp": d.uploaded_at.timestamp() if d.uploaded_at else 0
                })

    # Sort descending by timestamp
    timeline.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Remove timestamp field before returning
    for item in timeline:
        del item["timestamp"]
        
    return timeline
