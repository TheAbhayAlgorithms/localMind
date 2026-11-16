import React from 'react';
import { useAppStore } from '../store/useAppStore';

const LANGUAGES = [
  'Auto',
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C',
  'C++',
  'Go',
  'Rust',
  'SQL',
  'HTML/CSS',
  'Bash',
];

export const LanguageSelect: React.FC = () => {
  const selectedLanguage = useAppStore((state) => state.selectedLanguage);
  const setSelectedLanguage = useAppStore((state) => state.setSelectedLanguage);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
      {LANGUAGES.map((lang) => {
        const isSelected = selectedLanguage.toLowerCase() === lang.toLowerCase();
        return (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            type="button"
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-white text-black font-semibold shadow-sm ring-1 ring-neutral-300'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
};

