import React from 'react';
import { HistorySidebar } from '../components/HistorySidebar';
import { MonacoEditorOffline } from '../components/MonacoEditorOffline';
import { PromptBox } from '../components/PromptBox';
import { RunConsole } from '../components/RunConsole';

export const Home: React.FC = () => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* History Sidebar */}
      <HistorySidebar />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col p-4 gap-3 overflow-hidden bg-[#070a12]">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <MonacoEditorOffline />
          <RunConsole />
        </div>

        {/* Prompt Input Box */}
        <PromptBox />
      </main>
    </div>
  );
};
