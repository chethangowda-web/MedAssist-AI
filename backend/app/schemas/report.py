from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class ReportGenerate(BaseModel):
    patient_id: str = Field(..., min_length=1)
    report_type: str = "patient_summary"
    include_vitals: bool = True
    include_history: bool = True
    include_diagnosis: bool = True
    include_prescriptions: bool = True
    format: str = "pdf"

class ReportResponse(BaseModel):
    id: str
    report_id: str
    patient_id: str
    patient_name: str
    report_type: str
    title: str
    content: Dict[str, Any]
    summary: str
    generated_by: str
    generated_at: str
    format: str
    file_url: str
    status: str
