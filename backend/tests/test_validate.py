import pytest
from app.services.validate import validate_syntax

def test_validate_valid_python():
    code = """
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
"""
    is_valid, err = validate_syntax(code, "python")
    assert is_valid is True
    assert err is None

def test_validate_invalid_python_syntax():
    code = """
def broken_function(:
    return 123
"""
    is_valid, err = validate_syntax(code, "python")
    assert is_valid is False
    assert err is not None
    assert "line 2" in err.lower() or "syntax" in err.lower()

def test_validate_valid_javascript():
    code = """
function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
"""
    is_valid, err = validate_syntax(code, "javascript")
    assert is_valid is True
    assert err is None

def test_validate_unclosed_delimiter():
    code = """
function test() {
    const list = [1, 2, 3;
}
"""
    is_valid, err = validate_syntax(code, "javascript")
    assert is_valid is False
    assert err is not None

