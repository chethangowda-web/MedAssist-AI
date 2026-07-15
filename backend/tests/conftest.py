import pytest
from typing import Dict, Any, AsyncGenerator
from datetime import datetime
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

from app.core.config import settings


@pytest.fixture(autouse=True)
def mock_env_vars():
    with patch.object(settings, "GEMINI_API_KEY", "test-key"):
        with patch.object(settings, "FIRESTORE_PROJECT_ID", "test-project"):
            with patch.object(settings, "QDRANT_HOST", "localhost"):
                with patch.object(settings, "QDRANT_PORT", 6333):
                    yield


@pytest.fixture
def mock_gemini_service():
    with patch("app.services.gemini_service.gemini_service") as mock:
        mock.generate_response = MagicMock(return_value="Test response")
        mock.generate_structured_output = MagicMock(
            return_value={
                "overall_risk_score": 0.72,
                "risk_level": "high",
                "assessments": [],
                "recommendations": ["Test recommendation"],
                "emergency_warning": False,
                "emergency_reason": None,
            }
        )
        mock.extract_patient_info = MagicMock(
            return_value={
                "name": "Test Patient",
                "age": 30,
                "gender": "male",
                "phone": "+919999999999",
            }
        )
        mock.assess_medical_risk = MagicMock(
            return_value={
                "overall_risk_score": 0.72,
                "risk_level": "high",
                "assessments": [],
                "recommendations": ["Test"],
                "emergency_warning": False,
                "emergency_reason": None,
            }
        )
        yield mock


@pytest.fixture
def mock_firestore_service():
    with patch("app.services.firestore_service.firestore_service") as mock:
        mock.create_document = MagicMock(return_value=None)
        mock.get_document = MagicMock(
            return_value={
                "id": "test-patient-001",
                "name": "Ram Kumar",
                "age": 45,
                "gender": "male",
            }
        )
        mock.update_document = MagicMock(return_value=None)
        mock.list_documents = MagicMock(return_value=([], 0))
        yield mock


@pytest.fixture
def mock_qdrant():
    with patch("app.core.qdrant.search_knowledge") as mock_search:
        mock_search.return_value = [
            {
                "text": "WHO guidelines for hypertension treatment",
                "score": 0.95,
                "metadata": {"source": "WHO Guidelines", "category": "guidelines"},
            }
        ]
        yield mock_search


@pytest.fixture
def test_patient_data() -> Dict[str, Any]:
    return {
        "name": "Ram Kumar",
        "age": 45,
        "gender": "male",
        "phone": "+919876543210",
        "blood_group": "O+",
        "address": {
            "street": "Main Road",
            "city": "Jaipur",
            "state": "Rajasthan",
            "pincode": "302001",
            "village": "Sundarpur",
        },
        "medical_history": {
            "conditions": ["hypertension"],
            "surgeries": [],
            "allergies": ["penicillin"],
            "medications": ["amlodipine"],
            "family_history": [],
        },
        "vital_signs": {
            "blood_pressure_systolic": 145,
            "blood_pressure_diastolic": 92,
            "heart_rate": 82,
            "temperature": 98.6,
            "oxygen_saturation": 97,
            "blood_sugar": 180,
            "weight": 72,
            "height": 168,
            "bmi": 25.5,
        },
    }


@pytest.fixture
def test_visit_data() -> Dict[str, Any]:
    return {
        "patient_id": "test-patient-001",
        "visit_type": "checkup",
        "chief_complaint": "Routine checkup",
        "vital_signs": {
            "blood_pressure_systolic": 120,
            "blood_pressure_diastolic": 80,
        },
        "diagnosis": [],
        "prescriptions": [],
        "conducted_by": "dr_sharma",
    }
