import React, { useRef, useState, useEffect } from 'react';
import { HistorySidebar } from '../components/HistorySidebar';
import { MonacoEditorOffline } from '../components/MonacoEditorOffline';
import { PromptBox } from '../components/PromptBox';
import { RunConsole } from '../components/RunConsole';
import { WorkspaceSplitter } from '../components/WorkspaceSplitter';
import { useAppStore } from '../store/useAppStore';

export const Home: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRatio = useAppStore((state) => state.splitRatio);
  const setSplitRatio = useAppStore((state) => state.setSplitRatio);

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F5F7] relative">
      {/* Slide-out History Drawer (closed by default, accessible via History button) */}
      <HistorySidebar />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        {/* Workspace Quick Layout & Width Presets Bar */}
        <div className="hidden lg:flex items-center justify-between px-1 text-[11px] text-[#86868B]">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-[#1D1D1F] font-semibold">Workspace Layout</span>
            <span className="text-black/20">•</span>
            <span className="font-mono text-[#4B5563]">
              Code {Math.round(splitRatio)}% : Terminal {Math.round(100 - splitRatio)}%
            </span>
          </div>

          {/* Quick Width Toggle Presets */}
          <div className="flex items-center gap-1 bg-[#FFFFFF] border border-black/[0.06] p-0.5 rounded-xl shadow-xs">
            <button
              onClick={() => setSplitRatio(70)}
              aria-label="Code Focus 70:30"
              title="Expand Code Editor (70% Code / 30% Terminal)"
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                splitRatio >= 65
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              Code Focus (70:30)
            </button>
            <button
              onClick={() => setSplitRatio(50)}
              aria-label="Balanced 50:50"
              title="Equal Split (50% Code / 50% Terminal)"
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                Math.abs(splitRatio - 50) < 4
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              Balanced (50:50)
            </button>
            <button
              onClick={() => setSplitRatio(30)}
              aria-label="Terminal Focus 30:70"
              title="Expand Execution Terminal (30% Code / 70% Terminal)"
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                splitRatio <= 35
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              Terminal Focus (30:70)
            </button>
          </div>
        </div>

        {/* Two Vertical Sections Side-by-Side: Left = Code Output, Right = Terminal */}
        <div
          ref={containerRef}
          className="flex-1 flex flex-col lg:flex-row min-h-0 gap-3.5 lg:gap-0 overflow-hidden relative select-none"
        >
          {/* Left: Code Output Editor */}
          <div
            className="flex flex-col min-w-0 h-full overflow-hidden select-text"
            style={
              isDesktop
                ? { width: `${splitRatio}%`, flexShrink: 0 }
                : { width: '100%', flex: 1 }
            }
          >
            <MonacoEditorOffline />
          </div>

          {/* Interactive Splitter & Width Toggle Control between windows */}
          <WorkspaceSplitter containerRef={containerRef} />

          {/* Right: Execution Terminal */}
          <div
            className="flex-1 flex flex-col min-w-0 h-full overflow-hidden select-text"
            style={
              isDesktop
                ? { width: `${100 - splitRatio}%` }
                : { width: '100%', flex: 1 }
            }
          >
            <RunConsole />
          </div>
        </div>

        {/* Bottom: Prompt Input Box */}
        <PromptBox />
      </main>
    </div>
  );
};
