from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SymptomSchema(BaseModel):
    name: str = ""
    severity: str = "mild"
    duration: str = ""
    notes: str = ""

class DiagnosisSchema(BaseModel):
    condition: str = ""
    icd_code: str = ""
    confidence: float = 0.0
    notes: str = ""

class PrescriptionSchema(BaseModel):
    medicine_name: str = ""
    dosage: str = ""
    frequency: str = ""
    duration: str = ""
    notes: str = ""

class VisitCreate(BaseModel):
    patient_id: str = Field(..., min_length=1)
    visit_type: str = "general"
    chief_complaint: str = ""
    symptoms: List[SymptomSchema] = []
    vital_signs: Dict[str, Any] = {}
    diagnosis: List[DiagnosisSchema] = []
    prescriptions: List[PrescriptionSchema] = []
    investigations: List[str] = []
    notes: str = ""
    referred_to: str = ""
    conducted_by: str = ""
    follow_up_date: Optional[str] = None
    is_emergency: bool = False

class VisitResponse(BaseModel):
    id: str
    visit_id: str
    patient_id: str
    patient_name: str
    visit_type: str
    chief_complaint: str
    symptoms: List[Dict[str, Any]]
    vital_signs: Dict[str, Any]
    diagnosis: List[Dict[str, Any]]
    prescriptions: List[Dict[str, Any]]
    investigations: List[str]
    notes: str
    referred_to: str
    conducted_by: str
    visit_date: str
    created_at: str
    follow_up_date: Optional[str]
    is_emergency: bool
    risk_score: Optional[float]
    risk_level: str
    status: str
