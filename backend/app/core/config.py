from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "MedAssist AI"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Multi-Agent AI Healthcare Assistant for Rural Healthcare Workers"
    DEBUG: bool = False

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-001")
    GEMINI_EMBEDDING_MODEL: str = "models/text-embedding-004"

    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "")
    FIREBASE_CLIENT_EMAIL: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
    FIREBASE_DATABASE_URL: str = os.getenv("FIREBASE_DATABASE_URL", "")

    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    QDRANT_COLLECTION: str = "medical_knowledge"

    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")

    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "https://medassist-ai.web.app"]

    RATE_LIMIT: str = "100/minute"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024

    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")

    ENABLE_VOICE: bool = os.getenv("ENABLE_VOICE", "true").lower() == "true"
    ENABLE_OCR: bool = os.getenv("ENABLE_OCR", "true").lower() == "true"
    ENABLE_EMERGENCY: bool = os.getenv("ENABLE_EMERGENCY", "true").lower() == "true"
    ENABLE_MEDICINE_SCANNER: bool = os.getenv("ENABLE_MEDICINE_SCANNER", "true").lower() == "true"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
