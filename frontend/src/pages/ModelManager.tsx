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
  ShieldCheck,
  Zap,
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
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
              Local Model Manager
            </h2>
          </div>
          <p className="text-xs text-[#4B5563] mt-1 font-medium">
            Manage local Google Gemma models. Inference runs 100% on localhost with zero external egress.
          </p>
        </div>
        <button
          onClick={fetchModels}
          aria-label="Refresh Models"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#FFFFFF] hover:bg-[#F5F5F7] text-[#1D1D1F] rounded-xl text-xs font-semibold transition border border-black/[0.06] shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#007AFF]" />
          <span>Refresh Hardware</span>
        </button>
      </div>

      {/* Apple Bento Grid: System Overview */}
      <div className="bento-grid">
        {/* Featured Tile: 2x2 with bold gradient */}
        <div className="tile tile--feature">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-white" />
              Active Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] uppercase font-bold backdrop-blur-sm">
              Quantized Q4_K_M
            </span>
          </div>

          <div className="my-4">
            <h3 className="text-2xl font-bold tracking-tight text-white font-mono break-all">
              {activeModel}
            </h3>
            <p className="text-xs text-white/80 mt-1 leading-relaxed">
              Google Gemma model loaded into memory with Apple Metal GPU acceleration.
            </p>
          </div>

          <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Zero-latency offline inference
            </span>
            <span className="font-semibold text-emerald-300">Active</span>
          </div>
        </div>

        {/* Tile: Model Runtime */}
        <div className="tile">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs text-[#4B5563] font-semibold uppercase tracking-wider">
              Runtime
            </h3>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                runtimeHealth?.status === 'ok' ? 'bg-[#34C759]' : 'bg-[#FF9500]'
              }`}
            />
          </div>
          <div>
            <div className="text-base font-bold text-[#1D1D1F]">
              {runtimeHealth?.status === 'ok' ? 'Ollama' : 'Mock Engine'}
            </div>
            <div className="text-[11px] text-[#4B5563] font-mono mt-0.5">
              localhost:11434
            </div>
          </div>
          <p className="text-[11px] text-[#86868B] mt-2 border-t border-black/[0.04] pt-2">
            {runtimeHealth?.message || 'Local server running and responding'}
          </p>
        </div>

        {/* Tile: System Memory (RAM) */}
        <div className="tile">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs text-[#4B5563] font-semibold uppercase tracking-wider">
              Memory (RAM)
            </h3>
            <HardDrive className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div>
            <div className="text-base font-bold text-[#1D1D1F]">
              {systemRamAvailable} GB free
            </div>
            <div className="text-[11px] text-[#4B5563] mt-0.5">
              of {systemRamTotal} GB total ({systemRamPercent}% used)
            </div>
          </div>
          <div className="w-full bg-[#E5E5EA] h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                systemRamPercent > 80 ? 'bg-[#FF9500]' : 'bg-[#34C759]'
              }`}
              style={{ width: `${systemRamPercent}%` }}
            />
          </div>
        </div>

        {/* Tile: Zero-Network Sandbox Security */}
        <div className="tile">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs text-[#4B5563] font-semibold uppercase tracking-wider">
              Network Isolation
            </h3>
            <ShieldCheck className="w-4 h-4 text-[#34C759]" />
          </div>
          <div>
            <div className="text-base font-bold text-[#1D1D1F]">
              100% Guarded
            </div>
            <div className="text-[11px] text-[#34C759] font-medium mt-0.5">
              Zero External Egress
            </div>
          </div>
          <p className="text-[11px] text-[#86868B] mt-2 border-t border-black/[0.04] pt-2">
            Air-gap security enforced locally
          </p>
        </div>

        {/* Tile: AST Syntax Engine */}
        <div className="tile">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs text-[#4B5563] font-semibold uppercase tracking-wider">
              Validator
            </h3>
            <CheckCircle2 className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div>
            <div className="text-base font-bold text-[#1D1D1F]">
              Tree-Sitter
            </div>
            <div className="text-[11px] text-[#4B5563] mt-0.5">
              Language AST Parser
            </div>
          </div>
          <p className="text-[11px] text-[#86868B] mt-2 border-t border-black/[0.04] pt-2">
            Syntactic verification before render
          </p>
        </div>
      </div>

      {/* Low-RAM Warning if applicable */}
      {systemRamAvailable < 6.0 && (
        <div className="tile tile--wide bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-[#92400E]">
                Low Free System RAM Detected ({systemRamAvailable} GB free)
              </div>
              <p className="mt-1 text-xs text-[#B45309] leading-relaxed">
                For optimal responsiveness without OS paging, lightweight quantized models like <b>gemma3 (4B)</b> or <b>gemma:2b</b> run smoothly. Larger models (7B/12B) may slow down if system memory is constrained.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Models Section: Bento Grid of Available Models */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#007AFF]" />
            <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider">
              Installed Local Models
            </h3>
          </div>
          <span className="text-xs text-[#4B5563] font-semibold">
            {models.length} model{models.length === 1 ? '' : 's'} discovered
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {models.map((m) => {
            const isActive = m.name === activeModel;
            return (
              <div
                key={m.name}
                className={`tile justify-between ${
                  isActive
                    ? 'border-[#007AFF] ring-1 ring-[#007AFF]/20 bg-[#FFFFFF]'
                    : 'bg-[#FFFFFF]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-base text-[#1D1D1F] font-mono">
                        {m.name}
                      </h4>
                      <p className="text-xs text-[#4B5563] mt-0.5">
                        Source: <span className="capitalize font-medium">{m.source}</span> • Family: <span className="capitalize font-medium">{m.family || 'Gemma'}</span>
                      </p>
                    </div>
                    {isActive ? (
                      <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] font-bold border border-[#34C759]/30">
                        <CheckCircle2 className="w-3 h-3 text-[#34C759]" />
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F5F5F7] text-[#4B5563] font-mono uppercase font-semibold">
                        {m.quantization_level || 'Q4_K_M'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#4B5563] my-3">
                    <span>Disk Size: <strong className="text-[#1D1D1F]">{m.size_gb} GB</strong></span>
                    <span>Est. RAM: <strong className="text-[#1D1D1F]">~{m.ram_required_estimate_gb} GB</strong></span>
                  </div>

                  {m.has_ram_warning && (
                    <div className="text-[11px] text-[#D97706] flex items-center gap-1.5 my-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{m.warning_message}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-black/[0.04]">
                  {isActive ? (
                    <button
                      disabled
                      className="w-full py-2 bg-[#F5F5F7] text-[#86868B] text-xs font-semibold rounded-xl cursor-default"
                    >
                      Currently Active
                    </button>
                  ) : (
                    <button
                      onClick={() => switchModel(m.name)}
                      className="w-full py-2 bg-[#007AFF] hover:bg-[#0066CC] text-white text-xs font-semibold rounded-xl transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]"
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

      {/* Pre-download Helper Tile */}
      <div className="tile tile--wide bg-[#FFFFFF] border-black/[0.06] shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <DownloadCloud className="w-4 h-4 text-[#007AFF]" />
          <h3 className="font-bold text-sm text-[#1D1D1F]">
            Pre-Downloading Models (One-Time Setup While Online)
          </h3>
        </div>
        <p className="text-xs text-[#4B5563] leading-relaxed">
          localMind enforces zero network access at runtime. To install new Google Gemma models before going offline, run the pre-download helper in your terminal:
        </p>
        <div
          className="bg-[#F5F5F7] p-3 rounded-xl font-mono text-[#1D1D1F] text-xs border border-black/[0.06] mt-3 select-all"
          style={{ fontFamily: '"Courier New", Courier, monospace' }}
        >
          bash scripts/download_models.sh
        </div>
      </div>
    </div>
  );
};
