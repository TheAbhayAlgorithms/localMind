import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Trash2,
  Copy,
  Check,
  Code2,
  Clock,
  Zap,
  ShieldCheck,
  AlertCircle,
  CornerDownLeft,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { useAppStore, HistoryEntry } from '../store/useAppStore';

export const HistoryPage: React.FC = () => {
  const history = useAppStore((state) => state.history);
  const deleteHistoryItem = useAppStore((state) => state.deleteHistoryItem);
  const clearHistory = useAppStore((state) => state.clearHistory);
  const setCode = useAppStore((state) => state.setCode);
  const setPrompt = useAppStore((state) => state.setPrompt);
  const setSelectedLanguage = useAppStore((state) => state.setSelectedLanguage);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    const q = searchTerm.toLowerCase();
    return history.filter(
      (item) =>
        item.prompt.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.detected_language && item.detected_language.toLowerCase().includes(q)) ||
        (item.model_used && item.model_used.toLowerCase().includes(q))
    );
  }, [history, searchTerm]);

  // Active preview item: explicitly hovered item, or fallback to first filtered item
  const previewItem = useMemo(() => {
    if (hoveredId !== null) {
      const found = filteredHistory.find((item) => item.id === hoveredId);
      if (found) return found;
    }
    return filteredHistory.length > 0 ? filteredHistory[0] : null;
  }, [hoveredId, filteredHistory]);

  const handleOpenInEditor = (item: HistoryEntry) => {
    setCode(item.code);
    setPrompt(item.prompt);
    setSelectedLanguage(item.detected_language || item.requested_language || 'Auto');
    setActiveTab('editor');
    window.location.hash = 'editor';
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 w-full overflow-hidden flex flex-col bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col min-h-0 gap-4">
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setActiveTab('editor');
                  window.location.hash = 'editor';
                }}
                aria-label="Back to Code Editor"
                title="Back to Code Editor"
                className="p-1.5 rounded-xl bg-[#FFFFFF] border border-black/[0.06] text-[#4B5563] hover:text-[#007AFF] hover:bg-[#F5F5F7] shadow-sm transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shadow-sm">
                <History className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
                Generation History
              </h2>
              <span className="text-xs text-[#0066CC] font-semibold bg-[#007AFF]/10 px-2.5 py-0.5 rounded-full border border-[#007AFF]/20">
                {history.length} Saved
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1 font-medium">
              Hover on any generation to preview its code. Click to replace with the normal code screen.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#86868B]" />
              <input
                type="text"
                placeholder="Search history prompts or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-black/[0.08] text-xs text-[#1D1D1F] placeholder-[#86868B] rounded-xl pl-8 pr-3 py-2 shadow-xs focus:outline-none focus:border-[#007AFF] transition font-sans"
              />
            </div>

            {/* Clear History Button */}
            {history.length > 0 && (
              <>
                {confirmClear ? (
                  <div className="flex items-center gap-1.5 bg-[#FFFFFF] p-1 rounded-xl border border-[#FF3B30]/30 shadow-xs">
                    <span className="text-[11px] text-[#FF3B30] font-semibold px-2">
                      Clear all?
                    </span>
                    <button
                      onClick={async () => {
                        await clearHistory();
                        setConfirmClear(false);
                      }}
                      className="px-2.5 py-1 bg-[#FF3B30] hover:bg-[#D70015] text-white rounded-lg text-xs font-semibold transition"
                    >
                      Yes, Clear
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 bg-[#E5E5EA] hover:bg-[#D1D1D6] text-[#1D1D1F] rounded-lg text-xs font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    aria-label="Clear All History"
                    title="Clear All History"
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#FFF2F2] text-[#FF3B30] rounded-xl text-xs font-semibold transition border border-black/[0.06] shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear History</span>
                  </button>
                )}
              </>
            )}

            {/* Back to Editor Button */}
            <button
              onClick={() => {
                setActiveTab('editor');
                window.location.hash = 'editor';
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#007AFF] hover:bg-[#0066CC] text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Back to Editor</span>
            </button>
          </div>
        </div>

        {/* Main Side-by-Side Area */}
        {filteredHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FFFFFF] border border-black/[0.06] rounded-3xl text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F]">
                {searchTerm ? 'No Matching Generations Found' : 'No Generation History Yet'}
              </h3>
              <p className="text-xs text-[#4B5563] mt-1 max-w-sm">
                {searchTerm
                  ? `No generations match "${searchTerm}". Try a different search query.`
                  : 'Start typing prompts in the editor. Every validated code generation will be preserved here locally in SQLite.'}
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('editor');
                window.location.hash = 'editor';
              }}
              className="px-4 py-2 bg-[#007AFF] hover:bg-[#0066CC] text-white rounded-xl text-xs font-semibold transition shadow-sm"
            >
              Start Generating Code
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-4 overflow-hidden">
            {/* Left Column: History Items List */}
            <div className="lg:w-[420px] shrink-0 flex flex-col h-full overflow-hidden bg-[#FFFFFF] border border-black/[0.08] rounded-3xl shadow-sm">
              <div className="px-4 py-3 border-b border-black/[0.06] flex items-center justify-between text-xs text-[#86868B] bg-[#FFFFFF]">
                <span className="font-semibold text-[#1D1D1F]">
                  Generation Entries ({filteredHistory.length})
                </span>
                <span className="text-[11px]">Hover to preview · Click to load</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {filteredHistory.map((item) => {
                  const isHovered = previewItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onClick={() => handleOpenInEditor(item)}
                      className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between group ${
                        isHovered
                          ? 'border-[#007AFF] ring-2 ring-[#007AFF]/20 bg-[#007AFF]/5 shadow-sm'
                          : 'bg-[#FFFFFF] border-black/[0.06] hover:border-[#007AFF]/50 hover:bg-[#F5F5F7]/60 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Top Metadata Row */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#007AFF]/10 text-[#0066CC] border border-[#007AFF]/20">
                              {item.detected_language || item.requested_language || 'code'}
                            </span>
                            <span className="text-[11px] text-[#86868B] flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.created_at)}
                            </span>
                          </div>

                          {/* Delete Item Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHistoryItem(item.id);
                            }}
                            aria-label="Delete history entry"
                            title="Delete this history entry"
                            className="p-1 text-[#86868B] hover:text-[#FF3B30] rounded-lg hover:bg-black/[0.05] transition opacity-40 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Prompt Snippet */}
                        <p className="text-xs font-semibold text-[#1D1D1F] line-clamp-2 leading-relaxed">
                          {item.prompt}
                        </p>
                      </div>

                      {/* Card Footer Badges */}
                      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-black/[0.04] text-[10px] text-[#86868B] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[#34C759] font-medium">
                            <ShieldCheck className="w-3 h-3 text-[#34C759]" />
                            AST Valid
                          </span>
                          <span>•</span>
                          <span>{item.tokens_generated} tokens</span>
                          <span>•</span>
                          <span>{item.duration_ms}ms</span>
                        </div>
                        <span className="text-[#007AFF] font-sans font-semibold group-hover:underline flex items-center gap-0.5 text-[11px]">
                          <span>Load</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Code Preview Panel */}
            <div className="flex-1 min-w-0 flex flex-col h-full bg-[#141416] border border-black/[0.08] rounded-3xl shadow-sm overflow-hidden text-white">
              {previewItem ? (
                <>
                  {/* Preview Header */}
                  <div className="p-4 bg-[#1A1A1C] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#007AFF] text-white">
                          {previewItem.detected_language || previewItem.requested_language || 'code'}
                        </span>
                        <span className="text-xs font-mono text-white/50">
                          Model: {previewItem.model_used || 'gemma3'}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-xs font-mono text-white/50 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {previewItem.duration_ms}ms ({previewItem.tokens_generated} tokens)
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white truncate" title={previewItem.prompt}>
                        {previewItem.prompt}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Copy Code */}
                      <button
                        onClick={() => handleCopyCode(previewItem.code)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition border border-white/10"
                        title="Copy code to clipboard"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#34C759]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {/* Primary Action: Load into Editor */}
                      <button
                        onClick={() => handleOpenInEditor(previewItem)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#007AFF] hover:bg-[#0066CC] text-white rounded-xl text-xs font-semibold shadow-sm transition"
                        title="Load this code into the editor workspace"
                      >
                        <span>Open in Editor</span>
                        <CornerDownLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Code View Body */}
                  <div
                    className="flex-1 p-4 overflow-auto font-mono text-xs text-[#F5F5F7] select-text bg-[#111113] leading-relaxed"
                    style={{ fontFamily: '"Courier New", Courier, monospace' }}
                  >
                    <pre className="m-0 whitespace-pre font-mono">
                      {previewItem.code}
                    </pre>
                  </div>

                  {/* Preview Footer Strip */}
                  <div className="px-4 py-2 bg-[#1A1A1C] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-white/50">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
                      <span>Syntax tree-sitter validated • Offline guaranteed</span>
                    </span>
                    <span>
                      Created: {new Date(previewItem.created_at).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-white/40 text-xs">
                  Hover or select an item on the left to preview its code
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
