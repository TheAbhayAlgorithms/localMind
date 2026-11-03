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
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

// Point monaco-react directly to the locally bundled instance (zero CDN requests)
loader.config({ monaco });

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
    <div className="flex-1 flex flex-col h-full bg-[#0d131f] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {detectedLanguage || 'Code'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              .{fileExtension || 'txt'}
            </span>
          </div>

          {/* Validation Status Indicator */}
          {code && (
            <div className="flex items-center gap-1.5 text-xs">
              {isSyntaxValid ? (
                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tree-Sitter: Valid Syntax
                </span>
              ) : (
                <span
                  className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                  title={syntaxError || 'Syntax warning'}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Syntax Check Failed {retryCount > 0 && `(Retried ${retryCount}x)`}
                </span>
              )}
            </div>
          )}

          {/* Generation Stats */}
          {tokensGenerated > 0 && (
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {durationMs}ms
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-slate-500" />
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
            title={
              settings.allow_code_execution
                ? 'Run in isolated local subprocess'
                : 'Execution disabled in Settings'
            }
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition ${
              settings.allow_code_execution && code
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunningCode ? 'animate-spin' : ''}`} />
            <span>{isRunningCode ? 'Running...' : 'Run'}</span>
          </button>

          {/* Console drawer toggle */}
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition ${
              isConsoleOpen ? 'bg-slate-700 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
            title="Toggle Run Console Output"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!code}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs transition"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!code}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs transition"
            title="Download as File"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download</span>
          </button>

          {/* Save Snippet Button */}
          <button
            onClick={() => setSaveModalOpen(true)}
            disabled={!code}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs transition"
            title="Save to Snippets"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Save</span>
          </button>

          {/* Regenerate Button */}
          <button
            onClick={generateCodeStream}
            disabled={isGenerating}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-md text-xs transition border border-indigo-500/30"
            title="Regenerate"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* User-visible Error Banner */}
      {errorMessage && (
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
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
                className="px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded text-[11px] font-semibold transition shadow-sm"
              >
                {errorActionLabel}
              </button>
            )}
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:text-white rounded"
              title="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Generation Status Banner */}
      {isGenerating && (
        <div className="bg-indigo-950/70 border-b border-indigo-800/40 px-4 py-1.5 flex items-center justify-between text-xs text-indigo-300 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>{generationStatus || 'Generating with local Gemma...'}</span>
          </div>
          <span className="font-mono text-[11px] opacity-75">Model: {activeModel}</span>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div className="flex-1 min-h-[350px] relative">
        <Editor
          height="100%"
          language={getMonacoLang(detectedLanguage)}
          value={code || '// Ready. Type your prompt below to generate clean code.\n// Zero prose, zero internet access.'}
          onChange={(val) => setCode(val || '')}
          theme="vs-dark"
          options={{
            readOnly: isGenerating,
            minimap: { enabled: true, side: 'right' },
            fontSize: 13.5,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-indigo-400" />
              Save Code Snippet to Local SQLite
            </h3>
            <form onSubmit={handleSaveSnippet} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binary Search in Python"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. algorithms, search, python"
                  value={snippetTags}
                  onChange={(e) => setSnippetTags(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-sm"
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

