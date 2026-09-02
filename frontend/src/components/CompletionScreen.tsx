'use client';

import React from 'react';
import { CheckCircle, ShieldCheck, Heart, Home, ArrowRight } from 'lucide-react';
import { SupportedLanguage } from '../lib/types';
import { translations } from '../lib/i18n';

interface Props {
  language: SupportedLanguage;
  onRestart: () => void;
}

export const CompletionScreen: React.FC<Props> = ({ language, onRestart }) => {
  const t = translations[language];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center gap-8 py-8 animate-in zoom-in-95 duration-300">
      {/* Big Success Icon */}
      <div className="w-28 h-28 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shadow-lg shadow-emerald-700/15 ring-8 ring-emerald-50">
        <CheckCircle className="w-16 h-16" />
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.completionTitle}
        </h2>
        <p className="text-2xl text-teal-800 font-semibold">
          {t.completionSubtitle}
        </p>
      </div>

      {/* Next Steps Box */}
      <div className="w-full bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-sm text-left space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-2xl bg-teal-50 text-teal-700 mt-1 flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-xl text-slate-900">Next Step: Doctor Consultation</h4>
            <p className="text-lg text-slate-700 mt-1 leading-relaxed">
              {t.completionInstruction}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 leading-normal flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>{t.completionNote}</span>
        </div>
      </div>

      {/* Finish / Return to Start */}
      <div className="w-full pt-2">
        <button
          type="button"
          onClick={onRestart}
          className="touch-btn-primary w-full min-h-[76px] text-2xl font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-teal-800/20"
        >
          <Home className="w-7 h-7" />
          <span>{t.startNewSessionBtn}</span>
        </button>
      </div>
    </div>
  );
};
