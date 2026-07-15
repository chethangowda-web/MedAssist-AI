from app.agents.base_agent import BaseAgent
from app.agents.patient_registration_agent import patient_registration_agent
from app.agents.risk_assessment_agent import risk_assessment_agent
from app.agents.knowledge_agent import knowledge_agent
from app.agents.reminder_agent import reminder_agent
from app.agents.report_generator_agent import report_generator_agent
from app.agents.government_scheme_agent import government_scheme_agent
from typing import Dict, Any, Optional
from datetime import datetime
import time
import logging

logger = logging.getLogger(__name__)

class CoordinatorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Coordinator Agent",
            description="Orchestrates all AI agents in a workflow pipeline for healthcare tasks"
        )
        self.agents = {
            "patient_registration": patient_registration_agent,
            "risk_assessment": risk_assessment_agent,
            "knowledge": knowledge_agent,
            "reminder": reminder_agent,
            "report": report_generator_agent,
            "government_scheme": government_scheme_agent,
        }

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        self.log_activity("workflow_started", "running", {"task": input_data.get("task")})

        start_time = time.time()

        try:
            task = input_data.get("task", "")
            patient_id = input_data.get("patient_id")
            data = input_data.get("data", {})

            workflow_map = {
                "register_patient": ["patient_registration"],
                "assess_risk": ["risk_assessment"],
                "search_knowledge": ["knowledge"],
                "create_reminder": ["reminder"],
                "generate_report": ["report"],
                "recommend_schemes": ["government_scheme"],
                "full_assessment": ["patient_registration", "risk_assessment", "knowledge", "reminder", "government_scheme", "report"],
                "quick_checkup": ["patient_registration", "risk_assessment"],
                "follow_up": ["risk_assessment", "reminder", "report"],
            }

            agent_chain = workflow_map.get(task, [task])

            if task in self.agents:
                agent_chain = [task]

            results = {}
            current_data = data

            for agent_key in agent_chain:
                agent = self.agents.get(agent_key)
                if not agent:
                    results[agent_key] = {"status": "error", "error": f"Agent {agent_key} not found"}
                    continue

                agent_input = {
                    **current_data,
                    "patient_id": patient_id,
                    "task": task,
                }

                if isinstance(agent_input, dict):
                    agent_input["patient_data"] = results.get("patient_registration", {}).get("patient", agent_input.get("patient_data", {}))
                    agent_input["risk_data"] = results.get("risk_assessment", {})
                    agent_input["scheme_data"] = results.get("government_scheme", {})

                agent_result = await agent.process(agent_input)
                results[agent_key] = agent_result

                if agent_result.get("status") == "error":
                    logger.warning(f"Agent {agent_key} returned error: {agent_result.get('error')}")

            processing_time = time.time() - start_time

            self.log_activity("workflow_completed", "success", {
                "task": task,
                "agents_used": agent_chain,
                "processing_time": processing_time,
            })

            return {
                "status": "success",
                "task": task,
                "patient_id": patient_id,
                "results": results,
                "agent_chain": agent_chain,
                "processing_time": processing_time,
            }

        except Exception as e:
            processing_time = time.time() - start_time
            self.log_activity("workflow_failed", "error", {
                "error": str(e),
                "processing_time": processing_time,
            })
            return {
                "status": "error",
                "error": str(e),
                "processing_time": processing_time,
            }

    async def run_full_workflow(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        return await self.process({
            "task": "full_assessment",
            "data": patient_data,
        })

    async def run_quick_checkup(self, patient_text: str, conducted_by: str = "") -> Dict[str, Any]:
        return await self.process({
            "task": "quick_checkup",
            "data": {
                "text": patient_text,
                "registered_by": conducted_by,
                "mode": "natural_language",
                "conducted_by": conducted_by,
            },
        })

coordinator_agent = CoordinatorAgent()
