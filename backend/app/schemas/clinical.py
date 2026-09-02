from typing import List, Dict, Optional, Any, Literal
from pydantic import BaseModel, Field
import uuid
from datetime import datetime

# --- Clinical Engine Configuration Models ---

class QuestionTranslation(BaseModel):
    en: str
    hi: Optional[str] = None
    kn: Optional[str] = None

class PathwayQuestion(BaseModel):
    question_key: str
    section: str
    clinical_field: str
    question_text: Dict[str, str]
    input_type: str = "text"
    is_required: bool = False
    display_order: int
    options: Optional[List[str]] = None

class PathwayRule(BaseModel):
    rule_id: str
    trigger_question: str
    condition: str  # "contains", "equals", "exists", etc.
    value: str
    action: str     # "ask_followup", "skip", "flag_red"
    action_target: Optional[str] = None # Question key if asking followup
    metadata: Optional[Dict[str, Any]] = None

class ClinicalPathway(BaseModel):
    pathway_id: str
    name: str
    description: str
    questions: List[PathwayQuestion]
    rules: List[PathwayRule]

# --- Clinical Extraction Models ---

class ExtractedFact(BaseModel):
    clinical_field: str
    value: str
    source: Literal["patient_reported", "document", "inferred", "unknown"] = "patient_reported"
    confidence: float = Field(..., ge=0.0, le=1.0)
    verified: bool = False

class AnswerSubmission(BaseModel):
    raw_text: str
    language: str = "en"

class NextQuestionResponse(BaseModel):
    consultation_id: uuid.UUID
    question_key: Optional[str] = None
    section: Optional[str] = None
    question_text: Optional[str] = None
    input_type: Optional[str] = "text"
    options: Optional[List[str]] = None
    is_required: bool = False
    is_complete: bool = False
    progress_percentage: int = 0
    clinical_field: Optional[str] = None

class ConsultationProgress(BaseModel):
    consultation_id: uuid.UUID
    status: str
    completed_questions: List[str]
    pending_questions: List[str]
    red_flags_triggered: int

class ReviewAnswerItem(BaseModel):
    question_key: str
    section: str
    clinical_field: Optional[str] = None
    question_text: str
    answer_text: Optional[str] = None
    answer_status: str = "answered"
    source: str = "patient_reported"
    verification_status: str = "unverified"

class ConsultationSummaryResponse(BaseModel):
    consultation_id: uuid.UUID
    patient_id: uuid.UUID
    status: str
    chief_complaint: Optional[str] = None
    complaint_category: Optional[str] = None
    answers_by_section: Dict[str, List[ReviewAnswerItem]]
    red_flags_count: int = 0

