from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

@dataclass
class Address:
    street: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""
    village: str = ""

@dataclass
class MedicalHistory:
    conditions: List[str] = field(default_factory=list)
    surgeries: List[str] = field(default_factory=list)
    allergies: List[str] = field(default_factory=list)
    medications: List[str] = field(default_factory=list)
    family_history: List[str] = field(default_factory=list)

@dataclass
class VitalSigns:
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[float] = None
    blood_sugar: Optional[float] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None

@dataclass
class Patient:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str = field(default_factory=lambda: f"PAT-{uuid.uuid4().hex[:8].upper()}")
    name: str = ""
    age: Optional[int] = None
    date_of_birth: Optional[str] = None
    gender: str = ""
    phone: str = ""
    alternate_phone: str = ""
    email: str = ""
    address: Address = field(default_factory=Address)
    aadhar_number: str = ""
    blood_group: str = ""
    medical_history: MedicalHistory = field(default_factory=MedicalHistory)
    vital_signs: VitalSigns = field(default_factory=VitalSigns)
    registered_by: str = ""
    registered_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    is_active: bool = True
    tags: List[str] = field(default_factory=list)
    notes: str = ""
    profile_image_url: str = ""
    emergency_contact: str = ""
    language_preference: str = "en"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "name": self.name,
            "age": self.age,
            "date_of_birth": self.date_of_birth,
            "gender": self.gender,
            "phone": self.phone,
            "alternate_phone": self.alternate_phone,
            "email": self.email,
            "address": {
                "street": self.address.street,
                "city": self.address.city,
                "state": self.address.state,
                "pincode": self.address.pincode,
                "village": self.address.village,
            },
            "aadhar_number": self.aadhar_number,
            "blood_group": self.blood_group,
            "medical_history": {
                "conditions": self.medical_history.conditions,
                "surgeries": self.medical_history.surgeries,
                "allergies": self.medical_history.allergies,
                "medications": self.medical_history.medications,
                "family_history": self.medical_history.family_history,
            },
            "vital_signs": {
                "blood_pressure_systolic": self.vital_signs.blood_pressure_systolic,
                "blood_pressure_diastolic": self.vital_signs.blood_pressure_diastolic,
                "heart_rate": self.vital_signs.heart_rate,
                "temperature": self.vital_signs.temperature,
                "oxygen_saturation": self.vital_signs.oxygen_saturation,
                "blood_sugar": self.vital_signs.blood_sugar,
                "height": self.vital_signs.height,
                "weight": self.vital_signs.weight,
                "bmi": self.vital_signs.bmi,
            },
            "registered_by": self.registered_by,
            "registered_at": self.registered_at,
            "updated_at": self.updated_at,
            "is_active": self.is_active,
            "tags": self.tags,
            "notes": self.notes,
            "profile_image_url": self.profile_image_url,
            "emergency_contact": self.emergency_contact,
            "language_preference": self.language_preference,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Patient":
        addr = data.get("address", {})
        med = data.get("medical_history", {})
        vit = data.get("vital_signs", {})
        return cls(
            id=data.get("id", ""),
            patient_id=data.get("patient_id", ""),
            name=data.get("name", ""),
            age=data.get("age"),
            date_of_birth=data.get("date_of_birth"),
            gender=data.get("gender", ""),
            phone=data.get("phone", ""),
            alternate_phone=data.get("alternate_phone", ""),
            email=data.get("email", ""),
            address=Address(
                street=addr.get("street", ""),
                city=addr.get("city", ""),
                state=addr.get("state", ""),
                pincode=addr.get("pincode", ""),
                village=addr.get("village", ""),
            ),
            aadhar_number=data.get("aadhar_number", ""),
            blood_group=data.get("blood_group", ""),
            medical_history=MedicalHistory(
                conditions=med.get("conditions", []),
                surgeries=med.get("surgeries", []),
                allergies=med.get("allergies", []),
                medications=med.get("medications", []),
                family_history=med.get("family_history", []),
            ),
            vital_signs=VitalSigns(
                blood_pressure_systolic=vit.get("blood_pressure_systolic"),
                blood_pressure_diastolic=vit.get("blood_pressure_diastolic"),
                heart_rate=vit.get("heart_rate"),
                temperature=vit.get("temperature"),
                oxygen_saturation=vit.get("oxygen_saturation"),
                blood_sugar=vit.get("blood_sugar"),
                height=vit.get("height"),
                weight=vit.get("weight"),
                bmi=vit.get("bmi"),
            ),
            registered_by=data.get("registered_by", ""),
            registered_at=data.get("registered_at", ""),
            updated_at=data.get("updated_at", ""),
            is_active=data.get("is_active", True),
            tags=data.get("tags", []),
            notes=data.get("notes", ""),
            profile_image_url=data.get("profile_image_url", ""),
            emergency_contact=data.get("emergency_contact", ""),
            language_preference=data.get("language_preference", "en"),
        )
