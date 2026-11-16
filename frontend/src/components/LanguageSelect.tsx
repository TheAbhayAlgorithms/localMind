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
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all duration-150 ${
              isSelected
                ? 'bg-[#007AFF] text-white font-semibold shadow-sm scale-[1.02]'
                : 'bg-[#FFFFFF] hover:bg-[#E5E5EA] text-[#4B5563] hover:text-[#1D1D1F] border border-black/[0.06] font-medium'
            }`}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
};
