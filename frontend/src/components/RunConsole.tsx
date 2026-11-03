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
    <div className="bg-[#0b0f19] border-t border-slate-800 flex flex-col max-h-56 overflow-hidden">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider">Sandboxed Execution Console</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            Zero-Network Sandbox
          </span>
        </div>

        <div className="flex items-center gap-3">
          {runResult && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {runResult.duration_ms}ms
              </span>
              <span>Exit: {runResult.exit_code}</span>
            </div>
          )}
          <button
            onClick={() => setIsConsoleOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Output Stream */}
      <div className="p-3 overflow-y-auto font-mono text-xs flex-1 space-y-2 bg-black/40">
        {isRunningCode ? (
          <div className="text-indigo-400 animate-pulse flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            Executing inside sandboxed subprocess...
          </div>
        ) : runResult ? (
          <>
            {runResult.stdout && (
              <div>
                <div className="text-slate-500 text-[10px] mb-1">STDOUT:</div>
                <pre className="text-emerald-300 whitespace-pre-wrap">{runResult.stdout}</pre>
              </div>
            )}
            {runResult.stderr && (
              <div>
                <div className="text-slate-500 text-[10px] mb-1">STDERR / DIAGNOSTICS:</div>
                <pre className="text-rose-400 whitespace-pre-wrap">{runResult.stderr}</pre>
              </div>
            )}
            {!runResult.stdout && !runResult.stderr && (
              <div className="text-slate-500 italic">Program finished with zero output (exit code: {runResult.exit_code}).</div>
            )}
          </>
        ) : (
          <div className="text-slate-500 italic">No execution output yet. Click 'Run' to execute code locally.</div>
        )}
      </div>
    </div>
  );
};
