import pytest
import uuid
import os
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document, DocumentType, ExtractedEntity, EntityCategory, ExtractionConfidence, ClinicalEntity
from app.models.clinical import VerificationStatus, InfoSource
from app.providers.storage.local import LocalStorageProvider
from app.providers.ocr.mock import MockOCRProvider
from app.providers.ocr.tesseract import TesseractOCRProvider
from app.schemas.document import OCRResult, OCRPage, OCRLine
from app.services.document_extractor import DocumentExtractor
from app.services.document_service import DocumentService

class MemoryStorageProvider(LocalStorageProvider):
    def __init__(self):
        self.files = {}

    async def save_file(self, filename: str, content: bytes) -> str:
        self.files[filename] = content
        return f"/mock/storage/{filename}"

    async def get_file(self, path: str) -> bytes:
        filename = os.path.basename(path)
        return self.files.get(filename, b"")

@pytest.fixture
def mock_db_session():
    db = AsyncMock(spec=AsyncSession)
    return db

@pytest.mark.asyncio
async def test_mock_ocr_provider_output():
    provider = MockOCRProvider()
    res = await provider.process_document("/mock/path.pdf", language="en")
    
    assert isinstance(res, OCRResult)
    assert res.processing_status == "completed"
    assert res.confidence >= 0.9
    assert len(res.pages) > 0
    assert "Pantocid" in res.raw_text
    assert "Dolo" in res.raw_text

@pytest.mark.asyncio
async def test_tesseract_ocr_provider_fallback():
    provider = TesseractOCRProvider()
    res = await provider.process_document("/non/existent/doc.pdf", language="en")
    
    assert isinstance(res, OCRResult)
    assert res.processing_status == "completed"
    assert "DOCUMENT EXTRACTION" in res.raw_text

def test_document_extractor_clinical_entities():
    extractor = DocumentExtractor()
    sample_text = """
    CITY CLINIC PRESCRIPTION
    Date: 15/05/2026
    Known Diagnosis: Essential Hypertension
    Rx:
    1. Tab Pantocid 40mg - 1-0-0 before food
    2. Tab Dolo 650mg - 1-0-1 as needed
    Investigations:
    - Complete Blood Count (CBC) - Hemoglobin: 14.2 g/dL
    Past Procedures: Appendectomy (2018)
    """
    
    ocr_result = OCRResult(
        raw_text=sample_text,
        language="en",
        confidence=0.95,
        pages=[OCRPage(page_number=1, raw_text=sample_text, confidence=0.95)]
    )

    entities = extractor.extract(ocr_result)
    assert len(entities) > 0

    categories = [e.category for e in entities]
    assert EntityCategory.date in categories
    assert EntityCategory.diagnosis in categories
    assert EntityCategory.medication in categories
    assert EntityCategory.dosage in categories
    assert EntityCategory.investigation in categories
    assert EntityCategory.surgery in categories

    # Verify extraction fidelity
    pantocid_entity = next(e for e in entities if "pantocid" in e.value.lower())
    assert pantocid_entity.normalized_value == "Pantocid"
    assert pantocid_entity.confidence == ExtractionConfidence.high
    assert pantocid_entity.confidence_score >= 0.9
    assert pantocid_entity.verification_status == VerificationStatus.unverified

    # Verify no diagnostic or prescribing claims
    for e in entities:
        assert e.verification_status == VerificationStatus.unverified
        assert "treatment_advice" not in e.metadata

@pytest.mark.asyncio
async def test_document_upload_validation(mock_db_session):
    storage = MemoryStorageProvider()
    service = DocumentService(db=mock_db_session, storage_provider=storage)
    patient_id = uuid.uuid4()

    # 1. Valid PDF upload
    pdf_content = b"%PDF-1.4 sample content"
    doc = await service.upload_document(
        patient_id=patient_id,
        filename="prescription.pdf",
        content=pdf_content,
        mime_type="application/pdf",
        document_type="prescription"
    )

    assert doc.patient_id == patient_id
    assert doc.mime_type == "application/pdf"
    assert doc.document_type == DocumentType.prescription
    assert doc.processing_status == "uploaded"
    assert doc.ocr_completed is False

    # 2. Invalid MIME type / extension rejection
    with pytest.raises(ValueError, match="Unsupported file type"):
        await service.upload_document(
            patient_id=patient_id,
            filename="malicious.exe",
            content=b"executable binary",
            mime_type="application/x-msdownload",
            document_type="other"
        )

    # 3. File size limit rejection (> 10MB)
    huge_content = b"0" * (11 * 1024 * 1024)
    with pytest.raises(ValueError, match="File size exceeds maximum permitted limit"):
        await service.upload_document(
            patient_id=patient_id,
            filename="large.pdf",
            content=huge_content,
            mime_type="application/pdf"
        )

