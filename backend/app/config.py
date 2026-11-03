from pathlib import Path
import json
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Literal, Union, List

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    app_name: str = "OfflineCoder"
    debug: bool = False
    
    # Model runtime settings
    runtime_type: Literal["ollama", "llama_cpp"] = "ollama"
    ollama_host: str = "http://localhost:11434"
    llama_cpp_host: str = "http://localhost:8080"
    models_dir: str = str(BASE_DIR.parent / "models")
    default_model: str = "gemma3"
    
    # Generation defaults
    default_temperature: float = 0.1
    default_top_p: float = 0.95
    default_max_tokens: int = 2048
    default_context_length: int = 4096
    default_language: str = "Auto"
    
    # Validation & Post-processing
    max_syntax_retries: int = 2
    
    # Sandbox execution (Python/NodeJS)
    allow_code_execution: bool = False
    sandbox_timeout_seconds: int = 5
    sandbox_memory_limit_mb: int = 256
    
    # Database
    database_url: str = f"sqlite:///{BASE_DIR}/offlinecoder.db"
    
    # Offline strict enforcement
    offline_strict_mode: bool = True
    allowed_hosts: Union[List[str], str] = ["localhost", "127.0.0.1", "0.0.0.0", "backend", "frontend", "ollama"]

    @field_validator("allowed_hosts")
    @classmethod
    def parse_allowed_hosts(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            clean = v.strip()
            if clean.startswith("[") and clean.endswith("]"):
                try:
                    return json.loads(clean)
                except Exception:
                    pass
            return [h.strip() for h in clean.split(",") if h.strip()]
        return v
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

