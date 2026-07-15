from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service
from app.services.firestore_service import firestore_service
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class RiskAssessmentAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Medical Risk Assessment Agent",
            description="Assesses patient medical risks including BP, diabetes, pregnancy, malnutrition, and emergencies"
        )

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        self.log_activity("process_started", "running", {"patient_id": input_data.get("patient_id")})

        try:
            patient_id = input_data.get("patient_id", "")
            patient_data = input_data.get("patient_data", {})

            if not patient_data and patient_id:
                patient_data = firestore_service.get_document("patients", patient_id)

            if not patient_data:
                return {"status": "error", "error": "Patient data not found"}

            risk_assessment = gemini_service.assess_medical_risk(patient_data)

            visit_data = {
                "patient_id": patient_id,
                "patient_name": patient_data.get("name", ""),
                "visit_type": "risk_assessment",
                "chief_complaint": "Automated risk assessment",
                "vital_signs": patient_data.get("vital_signs", {}),
                "diagnosis": [],
                "is_emergency": risk_assessment.get("emergency_warning", False),
                "risk_score": risk_assessment.get("overall_risk_score", 0),
                "risk_level": risk_assessment.get("risk_level", "low"),
                "conducted_by": input_data.get("conducted_by", "medassist_ai"),
                "notes": f"Risk Assessment: {risk_assessment.get('risk_level', 'unknown')}\n"
                         f"Recommendations: {'; '.join(risk_assessment.get('recommendations', []))}",
            }

            from app.models.visit import Visit
            import uuid
            visit = Visit(
                id=str(uuid.uuid4()),
                patient_id=patient_id,
                patient_name=patient_data.get("name", ""),
                visit_type="risk_assessment",
                vital_signs=patient_data.get("vital_signs", {}),
                is_emergency=risk_assessment.get("emergency_warning", False),
                risk_score=risk_assessment.get("overall_risk_score", 0),
                risk_level=risk_assessment.get("risk_level", "low"),
                conducted_by=input_data.get("conducted_by", "medassist_ai"),
                notes=f"Risk Assessment: {risk_assessment.get('risk_level', 'unknown')}\nRecommendations: {'; '.join(risk_assessment.get('recommendations', []))}",
            )
            firestore_service.create_document("visits", visit.id, visit.to_dict())

            patient_update = {
                "risk_score": risk_assessment.get("overall_risk_score", 0),
                "risk_level": risk_assessment.get("risk_level", "low"),
                "updated_at": __import__('datetime').datetime.now().isoformat(),
            }
            if patient_id:
                firestore_service.update_document("patients", patient_id, patient_update)

            self.log_activity("assessment_completed", "success", {
                "patient_id": patient_id,
                "risk_level": risk_assessment.get("risk_level"),
                "risk_score": risk_assessment.get("overall_risk_score"),
            })

            return {
                "status": "success",
                "patient_id": patient_id,
                "overall_risk_score": risk_assessment.get("overall_risk_score", 0),
                "risk_level": risk_assessment.get("risk_level", "low"),
                "assessments": risk_assessment.get("assessments", []),
                "recommendations": risk_assessment.get("recommendations", []),
                "emergency_warning": risk_assessment.get("emergency_warning", False),
                "emergency_reason": risk_assessment.get("emergency_reason"),
                "visit_id": visit.id,
            }

        except Exception as e:
            self.log_activity("assessment_failed", "error", {"error": str(e)})
            return {"status": "error", "error": str(e)}

risk_assessment_agent = RiskAssessmentAgent()
