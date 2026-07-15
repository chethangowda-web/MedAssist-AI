import pytest
from unittest.mock import MagicMock, patch
from app.agents.government_scheme_agent import government_scheme_agent


@pytest.mark.asyncio
async def test_recommend_schemes_for_patient(mock_gemini_service, mock_firestore_service):
    mock_firestore_service.get_document.return_value = {
        "id": "test-patient-001",
        "name": "Ram Kumar",
        "age": 45,
        "gender": "male",
        "address": {"village": "Sundarpur", "state": "Rajasthan"},
        "aadhar_number": "1234-5678-9012",
    }
    mock_gemini_service.recommend_schemes.return_value = {
        "recommended_schemes": [
            {
                "scheme_name": "Ayushman Bharat PM-JAY",
                "match_score": 0.95,
                "eligibility_reason": "Below poverty line family",
                "benefits": ["Health coverage up to ₹5 lakh"],
                "application_steps": "Visit nearest empaneled hospital",
            }
        ],
        "total_recommended": 1,
        "general_advice": "Patient is eligible for health insurance schemes",
    }

    result = await government_scheme_agent.process({
        "patient_id": "test-patient-001",
    })

    assert result["status"] == "success"
    assert result["total_schemes"] > 0
    assert "recommended_schemes" in result
    assert result["patient_id"] == "test-patient-001"


@pytest.mark.asyncio
async def test_recommend_schemes_no_patient(mock_firestore_service):
    mock_firestore_service.get_document.return_value = None

    result = await government_scheme_agent.process({
        "patient_id": "nonexistent",
    })

    assert result["status"] == "success"


@pytest.mark.asyncio
async def test_get_default_schemes():
    schemes = government_scheme_agent._get_default_schemes()
    assert len(schemes) == 12
    assert any(s["scheme_id"] == "ayushman_bharat" for s in schemes)
    assert any(s["scheme_id"] == "pradhan_mantri_matru_vandana" for s in schemes)


@pytest.mark.asyncio
async def test_get_scheme_details():
    scheme = await government_scheme_agent.get_scheme_details("ayushman_bharat")
    assert scheme is not None
    assert scheme["name"] == "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)"

    not_found = await government_scheme_agent.get_scheme_details("nonexistent")
    assert not_found is None


@pytest.mark.asyncio
async def test_get_schemes_by_category():
    maternal = await government_scheme_agent.get_schemes_by_category("maternal")
    assert len(maternal) == 2
    assert all(s["category"] == "maternal" for s in maternal)

    insurance = await government_scheme_agent.get_schemes_by_category("insurance")
    assert len(insurance) == 2
