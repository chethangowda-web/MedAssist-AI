from pydantic_settings import BaseSettings
from typing import Optional, List
import os
import json
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "MedAssist AI"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Multi-Agent AI Healthcare Assistant for Rural Healthcare Workers"
    DEBUG: bool = False

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash-001"
    GEMINI_EMBEDDING_MODEL: str = "models/text-embedding-004"

    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""
    FIREBASE_DATABASE_URL: str = ""

    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "medical_knowledge"

    REDIS_URL: str = "redis://localhost:6379"

    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://[::1]:5173", "http://localhost:3000", "https://medassist-ai.web.app"]

    RATE_LIMIT: str = "100/minute"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024

    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GOOGLE_MAPS_API_KEY: str = ""

    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "google/gemini-2.0-flash-001"

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    ENABLE_VOICE: bool = True
    ENABLE_OCR: bool = True
    ENABLE_EMERGENCY: bool = True
    ENABLE_MEDICINE_SCANNER: bool = True

    def __init__(self, **data):
        env_cors = os.getenv("CORS_ORIGINS")
        if env_cors:
            try:
                data["CORS_ORIGINS"] = json.loads(env_cors)
            except (json.JSONDecodeError, TypeError):
                data["CORS_ORIGINS"] = [origin.strip() for origin in env_cors.split(",") if origin.strip()]
        env_gemini = os.getenv("GEMINI_API_KEY")
        if env_gemini:
            data["GEMINI_API_KEY"] = env_gemini
        super().__init__(**data)

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
