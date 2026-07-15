from dataclasses import dataclass, field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

@dataclass
class Reminder:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    reminder_id: str = field(default_factory=lambda: f"REM-{uuid.uuid4().hex[:8].upper()}")
    patient_id: str = ""
    patient_name: str = ""
    assigned_to: str = ""
    reminder_type: str = "vaccination"
    title: str = ""
    description: str = ""
    scheduled_date: str = ""
    scheduled_time: str = ""
    is_recurring: bool = False
    recurring_interval: str = ""
    status: str = "pending"
    priority: str = "medium"
    created_by: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    completed_at: Optional[str] = None
    notes: str = ""
    notification_sent: bool = False
    channel: str = "sms"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "reminder_id": self.reminder_id,
            "patient_id": self.patient_id,
            "patient_name": self.patient_name,
            "assigned_to": self.assigned_to,
            "reminder_type": self.reminder_type,
            "title": self.title,
            "description": self.description,
            "scheduled_date": self.scheduled_date,
            "scheduled_time": self.scheduled_time,
            "is_recurring": self.is_recurring,
            "recurring_interval": self.recurring_interval,
            "status": self.status,
            "priority": self.priority,
            "created_by": self.created_by,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "completed_at": self.completed_at,
            "notes": self.notes,
            "notification_sent": self.notification_sent,
            "channel": self.channel,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Reminder":
        return cls(
            id=data.get("id", ""),
            reminder_id=data.get("reminder_id", ""),
            patient_id=data.get("patient_id", ""),
            patient_name=data.get("patient_name", ""),
            assigned_to=data.get("assigned_to", ""),
            reminder_type=data.get("reminder_type", "vaccination"),
            title=data.get("title", ""),
            description=data.get("description", ""),
            scheduled_date=data.get("scheduled_date", ""),
            scheduled_time=data.get("scheduled_time", ""),
            is_recurring=data.get("is_recurring", False),
            recurring_interval=data.get("recurring_interval", ""),
            status=data.get("status", "pending"),
            priority=data.get("priority", "medium"),
            created_by=data.get("created_by", ""),
            created_at=data.get("created_at", ""),
            updated_at=data.get("updated_at", ""),
            completed_at=data.get("completed_at"),
            notes=data.get("notes", ""),
            notification_sent=data.get("notification_sent", False),
            channel=data.get("channel", "sms"),
        )
