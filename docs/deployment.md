# MedAssist AI - Deployment Guide

## Deployment Options

### 1. Docker Compose (Recommended for Production)

#### Prerequisites
- Docker 24+ and Docker Compose v2
- 4GB+ RAM, 20GB+ storage

#### Steps

```bash
# Clone repository
git clone https://github.com/yourusername/medassist-ai.git
cd medassist-ai

# Configure environment
cp backend/.env.example backend/.env
# Edit .env with production values

# Start all services
docker-compose -f deployment/docker-compose.yml up -d

# Check status
docker-compose -f deployment/docker-compose.yml ps

# View logs
docker-compose -f deployment/docker-compose.yml logs -f

# Seed medical knowledge
docker exec medassist-backend python -m app.utils.rag_pipeline
```

#### Service Health Checks

```bash
# Backend health
curl http://localhost:8080/health

# Qdrant health
curl http://localhost:6333/health

# Frontend
open http://localhost:3000
```

### 2. Google Cloud Run (Scalable)

#### Prerequisites
- Google Cloud SDK installed
- Firebase project configured
- Gemini API key

#### Backend Deployment

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable required services
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

# Create secrets
echo -n "YOUR_GEMINI_KEY" | gcloud secrets create gemini-api-key --data-file=-
echo -n "YOUR_JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-

# Build and push container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/medassist-backend

# Deploy to Cloud Run
gcloud run deploy medassist-backend \
  --image gcr.io/YOUR_PROJECT_ID/medassist-backend \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --concurrency 80 \
  --timeout 300 \
  --set-secrets=GEMINI_API_KEY=gemini-api-key:latest,SECRET_KEY=jwt-secret:latest \
  --set-env-vars="FIREBASE_PROJECT_ID=YOUR_PROJECT_ID,QDRANT_HOST=localhost,QDRANT_PORT=6333,DEBUG=false" \
  --allow-unauthenticated
```

#### Frontend Deployment (Firebase Hosting)

```bash
# Install Firebase tools
npm install -g firebase-tools

# Login
firebase login

# Initialize project
cd frontend
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

### 3. Manual Installation (Development)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Run with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Qdrant (Vector Database)

```bash
# Using Docker
docker run -d \
  --name medassist-qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v qdrant_data:/qdrant/storage \
  qdrant/qdrant:latest
```

#### Redis (Caching)

```bash
docker run -d \
  --name medassist-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### 4. Docker Commands Reference

```bash
# Build images
docker-compose -f deployment/docker-compose.yml build

# Start services
docker-compose -f deployment/docker-compose.yml up -d

# Stop services
docker-compose -f deployment/docker-compose.yml down

# View logs for specific service
docker-compose -f deployment/docker-compose.yml logs -f backend

# Restart a service
docker-compose -f deployment/docker-compose.yml restart qdrant

# Scale a service
docker-compose -f deployment/docker-compose.yml up -d --scale backend=3

# Clean up volumes
docker-compose -f deployment/docker-compose.yml down -v
```

## Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| GEMINI_API_KEY | Google Gemini API key | Yes |
| FIREBASE_PROJECT_ID | Firebase project ID | Yes |
| FIREBASE_PRIVATE_KEY | Firebase service account key | Yes |
| FIREBASE_CLIENT_EMAIL | Firebase service account email | Yes |
| SECRET_KEY | JWT signing secret (32+ chars) | Yes |
| QDRANT_HOST | Qdrant server hostname | Yes |
| QDRANT_PORT | Qdrant server port | Yes |
| REDIS_URL | Redis connection URL | Optional |
| CORS_ORIGINS | Allowed CORS origins | Yes |
| DEBUG | Enable debug mode | No |

### Frontend (.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | Backend API URL | Yes |
| VITE_FIREBASE_API_KEY | Firebase API key | Yes |
| VITE_FIREBASE_AUTH_DOMAIN | Firebase auth domain | Yes |
| VITE_FIREBASE_PROJECT_ID | Firebase project ID | Yes |

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.medassist-ai.com -d medassist-ai.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring

### Health Check Endpoints

- `/health` - Backend health status
- `/` - API root with version info
- Qdrant: `/health` on port 6333

### Logging

```bash
# Docker logs
docker-compose logs -f backend

# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=medassist-backend" --limit 50
```

## Backup

### Firestore Backup

```bash
# Export Firestore data
gcloud firestore export gs://YOUR_BUCKET/backups/$(date +%Y%m%d)

# Schedule with Cloud Scheduler
gcloud scheduler jobs create firestore-export \
  --schedule="0 2 * * *" \
  --uri="https://firestore.googleapis.com/v1/projects/YOUR_PROJECT/databases/(default):exportDocuments" \
  --http-method=POST \
  --body="{\"outputUriPrefix\":\"gs://YOUR_BUCKET/backups/\"}"
```

### Qdrant Backup

Qdrant data is stored in the Docker volume `qdrant_data`. Backup using:

```bash
docker run --rm -v qdrant_data:/source -v $(pwd)/backup:/dest alpine tar czf /dest/qdrant-backup.tar.gz -C /source .
```
