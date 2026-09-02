import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class AbhaMockAdapter:
    """MOCK adapter for ABHA/ABDM integration."""

    def __init__(self):
        logger.info("Initializing MOCK ABHA Adapter. NO REAL GOVERNMENT CALLS WILL BE MADE.")

    async def verify_abha(self, abha_address: str) -> Dict[str, Any]:
        """Mock verification of ABHA address."""
        if not abha_address:
            return {"status": "error", "message": "Invalid ABHA address"}
        
        return {
            "status": "success",
            "abha_address": abha_address,
            "verified": True,
            "mock_patient_details": {
                "name": "Rajesh Kumar (MOCK)",
                "gender": "M",
                "year_of_birth": 1980
            }
        }
