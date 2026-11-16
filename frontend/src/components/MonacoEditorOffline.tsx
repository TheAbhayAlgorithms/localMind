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

// Define Black & White / Grayscale Monaco Editor Theme
if (monaco && monaco.editor) {
  monaco.editor.defineTheme('monochrome-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'e5e5e5', background: '000000' },
      { token: 'keyword', foreground: 'ffffff', fontStyle: 'bold' },
      { token: 'identifier', foreground: 'f0f0f0' },
      { token: 'string', foreground: 'd4d4d4' },
      { token: 'number', foreground: 'e5e5e5' },
      { token: 'comment', foreground: '737373', fontStyle: 'italic' },
      { token: 'type', foreground: 'ffffff' },
      { token: 'delimiter', foreground: 'a3a3a3' },
      { token: 'tag', foreground: 'ffffff', fontStyle: 'bold' },
      { token: 'attribute.name', foreground: 'd4d4d4' },
      { token: 'attribute.value', foreground: 'cccccc' },
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#f0f0f0',
      'editor.lineHighlightBackground': '#111111',
      'editor.lineHighlightBorder': '#222222',
      'editorLineNumber.foreground': '#525252',
      'editorLineNumber.activeForeground': '#ffffff',
      'editorCursor.foreground': '#ffffff',
      'editor.selectionBackground': '#2e2e2e',
      'editor.inactiveSelectionBackground': '#1a1a1a',
      'editorIndentGuide.background': '#181818',
      'editorIndentGuide.activeBackground': '#333333',
      'scrollbarSlider.background': '#26262680',
      'scrollbarSlider.hoverBackground': '#404040a0',
      'scrollbarSlider.activeBackground': '#666666c0',
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
    <div className="flex-1 flex flex-col h-full bg-black border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
              {detectedLanguage || 'Code'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 font-mono border border-neutral-800">
              .{fileExtension || 'txt'}
            </span>
          </div>

          {/* Validation Status Indicator */}
          {code && (
            <div className="flex items-center gap-1.5 text-xs">
              {isSyntaxValid ? (
                <span className="flex items-center gap-1 text-neutral-200 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  Tree-Sitter: Valid Syntax
                </span>
              ) : (
                <span
                  className="flex items-center gap-1 text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700"
                  title={syntaxError || 'Syntax warning'}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
                  Syntax Check Failed {retryCount > 0 && `(Retried ${retryCount}x)`}
                </span>
              )}
            </div>
          )}

          {/* Generation Stats */}
          {tokensGenerated > 0 && (
            <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                {durationMs}ms
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-neutral-500" />
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
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition ${
              settings.allow_code_execution && code
                ? 'bg-white hover:bg-neutral-200 text-black shadow-sm'
                : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunningCode ? 'animate-spin' : ''}`} />
            <span>{isRunningCode ? 'Running...' : 'Run'}</span>
          </button>

          {/* Console drawer toggle */}
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition border ${
              isConsoleOpen
                ? 'bg-neutral-800 text-white border-neutral-700'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'
            }`}
            title="Toggle Run Console Output"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!code}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-md text-xs border border-neutral-800 transition"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!code}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-md text-xs border border-neutral-800 transition"
            title="Download as File"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download</span>
          </button>

          {/* Save Snippet Button */}
          <button
            onClick={() => setSaveModalOpen(true)}
            disabled={!code}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-md text-xs border border-neutral-800 transition"
            title="Save to Snippets"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Save</span>
          </button>

          {/* Regenerate Button */}
          <button
            onClick={generateCodeStream}
            disabled={isGenerating}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-md text-xs transition border border-neutral-700"
            title="Regenerate"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* User-visible Error Banner */}
      {errorMessage && (
        <div className="bg-neutral-900 border-b border-neutral-700 px-4 py-2.5 flex items-center justify-between text-xs text-neutral-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
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
                className="px-2.5 py-1 bg-white hover:bg-neutral-200 text-black rounded text-[11px] font-semibold transition shadow-sm"
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
        <div className="bg-neutral-950 border-b border-neutral-800 px-4 py-1.5 flex items-center justify-between text-xs text-neutral-300 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" />
            <span>{generationStatus || 'Generating with local Gemma...'}</span>
          </div>
          <span className="font-mono text-[11px] text-neutral-500">Model: {activeModel}</span>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div className="flex-1 min-h-[350px] relative">
        <Editor
          height="100%"
          language={getMonacoLang(detectedLanguage)}
          value={code || '// Ready. Type your prompt below to generate clean code.\n// Zero prose, zero internet access.'}
          onChange={(val) => setCode(val || '')}
          theme="monochrome-dark"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-white" />
              Save Code Snippet to Local SQLite
            </h3>
            <form onSubmit={handleSaveSnippet} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binary Search in Python"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 font-typing"
                  style={{
                    fontFamily: '"Anthropic Serif", "Tiempos Text", "Iowan Old Style", "Apple Garamond", Baskerville, "Times New Roman", Georgia, serif',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. algorithms, search, python"
                  value={snippetTags}
                  onChange={(e) => setSnippetTags(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 font-typing"
                  style={{
                    fontFamily: '"Anthropic Serif", "Tiempos Text", "Iowan Old Style", "Apple Garamond", Baskerville, "Times New Roman", Georgia, serif',
                  }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg text-xs border border-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-semibold shadow-sm transition"
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

