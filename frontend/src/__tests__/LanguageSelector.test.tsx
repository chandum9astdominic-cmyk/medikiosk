import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageSelector } from '../components/LanguageSelector';

describe('LanguageSelector Component', () => {
  it('renders all three supported languages with native text', () => {
    const handleSelect = vi.fn();
    const handleProceed = vi.fn();

    render(
      <LanguageSelector
        selectedLanguage="en"
        onSelectLanguage={handleSelect}
        onProceed={handleProceed}
      />
    );

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('हिन्दी')).toBeInTheDocument();
    expect(screen.getByText('ಕನ್ನಡ')).toBeInTheDocument();
  });

  it('calls onSelectLanguage when language card is touched', () => {
    const handleSelect = vi.fn();
    const handleProceed = vi.fn();

    render(
      <LanguageSelector
        selectedLanguage="en"
        onSelectLanguage={handleSelect}
        onProceed={handleProceed}
      />
    );

    fireEvent.click(screen.getByText('हिन्दी'));
    expect(handleSelect).toHaveBeenCalledWith('hi');

    fireEvent.click(screen.getByText('ಕನ್ನಡ'));
    expect(handleSelect).toHaveBeenCalledWith('kn');
  });

  it('calls onProceed when Next button is clicked', () => {
    const handleSelect = vi.fn();
    const handleProceed = vi.fn();

    render(
      <LanguageSelector
        selectedLanguage="en"
        onSelectLanguage={handleSelect}
        onProceed={handleProceed}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Next Question|Next/i }));
    expect(handleProceed).toHaveBeenCalledTimes(1);
  });
});
