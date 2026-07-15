# MedAssist AI - Architecture Documentation

## System Architecture

### High-Level Overview

MedAssist AI follows a microservices architecture with a multi-agent AI orchestration layer. The system is designed for scalability, maintainability, and real-time healthcare workflows.

### Architecture Layers

#### 1. Frontend Layer (React + Vite + Tailwind)
- **Single Page Application** built with React 18 and TypeScript
- **Responsive Design** optimized for mobile, tablet, and desktop
- **State Management** using Zustand with persistence
- **Data Fetching** via React Query with automatic caching
- **UI Components** built with Tailwind CSS utility classes
- **Animations** using Framer Motion for smooth transitions
- **Charts & Analytics** powered by Recharts

#### 2. API Gateway Layer (Nginx)
- **Reverse Proxy** routing requests to appropriate services
- **SSL Termination** for secure HTTPS connections
- **Rate Limiting** and request filtering
- **Static File Serving** for frontend assets

#### 3. Backend Layer (FastAPI)
- **RESTful API** with automatic OpenAPI documentation
- **Authentication & Authorization** using JWT tokens
- **Rate Limiting** via SlowAPI middleware
- **Request Validation** using Pydantic schemas
- **Error Handling** with structured error responses
- **Logging** with structured JSON logging

#### 4. AI Agent Layer (Multi-Agent Orchestration)
- **Coordinator Agent** orchestrates the workflow
- **6 Specialized Agents** each handling specific tasks
- **Agent Communication** via structured data passing
- **Gemini AI Integration** for natural language processing
- **Configurable Workflows** for different healthcare scenarios

#### 5. Database Layer (Firestore + Qdrant)
- **Firestore** for structured patient data, visits, reminders
- **Qdrant** for vector embeddings and semantic search
- **Firebase Auth** for user authentication
- **Google Cloud Storage** for report files and images

### Multi-Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      COORDINATOR AGENT                       │
│  Routes tasks, manages workflow, aggregates results          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │  PATIENT     │   │  RISK        │   │  KNOWLEDGE   │    │
│  │  REGISTRATION│──▶│  ASSESSMENT  │──▶│  AGENT       │    │
│  │  AGENT       │   │  AGENT       │   │  (RAG/Search)│    │
│  └──────────────┘   └──────────────┘   └──────────────┘    │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │  REMINDER    │   │  REPORT      │   │  GOVERNMENT   │    │
│  │  AGENT       │──▶│  GENERATOR   │──▶│  SCHEME       │    │
│  │  (Scheduler) │   │  (PDF)       │   │  AGENT        │    │
│  └──────────────┘   └──────────────┘   └──────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → Frontend captures patient data or queries
2. **API Request** → Sent to backend via REST API
3. **Coordinator Agent** → Routes task to appropriate agents
4. **Agent Processing** → Each agent performs its specialized task
5. **AI Integration** → Gemini AI processes natural language
6. **Database Operations** → Data stored/retrieved from Firestore
7. **Vector Search** → Qdrant performs semantic similarity search
8. **Response** → Results aggregated and returned to frontend

### Security Architecture

- **JWT-based Authentication** with token expiration
- **Firebase Authentication** for social login
- **Role-based Access Control** (admin, doctor, nurse, ASHA worker)
- **Firestore Security Rules** for data access control
- **CORS Configuration** restricting origins
- **Rate Limiting** to prevent abuse
- **Input Validation** using Pydantic schemas
- **Environment-based Secrets** management

### Scalability Design

- **Stateless Backend** enabling horizontal scaling
- **Connection Pooling** for database connections
- **Caching Layer** via Redis for frequently accessed data
- **Async Processing** using Python asyncio
- **Containerized Deployment** with Docker
- **Cloud Run Auto-scaling** based on request volume
- **CDN** for static asset delivery
