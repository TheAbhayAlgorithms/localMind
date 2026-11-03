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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Inference & Sandbox Settings</span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-300">
          {/* Temperature */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-medium text-slate-200">Temperature: {form.temperature}</label>
              <span className="text-[11px] text-slate-500 font-mono">0.0 (strict) - 1.0 (creative)</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Low temperature (0.05 - 0.2) is strongly recommended for deterministic, syntactically correct code.
            </p>
          </div>

          {/* Top_P */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-medium text-slate-200">Top-P: {form.top_p}</label>
              <span className="text-[11px] text-slate-500 font-mono">0.1 - 1.0</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={form.top_p}
              onChange={(e) => setForm({ ...form, top_p: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Context Length & Max Tokens */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-200 mb-1">Max Predict Tokens</label>
              <input
                type="number"
                min="256"
                max="8192"
                step="256"
                value={form.max_tokens}
                onChange={(e) => setForm({ ...form, max_tokens: parseInt(e.target.value) || 2048 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-200 mb-1">Context Length</label>
              <input
                type="number"
                min="2048"
                max="32768"
                step="1024"
                value={form.context_length}
                onChange={(e) => setForm({ ...form, context_length: parseInt(e.target.value) || 4096 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Default Language */}
          <div>
            <label className="block font-medium text-slate-200 mb-1">Default Language</label>
            <select
              value={form.default_language}
              onChange={(e) => setForm({ ...form, default_language: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
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
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Enable Sandboxed "Run" (Python / JS)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
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
                <div className="w-11 h-6 bg-slate-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-md transition"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
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
