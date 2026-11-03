import ast
import re
from typing import Tuple, Optional, List

# Try importing tree-sitter bindings
_TS_AVAILABLE = False
_PY_PARSER = None
_JS_PARSER = None

try:
    from tree_sitter import Language, Parser
    import tree_sitter_python as tspython
    import tree_sitter_javascript as tsjavascript

    _PY_LANG = Language(tspython.language())
    _PY_PARSER = Parser(_PY_LANG)

    _JS_LANG = Language(tsjavascript.language())
    _JS_PARSER = Parser(_JS_LANG)

    _TS_AVAILABLE = True
except Exception as e:
    _TS_AVAILABLE = False


def _find_tree_sitter_error(node) -> Optional[str]:
    """Recursively search for error/missing nodes in tree-sitter AST."""
    if not node.has_error:
        return None

    if node.type == "ERROR" or getattr(node, "is_missing", False):
        line = node.start_point[0] + 1
        col = node.start_point[1] + 1
        return f"Syntax error near line {line}, col {col}"

    for child in node.children:
        err = _find_tree_sitter_error(child)
        if err:
            return err

    return f"Syntax error near line {node.start_point[0] + 1}"


def _check_balanced_delimiters(code: str) -> Optional[str]:
    """Check balanced parentheses, braces, brackets ignoring string literals and comments."""
    stack: List[Tuple[str, int]] = []
    pairs = {')': '(', '}': '{', ']': '['}
    
    # Strip basic string literals
    cleaned = re.sub(r'("""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'|"[^"\\]*(?:\\.[^"\\]*)*"|\'[^\'\\]*(?:\\.[^\'\\]*)*\')', ' ', code)
    # Strip line comments (# and //)
    cleaned = re.sub(r'(#.*|//.*)', '', cleaned)

    lines = cleaned.splitlines()
    for line_idx, line in enumerate(lines, start=1):
        for char in line:
            if char in "({[":
                stack.append((char, line_idx))
            elif char in ")}]":
                expected = pairs[char]
                if not stack:
                    return f"Unmatched closing delimiter '{char}' at line {line_idx}"
                open_char, open_line = stack.pop()
                if open_char != expected:
                    return f"Mismatched delimiter: opened '{open_char}' at line {open_line}, but closed with '{char}' at line {line_idx}"

    if stack:
        open_char, open_line = stack[-1]
        return f"Unclosed '{open_char}' opened at line {open_line}"

    return None


def validate_syntax(code: str, language: str) -> Tuple[bool, Optional[str]]:
    """
    Validate code syntax offline using tree-sitter and AST parsers.
    Returns:
        (is_valid, error_message_or_None)
    """
    if not code or not code.strip():
        return False, "Empty code received."

    lang = (language or "").strip().lower()

    # 1. Python validation
    if lang in ("python", "py"):
        # AST parse check (fast, highly descriptive error messages)
        try:
            ast.parse(code)
        except SyntaxError as e:
            return False, f"Python SyntaxError at line {e.lineno}: {e.msg}"

        # Tree-sitter double-check if available
        if _PY_PARSER:
            try:
                tree = _PY_PARSER.parse(code.encode("utf-8"))
                if tree.root_node.has_error:
                    err = _find_tree_sitter_error(tree.root_node)
                    return False, err or "Python syntax error detected in AST."
            except Exception:
                pass

        return True, None

    # 2. JavaScript / TypeScript validation
    if lang in ("javascript", "js", "typescript", "ts"):
        if _JS_PARSER:
            try:
                tree = _JS_PARSER.parse(code.encode("utf-8"))
                if tree.root_node.has_error:
                    err = _find_tree_sitter_error(tree.root_node)
                    return False, err or "JavaScript/TypeScript syntax error detected."
            except Exception:
                pass

        # Also verify balanced brackets as fallback
        delim_err = _check_balanced_delimiters(code)
        if delim_err:
            return False, delim_err

        return True, None

    # 3. JSON validation
    if lang == "json":
        import json
        try:
            json.loads(code)
            return True, None
        except Exception as e:
            return False, f"Invalid JSON: {str(e)}"

    # 4. General languages (C, C++, Go, Rust, Java, etc.)
    # Check for basic delimiter balance and unclosed blocks
    delim_err = _check_balanced_delimiters(code)
    if delim_err:
        return False, delim_err

    return True, None
