import React from 'react';
import { HistorySidebar } from '../components/HistorySidebar';
import { MonacoEditorOffline } from '../components/MonacoEditorOffline';
import { PromptBox } from '../components/PromptBox';
import { RunConsole } from '../components/RunConsole';

export const Home: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F5F7] relative">
      {/* Slide-out History Drawer (closed by default, accessible via History button) */}
      <HistorySidebar />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col p-4 gap-3.5 overflow-hidden">
        {/* Two Vertical Sections Side-by-Side: Left = Code Output, Right = Terminal */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-3.5 overflow-hidden">
          {/* Left: Code Output Editor */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            <MonacoEditorOffline />
          </div>

          {/* Right: Execution Terminal */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            <RunConsole />
          </div>
        </div>

        {/* Bottom: Prompt Input Box */}
        <PromptBox />
      </main>
    </div>
  );
};
