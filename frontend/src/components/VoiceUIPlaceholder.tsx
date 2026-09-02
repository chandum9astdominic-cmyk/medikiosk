'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { SupportedLanguage } from '../lib/types';
import { translations } from '../lib/i18n';

interface Props {
  language: SupportedLanguage;
  onTranscriptReceived: (transcript: string) => void;
}

export const VoiceUIPlaceholder: React.FC<Props> = ({ language, onTranscriptReceived }) => {
  const t = translations[language];
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTranscript('');

      // Simulated voice transcription for kiosk touchscreen demo (as required by specs)
      setTimeout(() => {
        let sampleTranscript = "I have had mild pain for two days.";
        if (language === 'hi') {
          sampleTranscript = "मुझे दो दिनों से हल्का दर्द हो रहा है।";
        } else if (language === 'kn') {
          sampleTranscript = "ನನಗೆ ಎರಡು ದಿನಗಳಿಂದ ಸೌಮ್ಯವಾದ ನೋವು ಇದೆ.";
        }
        setTranscript(sampleTranscript);
        onTranscriptReceived(sampleTranscript);
        setIsListening(false);
      }, 2500);
    }
  };

  return (
    <div className="w-full bg-slate-100/90 border-2 border-dashed border-teal-300 rounded-2xl p-5 text-slate-800 transition-all">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left side: Voice status */}
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl transition-all ${
            isListening ? 'bg-rose-500 text-white animate-pulse shadow-lg ring-4 ring-rose-200' : 'bg-teal-700 text-white'
          }`}>
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900">{t.voicePlaceholderNotice}</span>
              <span className="text-[11px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Prototype
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isListening ? t.listeningActive : t.voiceSimulatedNotice}
            </p>
          </div>
        </div>

        {/* Right side: Mic Action button */}
        <button
          onClick={handleToggleListening}
          className={`min-h-[54px] px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
            isListening 
              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-300' 
              : 'bg-teal-700 hover:bg-teal-800 text-white'
          }`}
          aria-label={isListening ? t.stopListeningBtn : t.speakBtn}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 animate-bounce" />
              <span>{t.stopListeningBtn}</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>{t.speakBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Transcript feedback box */}
      {(transcript || isListening) && (
        <div className="mt-3.5 bg-white border border-slate-200 rounded-xl p-3.5 text-sm">
          <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider block mb-1">
            {isListening ? "Listening..." : "Recognized Voice Transcript:"}
          </span>
          <p className="text-slate-800 italic text-base">
            {isListening ? "● ● ● (Say your answer clearly)" : `"${transcript}"`}
          </p>
        </div>
      )}
    </div>
  );
};
