import pytest
from unittest.mock import MagicMock, patch
from app.agents.report_generator_agent import report_generator_agent


@pytest.mark.asyncio
async def test_generate_patient_summary(mock_gemini_service, mock_firestore_service):
    mock_firestore_service.get_document.return_value = {
        "id": "test-patient-001",
        "name": "Ram Kumar",
        "age": 45,
        "gender": "male",
    }
    mock_gemini_service.generate_report_content.return_value = {
        "title": "Patient Summary Report",
        "summary": "45-year-old male with hypertension",
        "sections": [
            {"heading": "Patient Information", "content": "Name: Ram Kumar", "type": "text"},
            {"heading": "Medical History", "content": "Hypertension", "type": "text"},
        ],
        "recommendations": ["Monitor BP", "Regular exercise"],
        "referral_notes": None,
    }

    with patch("app.services.pdf_service.pdf_generator.generate_patient_summary") as mock_pdf:
        mock_pdf.return_value = b"%PDF-1.4 test pdf content"

        result = await report_generator_agent.process({
            "patient_id": "test-patient-001",
            "report_type": "patient_summary",
            "format": "pdf",
            "generated_by": "test_user",
        })

        assert result["status"] == "success"
        assert result["report"]["report_type"] == "patient_summary"
        assert result["pdf_bytes"] is not None


@pytest.mark.asyncio
async def test_generate_referral_letter(mock_gemini_service, mock_firestore_service):
    mock_firestore_service.get_document.return_value = {
        "id": "test-patient-001",
        "name": "Ram Kumar",
    }
    mock_gemini_service.generate_report_content.return_value = {
        "title": "Referral Letter",
        "summary": "Patient requires specialist consultation",
        "sections": [],
        "recommendations": ["Refer to cardiologist"],
        "referral_notes": "Urgent cardiology referral needed",
    }

    with patch("app.services.pdf_service.pdf_generator.generate_referral_letter") as mock_pdf:
        mock_pdf.return_value = b"%PDF-1.4 test pdf content"

        result = await report_generator_agent.process({
            "patient_id": "test-patient-001",
            "report_type": "referral_letter",
            "format": "pdf",
            "generated_by": "dr_sharma",
        })

        assert result["status"] == "success"
        assert result["report"]["report_type"] == "referral_letter"


@pytest.mark.asyncio
async def test_generate_report_no_patient(mock_firestore_service):
    mock_firestore_service.get_document.return_value = None

    result = await report_generator_agent.process({
        "patient_id": "nonexistent",
        "report_type": "patient_summary",
    })

    assert result["status"] == "error"
    assert "Patient data not found" in result["error"]


@pytest.mark.asyncio
async def test_list_reports(mock_firestore_service):
    mock_firestore_service.list_documents.return_value = (
        [{"id": "r1", "title": "Report 1"}, {"id": "r2", "title": "Report 2"}],
        2,
    )

    result = await report_generator_agent.list_reports()
    assert result["total"] == 2
    assert len(result["reports"]) == 2


@pytest.mark.asyncio
async def test_get_report(mock_firestore_service):
    mock_firestore_service.get_document.return_value = {"id": "r1", "title": "Report 1"}
    report = await report_generator_agent.get_report("r1")
    assert report["id"] == "r1"
