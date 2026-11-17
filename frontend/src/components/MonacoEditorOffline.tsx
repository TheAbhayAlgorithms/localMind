import React, { useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import {
  Copy,
  Check,
  Download,
  BookmarkPlus,
  Play,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Clock,
  Terminal,
  X,
  History,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

// Point monaco-react directly to the locally bundled instance (zero CDN requests)
loader.config({ monaco });

// Define Apple Bento Dark Monaco Editor Theme
if (monaco && monaco.editor) {
  monaco.editor.defineTheme('localmind-bento-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'f5f5f7', background: '1d1d1f' },
      { token: 'keyword', foreground: 'ff7ab2', fontStyle: 'italic' },
      { token: 'keyword.control', foreground: 'ff7ab2', fontStyle: 'italic' },
      { token: 'keyword.operator', foreground: '5fc9f8' },
      { token: 'storage', foreground: 'ff7ab2', fontStyle: 'italic' },
      { token: 'storage.type', foreground: '66d9ef', fontStyle: 'italic' },
      { token: 'storage.modifier', foreground: 'ff7ab2', fontStyle: 'italic' },
      { token: 'comment', foreground: '86868b', fontStyle: 'italic' },
      { token: 'comment.doc', foreground: '98989d', fontStyle: 'italic' },
      { token: 'string', foreground: '34c759' },
      { token: 'string.escape', foreground: '5fc9f8' },
      { token: 'number', foreground: 'ff9f0a' },
      { token: 'function', foreground: '64d2ff' },
      { token: 'function.declaration', foreground: '64d2ff', fontStyle: 'bold' },
      { token: 'type', foreground: '40c8ae' },
      { token: 'variable', foreground: 'f5f5f7' },
      { token: 'variable.parameter', foreground: 'ff9f0a', fontStyle: 'italic' },
      { token: 'constant', foreground: 'ff9f0a' },
      { token: 'delimiter', foreground: '86868b' },
    ],
    colors: {
      'editor.background': '#1D1D1F',
      'editor.foreground': '#F5F5F7',
      'editor.lineHighlightBackground': '#2C2C2E60',
      'editor.lineHighlightBorder': '#00000000',
      'editorLineNumber.foreground': '#636366',
      'editorLineNumber.activeForeground': '#007AFF',
      'editorCursor.foreground': '#007AFF',
      'editor.selectionBackground': '#007AFF33',
      'editor.inactiveSelectionBackground': '#3A3A3C40',
      'editorIndentGuide.background': '#3A3A3C40',
      'editorIndentGuide.activeBackground': '#007AFF50',
      'scrollbarSlider.background': '#3A3A3C80',
      'scrollbarSlider.hoverBackground': '#48484A',
      'scrollbarSlider.activeBackground': '#636366',
    },
  });
}

