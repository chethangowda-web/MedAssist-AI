from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.visit import VisitCreate, VisitResponse
from app.services.firestore_service import firestore_service
from app.core.security import get_current_user
from app.models.visit import Visit
from typing import Optional
import uuid

router = APIRouter(prefix="/visits", tags=["Visits"])

@router.post("/")
async def create_visit(data: VisitCreate, current_user: dict = Depends(get_current_user)):
    patient = firestore_service.get_document("patients", data.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    visit = Visit(
        id=str(uuid.uuid4()),
        patient_id=data.patient_id,
        patient_name=patient.get("name", ""),
        visit_type=data.visit_type,
        chief_complaint=data.chief_complaint,
        symptoms=[__import__("app.models.visit", fromlist=["Symptom"]).Symptom(**s.model_dump()) for s in data.symptoms],
        vital_signs=data.vital_signs,
        diagnosis=[__import__("app.models.visit", fromlist=["Diagnosis"]).Diagnosis(**d.model_dump()) for d in data.diagnosis],
        prescriptions=[__import__("app.models.visit", fromlist=["Prescription"]).Prescription(**p.model_dump()) for p in data.prescriptions],
        investigations=data.investigations,
        notes=data.notes,
        referred_to=data.referred_to,
        conducted_by=data.conducted_by or current_user["user_id"],
        follow_up_date=data.follow_up_date,
        is_emergency=data.is_emergency,
    )

    firestore_service.create_document("visits", visit.id, visit.to_dict())

    if data.vital_signs:
        firestore_service.update_document("patients", data.patient_id, {
            "vital_signs": data.vital_signs,
            "updated_at": __import__("datetime").datetime.now().isoformat(),
        })

    return {"status": "success", "visit": visit.to_dict()}

@router.get("/{visit_id}")
async def get_visit(visit_id: str, current_user: dict = Depends(get_current_user)):
    visit = firestore_service.get_document("visits", visit_id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit

@router.get("/")
async def list_visits(
    patient_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    filters = []
    if patient_id:
        filters.append(("patient_id", "==", patient_id))

    visits, total = firestore_service.list_documents(
        "visits",
        filters=filters,
        order_by="visit_date",
        limit=page_size,
        offset=(page - 1) * page_size,
    )
    return {"visits": visits, "total": total, "page": page, "page_size": page_size}
