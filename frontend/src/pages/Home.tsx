import React from 'react';
import { HistorySidebar } from '../components/HistorySidebar';
import { MonacoEditorOffline } from '../components/MonacoEditorOffline';
import { PromptBox } from '../components/PromptBox';
import { RunConsole } from '../components/RunConsole';

export const Home: React.FC = () => {
  return (
    <div className="flex-1 flex overflow-hidden bg-[#F5F5F7]">
      {/* History Sidebar */}
      <HistorySidebar />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col p-4 gap-3.5 overflow-hidden bg-[#F5F5F7]">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden shadow-sm rounded-2xl">
          <MonacoEditorOffline />
          <RunConsole />
        </div>

        {/* Prompt Input Box */}
        <PromptBox />
      </main>
    </div>
  );
};
