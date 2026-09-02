from app.providers.ocr.base import BaseOCRProvider
from app.schemas.document import OCRResult, OCRPage, OCRLine, OCRBoundingBox

class MockOCRProvider(BaseOCRProvider):
    """
    Deterministic Mock OCR for development, testing, and SIH demonstrations.
    Provides structured multi-page OCR output with realistic medical text.
    """

    async def process_document(self, file_path: str, language: str = "en") -> OCRResult:
        # Realistic synthetic medical document lines
        sample_lines = [
            "CITY MULTISPECIALTY HOSPITAL - OUTPATIENT PRESCRIPTION",
            "Date: 12/04/2026 | Patient Name: Rajesh Kumar | Age: 45 | Sex: Male",
            "Known Diagnosis: Type 2 Diabetes Mellitus, Essential Hypertension",
            "Chief Complaint: Abdominal pain in right lower quadrant since 2 days",
            "Rx (Medications):",
            "1. Tab Pantocid 40mg - 1-0-0 before food - 10 days",
            "2. Tab Dolo 650mg - 1-0-1 as needed (SOS) - 5 days",
            "3. Tab Metformin 500mg - 1-0-1 after food - 30 days",
            "Investigations Ordered:",
            "- Complete Blood Count (CBC) - Hemoglobin: 13.8 g/dL (Ref: 13.0-17.0)",
            "- Ultrasound (USG) Whole Abdomen",
            "Past Procedures: Appendectomy (2018)",
            "Advice: Avoid oily food. Follow up after 7 days."
        ]

        if language == "hi":
            sample_lines[0] = "सिटी मल्टीस्पेशलिटी अस्पताल - पर्चा"
            sample_lines[2] = "पूर्व निदान: टाइप 2 मधुमेह, उच्च रक्तचाप"

        ocr_lines = []
        full_text_list = []
        
        for idx, text in enumerate(sample_lines, start=1):
            full_text_list.append(text)
            ocr_lines.append(
                OCRLine(
                    line_number=idx,
                    text=text,
                    confidence=0.95,
                    bounding_box=OCRBoundingBox(x=50, y=idx * 40, width=600, height=30)
                )
            )

        raw_text = "\n".join(full_text_list)
        
        page = OCRPage(
            page_number=1,
            raw_text=raw_text,
            confidence=0.95,
            language=language,
            lines=ocr_lines
        )

        return OCRResult(
            raw_text=raw_text,
            language=language,
            confidence=0.95,
            pages=[page],
            processing_status="completed",
            provider_name="mock_ocr"
        )
