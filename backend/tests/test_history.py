import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import Base, engine

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["offline_guaranteed"] is True

def test_csp_header_present():
    response = client.get("/api/health")
    assert "content-security-policy" in response.headers
    assert "default-src 'self'" in response.headers["content-security-policy"]
    assert "connect-src 'self' http://localhost:*" in response.headers["content-security-policy"]

def test_snippets_crud():
    # Create snippet
    res = client.post("/api/snippets", json={
        "title": "Binary Search",
        "prompt": "Binary search algorithm",
        "language": "python",
        "code": "def search(a, t): pass",
        "tags": "algorithm, search"
    })
    assert res.status_code == 200
    snippet_id = res.json()["id"]

    # List snippets
    list_res = client.get("/api/snippets?q=Binary")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) >= 1
    assert any(i["id"] == snippet_id for i in items)

    # Delete snippet
    del_res = client.delete(f"/api/snippets/{snippet_id}")
    assert del_res.status_code == 200

def test_system_settings_roundtrip():
    # Update settings
    put_res = client.post("/api/system/settings", json={
        "temperature": 0.25,
        "default_language": "TypeScript",
        "allow_code_execution": True,
    })
    assert put_res.status_code == 200

    # Read back
    get_res = client.get("/api/system/settings")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["temperature"] == 0.25
    assert data["default_language"] == "TypeScript"
    assert data["allow_code_execution"] is True
