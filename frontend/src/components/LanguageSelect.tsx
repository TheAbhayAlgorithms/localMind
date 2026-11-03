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
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
};
