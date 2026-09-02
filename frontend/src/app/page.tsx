'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  SupportedLanguage, 
  StepType, 
  PatientInfo, 
  NextQuestionData, 
  ConsultationProgressData, 
  ConsultationSummaryData 
} from '../lib/types';
import { translations } from '../lib/i18n';
import { api, ApiError } from '../lib/api';

// Components
import { Header } from '../components/Header';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { LanguageSelector } from '../components/LanguageSelector';
import { ConsentScreen } from '../components/ConsentScreen';
import { PatientInfoForm } from '../components/PatientInfoForm';
import { CaseTakingScreen } from '../components/CaseTakingScreen';
import { ReviewScreen } from '../components/ReviewScreen';
import { CompletionScreen } from '../components/CompletionScreen';
import { AlertCircle, RefreshCw, Undo2 } from 'lucide-react';

const STORAGE_KEY_CONSULTATION = 'medikiosk_active_consultation_id';
const STORAGE_KEY_PATIENT = 'medikiosk_active_patient_info';
const STORAGE_KEY_LANG = 'medikiosk_language';

export default function MediKioskPage() {
  // Application & State Flow
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [step, setStep] = useState<StepType>('welcome');
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  
  // Question & Progress State
  const [currentQuestion, setCurrentQuestion] = useState<NextQuestionData | null>(null);
  const [progress, setProgress] = useState<ConsultationProgressData | null>(null);
  const [summary, setSummary] = useState<ConsultationSummaryData | null>(null);
  const [redFlagCount, setRedFlagCount] = useState<number>(0);

  // UI & Accessibility State
  const [isLargeText, setIsLargeText] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionRestoredNotice, setSessionRestoredNotice] = useState(false);

  const t = translations[language];

  // Apply high contrast / font scale to document body
  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', isLargeText ? '1.2' : '1');
  }, [isLargeText]);

  // Session Resume on page load
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as SupportedLanguage | null;
    if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'kn')) {
      setLanguage(savedLang);
    }

    const savedConsultationId = localStorage.getItem(STORAGE_KEY_CONSULTATION);
    const savedPatientJson = localStorage.getItem(STORAGE_KEY_PATIENT);

    if (savedConsultationId) {
      setConsultationId(savedConsultationId);
      if (savedPatientJson) {
        try {
          setPatientInfo(JSON.parse(savedPatientJson));
        } catch {
          // ignore parse error
        }
      }
      // Attempt to resume from backend
      resumeSession(savedConsultationId, savedLang || 'en');
    }
  }, []);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    localStorage.setItem(STORAGE_KEY_LANG, newLang);
  };

  // Resume active session from backend
  const resumeSession = async (id: string, lang: SupportedLanguage) => {
    setIsLoading(true);
    try {
      const prog = await api.getProgress(id);
      setProgress(prog);
      setRedFlagCount(prog.red_flags_triggered);

      if (prog.status === 'submitted' || prog.status === 'completed') {
        setStep('completed');
      } else {
        const nextQ = await api.getNextQuestion(id, lang);
        setCurrentQuestion(nextQ);
        if (nextQ.is_complete) {
          const sum = await api.getSummary(id, lang);
          setSummary(sum);
          setStep('review');
        } else {
          setStep('questions');
        }
      }
      setSessionRestoredNotice(true);
      setTimeout(() => setSessionRestoredNotice(false), 5000);
    } catch {
      // If resume fails, clear stored id
      localStorage.removeItem(STORAGE_KEY_CONSULTATION);
      setConsultationId(null);
      setStep('welcome');
    } finally {
      setIsLoading(false);
    }
  };

  // Start new consultation
  const startConsultationFlow = async (patient: PatientInfo) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const generatedPatientId = patient.id || crypto.randomUUID();
      const consult = await api.createConsultation(generatedPatientId, 'triage');
      
      setConsultationId(consult.consultation_id);
      setPatientInfo(patient);
      localStorage.setItem(STORAGE_KEY_CONSULTATION, consult.consultation_id);
      localStorage.setItem(STORAGE_KEY_PATIENT, JSON.stringify(patient));

      // Fetch first question
      const nextQ = await api.getNextQuestion(consult.consultation_id, language);
      setCurrentQuestion(nextQ);

      const prog = await api.getProgress(consult.consultation_id);
      setProgress(prog);
      setRedFlagCount(prog.red_flags_triggered);

      setStep('questions');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to start consultation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Answer & Fetch Next Question
  const handleAnswerSubmission = async (rawText: string) => {
    if (!consultationId || !currentQuestion?.question_key) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await api.submitAnswer(
        consultationId,
        currentQuestion.question_key,
        rawText,
        language
      );

      // Check progress & red flags
      const prog = await api.getProgress(consultationId);
      setProgress(prog);
      setRedFlagCount(prog.red_flags_triggered);

      // Fetch next question from Clinical Engine
      const nextQ = await api.getNextQuestion(consultationId, language);
      setCurrentQuestion(nextQ);

      if (nextQ.is_complete) {
        // Fetch review summary
        const sum = await api.getSummary(consultationId, language);
        setSummary(sum);
        setStep('review');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to record answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action Handlers
  const handleSkip = async () => {
    await handleAnswerSubmission('Skip');
  };

  const handleDontKnow = async () => {
    await handleAnswerSubmission("I don't know");
  };

  const handleDeclined = async () => {
    await handleAnswerSubmission('Prefer not to answer');
  };

  // Review screen confirmation -> complete
  const handleFinalConfirm = async () => {
    if (!consultationId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await api.completeConsultation(consultationId);
      localStorage.removeItem(STORAGE_KEY_CONSULTATION);
      localStorage.removeItem(STORAGE_KEY_PATIENT);
      setStep('completed');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to finalize consultation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit an answer from the review screen
  const handleEditAnswer = async (questionKey: string) => {
    if (!consultationId) return;
    setIsLoading(true);
    try {
      // Re-fetch question by key / navigate back to question flow
      const nextQ = await api.getNextQuestion(consultationId, language);
      setCurrentQuestion({
        ...nextQ,
        question_key: questionKey,
        is_complete: false,
      });
      setStep('questions');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to edit question.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Mode loader
  const handleLoadDemoPatient = (demoPatient: PatientInfo) => {
    setPatientInfo(demoPatient);
    setStep('consent');
  };

  // Restart Kiosk Session
  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY_CONSULTATION);
    localStorage.removeItem(STORAGE_KEY_PATIENT);
    setConsultationId(null);
    setPatientInfo(null);
    setCurrentQuestion(null);
    setProgress(null);
    setSummary(null);
    setRedFlagCount(0);
    setErrorMessage(null);
    setStep('welcome');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Kiosk Header */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        isLargeText={isLargeText}
        isHighContrast={isHighContrast}
        onToggleLargeText={() => setIsLargeText(!isLargeText)}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        showLanguageSelector={step !== 'welcome' && step !== 'language'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center">
        {/* Session Resumed Banner */}
        {sessionRestoredNotice && (
          <div className="max-w-3xl mx-auto w-full mb-6 bg-teal-50 border border-teal-300 text-teal-900 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <Undo2 className="w-5 h-5 text-teal-700" />
            <span className="font-semibold">{t.sessionResumedNotice}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto w-full mb-6 bg-rose-50 border-2 border-rose-300 text-rose-900 p-5 rounded-2xl flex items-start justify-between gap-4 shadow-sm" role="alert">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-lg">{t.errorTitle}</h4>
                <p className="text-base text-rose-800 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 rounded-lg text-sm font-semibold hover:bg-rose-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Screen Flow */}
        {step === 'welcome' && (
          <WelcomeScreen
            language={language}
            onStart={() => setStep('language')}
            onSelectLanguageStep={() => setStep('language')}
            onLoadDemo={handleLoadDemoPatient}
          />
        )}

        {step === 'language' && (
          <LanguageSelector
            selectedLanguage={language}
            onSelectLanguage={handleLanguageChange}
            onProceed={() => setStep('consent')}
          />
        )}

        {step === 'consent' && (
          <ConsentScreen
            language={language}
            onAgree={() => setStep('patient_info')}
            onDecline={() => setStep('welcome')}
            onBack={() => setStep('language')}
          />
        )}

        {step === 'patient_info' && (
          <PatientInfoForm
            language={language}
            initialData={patientInfo}
            onSubmit={(info) => startConsultationFlow(info)}
            onBack={() => setStep('consent')}
          />
        )}

        {step === 'questions' && currentQuestion && (
          <CaseTakingScreen
            language={language}
            question={currentQuestion}
            progress={progress}
            isLoading={isLoading}
            onSubmitAnswer={handleAnswerSubmission}
            onSkip={handleSkip}
            onDontKnow={handleDontKnow}
            onDeclined={handleDeclined}
            onPrevious={() => setStep('patient_info')}
            redFlagCount={redFlagCount}
          />
        )}

        {step === 'review' && (
          <ReviewScreen
            language={language}
            summary={summary}
            onEditAnswer={handleEditAnswer}
            onConfirm={handleFinalConfirm}
            isLoading={isLoading}
          />
        )}

        {step === 'completed' && (
          <CompletionScreen
            language={language}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Hospital Footer with Kiosk Status */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediKiosk — Patient Pre-Consultation System (SIH26047)</span>
          <span className="font-medium text-slate-600">
            Assistance Available • Touch any button firmly • Non-Diagnostic Intake
          </span>
        </div>
      </footer>
    </div>
  );
}
