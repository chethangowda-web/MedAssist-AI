import google.generativeai as genai
from app.core.config import settings
from typing import List, Dict, Any, Optional
import json
import re
import time
import logging
import httpx

logger = logging.getLogger(__name__)

FALLBACK_RESPONSES = {
    "extract_patient_info": {
        "name": "", "age": None, "gender": "", "phone": "", "address": {"street": "", "city": "", "state": "", "pincode": "", "village": ""},
        "symptoms": [], "medical_conditions": [], "vital_signs": {}, "emergency": False,
    },
    "assess_medical_risk": {
        "overall_risk_score": 0.0, "risk_level": "unknown",
        "assessments": [], "recommendations": ["Unable to assess risk - AI service unavailable"],
        "emergency_warning": False, "emergency_reason": None,
    },
    "generate_report_content": {
        "title": "Medical Report", "summary": "AI report generation was unavailable.",
        "sections": [{"heading": "Note", "content": "AI service is temporarily unavailable. Please try again later.", "type": "text"}],
        "recommendations": [], "referral_notes": None,
    },
    "recommend_schemes": {
        "recommended_schemes": [], "total_recommended": 0,
        "general_advice": "AI service is temporarily unavailable. Please check back later for scheme recommendations.",
    },
    "generate_reminder_schedule": {
        "reminders": [], "total_reminders": 0,
        "schedule_summary": "Unable to generate reminders - AI service unavailable.",
    },
    "answer_medical_query": "AI service is temporarily unavailable. Please try again later.",
}


