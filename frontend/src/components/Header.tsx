import React from 'react';
import {
  Code2,
  Cpu,
  BookmarkCheck,
  Settings as SettingsIcon,
  HardDrive,
  Zap,
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
    <>
      <header className="flex items-center justify-between px-6 py-3 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-black/[0.06] shadow-sm select-none z-20">
        {/* Brand & Title (Apple clean typography) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#007AFF] text-white shadow-sm">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#1D1D1F] tracking-tight">
                localMind
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#0066CC] border border-black/[0.06] uppercase tracking-wide">
                Gemma 3
              </span>
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="text-[11px] text-[#4B5563]">
                Zero-Egress AI Code Assistant
              </span>
            </div>
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

      {/* Bento Subtitle Strip */}
      <div className="bg-[#FFFFFF]/80 border-b border-black/[0.04] px-6 py-1.5 flex items-center justify-between text-[11px] text-[#4B5563] select-none">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-[#34C759] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            100% Offline Local Engine
          </span>
          <span className="text-black/15">•</span>
          <span>Tree-Sitter AST Validated</span>
          <span className="text-black/15">•</span>
          <span>Zero Network Egress</span>
        </div>
        <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-[#86868B]">
          <span>Apple Metal Acceleration</span>
          <span className="text-black/15">•</span>
          <span>Active: <strong className="text-[#1D1D1F] font-semibold">{activeModel}</strong></span>
        </div>
      </div>
    </>
  );
};
