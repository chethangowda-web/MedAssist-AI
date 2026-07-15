from typing import Dict, Any, List

SAMPLE_PATIENT: Dict[str, Any] = {
    "id": "test-patient-001",
    "name": "Ram Kumar",
    "age": 45,
    "gender": "male",
    "phone": "+919876543210",
    "blood_group": "O+",
    "aadhar_number": "1234-5678-9012",
    "address": {
        "street": "Main Road",
        "city": "Jaipur",
        "state": "Rajasthan",
        "pincode": "302001",
        "village": "Sundarpur",
    },
    "medical_history": {
        "conditions": ["hypertension", "type_2_diabetes"],
        "surgeries": [],
        "allergies": ["penicillin"],
        "medications": ["amlodipine 5mg", "metformin 500mg"],
        "family_history": ["father_hypertension"],
    },
    "vital_signs": {
        "blood_pressure_systolic": 145,
        "blood_pressure_diastolic": 92,
        "heart_rate": 82,
        "temperature": 98.6,
        "oxygen_saturation": 97,
        "blood_sugar": 180,
        "weight": 72,
        "height": 168,
        "bmi": 25.5,
    },
    "risk_level": "high",
    "risk_score": 0.72,
    "registered_by": "test-user",
    "tags": ["hypertension", "diabetes"],
    "registered_at": "2026-07-15T10:00:00Z",
    "updated_at": "2026-07-15T10:00:00Z",
}

SAMPLE_PATIENT_2: Dict[str, Any] = {
    "id": "test-patient-002",
    "name": "Sita Devi",
    "age": 28,
    "gender": "female",
    "phone": "+919876543211",
    "blood_group": "B+",
    "address": {
        "street": "Village Road",
        "city": "Udaipur",
        "state": "Rajasthan",
        "pincode": "313001",
        "village": "Kishangarh",
    },
    "medical_history": {
        "conditions": ["anemia"],
        "surgeries": [],
        "allergies": [],
        "medications": ["iron supplements"],
        "family_history": [],
    },
    "vital_signs": {
        "blood_pressure_systolic": 110,
        "blood_pressure_diastolic": 70,
        "heart_rate": 76,
        "temperature": 98.4,
        "oxygen_saturation": 98,
        "blood_sugar": 95,
        "weight": 55,
        "height": 158,
        "bmi": 22.0,
    },
    "risk_level": "low",
    "risk_score": 0.15,
    "registered_by": "test-user",
    "tags": ["pregnant"],
    "registered_at": "2026-07-15T11:00:00Z",
    "updated_at": "2026-07-15T11:00:00Z",
}

SAMPLE_VISIT: Dict[str, Any] = {
    "id": "test-visit-001",
    "patient_id": "test-patient-001",
    "patient_name": "Ram Kumar",
    "visit_type": "follow_up",
    "chief_complaint": "Headache and dizziness since 2 days",
    "vital_signs": {
        "blood_pressure_systolic": 150,
        "blood_pressure_diastolic": 95,
        "heart_rate": 88,
        "temperature": 98.6,
        "oxygen_saturation": 96,
        "blood_sugar": 175,
    },
    "symptoms": [
        {"name": "headache", "severity": "moderate", "duration": "2 days"},
        {"name": "dizziness", "severity": "mild", "duration": "2 days"},
    ],
    "diagnosis": [
        {
            "condition": "Hypertensive urgency",
            "icd_code": "I10",
            "confidence": 0.85,
            "notes": "BP elevated, adjust medication",
        }
    ],
    "prescriptions": [
        {
            "medicine_name": "Amlodipine 10mg",
            "dosage": "1 tablet",
            "frequency": "once daily",
            "duration": "30 days",
            "notes": "Increased from 5mg",
        }
    ],
    "is_emergency": False,
    "risk_score": 0.65,
    "risk_level": "medium",
    "conducted_by": "dr_sharma",
    "visit_date": "2026-07-15T10:30:00Z",
    "notes": "Patient advised to monitor BP daily",
}

SAMPLE_REMINDER: Dict[str, Any] = {
    "id": "test-reminder-001",
    "patient_id": "test-patient-001",
    "patient_name": "Ram Kumar",
    "reminder_type": "medication",
    "title": "Take Amlodipine 10mg",
    "description": "Evening dose of blood pressure medication",
    "scheduled_date": "2026-07-15",
    "scheduled_time": "20:00",
    "is_recurring": True,
    "recurring_interval": "daily",
    "priority": "high",
    "status": "pending",
    "assigned_to": "test-user",
    "created_by": "medassist_ai",
}

SAMPLE_REPORT: Dict[str, Any] = {
    "id": "test-report-001",
    "patient_id": "test-patient-001",
    "patient_name": "Ram Kumar",
    "report_type": "patient_summary",
    "title": "Patient Summary Report",
    "summary": "45-year-old male with hypertension and diabetes",
    "status": "generated",
    "generated_by": "medassist_ai",
    "format": "pdf",
}

SAMPLE_GEMINI_RISK_RESPONSE: Dict[str, Any] = {
    "overall_risk_score": 0.72,
    "risk_level": "high",
    "assessments": [
        {
            "condition": "High Blood Pressure",
            "risk_score": 0.85,
            "risk_level": "high",
            "reasoning": "Systolic BP of 145 mmHg is above normal range",
            "recommendations": ["Monitor BP daily", "Reduce salt intake"],
        },
        {
            "condition": "Diabetes Risk",
            "risk_score": 0.78,
            "risk_level": "high",
            "reasoning": "Blood sugar of 180 mg/dL indicates poor control",
            "recommendations": ["HbA1c test", "Dietary consultation"],
        },
    ],
    "recommendations": [
        "Immediate medication adjustment",
        "Follow up in 1 week",
    ],
    "emergency_warning": False,
    "emergency_reason": None,
}
