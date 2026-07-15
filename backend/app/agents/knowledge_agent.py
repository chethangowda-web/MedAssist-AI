from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service
from app.core.qdrant import search_knowledge, index_document, ensure_collection_exists
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class KnowledgeAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Medical Knowledge Agent",
            description="Searches WHO guidelines, government schemes, medical PDFs using RAG with Qdrant"
        )

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        self.log_activity("process_started", "running", {"query": input_data.get("query", "")})

        try:
            query = input_data.get("query", "")
            top_k = input_data.get("top_k", 5)
            filter_category = input_data.get("filter_category")

            filter_condition = None
            if filter_category:
                filter_condition = {
                    "must": [{"key": "category", "match": {"value": filter_category}}]
                }

            results = search_knowledge(query, limit=top_k)

            answer = gemini_service.answer_medical_query(query, results)

            self.log_activity("search_completed", "success", {
                "query": query,
                "results_count": len(results),
            })

            return {
                "status": "success",
                "query": query,
                "results": results,
                "answer": answer,
                "total_found": len(results),
            }

        except Exception as e:
            self.log_activity("search_failed", "error", {"error": str(e)})
            return {"status": "error", "error": str(e)}

    async def index_medical_document(self, doc_id: str, text: str, metadata: Dict[str, Any]) -> bool:
        try:
            index_document(doc_id, text, metadata)
            self.log_activity("document_indexed", "success", {"doc_id": doc_id})
            return True
        except Exception as e:
            self.log_activity("index_failed", "error", {"doc_id": doc_id, "error": str(e)})
            return False

    async def get_guidelines(self, condition: str) -> List[Dict[str, Any]]:
        results = search_knowledge(
            f"WHO guidelines for {condition} treatment and management",
            limit=3,
        )
        return results

    async def get_scheme_info(self, scheme_name: str) -> List[Dict[str, Any]]:
        results = search_knowledge(
            f"Government health scheme {scheme_name} eligibility benefits",
            limit=5,
            filter_condition={"must": [{"key": "category", "match": {"value": "government_scheme"}}]},
        )
        return results

knowledge_agent = KnowledgeAgent()
