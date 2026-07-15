import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from app.agents.coordinator_agent import coordinator_agent


@pytest.mark.asyncio
async def test_coordinator_full_assessment(mock_gemini_service, mock_firestore_service, mock_qdrant):
    mock_gemini_service.extract_patient_info.return_value = {
        "name": "Test Patient", "age": 30, "gender": "male",
        "address": {}, "symptoms": [], "medical_conditions": [],
        "vital_signs": {}, "emergency": False,
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
            "patient_id": "test-patient-001",
            "data": {"mode": "structured", "name": "Test Patient"},
        })

        assert result["status"] == "success"
        assert "results" in result
        assert "agent_chain" in result


@pytest.mark.asyncio
async def test_coordinator_single_task(mock_gemini_service, mock_firestore_service, mock_qdrant):
    mock_firestore_service.get_document.return_value = {"name": "Test"}
    mock_gemini_service.assess_medical_risk.return_value = {
        "overall_risk_score": 0.5, "risk_level": "medium",
        "assessments": [], "recommendations": [],
        "emergency_warning": False, "emergency_reason": None,
    }

    result = await coordinator_agent.process({
        "task": "risk_assessment",
        "patient_id": "test-1",
    })

    assert result["status"] == "success"
    assert "risk_assessment" in result["results"]


@pytest.mark.asyncio
async def test_coordinator_invalid_task():
    result = await coordinator_agent.process({
        "task": "nonexistent_task",
    })

    assert result["status"] == "success"
    assert len(result["results"]) == 1
    assert "nonexistent_task" in result["results"]
