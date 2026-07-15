# MedAssist AI - Setup Guide

## Prerequisites Setup

### 1. Python Installation
```bash
# Check Python version
python --version  # Must be 3.12+

# Install pip
python -m ensurepip --upgrade
```

### 2. Node.js Installation
```bash
# Check Node version
node --version  # Must be 18+

# Install npm
npm --version
```

### 3. Docker Installation
- Download Docker Desktop from https://www.docker.com/products/docker-desktop
- Enable WSL2 backend on Windows

### 4. Google Cloud Setup

#### Create Google Cloud Project
```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Create project
gcloud projects create medassist-ai --name="MedAssist AI"
gcloud config set project medassist-ai
```

#### Enable APIs
```bash
# Enable required APIs
gcloud services enable \
  firestore.googleapis.com \
  firebase.googleapis.com \
  cloudresourcemanager.googleapis.com \
  aiplatform.googleapis.com
```

### 5. Firebase Setup

1. Go to https://console.firebase.google.com
2. Create project or import from Google Cloud
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google provider
4. Create Firestore Database:
   - Choose "Start in test mode"
   - Select appropriate location
5. Get Service Account:
   - Project Settings → Service Accounts
   - "Generate New Private Key"
   - Save as `service-account.json`

### 6. Gemini API Setup

1. Go to https://aistudio.google.com
2. Get API key from Google AI Studio
3. Enable Gemini API in Google Cloud Console

### 7. Qdrant Setup

#### Local (Docker)
```bash
docker run -p 6333:6333 qdrant/qdrant
```

#### Cloud (Qdrant Cloud)
1. Sign up at https://cloud.qdrant.io
2. Create cluster
3. Get API key and endpoint URL

## Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/medassist-ai.git
cd medassist-ai
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

### 3. Environment Configuration

Edit `backend/.env`:

```ini
# REQUIRED
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_PROJECT_ID=medassist-ai
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXX...XXXX\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@medassist-ai.iam.gserviceaccount.com
SECRET_KEY=your-32-char-min-secret-key-change-this

# QDRANT (Local defaults)
QDRANT_HOST=localhost
QDRANT_PORT=6333

# OPTIONAL with defaults
DEBUG=true
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
RATE_LIMIT=100/minute
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=medassist-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=medassist-ai
VITE_FIREBASE_STORAGE_BUCKET=medassist-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 5. Initialize Database

```bash
cd backend
python -m app.utils.rag_pipeline
```

This seeds the Qdrant vector database with:
- WHO medical guidelines
- Government healthcare scheme details
- Emergency triage protocols
- Immunization schedules

### 6. Run Application

#### Development Mode

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - Qdrant (if not using Docker):
```bash
docker run -p 6333:6333 qdrant/qdrant
```

#### Access the Application

- Frontend: http://localhost:5173
- API Swagger Docs: http://localhost:8080/docs
- API ReDoc: http://localhost:8080/redoc
- Qdrant Dashboard: http://localhost:6333/dashboard

### 7. Verify Setup

```bash
# Check backend health
curl http://localhost:8080/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-01T00:00:00","version":"1.0.0"}

# Check Qdrant
curl http://localhost:6333/health

# Register a test user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"doctor"}'
```

## Troubleshooting

### Common Issues

#### 1. ModuleNotFoundError: No module named 'app'
```bash
# Ensure you're in the backend directory
cd backend
# Ensure virtual environment is activated
source venv/bin/activate
```

#### 2. Qdrant connection refused
```bash
# Ensure Qdrant is running
curl http://localhost:6333/health
# If not, start it:
docker run -d -p 6333:6333 qdrant/qdrant
```

#### 3. Gemini API errors
```bash
# Verify your API key:
curl -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

#### 4. Firebase authentication fails
```bash
# Verify service account key format
# The private key in .env must have literal \n for newlines
# Ensure project ID matches
```

#### 5. Frontend can't connect to backend
```bash
# Check CORS settings in backend/.env
# Ensure VITE_API_URL points to correct backend URL
# Check for proxy configuration in vite.config.ts
```
