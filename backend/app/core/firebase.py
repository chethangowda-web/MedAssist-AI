import firebase_admin
from firebase_admin import credentials, firestore, auth
from app.core.config import settings
import json
import os

_firebase_app = None
_db = None
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_firebase_app():
    global _firebase_app

    if _firebase_app is None:
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
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid Firebase token: {str(e)}")

def get_bucket():
    get_firebase_app()
    from google.cloud import storage
    client = storage.Client()
    bucket = client.bucket(f"{settings.FIREBASE_PROJECT_ID}.appspot.com")
    return bucket
