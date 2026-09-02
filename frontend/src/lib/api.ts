import { 
  NextQuestionData, 
  ConsultationProgressData, 
  ConsultationSummaryData, 
  SupportedLanguage 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const message = errorData?.detail || 'The kiosk system encountered a communication issue.';
      throw new ApiError(message, res.status);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError('Unable to connect to the medical server. Please notify kiosk assistance.');
  }
}

export const api = {
  /**
   * Create a new consultation session
   */
  async createConsultation(patientId: string, pathwayId: string = 'abdominal_pain'): Promise<{
    consultation_id: string;
    status: string;
    pathway: string;
  }> {
    return request('/consultations', {
      method: 'POST',
      body: JSON.stringify({
        patient_id: patientId,
        pathway_id: pathwayId,
      }),
    });
  },

  /**
   * Fetch the next localized question from the backend engine
   */
  async getNextQuestion(consultationId: string, language: SupportedLanguage = 'en'): Promise<NextQuestionData> {
    return request(`/consultations/${consultationId}/next-question?language=${language}`);
  },

  /**
   * Submit patient answer to backend engine
   */
  async submitAnswer(
    consultationId: string, 
    questionKey: string, 
    rawText: string, 
    language: SupportedLanguage = 'en'
  ): Promise<{ status: string; message: string }> {
    return request(`/consultations/${consultationId}/answers?question_key=${encodeURIComponent(questionKey)}`, {
      method: 'POST',
      body: JSON.stringify({
        raw_text: rawText,
        language: language,
      }),
    });
  },

  /**
   * Get intake questionnaire progress and red flag count
   */
  async getProgress(consultationId: string): Promise<ConsultationProgressData> {
    return request(`/consultations/${consultationId}/progress`);
  },

  /**
   * Get review summary of all collected data
   */
  async getSummary(consultationId: string, language: SupportedLanguage = 'en'): Promise<ConsultationSummaryData> {
    return request(`/consultations/${consultationId}/summary?language=${language}`);
  },

  /**
   * Complete and submit consultation to physician
   */
  async completeConsultation(consultationId: string): Promise<{ status: string; message: string }> {
    return request(`/consultations/${consultationId}/complete`, {
      method: 'POST',
    });
  },
};

// DOCTOR API
import { DoctorQueueItem, DoctorConsultationSummary } from './doctorTypes';

export const doctorApi = {
  getQueue: async (): Promise<DoctorQueueItem[]> => {
    return request<DoctorQueueItem[]>('/doctor/queue');
  },
  
  getSummary: async (consultationId: string): Promise<DoctorConsultationSummary> => {
    return request<DoctorConsultationSummary>(`/doctor/consultations/${consultationId}/summary`);
  },
  
  verifyEntity: async (entityId: string, isAnswer: boolean, verificationStatus: string, editedValue?: string): Promise<any> => {
    return request<any>(`/doctor/entities/${entityId}/verify?is_answer=${isAnswer}`, {
      method: 'PUT',
      body: JSON.stringify({
        verification_status: verificationStatus,
        edited_value: editedValue
      })
    });
  },
  
  finalizeConsultation: async (consultationId: string): Promise<any> => {
    return request<any>(`/doctor/consultations/${consultationId}/finalize`, {
      method: 'POST'
    });
  }
};
