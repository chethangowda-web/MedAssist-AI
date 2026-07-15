import pytest
from unittest.mock import MagicMock, patch
from app.agents.reminder_agent import reminder_agent


@pytest.mark.asyncio
async def test_create_reminder(mock_firestore_service):
    result = await reminder_agent.process({
        "action": "create",
        "patient_id": "test-patient-001",
        "patient_name": "Ram Kumar",
        "reminder_type": "medication",
        "title": "Take Blood Pressure Medicine",
        "scheduled_date": "2026-07-16",
        "scheduled_time": "20:00",
        "priority": "high",
    })

    assert result["status"] == "success"
    assert result["reminders_created"] == 1
    mock_firestore_service.create_document.assert_called_once()


@pytest.mark.asyncio
async def test_create_bulk_reminders(mock_firestore_service):
    result = await reminder_agent.process({
        "action": "create",
        "reminders": [
            {"title": "Reminder 1", "patient_id": "p1"},
            {"title": "Reminder 2", "patient_id": "p2"},
            {"title": "Reminder 3", "patient_id": "p3"},
        ],
    })

    assert result["status"] == "success"
    assert result["reminders_created"] == 3


@pytest.mark.asyncio
async def test_get_pending_reminders(mock_firestore_service):
    mock_firestore_service.list_documents.return_value = (
        [{"id": "r1", "title": "Test Reminder", "status": "pending"}],
        1,
    )

    result = await reminder_agent.process({
        "action": "get_pending",
        "assigned_to": "test_user",
        "limit": 10,
    })

    assert result["status"] == "success"
    assert result["total"] == 1


@pytest.mark.asyncio
async def test_complete_reminder(mock_firestore_service):
    result = await reminder_agent.process({
        "action": "complete",
        "reminder_id": "test-reminder-001",
    })

    assert result["status"] == "success"
    assert result["reminder_id"] == "test-reminder-001"
    mock_firestore_service.update_document.assert_called_once()


@pytest.mark.asyncio
async def test_complete_reminder_missing_id(mock_firestore_service):
    result = await reminder_agent.process({
        "action": "complete",
    })

    assert result["status"] == "error"


@pytest.mark.asyncio
async def test_auto_schedule(mock_gemini_service, mock_firestore_service):
    mock_firestore_service.get_document.return_value = {
        "name": "Pregnant Woman",
        "age": 25,
        "gender": "female",
    }
    mock_gemini_service.generate_reminder_schedule.return_value = {
        "reminders": [
            {"title": "ANC Checkup", "suggested_date": "2026-07-20", "suggested_time": "10:00", "priority": "high", "notes": "Monthly checkup"},
            {"title": "Iron Tablets", "suggested_date": "2026-07-16", "suggested_time": "09:00", "priority": "medium", "notes": "Take after breakfast"},
        ],
        "total_reminders": 2,
        "schedule_summary": "2 reminders created for pregnancy care",
    }

    result = await reminder_agent.process({
        "action": "auto_schedule",
        "patient_id": "test-pregnant",
        "reminder_type": "pregnancy_checkup",
    })

    assert result["status"] == "success"
    assert result["reminders_created"] == 2
