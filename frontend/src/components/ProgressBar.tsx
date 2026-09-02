'use client';

import React from 'react';
import { SupportedLanguage } from '../lib/types';
import { translations } from '../lib/i18n';

interface Props {
  percentage: number;
  language: SupportedLanguage;
  section?: string | null;
}

export const ProgressBar: React.FC<Props> = ({ percentage, language, section }) => {
  const t = translations[language];
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
        <span className="flex items-center gap-2 font-semibold">
          <span>{t.questionProgress}</span>
          {section && (
            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-xs">
              {section}
            </span>
          )}
        </span>
        <span className="text-teal-700 font-bold">{clampedPercentage}%</span>
      </div>

      {/* Progress Bar track */}
      <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200">
        <div
          className="bg-teal-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedPercentage}%` }}
          role="progressbar"
          aria-valuenow={clampedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <p className="text-[11px] text-slate-400 mt-1.5 text-right">
        Questionnaire completion indicator only (non-diagnostic)
      </p>
    </div>
  );
};
