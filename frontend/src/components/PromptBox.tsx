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
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 shadow-2xl transition-all focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-700">
      {/* Language Selector Bar */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-400">Target Language:</span>
        </div>
        <LanguageSelect />
      </div>

      {/* Input Field & Buttons */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={textareaRef}
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type what code you need... (e.g. 'Binary search in Python', 'Debounce hook in React TS', 'LRU Cache')"
          className="w-full bg-neutral-900 text-white placeholder-neutral-500 text-base leading-relaxed rounded-lg px-4 py-3 pr-28 resize-none border border-neutral-800 focus:outline-none focus:border-neutral-500 font-typing"
          style={{
            fontFamily: '"Anthropic Serif", "Tiempos Text", "Iowan Old Style", "Apple Garamond", Baskerville, "Times New Roman", Georgia, serif',
          }}
        />

        <div className="absolute right-2 bottom-3 flex items-center gap-1.5">
          {isGenerating ? (
            <button
              type="button"
              onClick={stopGeneration}
              className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 rounded-lg text-xs font-medium shadow-md transition"
              title="Stop generation"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed text-black rounded-lg text-xs font-semibold shadow-md transition"
              title="Generate clean code (Enter)"
            >
              <span>Generate</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500">
        <span>Zero prose, zero network egress. Strictly executable code blocks.</span>
        <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">Enter</kbd> to generate, <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">Shift+Enter</kbd> for newline</span>
      </div>
    </div>
  );
};

