from typing import Dict, Any, Optional
from abc import ABC, abstractmethod
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.version = "1.0.0"

    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    def log_activity(self, action: str, status: str, details: Optional[Dict[str, Any]] = None):
        logger.info(json.dumps({
            "agent": self.name,
            "action": action,
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "details": details or {},
        }))
