from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service
from app.services.firestore_service import firestore_service
from app.models.patient import Patient, Address, MedicalHistory, VitalSigns
from typing import Dict, Any, Optional
from datetime import datetime
import re
import logging

logger = logging.getLogger(__name__)

class PatientRegistrationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Patient Registration Agent",
            description="Registers patients by extracting information from natural language or structured data"
        )

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        self.log_activity("process_started", "running", {"input_keys": list(input_data.keys())})

        try:
            mode = input_data.get("mode", "structured")

            if mode == "natural_language":
                result = await self._register_from_natural_language(input_data)
            else:
                result = await self._register_from_structured(input_data)

            self.log_activity("process_completed", "success", {"patient_id": result.get("patient_id")})
            return result

        except Exception as e:
            self.log_activity("process_failed", "error", {"error": str(e)})
            return {
                "status": "error",
                "error": str(e),
                "patient_id": None,
            }

    def _regex_extract_patient_info(self, text: str) -> Dict[str, Any]:
        result = {
            "name": "", "age": None, "gender": "", "phone": "",
            "address": {"street": "", "city": "", "state": "", "pincode": "", "village": ""},
            "symptoms": [], "medical_conditions": [], "vital_signs": {},
            "emergency": False,
        }
        name_match = re.search(r'(?:Register|Name|Patient|Pt)\s*:?\s*([A-Za-z\s]+?)(?:,|\s+\d|\n|$)', text, re.IGNORECASE)
        if name_match:
            result["name"] = name_match.group(1).strip()
        age_match = re.search(r'(\d+)\s*(?:years?\s*old|yr|y)', text, re.IGNORECASE)
        if age_match:
            result["age"] = int(age_match.group(1))
        gender_match = re.search(r'\b(male|female|man|woman|boy|girl)\b', text, re.IGNORECASE)
        if gender_match:
            raw = gender_match.group(1).lower()
            if raw in ("male", "man", "boy"):
                result["gender"] = "male"
            elif raw in ("female", "woman", "girl"):
                result["gender"] = "female"
        phone_match = re.search(r'(\+?\d[\d\s\-\(\)]{7,}\d)', text)
        if phone_match:
            result["phone"] = phone_match.group(1).strip()
        village_match = re.search(r'(?:village|town|area)\s+(?:of\s+)?([A-Za-z\s]+?)(?:,|\.|$)', text, re.IGNORECASE)
        if village_match:
            result["address"]["village"] = village_match.group(1).strip()
        symptom_keywords = ["fever", "headache", "cough", "cold", "pain", "nausea", "vomiting",
                           "fatigue", "dizziness", "rash", "infection", "diarrhea", "constipation",
                           "breathlessness", "swelling", "body ache", "chills"]
        text_lower = text.lower()
        for kw in symptom_keywords:
            if kw in text_lower:
                result["symptoms"].append(kw.capitalize())
        return result

    async def _register_from_natural_language(self, data: Dict[str, Any]) -> Dict[str, Any]:
        text = data.get("text", "")
        registered_by = data.get("registered_by", "")

        extracted = gemini_service.extract_patient_info(text)
        if not extracted.get("name") and not extracted.get("age") and not extracted.get("gender"):
            extracted = self._regex_extract_patient_info(text)

        patient = Patient(
            name=extracted.get("name", ""),
            age=extracted.get("age"),
            gender=extracted.get("gender", ""),
            phone=extracted.get("phone", ""),
            address=Address(
                street=extracted.get("address", {}).get("street", ""),
                city=extracted.get("address", {}).get("city", ""),
                state=extracted.get("address", {}).get("state", ""),
                pincode=extracted.get("address", {}).get("pincode", ""),
                village=extracted.get("address", {}).get("village", ""),
            ),
            registered_by=registered_by,
            notes=text,
        )

        if extracted.get("vital_signs"):
            vs = extracted["vital_signs"]
            patient.vital_signs.blood_pressure_systolic = vs.get("blood_pressure_systolic")
            patient.vital_signs.blood_pressure_diastolic = vs.get("blood_pressure_diastolic")
            patient.vital_signs.heart_rate = vs.get("heart_rate")
            patient.vital_signs.temperature = vs.get("temperature")
            patient.vital_signs.weight = vs.get("weight")
            patient.vital_signs.blood_sugar = vs.get("blood_sugar")

        if extracted.get("medical_conditions"):
            patient.medical_history.conditions = extracted["medical_conditions"]

        if extracted.get("symptoms"):
            patient.tags = extracted["symptoms"][:5]

        patient_data = patient.to_dict()
        firestore_service.create_document("patients", patient.id, patient_data)

        return {
            "status": "success",
            "patient_id": patient.id,
            "patient": patient_data,
            "extracted_data": extracted,
            "registration_method": "natural_language",
        }

    async def _register_from_structured(self, data: Dict[str, Any]) -> Dict[str, Any]:
        patient = Patient(
            name=data.get("name", ""),
            age=data.get("age"),
            date_of_birth=data.get("date_of_birth"),
            gender=data.get("gender", ""),
            phone=data.get("phone", ""),
            alternate_phone=data.get("alternate_phone", ""),
            email=data.get("email", ""),
            address=Address(
                street=data.get("address", {}).get("street", ""),
                city=data.get("address", {}).get("city", ""),
                state=data.get("address", {}).get("state", ""),
                pincode=data.get("address", {}).get("pincode", ""),
                village=data.get("address", {}).get("village", ""),
            ),
            aadhar_number=data.get("aadhar_number", ""),
            blood_group=data.get("blood_group", ""),
            registered_by=data.get("registered_by", ""),
            notes=data.get("notes", ""),
            emergency_contact=data.get("emergency_contact", ""),
            language_preference=data.get("language_preference", "en"),
        )

        if data.get("medical_history"):
            mh = data["medical_history"]
            patient.medical_history = MedicalHistory(
                conditions=mh.get("conditions", []),
                surgeries=mh.get("surgeries", []),
                allergies=mh.get("allergies", []),
                medications=mh.get("medications", []),
                family_history=mh.get("family_history", []),
            )

        if data.get("vital_signs"):
            vs = data["vital_signs"]
            patient.vital_signs = VitalSigns(
                blood_pressure_systolic=vs.get("blood_pressure_systolic"),
                blood_pressure_diastolic=vs.get("blood_pressure_diastolic"),
                heart_rate=vs.get("heart_rate"),
                temperature=vs.get("temperature"),
                oxygen_saturation=vs.get("oxygen_saturation"),
                blood_sugar=vs.get("blood_sugar"),
                height=vs.get("height"),
                weight=vs.get("weight"),
                bmi=vs.get("bmi"),
            )

        patient_data = patient.to_dict()
        firestore_service.create_document("patients", patient.id, patient_data)

        return {
            "status": "success",
            "patient_id": patient.id,
            "patient": patient_data,
            "registration_method": "structured",
        }

    async def get_patient(self, patient_id: str) -> Optional[Dict[str, Any]]:
        return firestore_service.get_document("patients", patient_id)

    async def search_patients(self, query: str) -> list:
        all_patients, _ = firestore_service.list_documents("patients", limit=100)
        query = query.lower()
        return [
            p for p in all_patients
            if query in p.get("name", "").lower()
            or query in p.get("phone", "")
            or query in p.get("patient_id", "").lower()
        ]

patient_registration_agent = PatientRegistrationAgent()
