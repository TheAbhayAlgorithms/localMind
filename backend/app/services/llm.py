import json
import os
import re
import time
from typing import AsyncGenerator, Dict, Any, Optional, List
import httpx
from app.config import settings
from app.services.postprocess import extract_code_block, normalize_language
from app.services.validate import validate_syntax

class LLMRuntimeError(Exception):
    pass

class OllamaNotRunningError(LLMRuntimeError):
    pass

class ModelNotFoundError(LLMRuntimeError):
    pass


def build_system_prompt(language: str = "Auto") -> str:
    """Generate strict code-only system prompt."""
    if language and language.lower() != "auto":
        norm_lang = normalize_language(language)
        return (
            f"You are a code generator. Output ONLY a single fenced code block in {norm_lang} "
            f"(```{norm_lang} ... ```). No explanations, no comments outside the code, no text before or after. "
            f"Write complete, working, runnable code."
        )
    return (
        "You are a code generator. Determine the best language for the task and output ONLY a single fenced code block. "
        "No explanations, no comments outside the code, no text before or after. Write complete, working, runnable code."
    )


def build_strict_retry_prompt(original_prompt: str, language: str, syntax_error: Optional[str] = None) -> str:
    """Build retry prompt feeding back syntax error or formatting reminder."""
    if syntax_error:
        return (
            f"Task: {original_prompt}\n\n"
            f"CORRECTION REQUIRED: Your previous code had this syntax error:\n{syntax_error}\n\n"
            f"Fix the error completely. Output ONLY the fixed single fenced code block. Do NOT include any explanations."
        )
    return (
        f"Task: {original_prompt}\n\n"
        f"CRITICAL REQUIREMENT: You MUST output ONLY a single fenced code block (```{language.lower()}\n...```). "
        f"Do NOT include any conversational prose or text outside the code block."
    )


