from app.core.firebase import get_db
from typing import Dict, Any, List, Optional, Tuple
from google.cloud.firestore import Query

class FirestoreService:
    def __init__(self):
        self.db = get_db()

    def create_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        self.db.collection(collection).document(doc_id).set(data)
        return True

    def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        doc = self.db.collection(collection).document(doc_id).get()
        return doc.to_dict() if doc.exists else None

    def update_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        self.db.collection(collection).document(doc_id).update(data)
        return True

    def delete_document(self, collection: str, doc_id: str) -> bool:
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
        docs = self.db.collection(collection).where(field, "==", value).stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        return results

firestore_service = FirestoreService()