export const MonacoEditorOffline: React.FC = () => {
  const code = useAppStore((state) => state.code);
  const setCode = useAppStore((state) => state.setCode);
  const detectedLanguage = useAppStore((state) => state.detectedLanguage);
  const fileExtension = useAppStore((state) => state.fileExtension);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const generationStatus = useAppStore((state) => state.generationStatus);
  const isSyntaxValid = useAppStore((state) => state.isSyntaxValid);
  const syntaxError = useAppStore((state) => state.syntaxError);
  const retryCount = useAppStore((state) => state.retryCount);
  const durationMs = useAppStore((state) => state.durationMs);
  const tokensGenerated = useAppStore((state) => state.tokensGenerated);
  const activeModel = useAppStore((state) => state.activeModel);
  const settings = useAppStore((state) => state.settings);
  const errorMessage = useAppStore((state) => state.errorMessage);
  const errorActionLabel = useAppStore((state) => state.errorActionLabel);
  const setErrorMessage = useAppStore((state) => state.setErrorMessage);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  const saveCurrentSnippet = useAppStore((state) => state.saveCurrentSnippet);
  const generateCodeStream = useAppStore((state) => state.generateCodeStream);
  const runCode = useAppStore((state) => state.runCode);
  const isRunningCode = useAppStore((state) => state.isRunningCode);
  const toggleHistory = useAppStore((state) => state.toggleHistory);
  const isConsoleOpen = useAppStore((state) => state.isConsoleOpen);
  const setIsConsoleOpen = useAppStore((state) => state.setIsConsoleOpen);

  const [copied, setCopied] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetTags, setSnippetTags] = useState('');

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offline_code_${Date.now()}.${fileExtension || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetTitle.trim()) return;
    await saveCurrentSnippet(snippetTitle, snippetTags);
    setSaveModalOpen(false);
    setSnippetTitle('');
    setSnippetTags('');
  };

  // Map language name for Monaco editor
  const getMonacoLang = (lang: string): string => {
    const l = (lang || '').toLowerCase();
    if (l === 'python' || l === 'py') return 'python';
    if (l === 'javascript' || l === 'js') return 'javascript';
    if (l === 'typescript' || l === 'ts') return 'typescript';
    if (l === 'html') return 'html';
    if (l === 'css') return 'css';
    if (l === 'json') return 'json';
    if (l === 'c') return 'c';
    if (l === 'cpp' || l === 'c++') return 'cpp';
    if (l === 'go') return 'go';
    if (l === 'rust' || l === 'rs') return 'rust';
    if (l === 'java') return 'java';
    if (l === 'sql') return 'sql';
    if (l === 'bash' || l === 'sh') return 'shell';
    return 'plaintext';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1D1D1F] border border-black/[0.08] rounded-2xl overflow-hidden shadow-sm">
      {/* Editor Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#242426] border-b border-white/[0.08] gap-2">
        <div className="flex items-center gap-3">
          {/* History Button */}
          <button
            onClick={toggleHistory}
            aria-label="Toggle History"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white/90 rounded-lg text-xs border border-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]"
            title="Open Generation History"
          >
            <History className="w-3.5 h-3.5 text-[#007AFF]" />
            <span className="hidden sm:inline">History</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34C759] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              {detectedLanguage || 'Code'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-white/80 font-mono">
              .{fileExtension || 'txt'}
            </span>
          </div>

          {/* Tree-Sitter Validation Status */}
          {code && (
            <div className="flex items-center gap-1.5 text-xs">
              {isSyntaxValid ? (
                <span className="flex items-center gap-1 text-[#34C759] bg-[#34C759]/15 px-2.5 py-0.5 rounded-full border border-[#34C759]/30 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
                  Valid Syntax
                </span>
              ) : (
                <span
                  className="flex items-center gap-1 text-[#FF9500] bg-[#FF9500]/15 px-2.5 py-0.5 rounded-full border border-[#FF9500]/30 font-medium"
                  title={syntaxError || 'Syntax warning'}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-[#FF9500]" />
                  Syntax Check Failed {retryCount > 0 && `(Retried ${retryCount}x)`}
                </span>
              )}
            </div>
          )}

          {/* Telemetry Stats */}
          {tokensGenerated > 0 && (
            <div className="hidden sm:flex items-center gap-3 text-xs text-white/60 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/40" />
                {durationMs}ms
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-white/40" />
                {tokensGenerated} tok
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Sandboxed Run button */}
          <button
            onClick={runCode}
            disabled={!code || isGenerating || isRunningCode}
            aria-label="Run Code"
            title={
              settings.allow_code_execution
                ? 'Run in isolated local subprocess'
                : 'Execution disabled in Settings'
            }
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] ${
              settings.allow_code_execution && code
                ? 'bg-[#007AFF] hover:bg-[#0066CC] text-white shadow-sm'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunningCode ? 'animate-spin' : ''}`} />
            <span>{isRunningCode ? 'Running...' : 'Run'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!code}
            aria-label="Copy Code"
            className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white/90 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs border border-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!code}
            aria-label="Download Code as File"
            className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white/90 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs border border-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]"
            title="Download as File"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download</span>
          </button>

          {/* Save Snippet Button */}
          <button
            onClick={() => setSaveModalOpen(true)}
            disabled={!code}
            aria-label="Save to Snippets"
            className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white/90 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs border border-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]"
            title="Save to Snippets"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-[#007AFF]" />
            <span className="hidden md:inline">Save</span>
          </button>

          {/* Regenerate Button */}
          <button
            onClick={generateCodeStream}
            disabled={isGenerating}
            aria-label="Regenerate Code"
            className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white/90 rounded-lg text-xs transition border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]"
            title="Regenerate"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* User-visible Error Banner */}
      {errorMessage && (
        <div className="bg-[#FF3B30]/15 border-b border-[#FF3B30]/30 px-4 py-2.5 flex items-center justify-between text-xs text-[#FF3B30]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#FF3B30] shrink-0" />
            <span className="font-medium text-white">{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            {errorActionLabel && (
              <button
                onClick={() => {
                  if (errorActionLabel === 'Open Models Tab') {
                    setActiveTab('models');
                    window.location.hash = 'models';
                  }
                }}
                className="px-2.5 py-1 bg-[#FF3B30] hover:bg-[#D70015] text-white rounded-lg text-[11px] font-semibold transition shadow-sm"
              >
                {errorActionLabel}
              </button>
            )}
            <button
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
              className="p-1 text-white/60 hover:text-white rounded"
              title="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Generation Status Banner */}
      {isGenerating && (
        <div className="bg-[#007AFF]/15 border-b border-[#007AFF]/25 px-4 py-2 flex items-center justify-between text-xs text-[#007AFF]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
            <span className="font-medium text-white">
              {generationStatus || 'Generating with local Gemma...'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-white/60">
            Model: <span className="text-white font-semibold">{activeModel}</span>
          </span>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div className="flex-1 min-h-[350px] relative">
        <Editor
          height="100%"
          language={getMonacoLang(detectedLanguage)}
          value={code || '// Ready. Type your prompt below to generate clean code.\n// Zero prose, zero internet access.'}
          onChange={(val) => setCode(val || '')}
          theme="localmind-bento-dark"
          options={{
            readOnly: isGenerating,
            minimap: { enabled: true, side: 'right' },
            fontSize: 13.5,
            fontFamily: '"Courier New", Courier, monospace',
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Save Snippet Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#FFFFFF] border border-black/[0.08] rounded-3xl p-6 w-full max-w-md shadow-2xl text-[#1D1D1F]">
            <h3 className="text-base font-bold text-[#1D1D1F] mb-3 flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-[#007AFF]" />
              Save Code Snippet to Local SQLite
            </h3>
            <form onSubmit={handleSaveSnippet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binary Search in Python"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-sm text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF] focus:bg-white font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. algorithms, search, python"
                  value={snippetTags}
                  onChange={(e) => setSnippetTags(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-sm text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF] focus:bg-white font-sans"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2 bg-[#E5E5EA] hover:bg-[#D1D1D6] text-[#1D1D1F] rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007AFF] hover:bg-[#0066CC] text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Save Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
