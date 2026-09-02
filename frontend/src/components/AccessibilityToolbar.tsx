'use client';

import React from 'react';
import { Type, Eye } from 'lucide-react';
import { SupportedLanguage } from '../lib/types';
import { translations } from '../lib/i18n';

interface Props {
  language: SupportedLanguage;
  isLargeText: boolean;
  isHighContrast: boolean;
  onToggleLargeText: () => void;
  onToggleHighContrast: () => void;
}

export const AccessibilityToolbar: React.FC<Props> = ({
  language,
  isLargeText,
  isHighContrast,
  onToggleLargeText,
  onToggleHighContrast,
}) => {
  const t = translations[language];

  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
      <button
        onClick={onToggleLargeText}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isLargeText ? 'bg-teal-100 text-teal-900 border border-teal-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
        aria-label="Toggle larger font size"
      >
        <Type className="w-4 h-4" />
        <span>{isLargeText ? t.largeText : t.normalText}</span>
      </button>

      <button
        onClick={onToggleHighContrast}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isHighContrast ? 'bg-yellow-300 text-black border border-black font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
        aria-label="Toggle high contrast mode"
      >
        <Eye className="w-4 h-4" />
        <span>{t.highContrast}</span>
      </button>
    </div>
  );
};
