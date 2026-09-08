from __future__ import annotations

from datetime import date
import re
import uuid
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document, ExtractedEntity


DATE_PATTERNS = (
    re.compile(r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b"),
    re.compile(r"\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b"),
)


def _parse_date(value: str) -> Optional[date]:
    for pattern in DATE_PATTERNS:
        match = pattern.search(value)
        if not match:
            continue
        parts = [int(p) for p in match.groups()]
        try:
            if len(str(parts[0])) == 4:
                return date(parts[0], parts[1], parts[2])
            day, month, year = parts
            if year < 100:
                year += 2000
            return date(year, month, day)
        except ValueError:
            continue
    return None


def infer_document_date(doc: Document, entities: list[ExtractedEntity]) -> Optional[date]:
    if doc.document_date:
        return doc.document_date

    for entity in entities:
        if str(getattr(entity.category, "value", entity.category)) == "date":
            parsed = _parse_date(entity.value)
            if parsed:
                return parsed

    if doc.ocr_text:
        return _parse_date(doc.ocr_text)
    return None


class DocumentTimelineService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _serialize(doc: Document, entities: list[ExtractedEntity], inferred_date: Optional[date]) -> dict[str, Any]:
        return {
            "id": doc.id,
            "patient_id": doc.patient_id,
            "consultation_id": doc.consultation_id,
            "document_type": getattr(doc.document_type, "value", doc.document_type),
            "original_filename": doc.original_filename,
            "file_size_bytes": doc.file_size_bytes,
            "mime_type": doc.mime_type,
            "ocr_completed": doc.ocr_completed,
            "processing_status": doc.processing_status,
            "document_date": inferred_date,
            "uploaded_at": doc.uploaded_at,
            "extracted_entities_count": len(entities),
        }

    async def list_documents(self, patient_id: uuid.UUID) -> list[dict[str, Any]]:
        result = await self.db.execute(
            select(Document)
            .where(Document.patient_id == patient_id)
            .order_by(Document.document_date.desc(), Document.uploaded_at.desc())
        )
        documents = list(result.scalars().all())
        items: list[dict[str, Any]] = []

        for doc in documents:
            entity_result = await self.db.execute(
                select(ExtractedEntity).where(ExtractedEntity.document_id == doc.id)
            )
            entities = list(entity_result.scalars().all())
            inferred_date = infer_document_date(doc, entities)
            if inferred_date and doc.document_date != inferred_date:
                doc.document_date = inferred_date
            items.append(self._serialize(doc, entities, inferred_date))

        await self.db.commit()
        items.sort(key=lambda item: (item["document_date"] or date.min, item["uploaded_at"]), reverse=True)
        return items

    async def timeline(self, patient_id: uuid.UUID) -> dict[str, Any]:
        documents = await self.list_documents(patient_id)
        groups: dict[str, list[dict[str, Any]]] = {}

        for document in documents:
            event_date = document["document_date"]
            key = event_date.isoformat() if event_date else "undated"
            groups.setdefault(key, []).append(document)

        grouped = [
            {"date": key if key != "undated" else None, "documents": value}
            for key, value in groups.items()
        ]
        return {
            "patient_id": patient_id,
            "documents_count": len(documents),
            "documents": documents,
            "timeline": grouped,
        }