@pytest.mark.asyncio
async def test_document_processing_lifecycle(mock_db_session):
    storage = MemoryStorageProvider()
    ocr = MockOCRProvider()
    extractor = DocumentExtractor()
    service = DocumentService(db=mock_db_session, storage_provider=storage, ocr_provider=ocr, extractor=extractor)

    doc_id = uuid.uuid4()
    patient_id = uuid.uuid4()
    consultation_id = uuid.uuid4()

    mock_doc = Document(
        id=doc_id,
        patient_id=patient_id,
        consultation_id=consultation_id,
        document_type=DocumentType.prescription,
        original_filename="rx.pdf",
        stored_filename=f"{doc_id}_rx.pdf",
        file_path="/mock/storage/rx.pdf",
        file_size_bytes=1024,
        mime_type="application/pdf",
        processing_status="uploaded",
        ocr_completed=False,
    )

    mock_db_session.get.return_value = mock_doc

    response = await service.process_document(doc_id, language="en")

    assert response.document_id == doc_id
    assert response.processing_status == "processed"
    assert response.ocr_completed is True
    assert response.extracted_entities_count > 0
    assert len(response.entities) > 0

    # Verify database add calls
    assert mock_db_session.add.call_count >= response.extracted_entities_count

    # Check added entity models
    added_objs = [call.args[0] for call in mock_db_session.add.mock_calls]
    extracted_entities = [o for o in added_objs if isinstance(o, ExtractedEntity)]
    clinical_entities = [o for o in added_objs if isinstance(o, ClinicalEntity)]

    assert len(extracted_entities) > 0
    assert len(clinical_entities) > 0 # Linked to consultation

    for ce in clinical_entities:
        assert ce.source == InfoSource.document_extracted
        assert ce.source_document_id == doc_id
        assert ce.verification_status == VerificationStatus.unverified

@pytest.mark.asyncio
async def test_get_document_metadata_and_ocr(mock_db_session):
    service = DocumentService(db=mock_db_session)
    doc_id = uuid.uuid4()
    patient_id = uuid.uuid4()

    mock_doc = Document(
        id=doc_id,
        patient_id=patient_id,
        document_type=DocumentType.lab_report,
        original_filename="cbc_report.pdf",
        stored_filename=f"{doc_id}_cbc.pdf",
        file_path="/mock/storage/cbc.pdf",
        file_size_bytes=2048,
        mime_type="application/pdf",
        ocr_text="Hemoglobin: 13.5 g/dL",
        ocr_completed=True,
        processing_status="processed",
    )
    mock_db_session.get.return_value = mock_doc

    # Mock entity count
    mock_result = MagicMock()
    mock_result.scalars().all.return_value = []
    mock_db_session.execute.return_value = mock_result

    meta = await service.get_document(doc_id)
    assert meta.id == doc_id
    assert meta.original_filename == "cbc_report.pdf"
    assert meta.ocr_completed is True

    ocr_res = await service.get_document_ocr(doc_id)
    assert ocr_res.ocr_completed is True
    assert ocr_res.raw_text == "Hemoglobin: 13.5 g/dL"

@pytest.mark.asyncio
async def test_document_api_endpoints():
    from httpx import AsyncClient, ASGITransport
    from app.main import app
    from app.api.v1.routers.documents import get_document_service

    doc_id = uuid.uuid4()
    patient_id = uuid.uuid4()

    mock_doc = Document(
        id=doc_id,
        patient_id=patient_id,
        document_type=DocumentType.prescription,
        original_filename="rx.pdf",
        stored_filename=f"{doc_id}_rx.pdf",
        file_path="/mock/storage/rx.pdf",
        file_size_bytes=512,
        mime_type="application/pdf",
        ocr_text="Tab Dolo 650mg",
        ocr_completed=True,
        processing_status="processed",
    )

    mock_service = AsyncMock()
    mock_service.upload_document.return_value = mock_doc
    mock_service.get_document.return_value = {
        "id": doc_id,
        "patient_id": patient_id,
        "document_type": "prescription",
        "original_filename": "rx.pdf",
        "file_size_bytes": 512,
        "mime_type": "application/pdf",
        "ocr_completed": True,
        "processing_status": "processed",
        "uploaded_at": "2026-09-02T12:00:00Z",
        "extracted_entities_count": 1
    }
    mock_service.get_document_ocr.return_value = {
        "document_id": doc_id,
        "ocr_completed": True,
        "processing_status": "processed",
        "raw_text": "Tab Dolo 650mg",
        "language": "en",
        "confidence": 0.95,
        "pages_count": 1
    }
    mock_service.get_document_entities.return_value = []
    mock_service.get_patient_documents.return_value = []

    app.dependency_overrides[get_document_service] = lambda: mock_service

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. Test Upload API
            files = {"file": ("rx.pdf", b"%PDF-1.4 dummy", "application/pdf")}
            data = {"patient_id": str(patient_id), "document_type": "prescription"}
            res = await ac.post("/api/v1/documents/upload", data=data, files=files)
            assert res.status_code == 201
            assert res.json()["document_id"] == str(doc_id)

            # 2. Test Get Metadata
            res_meta = await ac.get(f"/api/v1/documents/{doc_id}")
            assert res_meta.status_code == 200
            assert res_meta.json()["original_filename"] == "rx.pdf"

            # 3. Test Get OCR Text
            res_ocr = await ac.get(f"/api/v1/documents/{doc_id}/ocr")
            assert res_ocr.status_code == 200
            assert "Dolo" in res_ocr.json()["raw_text"]

            # 4. Test Get Entities
            res_ent = await ac.get(f"/api/v1/documents/{doc_id}/entities")
            assert res_ent.status_code == 200
            assert isinstance(res_ent.json(), list)

            # 5. Test Patient Documents
            res_pat = await ac.get(f"/api/v1/documents/patient/{patient_id}")
            assert res_pat.status_code == 200
    finally:
        app.dependency_overrides.clear()

