import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CaseTakingScreen } from '../components/CaseTakingScreen';
import { NextQuestionData } from '../lib/types';

describe('CaseTakingScreen Component', () => {
  const sampleQuestion: NextQuestionData = {
    consultation_id: 'test-c-123',
    question_key: 'ap_onset',
    section: 'HPI',
    clinical_field: 'onset',
    question_text: 'When did the abdominal pain start?',
    input_type: 'duration',
    is_required: true,
    is_complete: false,
    progress_percentage: 25,
  };

  it('renders question text, progress bar, and voice placeholder', () => {
    render(
      <CaseTakingScreen
        language="en"
        question={sampleQuestion}
        progress={{
          consultation_id: 'test-c-123',
          status: 'intake',
          completed_questions: ['ap_location'],
          pending_questions: ['ap_onset', 'ap_severity'],
          red_flags_triggered: 0,
        }}
        isLoading={false}
        onSubmitAnswer={vi.fn()}
        onSkip={vi.fn()}
        onDontKnow={vi.fn()}
        onDeclined={vi.fn()}
        redFlagCount={0}
      />
    );

    expect(screen.getByText('When did the abdominal pain start?')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText(/Voice Assistant Input/i)).toBeInTheDocument();
    expect(screen.getByText("I Don't Know")).toBeInTheDocument();
    expect(screen.getByText('Skip Question')).toBeInTheDocument();
    expect(screen.getByText('Prefer Not to Answer')).toBeInTheDocument();
  });

  it('triggers onSubmitAnswer with selected duration text', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <CaseTakingScreen
        language="en"
        question={sampleQuestion}
        progress={null}
        isLoading={false}
        onSubmitAnswer={handleSubmit}
        onSkip={vi.fn()}
        onDontKnow={vi.fn()}
        onDeclined={vi.fn()}
        redFlagCount={0}
      />
    );

    fireEvent.click(screen.getByText('1 - 2 days ago'));
    fireEvent.click(screen.getByRole('button', { name: /Submit & Next/i }));

    expect(handleSubmit).toHaveBeenCalledWith('1 - 2 days ago');
  });

  it('triggers onDontKnow when I Dont Know button is clicked', () => {
    const handleDontKnow = vi.fn().mockResolvedValue(undefined);
    render(
      <CaseTakingScreen
        language="en"
        question={sampleQuestion}
        progress={null}
        isLoading={false}
        onSubmitAnswer={vi.fn()}
        onSkip={vi.fn()}
        onDontKnow={handleDontKnow}
        onDeclined={vi.fn()}
        redFlagCount={0}
      />
    );

    fireEvent.click(screen.getByText("I Don't Know"));
    expect(handleDontKnow).toHaveBeenCalledTimes(1);
  });

  it('renders RedFlagAlert banner when redFlagCount > 0', () => {
    render(
      <CaseTakingScreen
        language="en"
        question={sampleQuestion}
        progress={null}
        isLoading={false}
        onSubmitAnswer={vi.fn()}
        onSkip={vi.fn()}
        onDontKnow={vi.fn()}
        onDeclined={vi.fn()}
        redFlagCount={1}
      />
    );

    expect(screen.getByText('Important Clinical Note')).toBeInTheDocument();
    expect(screen.getByText(/urgent symptom alert has been flagged/i)).toBeInTheDocument();
  });

  it('renders severity scale controls when question asks about severity', () => {
    const severityQ: NextQuestionData = {
      consultation_id: 'test-c-123',
      question_key: 'ap_severity',
      section: 'HPI',
      clinical_field: 'severity',
      question_text: 'On a scale of 1 to 10, how severe is the pain?',
      input_type: 'scale',
      is_required: true,
      is_complete: false,
      progress_percentage: 50,
    };

    render(
      <CaseTakingScreen
        language="en"
        question={severityQ}
        progress={null}
        isLoading={false}
        onSubmitAnswer={vi.fn()}
        onSkip={vi.fn()}
        onDontKnow={vi.fn()}
        onDeclined={vi.fn()}
        redFlagCount={0}
      />
    );

    expect(screen.getByRole('button', { name: 'Severity 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Severity 10' })).toBeInTheDocument();
  });
});
