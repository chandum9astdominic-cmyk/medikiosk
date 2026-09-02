import pytest
from unittest.mock import AsyncMock, MagicMock
import uuid
from app.services.clinical_engine import ClinicalEngine
from app.providers.llm.mock import MockLLMProvider
from app.models.clinical import Consultation, ConsultationStatus, Question
from app.schemas.clinical import AnswerSubmission

@pytest.mark.asyncio
async def test_clinical_engine_initialization():
    mock_db = AsyncMock()
    engine = ClinicalEngine(db=mock_db, llm_provider=MockLLMProvider())
    assert "abdominal_pain" in engine.pathways

@pytest.mark.asyncio
async def test_engine_next_question():
    mock_db = AsyncMock()
    mock_consultation = Consultation(id=uuid.uuid4(), status=ConsultationStatus.intake)
    mock_consultation.session_state = {
        "pathway_id": "abdominal_pain",
        "completed_questions": [],
        "pending_questions": ["ap_location", "ap_onset"],
        "skipped_questions": []
    }
    mock_db.get.return_value = mock_consultation

    engine = ClinicalEngine(db=mock_db, llm_provider=MockLLMProvider())
    
    res_en = await engine.get_next_question(mock_consultation.id, "en")
    assert res_en.question_key == "ap_location"
    assert "Where exactly" in res_en.question_text
    
    res_kn = await engine.get_next_question(mock_consultation.id, "kn")
    assert "ಹೊಟ್ಟೆ ನೋವು" in res_kn.question_text

@pytest.mark.asyncio
async def test_process_answer_red_flag():
    mock_db = AsyncMock()
    mock_consultation = Consultation(id=uuid.uuid4(), status=ConsultationStatus.intake)
    mock_consultation.session_state = {
        "pathway_id": "abdominal_pain",
        "completed_questions": [],
        "pending_questions": ["ap_associated_symptoms"],
        "skipped_questions": []
    }
    mock_db.get.return_value = mock_consultation
    
    mock_result = MagicMock()
    mock_result.scalars().first.return_value = Question(id=uuid.uuid4())
    mock_db.execute.return_value = mock_result

    engine = ClinicalEngine(db=mock_db, llm_provider=MockLLMProvider())
    
    answer = AnswerSubmission(raw_text="I have fever and nausea", language="en")
    await engine.process_answer(mock_consultation.id, "ap_associated_symptoms", answer)
    
    assert mock_db.add.call_count > 0 
    assert "ap_associated_symptoms" in mock_consultation.session_state["completed_questions"]

@pytest.mark.asyncio
async def test_process_answer_unknown():
    mock_db = AsyncMock()
    mock_consultation = Consultation(id=uuid.uuid4(), status=ConsultationStatus.intake)
    mock_consultation.session_state = {
        "pathway_id": "abdominal_pain",
        "completed_questions": [],
        "pending_questions": ["ap_severity"],
        "skipped_questions": []
    }
    mock_db.get.return_value = mock_consultation
    
    mock_result = MagicMock()
    mock_result.scalars().first.return_value = Question(id=uuid.uuid4())
    mock_db.execute.return_value = mock_result

    engine = ClinicalEngine(db=mock_db, llm_provider=MockLLMProvider())
    
    answer = AnswerSubmission(raw_text="I don't know", language="en")
    await engine.process_answer(mock_consultation.id, "ap_severity", answer)
    
    assert "ap_severity" in mock_consultation.session_state["completed_questions"]

@pytest.mark.asyncio
async def test_classify_pathway():
    mock_db = AsyncMock()
    mock_consultation = Consultation(id=uuid.uuid4(), status=ConsultationStatus.intake)
    mock_consultation.session_state = {
        "pathway_id": "triage",
        "pending_questions": ["chief_complaint"],
        "completed_questions": [],
        "skipped_questions": []
    }
    mock_db.get.return_value = mock_consultation
    
    mock_result = MagicMock()
    mock_result.scalars().first.return_value = Question(id=uuid.uuid4(), question_key="chief_complaint")
    mock_db.execute.return_value = mock_result

    engine = ClinicalEngine(db=mock_db, llm_provider=MockLLMProvider())
    
    ans = AnswerSubmission(raw_text="I have abdominal pain", language="en")
    await engine.process_answer(mock_consultation.id, "chief_complaint", ans)
    
    assert mock_consultation.session_state["pathway_id"] == "abdominal_pain"
    assert "ap_location" in mock_consultation.session_state["pending_questions"]
    assert "chief_complaint" in mock_consultation.session_state["completed_questions"]

