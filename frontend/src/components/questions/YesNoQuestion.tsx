'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { SupportedLanguage } from '../../lib/types';

interface Props {
  value: string;
  onChange: (val: string) => void;
  language: SupportedLanguage;
}

export const YesNoQuestion: React.FC<Props> = ({ value, onChange, language }) => {
  const yesLabel = language === 'hi' ? 'हाँ (Yes)' : language === 'kn' ? 'ಹೌದು (Yes)' : 'Yes';
  const noLabel = language === 'hi' ? 'नहीं (No)' : language === 'kn' ? 'ಇಲ್ಲ (No)' : 'No';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      <button
        type="button"
        onClick={() => onChange('Yes')}
        className={`touch-btn min-h-[80px] rounded-2xl border-2 text-xl font-bold flex items-center justify-center gap-3 transition-all ${
          value.toLowerCase() === 'yes'
            ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-4 ring-teal-100'
            : 'bg-white text-slate-800 border-slate-300 hover:border-teal-500 hover:bg-slate-50'
        }`}
      >
        <CheckCircle2 className="w-7 h-7" />
        <span>{yesLabel}</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('No')}
        className={`touch-btn min-h-[80px] rounded-2xl border-2 text-xl font-bold flex items-center justify-center gap-3 transition-all ${
          value.toLowerCase() === 'no'
            ? 'bg-slate-800 text-white border-slate-900 shadow-md ring-4 ring-slate-200'
            : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-50'
        }`}
      >
        <XCircle className="w-7 h-7" />
        <span>{noLabel}</span>
      </button>
    </div>
  );
};
