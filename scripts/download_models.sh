#!/usr/bin/env bash
set -e

# ==============================================================================
# OfflineCoder - Model Pre-Download Helper
# Run this ONCE while connected to the internet BEFORE taking your machine offline.
# The app itself will run strictly offline with zero external network egress.
# ==============================================================================

echo "========================================================"
echo "OfflineCoder: Pre-downloading Google Gemma Models"
echo "========================================================"

MODELS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/models"
mkdir -p "$MODELS_DIR"

# Check if Ollama CLI is installed
if command -v ollama >/dev/null 2>&1; then
    echo "✅ Found Ollama CLI. Pulling recommended Google Gemma models..."

    echo ""
    echo "1/2: Pulling lightweight Gemma 2B (Ideal for low-RAM laptops <8GB)..."
    ollama pull gemma:2b || echo "⚠️ Could not pull gemma:2b. Continuing..."

    echo ""
    echo "2/2: Pulling Gemma 3 / CodeGemma (Optimized for coding)..."
    ollama pull codegemma || ollama pull gemma3 || echo "⚠️ Could not pull codegemma."

    echo ""
    echo "🎉 Local models successfully pulled into Ollama!"
    echo "Installed models:"
    ollama list
else
    echo "⚠️ Ollama CLI not found in PATH."
    echo "If you are running Ollama in Docker or prefer manual GGUF files:"
    echo "Place quantized .gguf model files into: $MODELS_DIR"
    echo "Example: gemma-2b-it-q4_k_m.gguf or codegemma-7b-it-q4_k_m.gguf"
fi

echo ""
echo "========================================================"
echo "Done! You can now disconnect Wi-Fi / turn off network."
echo "Start the platform using: make dev   or   docker compose up"
echo "========================================================"
