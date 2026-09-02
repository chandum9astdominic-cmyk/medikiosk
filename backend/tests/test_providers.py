import pytest
import os
from app.providers.llm.mock import MockLLMProvider
from app.providers.ocr.mock import MockOCRProvider
from app.providers.speech.mock import MockSpeechProvider
from app.providers.storage.local import LocalStorageProvider
from app.providers.integrations.abha_mock import AbhaMockAdapter
from app.providers.integrations.fhir_mock import FhirMockAdapter

@pytest.mark.asyncio
async def test_mock_llm_provider():
    provider = MockLLMProvider()
    entities = await provider.extract_entities("mock text")
    assert len(entities) > 0
    assert entities[0].clinical_field == "symptom"
    
    summary = await provider.generate_summary({"test": "data"})
    assert "mock clinical summary" in summary.lower()
    
    classification = await provider.classify_complaint("I have chest pain")
    assert classification == "abdominal_pain"

@pytest.mark.asyncio
async def test_mock_ocr_provider():
    provider = MockOCRProvider()
    res = await provider.process_document("dummy_path.pdf")
    assert "PRESCRIPTION" in res.raw_text or "Pantocid" in res.raw_text

@pytest.mark.asyncio
async def test_mock_speech_provider():
    provider = MockSpeechProvider()
    text = await provider.speech_to_text(b"audio")
    assert "mock" in text.lower()
    
    audio = await provider.text_to_speech("hello")
    assert isinstance(audio, bytes)

@pytest.mark.asyncio
async def test_local_storage_provider():
    provider = LocalStorageProvider()
    filename = "test_save.txt"
    content = b"test content"
    
    # Save file
    saved_path = await provider.save_file(filename, content)
    assert os.path.exists(saved_path)
    
    # Get file
    retrieved_content = await provider.get_file(saved_path)
    assert retrieved_content == content
    
    # Cleanup
    os.remove(saved_path)

@pytest.mark.asyncio
async def test_mock_abha_adapter():
    adapter = AbhaMockAdapter()
    result = await adapter.verify_abha("12345678901234")
    assert result["status"] == "success"
    assert result["verified"] is True

@pytest.mark.asyncio
async def test_mock_fhir_adapter():
    adapter = FhirMockAdapter()
    bundle = await adapter.get_patient_bundle("patient_123")
    assert bundle["resourceType"] == "Bundle"
    assert bundle["entry"][0]["resource"]["id"] == "patient_123"
