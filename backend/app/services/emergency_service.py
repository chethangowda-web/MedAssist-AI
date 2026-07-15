import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import aiohttp

logger = logging.getLogger(__name__)


class EmergencyService:
    def __init__(self):
        self.emergency_hotlines = {
            "ambulance": "108",
            "police": "100",
            "fire": "101",
            "disaster": "1078",
            "child_helpline": "1098",
            "women_helpline": "181",
            "poison_control": "1800-180-4252",
            "mental_health": "1800-599-0019",
        }

        self.emergency_protocols = {
            "cardiac_arrest": {
                "actions": [
                    "Call 108 immediately",
                    "Check responsiveness",
                    "Start CPR (30 chest compressions, 2 breaths)",
                    "Use AED if available",
                    "Continue until medical help arrives",
                ],
                "critical_window": "First 5 minutes are critical",
            },
            "stroke": {
                "actions": [
                    "Call 108 immediately",
                    "Note time symptoms started",
                    "Keep patient lying flat",
                    "Do not give food or water",
                    "Loosen tight clothing",
                ],
                "critical_window": "Golden hour - first 60 minutes",
            },
            "severe_allergy": {
                "actions": [
                    "Call 108 immediately",
                    "Administer Epinephrine if available",
                    "Keep patient lying down",
                    "Monitor breathing",
                    "Remove allergen if possible",
                ],
                "critical_window": "Minutes matter - anaphylaxis can be fatal",
            },
        }

    def get_emergency_contacts(self) -> Dict[str, str]:
        return self.emergency_hotlines

    def get_emergency_protocol(self, situation: str) -> Optional[Dict[str, Any]]:
        return self.emergency_protocols.get(situation)

    async def find_nearby_hospitals(
        self, latitude: float, longitude: float, radius: int = 5000
    ) -> List[Dict[str, Any]]:
        api_key = None
        try:
            from app.core.config import settings
            api_key = settings.GOOGLE_MAPS_API_KEY
        except Exception:
            api_key = None

        if not api_key:
            return self._get_fallback_hospitals(latitude, longitude)

        try:
            url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            params = {
                "location": f"{latitude},{longitude}",
                "radius": radius,
                "type": "hospital",
                "key": api_key,
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        hospitals = []
                        for place in data.get("results", [])[:10]:
                            hospitals.append({
                                "name": place.get("name"),
                                "address": place.get("vicinity", ""),
                                "rating": place.get("rating", 0),
                                "open_now": place.get("opening_hours", {}).get("open_now") if "opening_hours" in place else None,
                                "location": place.get("geometry", {}).get("location", {}),
                                "place_id": place.get("place_id"),
                                "types": place.get("types", []),
                            })
                        return hospitals
                    else:
                        logger.error(f"Google Places API error: {response.status}")
                        return self._get_fallback_hospitals(latitude, longitude)

        except Exception as e:
            logger.error(f"Error finding nearby hospitals: {e}")
            return self._get_fallback_hospitals(latitude, longitude)

    def _get_fallback_hospitals(self, latitude: float, longitude: float) -> List[Dict[str, Any]]:
        return [
            {
                "name": "Community Health Centre (CHC)",
                "address": "Nearest government hospital",
                "rating": 0,
                "open_now": True,
                "emergency": "24x7",
                "distance": "Nearby",
            },
            {
                "name": "Primary Health Centre (PHC)",
                "address": "Nearest primary care center",
                "rating": 0,
                "open_now": True,
                "emergency": "Daytime",
                "distance": "Nearest village",
            },
            {
                "name": "District Hospital",
                "address": "District-level healthcare facility",
                "rating": 0,
                "open_now": True,
                "emergency": "24x7",
                "distance": "District headquarters",
            },
        ]

    def triage_emergency(self, symptoms: List[str], vital_signs: Dict[str, Any]) -> Dict[str, Any]:
        severity_score = 0
        alerts = []
        required_actions = []

        bp_sys = vital_signs.get("blood_pressure_systolic", 0)
        bp_dia = vital_signs.get("blood_pressure_diastolic", 0)
        hr = vital_signs.get("heart_rate", 0)
        temp = vital_signs.get("temperature", 0)
        o2 = vital_signs.get("oxygen_saturation", 0)
        sugar = vital_signs.get("blood_sugar", 0)

        if bp_sys >= 180 or bp_dia >= 120:
            severity_score += 30
            alerts.append("Hypertensive crisis - immediate referral needed")
            required_actions.append("Call 108 immediately")
        elif bp_sys >= 160:
            severity_score += 15
            alerts.append("Severe hypertension - urgent care needed")
            required_actions.append("Refer to nearest hospital within 24 hours")

        if hr > 120:
            severity_score += 10
            alerts.append("Tachycardia - cardiac evaluation needed")
        elif hr > 100:
            severity_score += 5
            alerts.append("Elevated heart rate")

        if temp >= 104:
            severity_score += 20
            alerts.append("High fever - risk of febrile seizures")
            required_actions.append("Immediate cooling measures and referral")
        elif temp >= 102:
            severity_score += 10
            alerts.append("Moderate fever - monitor closely")

        if o2 < 90:
            severity_score += 30
            alerts.append("Critical hypoxia - oxygen required")
            required_actions.append("Oxygen therapy and immediate hospitalization")
        elif o2 < 95:
            severity_score += 10
            alerts.append("Low oxygen saturation - respiratory assessment needed")

        for symptom in [s.lower() for s in symptoms]:
            if symptom in ["chest pain", "difficulty breathing", "unconscious", "seizure", "severe bleeding"]:
                severity_score += 20
                alerts.append(f"Critical symptom: {symptom}")
                if "Call 108 immediately" not in required_actions:
                    required_actions.append("Call 108 immediately")
            elif symptom in ["severe headache", "blurred vision", "vomiting", "severe abdominal pain"]:
                severity_score += 10
                alerts.append(f"Serious symptom: {symptom}")

        if severity_score >= 50:
            triage_level = "RED - Immediate"
            recommendation = "Life-threatening emergency. Immediate ambulance and hospital referral."
        elif severity_score >= 25:
            triage_level = "YELLOW - Urgent"
            recommendation = "Urgent care needed within 1-2 hours. Arrange transport to nearest hospital."
        else:
            triage_level = "GREEN - Non-urgent"
            recommendation = "Non-emergency. Schedule appointment at nearest PHC/CHC within 24-48 hours."

        return {
            "severity_score": severity_score,
            "triage_level": triage_level,
            "alerts": alerts,
            "required_actions": required_actions,
            "recommendation": recommendation,
            "timestamp": datetime.now().isoformat(),
        }

    async def send_emergency_alert(self, patient_data: Dict[str, Any], location: Dict[str, float]) -> Dict[str, Any]:
        alert = {
            "type": "emergency",
            "patient": patient_data.get("name", "Unknown"),
            "patient_id": patient_data.get("patient_id", ""),
            "risk_level": patient_data.get("risk_level", "unknown"),
            "location": location,
            "timestamp": datetime.now().isoformat(),
            "message": f"EMERGENCY ALERT: {patient_data.get('name', 'Unknown')} requires immediate medical assistance.",
        }

        try:
            from app.services.firestore_service import firestore_service
            from app.models.reminder import Reminder
            import uuid

            reminder = Reminder(
                id=str(uuid.uuid4()),
                patient_id=patient_data.get("patient_id", ""),
                patient_name=patient_data.get("name", ""),
                reminder_type="emergency",
                title=f"EMERGENCY: {patient_data.get('name', 'Unknown')}",
                description=alert["message"],
                priority="high",
                status="pending",
            )
            firestore_service.create_document("reminders", reminder.id, reminder.to_dict())

            alert["alert_id"] = reminder.id
        except Exception as e:
            logger.error(f"Failed to create emergency alert record: {e}")
            alert["alert_id"] = None

        return alert


emergency_service = EmergencyService()
