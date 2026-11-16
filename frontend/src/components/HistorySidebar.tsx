import React, { useState } from 'react';
import {
  History,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore, HistoryEntry } from '../store/useAppStore';

export const HistorySidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const history = useAppStore((state) => state.history);
  const historySearch = useAppStore((state) => state.historySearch);
  const setHistorySearch = useAppStore((state) => state.setHistorySearch);
  const deleteHistoryItem = useAppStore((state) => state.deleteHistoryItem);
  const clearHistory = useAppStore((state) => state.clearHistory);
  const setCode = useAppStore((state) => state.setCode);
  const setPrompt = useAppStore((state) => state.setPrompt);
  const setSelectedLanguage = useAppStore((state) => state.setSelectedLanguage);

  const handleSelectHistory = (item: HistoryEntry) => {
    setPrompt(item.prompt);
    setCode(item.code);
    setSelectedLanguage(item.requested_language || item.detected_language || 'Auto');
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return '';
    }
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 bg-[#FFFFFF] border-r border-black/[0.06] w-12 transition-all shadow-sm">
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand History Sidebar"
          className="p-2 text-[#4B5563] hover:text-[#1D1D1F] rounded-xl hover:bg-[#F5F5F7] transition"
          title="Expand History Sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="mt-6 [writing-mode:vertical-lr] text-xs font-semibold uppercase tracking-wider text-[#86868B]">
          History ({history.length})
        </div>
      </div>
    );
  }

  return (
    <aside className="w-72 sm:w-80 flex flex-col bg-[#FFFFFF] border-r border-black/[0.06] h-full transition-all shadow-sm">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-black/[0.06]">
        <div className="flex items-center gap-2 text-[#1D1D1F]">
          <History className="w-4 h-4 text-[#007AFF]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F]">Local History</h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#0066CC] font-mono border border-black/[0.06] font-semibold">
            {history.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all local history?')) clearHistory();
              }}
              aria-label="Clear all history"
              className="p-1.5 text-[#86868B] hover:text-[#FF3B30] rounded-lg transition hover:bg-[#F5F5F7]"
              title="Clear all history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse Sidebar"
            className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] rounded-lg transition hover:bg-[#F5F5F7]"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-black/[0.06]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#86868B]" />
          <input
            type="text"
            placeholder="Search prompt or code..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] placeholder-[#86868B] rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#007AFF] focus:bg-white font-sans transition-all"
          />
        </div>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-12 px-4 text-xs text-[#86868B]">
            No history yet. Generated code will automatically appear here.
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectHistory(item)}
              className="group relative flex flex-col p-3 rounded-2xl bg-[#F5F5F7] hover:bg-[#FFFFFF] hover:shadow-md hover:scale-[1.01] cursor-pointer border border-black/[0.04] transition-all text-left"
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <p className="text-xs font-semibold text-[#1D1D1F] group-hover:text-[#007AFF] line-clamp-2 leading-snug font-sans transition-colors">
                  {item.prompt}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHistoryItem(item.id);
                  }}
                  aria-label="Delete history entry"
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#86868B] hover:text-[#FF3B30] rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-1 text-[11px] text-[#86868B]">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#0066CC] font-mono text-[10px] font-semibold border border-black/[0.06]">
                    {item.detected_language || item.requested_language}
                  </span>
                  {item.is_syntax_valid ? (
                    <span title="Valid syntax">
                      <CheckCircle className="w-3 h-3 text-[#34C759]" />
                    </span>
                  ) : (
                    <span title="Syntax retry">
                      <AlertTriangle className="w-3 h-3 text-[#FF9500]" />
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-[#86868B]">{formatDate(item.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
