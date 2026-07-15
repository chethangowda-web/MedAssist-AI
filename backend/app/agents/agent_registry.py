from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent

from app.agents.patient_registration_agent import patient_registration_agent
from app.agents.risk_assessment_agent import risk_assessment_agent
from app.agents.knowledge_agent import knowledge_agent
from app.agents.reminder_agent import reminder_agent
from app.agents.report_generator_agent import report_generator_agent
from app.agents.government_scheme_agent import government_scheme_agent
from app.agents.coordinator_agent import coordinator_agent


AGENT_CAPABILITIES: Dict[str, Dict[str, Any]] = {
    "patient_registration": {
        "name": "Patient Registration Agent",
        "description": "Registers patients by extracting information from natural language or structured data",
        "version": "1.0.0",
        "capabilities": [
            "Natural language patient registration",
            "Structured data registration",
            "Patient search by name/phone/ID",
            "Patient data retrieval",
            "Multi-language support",
        ],
        "input_schema": {
            "mode": "string (natural_language | structured)",
            "text": "string (required for natural_language mode)",
            "registered_by": "string",
            "name": "string (required for structured mode)",
            "age": "integer",
            "gender": "string",
            "phone": "string",
            "address": "object",
            "medical_history": "object",
            "vital_signs": "object",
        },
        "output_schema": {
            "status": "string",
            "patient_id": "string",
            "patient": "object",
            "extracted_data": "object (for NL mode)",
            "registration_method": "string",
        },
        "runtime": "async",
        "model": "gemini-2.0-flash-001",
        "tools": ["gemini_text_generation", "firestore_crud"],
    },
    "risk_assessment": {
        "name": "Medical Risk Assessment Agent",
        "description": "Assesses patient medical risks including BP, diabetes, pregnancy, malnutrition, and emergencies",
        "version": "1.0.0",
        "capabilities": [
            "Blood pressure risk assessment",
            "Diabetes risk assessment",
            "Pregnancy complication detection",
            "Malnutrition screening",
            "Emergency condition detection",
            "Multi-condition risk scoring",
            "Recommendation generation",
        ],
        "input_schema": {
            "patient_id": "string",
            "patient_data": "object",
            "symptoms": "array of strings",
            "conducted_by": "string",
        },
        "output_schema": {
            "status": "string",
            "overall_risk_score": "float",
            "risk_level": "string (low/medium/high/critical)",
            "assessments": "array of objects",
            "recommendations": "array of strings",
            "emergency_warning": "boolean",
            "visit_id": "string",
        },
        "runtime": "async",
        "model": "gemini-2.0-flash-001",
        "tools": ["gemini_text_generation", "firestore_crud"],
    },
    "knowledge": {
        "name": "Medical Knowledge Agent",
        "description": "Searches WHO guidelines, government schemes, medical PDFs using RAG with Qdrant",
        "version": "1.0.0",
        "capabilities": [
            "Semantic search over medical documents",
            "WHO guidelines retrieval",
            "Government scheme information",
            "Medical literature search",
            "Document indexing",
            "Condition-specific guideline lookup",
        ],
        "input_schema": {
            "query": "string",
            "top_k": "integer (default: 5)",
            "filter_category": "string",
        },
        "output_schema": {
            "status": "string",
            "query": "string",
            "results": "array of objects",
            "answer": "string",
            "total_found": "integer",
        },
        "runtime": "async",
        "model": "gemini-2.0-flash-001",
        "tools": ["qdrant_vector_search", "gemini_text_generation"],
    },
    "reminder": {
        "name": "Reminder Agent",
        "description": "Schedules vaccinations, medicines, follow-ups, pregnancy checkups, and child health visits",
        "version": "1.0.0",
        "capabilities": [
            "Vaccination scheduling",
            "Medicine reminder creation",
            "Follow-up scheduling",
            "Pregnancy checkup reminders",
            "Child health visit scheduling",
            "Auto-schedule generation",
            "Bulk reminder creation",
            "Reminder completion tracking",
        ],
        "input_schema": {
            "action": "string (create/get_pending/complete/auto_schedule)",
            "patient_id": "string",
            "reminder_type": "string",
            "title": "string",
            "scheduled_date": "string",
            "scheduled_time": "string",
            "priority": "string",
        },
        "output_schema": {
            "status": "string",
            "reminders_created": "integer",
            "reminders": "array of objects",
            "schedule_summary": "string (for auto_schedule)",
        },
        "runtime": "async",
        "model": "gemini-2.0-flash-001",
        "tools": ["gemini_text_generation", "firestore_crud"],
    },
    "report": {
        "name": "Report Generator Agent",
        "description": "Creates patient summaries, PDFs, medical reports, referral letters, and visit reports",
        "version": "1.0.0",
        "capabilities": [
            "Patient summary report generation",
            "Referral letter creation",
            "Medical report PDF generation",
            "Visit history report",
            "AI-powered content generation",
            "PDF download support",
        ],
        "input_schema": {
            "patient_id": "string",
            "report_type": "string (patient_summary/referral_letter/visit_report)",
            "format": "string (pdf/json)",
            "generated_by": "string",
        },
        "output_schema": {
            "status": "string",
            "report_id": "string",
            "report": "object",
            "content": "object",
            "pdf_bytes": "bytes (base64 encoded)",
        },
        "runtime": "async",
        "model": "gemini-2.0-flash-001",
        "tools": ["gemini_text_generation", "firestore_crud", "pdf_generation"],
    },
    "government_scheme": {
        "name": "Government Scheme Agent",
        "description": "Suggests Ayushman Bharat, maternal schemes, child schemes, and insurance based on patient profile",
        "version": "1.0.0",
        "capabilities": [
            "Ayushman Bharat eligibility checking",
            "Maternal scheme recommendation",
            "Child health scheme suggestion",
            "Insurance scheme matching",
            "Financial scheme recommendation",
            "Category-based scheme filtering",
            "Eligibility reasoning",
        ],
        "input_schema": {
            "patient_id": "string",
            "patient_profile": "object",
        },
        "output_schema": {
            "status": "string",
            "patient_id": "string",
            "recommended_schemes": "array of objects",
            "total_schemes": "integer",
            "general_advice": "string",
            "all_schemes": "array of objects",
        },
        "runtime": "async",
        "model": "gemini-2.0-flash-001",
        "tools": ["gemini_text_generation", "firestore_crud"],
    },
    "coordinator": {
        "name": "Coordinator Agent",
        "description": "Orchestrates all AI agents in a workflow pipeline for healthcare tasks",
        "version": "1.0.0",
        "capabilities": [
            "Multi-agent workflow orchestration",
            "Full patient assessment pipeline",
            "Quick checkup workflow",
            "Follow-up management workflow",
            "Agent result aggregation",
            "Error handling and recovery",
            "Processing time tracking",
        ],
        "input_schema": {
            "task": "string (full_assessment/quick_checkup/follow_up/register_patient/assess_risk/search_knowledge/create_reminder/generate_report/recommend_schemes)",
            "patient_id": "string",
            "data": "object",
        },
        "output_schema": {
            "status": "string",
            "task": "string",
            "patient_id": "string",
            "results": "object",
            "agent_chain": "array of strings",
            "processing_time": "float",
        },
        "runtime": "async",
        "model": "gemini-2.0-flash-001",
        "tools": ["agent_orchestration", "all_child_agents"],
        "child_agents": [
            "patient_registration",
            "risk_assessment",
            "knowledge",
            "reminder",
            "report",
            "government_scheme",
        ],
        "workflows": {
            "full_assessment": [
                "patient_registration",
                "risk_assessment",
                "knowledge",
                "reminder",
                "government_scheme",
                "report",
            ],
            "quick_checkup": ["patient_registration", "risk_assessment"],
            "follow_up": ["risk_assessment", "reminder", "report"],
        },
    },
}


class AgentRegistry:
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {
            "patient_registration": patient_registration_agent,
            "risk_assessment": risk_assessment_agent,
            "knowledge": knowledge_agent,
            "reminder": reminder_agent,
            "report": report_generator_agent,
            "government_scheme": government_scheme_agent,
            "coordinator": coordinator_agent,
        }

    def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        return self.agents.get(agent_id)

    def get_agent_info(self, agent_id: str) -> Optional[Dict[str, Any]]:
        return AGENT_CAPABILITIES.get(agent_id)

    def list_agents(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": agent_id,
                "name": info["name"],
                "description": info["description"],
                "version": info["version"],
                "capabilities": info["capabilities"],
                "runtime": info["runtime"],
                "model": info["model"],
            }
            for agent_id, info in AGENT_CAPABILITIES.items()
        ]

    def get_workflow(self, workflow_name: str) -> Optional[List[str]]:
        coordinator_info = AGENT_CAPABILITIES.get("coordinator", {})
        return coordinator_info.get("workflows", {}).get(workflow_name)


agent_registry = AgentRegistry()
