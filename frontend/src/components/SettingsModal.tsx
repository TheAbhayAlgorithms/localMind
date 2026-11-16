import React, { useState } from 'react';
import { X, Sliders, Shield, Terminal, Zap, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useAppStore((state) => state.isSettingsOpen);
  const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(form);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsSettingsOpen(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Sliders className="w-4 h-4 text-white" />
            <span>Inference & Sandbox Settings</span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-neutral-300">
          {/* Temperature */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-medium text-white">Temperature: {form.temperature}</label>
              <span className="text-[11px] text-neutral-500 font-mono">0.0 (strict) - 1.0 (creative)</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
              className="w-full accent-white bg-neutral-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Low temperature (0.05 - 0.2) is strongly recommended for deterministic, syntactically correct code.
            </p>
          </div>

          {/* Top_P */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-medium text-white">Top-P: {form.top_p}</label>
              <span className="text-[11px] text-neutral-500 font-mono">0.1 - 1.0</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={form.top_p}
              onChange={(e) => setForm({ ...form, top_p: parseFloat(e.target.value) })}
              className="w-full accent-white bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Context Length & Max Tokens */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-white mb-1">Max Predict Tokens</label>
              <input
                type="number"
                min="256"
                max="8192"
                step="256"
                value={form.max_tokens}
                onChange={(e) => setForm({ ...form, max_tokens: parseInt(e.target.value) || 2048 })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block font-medium text-white mb-1">Context Length</label>
              <input
                type="number"
                min="2048"
                max="32768"
                step="1024"
                value={form.context_length}
                onChange={(e) => setForm({ ...form, context_length: parseInt(e.target.value) || 4096 })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          {/* Default Language */}
          <div>
            <label className="block font-medium text-white mb-1">Default Language</label>
            <select
              value={form.default_language}
              onChange={(e) => setForm({ ...form, default_language: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
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
          </div>

          {/* Sandboxed Code Execution Toggle */}
          <div className="pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-white" />
                  Enable Sandboxed "Run" (Python / JS)
                </span>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Runs generated code in a local subprocess with strict timeout (5s), resource caps, and zero network. Disabled by default.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={form.allow_code_execution}
                  onChange={(e) => setForm({ ...form, allow_code_execution: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-neutral-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-900 after:border-neutral-800 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg font-semibold shadow-md transition"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-black" />
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

