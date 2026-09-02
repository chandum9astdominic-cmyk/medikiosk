export interface SummaryItemProvenance {
  source_type: string;
  source_id?: string;
  confidence?: number;
}

export interface SummaryItem {
  id: string;
  category: string;
  clinical_field: string;
  value: string;
  normalized_value?: string;
  verification_status: 'unverified' | 'confirmed' | 'rejected' | 'edited';
  provenance: SummaryItemProvenance;
  metadata?: Record<string, any>;
}

export interface ClinicalSection {
  name: string;
  items: SummaryItem[];
}

export interface DoctorQueueItem {
  consultation_id: string;
  patient_id: string;
  patient_name: string;
  patient_age?: number;
  patient_sex?: string;
  status: string;
  chief_complaint?: string;
  priority: number;
  red_flag_count: number;
  document_count: number;
  submitted_at?: string;
}

export interface DoctorConsultationSummary {
  consultation_id: string;
  patient_id: string;
  patient_name: string;
  patient_age?: number;
  patient_sex?: string;
  patient_mrn?: string;
  status: string;
  chief_complaint?: string;
  sections: Record<string, ClinicalSection>;
  red_flags: Array<{
    id: string;
    rule: string;
    severity: string;
    message: string;
  }>;
  documents: Array<{
    id: string;
    filename: string;
    document_type: string;
  }>;
  submitted_at?: string;
  completed_at?: string;
}
