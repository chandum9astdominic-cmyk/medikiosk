'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const NumericQuestion: React.FC<Props> = ({
  value,
  onChange,
  min = 0,
  max = 150,
  step = 1,
  unit,
}) => {
  const numValue = value ? parseInt(value, 10) : min;

  const handleIncrement = () => {
    const next = Math.min(max, (isNaN(numValue) ? min : numValue) + step);
    onChange(next.toString());
  };

  const handleDecrement = () => {
    const prev = Math.max(min, (isNaN(numValue) ? min : numValue) - step);
    onChange(prev.toString());
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md mx-auto">
      <div className="flex items-center gap-4 w-full justify-center">
        <button
          type="button"
          onClick={handleDecrement}
          className="touch-btn w-16 h-16 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-900 flex items-center justify-center active:scale-95"
          aria-label="Decrease number"
        >
          <Minus className="w-8 h-8" />
        </button>

        <div className="flex-1 min-w-[120px] h-20 bg-white border-2 border-slate-300 rounded-2xl flex items-center justify-center text-3xl font-bold text-slate-900 shadow-inner">
          <span>{isNaN(numValue) ? min : numValue}</span>
          {unit && <span className="text-lg font-normal text-slate-500 ml-2">{unit}</span>}
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          className="touch-btn w-16 h-16 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center active:scale-95"
          aria-label="Increase number"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        placeholder="Or type number directly..."
        className="touch-input text-center text-xl max-w-[240px]"
      />
    </div>
  );
};
