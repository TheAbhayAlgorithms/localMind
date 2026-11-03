.PHONY: help install dev backend frontend test build download-models doctor clean

help:
	@echo "OfflineCoder Makefile targets:"
	@echo "  make install         Install backend and frontend dependencies"
	@echo "  make dev             Run backend and frontend dev servers concurrently"
	@echo "  make backend         Run FastAPI backend server (http://localhost:8000)"
	@echo "  make frontend        Run Vite frontend server (http://localhost:5173)"
	@echo "  make test            Run backend test suite with pytest"
	@echo "  make build           Build frontend PWA bundle"
	@echo "  make download-models Run one-time model pre-download helper"
	@echo "  make doctor          Run full environment and offline diagnostics"

install:
	cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
	cd frontend && npm install

dev:
	@echo "Starting OfflineCoder (Backend on :8000, Frontend on :5173)..."
	trap 'kill 0' EXIT; \
	(cd backend && .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload) & \
	(cd frontend && npm run dev) & \
	wait

backend:
	cd backend && .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

frontend:
	cd frontend && npm run dev

test:
	cd backend && .venv/bin/pytest -v

build:
	cd frontend && npm run build

download-models:
	bash scripts/download_models.sh

doctor:
	bash scripts/doctor.sh

clean:
	rm -rf backend/.pytest_cache backend/__pycache__ frontend/dist

