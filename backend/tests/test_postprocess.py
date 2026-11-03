import pytest
from app.services.postprocess import extract_code_block, normalize_language, get_file_extension

def test_normalize_language():
    assert normalize_language("py") == "python"
    assert normalize_language("Python") == "python"
    assert normalize_language("js") == "javascript"
    assert normalize_language("ts") == "typescript"
    assert normalize_language("golang") == "go"
    assert normalize_language("rs") == "rust"

def test_get_file_extension():
    assert get_file_extension("python") == "py"
    assert get_file_extension("javascript") == "js"
    assert get_file_extension("typescript") == "ts"
    assert get_file_extension("rust") == "rs"
    assert get_file_extension("c++") == "cpp"

def test_extract_code_block_clean():
    raw = "```python\ndef binary_search(arr, target):\n    return -1\n```"
    code, lang, found = extract_code_block(raw, "python")
    assert found is True
    assert lang == "python"
    assert "def binary_search" in code
    assert "```" not in code

def test_extract_code_block_strips_prose():
    raw = (
        "Sure! Here is the implementation you requested:\n\n"
        "```python\ndef solve(x):\n    return x * 2\n```\n\n"
        "Hope this helps! Let me know if you need more assistance."
    )
    code, lang, found = extract_code_block(raw, "python")
    assert found is True
    assert lang == "python"
    assert code == "def solve(x):\n    return x * 2"
    assert "Sure!" not in code
    assert "Hope this helps" not in code

def test_extract_code_block_unwrapped_code():
    raw = (
        "Here is the function:\n"
        "def hello_world():\n"
        "    print('Hello World')\n"
    )
    code, lang, found = extract_code_block(raw, "python")
    assert found is False
    assert "def hello_world():" in code
    assert "Here is the function:" not in code

