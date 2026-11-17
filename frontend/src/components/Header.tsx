import React from 'react';
import {
  Code2,
  Cpu,
  BookmarkCheck,
  Settings as SettingsIcon,
  HardDrive,
  Zap,
  History,
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
  const isHistoryOpen = useAppStore((state) => state.isHistoryOpen);
  const toggleHistory = useAppStore((state) => state.toggleHistory);
  const history = useAppStore((state) => state.history);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-black/[0.06] shadow-sm select-none z-20">
        {/* Brand & Title (Apple clean typography) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#007AFF] text-white shadow-sm">
            <Code2 className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#1D1D1F] tracking-tight">
              localMind
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#0066CC] border border-black/[0.06] uppercase tracking-wide">
              Gemma 3
            </span>
          </div>
        </div>

        {/* Center Nav Tabs (Apple Segmented Capsule) */}
        <nav
          className="flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-2xl border border-black/[0.06]"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => {
              setActiveTab('editor');
              window.location.hash = 'editor';
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              activeTab === 'editor'
                ? 'bg-[#FFFFFF] text-[#1D1D1F] font-semibold shadow-sm'
                : 'text-[#4B5563] hover:text-[#1D1D1F]'
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              activeTab === 'models'
                ? 'bg-[#FFFFFF] text-[#1D1D1F] font-semibold shadow-sm'
                : 'text-[#4B5563] hover:text-[#1D1D1F]'
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              activeTab === 'snippets'
                ? 'bg-[#FFFFFF] text-[#1D1D1F] font-semibold shadow-sm'
                : 'text-[#4B5563] hover:text-[#1D1D1F]'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Saved Snippets</span>
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* RAM Quick Monitor Tile */}
          {systemRamTotal > 0 && (
            <div
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-black/[0.06] shadow-sm text-xs text-[#1D1D1F]"
              title={`RAM: ${systemRamAvailable}GB free of ${systemRamTotal}GB (${systemRamPercent}% used)`}
            >
              <HardDrive className="w-3.5 h-3.5 text-[#007AFF]" />
              <span className="font-medium text-[#4B5563]">
                {systemRamAvailable}GB free
              </span>
              <div className="w-12 h-1.5 bg-[#E5E5EA] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    systemRamPercent > 85 ? 'bg-[#FF3B30]' : 'bg-[#34C759]'
                  }`}
                  style={{ width: `${systemRamPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* History Button (Opens History Drawer) */}
          <button
            onClick={toggleHistory}
            aria-label="Toggle History"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition shadow-sm border ${
              isHistoryOpen
                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                : 'bg-[#FFFFFF] text-[#1D1D1F] hover:bg-[#F5F5F7] border-black/[0.06]'
            }`}
            title="Open Local Generation History"
          >
            <History className="w-3.5 h-3.5 text-[#007AFF]" />
            <span className="hidden sm:inline">History</span>
            {history.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                  isHistoryOpen ? 'bg-white/20 text-white' : 'bg-[#F5F5F7] text-[#0066CC]'
                }`}
              >
                {history.length}
              </span>
            )}
          </button>

          {/* Offline Badge */}
          <OfflineBadge />

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open Settings"
            className="p-2 text-[#4B5563] hover:text-[#1D1D1F] rounded-xl bg-[#FFFFFF] border border-black/[0.06] shadow-sm hover:shadow transition"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>
  );
};
