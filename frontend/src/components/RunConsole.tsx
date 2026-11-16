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
    <div className="bg-black border-t border-neutral-800 flex flex-col max-h-56 overflow-hidden">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-950 border-b border-neutral-800 text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-white" />
          <span className="font-semibold uppercase tracking-wider text-white">Sandboxed Execution Console</span>
          <span className="flex items-center gap-1 text-[11px] text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
            <ShieldCheck className="w-3 h-3 text-white" />
            Zero-Network Sandbox
          </span>
        </div>

        <div className="flex items-center gap-3">
          {runResult && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                {runResult.duration_ms}ms
              </span>
              <span>Exit: {runResult.exit_code}</span>
            </div>
          )}
          <button
            onClick={() => setIsConsoleOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Output Stream */}
      <div
        className="p-3.5 overflow-y-auto font-mono text-xs flex-1 space-y-2 bg-black text-neutral-200"
        style={{ fontFamily: '"Courier New", Courier, monospace' }}
      >
        {isRunningCode ? (
          <div className="text-white animate-pulse flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" />
            Executing inside sandboxed subprocess...
          </div>
        ) : runResult ? (
          <>
            {runResult.stdout && (
              <div>
                <div className="text-neutral-500 text-[10px] uppercase tracking-wider mb-1">STDOUT:</div>
                <pre className="text-white whitespace-pre-wrap font-mono">{runResult.stdout}</pre>
              </div>
            )}
            {runResult.stderr && (
              <div>
                <div className="text-neutral-400 text-[10px] uppercase tracking-wider mb-1">STDERR / DIAGNOSTICS:</div>
                <pre className="text-neutral-300 whitespace-pre-wrap font-mono">{runResult.stderr}</pre>
              </div>
            )}
            {!runResult.stdout && !runResult.stderr && (
              <div className="text-neutral-500 italic">Program finished with zero output (exit code: {runResult.exit_code}).</div>
            )}
          </>
        ) : (
          <div className="text-neutral-500 italic">No execution output yet. Click 'Run' to execute code locally.</div>
        )}
      </div>
    </div>
  );
};

