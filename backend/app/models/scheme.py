from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

@dataclass
class GovernmentScheme:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    scheme_id: str = field(default_factory=lambda: f"SCH-{uuid.uuid4().hex[:8].upper()}")
    name: str = ""
    category: str = "health"
    description: str = ""
    eligibility: List[str] = field(default_factory=list)
    benefits: List[str] = field(default_factory=list)
    documents_required: List[str] = field(default_factory=list)
    application_process: str = ""
    website_url: str = ""
    helpline: str = ""
    coverage_amount: str = ""
    validity: str = ""
    tags: List[str] = field(default_factory=list)
    is_active: bool = True
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "scheme_id": self.scheme_id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "eligibility": self.eligibility,
            "benefits": self.benefits,
            "documents_required": self.documents_required,
            "application_process": self.application_process,
            "website_url": self.website_url,
            "helpline": self.helpline,
            "coverage_amount": self.coverage_amount,
            "validity": self.validity,
            "tags": self.tags,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "GovernmentScheme":
        return cls(
            id=data.get("id", ""),
            scheme_id=data.get("scheme_id", ""),
            name=data.get("name", ""),
            category=data.get("category", "health"),
            description=data.get("description", ""),
            eligibility=data.get("eligibility", []),
            benefits=data.get("benefits", []),
            documents_required=data.get("documents_required", []),
            application_process=data.get("application_process", ""),
            website_url=data.get("website_url", ""),
            helpline=data.get("helpline", ""),
            coverage_amount=data.get("coverage_amount", ""),
            validity=data.get("validity", ""),
            tags=data.get("tags", []),
            is_active=data.get("is_active", True),
            created_at=data.get("created_at", ""),
            updated_at=data.get("updated_at", ""),
        )
