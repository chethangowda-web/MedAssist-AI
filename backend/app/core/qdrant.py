from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from app.core.config import settings
from typing import List, Dict, Any
import numpy as np

_qdrant_client = None
_embedding_model = None

def get_qdrant_client() -> QdrantClient:
    global _qdrant_client
    if _qdrant_client is None:
        _qdrant_client = QdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT,
        )
    return _qdrant_client

def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model

def ensure_collection_exists():
    client = get_qdrant_client()
    collections = client.get_collections().collections
    collection_names = [c.name for c in collections]

    if settings.QDRANT_COLLECTION not in collection_names:
        client.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )

def embed_text(text: str) -> List[float]:
    model = get_embedding_model()
    embedding = model.encode(text)
    return embedding.tolist()

def index_document(doc_id: str, text: str, metadata: Dict[str, Any]):
    client = get_qdrant_client()
    ensure_collection_exists()
    embedding = embed_text(text)

    point = PointStruct(
        id=hash(doc_id) % (2**63),
        vector=embedding,
        payload={"doc_id": doc_id, "text": text, **metadata},
    )
    client.upsert(collection_name=settings.QDRANT_COLLECTION, points=[point])
    return True

def search_knowledge(query: str, limit: int = 5, filter_condition: Dict = None) -> List[Dict[str, Any]]:
    client = get_qdrant_client()
    ensure_collection_exists()
    query_vector = embed_text(query)

    search_params = {
        "collection_name": settings.QDRANT_COLLECTION,
        "query_vector": query_vector,
        "limit": limit,
        "with_payload": True,
    }
    if filter_condition:
        from qdrant_client.http.models import Filter
        search_params["query_filter"] = Filter(**filter_condition)

    results = client.search(**search_params)
    return [
        {
            "id": hit.id,
            "score": hit.score,
            "text": hit.payload.get("text", ""),
            "metadata": {k: v for k, v in hit.payload.items() if k != "text"},
        }
        for hit in results
    ]

def delete_document(doc_id: str):
    client = get_qdrant_client()
    client.delete(
        collection_name=settings.QDRANT_COLLECTION,
        points_selector=[hash(doc_id) % (2**63)],
    )
