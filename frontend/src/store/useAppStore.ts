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

  // Code Output & Streaming
  code: string;
  setCode: (c: string) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  generationStatus: string;
  setGenerationStatus: (s: string) => void;
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
      if (setRes.ok) {
        const data = await setRes.json();
        set({ settings: data, selectedLanguage: data.default_language || 'Auto' });
      }
    } catch (_) {}

    await get().fetchModels();
    await get().fetchHistory();
    await get().fetchSnippets();

    try {
      const resRes = await fetch('/api/system/resources');
      if (resRes.ok) {
        const data = await resRes.json();
        set({
          cpuPercent: data.cpu_percent,
          runtimeHealth: data.runtime_health,
        });
      }
    } catch (_) {}
  },

  fetchModels: async () => {
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data = await res.json();
        set({
          activeModel: data.active_model,
          models: data.models,
          systemRamTotal: data.system_ram_total_gb,
          systemRamAvailable: data.system_ram_available_gb,
          systemRamPercent: data.system_ram_percent_used,
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
      if (res.ok) {
        const items = await res.json();
        set({ history: items });
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
      if (res.ok) {
        const items = await res.json();
        set({ snippets: items });
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
      code: '',
      isSyntaxValid: true,
      syntaxError: null,
      retryCount: 0,
      abortController: controller,
      isConsoleOpen: false,
      runResult: null,
    });

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
            });
            get().fetchHistory();
            ws.close();
          } else if (msg.type === 'error') {
            set({
              isGenerating: false,
              generationStatus: `Error: ${msg.message}`,
              code: `// OfflineCoder Generation Error\n// ${msg.message}\n// Ensure local Ollama is running: ollama serve`,
            });
            ws.close();
          }
        } catch (_) {}
      };

      ws.onerror = async () => {
        // Fallback to HTTP POST if WebSocket connection fails
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

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Generation failed');
          }

          const data = await res.json();
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
          });
          get().fetchHistory();
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            set({
              isGenerating: false,
              generationStatus: `Error: ${err.message}`,
              code: `// OfflineCoder Error: ${err.message}`,
            });
          }
        }
      };

      ws.onclose = () => {
        if (get().isGenerating) {
          set({ isGenerating: false });
        }
      };

    } catch (e: any) {
      set({
        isGenerating: false,
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

      if (res.ok) {
        const data = await res.json();
        set({ runResult: data, isRunningCode: false });
      } else {
        const err = await res.json();
        set({
          runResult: {
            status: 'error',
            stdout: '',
            stderr: err.detail || 'Execution request failed',
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
