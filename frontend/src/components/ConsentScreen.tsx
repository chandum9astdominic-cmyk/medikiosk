'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { SupportedLanguage } from '../lib/types';
import { translations } from '../lib/i18n';

interface Props {
  language: SupportedLanguage;
  onAgree: () => void;
  onDecline: () => void;
  onBack: () => void;
}

export const ConsentScreen: React.FC<Props> = ({
  language,
  onAgree,
  onDecline,
  onBack,
}) => {
  const t = translations[language];
  const [isDeclined, setIsDeclined] = useState(false);

  if (isDeclined) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 bg-amber-100 text-amber-800 rounded-3xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-bold text-slate-900">{t.consentDeclinedTitle}</h3>
        <p className="text-xl text-slate-600 leading-relaxed">
          {t.consentDeclinedMessage}
        </p>
        <button
          type="button"
          onClick={() => {
            setIsDeclined(false);
            onBack();
          }}
          className="touch-btn-outline w-full min-h-[72px] text-lg font-bold rounded-2xl"
        >
          {t.returnToStart}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">{t.consentTitle}</h2>
        <p className="text-lg text-slate-600">{t.consentSummary}</p>
      </div>

      {/* Consent Points List */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        {[
          t.consentPoint1,
          t.consentPoint2,
          t.consentPoint3,
          t.consentPoint4,
        ].map((point, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="p-1 rounded-full bg-teal-100 text-teal-800 mt-1 flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-lg sm:text-xl text-slate-800 font-medium leading-relaxed">
              {point}
            </p>
          </div>
        ))}
      </div>

      {/* Agree / Decline Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={() => setIsDeclined(true)}
          className="touch-btn-outline min-h-[72px] text-lg font-bold rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-100 order-2 sm:order-1"
        >
          {t.declineBtn}
        </button>

        <button
          type="button"
          onClick={onAgree}
          className="touch-btn-primary min-h-[72px] text-xl font-bold rounded-2xl flex items-center justify-center gap-2 order-1 sm:order-2 shadow-md shadow-teal-800/10"
        >
          <span>{t.agreeBtn}</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
