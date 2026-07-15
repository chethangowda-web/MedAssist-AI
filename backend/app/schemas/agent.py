from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class RiskAssessmentRequest(BaseModel):
    patient_id: str = Field(..., min_length=1)
    symptoms: List[str] = []
    vital_signs: Dict[str, Any] = {}
    medical_history: Dict[str, Any] = {}

class RiskAssessmentResponse(BaseModel):
    patient_id: str
    overall_risk_score: float
    risk_level: str
    assessments: List[Dict[str, Any]]
    recommendations: List[str]
    emergency_warning: bool

class KnowledgeQuery(BaseModel):
    query: str = Field(..., min_length=3)
    top_k: int = 5
    filter_category: Optional[str] = None

class KnowledgeResponse(BaseModel):
    results: List[Dict[str, Any]]
    total_found: int

class SchemeRecommendationRequest(BaseModel):
    patient_id: str = Field(..., min_length=1)
    patient_profile: Dict[str, Any] = {}

class SchemeRecommendationResponse(BaseModel):
    patient_id: str
    recommended_schemes: List[Dict[str, Any]]
    total_schemes: int

class CoordinatorRequest(BaseModel):
    task: str = Field(..., min_length=1)
    patient_id: Optional[str] = None
    data: Dict[str, Any] = {}

class CoordinatorResponse(BaseModel):
    task: str
    status: str
    agent_used: str
    result: Dict[str, Any]
    processing_time: float
