'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle, FastForward, Slash, CheckCircle, RefreshCw } from 'lucide-react';
import { 
  SupportedLanguage, 
  NextQuestionData, 
  ConsultationProgressData 
} from '../lib/types';
import { translations } from '../lib/i18n';
import { ProgressBar } from './ProgressBar';
import { RedFlagAlert } from './RedFlagAlert';
import { VoiceUIPlaceholder } from './VoiceUIPlaceholder';

// Input subcomponents
import { TextInputQuestion } from './questions/TextInputQuestion';
import { YesNoQuestion } from './questions/YesNoQuestion';
import { SingleChoiceQuestion } from './questions/SingleChoiceQuestion';
import { MultiChoiceQuestion } from './questions/MultiChoiceQuestion';
import { NumericQuestion } from './questions/NumericQuestion';
import { SeverityScaleQuestion } from './questions/SeverityScaleQuestion';
import { DurationQuestion } from './questions/DurationQuestion';

interface Props {
  language: SupportedLanguage;
  question: NextQuestionData;
  progress: ConsultationProgressData | null;
  isLoading: boolean;
  onSubmitAnswer: (rawText: string) => Promise<void>;
  onSkip: () => Promise<void>;
  onDontKnow: () => Promise<void>;
  onDeclined: () => Promise<void>;
  onPrevious?: () => void;
  redFlagCount: number;
}

export const CaseTakingScreen: React.FC<Props> = ({
  language,
  question,
  progress,
  isLoading,
  onSubmitAnswer,
  onSkip,
  onDontKnow,
  onDeclined,
  onPrevious,
  redFlagCount,
}) => {
  const t = translations[language];
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear answer whenever question changes
  useEffect(() => {
    setCurrentAnswer('');
  }, [question.question_key]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentAnswer.trim() && question.is_required) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmitAnswer(currentAnswer.trim() || 'Answer provided');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setCurrentAnswer(text);
  };

  // Determine which input control to render based on question metadata
  const renderInputControl = () => {
    const inputType = question.input_type || 'text';
    const options = question.options || [];

    switch (inputType) {
      case 'yes_no':
        return (
          <YesNoQuestion
            value={currentAnswer}
            onChange={setCurrentAnswer}
            language={language}
          />
        );
      case 'single_choice':
        return (
          <SingleChoiceQuestion
            value={currentAnswer}
            options={options.length > 0 ? options : ['Mild', 'Moderate', 'Severe']}
            onChange={setCurrentAnswer}
          />
        );
      case 'multi_choice':
        return (
          <MultiChoiceQuestion
            value={currentAnswer}
            options={options.length > 0 ? options : ['Fever', 'Nausea', 'Vomiting', 'Loss of appetite']}
            onChange={setCurrentAnswer}
          />
        );
      case 'numeric':
        return (
          <NumericQuestion
            value={currentAnswer}
            onChange={setCurrentAnswer}
          />
        );
      case 'scale':
      case 'severity_scale':
        return (
          <SeverityScaleQuestion
            value={currentAnswer}
            onChange={setCurrentAnswer}
            language={language}
          />
        );
      case 'duration':
      case 'date':
        return (
          <DurationQuestion
            value={currentAnswer}
            onChange={setCurrentAnswer}
            language={language}
          />
        );
      case 'long_text':
        return (
          <TextInputQuestion
            value={currentAnswer}
            onChange={setCurrentAnswer}
            language={language}
            isLong={true}
          />
        );
      case 'text':
      default:
        // Automatically check if the question text or clinical field is asking about severity or duration
        if (question.clinical_field === 'severity' || question.question_text?.toLowerCase().includes('scale of 1 to 10')) {
          return (
            <SeverityScaleQuestion
              value={currentAnswer}
              onChange={setCurrentAnswer}
              language={language}
            />
          );
        }
        if (question.clinical_field === 'onset' || question.question_text?.toLowerCase().includes('when did the pain start')) {
          return (
            <DurationQuestion
              value={currentAnswer}
              onChange={setCurrentAnswer}
              language={language}
            />
          );
        }
        return (
          <TextInputQuestion
            value={currentAnswer}
            onChange={setCurrentAnswer}
            language={language}
          />
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Progress Bar Header */}
      <ProgressBar
        percentage={question.progress_percentage || 0}
        language={language}
        section={question.section}
      />

      {/* Red Flag Alert if triggered */}
      {redFlagCount > 0 && (
        <RedFlagAlert language={language} />
      )}

      {/* Main Question Card */}
      <div className="w-full bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-9 shadow-sm flex flex-col gap-6">
        {/* Question Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {question.section || 'General'} {question.clinical_field ? `• ${question.clinical_field}` : ''}
            </span>
            {question.is_required && (
              <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-0.5 rounded-full">
                Required
              </span>
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {question.question_text || 'Please provide your symptom details:'}
          </h3>
        </div>

        {/* Voice UI Placeholder */}
        <VoiceUIPlaceholder
          language={language}
          onTranscriptReceived={handleVoiceTranscript}
        />

        {/* Dynamic Question Input Control */}
        <div className="pt-2">
          {renderInputControl()}
        </div>

        {/* Quick Response Shortcuts: Unknown, Prefer Not to Answer, Skip */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onDontKnow}
            disabled={isLoading || isSubmitting}
            className="touch-btn-subtle flex-1 min-h-[56px] text-base font-medium rounded-xl flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-5 h-5 text-slate-500" />
            <span>{t.dontKnowBtn}</span>
          </button>

          <button
            type="button"
            onClick={onDeclined}
            disabled={isLoading || isSubmitting}
            className="touch-btn-subtle flex-1 min-h-[56px] text-base font-medium rounded-xl flex items-center justify-center gap-2"
          >
            <Slash className="w-5 h-5 text-slate-500" />
            <span>{t.preferNotToAnswerBtn}</span>
          </button>

          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading || isSubmitting}
            className="touch-btn-subtle flex-1 min-h-[56px] text-base font-medium rounded-xl flex items-center justify-center gap-2"
          >
            <FastForward className="w-5 h-5 text-slate-500" />
            <span>{t.skipBtn}</span>
          </button>
        </div>

        {/* Primary Submit & Next Action */}
        <div className="pt-3">
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isLoading || isSubmitting || (!currentAnswer.trim() && question.is_required)}
            className="touch-btn-primary w-full min-h-[76px] text-2xl font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-teal-800/15"
          >
            {isSubmitting || isLoading ? (
              <RefreshCw className="w-7 h-7 animate-spin" />
            ) : (
              <>
                <span>{t.submitAnswerBtn}</span>
                <ArrowRight className="w-7 h-7" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
