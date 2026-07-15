import pytest
from unittest.mock import MagicMock, patch
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


@pytest.fixture
def mock_auth():
    with patch("app.api.auth.get_current_user") as mock:
        mock.return_value = {
            "uid": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
            "role": "healthcare_worker",
        }
        yield mock


@pytest.fixture
def override_dependencies(mock_auth):
    with patch("app.api.patients.get_current_user") as mock_patients:
        mock_patients.return_value = {"uid": "test", "role": "healthcare_worker"}
        with patch("app.api.visits.get_current_user") as mock_visits:
            mock_visits.return_value = {"uid": "test", "role": "healthcare_worker"}
            with patch("app.api.agents.get_current_user") as mock_agents:
                mock_agents.return_value = {"uid": "test", "role": "healthcare_worker"}
                with patch("app.api.reports.get_current_user") as mock_reports:
                    mock_reports.return_value = {"uid": "test", "role": "healthcare_worker"}
                    with patch("app.api.dashboard.get_current_user") as mock_dash:
                        mock_dash.return_value = {"uid": "test", "role": "healthcare_worker"}
                        yield


@pytest.mark.asyncio
async def test_health_endpoint(override_dependencies):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data


@pytest.mark.asyncio
async def test_root_endpoint(override_dependencies):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert data["app"] == settings.APP_NAME


@pytest.mark.asyncio
async def test_dashboard_stats_endpoint(override_dependencies):
    with patch("app.services.firestore_service.firestore_service.list_documents") as mock_list:
        mock_list.return_value = (
            [{"id": "p1", "name": "Patient 1", "risk_level": "high"}],
            1,
        )

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/dashboard/stats")
            assert response.status_code == 200
            data = response.json()
            assert "totalPatients" in data


@pytest.mark.asyncio
async def test_dashboard_activity_endpoint(override_dependencies):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/dashboard/activity")
        assert response.status_code == 200
        data = response.json()
        assert "activities" in data


@pytest.mark.asyncio
async def test_patients_list_endpoint(override_dependencies):
    with patch("app.services.firestore_service.firestore_service.list_documents") as mock_list:
        mock_list.return_value = (
            [{"id": "p1", "name": "Patient 1"}, {"id": "p2", "name": "Patient 2"}],
            2,
        )

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/patients/")
            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 2
            assert len(data["patients"]) == 2


@pytest.mark.asyncio
async def test_patients_register_endpoint(override_dependencies):
    with patch("app.api.patients.patient_registration_agent.process") as mock_register:
        mock_register.return_value = {
            "status": "success",
            "patient_id": "new-patient-001",
            "patient": {"name": "New Patient"},
        }

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/patients/register",
                json={"name": "New Patient", "age": 30, "gender": "male"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert data["patient_id"] == "new-patient-001"


@pytest.mark.asyncio
async def test_agents_assess_risk(override_dependencies):
    with patch("app.api.agents.risk_assessment_agent.process") as mock_assess:
        mock_assess.return_value = {
            "status": "success",
            "risk_level": "high",
            "overall_risk_score": 0.72,
        }

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/agents/assess-risk",
                json={"patient_id": "test-1", "symptoms": ["headache"]},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"


@pytest.mark.asyncio
async def test_agents_search_knowledge(override_dependencies):
    with patch("app.api.agents.knowledge_agent.process") as mock_search:
        mock_search.return_value = {
            "status": "success",
            "query": "hypertension",
            "results": [],
            "answer": "WHO guidelines...",
        }

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/agents/search-knowledge",
                json={"query": "hypertension treatment guidelines"},
            )
            assert response.status_code == 200
            assert response.json()["status"] == "success"


@pytest.mark.asyncio
async def test_reports_generate(override_dependencies):
    with patch("app.api.reports.report_generator_agent.process") as mock_report:
        mock_report.return_value = {
            "status": "success",
            "report_id": "rpt-001",
            "report": {"id": "rpt-001"},
        }

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/reports/generate",
                json={"patient_id": "test-1", "report_type": "patient_summary", "format": "pdf"},
            )
            assert response.status_code == 200


@pytest.mark.asyncio
async def test_visits_create_endpoint(override_dependencies):
    with patch("app.services.firestore_service.firestore_service.create_document") as mock_create:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/visits/",
                json={
                    "patient_id": "test-1",
                    "visit_type": "checkup",
                    "chief_complaint": "Routine check",
                },
            )
            assert response.status_code == 200
