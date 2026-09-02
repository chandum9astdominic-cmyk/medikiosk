import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CompletionScreen } from '../components/CompletionScreen';

describe('CompletionScreen Component', () => {
  it('renders confirmation message with clear non-diagnostic advice', () => {
    render(
      <CompletionScreen
        language="en"
        onRestart={vi.fn()}
      />
    );

    expect(screen.getByText('Health History Recorded Successfully')).toBeInTheDocument();
    expect(screen.getByText(/Your pre-consultation summary is now ready for your physician/i)).toBeInTheDocument();
    expect(screen.getByText(/All diagnoses, examinations, and treatment plans will be conducted by your licensed medical practitioner/i)).toBeInTheDocument();
    expect(screen.getByText(/Finish and Return to Home/i)).toBeInTheDocument();
  });

  it('triggers onRestart when Finish button is touched', () => {
    const handleRestart = vi.fn();
    render(
      <CompletionScreen
        language="en"
        onRestart={handleRestart}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Finish and Return to Home/i }));
    expect(handleRestart).toHaveBeenCalledTimes(1);
  });
});
