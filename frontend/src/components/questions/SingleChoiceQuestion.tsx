'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface Props {
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

export const SingleChoiceQuestion: React.FC<Props> = ({ value, options, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
      {options.map((opt) => {
        const isSelected = value.toLowerCase() === opt.toLowerCase();
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`touch-btn min-h-[70px] px-5 py-4 rounded-2xl border-2 text-lg font-semibold flex items-center justify-between text-left transition-all ${
              isSelected
                ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-4 ring-teal-100'
                : 'bg-white text-slate-800 border-slate-300 hover:border-teal-500 hover:bg-slate-50'
            }`}
          >
            <span>{opt}</span>
            {isSelected && <Check className="w-6 h-6 flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
};
