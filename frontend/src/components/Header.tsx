import React from 'react';
import {
  Code2,
  Cpu,
  BookmarkCheck,
  Settings as SettingsIcon,
  HardDrive,
  Terminal,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { OfflineBadge } from './OfflineBadge';

export const Header: React.FC = () => {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);
  const systemRamTotal = useAppStore((state) => state.systemRamTotal);
  const systemRamAvailable = useAppStore((state) => state.systemRamAvailable);
  const systemRamPercent = useAppStore((state) => state.systemRamPercent);
  const activeModel = useAppStore((state) => state.activeModel);

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-[#0a0e17] border-b border-slate-800/80 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
          <Code2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white">OfflineCoder</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Gemma Edition
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Strictly code-only, local-first inference
          </p>
        </div>
      </div>

      {/* Center Nav Tabs */}
      <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => {
            setActiveTab('editor');
            window.location.hash = 'editor';
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'editor'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('models');
            window.location.hash = 'models';
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'models'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Models</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('snippets');
            window.location.hash = 'snippets';
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'snippets'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Saved Snippets</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* RAM Quick Monitor */}
        {systemRamTotal > 0 && (
          <div
            className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400"
            title={`RAM: ${systemRamAvailable}GB free of ${systemRamTotal}GB (${systemRamPercent}% used)`}
          >
            <HardDrive className="w-3 h-3 text-slate-500" />
            <span>
              RAM: {systemRamAvailable}GB free
            </span>
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${systemRamPercent > 85 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${systemRamPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Offline Badge */}
        <OfflineBadge />

        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
