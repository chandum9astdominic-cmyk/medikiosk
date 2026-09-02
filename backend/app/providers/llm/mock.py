from typing import Dict, Any, List
from app.providers.llm.base import BaseLLMProvider
from app.schemas.clinical import ExtractedFact

class MockLLMProvider(BaseLLMProvider):
    """Deterministic Mock LLM for testing and development."""

    async def extract_entities(self, text: str) -> List[ExtractedFact]:
        # SAFTEY BOUNDARY ENFORCED: No diagnosis extraction.
        # Only extracts clinical symptom/fact structure.
        return [
            ExtractedFact(
                clinical_field="symptom",
                value="Mock patient symptom",
                source="patient_reported",
                confidence=0.99
            )
        ]

    async def generate_summary(self, data: Dict[str, Any]) -> str:
        return "This is a deterministic mock clinical summary."

    async def classify_complaint(self, text: str) -> str:
        return "abdominal_pain" if "pain" in text.lower() else "general"
