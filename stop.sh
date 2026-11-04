#!/usr/bin/env bash

# Navigate to project directory
cd "$(dirname "$0")"

echo "🛑 Stopping OfflineCoder and Ollama..."

# Kill backend processes on port 8000
lsof -ti :8000 | xargs kill -9 2>/dev/null || true
pkill -9 -f "uvicorn app.main:app" 2>/dev/null || true

# Kill frontend dev process on port 5173 if running
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

# Kill Ollama on port 11434 to release all RAM/VRAM
lsof -ti :11434 | xargs kill -9 2>/dev/null || true
pkill -9 -f "ollama serve" 2>/dev/null || true
pkill -9 -f "llama-server" 2>/dev/null || true

sleep 0.5

echo "✅ All OfflineCoder processes completely terminated."
echo "✅ All RAM and GPU VRAM have been freed."

