import { create } from 'zustand';

export interface ModelItem {
  name: string;
  source: string;
  size_gb: number;
  format: string;
  family: string;
  parameter_size: string;
  quantization_level: string;
  is_active: boolean;
  ram_required_estimate_gb: number;
  has_ram_warning: boolean;
  warning_message?: string;
}

export interface HistoryEntry {
  id: number;
  prompt: string;
  requested_language: string;
  detected_language: string;
  code: string;
  model_used: string;
  tokens_generated: number;
  duration_ms: number;
  is_syntax_valid: boolean;
  retry_count: number;
  created_at: string;
}

export interface SnippetEntry {
  id: number;
  title: string;
  prompt?: string;
  language: string;
  code: string;
  tags?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  temperature: number;
  top_p: number;
  max_tokens: number;
  context_length: number;
  default_language: string;
  theme: string;
  allow_code_execution: boolean;
}

async function parseResponseSafely<T = any>(res: Response): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const text = await res.text();
    if (!text) {
      return { ok: false, error: `Empty response (HTTP ${res.status})` };
    }
    try {
      const data = JSON.parse(text);
      if (res.ok) {
        return { ok: true, data };
      } else {
        return { ok: false, error: data.detail || data.message || `HTTP error ${res.status}` };
      }
    } catch {
      if (text.includes('<!doctype') || text.includes('<html')) {
        return {
          ok: false,
          error: `Backend error (${res.status}): Server returned HTML instead of JSON. Ensure OfflineCoder backend is running on http://127.0.0.1:8000 without port conflicts.`,
        };
      }
      return { ok: false, error: text.slice(0, 150) || `HTTP error ${res.status}` };
    }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

export interface RunResult {
  status: string;
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
}

interface AppState {
  // Navigation & views
  activeTab: 'editor' | 'models' | 'snippets';
  setActiveTab: (tab: 'editor' | 'models' | 'snippets') => void;

  // Language & Prompt
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  prompt: string;
  setPrompt: (p: string) => void;

  // Generation & Output State
  code: string;
  setCode: (c: string) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  generationStatus: string;
  setGenerationStatus: (s: string) => void;
  errorMessage: string | null;
  errorActionLabel: string | null;
  setErrorMessage: (msg: string | null, actionLabel?: string | null) => void;
  detectedLanguage: string;
  fileExtension: string;
  isSyntaxValid: boolean;
  syntaxError: string | null;
  retryCount: number;
  durationMs: number;
  tokensGenerated: number;
  abortController: AbortController | null;
  setAbortController: (ac: AbortController | null) => void;

  // Models & System
  activeModel: string;
  models: ModelItem[];
  systemRamTotal: number;
  systemRamAvailable: number;
  systemRamPercent: number;
  cpuPercent: number;
  runtimeHealth: { status: string; message?: string } | null;

  // Offline Security Badge
  isOfflineSafe: boolean;
  securityViolation: string | null;
  recordViolation: (targetUrl: string) => void;

  // History & Snippets
  history: HistoryEntry[];
  historySearch: string;
  setHistorySearch: (q: string) => void;
  snippets: SnippetEntry[];
  snippetSearch: string;
  setSnippetSearch: (q: string) => void;

  // Settings
  settings: SystemSettings;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // Code Execution Runner
  isRunningCode: boolean;
  runResult: RunResult | null;
  isConsoleOpen: boolean;
  setIsConsoleOpen: (open: boolean) => void;

  // Actions
  fetchInitialData: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchSnippets: () => Promise<void>;
  fetchModels: () => Promise<void>;
  switchModel: (modelName: string) => Promise<void>;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  generateCodeStream: () => Promise<void>;
  stopGeneration: () => void;
  saveCurrentSnippet: (title: string, tags?: string) => Promise<void>;
  deleteHistoryItem: (id: number) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteSnippet: (id: number) => Promise<void>;
  runCode: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'editor',
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedLanguage: 'Auto',
  setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
  prompt: '',
  setPrompt: (prompt) => set({ prompt }),

  code: '',
  setCode: (code) => set({ code }),
  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  generationStatus: '',
  setGenerationStatus: (generationStatus) => set({ generationStatus }),
  errorMessage: null,
  errorActionLabel: null,
  setErrorMessage: (errorMessage, errorActionLabel = null) => set({ errorMessage, errorActionLabel }),
  detectedLanguage: 'python',
  fileExtension: 'py',
  isSyntaxValid: true,
  syntaxError: null,
  retryCount: 0,
  durationMs: 0,
  tokensGenerated: 0,
  abortController: null,
  setAbortController: (abortController) => set({ abortController }),

  activeModel: 'gemma3',
  models: [],
  systemRamTotal: 0,
  systemRamAvailable: 0,
  systemRamPercent: 0,
  cpuPercent: 0,
  runtimeHealth: null,

