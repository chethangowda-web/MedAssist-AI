from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse, PatientListResponse, NaturalLanguageRegistration
from app.schemas.agent import RiskAssessmentResponse
from app.agents.patient_registration_agent import patient_registration_agent
from app.agents.risk_assessment_agent import risk_assessment_agent
from app.services.firestore_service import firestore_service
from app.core.security import get_current_user
from typing import Optional

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("/register", response_model=dict)
async def register_patient(data: PatientCreate, current_user: dict = Depends(get_current_user)):
    data_dict = data.model_dump()
    data_dict["registered_by"] = current_user["user_id"]
    result = await patient_registration_agent.process(data_dict)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/register-from-text", response_model=dict)
async def register_patient_from_text(data: NaturalLanguageRegistration, current_user: dict = Depends(get_current_user)):
    result = await patient_registration_agent.process({
        "mode": "natural_language",
        "text": data.text,
        "registered_by": data.registered_by or current_user["user_id"],
    })
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    patient = await patient_registration_agent.get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse(**patient)

@router.put("/{patient_id}")
async def update_patient(patient_id: str, data: PatientUpdate, current_user: dict = Depends(get_current_user)):
    existing = firestore_service.get_document("patients", patient_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Patient not found")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = __import__("datetime").datetime.now().isoformat()
        firestore_service.update_document("patients", patient_id, update_data)

    updated = firestore_service.get_document("patients", patient_id)
    return {"status": "success", "patient": PatientResponse(**updated)}

@router.get("/")
async def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    if search:
        patients = await patient_registration_agent.search_patients(search)
        return {"patients": patients, "total": len(patients), "page": 1, "page_size": len(patients)}

    patients, total = firestore_service.list_documents(
        "patients",
        order_by="registered_at",
        limit=page_size,
        offset=(page - 1) * page_size,
    )
    return PatientListResponse(
        patients=[PatientResponse(**p) for p in patients],
        total=total,
        page=page,
        page_size=page_size,
    )

@router.post("/{patient_id}/assess-risk", response_model=dict)
async def assess_patient_risk(patient_id: str, current_user: dict = Depends(get_current_user)):
    patient = firestore_service.get_document("patients", patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    result = await risk_assessment_agent.process({
        "patient_id": patient_id,
        "patient_data": patient,
        "conducted_by": current_user["user_id"],
    })
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.delete("/{patient_id}")
async def delete_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    existing = firestore_service.get_document("patients", patient_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Patient not found")

    firestore_service.update_document("patients", patient_id, {"is_active": False, "updated_at": __import__("datetime").datetime.now().isoformat()})
    return {"status": "success", "message": "Patient deactivated"}
