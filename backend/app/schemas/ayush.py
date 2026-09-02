from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

class AyushAssessmentBase(BaseModel):
    prakriti: Optional[Dict[str, Any]] = None
    vikriti: Optional[Dict[str, Any]] = None
    sara: Optional[str] = None
    samhanana: Optional[str] = None
    pramana: Optional[str] = None
    satmya: Optional[str] = None
    sattva: Optional[str] = None
    ahara_shakti: Optional[str] = None
    vyayama_shakti: Optional[str] = None
    vaya: Optional[str] = None
    ahara: Optional[str] = None
    vihara: Optional[str] = None
    additional_notes: Optional[str] = None

class AyushAssessmentCreate(AyushAssessmentBase):
    pass

class AyushAssessmentUpdate(AyushAssessmentBase):
    pass

class AyushAssessmentResponse(AyushAssessmentBase):
    id: uuid.UUID
    consultation_id: uuid.UUID
    source: str
    verification_status: str
    
    class Config:
        from_attributes = True