def _rule_based_risk(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    vs = patient_data.get("vital_signs", {})
    bp_sys = vs.get("blood_pressure_systolic") or vs.get("blood_pressure", {}).get("systolic")
    bp_dia = vs.get("blood_pressure_diastolic") or vs.get("blood_pressure", {}).get("diastolic")
    hr = vs.get("heart_rate")
    temp = vs.get("temperature")
    o2 = vs.get("oxygen_saturation")
    sugar = vs.get("blood_sugar")

    assessments = []
    total_risk = 0.0
    max_score = 0

    # Blood pressure
    if bp_sys is not None and bp_dia is not None:
        max_score += 4
        if bp_sys >= 180 or bp_dia >= 120:
            assessments.append({"condition": "Hypertensive Crisis", "risk_score": 1.0, "risk_level": "critical", "reasoning": f"BP {bp_sys}/{bp_dia}", "recommendations": ["Immediate hospital referral", "Call 108"]})
            total_risk += 4
        elif bp_sys >= 140 or bp_dia >= 90:
            assessments.append({"condition": "High Blood Pressure", "risk_score": 0.6, "risk_level": "high", "reasoning": f"BP {bp_sys}/{bp_dia}", "recommendations": ["Monitor BP daily", "Reduce salt intake", "Consult doctor"]})
            total_risk += 2.4
            max_score -= 2
        elif bp_sys >= 130:
            assessments.append({"condition": "Pre-hypertension", "risk_score": 0.3, "risk_level": "medium", "reasoning": f"BP {bp_sys}/{bp_dia}", "recommendations": ["Lifestyle modifications", "Regular monitoring"]})
            total_risk += 1.2

    if bp_sys is not None:
        max_score += 2
    if bp_dia is not None:
        max_score += 2

    # Heart rate
    if hr is not None:
        max_score += 2
        if hr > 120:
            assessments.append({"condition": "Tachycardia", "risk_score": 0.7, "risk_level": "high", "reasoning": f"Heart rate {hr} bpm", "recommendations": ["Cardiac evaluation", "ECG recommended"]})
            total_risk += 1.4
        elif hr > 100:
            assessments.append({"condition": "Elevated Heart Rate", "risk_score": 0.4, "risk_level": "medium", "reasoning": f"Heart rate {hr} bpm", "recommendations": ["Monitor heart rate"]})
            total_risk += 0.8
        elif hr < 60:
            assessments.append({"condition": "Bradycardia", "risk_score": 0.3, "risk_level": "medium", "reasoning": f"Heart rate {hr} bpm", "recommendations": ["Cardiac evaluation if symptomatic"]})
            total_risk += 0.6

    # Temperature
    if temp is not None:
        max_score += 2
        if temp >= 104:
            assessments.append({"condition": "High Fever", "risk_score": 0.8, "risk_level": "high", "reasoning": f"Temperature {temp}°F", "recommendations": ["Immediate cooling measures", "Medical evaluation"]})
            total_risk += 1.6
        elif temp >= 101:
            assessments.append({"condition": "Fever", "risk_score": 0.4, "risk_level": "medium", "reasoning": f"Temperature {temp}°F", "recommendations": ["Antipyretics as needed", "Monitor temperature"]})
            total_risk += 0.8

    # Oxygen saturation
    if o2 is not None:
        max_score += 2
        if o2 < 90:
            assessments.append({"condition": "Severe Hypoxia", "risk_score": 1.0, "risk_level": "critical", "reasoning": f"SpO2 {o2}%", "recommendations": ["Oxygen therapy", "Immediate hospitalization"]})
            total_risk += 2
        elif o2 < 95:
            assessments.append({"condition": "Low Oxygen", "risk_score": 0.5, "risk_level": "medium", "reasoning": f"SpO2 {o2}%", "recommendations": ["Respiratory assessment", "Monitor oxygen levels"]})
            total_risk += 1

    # Blood sugar
    if sugar is not None:
        max_score += 2
        if sugar > 200:
            assessments.append({"condition": "High Blood Sugar", "risk_score": 0.6, "risk_level": "high", "reasoning": f"Blood sugar {sugar} mg/dL", "recommendations": ["Diabetes management", "Consult doctor"]})
            total_risk += 1.2
        elif sugar > 140:
            assessments.append({"condition": "Elevated Blood Sugar", "risk_score": 0.3, "risk_level": "medium", "reasoning": f"Blood sugar {sugar} mg/dL", "recommendations": ["Monitor blood sugar", "Dietary modifications"]})
            total_risk += 0.6

    overall = total_risk / max_score if max_score > 0 else 0.0
    overall = min(overall, 1.0)

    if overall >= 0.7:
        risk_level = "critical"
    elif overall >= 0.4:
        risk_level = "high"
    elif overall >= 0.2:
        risk_level = "medium"
    else:
        risk_level = "low"

    emergency = any(a.get("risk_level") == "critical" for a in assessments)
    emergency_reason = next((a["reasoning"] for a in assessments if a.get("risk_level") == "critical"), None)

    recommendations = []
    for a in assessments:
        recommendations.extend(a.get("recommendations", []))
    recommendations = list(dict.fromkeys(recommendations))

    return {
        "overall_risk_score": round(overall, 2),
        "risk_level": risk_level,
        "assessments": assessments,
        "recommendations": recommendations or ["Routine monitoring recommended"],
        "emergency_warning": emergency,
        "emergency_reason": emergency_reason,
    }


class GeminiService:
    def __init__(self):
        self._model = None
        self._configured = False
        self._max_retries = 2
        self._base_delay = 1.0
        self._try_configure()

    def _try_configure(self):
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your-gemini-api-key":
            logger.warning("Gemini API key not configured. AI features will use rule-based or fallback responses.")
            return
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._model = genai.GenerativeModel(settings.GEMINI_MODEL)
            self._configured = True
            logger.info(f"Gemini configured with model: {settings.GEMINI_MODEL}")
        except Exception as e:
            logger.warning(f"Failed to configure Gemini: {e}. Will use alternate provider or rule-based fallback.")

    def _call_with_retry(self, prompt: str) -> Optional[Any]:
        if not self._configured:
            return None
        last_error = None
        for attempt in range(self._max_retries):
            try:
                response = self._model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=2048,
                        temperature=0.3,
                    ),
                    request_options={"timeout": 15},
                )
                return response
            except Exception as e:
                last_error = e
                error_str = str(e)
                if "429" in error_str or "quota" in error_str.lower() or "RESOURCE_EXHAUSTED" in error_str:
                    delay = self._base_delay * (2 ** attempt)
                    logger.warning(f"Gemini quota exceeded (attempt {attempt+1}/{self._max_retries}), retrying in {delay}s")
                    time.sleep(delay)
                elif attempt == 0 and ("403" in error_str or "400" in error_str or "API_KEY" in error_str.upper() or "not found" in error_str.lower() or "PERMISSION_DENIED" in error_str):
                    logger.error(f"Gemini permanent error (not retrying): {e}")
                    self._configured = False
                    return None
                elif attempt < self._max_retries - 1:
                    delay = self._base_delay * (2 ** attempt)
                    logger.warning(f"Gemini API error (attempt {attempt+1}/{self._max_retries}): {e}, retrying in {delay}s")
                    time.sleep(delay)
                else:
                    logger.error(f"Gemini API failed after {self._max_retries} attempts: {e}")
        return None

    def _call_openai_compat(self, prompt: str, base_url: str, api_key: str, model: str, schema: Optional[Dict] = None) -> Optional[str]:
        if not api_key:
            return None
        try:
            messages = [{"role": "user", "content": prompt}]
            payload = {
                "model": model,
                "messages": messages,
                "max_tokens": 2048,
                "temperature": 0.3,
            }
            if schema:
                payload["response_format"] = {"type": "json_object"}
            resp = httpx.post(
                base_url.rstrip("/") + "/chat/completions",
                json=payload,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                timeout=15,
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            logger.warning(f"{model} error {resp.status_code}: {resp.text[:200]}")
            return None
        except Exception as e:
            logger.warning(f"{model} call failed: {e}")
            return None

    def _call_ollama(self, prompt: str, schema: Optional[Dict] = None) -> Optional[str]:
        base_url = settings.OLLAMA_BASE_URL
        model = settings.OLLAMA_MODEL
        if not base_url or not model:
            return None
        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.3, "num_predict": 2048},
            }
            resp = httpx.post(base_url.rstrip("/") + "/api/generate", json=payload, timeout=60)
            if resp.status_code == 200:
                return resp.json().get("response", "")
            logger.warning(f"Ollama error {resp.status_code}: {resp.text[:200]}")
            return None
        except Exception as e:
            logger.warning(f"Ollama call failed: {e}")
            return None

    def _call_fallback_providers(self, prompt: str, schema: Optional[Dict] = None) -> Optional[str]:
        providers = [
            (self._call_openai_compat, settings.OPENROUTER_API_KEY, "https://openrouter.ai/api/v1", settings.OPENROUTER_MODEL or "google/gemini-2.0-flash-001"),
            (self._call_openai_compat, settings.OPENAI_API_KEY, "https://api.openai.com/v1", settings.OPENAI_MODEL or "gpt-4o-mini"),
            (self._call_openai_compat, settings.GROQ_API_KEY, "https://api.groq.com/openai/v1", settings.GROQ_MODEL or "llama-3.3-70b-versatile"),
        ]
        for provider_fn, api_key, base_url, model in providers:
            result = provider_fn(prompt, base_url, api_key, model, schema)
            if result:
                logger.info(f"Fallback provider {model} succeeded")
                return result
        if schema:
            result = self._call_ollama(prompt, schema)
            if result:
                return result
        return None

    def generate_structured_output(self, prompt: str, system_prompt: str, output_schema: Dict[str, Any]) -> Dict[str, Any]:
        full_prompt = f"""{system_prompt}

OUTPUT SCHEMA:
{json.dumps(output_schema, indent=2)}

DATA:
{prompt}

IMPORTANT: Return ONLY valid JSON matching the schema above. No markdown, no code blocks."""
        response = self._call_with_retry(full_prompt)
        if response is not None:
            text = response.text.strip()
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                pass

        alt = self._call_fallback_providers(full_prompt, output_schema)
        if alt:
            try:
                return json.loads(alt)
            except json.JSONDecodeError:
                pass

        return {"error": "AI service unavailable"}

    def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        response = self._call_with_retry(full_prompt)
        if response is not None:
            return response.text
        alt = self._call_fallback_providers(full_prompt)
        if alt:
            return alt
        return "AI service is temporarily unavailable. Please try again later."

    def extract_patient_info(self, natural_language_text: str) -> Dict[str, Any]:
        system_prompt = """You are a medical data extraction specialist. Extract patient information from natural language text.
Extract all possible fields: name, age, gender, phone, address, symptoms, medical history, vital signs.
For any field not found, return null or empty string."""
        schema = {
            "name": "string or null",
            "age": "number or null",
            "gender": "string or null (male/female/other)",
            "phone": "string or null",
            "address": {"street": "string", "city": "string", "state": "string", "pincode": "string", "village": "string"},
            "symptoms": ["list of strings"],
            "medical_conditions": ["list of strings"],
            "vital_signs": {"blood_pressure": "string or null", "heart_rate": "number or null", "temperature": "number or null", "weight": "number or null", "blood_sugar": "number or null"},
            "emergency": "boolean",
        }
        result = self.generate_structured_output(natural_language_text, system_prompt, schema)
        if "error" in result:
            return FALLBACK_RESPONSES["extract_patient_info"]
        return result

    def assess_medical_risk(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = """You are a medical risk assessment AI. Analyze patient data and provide risk scores.
Assess risks for: High Blood Pressure, Diabetes, Pregnancy Complications, Malnutrition, Emergency Conditions.
Return risk scores from 0.0 to 1.0 with detailed reasoning."""
        schema = {
            "overall_risk_score": "float 0.0 to 1.0",
            "risk_level": "string (low/medium/high/critical)",
            "assessments": [{"condition": "string", "risk_score": "float 0.0 to 1.0", "risk_level": "string", "reasoning": "string", "recommendations": ["string"]}],
            "recommendations": ["string"],
            "emergency_warning": "boolean",
            "emergency_reason": "string or null",
        }
        result = self.generate_structured_output(json.dumps(patient_data, indent=2), system_prompt, schema)
        if "error" in result:
            return _rule_based_risk(patient_data)
        return result

    def generate_report_content(self, report_type: str, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = f"""You are a medical report generator. Generate a {report_type} based on patient data.
Include all relevant medical information in a professional format."""
        schema = {
            "title": "string",
            "summary": "string",
            "sections": [{"heading": "string", "content": "string", "type": "string (text/table/list)"}],
            "recommendations": ["string"],
            "referral_notes": "string or null",
        }
        result = self.generate_structured_output(json.dumps(patient_data, indent=2), system_prompt, schema)
        if "error" in result:
            return FALLBACK_RESPONSES["generate_report_content"]
        return result

    def recommend_schemes(self, patient_profile: Dict[str, Any], available_schemes: List[Dict[str, Any]]) -> Dict[str, Any]:
        system_prompt = """You are a government healthcare scheme advisor. Analyze patient profiles against available schemes.
Recommend the most suitable schemes with eligibility reasoning."""
        schema = {
            "recommended_schemes": [{"scheme_name": "string", "match_score": "float 0.0 to 1.0", "eligibility_reason": "string", "benefits": ["string"], "application_steps": "string"}],
            "total_recommended": "integer",
            "general_advice": "string",
        }
        prompt = f"PATIENT PROFILE:\n{json.dumps(patient_profile, indent=2)}\n\nAVAILABLE SCHEMES:\n{json.dumps(available_schemes, indent=2)}"
        result = self.generate_structured_output(prompt, system_prompt, schema)
        if "error" in result:
            return FALLBACK_RESPONSES["recommend_schemes"]
        return result

    def generate_reminder_schedule(self, patient_data: Dict[str, Any], reminder_type: str) -> Dict[str, Any]:
        system_prompt = f"""You are a medical scheduling AI. Generate a {reminder_type} schedule for the patient.
Create appropriate reminders with dates and descriptions."""
        schema = {
            "reminders": [{"title": "string", "description": "string", "suggested_date": "string", "suggested_time": "string", "priority": "string (low/medium/high)", "notes": "string"}],
            "total_reminders": "integer",
            "schedule_summary": "string",
        }
        result = self.generate_structured_output(json.dumps(patient_data, indent=2), system_prompt, schema)
        if "error" in result:
            return FALLBACK_RESPONSES["generate_reminder_schedule"]
        return result

    def answer_medical_query(self, query: str, context: List[Dict[str, Any]]) -> str:
        context_text = "\n\n".join([f"Source: {c.get('metadata', {}).get('source', 'Unknown')}\n{c.get('text', '')}" for c in context])
        prompt = f"""CONTEXT FROM MEDICAL KNOWLEDGE BASE:\n{context_text}\n\nUSER QUERY:\n{query}\n\nProvide a helpful, accurate response based on the context above. Include relevant WHO guidelines or government scheme information where applicable."""
        result = self.generate_response(prompt)
        if "unavailable" in result.lower():
            return FALLBACK_RESPONSES["answer_medical_query"]
        return result


gemini_service = GeminiService()
