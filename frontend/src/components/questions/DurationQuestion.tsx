'use client';

import React from 'react';
import { SupportedLanguage } from '../../lib/types';

interface Props {
  value: string;
  onChange: (val: string) => void;
  language: SupportedLanguage;
}

export const DurationQuestion: React.FC<Props> = ({ value, onChange, language }) => {
  const quickOptions = [
    { en: 'A few hours ago', hi: 'कुछ घंटे पहले', kn: 'ಕೆಲವು ಗಂಟೆಗಳ ಹಿಂದೆ' },
    { en: '1 - 2 days ago', hi: '1 - 2 दिन पहले', kn: '1 - 2 ದಿನಗಳ ಹಿಂದೆ' },
    { en: '3 - 7 days ago', hi: '3 - 7 दिन पहले', kn: '3 - 7 ದಿನಗಳ ಹಿಂದೆ' },
    { en: '1 - 4 weeks ago', hi: '1 - 4 सप्ताह पहले', kn: '1 - 4 ವಾರಗಳ ಹಿಂದೆ' },
    { en: 'More than 1 month', hi: '1 महीने से अधिक', kn: '1 ತಿಂಗಳಿಗಿಂತ ಹೆಚ್ಚು' },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickOptions.map((opt) => {
          const optText = opt[language] || opt.en;
          const isSelected = value.toLowerCase() === opt.en.toLowerCase() || value === optText;
          return (
            <button
              key={opt.en}
              type="button"
              onClick={() => onChange(optText)}
              className={`touch-btn min-h-[64px] rounded-2xl border-2 text-lg font-semibold flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-4 ring-teal-100'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-teal-500 hover:bg-slate-50'
              }`}
            >
              <span>{optText}</span>
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or type specific duration (e.g. Started suddenly this morning)..."
        className="touch-input text-lg mt-2"
      />
    </div>
  );
};
