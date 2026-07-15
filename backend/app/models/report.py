from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

@dataclass
class Report:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    report_id: str = field(default_factory=lambda: f"RPT-{uuid.uuid4().hex[:8].upper()}")
    patient_id: str = ""
    patient_name: str = ""
    report_type: str = "patient_summary"
    title: str = ""
    content: Dict[str, Any] = field(default_factory=dict)
    summary: str = ""
    generated_by: str = ""
    generated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    format: str = "json"
    file_url: str = ""
    status: str = "generated"
    tags: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "report_id": self.report_id,
            "patient_id": self.patient_id,
            "patient_name": self.patient_name,
            "report_type": self.report_type,
            "title": self.title,
            "content": self.content,
            "summary": self.summary,
            "generated_by": self.generated_by,
            "generated_at": self.generated_at,
            "format": self.format,
            "file_url": self.file_url,
            "status": self.status,
            "tags": self.tags,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Report":
        return cls(
            id=data.get("id", ""),
            report_id=data.get("report_id", ""),
            patient_id=data.get("patient_id", ""),
            patient_name=data.get("patient_name", ""),
            report_type=data.get("report_type", "patient_summary"),
            title=data.get("title", ""),
            content=data.get("content", {}),
            summary=data.get("summary", ""),
            generated_by=data.get("generated_by", ""),
            generated_at=data.get("generated_at", ""),
            format=data.get("format", "json"),
            file_url=data.get("file_url", ""),
            status=data.get("status", "generated"),
            tags=data.get("tags", []),
        )
