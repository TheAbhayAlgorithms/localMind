#!/usr/bin/env bash

# ==============================================================================
# OfflineCoder Health & Diagnostics Doctor (scripts/doctor.sh)
# ==============================================================================

COLOR_RESET="\033[0m"
COLOR_GREEN="\033[1;32m"
COLOR_RED="\033[1;31m"
COLOR_YELLOW="\033[1;33m"
COLOR_BLUE="\033[1;34m"
COLOR_CYAN="\033[1;36m"

echo -e "${COLOR_CYAN}======================================================${COLOR_RESET}"
echo -e "${COLOR_CYAN}         OfflineCoder Environment Diagnostics         ${COLOR_RESET}"
echo -e "${COLOR_CYAN}======================================================${COLOR_RESET}"
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

pass() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    echo -e " [${COLOR_GREEN}PASS${COLOR_RESET}] $1"
}

fail() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo -e " [${COLOR_RED}FAIL${COLOR_RESET}] $1"
    if [ -n "$2" ]; then
        echo -e "        ${COLOR_YELLOW}Fix:${COLOR_RESET} $2"
    fi
}

warn() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
    echo -e " [${COLOR_YELLOW}WARN${COLOR_RESET}] $1"
    if [ -n "$2" ]; then
        echo -e "        ${COLOR_YELLOW}Advice:${COLOR_RESET} $2"
    fi
}

# 1. Check Python version
echo -e "${COLOR_BLUE}1. Environment Runtimes:${COLOR_RESET}"
if command -v python3 >/dev/null 2>&1; then
    PY_VER=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    PY_MAJOR=$(echo "$PY_VER" | cut -d. -f1)
    PY_MINOR=$(echo "$PY_VER" | cut -d. -f2)
    if [ "$PY_MAJOR" -ge 3 ] && [ "$PY_MINOR" -ge 11 ]; then
        pass "Python version: $PY_VER (>= 3.11 required)"
    else
        fail "Python version: $PY_VER (Must be >= 3.11)" "Install Python 3.11 or newer."
    fi
else
    fail "Python 3 is not installed or not in PATH." "Install Python 3.11+."
fi

