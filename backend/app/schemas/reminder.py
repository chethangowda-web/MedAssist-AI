from pydantic import BaseModel, Field
from typing import Optional, List

class ReminderCreate(BaseModel):
    patient_id: str = Field(..., min_length=1)
    patient_name: str = ""
    assigned_to: str = ""
    reminder_type: str = "vaccination"
    title: str = Field(..., min_length=1)
    description: str = ""
    scheduled_date: str = Field(..., min_length=1)
    scheduled_time: str = ""
    is_recurring: bool = False
    recurring_interval: str = ""
    priority: str = "medium"
    notes: str = ""
    channel: str = "sms"

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None

class ReminderResponse(BaseModel):
    id: str
    reminder_id: str
    patient_id: str
    patient_name: str
    assigned_to: str
    reminder_type: str
    title: str
    description: str
    scheduled_date: str
    scheduled_time: str
    is_recurring: bool
    recurring_interval: str
    status: str
    priority: str
    created_by: str
    created_at: str
    completed_at: Optional[str]
    channel: str
