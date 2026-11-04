#!/usr/bin/env bash

# Navigate to project directory
cd "$(dirname "$0")"

echo "================================================="
echo "       Starting OfflineCoder (100% Offline AI)   "
echo "================================================="

# 1. Start Ollama in the background if not already running
if ! curl -s -m 1 http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "🧠 Starting local Ollama engine..."
    ollama serve >/dev/null 2>&1 &
    sleep 2
fi

# Wait for Ollama to be ready
while ! curl -s -m 1 http://localhost:11434/api/tags >/dev/null 2>&1; do
    sleep 0.5
done
echo "✅ Ollama is ready (port 11434)."

# 2. Check and start backend
echo "🚀 Starting backend server on port 8000..."

# Automatically open the browser after server boots
(sleep 1.5 && open "http://127.0.0.1:8000") &

echo ""
echo "================================================="
echo "  OfflineCoder is LIVE at: http://127.0.0.1:8000  "
echo "  Press Ctrl+C here to stop, or run ./stop.sh    "
echo "================================================="
echo ""

# Run backend (Pressing Ctrl+C here will stop it)
trap './stop.sh; exit 0' INT TERM
cd backend && .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

