import pytest
from httpx import AsyncClient, ASGITransport
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock

from app.main import app
from app.api.v1.routers.doctor import get_summary_service
from app.services.summary_service import SummaryService
from app.schemas.summary import DoctorQueueItem, DoctorConsultationSummary

@pytest.fixture
def mock_summary_service():
    service = AsyncMock(spec=SummaryService)
    return service

@pytest.fixture
def override_get_summary_service(mock_summary_service):
    app.dependency_overrides[get_summary_service] = lambda: mock_summary_service
    yield
    app.dependency_overrides = {}

@pytest.mark.asyncio
async def test_get_doctor_queue(override_get_summary_service, mock_summary_service):
    mock_summary_service.get_doctor_queue.return_value = [
        DoctorQueueItem(
            consultation_id=uuid.uuid4(),
            patient_id=uuid.uuid4(),
            patient_name="Test Patient",
            patient_age=30,
            patient_sex="Male",
            status="submitted",
            chief_complaint="Headache",
            priority=1,
            red_flag_count=0,
            document_count=0,
            submitted_at=datetime.now(timezone.utc)
        )
    ]
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/doctor/queue")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["patient_name"] == "Test Patient"

@pytest.mark.asyncio
async def test_get_consultation_summary(override_get_summary_service, mock_summary_service):
    c_id = uuid.uuid4()
    mock_summary_service.compile_consultation_summary.return_value = DoctorConsultationSummary(
        consultation_id=c_id,
        patient_id=uuid.uuid4(),
        patient_name="Test Patient",
        patient_age=30,
        patient_sex="Male",
        patient_mrn="MRN123",
        status="submitted",
        chief_complaint="Headache",
        sections={},
        red_flags=[],
        documents=[],
        submitted_at=datetime.now(timezone.utc),
        completed_at=None
    )
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(f"/api/v1/doctor/consultations/{c_id}/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["consultation_id"] == str(c_id)
        assert data["patient_name"] == "Test Patient"

@pytest.mark.asyncio
async def test_verify_entity(override_get_summary_service, mock_summary_service):
    e_id = uuid.uuid4()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.put(f"/api/v1/doctor/entities/{e_id}/verify?is_answer=true", json={
            "verification_status": "confirmed",
            "edited_value": "Edited text"
        })
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        mock_summary_service.verify_entity.assert_called_once()

@pytest.mark.asyncio
async def test_finalize_consultation(override_get_summary_service, mock_summary_service):
    c_id = uuid.uuid4()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(f"/api/v1/doctor/consultations/{c_id}/finalize")
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        mock_summary_service.finalize_consultation.assert_called_once_with(c_id)
