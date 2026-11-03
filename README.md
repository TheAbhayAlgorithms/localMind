# 🔒 OfflineCoder

**OfflineCoder** is a local-first, zero-egress web platform where developers type questions or tasks and receive **clean, runnable code only**—with zero conversational prose, zero preambles, and zero post-explanations.

All AI inference is performed 100% locally using Google's open-weights **Gemma** models (`gemma3`, `codegemma`, `gemma:2b`). **Zero internet access is allowed or attempted at runtime.**

---

## ⚡ Key Highlights

- **Three-Layer Code-Only Enforcement**:
  1. *System Prompt*: Strict instructions directing the model to output solely a single fenced code block.
  2. *Post-Processor*: Regex extraction that discards any chatty conversational headers (`"Sure, here is the code..."`) and footers (`"Hope this helps..."`).
  3. *AST Syntax Validator*: Offline AST parsing powered by `tree-sitter` and language parsers; syntax-invalid code automatically retries up to 2 times feeding AST error nodes back to Gemma before displaying.
- **True Offline & Zero Egress**:
  - Outbound requests are blocked at both browser and backend middleware levels.
  - Strict Content-Security-Policy (CSP) headers: `default-src 'self'; connect-src 'self' http://localhost:* ws://localhost:*`.
  - Self-hosted Monaco Editor bundle with local web workers (zero CDN dependency).
  - PWA precaching via `vite-plugin-pwa` so the app loads instantly even with Wi-Fi completely disabled.
  - Prominent **"Offline mode: ON"** live badge with active network-sentinel interception.
- **Local Storage & History**:
  - SQLite database persists generation history and saved snippets offline.
  - Searchable by prompt, language, code, and custom tags.
- **Local Hardware Sizing & Model Manager**:
  - Real-time RAM/VRAM inspection via `psutil`.
  - Smart warnings for low-memory machines (< 8GB RAM).
- **Optional Sandboxed Execution**:
  - Execute Python and JavaScript locally in an isolated subprocess with 5s timeout, CPU/memory resource limits, and network isolation.

---

## 💻 Hardware Requirements

| Model | Quantization | Parameter Size | Minimum System RAM | Recommended System RAM | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **gemma:2b** | Q4_K_M | 2 Billion | 4 GB | 8 GB | Fast, lightweight; ideal for older or 8GB laptops |
| **gemma3** | Q4_K_M | 4 Billion | 8 GB | 16 GB | Default balanced model; excellent code generation |
| **codegemma** | Q4_K_M | 7 Billion | 12 GB | 16+ GB | Specialized for deep programming logic |

---

## 🚀 Quickstart

### 1. Pre-Download Models (Run ONCE while online)

Before disconnecting from the internet, run the pre-download script to pull the Gemma models into your local Ollama instance:

```bash
bash scripts/download_models.sh
```

*(Alternatively, place your pre-downloaded `.gguf` model files directly into `./models`)*.

---

### 2. Run with Make (Local Development)

```bash
# 1. Install dependencies
make install

# 2. Start both backend and frontend concurrently
make dev
```

- Open your browser to: **`http://localhost:5173`**
- Backend API runs on: **`http://localhost:8000`**

---

### 3. Run with Docker Compose (Isolated Network Egress)

```bash
docker compose up --build
```

The Docker Compose configuration assigns all containers to an `internal: true` bridge network, completely disabling the default internet gateway and preventing any container from reaching the public internet.

---

## 🧪 Disconnect Wi-Fi Verification Test

To verify complete offline operation:

1. Start OfflineCoder:
   ```bash
   make dev
   ```
2. **Turn off your Wi-Fi** or disconnect your Ethernet cable.
3. Open `http://localhost:5173` in your browser.
4. Verify:
   - The UI loads immediately from the local PWA service worker cache.
   - The top navbar displays a green **"Offline mode: ON"** shield badge.
   - Select **Python** and type: `binary search in Python`.
   - Click **Generate**.
   - Gemma generates the response locally; the output appears in the Monaco editor with **code only** (no prose).
   - The Tree-Sitter validation badge shows **"Tree-Sitter: Valid Syntax"**.
   - Click **Copy**, **Download**, or **Save Snippet**.

---

## 🔬 Testing

Run the automated backend test suite (unit tests for post-processor and syntax validator, SQLite history tests, and mocked end-to-end streaming tests):

```bash
make test
```

All 15 tests execute and pass in under 0.25 seconds without external network access.

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, security headers & offline checks
│   │   ├── config.py            # Pydantic v2 configuration
│   │   ├── api/                 # Endpoints: generate, models, history, system, run
│   │   ├── services/
│   │   │   ├── llm.py           # Local Ollama client & 3-layer enforcement
│   │   │   ├── postprocess.py   # Regex fenced code block & prose stripper
│   │   │   ├── validate.py      # Tree-sitter AST & syntax validator
│   │   │   └── sandbox.py       # Subprocess execution sandbox
│   │   └── db/                  # SQLite database engine & models
│   ├── tests/                   # Pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # MonacoEditor, PromptBox, HistorySidebar, etc.
│   │   ├── pages/               # Home, ModelManager, SavedSnippets
│   │   ├── store/               # Zustand application state
│   │   └── main.tsx             # Local Monaco worker registration & PWA setup
│   ├── vite.config.ts           # PWA Workbox precaching
│   ├── package.json
│   └── Dockerfile
├── scripts/
│   └── download_models.sh       # One-time online model pre-download helper
├── models/                      # Pre-downloaded GGUF model directory
├── docker-compose.yml           # Isolated internal network configuration
├── Makefile
└── README.md
```

---

## 🛡️ License

MIT. Built for privacy, resilience, and offline productivity.
