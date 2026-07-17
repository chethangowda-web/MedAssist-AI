from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from app.schemas.report import ReportGenerate, ReportResponse
from app.services.firestore_service import firestore_service
from app.core.security import get_current_user
from app.agents.report_generator_agent import report_generator_agent
from app.services.pdf_service import pdf_generator
from typing import Optional
import httpx
import base64

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate")
async def generate_report(data: ReportGenerate, current_user: dict = Depends(get_current_user)):
    patient = firestore_service.get_document("patients", data.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    visits, _ = firestore_service.list_documents(
        "visits",
        filters=[("patient_id", "==", data.patient_id)],
        order_by="visit_date",
        limit=10,
    )

    result = await report_generator_agent.process({
        "patient_id": data.patient_id,
        "patient_data": patient,
        "report_type": data.report_type,
        "visits": visits,
        "generated_by": current_user["user_id"],
        "format": data.format,
        "include_vitals": data.include_vitals,
        "include_history": data.include_history,
        "include_diagnosis": data.include_diagnosis,
        "include_prescriptions": data.include_prescriptions,
    })

    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/{report_id}")
async def get_report(report_id: str, current_user: dict = Depends(get_current_user)):
    report = await report_generator_agent.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.get("/{report_id}/pdf")
async def download_report_pdf(report_id: str, current_user: dict = Depends(get_current_user)):
    report = await report_generator_agent.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.get("file_url") and report["file_url"].startswith("http"):
        async with httpx.AsyncClient() as client:
            resp = await client.get(report["file_url"])
            return Response(content=resp.content, media_type="application/pdf",
                          headers={"Content-Disposition": f"attachment; filename={report_id}.pdf"})

    pdf_bytes = pdf_generator.generate_patient_summary(report, [])
    if pdf_bytes:
        return Response(content=pdf_bytes, media_type="application/pdf",
                      headers={"Content-Disposition": f"attachment; filename={report_id}.pdf"})

    raise HTTPException(status_code=404, detail="PDF not available")

@router.get("/")
async def list_reports(
    patient_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    result = await report_generator_agent.list_reports(patient_id, page_size)
    return {
        "reports": result["reports"],
        "total": result["total"],
        "page": page,
        "page_size": page_size,
    }