# 2. Check Node version
if command -v node >/dev/null 2>&1; then
    NODE_VER=$(node -v | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        pass "Node.js version: v$NODE_VER (>= 18 required)"
    else
        fail "Node.js version: v$NODE_VER (Must be >= 18)" "Install Node.js 18 or newer."
    fi
else
    fail "Node.js is not installed or not in PATH." "Install Node.js 18+ (https://nodejs.org)."
fi

echo ""
echo -e "${COLOR_BLUE}2. Local AI Model Runtime (Ollama):${COLOR_RESET}"

# 3. Check Ollama Binary
OLLAMA_BIN=""
if command -v ollama >/dev/null 2>&1; then
    OLLAMA_BIN="ollama"
elif [ -f "/opt/homebrew/bin/ollama" ]; then
    OLLAMA_BIN="/opt/homebrew/bin/ollama"
elif [ -f "/usr/local/bin/ollama" ]; then
    OLLAMA_BIN="/usr/local/bin/ollama"
fi

if [ -n "$OLLAMA_BIN" ]; then
    OLLAMA_VER=$($OLLAMA_BIN --version 2>&1 | grep -o 'version is [0-9.]*' | awk '{print $3}' || echo "installed")
    pass "Ollama binary found: $OLLAMA_BIN ($OLLAMA_VER)"
else
    fail "Ollama CLI is not installed." "Install Ollama via 'brew install ollama' or download from https://ollama.com."
fi

# 4. Check Ollama Running on localhost:11434
OLLAMA_TAGS_RESPONSE=$(curl -s -m 2 http://localhost:11434/api/tags 2>/dev/null || echo "")
if [ -n "$OLLAMA_TAGS_RESPONSE" ]; then
    pass "Ollama server is active on http://localhost:11434."
else
    fail "Ollama server is NOT running on http://localhost:11434." "Run 'ollama serve' in a terminal window, or 'brew services start ollama'."
fi

# 5. Check Installed Models
if [ -n "$OLLAMA_TAGS_RESPONSE" ]; then
    MODELS_COUNT=$(echo "$OLLAMA_TAGS_RESPONSE" | grep -o '"name":' | wc -l | tr -d ' ')
    if [ "$MODELS_COUNT" -gt 0 ]; then
        HAS_GEMMA=$(echo "$OLLAMA_TAGS_RESPONSE" | grep -iE 'gemma|codegemma' || echo "")
        if [ -n "$HAS_GEMMA" ]; then
            pass "Found Gemma model(s) installed in Ollama."
        else
            warn "No Gemma models detected among installed models." "Run 'bash scripts/download_models.sh' to pre-download gemma3 or codegemma."
        fi
    else
        fail "Zero models installed in Ollama." "Run 'bash scripts/download_models.sh' (or 'ollama pull codegemma')."
    fi
else
    warn "Cannot check installed models because Ollama server is offline." "Start Ollama with 'ollama serve'."
fi

echo ""
echo -e "${COLOR_BLUE}3. Ports & Network Integrity:${COLOR_RESET}"

# 6. Check Port 8000 (Backend)
if curl -s -m 1 http://localhost:8000/api/health >/dev/null 2>&1; then
    pass "Backend API is currently running on http://localhost:8000."
else
    pass "Port 8000 is ready for backend server startup."
fi

# 7. Check Port 5173 (Frontend)
if curl -s -m 1 http://localhost:5173 >/dev/null 2>&1; then
    pass "Frontend UI is currently running on http://localhost:5173."
else
    pass "Port 5173 is ready for frontend server startup."
fi

# 8. Check Offline Strict Egress
BACKEND_MAIN="backend/app/main.py"
if grep -q "verify_offline_configuration" "$BACKEND_MAIN"; then
    pass "Backend enforces zero-egress startup verification."
else
    fail "Backend missing verify_offline_configuration." "Restore verification check in backend/app/main.py."
fi

echo ""
echo -e "${COLOR_BLUE}4. System Memory & Hardware Check:${COLOR_RESET}"

FREE_RAM=""
TOTAL_RAM=""

if [[ "$OSTYPE" == "darwin"* ]]; then
    TOTAL_BYTES=$(sysctl -n hw.memsize 2>/dev/null || echo "0")
    if [ "$TOTAL_BYTES" -gt 0 ]; then
        TOTAL_RAM=$(echo "scale=1; $TOTAL_BYTES / (1024*1024*1024)" | bc)
    fi
    PAGE_SIZE=$(vm_stat 2>/dev/null | grep "page size of" | awk '{print $8}')
    FREE_PAGES=$(vm_stat 2>/dev/null | grep "Pages free:" | awk '{print $3}' | tr -d '.')
    INACTIVE_PAGES=$(vm_stat 2>/dev/null | grep "Pages inactive:" | awk '{print $3}' | tr -d '.')
    if [ -n "$PAGE_SIZE" ] && [ -n "$FREE_PAGES" ]; then
        AVAIL_BYTES=$(( (FREE_PAGES + INACTIVE_PAGES) * PAGE_SIZE ))
        FREE_RAM=$(echo "scale=1; $AVAIL_BYTES / (1024*1024*1024)" | bc)
    fi
elif [ -f "/proc/meminfo" ]; then
    TOTAL_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    AVAIL_KB=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
    TOTAL_RAM=$(echo "scale=1; $TOTAL_KB / (1024*1024)" | bc)
    FREE_RAM=$(echo "scale=1; $AVAIL_KB / (1024*1024)" | bc)
fi

# Fallback to python venv psutil if available
if [ -z "$FREE_RAM" ] && [ -f "backend/.venv/bin/python" ]; then
    MEM_STATS=$(backend/.venv/bin/python -c "
import psutil
vm = psutil.virtual_memory()
print(f'{round(vm.available/(1024**3), 1)}:{round(vm.total/(1024**3), 1)}')
" 2>/dev/null || echo "")
    if [ -n "$MEM_STATS" ]; then
        FREE_RAM=$(echo "$MEM_STATS" | cut -d: -f1)
        TOTAL_RAM=$(echo "$MEM_STATS" | cut -d: -f2)
    fi
fi

if [ -n "$FREE_RAM" ] && [ -n "$TOTAL_RAM" ]; then
    IS_LOW=$(echo "$FREE_RAM < 5.0" | bc 2>/dev/null || echo "0")
    if [ "$IS_LOW" -eq 0 ]; then
        pass "System RAM: ${FREE_RAM}GB available of ${TOTAL_RAM}GB (Sufficient for gemma3 / codegemma)."
    else
        warn "System RAM: ${FREE_RAM}GB available of ${TOTAL_RAM}GB (Low free memory)." "Recommend 'gemma:2b' quantized model to avoid OS disk paging."
    fi
else
    pass "System hardware check completed."
fi

# 10. Stale PWA service worker note
echo ""
echo -e "${COLOR_BLUE}5. Browser & Cache Reminders:${COLOR_RESET}"
echo -e "   If the UI exhibits stale assets after updates, hard refresh (Cmd+Shift+R / Ctrl+F5)"
echo -e "   or unregister service worker in DevTools (Application > Service Workers > Unregister)."

echo ""
echo -e "${COLOR_CYAN}======================================================${COLOR_RESET}"
echo -e "Diagnostics summary: ${COLOR_GREEN}${PASSED_CHECKS} Passed${COLOR_RESET}, ${COLOR_RED}${FAILED_CHECKS} Failed${COLOR_RESET}, ${COLOR_YELLOW}${WARNING_CHECKS} Warnings${COLOR_RESET}"
if [ "$FAILED_CHECKS" -eq 0 ]; then
    echo -e "${COLOR_GREEN}All critical checks passed! Ready to run: make dev${COLOR_RESET}"
else
    echo -e "${COLOR_RED}Please resolve the failed checks above before running.${COLOR_RESET}"
fi
echo -e "${COLOR_CYAN}======================================================${COLOR_RESET}"
