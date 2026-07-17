from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from app.services.medicine_scanner_service import medicine_scanner_service
from app.core.security import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/medicine", tags=["Medicine"])


class InteractionRequest(BaseModel):
    medicines: List[str]

class IdentifyRequest(BaseModel):
    text: str


@router.get("/search")
async def search_medicine(
    name: str = Query(..., description="Medicine name or brand name"),
    current_user: dict = Depends(get_current_user),
):
    info = medicine_scanner_service.get_medicine_info(name)
    if not info:
        return {
            "status": "not_found",
            "query": name,
            "message": "Medicine not found in database",
        }
    return {
        "status": "found",
        "query": name,
        "medicine": info,
    }


@router.post("/identify")
async def identify_medicine(
    request: IdentifyRequest,
    current_user: dict = Depends(get_current_user),
):
    results = medicine_scanner_service.identify_medicine(request.text)
    return {
        "identifications": results,
        "total_found": len(results),
    }


@router.post("/check-interactions")
async def check_interactions(
    request: InteractionRequest,
    current_user: dict = Depends(get_current_user),
):
    if len(request.medicines) < 2:
        raise HTTPException(status_code=400, detail="At least 2 medicines required for interaction check")

    result = medicine_scanner_service.check_drug_interaction(request.medicines)
    return result


@router.get("/barcode/{barcode}")
async def lookup_by_barcode(
    barcode: str,
    current_user: dict = Depends(get_current_user),
):
    result = await medicine_scanner_service.search_by_barcode(barcode)
    if not result:
        return {
            "status": "not_found",
            "barcode": barcode,
            "message": "Product not found for this barcode",
        }
    return result


@router.get("/common")
async def list_common_medicines(current_user: dict = Depends(get_current_user)):
    medicines = []
    for generic_name, info in medicine_scanner_service.common_medicines.items():
        medicines.append({
            "generic_name": info["generic_name"],
            "brand_names": info["brand_names"],
            "category": info["category"],
            "uses": info["uses"][:3],
            "common_dosage": info["common_dosage"],
        })
    return {
        "medicines": medicines,
        "total": len(medicines),
    }
