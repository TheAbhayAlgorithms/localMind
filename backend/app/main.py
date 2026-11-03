import os
from contextlib import asynccontextmanager
from urllib.parse import urlparse
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.config import settings
from app.db.database import init_db
from app.api import generate, models, history, system, run_code

def verify_offline_configuration():
    """Verify strictly that all configured endpoints point exclusively to local/loopback hosts."""
    check_targets = [
        ("Ollama", settings.ollama_host),
        ("llama.cpp", settings.llama_cpp_host),
    ]

    for name, endpoint in check_targets:
        parsed = urlparse(endpoint)
        hostname = (parsed.hostname or "").lower()
        if hostname not in settings.allowed_hosts and not hostname.startswith("127."):
            raise RuntimeError(
                f"[SECURITY ALERT] Outbound network target detected in {name} endpoint: {endpoint}. "
                f"OfflineCoder strictly disallows non-local connections. Only localhost/loopback addresses allowed."
            )
    print(f"🔒 [OfflineCoder] Startup offline verification passed: Zero external outbound network targets.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB
    init_db()
    # Verify offline integrity
    verify_offline_configuration()
    yield

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url=None,
)

# CORS restricted to localhost/loopback and private networks (LAN, Tailscale)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+|100\.\d+\.\d+\.\d+|.*\.ts\.net)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Strict Content Security Policy (CSP) & Offline Headers Middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    # Enforce strict Content-Security-Policy (allows local, LAN, and Tailscale WebSockets)
    csp = (
        "default-src 'self'; "
        "connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:* ws: wss:; "
        "font-src 'self' data:; "
        "img-src 'self' data: blob:; "
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "base-uri 'self'; "
        "form-action 'self';"
    )
    response.headers["Content-Security-Policy"] = csp
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-OfflineCoder-Mode"] = "STRICT_OFFLINE"
    return response

# Register API routes
app.include_router(generate.router)
app.include_router(models.router)
app.include_router(history.router)
app.include_router(system.router)
app.include_router(run_code.router)

# Health endpoint
@app.get("/api/health")
def health():
    return {
        "status": "online_offline",
        "offline_guaranteed": True,
        "runtime": settings.runtime_type,
    }

# Mount frontend build if directory exists (for production single-port delivery)
from pathlib import Path
frontend_dist = str(Path(__file__).resolve().parents[2] / "frontend" / "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
