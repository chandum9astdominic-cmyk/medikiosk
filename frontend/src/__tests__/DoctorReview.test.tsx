import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ConsultationReviewPage from '../app/doctor/consultation/[id]/page';
import { doctorApi } from '../lib/api';

vi.mock('../lib/api', () => ({
  doctorApi: {
    getSummary: vi.fn(),
    verifyEntity: vi.fn(),
    finalizeConsultation: vi.fn()
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useParams: () => ({
    id: 'test-id'
  })
}));

describe('Consultation Review Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders summary data correctly', async () => {
    (doctorApi.getSummary as any).mockResolvedValueOnce({
      consultation_id: 'test-id',
      patient_name: 'Jane Doe',
      patient_age: 30,
      patient_sex: 'Female',
      status: 'under_review',
      chief_complaint: 'Stomach ache',
      sections: {
        'History of Present Illness': {
          name: 'History of Present Illness',
          items: [
            {
              id: 'item-1',
              clinical_field: 'pain_duration',
              value: '2 days',
              verification_status: 'unverified',
              provenance: { source_type: 'patient_reported' }
            }
          ]
        }
      },
      red_flags: [],
      documents: []
    });

    render(<ConsultationReviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/30 yrs/)).toBeInTheDocument();
    expect(screen.getByText('Stomach ache')).toBeInTheDocument();
    expect(screen.getByText('pain duration')).toBeInTheDocument();
    expect(screen.getByText('2 days')).toBeInTheDocument();
  });

  it('allows verifying an entity', async () => {
    (doctorApi.getSummary as any).mockResolvedValue({
      consultation_id: 'test-id',
      patient_name: 'Jane Doe',
      status: 'under_review',
      sections: {
        'HPI': {
          name: 'HPI',
          items: [
            {
              id: 'item-1',
              clinical_field: 'pain_duration',
              value: '2 days',
              verification_status: 'unverified',
              provenance: { source_type: 'patient_reported' }
            }
          ]
        }
      },
      red_flags: [],
      documents: []
    });
    
    (doctorApi.verifyEntity as any).mockResolvedValue({});

    render(<ConsultationReviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const verifyBtn = screen.getByText('Verify');
    fireEvent.click(verifyBtn);

    expect(doctorApi.verifyEntity).toHaveBeenCalledWith('item-1', true, 'confirmed');
  });
});
