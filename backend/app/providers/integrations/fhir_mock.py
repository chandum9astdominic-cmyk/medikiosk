import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class FhirMockAdapter:
    """MOCK adapter for FHIR/HIS integration."""

    def __init__(self):
        logger.info("Initializing MOCK FHIR Adapter. NO REAL HIS CALLS WILL BE MADE.")

    async def get_patient_bundle(self, patient_id: str) -> Dict[str, Any]:
        """Return a mock FHIR R4 Bundle for the patient."""
        return {
            "resourceType": "Bundle",
            "type": "collection",
            "entry": [
                {
                    "resource": {
                        "resourceType": "Patient",
                        "id": patient_id,
                        "name": [{"text": "Mock Patient"}]
                    }
                }
            ]
        }
