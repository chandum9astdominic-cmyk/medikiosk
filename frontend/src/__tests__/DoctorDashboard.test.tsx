import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DoctorDashboard from '../app/doctor/page';
import { doctorApi } from '../lib/api';

vi.mock('../lib/api', () => ({
  doctorApi: {
    getQueue: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Doctor Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading initially and fetches queue', async () => {
    (doctorApi.getQueue as any).mockResolvedValueOnce([]);
    render(<DoctorDashboard />);
    expect(doctorApi.getQueue).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Waiting Room Queue')).toBeInTheDocument();
  });

  it('renders queue items when data is provided', async () => {
    (doctorApi.getQueue as any).mockResolvedValueOnce([
      {
        consultation_id: '1234',
        patient_name: 'John Doe',
        patient_age: 45,
        patient_sex: 'Male',
        status: 'under_review',
        chief_complaint: 'Fever',
        red_flag_count: 1,
        document_count: 2,
      },
    ]);
    
    render(<DoctorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('45 yrs • Male')).toBeInTheDocument();
    expect(screen.getByText(/Fever/)).toBeInTheDocument();
    expect(screen.getByText(/1 Flags/)).toBeInTheDocument();
    expect(screen.getByText(/2 Docs/)).toBeInTheDocument();
  });
});
