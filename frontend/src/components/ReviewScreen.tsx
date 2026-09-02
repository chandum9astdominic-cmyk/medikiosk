'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Edit3, ArrowRight, ClipboardCheck, HelpCircle, Slash, FastForward } from 'lucide-react';
import { SupportedLanguage, ConsultationSummaryData, ReviewItem } from '../lib/types';
import { translations } from '../lib/i18n';
import { RedFlagAlert } from './RedFlagAlert';

interface Props {
  language: SupportedLanguage;
  summary: ConsultationSummaryData | null;
  onEditAnswer: (questionKey: string) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const ReviewScreen: React.FC<Props> = ({
  language,
  summary,
  onEditAnswer,
  onConfirm,
  isLoading,
}) => {
  const t = translations[language];

  const getStatusBadge = (status: ReviewItem['answer_status']) => {
    switch (status) {
      case 'not_known':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
            <HelpCircle className="w-3.5 h-3.5" />
            {t.statusUnknown}
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
            <Slash className="w-3.5 h-3.5" />
            {t.statusDeclined}
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
            <FastForward className="w-3.5 h-3.5" />
            {t.statusSkipped}
          </span>
        );
      case 'answered':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.statusAnswered}
          </span>
        );
    }
  };

  const sections = summary?.answers_by_section ? Object.keys(summary.answers_by_section) : [];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
          <ClipboardCheck className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">{t.reviewTitle}</h2>
        <p className="text-lg text-slate-600">{t.reviewSubtitle}</p>
      </div>

      {/* Red flag notice if present */}
      {summary && summary.red_flags_count > 0 && (
        <RedFlagAlert language={language} />
      )}

      {/* Chief Complaint Box */}
      <div className="bg-teal-50 border-2 border-teal-200 rounded-3xl p-6 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block mb-1">
          {t.chiefComplaint}
        </span>
        <h3 className="text-2xl font-bold text-teal-950">
          {summary?.chief_complaint || 'Abdominal Pain'}
        </h3>
      </div>

      {/* Grouped Responses */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
            No questionnaire answers recorded yet.
          </div>
        ) : (
          sections.map((sectionName) => {
            const items = summary?.answers_by_section[sectionName] || [];
            return (
              <div
                key={sectionName}
                className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
              >
                <h4 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>{sectionName}</span>
                  <span className="text-xs font-normal text-slate-500">
                    {items.length} {items.length === 1 ? 'question' : 'questions'}
                  </span>
                </h4>

                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.question_key} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-slate-800">
                            {item.question_text}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-medium text-slate-900">
                            {item.answer_text || '—'}
                          </p>
                          {getStatusBadge(item.answer_status)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onEditAnswer(item.question_key)}
                        className="touch-btn-subtle min-h-[48px] px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-1.5 flex-shrink-0"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>{t.editAnswer}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Action */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="touch-btn-primary w-full min-h-[76px] text-2xl font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-teal-800/15"
        >
          <span>{t.confirmAndCompleteBtn}</span>
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
