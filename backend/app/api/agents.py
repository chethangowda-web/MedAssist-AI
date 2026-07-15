from fastapi import APIRouter, Depends, HTTPException, Body
from app.schemas.agent import (
    RiskAssessmentRequest, RiskAssessmentResponse,
    KnowledgeQuery, KnowledgeResponse,
    SchemeRecommendationRequest, SchemeRecommendationResponse,
    CoordinatorRequest, CoordinatorResponse,
)
from app.agents.agent_registry import agent_registry
from app.agents.risk_assessment_agent import risk_assessment_agent
from app.agents.knowledge_agent import knowledge_agent
from app.agents.reminder_agent import reminder_agent
from app.agents.report_generator_agent import report_generator_agent
from app.agents.government_scheme_agent import government_scheme_agent
from app.agents.coordinator_agent import coordinator_agent
from app.core.security import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/agents", tags=["AI Agents"])

@router.get("/registry")
async def list_agents(current_user: dict = Depends(get_current_user)):
    return {
        "agents": agent_registry.list_agents(),
        "total": len(agent_registry.agents),
    }


@router.get("/registry/{agent_id}")
async def get_agent_info(agent_id: str, current_user: dict = Depends(get_current_user)):
    info = agent_registry.get_agent_info(agent_id)
    if not info:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    return info


@router.get("/workflows")
async def list_workflows(current_user: dict = Depends(get_current_user)):
    coordinator_info = agent_registry.get_agent_info("coordinator")
    workflows = coordinator_info.get("workflows", {}) if coordinator_info else {}
    return {"workflows": list(workflows.keys())}


@router.get("/workflows/{workflow_name}")
async def get_workflow(workflow_name: str, current_user: dict = Depends(get_current_user)):
    workflow = agent_registry.get_workflow(workflow_name)
    if not workflow:
        raise HTTPException(status_code=404, detail=f"Workflow '{workflow_name}' not found")
    return {"name": workflow_name, "agents": workflow}


@router.post("/assess-risk")
async def assess_risk(request: RiskAssessmentRequest, current_user: dict = Depends(get_current_user)):
    result = await risk_assessment_agent.process({
        "patient_id": request.patient_id,
        "symptoms": request.symptoms,
        "vital_signs": request.vital_signs,
        "medical_history": request.medical_history,
        "conducted_by": current_user["user_id"],
    })
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/search-knowledge")
async def search_knowledge(request: KnowledgeQuery, current_user: dict = Depends(get_current_user)):
    result = await knowledge_agent.process({
        "query": request.query,
        "top_k": request.top_k,
        "filter_category": request.filter_category,
    })
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/recommend-schemes")
async def recommend_schemes(request: SchemeRecommendationRequest, current_user: dict = Depends(get_current_user)):
    result = await government_scheme_agent.process({
        "patient_id": request.patient_id,
        "patient_profile": request.patient_profile,
    })
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/reminders")
async def manage_reminders(data: Dict[str, Any] = Body(...), current_user: dict = Depends(get_current_user)):
    result = await reminder_agent.process(data)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/generate-report")
async def generate_report(data: Dict[str, Any] = Body(...), current_user: dict = Depends(get_current_user)):
    data["generated_by"] = current_user["user_id"]
    result = await report_generator_agent.process(data)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/coordinator")
async def coordinator(request: CoordinatorRequest, current_user: dict = Depends(get_current_user)):
    result = await coordinator_agent.process({
        "task": request.task,
        "patient_id": request.patient_id,
        "data": request.data,
    })
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["error"])
    return result
