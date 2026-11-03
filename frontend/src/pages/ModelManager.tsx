import React from 'react';
import {
  Cpu,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  DownloadCloud,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const ModelManager: React.FC = () => {
  const models = useAppStore((state) => state.models);
  const activeModel = useAppStore((state) => state.activeModel);
  const switchModel = useAppStore((state) => state.switchModel);
  const fetchModels = useAppStore((state) => state.fetchModels);
  const systemRamTotal = useAppStore((state) => state.systemRamTotal);
  const systemRamAvailable = useAppStore((state) => state.systemRamAvailable);
  const systemRamPercent = useAppStore((state) => state.systemRamPercent);
  const runtimeHealth = useAppStore((state) => state.runtimeHealth);

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      {/* Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Local Model Manager
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage local Google Gemma models. Inference runs 100% on localhost with zero external egress.
          </p>
        </div>
        <button
          onClick={fetchModels}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs transition border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Runtime & Hardware Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Runtime Status */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Model Runtime</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                runtimeHealth?.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>
          <div className="text-base font-bold text-slate-200">
            {runtimeHealth?.status === 'ok' ? 'Ollama (localhost:11434)' : 'Offline / Mock'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {runtimeHealth?.message || 'Local server running and responding'}
          </p>
        </div>

        {/* System RAM Gauge */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">System Memory (RAM)</span>
            <HardDrive className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-slate-200">
            {systemRamAvailable} GB free <span className="text-xs font-normal text-slate-400">/ {systemRamTotal} GB</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${systemRamPercent > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
              style={{ width: `${systemRamPercent}%` }}
            />
          </div>
        </div>

        {/* Active Model */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Current Active Model</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-indigo-300 font-mono">
            {activeModel}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Quantized Q4_K_M weights loaded
          </p>
        </div>
      </div>

      {/* Low-RAM Warning if applicable */}
      {systemRamAvailable < 6.0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-300">Low Free System RAM Detected ({systemRamAvailable} GB free)</div>
            <p className="mt-0.5 text-amber-200/90 leading-relaxed">
              For smooth offline performance without OS disk paging, we recommend selecting a lightweight quantized model such as <b>gemma:2b</b> or <b>gemma3 (4B)</b>. Larger models (7B/12B) may run slowly if available memory is constrained.
            </p>
          </div>
        </div>
      )}

      {/* Models List Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Installed Local Models
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {models.length} model{models.length === 1 ? '' : 's'} discovered
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {models.map((m) => {
            const isActive = m.name === activeModel;
            return (
              <div
                key={m.name}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                  isActive ? 'bg-indigo-950/20' : 'hover:bg-slate-850/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-100 font-mono">{m.name}</span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/40">
                        <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                        Active
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">
                      {m.quantization_level || 'Q4_K_M'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>Source: <span className="text-slate-300 capitalize">{m.source}</span></span>
                    <span>Disk Size: <span className="text-slate-300">{m.size_gb} GB</span></span>
                    <span>
                      Est. RAM Req: <span className="text-slate-300 font-medium">~{m.ram_required_estimate_gb} GB</span>
                    </span>
                  </div>

                  {m.has_ram_warning && (
                    <div className="text-[11px] text-amber-400 flex items-center gap-1.5 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{m.warning_message}</span>
                    </div>
                  )}
                </div>

                <div>
                  {isActive ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/30 cursor-default"
                    >
                      Currently Active
                    </button>
                  ) : (
                    <button
                      onClick={() => switchModel(m.name)}
                      className="px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition shadow-sm"
                    >
                      Switch to this Model
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-download instructions card */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
        <div className="font-semibold text-slate-300 flex items-center gap-2">
          <DownloadCloud className="w-4 h-4 text-indigo-400" />
          Pre-Downloading Models (One-Time Setup While Online)
        </div>
        <p className="leading-relaxed">
          OfflineCoder enforces zero network access at runtime. To install new Google Gemma models before going offline, run the pre-download helper in your terminal:
        </p>
        <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-emerald-400 text-[11px] border border-slate-800 select-all">
          bash scripts/download_models.sh
        </div>
      </div>
    </div>
  );
};

