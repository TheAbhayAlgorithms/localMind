import React from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const RunConsole: React.FC = () => {
  const code = useAppStore((state) => state.code);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const isRunningCode = useAppStore((state) => state.isRunningCode);
  const runResult = useAppStore((state) => state.runResult);
  const runCode = useAppStore((state) => state.runCode);
  const clearRunResult = useAppStore((state) => state.clearRunResult);
  const settings = useAppStore((state) => state.settings);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141416] border border-black/[0.08] rounded-2xl overflow-hidden shadow-sm">
      {/* Terminal Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#1A1A1C] border-b border-white/[0.08] text-xs text-white gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#007AFF]" />
          <span className="font-semibold uppercase tracking-wider text-white">
            Execution Terminal
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[#34C759] bg-[#34C759]/15 px-2.5 py-0.5 rounded-full border border-[#34C759]/30 font-medium">
            <ShieldCheck className="w-3 h-3 text-[#34C759]" />
            Sandbox Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {runResult && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-white/60">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/40" />
                {runResult.duration_ms}ms
              </span>
              <span>
                Exit:{' '}
                <span
                  className={
                    runResult.exit_code === 0
                      ? 'text-[#34C759] font-bold'
                      : 'text-[#FF453A] font-bold'
                  }
                >
                  {runResult.exit_code}
                </span>
              </span>
            </div>
          )}

          {/* Quick Run Code action */}
          <button
            onClick={runCode}
            disabled={!code || isGenerating || isRunningCode}
            aria-label="Run Code in Sandbox"
            title={
              settings.allow_code_execution
                ? 'Run code in local sandbox subprocess'
                : 'Execution disabled in Settings'
            }
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] ${
              settings.allow_code_execution && code
                ? 'bg-[#007AFF] hover:bg-[#0066CC] text-white shadow-sm'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunningCode ? 'animate-spin' : ''}`} />
            <span>{isRunningCode ? 'Running...' : 'Run'}</span>
          </button>

          {/* Clear Output action */}
          {runResult && (
            <button
              onClick={clearRunResult}
              aria-label="Clear Terminal Output"
              className="p-1 text-white/60 hover:text-white rounded hover:bg-white/10 transition"
              title="Clear output"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Stream Output Area */}
      <div
        className="p-4 overflow-y-auto font-mono text-xs flex-1 space-y-3 bg-[#111113] text-[#F5F5F7] select-text"
        style={{ fontFamily: '"Courier New", Courier, monospace' }}
      >
        {isRunningCode ? (
          <div className="text-[#007AFF] animate-pulse flex items-center gap-2 font-mono py-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
            Executing inside sandboxed local subprocess...
          </div>
        ) : runResult ? (
          <div className="space-y-3">
            {runResult.stdout && (
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#34C759]" />
                  STDOUT:
                </div>
                <pre className="text-[#34C759] whitespace-pre-wrap font-mono bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  {runResult.stdout}
                </pre>
              </div>
            )}
            {runResult.stderr && (
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3 text-[#FF453A]" />
                  STDERR / DIAGNOSTICS:
                </div>
                <pre className="text-[#FF453A] whitespace-pre-wrap font-mono bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  {runResult.stderr}
                </pre>
              </div>
            )}
            {!runResult.stdout && !runResult.stderr && (
              <div className="text-white/50 italic py-2">
                Program completed with zero output (exit code: {runResult.exit_code}).
              </div>
            )}
          </div>
        ) : (
          <div className="text-white/40 text-[11px] leading-relaxed py-2 select-none">
            <div className="text-white/60 font-semibold mb-2">
              localMind Sandboxed Terminal
            </div>
            <p>• Zero network egress: executed in local isolated subprocess.</p>
            <p>• Supported languages: Python, JavaScript/Node, Shell, Go, C++.</p>
            <p className="mt-2 text-white/30">
              Click <strong className="text-white/50">Run</strong> on the left editor (or above) to execute your program. Execution output and diagnostics will stream here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
