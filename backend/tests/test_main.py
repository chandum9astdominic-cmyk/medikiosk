import pytest
from httpx import AsyncClient, ASGITransport
from app.core.exceptions import MedikioskException
from app.main import app

@app.get("/api/v1/test-error")
async def trigger_error():
    raise MedikioskException(message="Test error", status_code=400)

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data
        assert data["message"] == "MediKiosk API is running"

@pytest.mark.asyncio
async def test_medikiosk_exception_handler():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/test-error")
        assert response.status_code == 400
        assert response.json() == {"detail": "Test error"}
