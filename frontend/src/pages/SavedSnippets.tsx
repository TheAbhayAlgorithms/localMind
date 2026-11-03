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
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-400" />
            Saved Snippets Library
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your personal collection of verified, offline-generated code snippets stored locally in SQLite.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search saved snippets..."
            value={snippetSearch}
            onChange={(e) => setSnippetSearch(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Snippet Grid */}
      {snippets.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500">
          No snippets saved yet. Click the "Save" button in the editor toolbar to add code snippets here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {snippets.map((snip) => (
            <div
              key={snip.id}
              className="bg-[#0f172a] border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between shadow-lg transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm text-slate-100 line-clamp-1">
                    {snip.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-400 font-mono text-[11px] border border-indigo-900/50 uppercase">
                    {snip.language}
                  </span>
                </div>

                {snip.tags && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {snip.tags.split(',').map((t, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Code preview block */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[11px] text-slate-300 max-h-36 overflow-hidden relative">
                  <pre className="whitespace-pre">{snip.code.slice(0, 300)}</pre>
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Actions toolbar */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => handleLoadInEditor(snip)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Editor</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(snip.id, snip.code)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                    title="Copy code"
                  >
                    {copiedId === snip.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDownload(snip)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                    title="Download code"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteSnippet(snip.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
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
