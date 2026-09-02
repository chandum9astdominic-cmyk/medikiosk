from abc import ABC, abstractmethod
from typing import Optional
from app.schemas.document import OCRResult

class BaseOCRProvider(ABC):
    """Abstract base class for OCR providers."""

    @abstractmethod
    async def process_document(self, file_path: str, language: str = "en") -> OCRResult:
        """
        Process a medical document and return structured OCR result.
        
        Must preserve:
        - raw_text
        - page structure & line metadata
        - confidence scores
        - detected language
        - processing status
        """
        pass
