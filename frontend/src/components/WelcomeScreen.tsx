'use client';

import React from 'react';
import { Activity, ShieldCheck, HeartHandshake, Sparkles, ArrowRight } from 'lucide-react';
import { SupportedLanguage, PatientInfo } from '../lib/types';
import { translations } from '../lib/i18n';

interface Props {
  language: SupportedLanguage;
  onStart: () => void;
  onSelectLanguageStep: () => void;
  onLoadDemo: (demoPatient: PatientInfo) => void;
}

export const WelcomeScreen: React.FC<Props> = ({
  language,
  onStart,
  onSelectLanguageStep,
  onLoadDemo,
}) => {
  const t = translations[language];

  const handleDemoClick = () => {
    const demoPatient: PatientInfo = {
      id: 'demo-patient-001',
      name: 'Rajesh Kumar (Synthetic Demo)',
      age: '45',
      sex: 'male',
      preferredLanguage: language,
      mrn: 'SYNTH-45-MALE',
      phone: '+91 98765 43210',
    };
    onLoadDemo(demoPatient);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-8 py-6 animate-in fade-in duration-300">
      {/* Visual Badge */}
      <div className="w-24 h-24 bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-teal-700/20">
        <Activity className="w-12 h-12" />
      </div>

      {/* Main Title */}
      <div className="space-y-3">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {t.appName}
        </h2>
        <p className="text-xl sm:text-2xl text-teal-800 font-medium">
          {t.appTagline}
        </p>
      </div>

      {/* Narrative Card */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-left max-w-3xl">
        <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-normal">
          {t.welcomeDescription}
        </p>

        {/* Value Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-base">Physician Briefing</h4>
              <p className="text-sm text-slate-500">Your doctor gets a structured clinical briefing before your turn.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-base">You Are in Control</h4>
              <p className="text-sm text-slate-500">Skip questions or request assistance at any time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="w-full max-w-xl space-y-4">
        <button
          type="button"
          onClick={onStart}
          className="touch-btn-primary w-full min-h-[80px] text-2xl font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-teal-800/20 active:scale-[0.98]"
        >
          <span>{t.startBtn}</span>
          <ArrowRight className="w-7 h-7" />
        </button>

        {/* Demo Mode Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleDemoClick}
            className="touch-btn-subtle w-full min-h-[64px] text-base font-semibold rounded-2xl flex items-center justify-center gap-2 text-teal-800 bg-teal-50/80 border-teal-200 hover:bg-teal-100/80"
          >
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span>{t.loadDemoPatient}</span>
          </button>
          <p className="text-xs text-slate-400 mt-1.5">{t.demoModeNotice}</p>
        </div>
      </div>
    </div>
  );
};
