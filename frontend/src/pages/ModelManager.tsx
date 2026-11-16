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
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-white" />
            Local Model Manager
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage local Google Gemma models. Inference runs 100% on localhost with zero external egress.
          </p>
        </div>
        <button
          onClick={fetchModels}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs transition border border-neutral-800"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Runtime & Hardware Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Runtime Status */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">Model Runtime</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                runtimeHealth?.status === 'ok' ? 'bg-white' : 'bg-neutral-500'
              }`}
            />
          </div>
          <div className="text-base font-bold text-white">
            {runtimeHealth?.status === 'ok' ? 'Ollama (localhost:11434)' : 'Offline / Mock'}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {runtimeHealth?.message || 'Local server running and responding'}
          </p>
        </div>

        {/* System RAM Gauge */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">System Memory (RAM)</span>
            <HardDrive className="w-4 h-4 text-white" />
          </div>
          <div className="text-base font-bold text-white">
            {systemRamAvailable} GB free <span className="text-xs font-normal text-neutral-400">/ {systemRamTotal} GB</span>
          </div>
          <div className="w-full bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${systemRamPercent > 80 ? 'bg-neutral-400' : 'bg-white'}`}
              style={{ width: `${systemRamPercent}%` }}
            />
          </div>
        </div>

        {/* Active Model */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">Current Active Model</span>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-base font-bold text-white font-mono">
            {activeModel}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Quantized Q4_K_M weights loaded
          </p>
        </div>
      </div>

      {/* Low-RAM Warning if applicable */}
      {systemRamAvailable < 6.0 && (
        <div className="flex items-start gap-3 p-4 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-300">
          <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-white">Low Free System RAM Detected ({systemRamAvailable} GB free)</div>
            <p className="mt-0.5 text-neutral-400 leading-relaxed">
              For smooth offline performance without OS disk paging, we recommend selecting a lightweight quantized model such as <b>gemma:2b</b> or <b>gemma3 (4B)</b>. Larger models (7B/12B) may run slowly if available memory is constrained.
            </p>
          </div>
        </div>
      )}

      {/* Models List Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-white" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
              Installed Local Models
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {models.length} model{models.length === 1 ? '' : 's'} discovered
          </span>
        </div>

        <div className="divide-y divide-neutral-800">
          {models.map((m) => {
            const isActive = m.name === activeModel;
            return (
              <div
                key={m.name}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                  isActive ? 'bg-neutral-900/60' : 'hover:bg-neutral-900/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-white font-mono">{m.name}</span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white text-black font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-black" />
                        Active
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 font-mono uppercase border border-neutral-800">
                      {m.quantization_level || 'Q4_K_M'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                    <span>Source: <span className="text-neutral-200 capitalize">{m.source}</span></span>
                    <span>Disk Size: <span className="text-neutral-200">{m.size_gb} GB</span></span>
                    <span>
                      Est. RAM Req: <span className="text-neutral-200 font-medium">~{m.ram_required_estimate_gb} GB</span>
                    </span>
                  </div>

                  {m.has_ram_warning && (
                    <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-neutral-300" />
                      <span>{m.warning_message}</span>
                    </div>
                  )}
                </div>

                <div>
                  {isActive ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-neutral-900 text-neutral-400 text-xs font-semibold rounded-lg border border-neutral-800 cursor-default"
                    >
                      Currently Active
                    </button>
                  ) : (
                    <button
                      onClick={() => switchModel(m.name)}
                      className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition shadow-sm"
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
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 space-y-2">
        <div className="font-semibold text-neutral-200 flex items-center gap-2">
          <DownloadCloud className="w-4 h-4 text-white" />
          Pre-Downloading Models (One-Time Setup While Online)
        </div>
        <p className="leading-relaxed">
          OfflineCoder enforces zero network access at runtime. To install new Google Gemma models before going offline, run the pre-download helper in your terminal:
        </p>
        <div
          className="bg-neutral-900 p-2.5 rounded-lg font-mono text-white text-[11px] border border-neutral-800 select-all"
          style={{ fontFamily: '"Courier New", Courier, monospace' }}
        >
          bash scripts/download_models.sh
        </div>
      </div>
    </div>
  );
};

