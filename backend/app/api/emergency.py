from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from app.services.emergency_service import emergency_service
from app.core.security import get_current_user
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/emergency", tags=["Emergency"])


class TriageRequest(BaseModel):
    symptoms: List[str]
    vital_signs: dict = {}


class EmergencyAlertRequest(BaseModel):
    patient_id: str
    patient_name: str
    risk_level: str
    latitude: float
    longitude: float


@router.get("/contacts")
async def get_emergency_contacts(current_user: dict = Depends(get_current_user)):
    return {
        "hotlines": emergency_service.get_emergency_contacts(),
    }


@router.get("/protocol/{situation}")
async def get_emergency_protocol(
    situation: str,
    current_user: dict = Depends(get_current_user),
):
    protocol = emergency_service.get_emergency_protocol(situation)
    if not protocol:
        raise HTTPException(status_code=404, detail=f"No protocol found for: {situation}")
    return {"situation": situation, "protocol": protocol}


@router.get("/nearby-hospitals")
async def find_nearby_hospitals(
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude"),
    radius: int = Query(5000, description="Search radius in meters"),
    current_user: dict = Depends(get_current_user),
):
    hospitals = await emergency_service.find_nearby_hospitals(latitude, longitude, radius)
    return {
        "latitude": latitude,
        "longitude": longitude,
        "radius": radius,
        "hospitals": hospitals,
        "total": len(hospitals),
    }


@router.post("/triage")
async def triage_assessment(
    request: TriageRequest,
    current_user: dict = Depends(get_current_user),
):
    result = emergency_service.triage_emergency(request.symptoms, request.vital_signs)
    return result


@router.post("/alert")
async def send_emergency_alert(
    request: EmergencyAlertRequest,
    current_user: dict = Depends(get_current_user),
):
    patient_data = {
        "patient_id": request.patient_id,
        "name": request.patient_name,
        "risk_level": request.risk_level,
    }
    location = {"latitude": request.latitude, "longitude": request.longitude}
    alert = await emergency_service.send_emergency_alert(patient_data, location)
    return alert


@router.get("/protocols")
async def list_protocols(current_user: dict = Depends(get_current_user)):
    return {
        "protocols": list(emergency_service.emergency_protocols.keys()),
    }
