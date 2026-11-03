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
      <div className="flex flex-col items-center py-4 bg-slate-900 border-r border-slate-800 w-12 transition-all">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Expand History Sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="mt-6 [writing-mode:vertical-lr] text-xs font-semibold uppercase tracking-wider text-slate-500">
          History ({history.length})
        </div>
      </div>
    );
  }

  return (
    <aside className="w-72 sm:w-80 flex flex-col bg-[#0b0f19] border-r border-slate-800 h-full transition-all">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-200">
          <History className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider">Local History</h2>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {history.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all local history?')) clearHistory();
              }}
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition"
              title="Clear all history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded transition"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search prompt or code..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-850">
        {history.length === 0 ? (
          <div className="text-center py-12 px-4 text-xs text-slate-500">
            No history yet. Generated code will automatically appear here.
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectHistory(item)}
              className="group relative flex flex-col p-2.5 rounded-lg hover:bg-slate-850/80 cursor-pointer border border-transparent hover:border-slate-800 transition text-left"
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-snug">
                  {item.prompt}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHistoryItem(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-400 font-mono text-[10px] border border-indigo-900/50">
                    {item.detected_language || item.requested_language}
                  </span>
                  {item.is_syntax_valid ? (
                    <span title="Valid syntax">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                    </span>
                  ) : (
                    <span title="Syntax retry">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    </span>
                  )}
                </div>
                <span className="font-mono">{formatDate(item.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
