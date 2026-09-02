import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PatientInfoForm } from '../components/PatientInfoForm';

describe('PatientInfoForm Component', () => {
  it('renders form fields with touch-friendly controls', () => {
    render(
      <PatientInfoForm
        language="en"
        onSubmit={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText('Patient Information')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. 45/i)).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Female')).toBeInTheDocument();
  });

  it('validates input and submits clean patient information', () => {
    const handleSubmit = vi.fn();
    render(
      <PatientInfoForm
        language="en"
        onSubmit={handleSubmit}
        onBack={vi.fn()}
      />
    );

    const nameInput = screen.getByPlaceholderText(/Enter your full name/i);
    const ageInput = screen.getByPlaceholderText(/e.g. 45/i);
    const femaleBtn = screen.getByRole('button', { name: 'Female' });

    fireEvent.change(nameInput, { target: { value: 'Sunita Sharma' } });
    fireEvent.change(ageInput, { target: { value: '38' } });
    fireEvent.click(femaleBtn);

    const submitBtn = screen.getByRole('button', { name: /Begin Health Questions/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Sunita Sharma',
        age: '38',
        sex: 'female',
        preferredLanguage: 'en',
      })
    );
  });
});
