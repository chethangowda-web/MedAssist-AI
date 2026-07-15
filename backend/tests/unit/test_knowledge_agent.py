import pytest
from unittest.mock import MagicMock, patch
from app.agents.knowledge_agent import knowledge_agent


@pytest.mark.asyncio
async def test_search_knowledge_success(mock_gemini_service, mock_qdrant):
    mock_gemini_service.answer_medical_query.return_value = "Based on WHO guidelines, hypertension is treated with..."

    result = await knowledge_agent.process({
        "query": "What are the WHO guidelines for hypertension?",
        "top_k": 3,
    })

    assert result["status"] == "success"
    assert result["query"] == "What are the WHO guidelines for hypertension?"
    assert len(result["results"]) > 0
    assert "answer" in result
    mock_qdrant.assert_called_once()


@pytest.mark.asyncio
async def test_search_knowledge_empty_query(mock_gemini_service, mock_qdrant):
    result = await knowledge_agent.process({"query": ""})

    assert result["status"] == "success"
    assert result["query"] == ""


@pytest.mark.asyncio
async def test_index_medical_document(mock_qdrant):
    with patch("app.core.qdrant.index_document") as mock_index:
        mock_index.return_value = None
        success = await knowledge_agent.index_medical_document(
            doc_id="doc-001",
            text="WHO guidelines for malaria treatment",
            metadata={"source": "WHO", "category": "guidelines"},
        )
        assert success is True
        mock_index.assert_called_once()


@pytest.mark.asyncio
async def test_get_guidelines(mock_qdrant):
    result = await knowledge_agent.get_guidelines("hypertension")
    assert len(result) > 0
    mock_qdrant.assert_called_once()
    args, kwargs = mock_qdrant.call_args
    assert "hypertension" in args[0]


@pytest.mark.asyncio
async def test_search_knowledge_with_filter(mock_gemini_service, mock_qdrant):
    result = await knowledge_agent.process({
        "query": "Ayushman Bharat benefits",
        "filter_category": "government_scheme",
    })

    assert result["status"] == "success"
