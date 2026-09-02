from app.core.config import settings

def test_config_loading():
    assert settings.PROJECT_NAME == "MediKiosk API"
    assert settings.API_V1_STR == "/api/v1"
    assert settings.LLM_PROVIDER in ["gemini", "mock"]
    assert settings.OCR_PROVIDER in ["tesseract", "mock"]
    assert settings.SPEECH_PROVIDER in ["webspeech", "mock"]
    assert settings.STORAGE_PROVIDER == "local"
