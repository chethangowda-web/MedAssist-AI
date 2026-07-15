from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service
from app.services.firestore_service import firestore_service
from app.models.reminder import Reminder
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class ReminderAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Reminder Agent",
            description="Schedules vaccinations, medicines, follow-ups, pregnancy checkups, and child health visits"
        )

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        self.log_activity("process_started", "running", input_data)

        try:
            action = input_data.get("action", "create")

            if action == "create":
                return await self._create_reminders(input_data)
            elif action == "get_pending":
                return await self._get_pending_reminders(input_data)
            elif action == "complete":
                return await self._complete_reminder(input_data)
            elif action == "auto_schedule":
                return await self._auto_schedule(input_data)
            else:
                return {"status": "error", "error": f"Unknown action: {action}"}

        except Exception as e:
            self.log_activity("process_failed", "error", {"error": str(e)})
            return {"status": "error", "error": str(e)}

    async def _create_reminders(self, data: Dict[str, Any]) -> Dict[str, Any]:
        reminders_data = data.get("reminders", [data])
        created = []

        for r in reminders_data:
            reminder = Reminder(
                patient_id=r.get("patient_id", data.get("patient_id", "")),
                patient_name=r.get("patient_name", data.get("patient_name", "")),
                assigned_to=r.get("assigned_to", data.get("assigned_to", "")),
                reminder_type=r.get("reminder_type", "general"),
                title=r.get("title", "Medical Reminder"),
                description=r.get("description", ""),
                scheduled_date=r.get("scheduled_date", ""),
                scheduled_time=r.get("scheduled_time", "09:00"),
                is_recurring=r.get("is_recurring", False),
                recurring_interval=r.get("recurring_interval", ""),
                priority=r.get("priority", "medium"),
                created_by=data.get("created_by", "medassist_ai"),
                channel=r.get("channel", "sms"),
                notes=r.get("notes", ""),
            )
            firestore_service.create_document("reminders", reminder.id, reminder.to_dict())
            created.append(reminder.to_dict())

        return {
            "status": "success",
            "reminders_created": len(created),
            "reminders": created,
        }

    async def _get_pending_reminders(self, data: Dict[str, Any]) -> Dict[str, Any]:
        assigned_to = data.get("assigned_to", "")
        reminder_type = data.get("reminder_type")

        filters = [("status", "==", "pending")]
        if assigned_to:
            filters.append(("assigned_to", "==", assigned_to))
        if reminder_type:
            filters.append(("reminder_type", "==", reminder_type))

        reminders, total = firestore_service.list_documents(
            "reminders",
            filters=filters,
            order_by="scheduled_date",
            limit=data.get("limit", 50),
        )

        return {
            "status": "success",
            "reminders": reminders,
            "total": total,
        }

    async def _complete_reminder(self, data: Dict[str, Any]) -> Dict[str, Any]:
        reminder_id = data.get("reminder_id", "")
        if not reminder_id:
            return {"status": "error", "error": "reminder_id required"}

        firestore_service.update_document("reminders", reminder_id, {
            "status": "completed",
            "completed_at": datetime.now().isoformat(),
            "notes": data.get("notes", ""),
        })

        return {"status": "success", "reminder_id": reminder_id}

    async def _auto_schedule(self, data: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = data.get("patient_id", "")
        patient_data = data.get("patient_data", {})
        reminder_type = data.get("reminder_type", "general")

        if not patient_data and patient_id:
            patient_data = firestore_service.get_document("patients", patient_id)

        if not patient_data:
            return {"status": "error", "error": "Patient data not found"}

        schedule = gemini_service.generate_reminder_schedule(patient_data, reminder_type)
        reminders = schedule.get("reminders", [])
        created = []

        for r in reminders:
            reminder = Reminder(
                patient_id=patient_id,
                patient_name=patient_data.get("name", ""),
                reminder_type=reminder_type,
                title=r.get("title", "Medical Reminder"),
                description=r.get("description", ""),
                scheduled_date=r.get("suggested_date", ""),
                scheduled_time=r.get("suggested_time", "09:00"),
                priority=r.get("priority", "medium"),
                created_by="medassist_ai",
                notes=r.get("notes", ""),
            )
            firestore_service.create_document("reminders", reminder.id, reminder.to_dict())
            created.append(reminder.to_dict())

        return {
            "status": "success",
            "reminders_created": len(created),
            "reminders": created,
            "schedule_summary": schedule.get("schedule_summary", ""),
        }

reminder_agent = ReminderAgent()