class LLMService:
    def __init__(self):
        self.ollama_base_url = settings.ollama_host.rstrip("/")
        self.llama_cpp_base_url = settings.llama_cpp_host.rstrip("/")
        self.runtime_type = settings.runtime_type

    async def check_health(self) -> Dict[str, Any]:
        """Check if local inference runtime is reachable."""
        if self.runtime_type == "ollama":
            url = f"{self.ollama_base_url}/api/version"
            try:
                async with httpx.AsyncClient(timeout=2.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        return {"status": "ok", "runtime": "ollama", "version": resp.json().get("version", "unknown")}
            except Exception:
                return {"status": "error", "runtime": "ollama", "message": "Ollama is not running on localhost:11434"}
        else:
            url = f"{self.llama_cpp_base_url}/health"
            try:
                async with httpx.AsyncClient(timeout=2.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        return {"status": "ok", "runtime": "llama_cpp"}
            except Exception:
                return {"status": "error", "runtime": "llama_cpp", "message": f"llama.cpp is not running on {self.llama_cpp_base_url}"}

        return {"status": "error", "runtime": self.runtime_type, "message": "Runtime unreachable"}

    async def list_local_models(self) -> List[Dict[str, Any]]:
        """List local installed models from Ollama or local ./models dir."""
        models: List[Dict[str, Any]] = []

        # Check Ollama installed models
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{self.ollama_base_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("models", []):
                        name = item.get("name", "")
                        size_bytes = item.get("size", 0)
                        size_gb = round(size_bytes / (1024 ** 3), 2)
                        details = item.get("details", {})
                        models.append({
                            "name": name,
                            "source": "ollama",
                            "size_gb": size_gb,
                            "format": details.get("format", "gguf"),
                            "family": details.get("family", "gemma"),
                            "parameter_size": details.get("parameter_size", ""),
                            "quantization_level": details.get("quantization_level", "Q4_K_M"),
                            "modified_at": item.get("modified_at", ""),
                        })
        except Exception:
            pass

        # Also check ./models directory for pre-downloaded GGUF files
        models_dir = settings.models_dir
        if os.path.exists(models_dir):
            for file in os.listdir(models_dir):
                if file.endswith(".gguf") or file.endswith(".bin"):
                    filepath = os.path.join(models_dir, file)
                    size_bytes = os.path.getsize(filepath)
                    size_gb = round(size_bytes / (1024 ** 3), 2)
                    models.append({
                        "name": file,
                        "source": "local_directory",
                        "size_gb": size_gb,
                        "format": "gguf",
                        "family": "gemma" if "gemma" in file.lower() else "custom",
                        "parameter_size": "",
                        "quantization_level": "Q4_K_M" if "q4" in file.lower() else "unknown",
                        "modified_at": "",
                    })

        return models

    async def stream_generate(
        self,
        prompt: str,
        language: str = "Auto",
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        max_tokens: Optional[int] = None,
        retry_feedback: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Stream raw tokens from local LLM."""
        active_model = model or settings.default_model
        system_prompt = build_system_prompt(language)
        user_prompt = prompt if not retry_feedback else build_strict_retry_prompt(prompt, language, retry_feedback)

        temp = temperature if temperature is not None else settings.default_temperature
        t_p = top_p if top_p is not None else settings.default_top_p
        num_predict = max_tokens or settings.default_max_tokens

        if self.runtime_type == "ollama":
            payload = {
                "model": active_model,
                "prompt": user_prompt,
                "system": system_prompt,
                "stream": True,
                "options": {
                    "temperature": temp,
                    "top_p": t_p,
                    "num_predict": num_predict,
                    "stop": ["```\n\n", "<|endoftext|>", "<|im_end|>", "### System", "### User"],
                }
            }

            url = f"{self.ollama_base_url}/api/generate"
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=5.0)) as client:
                    async with client.stream("POST", url, json=payload) as resp:
                        if resp.status_code == 404:
                            raise ModelNotFoundError(
                                f"Model '{active_model}' is not installed in Ollama. "
                                f"Please run 'bash scripts/download_models.sh' while connected to pre-download models."
                            )
                        if resp.status_code != 200:
                            err_body = await resp.aread()
                            raise LLMRuntimeError(f"Ollama error {resp.status_code}: {err_body.decode('utf-8')}")

                        async for line in resp.aiter_lines():
                            if not line:
                                continue
                            try:
                                chunk = json.loads(line)
                                token = chunk.get("response", "")
                                if token:
                                    yield token
                            except json.JSONDecodeError:
                                pass
            except httpx.ConnectError:
                raise OllamaNotRunningError(
                    f"Could not connect to Ollama on {self.ollama_base_url}. "
                    "Make sure Ollama is running locally: 'ollama serve'."
                )
            except httpx.ReadTimeout:
                raise LLMRuntimeError("Local model generation timed out.")
        else:
            # Fallback llama.cpp / openai compatible completion endpoint
            payload = {
                "prompt": f"System: {system_prompt}\nUser: {user_prompt}\nAssistant:",
                "stream": True,
                "temperature": temp,
                "top_p": t_p,
                "n_predict": num_predict,
            }
            url = f"{self.llama_cpp_base_url}/completion"
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=5.0)) as client:
                    async with client.stream("POST", url, json=payload) as resp:
                        if resp.status_code != 200:
                            raise LLMRuntimeError(f"llama.cpp error {resp.status_code}")
                        async for line in resp.aiter_lines():
                            if line.startswith("data: "):
                                data_str = line[6:]
                                try:
                                    chunk = json.loads(data_str)
                                    yield chunk.get("content", "")
                                except Exception:
                                    pass
            except httpx.ConnectError:
                raise LLMRuntimeError(f"Could not connect to llama.cpp server on {self.llama_cpp_base_url}.")

    async def generate_code_with_enforcement(
        self,
        prompt: str,
        requested_language: str = "Auto",
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        max_tokens: Optional[int] = None,
        on_token_callback = None,
    ) -> Dict[str, Any]:
        """
        Executes full 3-layer code enforcement:
        1. System prompt
        2. Post-processor extraction & prose stripping
        3. Tree-sitter syntax validation + auto-retry up to max_syntax_retries
        """
        active_model = model or settings.default_model
        retry_count = 0
        retry_feedback: Optional[str] = None
        start_time = time.time()
        final_code = ""
        detected_lang = requested_language
        syntax_valid = False
        error_msg: Optional[str] = None
        total_tokens = 0

        while retry_count <= settings.max_syntax_retries:
            raw_output = []
            try:
                async for token in self.stream_generate(
                    prompt=prompt,
                    language=requested_language,
                    model=active_model,
                    temperature=temperature,
                    top_p=top_p,
                    max_tokens=max_tokens,
                    retry_feedback=retry_feedback,
                ):
                    raw_output.append(token)
                    total_tokens += 1
                    if on_token_callback:
                        await on_token_callback(token)
            except Exception as e:
                raise e

            full_text = "".join(raw_output)

            # Layer 2: Post-process extraction
            code, lang, block_found = extract_code_block(full_text, requested_language)
            final_code = code
            detected_lang = lang if lang else requested_language

            # If no fenced block was found and this is attempt 0, re-prompt with stricter instruction
            if not block_found and retry_count == 0 and len(code.splitlines()) < 2:
                retry_feedback = (
                    "CRITICAL: You failed to output a fenced code block. "
                    "Output ONLY the code inside ```<language> and ```. Absolutely NO conversational text."
                )
                retry_count += 1
                if on_token_callback:
                    await on_token_callback("\n[Retrying with strict code block requirement...]\n")
                continue

            # Layer 3: Offline Syntax Validator
            syntax_valid, error_msg = validate_syntax(final_code, detected_lang)

            if syntax_valid:
                break
            else:
                retry_count += 1
                if retry_count <= settings.max_syntax_retries:
                    retry_feedback = f"Syntax error: {error_msg}"
                    if on_token_callback:
                        await on_token_callback(f"\n[Syntax error detected: {error_msg}. Auto-retrying...]\n")
                else:
                    # Exceeded retries, accept best-effort code
                    break

        duration_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "code": final_code,
            "language": detected_lang,
            "is_syntax_valid": syntax_valid,
            "syntax_error": error_msg,
            "retry_count": retry_count,
            "model_used": active_model,
            "tokens_generated": total_tokens,
            "duration_ms": duration_ms,
        }

llm_service = LLMService()
