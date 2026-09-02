import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WelcomeScreen } from '../components/WelcomeScreen';

describe('WelcomeScreen Component', () => {
  it('renders MediKiosk title, tagline, and start button in English', () => {
    const handleStart = vi.fn();
    const handleSelectLanguage = vi.fn();
    const handleLoadDemo = vi.fn();

    render(
      <WelcomeScreen
        language="en"
        onStart={handleStart}
        onSelectLanguageStep={handleSelectLanguage}
        onLoadDemo={handleLoadDemo}
      />
    );

    expect(screen.getByText('MediKiosk')).toBeInTheDocument();
    expect(screen.getByText('Pre-Consultation Clinical Intake Kiosk')).toBeInTheDocument();
    expect(screen.getByText(/Touch Here to Start/i)).toBeInTheDocument();
    expect(screen.getByText(/Load 45yo Male Demo Patient/i)).toBeInTheDocument();
  });

  it('triggers onStart when start button is clicked', () => {
    const handleStart = vi.fn();
    const handleSelectLanguage = vi.fn();
    const handleLoadDemo = vi.fn();

    render(
      <WelcomeScreen
        language="en"
        onStart={handleStart}
        onSelectLanguageStep={handleSelectLanguage}
        onLoadDemo={handleLoadDemo}
      />
    );

    const startBtn = screen.getByRole('button', { name: /Touch Here to Start/i });
    fireEvent.click(startBtn);
    expect(handleStart).toHaveBeenCalledTimes(1);
  });

  it('triggers onLoadDemo with synthetic patient when demo button is clicked', () => {
    const handleStart = vi.fn();
    const handleSelectLanguage = vi.fn();
    const handleLoadDemo = vi.fn();

    render(
      <WelcomeScreen
        language="en"
        onStart={handleStart}
        onSelectLanguageStep={handleSelectLanguage}
        onLoadDemo={handleLoadDemo}
      />
    );

    const demoBtn = screen.getByRole('button', { name: /Load 45yo Male Demo Patient/i });
    fireEvent.click(demoBtn);
    expect(handleLoadDemo).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Rajesh Kumar (Synthetic Demo)',
        age: '45',
        sex: 'male',
      })
    );
  });

  it('renders localized content in Hindi and Kannada', () => {
    const { rerender } = render(
      <WelcomeScreen
        language="hi"
        onStart={vi.fn()}
        onSelectLanguageStep={vi.fn()}
        onLoadDemo={vi.fn()}
      />
    );
    expect(screen.getByText(/शुरू करने के लिए यहाँ स्पर्श करें/i)).toBeInTheDocument();

    rerender(
      <WelcomeScreen
        language="kn"
        onStart={vi.fn()}
        onSelectLanguageStep={vi.fn()}
        onLoadDemo={vi.fn()}
      />
    );
    expect(screen.getByText(/ಪ್ರಾರಂಭಿಸಲು ಇಲ್ಲಿ ಸ್ಪರ್ಶಿಸಿ/i)).toBeInTheDocument();
  });
});
