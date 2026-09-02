from typing import List, Literal
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # API Configuration
    PROJECT_NAME: str = "MediKiosk API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: Literal["development", "production", "testing"] = "development"

    # Database
    DATABASE_URL: str

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # LLM Provider
    LLM_PROVIDER: Literal["gemini", "mock"] = "mock"
    GEMINI_API_KEY: str = ""

    # OCR Provider
    OCR_PROVIDER: Literal["tesseract", "mock"] = "mock"

    # Speech Provider
    SPEECH_PROVIDER: Literal["webspeech", "mock"] = "mock"

    # Storage Provider
    STORAGE_PROVIDER: Literal["local"] = "local"
    STORAGE_DIR: str = "./storage"

    # Integrations
    ABDM_MOCK_MODE: bool = True
    FHIR_MOCK_MODE: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
