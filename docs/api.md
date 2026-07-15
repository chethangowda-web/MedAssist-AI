# MedAssist AI - API Documentation

## Base URL

Development: `http://localhost:8080`
Production: `https://api.medassist-ai.com`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Auth Endpoints

#### POST /auth/register
Register a new user.

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "Dr. Priya Sharma",
  "role": "doctor",
  "phone": "+91 9876543210"
}
```

#### POST /auth/login
Login with email and password.

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### POST /auth/firebase
Authenticate with Firebase ID token.

```json
{
  "id_token": "firebase_id_token"
}
```

### Patient Endpoints

#### POST /patients/register
Register a patient with structured data.

```json
{
  "name": "Ram Kumar",
  "age": 45,
  "gender": "male",
  "phone": "+91 9876543210",
  "address": {
    "village": "Sundarpur",
    "city": "Jaipur",
    "state": "Rajasthan",
    "pincode": "302001"
  },
  "blood_group": "O+",
  "medical_history": {
    "conditions": ["Hypertension"],
    "allergies": ["Penicillin"]
  },
  "vital_signs": {
    "blood_pressure_systolic": 140,
    "blood_pressure_diastolic": 90,
    "heart_rate": 78
  }
}
```

#### POST /patients/register-from-text
Register a patient using natural language.

```json
{
  "text": "Register Sita Devi, 30 years old female from village Raipur, pregnant with 6 months, complaining of swelling in feet and headache since 1 week."
}
```

#### GET /patients/{patient_id}
Get patient details.

#### PUT /patients/{patient_id}
Update patient information.

#### GET /patients/
List patients with pagination and search.

Query params: `page=1&page_size=20&search=ram`

#### POST /patients/{patient_id}/assess-risk
Trigger AI risk assessment for a patient.

### Visit Endpoints

#### POST /visits/
Record a new patient visit.

```json
{
  "patient_id": "uuid",
  "visit_type": "general",
  "chief_complaint": "Fever and cough since 3 days",
  "symptoms": [
    {"name": "Fever", "severity": "moderate", "duration": "3 days"}
  ],
  "vital_signs": {
    "temperature": 101.2,
    "heart_rate": 88
  },
  "diagnosis": [
    {"condition": "Upper Respiratory Tract Infection", "confidence": 0.85}
  ],
  "prescriptions": [
    {"medicine_name": "Paracetamol", "dosage": "500mg", "frequency": "3 times daily", "duration": "5 days"}
  ]
}
```

#### GET /visits/{visit_id}
Get visit details.

#### GET /visits/
List visits with optional patient filter.

### AI Agent Endpoints

#### POST /agents/assess-risk
Perform AI risk assessment.

```json
{
  "patient_id": "uuid",
  "vital_signs": {"blood_pressure_systolic": 160},
  "symptoms": ["severe headache", "blurred vision"]
}
```

#### POST /agents/search-knowledge
Search medical knowledge base.

```json
{
  "query": "WHO guidelines for hypertension management in pregnancy",
  "top_k": 5
}
```

#### POST /agents/recommend-schemes
Get government scheme recommendations.

```json
{
  "patient_id": "uuid",
  "patient_profile": {
    "age": 30,
    "gender": "female",
    "is_pregnant": true,
    "bpl_card": true
  }
}
```

#### POST /agents/reminders
Manage reminders (actions: create, get_pending, complete, auto_schedule).

```json
{
  "action": "auto_schedule",
  "patient_id": "uuid",
  "reminder_type": "vaccination"
}
```

#### POST /agents/generate-report
Generate medical report.

```json
{
  "patient_id": "uuid",
  "report_type": "patient_summary",
  "format": "pdf"
}
```

#### POST /agents/coordinator
Run multi-agent workflow.

```json
{
  "task": "full_assessment",
  "patient_id": "uuid",
  "data": {
    "text": "Register and assess risk for patient..."
  }
}
```

### Report Endpoints

#### POST /reports/generate
Generate a full patient report.

```json
{
  "patient_id": "uuid",
  "report_type": "patient_summary",
  "include_vitals": true,
  "include_history": true,
  "format": "pdf"
}
```

#### GET /reports/{report_id}
Get report details.

#### GET /reports/{report_id}/pdf
Download PDF report.

#### GET /reports/
List all reports.

### Dashboard Endpoints

#### GET /dashboard/stats
Get dashboard statistics.

#### GET /dashboard/activity
Get recent activity feed.

## Error Responses

All errors return consistent format:

```json
{
  "detail": "Error description message"
}
```

Status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Rate Limit Exceeded
- 500: Internal Server Error

## Rate Limiting

- Default: 100 requests per minute per IP
- Auth endpoints: 20 requests per minute
- Report generation: 10 requests per minute
