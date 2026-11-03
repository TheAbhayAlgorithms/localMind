import json
import time
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, AsyncGenerator
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import GenerationHistory, UserSetting
from app.services.llm import llm_service, LLMRuntimeError, OllamaNotRunningError, ModelNotFoundError
from app.services.postprocess import extract_code_block, get_file_extension
from app.config import settings

router = APIRouter(prefix="/api/generate", tags=["generate"])


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="Task prompt for the code generator")
    language: str = Field(default="Auto", description="Requested programming language")
    model: Optional[str] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    max_tokens: Optional[int] = None


class GenerateResponse(BaseModel):
    code: str
    language: str
    file_extension: str
    is_syntax_valid: bool
    syntax_error: Optional[str]
    retry_count: int
    model_used: str
    tokens_generated: int
    duration_ms: float
    history_id: Optional[int] = None


@router.post("", response_model=GenerateResponse)
async def generate_code(req: GenerateRequest, db: Session = Depends(get_db)):
    """Generate code with full 3-layer code-only enforcement."""
    try:
        result = await llm_service.generate_code_with_enforcement(
            prompt=req.prompt,
            requested_language=req.language,
            model=req.model,
            temperature=req.temperature,
            top_p=req.top_p,
            max_tokens=req.max_tokens,
        )

        ext = get_file_extension(result["language"])

        # Persist to history
        history_entry = GenerationHistory(
            prompt=req.prompt,
            requested_language=req.language,
            detected_language=result["language"],
            code=result["code"],
            model_used=result["model_used"],
            tokens_generated=result["tokens_generated"],
            duration_ms=result["duration_ms"],
            is_syntax_valid=result["is_syntax_valid"],
            retry_count=result["retry_count"],
        )
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)

        return GenerateResponse(
            code=result["code"],
            language=result["language"],
            file_extension=ext,
            is_syntax_valid=result["is_syntax_valid"],
            syntax_error=result["syntax_error"],
            retry_count=result["retry_count"],
            model_used=result["model_used"],
            tokens_generated=result["tokens_generated"],
            duration_ms=result["duration_ms"],
            history_id=history_entry.id,
        )

    except OllamaNotRunningError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ModelNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LLMRuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.websocket("/ws")
async def generate_websocket(websocket: WebSocket, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time token streaming into Monaco Editor."""
    await websocket.accept()
    try:
        while True:
            data_text = await websocket.receive_text()
            req_data = json.loads(data_text)
            prompt = req_data.get("prompt", "").strip()
            language = req_data.get("language", "Auto")
            model = req_data.get("model")
            temperature = req_data.get("temperature")
            top_p = req_data.get("top_p")
            max_tokens = req_data.get("max_tokens")

            if not prompt:
                await websocket.send_json({"type": "error", "message": "Prompt cannot be empty."})
                continue

            async def on_token(token: str):
                await websocket.send_json({"type": "token", "token": token})

            await websocket.send_json({"type": "status", "message": "Inference starting..."})

            try:
                result = await llm_service.generate_code_with_enforcement(
                    prompt=prompt,
                    requested_language=language,
                    model=model,
                    temperature=temperature,
                    top_p=top_p,
                    max_tokens=max_tokens,
                    on_token_callback=on_token,
                )

                ext = get_file_extension(result["language"])

                # Persist to history
                history_entry = GenerationHistory(
                    prompt=prompt,
                    requested_language=language,
                    detected_language=result["language"],
                    code=result["code"],
                    model_used=result["model_used"],
                    tokens_generated=result["tokens_generated"],
                    duration_ms=result["duration_ms"],
                    is_syntax_valid=result["is_syntax_valid"],
                    retry_count=result["retry_count"],
                )
                db.add(history_entry)
                db.commit()
                db.refresh(history_entry)

                await websocket.send_json({
                    "type": "done",
                    "code": result["code"],
                    "language": result["language"],
                    "file_extension": ext,
                    "is_syntax_valid": result["is_syntax_valid"],
                    "syntax_error": result["syntax_error"],
                    "retry_count": result["retry_count"],
                    "duration_ms": result["duration_ms"],
                    "tokens_generated": result["tokens_generated"],
                    "history_id": history_entry.id,
                })
            except OllamaNotRunningError as e:
                await websocket.send_json({"type": "error", "message": str(e), "code": "OLLAMA_OFFLINE"})
            except ModelNotFoundError as e:
                await websocket.send_json({"type": "error", "message": str(e), "code": "MODEL_NOT_FOUND"})
            except Exception as e:
                await websocket.send_json({"type": "error", "message": str(e), "code": "RUNTIME_ERROR"})

    except WebSocketDisconnect:
        pass


@router.post("/stream")
async def generate_sse_stream(req: GenerateRequest, db: Session = Depends(get_db)):
    """Server-Sent Events streaming endpoint as alternative to WebSockets."""
    async def event_generator() -> AsyncGenerator[str, None]:
        accumulated_tokens = []
        start_time = time.time()
        
        try:
            yield f"data: {json.dumps({'type': 'status', 'message': 'Generating...'})}\n\n"
            
            async for token in llm_service.stream_generate(
                prompt=req.prompt,
                language=req.language,
                model=req.model,
                temperature=req.temperature,
                top_p=req.top_p,
                max_tokens=req.max_tokens,
            ):
                accumulated_tokens.append(token)
                yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"

            raw_text = "".join(accumulated_tokens)
            code, lang, _ = extract_code_block(raw_text, req.language)
            ext = get_file_extension(lang)

            duration = round((time.time() - start_time) * 1000, 2)

            # Persist
            history_entry = GenerationHistory(
                prompt=req.prompt,
                requested_language=req.language,
                detected_language=lang,
                code=code,
                model_used=req.model or settings.default_model,
                tokens_generated=len(accumulated_tokens),
                duration_ms=duration,
                is_syntax_valid=True,
                retry_count=0,
            )
            db.add(history_entry)
            db.commit()

            yield f"data: {json.dumps({'type': 'done', 'code': code, 'language': lang, 'file_extension': ext, 'duration_ms': duration})}\n\n"

        except OllamaNotRunningError as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'code': 'OLLAMA_OFFLINE'})}\n\n"
        except ModelNotFoundError as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'code': 'MODEL_NOT_FOUND'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
