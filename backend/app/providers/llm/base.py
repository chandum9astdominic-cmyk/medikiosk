from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.schemas.clinical import ExtractedFact

class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers."""
    
    @abstractmethod
    async def extract_entities(self, text: str) -> List[ExtractedFact]:
        """
        Extract structured medical entities from text.
        IMPORTANT SAFETY BOUNDARY: Must NEVER extract or generate diagnoses, 
        treatments, or prescriptions. Only extract patient-reported symptoms, 
        duration, severity, and context.
        """
        pass

    @abstractmethod
    async def generate_summary(self, data: Dict[str, Any]) -> str:
        """Generate a clinical summary from structured data."""
        pass

    @abstractmethod
    async def classify_complaint(self, text: str) -> str:
        """Classify chief complaint into a clinical pathway."""
        pass
