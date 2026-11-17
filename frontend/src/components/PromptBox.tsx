import React, { useRef, useEffect } from 'react';
import { Send, Square, Sparkles, CornerDownLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { LanguageSelect } from './LanguageSelect';

export const PromptBox: React.FC = () => {
  const prompt = useAppStore((state) => state.prompt);
  const setPrompt = useAppStore((state) => state.setPrompt);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const generateCodeStream = useAppStore((state) => state.generateCodeStream);
  const stopGeneration = useAppStore((state) => state.stopGeneration);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && prompt.trim()) {
        generateCodeStream();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGenerating && prompt.trim()) {
      generateCodeStream();
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-black/[0.06] rounded-2xl p-4 shadow-sm transition-all focus-within:shadow-md focus-within:border-[#007AFF]/40">
      {/* Target Language Selector Bar */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" />
          <span className="text-xs font-semibold text-[#1D1D1F]">Target Language:</span>
        </div>
        <LanguageSelect />
      </div>

      {/* Input Field & Submit Action */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={textareaRef}
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the code you need... (e.g. 'Binary search in Python', 'Debounce hook in React TS', 'LRU Cache')"
          className="w-full bg-[#F5F5F7] text-[#1D1D1F] placeholder-[#86868B] text-sm rounded-xl px-4 py-3 pr-28 resize-none border border-transparent focus:outline-none focus:border-[#007AFF] focus:bg-[#FFFFFF] transition-all font-sans"
        />

        <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
          {isGenerating ? (
            <button
              type="button"
              onClick={stopGeneration}
              aria-label="Stop generation"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF3B30] hover:bg-[#D70015] text-white rounded-xl text-xs font-semibold shadow-sm transition"
              title="Stop generation"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!prompt.trim()}
              aria-label="Generate code"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#007AFF] hover:bg-[#0066CC] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]"
              title="Generate clean code (Enter)"
            >
              <span>Generate</span>
              <CornerDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center justify-end mt-2 text-[11px] text-[#86868B]">
        <span className="hidden sm:inline">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[#E5E5EA] border border-black/[0.04] text-[#1D1D1F] font-mono text-[10px]">Enter</kbd> to generate, <kbd className="px-1.5 py-0.5 rounded bg-[#E5E5EA] border border-black/[0.04] text-[#1D1D1F] font-mono text-[10px]">Shift+Enter</kbd> for newline
        </span>
      </div>
    </div>
  );
};
