import uuid
from typing import Dict, Any
import asyncio

class MockABHAAdapter:
    """
    Mock adapter for ABHA (Ayushman Bharat Health Account) integration.
    DO NOT connect to real government APIs.
    """
    async def link_abha(self, patient_id: str, abha_number: str) -> Dict[str, Any]:
        """
        Simulates linking an ABHA number to a patient.
        """
        await asyncio.sleep(0.5) # Simulate network delay
        
        # In a real integration, this would initiate an OTP flow or consent request.
        # Here we just mock success.
        
        return {
            "status": "success",
            "message": "DEMO / MOCK - Successfully linked synthetic ABHA number.",
            "abha_number": abha_number,
            "patient_id": patient_id,
            "demo_warning": "No live ABDM connection was made."
        }
