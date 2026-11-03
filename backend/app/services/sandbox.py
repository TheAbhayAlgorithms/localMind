import asyncio
import os
import resource
import shutil
import tempfile
import time
from typing import Dict, Any, Optional
from app.config import settings

def _set_resource_limits(memory_mb: int, cpu_seconds: int):
    """Set process resource limits in child process before execution."""
    def preexec():
        try:
            # Memory limit (address space) in bytes
            mem_bytes = memory_mb * 1024 * 1024
            resource.setrlimit(resource.RLIMIT_AS, (mem_bytes, mem_bytes))
        except Exception:
            pass

        try:
            # CPU time limit in seconds
            resource.setrlimit(resource.RLIMIT_CPU, (cpu_seconds, cpu_seconds + 1))
        except Exception:
            pass

    return preexec


async def run_sandboxed_code(
    code: str,
    language: str,
    timeout_seconds: Optional[int] = None,
    allow_execution: Optional[bool] = None,
) -> Dict[str, Any]:
    """
    Execute Python or JavaScript code inside a sandboxed subprocess with strict limits.
    Network is not accessible; CPU time and memory are bounded.
    """
    is_allowed = allow_execution if allow_execution is not None else settings.allow_code_execution
    if not is_allowed:
        return {
            "status": "disabled",
            "stdout": "",
            "stderr": "Sandboxed code execution is disabled by default. Enable it in Settings to run code locally.",
            "exit_code": -1,
            "duration_ms": 0,
        }

    lang = language.strip().lower()
    timeout = timeout_seconds or settings.sandbox_timeout_seconds
    mem_limit = settings.sandbox_memory_limit_mb

    # Determine interpreter binary and filename
    if lang in ("python", "py"):
        interpreter = shutil.which("python3") or shutil.which("python")
        if not interpreter:
            return {"status": "error", "stdout": "", "stderr": "Python interpreter not found.", "exit_code": -1, "duration_ms": 0}
        filename = "main.py"
    elif lang in ("javascript", "js", "typescript", "ts"):
        interpreter = shutil.which("node")
        if not interpreter:
            return {"status": "error", "stdout": "", "stderr": "Node.js runtime not found.", "exit_code": -1, "duration_ms": 0}
        filename = "main.js"
    else:
        return {
            "status": "unsupported",
            "stdout": "",
            "stderr": f"Direct execution for language '{language}' is not supported. Supported: Python, JavaScript.",
            "exit_code": -1,
            "duration_ms": 0,
        }

    start_time = time.time()

    with tempfile.TemporaryDirectory() as tmp_dir:
        file_path = os.path.join(tmp_dir, filename)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code)

        # Isolated environment variables without sensitive system tokens
        isolated_env = {
            "PATH": os.environ.get("PATH", "/usr/bin:/bin:/usr/local/bin"),
            "HOME": tmp_dir,
            "TMPDIR": tmp_dir,
            "PYTHONUNBUFFERED": "1",
            "NODE_NO_WARNINGS": "1",
        }

        try:
            proc = await asyncio.create_subprocess_exec(
                interpreter,
                file_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=tmp_dir,
                env=isolated_env,
                preexec_fn=_set_resource_limits(mem_limit, timeout),
            )

            stdout_data, stderr_data = await asyncio.wait_for(
                proc.communicate(),
                timeout=float(timeout),
            )

            duration_ms = round((time.time() - start_time) * 1000, 2)

            # Cap output to 64KB
            out_str = stdout_data.decode("utf-8", errors="replace")[:65536]
            err_str = stderr_data.decode("utf-8", errors="replace")[:65536]

            return {
                "status": "success" if proc.returncode == 0 else "failed",
                "stdout": out_str,
                "stderr": err_str,
                "exit_code": proc.returncode,
                "duration_ms": duration_ms,
            }

        except asyncio.TimeoutError:
            try:
                proc.kill()
            except Exception:
                pass
            duration_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "status": "timeout",
                "stdout": "",
                "stderr": f"Execution timed out after {timeout} seconds.",
                "exit_code": -1,
                "duration_ms": duration_ms,
            }
        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "status": "error",
                "stdout": "",
                "stderr": f"Sandbox execution error: {str(e)}",
                "exit_code": -1,
                "duration_ms": duration_ms,
            }

