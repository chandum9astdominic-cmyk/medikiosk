import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError } from '../lib/api';

describe('API Client & Engine Integration', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('createConsultation sends correct POST payload and returns consultation id', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        consultation_id: 'test-uuid-1234',
        status: 'created',
        pathway: 'triage',
      }),
    });

    const res = await api.createConsultation('patient-123', 'triage');
    expect(res.consultation_id).toBe('test-uuid-1234');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/consultations'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          patient_id: 'patient-123',
          pathway_id: 'triage',
        }),
      })
    );
  });

  it('getNextQuestion sends localized language parameter', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        consultation_id: 'test-uuid-1234',
        question_key: 'ap_location',
        section: 'HPI',
        question_text: 'पेट में दर्द ठीक कहाँ है?',
        is_complete: false,
        progress_percentage: 25,
      }),
    });

    const res = await api.getNextQuestion('test-uuid-1234', 'hi');
    expect(res.question_key).toBe('ap_location');
    expect(res.question_text).toBe('पेट में दर्द ठीक कहाँ है?');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/consultations/test-uuid-1234/next-question?language=hi'),
      expect.anything()
    );
  });

  it('submitAnswer passes raw_text and language in body', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'success',
        message: 'Answer saved and rules evaluated',
      }),
    });

    const res = await api.submitAnswer('test-uuid-1234', 'ap_location', 'Right lower quadrant', 'en');
    expect(res.status).toBe('success');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/consultations/test-uuid-1234/answers?question_key=ap_location'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          raw_text: 'Right lower quadrant',
          language: 'en',
        }),
      })
    );
  });

  it('completeConsultation posts to complete endpoint', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'success',
        message: 'Consultation marked as completed',
      }),
    });

    const res = await api.completeConsultation('test-uuid-1234');
    expect(res.status).toBe('success');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/consultations/test-uuid-1234/complete'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('handles network errors with calm patient-friendly message without stack trace leakage', async () => {
    (global.fetch as any).mockRejectedValue(new Error('ECONNREFUSED 127.0.0.1:8000'));

    await expect(api.getProgress('test-uuid-1234')).rejects.toThrow(
      'Unable to connect to the medical server. Please notify kiosk assistance.'
    );
  });
});
