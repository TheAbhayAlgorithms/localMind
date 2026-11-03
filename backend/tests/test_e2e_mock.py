import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_e2e_generate_clean_code():
    """Test full pipeline: prompt -> mock Ollama stream -> post-process -> AST validate -> response"""
    
    mock_tokens = [
        "Sure, here is the function you asked for:\n",
        "```python\n",
        "def binary_search(arr: list[int], target: int) -> int:\n",
        "    left, right = 0, len(arr) - 1\n",
        "    while left <= right:\n",
        "        mid = (left + right) // 2\n",
        "        if arr[mid] == target:\n",
        "            return mid\n",
        "        elif arr[mid] < target:\n",
        "            left = mid + 1\n",
        "        else:\n",
        "            right = mid - 1\n",
        "    return -1\n",
        "```\n",
        "Hope this helps! Let me know if you need tests."
    ]

    async def mock_stream_generate(*args, **kwargs):
        for token in mock_tokens:
            yield token

    with patch("app.services.llm.llm_service.stream_generate", side_effect=mock_stream_generate):
        response = client.post("/api/generate", json={
            "prompt": "Write a binary search algorithm in Python",
            "language": "Python"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["is_syntax_valid"] is True
        assert data["language"] == "python"
        assert data["file_extension"] == "py"
        # Verify layer 2 stripped conversational prose
        assert "Sure, here is the function" not in data["code"]
        assert "Hope this helps" not in data["code"]
        assert "def binary_search" in data["code"]
        assert data["retry_count"] == 0

@pytest.mark.asyncio
async def test_e2e_auto_retry_on_syntax_error():
    """Test that a syntax-invalid initial output triggers auto-retry and recovers"""
    attempt = 0

    async def mock_flaky_stream(*args, **kwargs):
        nonlocal attempt
        attempt += 1
        if attempt == 1:
            # First attempt has syntax error: missing colon
            tokens = ["```python\ndef broken_func()\n    return 42\n```"]
        else:
            # Second attempt fixes syntax
            tokens = ["```python\ndef broken_func():\n    return 42\n```"]
        for t in tokens:
            yield t

    with patch("app.services.llm.llm_service.stream_generate", side_effect=mock_flaky_stream):
        response = client.post("/api/generate", json={
            "prompt": "Write broken_func",
            "language": "Python"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["is_syntax_valid"] is True
        assert data["retry_count"] == 1
        assert "def broken_func():" in data["code"]

