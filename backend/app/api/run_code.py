from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from app.services.sandbox import run_sandboxed_code
from app.config import settings

router = APIRouter(prefix="/api/run", tags=["run"])

class CodeRunRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str = Field(..., min_length=1)
    timeout_seconds: Optional[int] = None

class CodeRunResponse(BaseModel):
    status: str
    stdout: str
    stderr: str
    exit_code: int
    duration_ms: float

@router.post("", response_model=CodeRunResponse)
async def execute_code(req: CodeRunRequest):
    """Execute code in a local sandboxed subprocess (Python/JS only)."""
    result = await run_sandboxed_code(
        code=req.code,
        language=req.language,
        timeout_seconds=req.timeout_seconds,
        allow_execution=settings.allow_code_execution,
    )
    return CodeRunResponse(**result)
