from app.core.firebase import get_db
from typing import Dict, Any, List, Optional, Tuple
from google.cloud.firestore import Query
import os

# Development mode - use in-memory storage when Firebase not configured
DEV_MODE = os.getenv("FIRESTORE_DEV_MODE", "true").lower() == "true"

# In-memory storage for development
_dev_db: Dict[str, Dict[str, Dict[str, Any]]] = {}

class FirestoreService:
    def __init__(self):
        if DEV_MODE:
            self.db = None
        else:
            self.db = get_db()

    def create_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        if DEV_MODE:
            if collection not in _dev_db:
                _dev_db[collection] = {}
            _dev_db[collection][doc_id] = data
            return True
        self.db.collection(collection).document(doc_id).set(data)
        return True

    def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        if DEV_MODE:
            return _dev_db.get(collection, {}).get(doc_id)
        doc = self.db.collection(collection).document(doc_id).get()
        return doc.to_dict() if doc.exists else None

    def update_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        if DEV_MODE:
            if collection in _dev_db and doc_id in _dev_db[collection]:
                _dev_db[collection][doc_id].update(data)
                return True
            return False
        self.db.collection(collection).document(doc_id).update(data)
        return True

    def delete_document(self, collection: str, doc_id: str) -> bool:
        if DEV_MODE:
            if collection in _dev_db and doc_id in _dev_db[collection]:
                del _dev_db[collection][doc_id]
                return True
            return False
        self.db.collection(collection).document(doc_id).delete()
        return True

    def list_documents(
        self,
        collection: str,
        filters: Optional[List[Tuple[str, str, Any]]] = None,
        order_by: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Dict[str, Any]], int]:
        if DEV_MODE:
            results = []
            for doc_id, data in _dev_db.get(collection, {}).items():
                match = True
                if filters:
                    for field, op, value in filters:
                        doc_value = data.get(field)
                        if op == "==" and doc_value != value:
                            match = False
                            break
                        elif op == ">" and (doc_value is None or doc_value <= value):
                            match = False
                            break
                        elif op == "<" and (doc_value is None or doc_value >= value):
                            match = False
                            break
                        elif op == ">=" and (doc_value is None or doc_value < value):
                            match = False
                            break
                        elif op == "<=" and (doc_value is None or doc_value > value):
                            match = False
                            break
                if match:
                    result = data.copy()
                    result["id"] = doc_id
                    results.append(result)
            total = len(results)
            if order_by:
                results.sort(key=lambda x: x.get(order_by, ""))
            results = results[offset:offset+limit]
            return results, total
        query = self.db.collection(collection)

        if filters:
            for field, op, value in filters:
                if op == "==":
                    query = query.where(field, "==", value)
                elif op == ">":
                    query = query.where(field, ">", value)
                elif op == "<":
                    query = query.where(field, "<", value)
                elif op == ">=":
                    query = query.where(field, ">=", value)
                elif op == "<=":
                    query = query.where(field, "<=", value)
                elif op == "array_contains":
                    query = query.where(field, "array_contains", value)

        if order_by:
            query = query.order_by(order_by)

        count_query = query.count()
        total = count_query.get()[0][0].value

        query = query.offset(offset).limit(limit)
        docs = query.stream()

        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)

        return results, total

    def query_by_field(self, collection: str, field: str, value: Any) -> List[Dict[str, Any]]:
        if DEV_MODE:
            results = []
            for doc_id, data in _dev_db.get(collection, {}).items():
                if data.get(field) == value:
                    result = data.copy()
                    result["id"] = doc_id
                    results.append(result)
            return results
        docs = self.db.collection(collection).where(field, "==", value).stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        return results

firestore_service = FirestoreService()
