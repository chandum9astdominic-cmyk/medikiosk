'use client';

import React from 'react';
import { Globe, Check } from 'lucide-react';
import { SupportedLanguage } from '../lib/types';
import { translations } from '../lib/i18n';

interface Props {
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onProceed: () => void;
}

export const LanguageSelector: React.FC<Props> = ({
  selectedLanguage,
  onSelectLanguage,
  onProceed,
}) => {
  const t = translations[selectedLanguage];

  const languages: { code: SupportedLanguage; title: string; native: string; subtitle: string }[] = [
    {
      code: 'en',
      title: 'English',
      native: 'English',
      subtitle: 'Continue intake in English',
    },
    {
      code: 'hi',
      title: 'Hindi',
      native: 'हिन्दी',
      subtitle: 'हिन्दी में स्वास्थ्य विवरण दें',
    },
    {
      code: 'kn',
      title: 'Kannada',
      native: 'ಕನ್ನಡ',
      subtitle: 'ಕನ್ನಡದಲ್ಲಿ ಮಾಹಿತಿ ನೀಡಿ',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 text-center animate-in fade-in duration-300">
      <div>
        <div className="w-16 h-16 bg-teal-100 text-teal-800 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Globe className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          {t.selectLanguage}
        </h2>
        <p className="text-slate-600 text-lg mt-2">
          Touch your preferred language to proceed with your intake.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {languages.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onSelectLanguage(lang.code)}
              className={`touch-btn min-h-[90px] p-6 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${
                isSelected
                  ? 'bg-teal-700 text-white border-teal-800 shadow-lg ring-4 ring-teal-100 scale-[1.01]'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-teal-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{lang.native}</span>
                <span className={`text-sm mt-0.5 ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                  {lang.subtitle} ({lang.title})
                </span>
              </div>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                isSelected ? 'bg-white text-teal-800 border-white' : 'border-slate-300'
              }`}>
                {isSelected && <Check className="w-5 h-5" />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onProceed}
        className="touch-btn-primary min-h-[72px] text-xl font-bold rounded-2xl w-full mt-2"
      >
        {t.nextBtn}
      </button>
    </div>
  );
};
