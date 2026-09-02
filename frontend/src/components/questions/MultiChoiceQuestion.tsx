'use client';

import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface Props {
  value: string; // comma-separated or JSON
  options: string[];
  onChange: (val: string) => void;
}

export const MultiChoiceQuestion: React.FC<Props> = ({ value, options, onChange }) => {
  const selectedList = value
    ? value.split(',').map((s) => s.trim().toLowerCase())
    : [];

  const handleToggle = (opt: string) => {
    const optLower = opt.toLowerCase();
    let updated: string[];
    if (selectedList.includes(optLower)) {
      updated = selectedList.filter((s) => s !== optLower);
    } else {
      updated = [...selectedList, optLower];
    }
    // Match casing with original options
    const finalSelection = options.filter((o) => updated.includes(o.toLowerCase()));
    onChange(finalSelection.join(', '));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
      {options.map((opt) => {
        const isSelected = selectedList.includes(opt.toLowerCase());
        return (
          <button
            key={opt}
            type="button"
            onClick={() => handleToggle(opt)}
            className={`touch-btn min-h-[70px] px-5 py-4 rounded-2xl border-2 text-lg font-semibold flex items-center justify-between text-left transition-all ${
              isSelected
                ? 'bg-teal-50 text-teal-900 border-teal-600 shadow-sm ring-2 ring-teal-200'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <span>{opt}</span>
            {isSelected ? (
              <CheckSquare className="w-6 h-6 text-teal-700 flex-shrink-0" />
            ) : (
              <Square className="w-6 h-6 text-slate-400 flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
};
