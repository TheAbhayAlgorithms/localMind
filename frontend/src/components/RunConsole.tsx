import React from 'react';
import { Terminal, X, CheckCircle, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const RunConsole: React.FC = () => {
  const runResult = useAppStore((state) => state.runResult);
  const isRunningCode = useAppStore((state) => state.isRunningCode);
  const isConsoleOpen = useAppStore((state) => state.isConsoleOpen);
  const setIsConsoleOpen = useAppStore((state) => state.setIsConsoleOpen);

  if (!isConsoleOpen) return null;

  return (
    <div className="bg-[#141416] border-t border-white/[0.08] flex flex-col max-h-56 overflow-hidden">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1A1A1C] border-b border-white/[0.08] text-xs text-white">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#007AFF]" />
          <span className="font-semibold uppercase tracking-wider text-white">Sandboxed Execution Console</span>
          <span className="flex items-center gap-1 text-[11px] text-[#34C759] bg-[#34C759]/15 px-2.5 py-0.5 rounded-full border border-[#34C759]/30 font-medium">
            <ShieldCheck className="w-3 h-3 text-[#34C759]" />
            Zero-Network Sandbox
          </span>
        </div>

        <div className="flex items-center gap-3">
          {runResult && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-white/60">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/40" />
                {runResult.duration_ms}ms
              </span>
              <span>
                Exit: <span className={runResult.exit_code === 0 ? 'text-[#34C759] font-bold' : 'text-[#FF3B30] font-bold'}>{runResult.exit_code}</span>
              </span>
            </div>
          )}
          <button
            onClick={() => setIsConsoleOpen(false)}
            aria-label="Close Console"
            className="p-1 text-white/60 hover:text-white rounded hover:bg-white/10 transition"
            title="Close Console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Output Stream */}
      <div
        className="p-3.5 overflow-y-auto font-mono text-xs flex-1 space-y-2 bg-[#111113] text-[#F5F5F7]"
        style={{ fontFamily: '"Courier New", Courier, monospace' }}
      >
        {isRunningCode ? (
          <div className="text-[#007AFF] animate-pulse flex items-center gap-2 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
            Executing inside sandboxed subprocess...
          </div>
        ) : runResult ? (
          <>
            {runResult.stdout && (
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-semibold">STDOUT:</div>
                <pre className="text-[#34C759] whitespace-pre-wrap font-mono">{runResult.stdout}</pre>
              </div>
            )}
            {runResult.stderr && (
              <div>
                <div className="text-[#FF453A] text-[10px] uppercase tracking-wider mb-1 font-semibold">STDERR / DIAGNOSTICS:</div>
                <pre className="text-[#FF453A] whitespace-pre-wrap font-mono">{runResult.stderr}</pre>
              </div>
            )}
            {!runResult.stdout && !runResult.stderr && (
              <div className="text-white/40 italic">Program finished with zero output (exit code: {runResult.exit_code}).</div>
            )}
          </>
        ) : (
          <div className="text-white/40 italic">No execution output yet. Click 'Run' to execute code locally.</div>
        )}
      </div>
    </div>
  );
};
