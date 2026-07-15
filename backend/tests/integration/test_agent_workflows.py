import pytest
from unittest.mock import MagicMock, patch
from app.agents.coordinator_agent import coordinator_agent
from app.agents.patient_registration_agent import patient_registration_agent
from app.agents.risk_assessment_agent import risk_assessment_agent
from app.agents.knowledge_agent import knowledge_agent
from app.agents.reminder_agent import reminder_agent
from app.agents.report_generator_agent import report_generator_agent
from app.agents.government_scheme_agent import government_scheme_agent


@pytest.mark.asyncio
async def test_full_workflow_quick_checkup(mock_gemini_service, mock_firestore_service, mock_qdrant):
    mock_gemini_service.extract_patient_info.return_value = {
        "name": "Quick Patient",
        "age": 25,
        "gender": "female",
        "phone": "",
        "address": {},
        "symptoms": ["fever"],
        "medical_conditions": [],
        "vital_signs": {"temperature": 101.5},
        "emergency": False,
    }
    mock_gemini_service.assess_medical_risk.return_value = {
        "overall_risk_score": 0.4,
        "risk_level": "medium",
        "assessments": [
            {
                "condition": "Fever",
                "risk_score": 0.4,
                "risk_level": "medium",
                "reasoning": "Temperature 101.5°F indicates moderate fever",
                "recommendations": ["Paracetamol", "Rest"],
            }
        ],
        "recommendations": ["Monitor temperature"],
        "emergency_warning": False,
        "emergency_reason": None,
    }

    result = await coordinator_agent.run_quick_checkup(
        patient_text="Quick Patient, 25 year old female with fever",
        conducted_by="test_worker",
    )

    assert result["status"] == "success"
    assert result["task"] == "quick_checkup"
    assert "patient_registration" in result["results"]
    assert "risk_assessment" in result["results"]
    assert len(result["agent_chain"]) == 2


@pytest.mark.asyncio
async def test_full_workflow_follow_up(mock_gemini_service, mock_firestore_service, mock_qdrant):
    mock_firestore_service.get_document.return_value = {
        "name": "Follow-up Patient",
        "age": 50,
        "vital_signs": {"blood_pressure_systolic": 140},
    }
    mock_gemini_service.assess_medical_risk.return_value = {
        "overall_risk_score": 0.6,
        "risk_level": "medium",
        "assessments": [],
        "recommendations": [],
        "emergency_warning": False,
        "emergency_reason": None,
    }
    mock_gemini_service.generate_reminder_schedule.return_value = {
        "reminders": [{"title": "Follow-up", "suggested_date": "2026-07-20"}],
        "total_reminders": 1,
        "schedule_summary": "1 reminder",
    }
    mock_gemini_service.generate_report_content.return_value = {
        "title": "Follow-up Report", "summary": "", "sections": [],
        "recommendations": [], "referral_notes": None,
    }

    with patch("app.services.pdf_service.pdf_generator.generate_patient_summary") as mock_pdf:
        mock_pdf.return_value = b"%PDF"

        result = await coordinator_agent.process({
            "task": "follow_up",
            "patient_id": "test-followup",
            "data": {"assigned_to": "asha_worker"},
        })

        assert result["status"] == "success"
        agents = result["agent_chain"]
        assert "risk_assessment" in agents
        assert "reminder" in agents
        assert "report" in agents


@pytest.mark.asyncio
async def test_individual_agent_chain():
    assert patient_registration_agent.name == "Patient Registration Agent"
    assert risk_assessment_agent.name == "Medical Risk Assessment Agent"
    assert knowledge_agent.name == "Medical Knowledge Agent"
    assert reminder_agent.name == "Reminder Agent"
    assert report_generator_agent.name == "Report Generator Agent"
    assert government_scheme_agent.name == "Government Scheme Agent"
    assert coordinator_agent.name == "Coordinator Agent"


@pytest.mark.asyncio
async def test_workflow_data_flow(mock_gemini_service, mock_firestore_service, mock_qdrant):
    mock_firestore_service.get_document.return_value = {
        "name": "Test", "age": 30,
        "vital_signs": {},
        "address": {"village": "Testpur"},
    }
    mock_gemini_service.assess_medical_risk.return_value = {
        "overall_risk_score": 0.3, "risk_level": "low",
        "assessments": [], "recommendations": [],
        "emergency_warning": False, "emergency_reason": None,
    }
    mock_gemini_service.recommend_schemes.return_value = {
        "recommended_schemes": [], "total_recommended": 0, "general_advice": "",
    }
    mock_gemini_service.generate_reminder_schedule.return_value = {
        "reminders": [], "total_reminders": 0, "schedule_summary": "",
    }
    mock_gemini_service.generate_report_content.return_value = {
        "title": "Report", "summary": "", "sections": [],
        "recommendations": [], "referral_notes": None,
    }

    with patch("app.services.pdf_service.pdf_generator.generate_patient_summary") as mock_pdf:
        mock_pdf.return_value = b"%PDF"

        result = await coordinator_agent.process({
            "task": "full_assessment",
            "patient_id": "test-1",
            "data": {"mode": "structured", "name": "Test"},
        })

        assert result["status"] == "success"
        assert result["processing_time"] > 0
        assert len(result["agent_chain"]) == 6
