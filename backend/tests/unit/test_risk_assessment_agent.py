import pytest
from unittest.mock import MagicMock, patch
from app.agents.risk_assessment_agent import risk_assessment_agent


@pytest.mark.asyncio
async def test_assess_risk_success(mock_gemini_service, mock_firestore_service):
    mock_firestore_service.get_document.return_value = {
        "id": "test-patient-001",
        "name": "Ram Kumar",
        "age": 45,
        "vital_signs": {"blood_pressure_systolic": 145, "blood_pressure_diastolic": 92},
    }
    mock_gemini_service.assess_medical_risk.return_value = {
        "overall_risk_score": 0.72,
        "risk_level": "high",
        "assessments": [
            {
                "condition": "High Blood Pressure",
                "risk_score": 0.85,
                "risk_level": "high",
                "reasoning": "BP elevated",
                "recommendations": ["Monitor BP"],
            }
        ],
        "recommendations": ["Reduce salt intake"],
        "emergency_warning": False,
        "emergency_reason": None,
    }

    result = await risk_assessment_agent.process({
        "patient_id": "test-patient-001",
        "conducted_by": "test_user",
    })

    assert result["status"] == "success"
    assert result["risk_level"] == "high"
    assert result["overall_risk_score"] == 0.72
    assert not result["emergency_warning"]
    assert result["visit_id"] is not None


@pytest.mark.asyncio
async def test_assess_risk_emergency(mock_gemini_service, mock_firestore_service):
    mock_firestore_service.get_document.return_value = {
        "id": "test-emergency",
        "name": "Emergency Patient",
        "vital_signs": {"blood_pressure_systolic": 200, "blood_pressure_diastolic": 120},
    }
    mock_gemini_service.assess_medical_risk.return_value = {
        "overall_risk_score": 0.95,
        "risk_level": "critical",
        "assessments": [],
        "recommendations": ["Immediate hospitalization"],
        "emergency_warning": True,
        "emergency_reason": "Hypertensive crisis with BP 200/120",
    }

    result = await risk_assessment_agent.process({
        "patient_id": "test-emergency",
    })

    assert result["status"] == "success"
    assert result["emergency_warning"] is True
    assert result["emergency_reason"] is not None


@pytest.mark.asyncio
async def test_assess_risk_no_patient(mock_firestore_service):
    mock_firestore_service.get_document.return_value = None

    result = await risk_assessment_agent.process({
        "patient_id": "nonexistent",
    })

    assert result["status"] == "error"
    assert "Patient data not found" in result["error"]


@pytest.mark.asyncio
async def test_assess_risk_with_provided_data(mock_gemini_service, mock_firestore_service):
    mock_gemini_service.assess_medical_risk.return_value = {
        "overall_risk_score": 0.5,
        "risk_level": "medium",
        "assessments": [],
        "recommendations": [],
        "emergency_warning": False,
        "emergency_reason": None,
    }

    result = await risk_assessment_agent.process({
        "patient_data": {"name": "Provided Patient", "age": 50},
    })

    assert result["status"] == "success"
