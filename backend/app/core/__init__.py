from app.core.config import settings
from app.core.firebase import get_db, get_auth, verify_firebase_token
from app.core.qdrant import (
    get_qdrant_client,
    get_embedding_model,
    ensure_collection_exists,
    embed_text,
    index_document,
    search_knowledge,
    delete_document,
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
    get_current_user,
)
