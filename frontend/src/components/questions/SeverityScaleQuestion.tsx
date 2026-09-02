'use client';

import React from 'react';
import { SupportedLanguage } from '../../lib/types';

interface Props {
  value: string;
  onChange: (val: string) => void;
  language: SupportedLanguage;
}

export const SeverityScaleQuestion: React.FC<Props> = ({ value, onChange, language }) => {
  const scale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const selectedNum = value ? parseInt(value, 10) : null;

  const getIntensityColor = (num: number) => {
    if (num <= 3) return 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100';
    if (num <= 6) return 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
    return 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100';
  };

  const getSelectedColor = (num: number) => {
    if (num <= 3) return 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-4 ring-emerald-100';
    if (num <= 6) return 'bg-amber-600 text-white border-amber-700 shadow-md ring-4 ring-amber-100';
    return 'bg-rose-600 text-white border-rose-700 shadow-md ring-4 ring-rose-100';
  };

  const mildLabel = language === 'hi' ? 'हल्का (Mild)' : language === 'kn' ? 'ಸೌಮ್ಯ (Mild)' : 'Mild';
  const moderateLabel = language === 'hi' ? 'मध्यम (Moderate)' : language === 'kn' ? 'ಮಧ್ಯಮ (Moderate)' : 'Moderate';
  const severeLabel = language === 'hi' ? 'अत्यधिक (Severe)' : language === 'kn' ? 'ತೀವ್ರ (Severe)' : 'Severe';

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1-10 Grid of big buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
        {scale.map((num) => {
          const isSelected = selectedNum === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num.toString())}
              className={`touch-btn min-h-[72px] h-18 p-0 rounded-2xl border-2 text-2xl font-bold flex flex-col items-center justify-center transition-all ${
                isSelected ? getSelectedColor(num) : getIntensityColor(num)
              }`}
              aria-label={`Severity ${num}`}
            >
              <span>{num}</span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center px-2 text-sm font-semibold text-slate-600">
        <span className="text-emerald-700">1-3: {mildLabel}</span>
        <span className="text-amber-700">4-6: {moderateLabel}</span>
        <span className="text-rose-700">7-10: {severeLabel}</span>
      </div>
    </div>
  );
};
