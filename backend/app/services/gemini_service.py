import google.generativeai as genai
from app.core.config import settings
from typing import List, Dict, Any, Optional
import json
import re

class GeminiService:
    def __init__(self):
        self._model = None
        self._configured = False
    
    def _configure(self):
        if not self._configured and settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key":
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._model = genai.GenerativeModel(settings.GEMINI_MODEL)
            self._configured = True

    def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        self._configure()
        if not self._configured:
            return "Gemini API not configured. Please set GEMINI_API_KEY in environment."
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        response = self._model.generate_content(full_prompt)
        return response.text

    def generate_structured_output(self, prompt: str, system_prompt: str, output_schema: Dict[str, Any]) -> Dict[str, Any]:
        self._configure()
        if not self._configured:
            return {"error": "Gemini API not configured. Please set GEMINI_API_KEY in environment."}
        full_prompt = f"""{system_prompt}

OUTPUT SCHEMA:
{json.dumps(output_schema, indent=2)}

DATA:
{prompt}

IMPORTANT: Return ONLY valid JSON matching the schema above. No markdown, no code blocks."""
        response = self._model.generate_content(full_prompt)
        text = response.text.strip()
        text = re.sub(r'^```(?:json)?\s*', '', text)
        text = re.sub(r'\s*```$', '', text)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"raw_response": text, "error": "Failed to parse structured output"}

    def extract_patient_info(self, natural_language_text: str) -> Dict[str, Any]:
        self._configure()
        if not self._configured:
            return {"error": "Gemini API not configured"}
        system_prompt = """You are a medical data extraction specialist. Extract patient information from natural language text.
Extract all possible fields: name, age, gender, phone, address, symptoms, medical history, vital signs.
For any field not found, return null or empty string."""
        schema = {
            "name": "string or null",
            "age": "number or null",
            "gender": "string or null (male/female/other)",
            "phone": "string or null",
            "address": {
                "street": "string",
                "city": "string",
                "state": "string",
                "pincode": "string",
                "village": "string"
            },
            "symptoms": ["list of strings"],
            "medical_conditions": ["list of strings"],
            "vital_signs": {
                "blood_pressure": "string or null",
                "heart_rate": "number or null",
                "temperature": "number or null",
                "weight": "number or null",
                "blood_sugar": "number or null"
            },
            "emergency": "boolean"
        }
        return self.generate_structured_output(natural_language_text, system_prompt, schema)

    def assess_medical_risk(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        self._configure()
        if not self._configured:
            return {"error": "Gemini API not configured"}
        system_prompt = """You are a medical risk assessment AI. Analyze patient data and provide risk scores.
Assess risks for: High Blood Pressure, Diabetes, Pregnancy Complications, Malnutrition, Emergency Conditions.
Return risk scores from 0.0 to 1.0 with detailed reasoning."""
        schema = {
            "overall_risk_score": "float 0.0 to 1.0",
            "risk_level": "string (low/medium/high/critical)",
            "assessments": [{
                "condition": "string",
                "risk_score": "float 0.0 to 1.0",
                "risk_level": "string",
                "reasoning": "string",
                "recommendations": ["string"]
            }],
            "recommendations": ["string"],
            "emergency_warning": "boolean",
            "emergency_reason": "string or null"
        }
        return self.generate_structured_output(json.dumps(patient_data, indent=2), system_prompt, schema)

    def generate_report_content(self, report_type: str, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        self._configure()
        if not self._configured:
            return {"error": "Gemini API not configured"}
        system_prompt = f"""You are a medical report generator. Generate a {report_type} based on patient data.
Include all relevant medical information in a professional format."""
        schema = {
            "title": "string",
            "summary": "string",
            "sections": [{
                "heading": "string",
                "content": "string",
                "type": "string (text/table/list)"
            }],
            "recommendations": ["string"],
            "referral_notes": "string or null"
        }
        return self.generate_structured_output(json.dumps(patient_data, indent=2), system_prompt, schema)

    def recommend_schemes(self, patient_profile: Dict[str, Any], available_schemes: List[Dict[str, Any]]) -> Dict[str, Any]:
        self._configure()
        if not self._configured:
            return {"error": "Gemini API not configured"}
        system_prompt = """You are a government healthcare scheme advisor. Analyze patient profiles against available schemes.
Recommend the most suitable schemes with eligibility reasoning."""
        schema = {
            "recommended_schemes": [{
                "scheme_name": "string",
                "match_score": "float 0.0 to 1.0",
                "eligibility_reason": "string",
                "benefits": ["string"],
                "application_steps": "string"
            }],
            "total_recommended": "integer",
            "general_advice": "string"
        }
        prompt = f"PATIENT PROFILE:\n{json.dumps(patient_profile, indent=2)}\n\nAVAILABLE SCHEMES:\n{json.dumps(available_schemes, indent=2)}"
        return self.generate_structured_output(prompt, system_prompt, schema)

    def generate_reminder_schedule(self, patient_data: Dict[str, Any], reminder_type: str) -> Dict[str, Any]:
        self._configure()
        if not self._configured:
            return {"error": "Gemini API not configured"}
        system_prompt = f"""You are a medical scheduling AI. Generate a {reminder_type} schedule for the patient.
Create appropriate reminders with dates and descriptions."""
        schema = {
            "reminders": [{
                "title": "string",
                "description": "string",
                "suggested_date": "string",
                "suggested_time": "string",
                "priority": "string (low/medium/high)",
                "notes": "string"
            }],
            "total_reminders": "integer",
            "schedule_summary": "string"
        }
        return self.generate_structured_output(json.dumps(patient_data, indent=2), system_prompt, schema)

    def answer_medical_query(self, query: str, context: List[Dict[str, Any]]) -> str:
        self._configure()
        if not self._configured:
            return "Gemini API not configured. Please set GEMINI_API_KEY in environment."
        context_text = "\n\n".join([f"Source: {c.get('metadata', {}).get('source', 'Unknown')}\n{c.get('text', '')}" for c in context])
        prompt = f"""CONTEXT FROM MEDICAL KNOWLEDGE BASE:
{context_text}

USER QUERY:
{query}

Provide a helpful, accurate response based on the context above. Include relevant WHO guidelines or government scheme information where applicable."""
        return self.generate_response(prompt)

gemini_service = GeminiService()
