import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConsentScreen } from '../components/ConsentScreen';

describe('ConsentScreen Component', () => {
  it('renders consent points and non-diagnostic boundaries', () => {
    const handleAgree = vi.fn();
    const handleDecline = vi.fn();
    const handleBack = vi.fn();

    render(
      <ConsentScreen
        language="en"
        onAgree={handleAgree}
        onDecline={handleDecline}
        onBack={handleBack}
      />
    );

    expect(screen.getByText('Informed Pre-Consultation Consent')).toBeInTheDocument();
    expect(screen.getByText(/This kiosk does NOT diagnose conditions or prescribe medications/i)).toBeInTheDocument();
    expect(screen.getByText(/Your doctor remains fully responsible/i)).toBeInTheDocument();
    expect(screen.getByText(/I Understand and Agree/i)).toBeInTheDocument();
  });

  it('triggers onAgree when agree button is clicked', () => {
    const handleAgree = vi.fn();
    const handleDecline = vi.fn();
    const handleBack = vi.fn();

    render(
      <ConsentScreen
        language="en"
        onAgree={handleAgree}
        onDecline={handleDecline}
        onBack={handleBack}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /I Understand and Agree/i }));
    expect(handleAgree).toHaveBeenCalledTimes(1);
  });

  it('shows decline message and option to return home when declined', () => {
    const handleAgree = vi.fn();
    const handleDecline = vi.fn();
    const handleBack = vi.fn();

    render(
      <ConsentScreen
        language="en"
        onAgree={handleAgree}
        onDecline={handleDecline}
        onBack={handleBack}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /I Decline to Use Kiosk/i }));
    expect(screen.getByText('Consent Declined')).toBeInTheDocument();
    expect(screen.getByText(/proceed directly to the registration counter/i)).toBeInTheDocument();
  });
});
