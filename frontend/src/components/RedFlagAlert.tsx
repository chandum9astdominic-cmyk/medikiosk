'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { SupportedLanguage } from '../lib/types';
import { translations } from '../lib/i18n';

interface Props {
  language: SupportedLanguage;
  message?: string;
}

export const RedFlagAlert: React.FC<Props> = ({ language, message }) => {
  const t = translations[language];

  return (
    <div className="w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm text-amber-950 flex items-start gap-4 animate-in fade-in duration-200" role="alert">
      <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 flex-shrink-0">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-lg text-amber-900">{t.redFlagTitle}</h4>
        <p className="text-base text-amber-800 mt-1 leading-relaxed">
          {message || t.redFlagMessage}
        </p>
      </div>
    </div>
  );
};
