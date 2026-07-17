import firebase_admin
from firebase_admin import credentials, firestore, auth
from app.core.config import settings
import json
import os
import jwt
import logging

_firebase_app = None
_db = None
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Development mode - set to True when running locally without service account
DEV_MODE = os.getenv("FIREBASE_DEV_MODE", "true").lower() == "true"

def get_firebase_app():
    global _firebase_app

    if _firebase_app is None:
        if DEV_MODE:
            # In dev mode, try to initialize without credentials
            # This works if we only need auth.verify_id_token with our mock
            # We'll use a mock credential that doesn't actually connect
            try:
                _firebase_app = firebase_admin.get_app("dev-app")
            except ValueError:
                # App doesn't exist, create it with a dummy credential
                # Use a certificate with minimal fields for local testing
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID or "demo-project",
                    "private_key_id": "dev-key-id",
                    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDdevmodeonly\n-----END PRIVATE KEY-----\n",
                    "client_email": "dev@demo-project.iam.gserviceaccount.com",
                    "client_id": "123456789",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                })
                _firebase_app = firebase_admin.initialize_app(
                    cred,
                    name="dev-app",
                    options={
                        "storageBucket": f"{settings.FIREBASE_PROJECT_ID or 'demo-project'}.appspot.com",
                    }
                )
            return _firebase_app

        service_account_path = os.path.join(_BASE_DIR, "serviceAccountKey.json")

        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)

        elif os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"):
            cred = credentials.Certificate(
                os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
            )

        else:
            raise FileNotFoundError(
                "Firebase serviceAccountKey.json not found. "
                "Place it inside the backend folder or set FIREBASE_SERVICE_ACCOUNT_PATH."
            )

        _firebase_app = firebase_admin.initialize_app(
            cred,
            {
                "storageBucket": f"{settings.FIREBASE_PROJECT_ID}.appspot.com",
            },
        )

    return _firebase_app

def get_db():
    global _db
    if _db is None:
        get_firebase_app()
        _db = firestore.client()
    return _db

def get_auth():
    get_firebase_app()
    return auth

def verify_firebase_token(id_token: str) -> dict:
    if DEV_MODE:
        # In dev mode, mock the token verification
        # This allows testing without real Firebase credentials
        try:
            # Decode without verification (dev mode only)
            decoded = jwt.decode(id_token, options={"verify_signature": False})
            return decoded
        except Exception as e:
            raise ValueError(f"Invalid Firebase token: {str(e)}")
    
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid Firebase token: {str(e)}")

def get_bucket():
    if DEV_MODE:
        return None
    try:
        get_firebase_app()
        from google.cloud import storage
        client = storage.Client()
        bucket = client.bucket(f"{settings.FIREBASE_PROJECT_ID}.appspot.com")
        return bucket
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.warning(f"Failed to get storage bucket: {e}")
        return None
