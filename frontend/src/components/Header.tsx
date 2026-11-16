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
    <header className="flex items-center justify-between px-5 py-3 bg-black border-b border-neutral-800 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 text-white">
          <Code2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white">OfflineCoder</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700">
              Gemma Edition
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 hidden sm:block">
            Strictly code-only, local-first inference
          </p>
        </div>
      </div>

      {/* Center Nav Tabs */}
      <nav className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
        <button
          onClick={() => {
            setActiveTab('editor');
            window.location.hash = 'editor';
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'editor'
              ? 'bg-white text-black shadow-sm font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
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
              ? 'bg-white text-black shadow-sm font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
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
              ? 'bg-white text-black shadow-sm font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
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
            className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-400"
            title={`RAM: ${systemRamAvailable}GB free of ${systemRamTotal}GB (${systemRamPercent}% used)`}
          >
            <HardDrive className="w-3 h-3 text-neutral-500" />
            <span>
              RAM: {systemRamAvailable}GB free
            </span>
            <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${systemRamPercent > 85 ? 'bg-neutral-300' : 'bg-white'}`}
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
          className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
