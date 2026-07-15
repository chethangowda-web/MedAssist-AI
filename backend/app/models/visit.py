from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

@dataclass
class Symptom:
    name: str = ""
    severity: str = "mild"
    duration: str = ""
    notes: str = ""

@dataclass
class Diagnosis:
    condition: str = ""
    icd_code: str = ""
    confidence: float = 0.0
    notes: str = ""

@dataclass
class Prescription:
    medicine_name: str = ""
    dosage: str = ""
    frequency: str = ""
    duration: str = ""
    notes: str = ""

@dataclass
class Visit:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    visit_id: str = field(default_factory=lambda: f"VIS-{uuid.uuid4().hex[:8].upper()}")
    patient_id: str = ""
    patient_name: str = ""
    visit_type: str = "general"
    chief_complaint: str = ""
    symptoms: List[Symptom] = field(default_factory=list)
    vital_signs: Dict[str, Any] = field(default_factory=dict)
    diagnosis: List[Diagnosis] = field(default_factory=list)
    prescriptions: List[Prescription] = field(default_factory=list)
    investigations: List[str] = field(default_factory=list)
    notes: str = ""
    referred_to: str = ""
    referred_by: str = ""
    conducted_by: str = ""
    visit_date: str = field(default_factory=lambda: datetime.now().isoformat())
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    follow_up_date: Optional[str] = None
    follow_up_notes: str = ""
    is_emergency: bool = False
    risk_score: Optional[float] = None
    risk_level: str = "low"
    status: str = "completed"
    attachments: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "visit_id": self.visit_id,
            "patient_id": self.patient_id,
            "patient_name": self.patient_name,
            "visit_type": self.visit_type,
            "chief_complaint": self.chief_complaint,
            "symptoms": [{"name": s.name, "severity": s.severity, "duration": s.duration, "notes": s.notes} for s in self.symptoms],
            "vital_signs": self.vital_signs,
            "diagnosis": [{"condition": d.condition, "icd_code": d.icd_code, "confidence": d.confidence, "notes": d.notes} for d in self.diagnosis],
            "prescriptions": [{"medicine_name": p.medicine_name, "dosage": p.dosage, "frequency": p.frequency, "duration": p.duration, "notes": p.notes} for p in self.prescriptions],
            "investigations": self.investigations,
            "notes": self.notes,
            "referred_to": self.referred_to,
            "referred_by": self.referred_by,
            "conducted_by": self.conducted_by,
            "visit_date": self.visit_date,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "follow_up_date": self.follow_up_date,
            "follow_up_notes": self.follow_up_notes,
            "is_emergency": self.is_emergency,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "status": self.status,
            "attachments": self.attachments,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Visit":
        return cls(
            id=data.get("id", ""),
            visit_id=data.get("visit_id", ""),
            patient_id=data.get("patient_id", ""),
            patient_name=data.get("patient_name", ""),
            visit_type=data.get("visit_type", "general"),
            chief_complaint=data.get("chief_complaint", ""),
            symptoms=[Symptom(**s) for s in data.get("symptoms", [])],
            vital_signs=data.get("vital_signs", {}),
            diagnosis=[Diagnosis(**d) for d in data.get("diagnosis", [])],
            prescriptions=[Prescription(**p) for p in data.get("prescriptions", [])],
            investigations=data.get("investigations", []),
            notes=data.get("notes", ""),
            referred_to=data.get("referred_to", ""),
            referred_by=data.get("referred_by", ""),
            conducted_by=data.get("conducted_by", ""),
            visit_date=data.get("visit_date", ""),
            created_at=data.get("created_at", ""),
            updated_at=data.get("updated_at", ""),
            follow_up_date=data.get("follow_up_date"),
            follow_up_notes=data.get("follow_up_notes", ""),
            is_emergency=data.get("is_emergency", False),
            risk_score=data.get("risk_score"),
            risk_level=data.get("risk_level", "low"),
            status=data.get("status", "completed"),
            attachments=data.get("attachments", []),
        )
