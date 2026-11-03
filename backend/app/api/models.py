import psutil
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.llm import llm_service
from app.config import settings

router = APIRouter(prefix="/api/models", tags=["models"])

class SwitchModelRequest(BaseModel):
    model: str

class ModelInfo(BaseModel):
    name: str
    source: str
    size_gb: float
    format: str
    family: str
    parameter_size: str
    quantization_level: str
    is_active: bool
    ram_required_estimate_gb: float
    has_ram_warning: bool
    warning_message: Optional[str] = None

class ModelsResponse(BaseModel):
    active_model: str
    models: List[ModelInfo]
    system_ram_total_gb: float
    system_ram_available_gb: float
    system_ram_percent_used: float

@router.get("", response_model=ModelsResponse)
async def get_models():
    """List all installed local models with RAM requirements and low-memory warnings."""
    vm = psutil.virtual_memory()
    total_ram_gb = round(vm.total / (1024 ** 3), 2)
    avail_ram_gb = round(vm.available / (1024 ** 3), 2)
    percent_used = vm.percent

    installed = await llm_service.list_local_models()
    
    # If no models found in Ollama or ./models, add placeholders for standard Gemma models
    if not installed:
        default_candidates = [
            {"name": "gemma3", "source": "ollama", "size_gb": 3.3, "format": "gguf", "family": "gemma", "parameter_size": "4B", "quantization_level": "Q4_K_M"},
            {"name": "codegemma", "source": "ollama", "size_gb": 5.0, "format": "gguf", "family": "codegemma", "parameter_size": "7B", "quantization_level": "Q4_K_M"},
            {"name": "gemma:2b", "source": "ollama", "size_gb": 1.7, "format": "gguf", "family": "gemma", "parameter_size": "2B", "quantization_level": "Q4_K_M"},
        ]
        installed = default_candidates

    model_infos: List[ModelInfo] = []
    active = settings.default_model

    for item in installed:
        name = item["name"]
        size_gb = item.get("size_gb", 3.0)
        # Rule of thumb: RAM needed is size * 1.25 for context buffer
        ram_needed = round(max(size_gb * 1.25, 1.5), 1)
        has_warning = ram_needed > avail_ram_gb
        warning_msg = None
        if has_warning:
            warning_msg = (
                f"Warning: Model requires ~{ram_needed}GB RAM, but only {avail_ram_gb}GB is free. "
                f"Performance may be slow or cause swapping."
            )

        model_infos.append(ModelInfo(
            name=name,
            source=item.get("source", "ollama"),
            size_gb=size_gb,
            format=item.get("format", "gguf"),
            family=item.get("family", "gemma"),
            parameter_size=item.get("parameter_size", ""),
            quantization_level=item.get("quantization_level", "Q4_K_M"),
            is_active=(name == active),
            ram_required_estimate_gb=ram_needed,
            has_ram_warning=has_warning,
            warning_message=warning_msg,
        ))

    return ModelsResponse(
        active_model=active,
        models=model_infos,
        system_ram_total_gb=total_ram_gb,
        system_ram_available_gb=avail_ram_gb,
        system_ram_percent_used=percent_used,
    )

@router.post("/switch")
async def switch_model(req: SwitchModelRequest):
    """Switch the current active local model."""
    settings.default_model = req.model.strip()
    return {"status": "ok", "active_model": settings.default_model}
