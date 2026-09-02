import re
from typing import List, Dict, Any, Optional
from app.models.document import EntityCategory, ExtractionConfidence
from app.models.clinical import VerificationStatus, InfoSource
from app.schemas.document import OCRResult

class ExtractedEntityData:
    def __init__(
        self,
        category: EntityCategory,
        value: str,
        normalized_value: Optional[str] = None,
        confidence: ExtractionConfidence = ExtractionConfidence.high,
        confidence_score: float = 0.95,
        page_number: int = 1,
        position_in_text: int = 0,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.category = category
        self.value = value
        self.normalized_value = normalized_value or value
        self.confidence = confidence
        self.confidence_score = confidence_score
        self.page_number = page_number
        self.position_in_text = position_in_text
        self.verification_status = VerificationStatus.unverified
        self.metadata = metadata or {}

class DocumentExtractor:
    """
    Deterministic Medical Document Entity Extractor.
    Extracts structured clinical items from OCR text with exact source fidelity.
    
    IMPORTANT SAFETY BOUNDARY:
    This service only extracts text explicitly written in patient-provided medical documents.
    It NEVER diagnoses conditions, recommends treatments, or invents clinical data.
    """

    # Common Indian / Global prescription medications
    KNOWN_MEDS = [
        "pantocid", "pan 40", "pantoprazole", "dolo 650", "dolo", "paracetamol",
        "metformin", "glycomet", "telmisartan", "telma", "amlodipine", "atorvastatin",
        "amoxicillin", "augmentin", "azithromycin", "cefixime", "omeprazole", "ranitidine",
        "cetirizine", "montelukast", "ibuprofen", "combiflam", "tramadol", "aspirin"
    ]

    # Dosage regex patterns (e.g., 500mg, 40 mg, 650mg, 10ml, 5mcg, 100 IU)
    DOSAGE_REGEX = re.compile(r'(\b\d+(?:\.\d+)?\s*(?:mg|gm|g|ml|mcg|iu|tablet|tab|cap|capsule)\b)', re.IGNORECASE)

    # Frequency regex patterns (e.g., 1-0-1, 1-0-0, 0-0-1, OD, BD, TDS, QID, SOS, PRN, before food, after food)
    FREQ_PATTERNS = [
        (re.compile(r'\b1-0-1\b', re.IGNORECASE), "1-0-1", "Twice daily (Morning & Night)"),
        (re.compile(r'\b1-0-0\b', re.IGNORECASE), "1-0-0", "Once daily (Morning)"),
        (re.compile(r'\b0-0-1\b', re.IGNORECASE), "0-0-1", "Once daily (Night)"),
        (re.compile(r'\b1-1-1\b', re.IGNORECASE), "1-1-1", "Thrice daily"),
        (re.compile(r'\b(BD|BID)\b', re.IGNORECASE), "BD", "Twice daily"),
        (re.compile(r'\b(OD|QD)\b', re.IGNORECASE), "OD", "Once daily"),
        (re.compile(r'\b(TDS|TID)\b', re.IGNORECASE), "TDS", "Three times daily"),
        (re.compile(r'\b(SOS|PRN)\b', re.IGNORECASE), "SOS", "As needed"),
        (re.compile(r'\bbefore food\b', re.IGNORECASE), "before food", "Before meals"),
        (re.compile(r'\bafter food\b', re.IGNORECASE), "after food", "After meals"),
    ]

    # Lab tests & investigations
    LAB_TESTS = [
        "hemoglobin", "complete blood count", "cbc", "total leukocyte count", "tlc",
        "platelet count", "serum creatinine", "blood urea", "fasting blood sugar", "fbs",
        "postprandial blood sugar", "ppbs", "hba1c", "lipid profile", "serum bilirubin",
        "sgot", "sgpt", "ultrasound", "usg", "x-ray", "ct scan", "mri", "ecg"
    ]

    # Procedures & surgeries
    PROCEDURES = [
        "appendectomy", "cholecystectomy", "cesarean section", "c-section", "hernia repair",
        "laparoscopy", "endoscopy", "colonoscopy", "angioplasty", "cabg", "cataract surgery"
    ]

    # Date pattern (DD/MM/YYYY or YYYY-MM-DD or Month DD, YYYY)
    DATE_REGEX = re.compile(r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b')

    def extract(self, ocr_result: OCRResult) -> List[ExtractedEntityData]:
        """Extract structured entities from OCRResult."""
        entities: List[ExtractedEntityData] = []
        raw_text = ocr_result.raw_text or ""
        lines = raw_text.splitlines()

        for line_idx, line in enumerate(lines, start=1):
            line_str = line.strip()
            if not line_str:
                continue

            line_lower = line_str.lower()

            # 1. Extract Dates
            for match in self.DATE_REGEX.finditer(line_str):
                date_val = match.group(1)
                entities.append(
                    ExtractedEntityData(
                        category=EntityCategory.date,
                        value=date_val,
                        normalized_value=date_val,
                        confidence=ExtractionConfidence.high,
                        confidence_score=0.98,
                        page_number=1,
                        position_in_text=match.start(),
                        metadata={"line_number": line_idx, "context": line_str}
                    )
                )

            # 2. Extract Documented Prior Diagnoses (e.g. "Known Diagnosis: ...")
            if any(k in line_lower for k in ["diagnosis:", "diagnosed with:", "known case of:", "k/c/o:", "पूर्व निदान:"]):
                diag_text = re.split(r'[:\-]', line_str, maxsplit=1)[-1].strip()
                if diag_text:
                    for d_item in re.split(r'[,;]', diag_text):
                        d_clean = d_item.strip()
                        if d_clean:
                            entities.append(
                                ExtractedEntityData(
                                    category=EntityCategory.diagnosis,
                                    value=d_clean,
                                    normalized_value=d_clean,
                                    confidence=ExtractionConfidence.high,
                                    confidence_score=0.92,
                                    page_number=1,
                                    position_in_text=line_str.find(d_clean),
                                    metadata={"line_number": line_idx, "context": line_str, "explicitly_documented": True}
                                )
                            )

            # 3. Extract Medications & Dosages
            for med in self.KNOWN_MEDS:
                if med in line_lower:
                    # Find exact casing in original line
                    start_pos = line_lower.find(med)
                    matched_med = line_str[start_pos:start_pos+len(med)]
                    
                    entities.append(
                        ExtractedEntityData(
                            category=EntityCategory.medication,
                            value=matched_med,
                            normalized_value=med.title(),
                            confidence=ExtractionConfidence.high,
                            confidence_score=0.95,
                            page_number=1,
                            position_in_text=start_pos,
                            metadata={"line_number": line_idx, "context": line_str}
                        )
                    )

            # Extract Dosages
            for match in self.DOSAGE_REGEX.finditer(line_str):
                dose_val = match.group(1)
                entities.append(
                    ExtractedEntityData(
                        category=EntityCategory.dosage,
                        value=dose_val,
                        normalized_value=dose_val.lower().replace(" ", ""),
                        confidence=ExtractionConfidence.high,
                        confidence_score=0.96,
                        page_number=1,
                        position_in_text=match.start(),
                        metadata={"line_number": line_idx, "context": line_str}
                    )
                )

            # Extract Frequency
            for regex, raw_code, normalized_meaning in self.FREQ_PATTERNS:
                if regex.search(line_str):
                    entities.append(
                        ExtractedEntityData(
                            category=EntityCategory.other,
                            value=raw_code,
                            normalized_value=normalized_meaning,
                            confidence=ExtractionConfidence.high,
                            confidence_score=0.94,
                            page_number=1,
                            position_in_text=line_str.lower().find(raw_code.lower()),
                            metadata={"type": "frequency", "line_number": line_idx, "context": line_str}
                        )
                    )

            # 4. Extract Investigations & Values
            for lab in self.LAB_TESTS:
                if lab in line_lower:
                    start_pos = line_lower.find(lab)
                    entities.append(
                        ExtractedEntityData(
                            category=EntityCategory.investigation,
                            value=lab.title(),
                            normalized_value=lab.upper(),
                            confidence=ExtractionConfidence.high,
                            confidence_score=0.93,
                            page_number=1,
                            position_in_text=start_pos,
                            metadata={"line_number": line_idx, "context": line_str}
                        )
                    )
                    
                    # Check for numeric test values (e.g. 13.8 g/dL or 110 mg/dL)
                    val_match = re.search(r'(\d+(?:\.\d+)?\s*(?:g/dl|mg/dl|%|/cumm|mmol/l|u/l))', line_str, re.IGNORECASE)
                    if val_match:
                        entities.append(
                            ExtractedEntityData(
                                category=EntityCategory.observation,
                                value=val_match.group(1),
                                normalized_value=val_match.group(1),
                                confidence=ExtractionConfidence.high,
                                confidence_score=0.95,
                                page_number=1,
                                position_in_text=val_match.start(),
                                metadata={"test": lab, "line_number": line_idx}
                            )
                        )

            # 5. Extract Procedures / Surgeries
            for proc in self.PROCEDURES:
                if proc in line_lower:
                    start_pos = line_lower.find(proc)
                    entities.append(
                        ExtractedEntityData(
                            category=EntityCategory.procedure if "scopy" in proc or "scan" in proc else EntityCategory.surgery,
                            value=proc.title(),
                            normalized_value=proc.title(),
                            confidence=ExtractionConfidence.high,
                            confidence_score=0.94,
                            page_number=1,
                            position_in_text=start_pos,
                            metadata={"line_number": line_idx, "context": line_str}
                        )
                    )

        return entities