  isOfflineSafe: true,
  securityViolation: null,
  recordViolation: (targetUrl: string) => {
    set({
      isOfflineSafe: false,
      securityViolation: `Blocked external outbound connection to: ${targetUrl}`
    });
  },

  history: [],
  historySearch: '',
  setHistorySearch: (historySearch) => {
    set({ historySearch });
    get().fetchHistory();
  },
  snippets: [],
  snippetSearch: '',
  setSnippetSearch: (snippetSearch) => {
    set({ snippetSearch });
    get().fetchSnippets();
  },

  settings: {
    temperature: 0.1,
    top_p: 0.95,
    max_tokens: 2048,
    context_length: 4096,
    default_language: 'Auto',
    theme: 'dark',
    allow_code_execution: false,
  },
  isSettingsOpen: false,
  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),

  isRunningCode: false,
  runResult: null,
  isConsoleOpen: false,
  setIsConsoleOpen: (isConsoleOpen) => set({ isConsoleOpen }),

  fetchInitialData: async () => {
    try {
      // Fetch system settings
      const setRes = await fetch('/api/system/settings');
      const parsed = await parseResponseSafely<SystemSettings>(setRes);
      if (parsed.ok && parsed.data) {
        set({ settings: parsed.data, selectedLanguage: parsed.data.default_language || 'Auto' });
      }
    } catch (_) {}

    await get().fetchModels();
    await get().fetchHistory();
    await get().fetchSnippets();

    try {
      const resRes = await fetch('/api/system/resources');
      const parsed = await parseResponseSafely<any>(resRes);
      if (parsed.ok && parsed.data) {
        set({
          cpuPercent: parsed.data.cpu_percent,
          runtimeHealth: parsed.data.runtime_health,
        });
      }
    } catch (_) {}
  },

  fetchModels: async () => {
    try {
      const res = await fetch('/api/models');
      const parsed = await parseResponseSafely<any>(res);
      if (parsed.ok && parsed.data) {
        set({
          activeModel: parsed.data.active_model,
          models: parsed.data.models,
          systemRamTotal: parsed.data.system_ram_total_gb,
          systemRamAvailable: parsed.data.system_ram_available_gb,
          systemRamPercent: parsed.data.system_ram_percent_used,
        });
      }
    } catch (_) {}
  },

  switchModel: async (modelName: string) => {
    try {
      const res = await fetch('/api/models/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName }),
      });
      if (res.ok) {
        set({ activeModel: modelName });
        await get().fetchModels();
      }
    } catch (_) {}
  },

  fetchHistory: async () => {
    try {
      const q = get().historySearch.trim();
      const url = q ? `/api/history?q=${encodeURIComponent(q)}` : '/api/history';
      const res = await fetch(url);
      const parsed = await parseResponseSafely<HistoryEntry[]>(res);
      if (parsed.ok && parsed.data && Array.isArray(parsed.data)) {
        const items = parsed.data;
        set({ history: items });
        if (!get().code && items.length > 0) {
          const latest = items[0];
          set({
            code: latest.code,
            prompt: latest.prompt,
            detectedLanguage: latest.detected_language || 'python',
            isSyntaxValid: latest.is_syntax_valid,
            tokensGenerated: latest.tokens_generated,
            durationMs: latest.duration_ms,
          });
        }
      }
    } catch (_) {}
  },

  deleteHistoryItem: async (id: number) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      await get().fetchHistory();
    } catch (_) {}
  },

  clearHistory: async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      set({ history: [] });
    } catch (_) {}
  },

  fetchSnippets: async () => {
    try {
      const q = get().snippetSearch.trim();
      const url = q ? `/api/snippets?q=${encodeURIComponent(q)}` : '/api/snippets';
      const res = await fetch(url);
      const parsed = await parseResponseSafely<SnippetEntry[]>(res);
      if (parsed.ok && parsed.data && Array.isArray(parsed.data)) {
        set({ snippets: parsed.data });
      }
    } catch (_) {}
  },

  saveCurrentSnippet: async (title: string, tags?: string) => {
    const { code, detectedLanguage, prompt } = get();
    if (!code) return;
    try {
      const res = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          prompt,
          language: detectedLanguage,
          code,
          tags: tags || '',
        }),
      });
      if (res.ok) {
        await get().fetchSnippets();
      }
    } catch (_) {}
  },

  deleteSnippet: async (id: number) => {
    try {
      await fetch(`/api/snippets/${id}`, { method: 'DELETE' });
      await get().fetchSnippets();
    } catch (_) {}
  },

  updateSettings: async (newSettings: Partial<SystemSettings>) => {
    try {
      const res = await fetch('/api/system/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        set((state) => ({ settings: { ...state.settings, ...newSettings } }));
      }
    } catch (_) {}
  },

  generateCodeStream: async () => {
    const { prompt, selectedLanguage, activeModel, settings } = get();
    if (!prompt.trim() || get().isGenerating) return;

    const controller = new AbortController();
    set({
      isGenerating: true,
      generationStatus: 'Connecting to local Gemma...',
      errorMessage: null,
      errorActionLabel: null,
      code: '',
      isSyntaxValid: true,
      syntaxError: null,
      retryCount: 0,
      abortController: controller,
      isConsoleOpen: false,
      runResult: null,
    });

    let wsHandled = false;

    try {
      // Connect to WebSocket on localhost:8000/api/generate/ws
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/api/generate/ws`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        set({ generationStatus: 'Synthesizing clean code with local Gemma...' });
        ws.send(JSON.stringify({
          prompt,
          language: selectedLanguage,
          model: activeModel,
          temperature: settings.temperature,
          top_p: settings.top_p,
          max_tokens: settings.max_tokens,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'token') {
            set((state) => ({ code: state.code + msg.token }));
          } else if (msg.type === 'status') {
            set({ generationStatus: msg.message });
          } else if (msg.type === 'done') {
            wsHandled = true;
            set({
              code: msg.code,
              detectedLanguage: msg.language,
              fileExtension: msg.file_extension,
              isSyntaxValid: msg.is_syntax_valid,
              syntaxError: msg.syntax_error,
              retryCount: msg.retry_count,
              durationMs: msg.duration_ms,
              tokensGenerated: msg.tokens_generated,
              isGenerating: false,
              generationStatus: 'Done',
              errorMessage: null,
            });
            get().fetchHistory();
            ws.close();
          } else if (msg.type === 'error') {
            wsHandled = true;
            const action = msg.code === 'MODEL_NOT_FOUND' ? 'Open Models Tab' : null;
            set({
              isGenerating: false,
              errorMessage: msg.message,
              errorActionLabel: action,
              generationStatus: `Error: ${msg.message}`,
            });
            ws.close();
          }
        } catch (_) {}
      };

      ws.onerror = async () => {
        if (wsHandled) return;
        wsHandled = true;
        set({ generationStatus: 'WebSocket unavailable, falling back to HTTP stream...' });
        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              language: selectedLanguage,
              model: activeModel,
              temperature: settings.temperature,
              top_p: settings.top_p,
              max_tokens: settings.max_tokens,
            }),
            signal: controller.signal,
          });

          const parsed = await parseResponseSafely<any>(res);
          if (!parsed.ok || !parsed.data) {
            throw new Error(parsed.error || 'Generation failed');
          }

          const data = parsed.data;
          set({
            code: data.code,
            detectedLanguage: data.language,
            fileExtension: data.file_extension,
            isSyntaxValid: data.is_syntax_valid,
            syntaxError: data.syntax_error,
            retryCount: data.retry_count,
            durationMs: data.duration_ms,
            tokensGenerated: data.tokens_generated,
            isGenerating: false,
            generationStatus: 'Done',
            errorMessage: null,
          });
          get().fetchHistory();
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            const action = err.message.includes('not installed') ? 'Open Models Tab' : null;
            set({
              isGenerating: false,
              errorMessage: err.message,
              errorActionLabel: action,
              generationStatus: `Error: ${err.message}`,
            });
          }
        }
      };

      ws.onclose = () => {
        if (!wsHandled && get().isGenerating) {
          // If connection closed without tokens/done/error, trigger fallback or end gracefully
          setTimeout(() => {
            if (!wsHandled && get().isGenerating) {
              set({ isGenerating: false });
            }
          }, 300);
        }
      };

    } catch (e: any) {
      set({
        isGenerating: false,
        errorMessage: e.message,
        generationStatus: `Error: ${e.message}`,
      });
    }
  },

  stopGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({
      isGenerating: false,
      generationStatus: 'Stopped by user',
      abortController: null,
    });
  },

  runCode: async () => {
    const { code, detectedLanguage, settings } = get();
    if (!code.trim()) return;

    set({ isRunningCode: true, isConsoleOpen: true });
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: detectedLanguage,
          timeout_seconds: 5,
        }),
      });

      const parsed = await parseResponseSafely<any>(res);
      if (parsed.ok && parsed.data) {
        set({ runResult: parsed.data, isRunningCode: false });
      } else {
        set({
          runResult: {
            status: 'error',
            stdout: '',
            stderr: parsed.error || 'Execution request failed',
            exit_code: -1,
            duration_ms: 0,
          },
          isRunningCode: false,
        });
      }
    } catch (err: any) {
      set({
        runResult: {
          status: 'error',
          stdout: '',
          stderr: err.message,
          exit_code: -1,
          duration_ms: 0,
        },
        isRunningCode: false,
      });
    }
  },
}));
