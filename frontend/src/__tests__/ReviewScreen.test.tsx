import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReviewScreen } from '../components/ReviewScreen';
import { ConsultationSummaryData } from '../lib/types';

describe('ReviewScreen Component', () => {
  const sampleSummary: ConsultationSummaryData = {
    consultation_id: 'test-c-123',
    patient_id: 'test-p-123',
    status: 'intake',
    chief_complaint: 'Abdominal Pain',
    answers_by_section: {
      HPI: [
        {
          question_key: 'ap_location',
          section: 'HPI',
          clinical_field: 'location',
          question_text: 'Where exactly is the pain located?',
          answer_text: 'Right lower quadrant',
          answer_status: 'answered',
        },
        {
          question_key: 'ap_onset',
          section: 'HPI',
          clinical_field: 'onset',
          question_text: 'When did the pain start?',
          answer_text: '2 days ago',
          answer_status: 'answered',
        },
        {
          question_key: 'ap_associated_symptoms',
          section: 'HPI',
          clinical_field: 'associated_symptoms',
          question_text: 'Any fever or vomiting?',
          answer_text: undefined,
          answer_status: 'not_known',
        },
      ],
    },
    red_flags_count: 1,
  };

  it('renders chief complaint, grouped answers, and badges', () => {
    render(
      <ReviewScreen
        language="en"
        summary={sampleSummary}
        onEditAnswer={vi.fn()}
        onConfirm={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText('Review Your Health History')).toBeInTheDocument();
    expect(screen.getByText('Abdominal Pain')).toBeInTheDocument();
    expect(screen.getByText('Where exactly is the pain located?')).toBeInTheDocument();
    expect(screen.getByText('Right lower quadrant')).toBeInTheDocument();
    expect(screen.getByText('Not Known')).toBeInTheDocument();
    expect(screen.getAllByText('Change').length).toBe(3);
  });

  it('triggers onEditAnswer when Change button is touched', () => {
    const handleEdit = vi.fn();
    render(
      <ReviewScreen
        language="en"
        summary={sampleSummary}
        onEditAnswer={handleEdit}
        onConfirm={vi.fn()}
        isLoading={false}
      />
    );

    const changeButtons = screen.getAllByText('Change');
    fireEvent.click(changeButtons[0]);
    expect(handleEdit).toHaveBeenCalledWith('ap_location');
  });

  it('triggers onConfirm when Confirm & Submit is clicked', () => {
    const handleConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <ReviewScreen
        language="en"
        summary={sampleSummary}
        onEditAnswer={vi.fn()}
        onConfirm={handleConfirm}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirm & Submit to Doctor/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
});
