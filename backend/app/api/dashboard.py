from fastapi import APIRouter, Depends
from app.services.firestore_service import firestore_service
from app.core.security import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    patients, total_patients = firestore_service.list_documents("patients", limit=1)
    total_patients = firestore_service.list_documents("patients", limit=0)[1]

    visits, total_visits = firestore_service.list_documents("visits", limit=1)
    total_visits = firestore_service.list_documents("visits", limit=0)[1]

    reminders, total_reminders = firestore_service.list_documents(
        "reminders",
        filters=[("status", "==", "pending")],
        limit=1,
    )
    total_reminders = firestore_service.list_documents(
        "reminders",
        filters=[("status", "==", "pending")],
        limit=0,
    )[1]

    emergency_visits, total_emergency = firestore_service.list_documents(
        "visits",
        filters=[("is_emergency", "==", True)],
        limit=0,
    )

    recent_patients, _ = firestore_service.list_documents(
        "patients",
        order_by="registered_at",
        limit=5,
    )

    recent_visits, _ = firestore_service.list_documents(
        "visits",
        order_by="visit_date",
        limit=10,
    )

    high_risk = firestore_service.list_documents(
        "patients",
        filters=[("risk_level", "==", "high")],
        limit=0,
    )[1]

    critical_risk = firestore_service.list_documents(
        "patients",
        filters=[("risk_level", "==", "critical")],
        limit=0,
    )[1]

    reports, total_reports = firestore_service.list_documents("reports", limit=0)

    schemes, total_schemes = firestore_service.list_documents("schemes", limit=0)

    return {
        "total_patients": total_patients,
        "total_visits": total_visits,
        "pending_reminders": total_reminders,
        "emergency_cases": total_emergency,
        "high_risk_patients": high_risk,
        "critical_risk_patients": critical_risk,
        "total_reports": total_reports,
        "total_schemes": total_schemes,
        "recent_patients": recent_patients[:5],
        "recent_visits": recent_visits[:10],
        "today": datetime.now().isoformat(),
    }

@router.get("/activity")
async def get_recent_activity(current_user: dict = Depends(get_current_user)):
    recent_visits, _ = firestore_service.list_documents(
        "visits",
        order_by="visit_date",
        limit=20,
    )
    activities = []
    for v in recent_visits:
        activities.append({
            "type": "visit",
            "patient_name": v.get("patient_name", "Unknown"),
            "patient_id": v.get("patient_id", ""),
            "description": f"{v.get('visit_type', 'General')} visit - {v.get('chief_complaint', 'No complaint')[:50]}",
            "timestamp": v.get("visit_date", ""),
            "risk_level": v.get("risk_level", "low"),
        })

    recent_patients, _ = firestore_service.list_documents(
        "patients",
        order_by="registered_at",
        limit=10,
    )
    for p in recent_patients:
        activities.append({
            "type": "registration",
            "patient_name": p.get("name", "Unknown"),
            "patient_id": p.get("id", ""),
            "description": f"New patient registered",
            "timestamp": p.get("registered_at", ""),
            "risk_level": p.get("risk_level", "unknown"),
        })

    activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return {"activities": activities[:20]}
