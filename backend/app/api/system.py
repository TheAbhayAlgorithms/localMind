import psutil
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import UserSetting
from app.services.llm import llm_service
from app.config import settings

router = APIRouter(prefix="/api/system", tags=["system"])

class SettingsUpdate(BaseModel):
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    max_tokens: Optional[int] = None
    context_length: Optional[int] = None
    default_language: Optional[str] = None
    theme: Optional[str] = "dark"
    allow_code_execution: Optional[bool] = None

@router.get("/resources")
async def get_system_resources():
    """Real-time system resource stats and local offline status."""
    vm = psutil.virtual_memory()
    cpu_percent = psutil.cpu_percent(interval=None)
    health = await llm_service.check_health()

    return {
        "offline_mode_active": True,
        "runtime_type": settings.runtime_type,
        "runtime_health": health,
        "ram": {
            "total_gb": round(vm.total / (1024 ** 3), 2),
            "available_gb": round(vm.available / (1024 ** 3), 2),
            "used_gb": round(vm.used / (1024 ** 3), 2),
            "percent": vm.percent,
        },
        "cpu_percent": cpu_percent,
        "allowed_hosts": settings.allowed_hosts,
    }

@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    """Retrieve saved user preferences or system defaults."""
    db_settings = db.query(UserSetting).all()
    user_dict = {item.key: item.value for item in db_settings}

    return {
        "temperature": float(user_dict.get("temperature", settings.default_temperature)),
        "top_p": float(user_dict.get("top_p", settings.default_top_p)),
        "max_tokens": int(user_dict.get("max_tokens", settings.default_max_tokens)),
        "context_length": int(user_dict.get("context_length", settings.default_context_length)),
        "default_language": user_dict.get("default_language", settings.default_language),
        "theme": user_dict.get("theme", "dark"),
        "allow_code_execution": user_dict.get("allow_code_execution", str(settings.allow_code_execution)).lower() == "true",
    }

@router.post("/settings")
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    """Update user preferences."""
    updates = {}
    if payload.temperature is not None:
        updates["temperature"] = str(payload.temperature)
        settings.default_temperature = payload.temperature
    if payload.top_p is not None:
        updates["top_p"] = str(payload.top_p)
        settings.default_top_p = payload.top_p
    if payload.max_tokens is not None:
        updates["max_tokens"] = str(payload.max_tokens)
        settings.default_max_tokens = payload.max_tokens
    if payload.context_length is not None:
        updates["context_length"] = str(payload.context_length)
        settings.default_context_length = payload.context_length
    if payload.default_language is not None:
        updates["default_language"] = payload.default_language
        settings.default_language = payload.default_language
    if payload.theme is not None:
        updates["theme"] = payload.theme
    if payload.allow_code_execution is not None:
        updates["allow_code_execution"] = str(payload.allow_code_execution)
        settings.allow_code_execution = payload.allow_code_execution

    for k, v in updates.items():
        existing = db.query(UserSetting).filter(UserSetting.key == k).first()
        if existing:
            existing.value = v
        else:
            db.add(UserSetting(key=k, value=v))
    db.commit()

    return {"status": "ok", "settings": updates}

