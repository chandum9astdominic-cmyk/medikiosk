'use client';

import React, { useState } from 'react';
import { User, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { SupportedLanguage, PatientInfo } from '../lib/types';
import { translations } from '../lib/i18n';

interface Props {
  language: SupportedLanguage;
  initialData?: PatientInfo | null;
  onSubmit: (info: PatientInfo) => void;
  onBack: () => void;
}

export const PatientInfoForm: React.FC<Props> = ({
  language,
  initialData,
  onSubmit,
  onBack,
}) => {
  const t = translations[language];

  const [name, setName] = useState(initialData?.name || '');
  const [age, setAge] = useState(initialData?.age || '');
  const [sex, setSex] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>(
    initialData?.sex || 'male'
  );
  const [mrn, setMrn] = useState(initialData?.mrn || '');
  const [abhaId, setAbhaId] = useState(initialData?.abhaId || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!age.trim() || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 130) {
      setError('Please enter a valid age between 1 and 130.');
      return;
    }

    setError(null);
    onSubmit({
      id: initialData?.id || undefined,
      name: name.trim(),
      age: age.trim(),
      sex: sex,
      preferredLanguage: language,
      mrn: mrn.trim() || undefined,
      abhaId: abhaId.trim() || undefined,
    });
  };

  const sexOptions: { value: 'male' | 'female' | 'other' | 'prefer_not_to_say'; label: string }[] = [
    { value: 'male', label: t.male },
    { value: 'female', label: t.female },
    { value: 'other', label: t.other },
    { value: 'prefer_not_to_say', label: t.preferNotToSay },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <User className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">{t.patientInfoTitle}</h2>
        <p className="text-lg text-slate-600">{t.patientInfoSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {error && (
          <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 px-5 py-3.5 rounded-2xl text-base font-semibold">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-xl font-bold text-slate-900">
            {t.fullNameLabel} <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.fullNamePlaceholder}
            className="touch-input text-xl h-16 font-medium"
            required
            aria-required="true"
          />
        </div>

        {/* Age, MRN & ABHA Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xl font-bold text-slate-900">
              {t.ageLabel} <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={t.agePlaceholder}
              min={1}
              max={130}
              className="touch-input text-xl h-16 font-medium"
              required
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xl font-bold text-slate-900">
              {t.mrnLabel}
            </label>
            <input
              type="text"
              value={mrn}
              onChange={(e) => setMrn(e.target.value)}
              placeholder={t.mrnPlaceholder}
              className="touch-input text-xl h-16 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xl font-bold text-slate-900">
              {t.abhaLabel}
            </label>
            <input
              type="text"
              value={abhaId}
              onChange={(e) => setAbhaId(e.target.value)}
              placeholder={t.abhaPlaceholder}
              className="touch-input text-xl h-16 font-medium"
            />
          </div>
        </div>

        {/* Sex Selection with Big Touch Buttons */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-slate-900">
            {t.sexLabel} <span className="text-rose-600">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sexOptions.map((opt) => {
              const isSelected = sex === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSex(opt.value)}
                  className={`touch-btn min-h-[64px] rounded-2xl border-2 text-lg font-bold transition-all ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-4 ring-teal-100'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-teal-500 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="touch-btn-outline min-h-[72px] text-lg font-bold rounded-2xl px-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>{t.backBtn}</span>
          </button>

          <button
            type="submit"
            className="touch-btn-primary min-h-[72px] text-xl font-bold rounded-2xl flex-1 flex items-center justify-center gap-2"
          >
            <span>{t.startIntakeBtn}</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};
