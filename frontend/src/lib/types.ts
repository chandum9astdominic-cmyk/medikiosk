export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface PatientInfo {
  id?: string;
  name: string;
  age: string;
  sex: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  preferredLanguage: SupportedLanguage;
  mrn?: string;
  phone?: string;
  abhaId?: string;
}

export type StepType = 
  | 'welcome' 
  | 'language' 
  | 'consent' 
  | 'patient_info' 
  | 'questions' 
  | 'review' 
  | 'completed';

export type QuestionInputType = 
  | 'text' 
  | 'long_text' 
  | 'yes_no' 
  | 'single_choice' 
  | 'multi_choice' 
  | 'numeric' 
  | 'severity_scale' 
  | 'scale'
  | 'date'
  | 'duration';

export interface NextQuestionData {
  consultation_id: string;
  question_key?: string | null;
  section?: string | null;
  question_text?: string | null;
  input_type?: string | null;
  options?: string[] | null;
  is_required?: boolean;
  is_complete: boolean;
  progress_percentage: number;
  clinical_field?: string | null;
}

export interface AnswerSubmissionPayload {
  raw_text: string;
  language: string;
}

export interface ConsultationProgressData {
  consultation_id: string;
  status: string;
  completed_questions: string[];
  pending_questions: string[];
  red_flags_triggered: number;
}

export interface ReviewItem {
  question_key: string;
  section: string;
  clinical_field?: string;
  question_text: string;
  answer_text?: string;
  answer_status: 'answered' | 'not_known' | 'declined' | 'skipped';
  source?: string;
  verification_status?: string;
}

export interface ConsultationSummaryData {
  consultation_id: string;
  patient_id: string;
  status: string;
  chief_complaint?: string;
  complaint_category?: string;
  answers_by_section: Record<string, ReviewItem[]>;
  red_flags_count: number;
}
