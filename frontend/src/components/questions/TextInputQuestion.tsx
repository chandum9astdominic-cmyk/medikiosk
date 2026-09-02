'use client';

import React from 'react';
import { SupportedLanguage } from '../../lib/types';
import { translations } from '../../lib/i18n';

interface Props {
  value: string;
  onChange: (val: string) => void;
  language: SupportedLanguage;
  placeholder?: string;
  isLong?: boolean;
}

export const TextInputQuestion: React.FC<Props> = ({
  value,
  onChange,
  language,
  placeholder,
  isLong = false,
}) => {
  const t = translations[language];

  if (isLong) {
    return (
      <div className="w-full">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || t.typeAnswerPlaceholder}
          rows={4}
          className="touch-input resize-none text-xl p-4 min-h-[140px]"
          aria-label="Answer input"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t.typeAnswerPlaceholder}
        className="touch-input text-xl h-16"
        aria-label="Answer input"
      />
    </div>
  );
};
