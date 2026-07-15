from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service
from app.services.firestore_service import firestore_service
from app.services.pdf_service import pdf_generator
from app.models.report import Report
from typing import Dict, Any, Optional
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

class ReportGeneratorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Report Generator Agent",
            description="Creates patient summaries, PDFs, medical reports, referral letters, and visit reports"
        )

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        self.log_activity("process_started", "running", {
            "report_type": input_data.get("report_type"),
            "patient_id": input_data.get("patient_id"),
        })

        try:
            patient_id = input_data.get("patient_id", "")
            report_type = input_data.get("report_type", "patient_summary")
            format_type = input_data.get("format", "pdf")

            patient_data = input_data.get("patient_data", {})
            if not patient_data and patient_id:
                patient_data = firestore_service.get_document("patients", patient_id)

            if not patient_data:
                return {"status": "error", "error": "Patient data not found"}

            visits = input_data.get("visits", [])
            if not visits and patient_id:
                visits, _ = firestore_service.list_documents(
                    "visits",
                    filters=[("patient_id", "==", patient_id)],
                    order_by="visit_date",
                    limit=10,
                )

            report_content = gemini_service.generate_report_content(report_type, {
                "patient": patient_data,
                "visits": visits,
                "report_type": report_type,
            })

            report = Report(
                patient_id=patient_id,
                patient_name=patient_data.get("name", ""),
                report_type=report_type,
                title=report_content.get("title", f"{report_type.replace('_', ' ').title()}"),
                content={
                    "sections": report_content.get("sections", []),
                    "recommendations": report_content.get("recommendations", []),
                    "referral_notes": report_content.get("referral_notes"),
                },
                summary=report_content.get("summary", ""),
                generated_by=input_data.get("generated_by", "medassist_ai"),
                format=format_type,
            )

            pdf_bytes = None
            if format_type == "pdf":
                pdf_data = {
                    **patient_data,
                    "visits": visits,
                    "chief_complaint": patient_data.get("notes", ""),
                    "conducted_by": input_data.get("generated_by", "MedAssist AI"),
                    "diagnosis": [],
                    "notes": report_content.get("summary", ""),
                }

                if report_type == "referral_letter":
                    pdf_bytes = pdf_generator.generate_referral_letter(pdf_data)
                else:
                    pdf_bytes = pdf_generator.generate_patient_summary(patient_data, visits)

                report.file_url = f"/reports/{report.id}.pdf"

            firestore_service.create_document("reports", report.id, report.to_dict())

            if pdf_bytes:
                from app.core.firebase import get_db
                bucket_name = f"{firestore_service.db.project}_reports"
                try:
                    from google.cloud import storage
                    storage_client = storage.Client()
                    bucket = storage_client.bucket(bucket_name)
                    blob = bucket.blob(f"reports/{report.id}.pdf")
                    blob.upload_from_string(pdf_bytes, content_type="application/pdf")
                    report.file_url = blob.public_url
                    firestore_service.update_document("reports", report.id, {"file_url": report.file_url})
                except Exception as e:
                    logger.warning(f"Could not upload PDF to cloud storage: {e}")

            self.log_activity("report_generated", "success", {
                "report_id": report.id,
                "report_type": report_type,
                "format": format_type,
            })

            return {
                "status": "success",
                "report_id": report.id,
                "report": report.to_dict(),
                "content": report_content,
                "pdf_bytes": pdf_bytes,
            }

        except Exception as e:
            self.log_activity("report_failed", "error", {"error": str(e)})
            return {"status": "error", "error": str(e)}

    async def get_report(self, report_id: str) -> Optional[Dict[str, Any]]:
        return firestore_service.get_document("reports", report_id)

    async def list_reports(self, patient_id: Optional[str] = None, limit: int = 20) -> Dict[str, Any]:
        if patient_id:
            reports, total = firestore_service.list_documents(
                "reports",
                filters=[("patient_id", "==", patient_id)],
                order_by="generated_at",
                limit=limit,
            )
        else:
            reports, total = firestore_service.list_documents(
                "reports",
                order_by="generated_at",
                limit=limit,
            )
        return {"reports": reports, "total": total}

report_generator_agent = ReportGeneratorAgent()
