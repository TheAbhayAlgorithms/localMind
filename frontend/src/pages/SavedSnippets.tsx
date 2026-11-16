import React, { useState } from 'react';
import {
  BookmarkCheck,
  Search,
  Trash2,
  Copy,
  Check,
  Download,
  Code2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useAppStore, SnippetEntry } from '../store/useAppStore';

export const SavedSnippets: React.FC = () => {
  const snippets = useAppStore((state) => state.snippets);
  const snippetSearch = useAppStore((state) => state.snippetSearch);
  const setSnippetSearch = useAppStore((state) => state.setSnippetSearch);
  const deleteSnippet = useAppStore((state) => state.deleteSnippet);
  const setCode = useAppStore((state) => state.setCode);
  const setPrompt = useAppStore((state) => state.setPrompt);
  const setSelectedLanguage = useAppStore((state) => state.setSelectedLanguage);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = async (id: number, code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (snippet: SnippetEntry) => {
    const blob = new Blob([snippet.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippet.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.${snippet.language || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadInEditor = (snippet: SnippetEntry) => {
    setCode(snippet.code);
    if (snippet.prompt) setPrompt(snippet.prompt);
    setSelectedLanguage(snippet.language || 'Auto');
    setActiveTab('editor');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shadow-sm">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
              Saved Snippets Library
            </h2>
          </div>
          <p className="text-xs text-[#4B5563] mt-1 font-medium">
            Your personal collection of verified, offline-generated code snippets stored locally in SQLite.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-[#86868B]" />
          <input
            type="text"
            placeholder="Search saved snippets..."
            value={snippetSearch}
            onChange={(e) => setSnippetSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-black/[0.06] text-xs text-[#1D1D1F] placeholder-[#86868B] rounded-xl pl-9 pr-3 py-2 shadow-sm focus:outline-none focus:border-[#007AFF] font-sans transition-all"
          />
        </div>
      </div>

      {/* Snippet Grid */}
      {snippets.length === 0 ? (
        <div className="tile p-12 text-center text-xs text-[#86868B] bg-[#FFFFFF] border-black/[0.06]">
          No snippets saved yet. Click the "Save" button in the editor toolbar to store code snippets here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {snippets.map((snip) => (
            <div
              key={snip.id}
              className="tile bg-[#FFFFFF] border border-black/[0.06] shadow-sm hover:scale-[1.02] hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base text-[#1D1D1F] line-clamp-1">
                    {snip.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#F5F5F7] text-[#0066CC] font-mono text-[11px] border border-black/[0.06] uppercase font-semibold">
                    {snip.language}
                  </span>
                </div>

                {snip.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {snip.tags.split(',').map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#4B5563] border border-black/[0.04] font-medium"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Code preview block (Courier New) */}
                <div
                  className="bg-[#F5F5F7] p-3 rounded-xl border border-black/[0.04] font-mono text-[11px] text-[#1D1D1F] max-h-36 overflow-hidden relative"
                  style={{ fontFamily: '"Courier New", Courier, monospace' }}
                >
                  <pre className="whitespace-pre font-mono">{snip.code.slice(0, 300)}</pre>
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Actions toolbar */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.06] text-xs">
                <button
                  onClick={() => handleLoadInEditor(snip)}
                  className="flex items-center gap-1.5 text-[#007AFF] hover:text-[#0066CC] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Open in Editor</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(snip.id, snip.code)}
                    aria-label="Copy snippet code"
                    className="p-1.5 text-[#4B5563] hover:text-[#1D1D1F] rounded-lg hover:bg-[#F5F5F7] transition"
                    title="Copy code"
                  >
                    {copiedId === snip.id ? (
                      <Check className="w-3.5 h-3.5 text-[#34C759]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDownload(snip)}
                    aria-label="Download snippet code"
                    className="p-1.5 text-[#4B5563] hover:text-[#1D1D1F] rounded-lg hover:bg-[#F5F5F7] transition"
                    title="Download code"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteSnippet(snip.id)}
                    aria-label="Delete snippet"
                    className="p-1.5 text-[#86868B] hover:text-[#FF3B30] rounded-lg hover:bg-[#F5F5F7] transition"
                    title="Delete snippet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
