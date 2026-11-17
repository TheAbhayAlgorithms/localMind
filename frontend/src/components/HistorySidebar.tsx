import React, { useEffect } from 'react';
import {
  History,
  Search,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore, HistoryEntry } from '../store/useAppStore';

export const HistorySidebar: React.FC = () => {
  const isHistoryOpen = useAppStore((state) => state.isHistoryOpen);
  const setIsHistoryOpen = useAppStore((state) => state.setIsHistoryOpen);
  const history = useAppStore((state) => state.history);
  const historySearch = useAppStore((state) => state.historySearch);
  const setHistorySearch = useAppStore((state) => state.setHistorySearch);
  const deleteHistoryItem = useAppStore((state) => state.deleteHistoryItem);
  const clearHistory = useAppStore((state) => state.clearHistory);
  const setCode = useAppStore((state) => state.setCode);
  const setPrompt = useAppStore((state) => state.setPrompt);
  const setSelectedLanguage = useAppStore((state) => state.setSelectedLanguage);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isHistoryOpen) {
        setIsHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHistoryOpen, setIsHistoryOpen]);

  if (!isHistoryOpen) return null;

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

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={() => setIsHistoryOpen(false)}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-out History Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 w-80 sm:w-96 bg-[#FFFFFF] shadow-2xl border-r border-black/[0.08] flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5 text-[#1D1D1F]">
            <div className="w-7 h-7 rounded-lg bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
              <History className="w-4 h-4 text-[#007AFF]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1D1D1F]">Local History</h2>
              <span className="text-[11px] text-[#86868B]">
                {history.length} generation{history.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all local history?')) clearHistory();
                }}
                aria-label="Clear all history"
                className="p-1.5 text-[#86868B] hover:text-[#FF3B30] rounded-lg transition hover:bg-[#F5F5F7]"
                title="Clear all history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsHistoryOpen(false)}
              aria-label="Close History"
              className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] rounded-lg transition hover:bg-[#F5F5F7]"
              title="Close History"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-black/[0.06] bg-[#F5F5F7]/50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#86868B]" />
            <input
              type="text"
              placeholder="Search prompt or code..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-black/[0.08] text-xs text-[#1D1D1F] placeholder-[#86868B] rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#007AFF] shadow-sm font-sans transition-all"
            />
          </div>
        </div>

        {/* History Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {history.length === 0 ? (
            <div className="text-center py-16 px-4 text-xs text-[#86868B]">
              <History className="w-8 h-8 text-black/20 mx-auto mb-2" />
              <p className="font-semibold text-[#1D1D1F]">No history yet</p>
              <p className="mt-1 text-[#86868B]">
                Generated code will automatically appear here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectHistory(item)}
                className="group relative flex flex-col p-3 rounded-2xl bg-[#F5F5F7] hover:bg-[#FFFFFF] hover:shadow-md hover:scale-[1.01] cursor-pointer border border-black/[0.04] transition-all text-left"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
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
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-1 text-[11px] text-[#86868B]">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#0066CC] font-mono text-[10px] font-semibold border border-black/[0.06]">
                      {item.detected_language || item.requested_language}
                    </span>
                    {item.is_syntax_valid ? (
                      <span title="Valid syntax">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34C759]" />
                      </span>
                    ) : (
                      <span title="Syntax retry">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#FF9500]" />
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[#86868B]">
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};
