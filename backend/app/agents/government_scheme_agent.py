from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service
from app.services.firestore_service import firestore_service
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class GovernmentSchemeAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Government Scheme Agent",
            description="Suggests Ayushman Bharat, maternal schemes, child schemes, and insurance based on patient profile"
        )

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        self.log_activity("process_started", "running", {"patient_id": input_data.get("patient_id")})

        try:
            patient_id = input_data.get("patient_id", "")
            patient_profile = input_data.get("patient_profile", {})

            if not patient_profile and patient_id:
                patient_data = firestore_service.get_document("patients", patient_id)
                if patient_data:
                    patient_profile = {
                        "age": patient_data.get("age"),
                        "gender": patient_data.get("gender"),
                        "blood_group": patient_data.get("blood_group"),
                        "address": patient_data.get("address", {}),
                        "medical_history": patient_data.get("medical_history", {}),
                        "vital_signs": patient_data.get("vital_signs", {}),
                        "is_pregnant": False,
                        "has_children": False,
                        "monthly_income": None,
                        "bpl_card": False,
                        "aadhar_number": patient_data.get("aadhar_number", ""),
                    }

            schemes = self._get_default_schemes()

            recommendation = gemini_service.recommend_schemes(patient_profile, schemes)

            recommended = recommendation.get("recommended_schemes", [])

            self.log_activity("recommendation_completed", "success", {
                "patient_id": patient_id,
                "schemes_recommended": len(recommended),
            })

            return {
                "status": "success",
                "patient_id": patient_id,
                "recommended_schemes": recommended,
                "total_schemes": len(recommended),
                "general_advice": recommendation.get("general_advice", ""),
                "all_schemes": schemes,
            }

        except Exception as e:
            self.log_activity("recommendation_failed", "error", {"error": str(e)})
            return {"status": "error", "error": str(e)}

    def _get_default_schemes(self) -> List[Dict[str, Any]]:
        return [
            {
                "scheme_id": "ayushman_bharat",
                "name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
                "category": "health_insurance",
                "description": "World's largest health insurance scheme providing coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization",
                "eligibility": ["Below poverty line families", "Identified based on SECC database"],
                "benefits": ["Cashless treatment", "Coverage up to ₹5 lakh", "Pre-existing diseases covered from day one", "3 days pre-hospitalization and 15 days post-hospitalization expenses"],
                "coverage_amount": "₹5,00,000",
                "helpline": "14555",
            },
            {
                "scheme_id": "pradhan_mantri_matru_vandana",
                "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
                "category": "maternal",
                "description": "Maternity benefit program providing cash incentives to pregnant and lactating women",
                "eligibility": ["Pregnant women of 19+ years", "First living child", "Government approved institutions"],
                "benefits": ["₹5,000 cash benefit in three installments", "Compensation for wage loss"],
                "coverage_amount": "₹5,000",
                "helpline": "011-23382281",
            },
            {
                "scheme_id": "janani_suraksha",
                "name": "Janani Suraksha Yojana (JSY)",
                "category": "maternal",
                "description": "Safe motherhood intervention under National Rural Health Mission",
                "eligibility": ["Pregnant women in BPL families", "Women 19+ years"],
                "benefits": ["₹1,400 in rural areas", "₹1,000 in urban areas", "Free delivery services"],
                "coverage_amount": "₹1,400",
                "helpline": "1800-180-4242",
            },
            {
                "scheme_id": "mission_indradhanush",
                "name": "Mission Indradhanush",
                "category": "child",
                "description": "Universal immunization program covering all vaccines under UIP",
                "eligibility": ["Children under 2 years", "Pregnant women"],
                "benefits": ["Free vaccination against 12 diseases", "DPT, Hepatitis B, Polio, Measles, TB, etc."],
                "coverage_amount": "Free",
                "helpline": "1800-180-4242",
            },
            {
                "scheme_id": "rashtriya_bal_swasthya",
                "name": "Rashtriya Bal Swasthya Karyakram (RBSK)",
                "category": "child",
                "description": "Child health screening and early intervention program for 4D conditions",
                "eligibility": ["Children 0-18 years"],
                "benefits": ["Free health screening", "Free treatment for 30 health conditions", "Surgery at free of cost"],
                "coverage_amount": "Free",
                "helpline": "1800-180-4242",
            },
            {
                "scheme_id": "pm_nutrition",
                "name": "Pradhan Mantri Poshan Shakti Nirman (PM POSHAN)",
                "category": "child_nutrition",
                "description": "National nutrition program providing meals to school children",
                "eligibility": ["Children in government schools", "Children 6-14 years"],
                "benefits": ["Free nutritious meals", "Improved nutritional status"],
                "coverage_amount": "Free",
            },
            {
                "scheme_id": "ayushman_bharat_hwc",
                "name": "Ayushman Bharat Health & Wellness Centres",
                "category": "primary_care",
                "description": "Comprehensive primary healthcare centers at village level",
                "eligibility": ["All residents"],
                "benefits": ["Free essential medicines", "Free diagnostic services", "Teleconsultation", "Wellness services"],
                "coverage_amount": "Free",
            },
            {
                "scheme_id": "nhm",
                "name": "National Health Mission (NHM)",
                "category": "health",
                "description": "Strengthening healthcare delivery at all levels, especially rural areas",
                "eligibility": ["All citizens", "Focus on rural, poor, vulnerable"],
                "benefits": ["ASHA workers", "Free medicines", "Mobile medical units", "Disease control programs"],
                "coverage_amount": "Free/Varies",
            },
            {
                "scheme_id": "pm_jeevan_jyoti",
                "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
                "category": "insurance",
                "description": "Life insurance scheme for all citizens aged 18-50",
                "eligibility": ["Age 18-50 years", "Savings bank account"],
                "benefits": ["Life coverage of ₹2 lakh", "Annual premium ₹436"],
                "coverage_amount": "₹2,00,000",
                "helpline": "1800-180-4242",
            },
            {
                "scheme_id": "pm_suraksha_bima",
                "name": "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
                "category": "insurance",
                "description": "Accident insurance scheme for all citizens",
                "eligibility": ["Age 18-70 years", "Savings bank account"],
                "benefits": ["Accident coverage ₹2 lakh", "Annual premium ₹20"],
                "coverage_amount": "₹2,00,000",
                "helpline": "1800-180-4242",
            },
            {
                "scheme_id": "rashtriya_swasthya_bima",
                "name": "Rashtriya Swasthya Bima Yojana (RSBY)",
                "category": "health_insurance",
                "description": "Health insurance for BPL families and unorganized sector workers",
                "eligibility": ["BPL families", "Unorganized sector workers"],
                "benefits": ["Coverage up to ₹30,000", "Cashless treatment", "Transport allowance"],
                "coverage_amount": "₹30,000",
                "helpline": "1800-180-4242",
            },
            {
                "scheme_id": "pm_mudra",
                "name": "Pradhan Mantri Mudra Yojana (PMMY)",
                "category": "financial",
                "description": "Loans up to ₹10 lakh for non-corporate small businesses including healthcare workers",
                "eligibility": ["Small business owners", "Healthcare workers", "Women entrepreneurs"],
                "benefits": ["Loans up to ₹10 lakh", "No collateral", "Three categories: Shishu, Kishor, Tarun"],
                "coverage_amount": "₹10,00,000",
                "helpline": "1800-180-4242",
            },
        ]

    async def get_scheme_details(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        schemes = self._get_default_schemes()
        for scheme in schemes:
            if scheme["scheme_id"] == scheme_id:
                return scheme
        return None

    async def get_schemes_by_category(self, category: str) -> List[Dict[str, Any]]:
        schemes = self._get_default_schemes()
        return [s for s in schemes if s["category"] == category]

government_scheme_agent = GovernmentSchemeAgent()
