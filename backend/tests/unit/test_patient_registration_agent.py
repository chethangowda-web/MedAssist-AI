import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from app.agents.patient_registration_agent import patient_registration_agent


@pytest.mark.asyncio
async def test_register_from_natural_language(mock_gemini_service, mock_firestore_service):
    mock_gemini_service.extract_patient_info.return_value = {
        "name": "Test Patient",
        "age": 35,
        "gender": "male",
        "phone": "+919999999999",
        "address": {"street": "", "city": "Jaipur", "state": "Rajasthan", "pincode": "", "village": "Testpur"},
        "symptoms": ["fever", "cough"],
        "medical_conditions": [],
        "vital_signs": {"blood_pressure_systolic": 120, "blood_pressure_diastolic": 80},
        "emergency": False,
    }

    result = await patient_registration_agent.process({
        "mode": "natural_language",
        "text": "Register Test Patient, 35 year old male from Testpur with fever and cough",
        "registered_by": "test_user",
    })

    assert result["status"] == "success"
    assert result["patient_id"] is not None
    assert result["patient"]["name"] == "Test Patient"
    assert result["extracted_data"]["age"] == 35
    mock_firestore_service.create_document.assert_called_once()


@pytest.mark.asyncio
async def test_register_from_structured_data(mock_gemini_service, mock_firestore_service):
    result = await patient_registration_agent.process({
        "mode": "structured",
        "name": "Sita Devi",
        "age": 28,
        "gender": "female",
        "phone": "+919876543211",
        "address": {"village": "Kishangarh", "city": "Udaipur", "state": "Rajasthan"},
        "medical_history": {"conditions": ["anemia"], "allergies": []},
        "registered_by": "test_user",
    })

    assert result["status"] == "success"
    assert result["patient"]["name"] == "Sita Devi"
    assert result["patient"]["age"] == 28
    assert result["registration_method"] == "structured"


@pytest.mark.asyncio
async def test_register_empty_data(mock_gemini_service, mock_firestore_service):
    mock_gemini_service.extract_patient_info.return_value = {
        "name": "", "age": None, "gender": "", "phone": "",
        "address": {}, "symptoms": [], "medical_conditions": [], "vital_signs": {}, "emergency": False,
    }

    result = await patient_registration_agent.process({
        "mode": "natural_language",
        "text": "",
        "registered_by": "test",
    })

    assert result["status"] == "success"
    assert result["patient"]["name"] == ""


@pytest.mark.asyncio
async def test_get_patient(mock_firestore_service):
    mock_firestore_service.get_document.return_value = {"id": "test-1", "name": "Test"}
    patient = await patient_registration_agent.get_patient("test-1")
    assert patient is not None
    assert patient["name"] == "Test"
    mock_firestore_service.get_document.assert_called_with("patients", "test-1")
