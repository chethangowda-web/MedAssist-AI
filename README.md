# MedAssist AI 🏥

### An AI Copilot for Rural Healthcare Workers

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built with](https://img.shields.io/badge/Built%20with-Google%20Gemini-blue)](https://ai.google.dev)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)](https://fastapi.tiangolo.com)

**MedAssist AI** is a production-ready Multi-Agent AI Healthcare Assistant built for the Google Build with AI Hackathon. It empowers ASHA workers, nurses, NGOs, and rural clinics with 6 specialized AI agents working together to streamline healthcare workflows.

---

## ✨ Features

### 🤖 6 AI Agents Orchestration

| Agent | Function | Powered By |
|-------|----------|------------|
| **Patient Registration** | Extract patient info from natural language | Gemini + Firestore |
| **Medical Risk Assessment** | Detect BP, diabetes, pregnancy, malnutrition risks | Gemini AI |
| **Medical Knowledge Agent** | RAG-powered search of WHO guidelines, schemes | Qdrant + Sentence Embeddings |
| **Reminder Scheduler** | Vaccinations, medicines, follow-ups | Gemini + Firestore |
| **Report Generator** | PDF summaries, referral letters, visit reports | ReportLab + Gemini |
| **Government Scheme Advisor** | Ayushman Bharat, maternal/child schemes | Gemini + Knowledge Base |

### 🎯 Key Capabilities

- **Natural Language Registration** - Register patients by speaking or typing naturally
- **Real-time Risk Assessment** - AI-powered health risk detection with Gemini
- **Medical Knowledge Base** - Semantic search across WHO guidelines using Qdrant RAG
- **Automated Scheduling** - Smart reminders for vaccinations, medicines, follow-ups
- **PDF Report Generation** - Professional medical reports and referral letters
- **Scheme Recommendations** - Personalized government scheme suggestions
- **Voice Input** - Speech-to-text for patient registration
- **Emergency Detection** - Real-time emergency alerts with risk scoring
- **Dark Mode** - Beautiful dark theme optimized for clinic use
- **Offline Support** - Progressive Web App capabilities

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Dashboard│ │ Patients │ │ Agents   │ │ Reports       │  │
│  │ Analytics│ │ Management│ │ Control  │ │ Generation    │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                   Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Coordinator Agent                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │   │
│  │  │ Patient  │ │  Risk    │ │ Knowledge│ │Reminder│  │   │
│  │  │ Agent    │ │  Agent   │ │  Agent   │ │ Agent  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐                           │   │
│  │  │  Report  │ │  Scheme  │                           │   │
│  │  │  Agent   │ │  Agent   │                           │   │
│  │  └──────────┘ └──────────┘                           │   │
│  └──────────────────────────────────────────────────────┘   │
└────────┬──────────────┬──────────────┬──────────────────────┘
         │              │              │
┌────────▼──┐  ┌────────▼──┐  ┌───────▼────────┐
│  Firestore │  │   Qdrant   │  │  Gemini AI     │
│ (Database) │  │ (Vectors)  │  │  (LLM)         │
└────────────┘  └────────────┘  └────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** with custom design system
- **Framer Motion** for animations
- **Recharts** for analytics
- **Lucide React** for icons
- **React Query** for data fetching
- **Zustand** for state management
- **React Router v6** for routing

### Backend
- **FastAPI** (Python 3.12)
- **Google Gemini AI** for LLM capabilities
- **Google Firestore** for NoSQL database
- **Qdrant** for vector similarity search
- **Sentence Transformers** for embeddings
- **ReportLab** for PDF generation
- **JWT** for authentication
- **Rate Limiting** with SlowAPI

### Infrastructure
- **Docker** & **Docker Compose**
- **Google Cloud Run** deployment
- **Firebase Hosting** for frontend
- **GitHub Actions** CI/CD
- **Nginx** reverse proxy

---

## 📁 Project Structure

```
medassist-ai/
├── frontend/                # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # UI Components
│   │   │   ├── layout/     # Sidebar, Header, Layout
│   │   │   ├── ui/         # Button, Card, Modal, Badge
│   │   │   ├── dashboard/  # StatsCard, ActivityFeed, Charts
│   │   │   ├── landing/    # Hero, Features, Stats, Footer
│   │   │   └── common/     # ProtectedRoute, ErrorBoundary
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client, Firebase
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helpers, constants
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                 # FastAPI + Python
│   ├── app/
│   │   ├── agents/         # AI Agents
│   │   │   ├── coordinator_agent.py
│   │   │   ├── patient_registration_agent.py
│   │   │   ├── risk_assessment_agent.py
│   │   │   ├── knowledge_agent.py
│   │   │   ├── reminder_agent.py
│   │   │   ├── report_generator_agent.py
│   │   │   └── government_scheme_agent.py
│   │   ├── api/            # REST endpoints
│   │   ├── core/           # Config, Firebase, Qdrant
│   │   ├── models/         # Data models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Gemini, PDF, Firestore
│   │   └── utils/          # RAG pipeline, helpers
│   ├── requirements.txt
│   └── Dockerfile
│
├── firebase/                # Firebase config
│   ├── firestore.rules
│   ├── firebase.json
│   └── storage.rules
│
├── deployment/              # Docker & Cloud Run
│   ├── docker-compose.yml
│   ├── cloudrun.yaml
│   └── nginx.conf
│
└── docs/                    # Documentation
    ├── architecture.md
    ├── api.md
    ├── deployment.md
    └── setup.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker & Docker Compose
- Google Cloud account (for Firebase & Gemini)
- Qdrant account (or local instance)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/medassist-ai.git
cd medassist-ai

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

### 2. Environment Variables

```bash
# Backend - copy .env.example to .env
cd backend
cp .env.example .env
# Edit .env with your credentials:
# - GEMINI_API_KEY
# - Firebase credentials
# - Qdrant host/port
```

### 3. Run with Docker Compose

```bash
docker-compose -f deployment/docker-compose.yml up -d
```

### 4. Run Locally

```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --port 8080

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Qdrant (if not using Docker)
docker run -p 6333:6333 qdrant/qdrant

# Seed medical knowledge
cd backend
python -m app.utils.rag_pipeline
```

### 5. Open in Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- API Docs: http://localhost:8080/docs
- Qdrant UI: http://localhost:6333/dashboard

---

## 🔌 API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | User login |
| `/auth/firebase` | POST | Firebase auth |
| `/patients/register` | POST | Register patient |
| `/patients/register-from-text` | POST | NLP registration |
| `/patients/{id}` | GET | Get patient |
| `/patients/{id}/assess-risk` | POST | Risk assessment |
| `/visits/` | GET/POST | Visit CRUD |
| `/agents/assess-risk` | POST | AI risk assessment |
| `/agents/search-knowledge` | POST | RAG knowledge search |
| `/agents/recommend-schemes` | POST | Scheme recommendations |
| `/agents/reminders` | POST | Reminder management |
| `/agents/generate-report` | POST | Report generation |
| `/agents/coordinator` | POST | Multi-agent orchestration |
| `/reports/generate` | POST | Generate PDF report |
| `/dashboard/stats` | GET | Dashboard statistics |

---

## 🧠 Multi-Agent Workflow

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Input  │────▶│  Coordinator    │────▶│  Patient Agent   │
│  (Text/Voice)│     │  Agent          │     │  (Registration)  │
└─────────────┘     └─────────────────┘     └─────────────────┘
                                                   │
                          ┌────────────────────────┘
                          ▼
                   ┌─────────────────┐     ┌─────────────────┐
                   │  Risk Agent     │◀────│  Patient Data    │
                   │  (Assessment)   │     │  (Firestore)     │
                   └─────────────────┘     └─────────────────┘
                          │
                          ▼
                   ┌─────────────────┐     ┌─────────────────┐
                   │  Knowledge Agent│────▶│  Qdrant RAG      │
                   │  (RAG Search)   │     │  (Guidelines)    │
                   └─────────────────┘     └─────────────────┘
                          │
                          ▼
                   ┌─────────────────┐     ┌─────────────────┐
                   │  Reminder Agent │────▶│  Schedule Store  │
                   │  (Scheduling)   │     │  (Firestore)     │
                   └─────────────────┘     └─────────────────┘
                          │
                          ▼
                   ┌─────────────────┐     ┌─────────────────┐
                   │  Report Agent   │────▶│  PDF Generation  │
                   │  (Generation)   │     │  (ReportLab)     │
                   └─────────────────┘     └─────────────────┘
                          │
                          ▼
                   ┌─────────────────┐     ┌─────────────────┐
                   │  Scheme Agent   │────▶│  Recommendations │
                   │  (Advisor)      │     │  + Benefits      │
                   └─────────────────┘     └─────────────────┘
```

---

## ☁️ Deployment

### Google Cloud Run
```bash
# Build and deploy backend
gcloud builds submit --tag gcr.io/PROJECT_ID/medassist-backend
gcloud run deploy medassist-backend --image gcr.io/PROJECT_ID/medassist-backend \
  --platform managed --region us-central1 --allow-unauthenticated

# Deploy frontend to Firebase
firebase deploy --only hosting
```

### Docker
```bash
docker-compose -f deployment/docker-compose.yml up -d
```

---

## 📊 Database Schema

### Firestore Collections

```
patients/
├── {patientId}
│   ├── name, age, gender, phone
│   ├── address {street, city, state, village, pincode}
│   ├── medical_history {conditions[], surgeries[], allergies[]}
│   ├── vital_signs {bp, heart_rate, temperature, bmi}
│   ├── risk_score, risk_level
│   └── registered_at, updated_at

visits/
├── {visitId}
│   ├── patient_id, patient_name
│   ├── visit_type, chief_complaint
│   ├── symptoms[], diagnosis[], prescriptions[]
│   ├── risk_score, risk_level, is_emergency
│   └── visit_date

reminders/
├── {reminderId}
│   ├── patient_id, patient_name
│   ├── reminder_type, title, description
│   ├── scheduled_date, scheduled_time
│   ├── status, priority
│   └── assigned_to

reports/
├── {reportId}
│   ├── patient_id, patient_name
│   ├── report_type, title, summary
│   ├── content, file_url
│   └── generated_at
```

---

## 🌟 Why MedAssist AI?

### The Problem
- **70%** of India's population lives in rural areas
- **Shortage** of doctors: 1:10,000 vs WHO's 1:1,000
- **ASHA workers** serve 1,000+ families each
- **Manual paperwork** consumes 40% of healthcare worker time

### Our Solution
- **10x faster** patient registration via natural language
- **24/7** AI-powered risk assessment
- **Instant access** to WHO guidelines & government schemes
- **Automated** scheduling & reminders
- **Professional reports** in one click

---

## 📝 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Acknowledgments

- Google Build with AI Hackathon
- Google Gemini AI Team
- WHO for public health guidelines
- Open source community

---

<div align="center">
  <sub>Built with ❤️ for rural healthcare heroes</sub>
</div>
