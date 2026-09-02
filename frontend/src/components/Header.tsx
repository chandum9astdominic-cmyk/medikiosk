'use client';

import React from 'react';
import { Activity, Globe, AlertTriangle } from 'lucide-react';
import { SupportedLanguage } from '../lib/types';
import { translations } from '../lib/i18n';
import { AccessibilityToolbar } from './AccessibilityToolbar';

interface Props {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isLargeText: boolean;
  isHighContrast: boolean;
  onToggleLargeText: () => void;
  onToggleHighContrast: () => void;
  showLanguageSelector?: boolean;
}

export const Header: React.FC<Props> = ({
  language,
  onLanguageChange,
  isLargeText,
  isHighContrast,
  onToggleLargeText,
  onToggleHighContrast,
  showLanguageSelector = true,
}) => {
  const t = translations[language];

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      {/* Emergency Advisory Strip */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1 text-sm font-medium flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="text-center">{t.emergencyNotice}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-md">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.appName}</h1>
              <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                Ayush / Healthcare
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">{t.appTagline}</p>
          </div>
        </div>

        {/* Right Controls: Accessibility & Language */}
        <div className="flex items-center gap-3">
          <AccessibilityToolbar
            language={language}
            isLargeText={isLargeText}
            isHighContrast={isHighContrast}
            onToggleLargeText={onToggleLargeText}
            onToggleHighContrast={onToggleHighContrast}
          />

          {showLanguageSelector && (
            <div className="relative">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    language === 'en' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => onLanguageChange('hi')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    language === 'hi' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => onLanguageChange('kn')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    language === 'kn' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ಕನ್ನಡ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
