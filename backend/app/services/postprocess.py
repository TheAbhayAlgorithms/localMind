import re
from typing import Tuple, Optional
from pygments.lexers import guess_lexer, get_lexer_by_name

# Standard language alias mapping
LANGUAGE_ALIASES = {
    "py": "python",
    "python": "python",
    "python3": "python",
    "js": "javascript",
    "javascript": "javascript",
    "node": "javascript",
    "ts": "typescript",
    "typescript": "typescript",
    "java": "java",
    "c": "c",
    "cpp": "cpp",
    "c++": "cpp",
    "cc": "cpp",
    "cxx": "cpp",
    "go": "go",
    "golang": "go",
    "rust": "rust",
    "rs": "rust",
    "sql": "sql",
    "bash": "bash",
    "sh": "bash",
    "shell": "bash",
    "zsh": "bash",
    "html": "html",
    "htm": "html",
    "css": "css",
    "json": "json",
    "yaml": "yaml",
    "yml": "yaml",
}

EXTENSION_MAP = {
    "python": "py",
    "javascript": "js",
    "typescript": "ts",
    "java": "java",
    "c": "c",
    "cpp": "cpp",
    "go": "go",
    "rust": "rs",
    "sql": "sql",
    "bash": "sh",
    "html": "html",
    "css": "css",
    "json": "json",
    "yaml": "yaml",
    "text": "txt",
}

COMMON_PROSE_PREFIXES = [
    r"^here('s| is| are) (the|your|a) (code|solution|implementation|function|script|program)[\s\S]*?:",
    r"^certainly[\s\S]*?:",
    r"^sure[\s\S]*?:",
    r"^below is (the|a) [\s\S]*?:",
    r"^to (do|solve|implement) this[\s\S]*?:",
]

COMMON_PROSE_SUFFIXES = [
    r"(hope this helps|let me know if|feel free to ask|note that|you can run this by|this code assumes)[\s\S]*$",
]

def normalize_language(lang_str: Optional[str]) -> str:
    """Normalize language identifier to canonical lower-case name."""
    if not lang_str:
        return ""
    clean = lang_str.strip().lower()
    return LANGUAGE_ALIASES.get(clean, clean)

def get_file_extension(language: str) -> str:
    """Return appropriate file extension for given language."""
    norm = normalize_language(language)
    return EXTENSION_MAP.get(norm, "txt")

def detect_language_with_pygments(code: str) -> str:
    """Attempt to detect language using Pygments lexer."""
    if not code.strip():
        return "text"
    try:
        lexer = guess_lexer(code)
        aliases = lexer.aliases
        if aliases:
            norm = normalize_language(aliases[0])
            if norm:
                return norm
    except Exception:
        pass
    return "text"

def extract_code_block(
    raw_text: str,
    requested_language: str = "Auto"
) -> Tuple[str, str, bool]:
    """
    Extract code block and detected language from raw LLM output.
    Returns:
        (clean_code, detected_language, block_found)
    """
    if not raw_text:
        return "", requested_language if requested_language != "Auto" else "text", False

    text = raw_text.strip()

    # Pattern for markdown fenced code blocks: ```[lang]\n...\n```
    fenced_pattern = re.compile(r"```([a-zA-Z0-9_+#.-]*)\s*\n([\s\S]*?)```")
    matches = list(fenced_pattern.finditer(text))

    if matches:
        first_match = matches[0]
        detected_lang = normalize_language(first_match.group(1))
        code_content = first_match.group(2).rstrip()
        
        # If requested language was specific, prioritize that over empty block tag
        if requested_language and requested_language.lower() != "auto":
            final_lang = normalize_language(requested_language)
        elif detected_lang:
            final_lang = detected_lang
        else:
            final_lang = detect_language_with_pygments(code_content)

        return code_content, final_lang, True

    # No fenced block found - strip leading/trailing prose and clean up
    cleaned = text

    # Strip conversational headers
    for pattern in COMMON_PROSE_PREFIXES:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE | re.MULTILINE).strip()

    # Strip conversational trailers
    for pattern in COMMON_PROSE_SUFFIXES:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE | re.MULTILINE).strip()

    # If raw backticks were left unclosed at start or end
    cleaned = re.sub(r"^```[a-zA-Z0-9_+#.-]*\s*\n", "", cleaned)
    cleaned = re.sub(r"\n```\s*$", "", cleaned)
    cleaned = cleaned.strip()

    final_lang = requested_language if requested_language.lower() != "auto" else detect_language_with_pygments(cleaned)
    return cleaned, normalize_language(final_lang), False

