import React, { useState, useEffect } from 'react';
import { X, Sliders, Terminal, Check, ChevronDown } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useAppStore((state) => state.isSettingsOpen);
  const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  // Synchronize form whenever settings or modal visibility changes
  useEffect(() => {
    if (isSettingsOpen) {
      setForm(settings);
    }
  }, [isSettingsOpen, settings]);

  if (!isSettingsOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(form);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsSettingsOpen(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-black/[0.08] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-[#1D1D1F] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1D1D1F] tracking-tight">
                Inference & Sandbox Settings
              </h2>
              <p className="text-[11px] text-[#86868B]">
                Configure local LLM inference parameters and sandbox execution limits
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            aria-label="Close Settings"
            className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] rounded-xl hover:bg-[#F5F5F7] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-[#4B5563] max-h-[calc(88vh-130px)] overflow-y-auto">
          {/* Temperature Tile */}
          <div className="p-4 bg-[#F5F5F7]/70 rounded-2xl border border-black/[0.05] space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="setting-temp" className="font-semibold text-xs text-[#1D1D1F]">
                Temperature
              </label>
              <span className="font-mono text-xs font-bold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-md border border-[#007AFF]/20">
                {Number(form.temperature).toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Controls generation randomness: lower values produce strict, predictable code, while higher values allow more creative variations.
            </p>
            <input
              id="setting-temp"
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
              className="w-full h-1.5 accent-[#007AFF] bg-[#E5E5EA] rounded-lg cursor-pointer transition"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#86868B] pt-0.5">
              <span>0.0 (Strict & Deterministic)</span>
              <span>1.0 (Creative & Varied)</span>
            </div>
          </div>

          {/* Top_P Tile */}
          <div className="p-4 bg-[#F5F5F7]/70 rounded-2xl border border-black/[0.05] space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="setting-top-p" className="font-semibold text-xs text-[#1D1D1F]">
                Top-P (Nucleus Sampling)
              </label>
              <span className="font-mono text-xs font-bold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-md border border-[#007AFF]/20">
                {Number(form.top_p).toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Limits token choice to cumulative probability mass: lower values cut unlikely tokens to keep completions tightly focused.
            </p>
            <input
              id="setting-top-p"
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={form.top_p}
              onChange={(e) => setForm({ ...form, top_p: parseFloat(e.target.value) })}
              className="w-full h-1.5 accent-[#007AFF] bg-[#E5E5EA] rounded-lg cursor-pointer transition"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#86868B] pt-0.5">
              <span>0.1 (Focused Selection)</span>
              <span>1.0 (Full Vocabulary)</span>
            </div>
          </div>

          {/* Context Length & Max Tokens Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Max Predict Tokens */}
            <div className="p-4 bg-[#F5F5F7]/70 rounded-2xl border border-black/[0.05] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="setting-max-tokens" className="font-semibold text-xs text-[#1D1D1F] whitespace-nowrap">
                    Max Predict Tokens
                  </label>
                  <span className="text-[10px] font-mono text-[#86868B] bg-black/[0.04] px-1.5 py-0.5 rounded">
                    Tokens
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] mb-3 leading-relaxed">
                  Maximum length of code the model can generate in a single response turn.
                </p>
              </div>
              <input
                id="setting-max-tokens"
                type="number"
                min="256"
                max="8192"
                step="256"
                value={form.max_tokens}
                onChange={(e) => setForm({ ...form, max_tokens: parseInt(e.target.value) || 2048 })}
                className="w-full bg-[#FFFFFF] border border-black/[0.08] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition shadow-xs"
              />
            </div>

            {/* Context Length */}
            <div className="p-4 bg-[#F5F5F7]/70 rounded-2xl border border-black/[0.05] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="setting-context-len" className="font-semibold text-xs text-[#1D1D1F] whitespace-nowrap">
                    Context Length
                  </label>
                  <span className="text-[10px] font-mono text-[#86868B] bg-black/[0.04] px-1.5 py-0.5 rounded">
                    Tokens
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] mb-3 leading-relaxed">
                  Total memory buffer in RAM reserved for prompt instructions and project context.
                </p>
              </div>
              <input
                id="setting-context-len"
                type="number"
                min="2048"
                max="32768"
                step="1024"
                value={form.context_length}
                onChange={(e) => setForm({ ...form, context_length: parseInt(e.target.value) || 4096 })}
                className="w-full bg-[#FFFFFF] border border-black/[0.08] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition shadow-xs"
              />
            </div>
          </div>

          {/* Default Language Tile */}
          <div className="p-4 bg-[#F5F5F7]/70 rounded-2xl border border-black/[0.05] space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="setting-default-lang" className="font-semibold text-xs text-[#1D1D1F]">
                Default Language
              </label>
              <span className="text-[10px] font-mono text-[#86868B] bg-black/[0.04] px-1.5 py-0.5 rounded">
                Syntax & Runner
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Fallback programming language and editor highlighting used when not explicitly specified in your prompt.
            </p>
            <div className="relative">
              <select
                id="setting-default-lang"
                value={form.default_language}
                onChange={(e) => setForm({ ...form, default_language: e.target.value })}
                className="w-full bg-[#FFFFFF] border border-black/[0.08] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#1D1D1F] font-medium appearance-none focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition shadow-xs cursor-pointer"
              >
                <option value="Auto">Auto (Model chooses best language)</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
                <option value="SQL">SQL</option>
                <option value="Bash">Bash</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#86868B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sandboxed Code Execution Toggle Tile */}
          <div className="p-4 bg-[#F5F5F7]/70 rounded-2xl border border-black/[0.05]">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#34C759] shrink-0" />
                  <span className="font-semibold text-xs text-[#1D1D1F]">
                    Enable Sandboxed "Run" (Python / JS)
                  </span>
                  <span className="text-[10px] bg-[#34C759]/15 text-[#34C759] font-medium px-2 py-0.5 rounded-full border border-[#34C759]/30">
                    Zero Network
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Safely executes generated code in an isolated local subprocess with a 5-second timeout and strict resource caps.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={form.allow_code_execution}
                  onChange={(e) => setForm({ ...form, allow_code_execution: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E5E5EA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34C759]"></div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.06]">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 bg-[#E5E5EA] hover:bg-[#D1D1D6] text-[#1D1D1F] rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#007AFF] hover:bg-[#0066CC] text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
