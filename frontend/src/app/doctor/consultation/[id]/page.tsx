'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doctorApi } from '../../../../lib/api';
import { DoctorConsultationSummary, SummaryItem } from '../../../../lib/doctorTypes';
import { ArrowLeft, Check, CheckCircle2, AlertTriangle, FileText, Activity, Save, Edit3, X } from 'lucide-react';
import { Task8Widgets } from '../../../../components/Task8Widgets';

export default function ConsultationReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [summary, setSummary] = useState<DoctorConsultationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchSummary();
    }
  }, [id]);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorApi.getSummary(id);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load consultation summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (item: SummaryItem, isAnswer: boolean) => {
    try {
      await doctorApi.verifyEntity(item.id, isAnswer, 'confirmed');
      await fetchSummary(); // Refresh
    } catch (err: any) {
      alert(`Error verifying: ${err.message}`);
    }
  };

  const handleSaveEdit = async (item: SummaryItem, isAnswer: boolean) => {
    if (!editValue.trim()) return;
    try {
      await doctorApi.verifyEntity(item.id, isAnswer, 'edited', editValue);
      setEditingItem(null);
      await fetchSummary(); // Refresh
    } catch (err: any) {
      alert(`Error saving: ${err.message}`);
    }
  };

  const handleFinalize = async () => {
    if (!summary) return;
    setIsFinalizing(true);
    try {
      await doctorApi.finalizeConsultation(summary.consultation_id);
      router.push('/doctor');
    } catch (err: any) {
      alert(`Error finalizing: ${err.message}`);
      setIsFinalizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-3xl mx-auto flex items-start">
          <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold">Error Loading Summary</h3>
            <p>{error}</p>
            <button onClick={() => router.push('/doctor')} className="mt-4 text-blue-600 font-medium">
              &larr; Back to Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/doctor')} className="hover:bg-blue-800 p-2 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold leading-tight">{summary.patient_name}</h1>
              <p className="text-sm text-blue-200">
                {summary.patient_age ? `${summary.patient_age} yrs` : ''} 
                {summary.patient_sex ? ` • ${summary.patient_sex}` : ''}
                {summary.patient_mrn ? ` • MRN: ${summary.patient_mrn}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold">
              {summary.status.replace('_', ' ')}
            </span>
            {summary.status !== 'completed' && (
              <button 
                onClick={handleFinalize}
                disabled={isFinalizing}
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md font-medium shadow-sm transition disabled:opacity-50 flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                {isFinalizing ? 'Finalizing...' : 'Finalize Review'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Column (Primary Info) */}
        <div className="md:w-2/3 space-y-6">
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-sm text-yellow-800 flex items-start">
            <Activity className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              <span className="font-bold">AI-assisted pre-consultation summary for physician review.</span> 
              {" "}This information was collected from the patient and uploaded documents. Verify critical information before making clinical decisions.
            </p>
          </div>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
              <h2 className="text-lg font-bold text-gray-800">Chief Complaint</h2>
            </div>
            <div className="p-5">
              <p className="text-lg text-gray-900">{summary.chief_complaint || 'Not provided'}</p>
            </div>
          </section>

          {Object.entries(summary.sections).map(([sectionName, section]) => {
            if (section.items.length === 0) return null;
            
            return (
              <section key={sectionName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                  <h2 className="text-lg font-bold text-gray-800">{sectionName}</h2>
                </div>
                <div className="p-0">
                  <ul className="divide-y divide-gray-100">
                    {section.items.map((item) => (
                      <li key={item.id} className="p-5 hover:bg-gray-50 transition">
                        {editingItem === item.id ? (
                          <div className="flex items-start flex-col sm:flex-row gap-3">
                            <input 
                              type="text" 
                              value={editValue} 
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-grow border border-blue-300 rounded-md p-2 focus:ring focus:ring-blue-200 outline-none w-full"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleSaveEdit(item, item.provenance.source_type.includes('patient'))}
                                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => setEditingItem(null)}
                                className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-grow">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                                {item.clinical_field.replace(/_/g, ' ')}
                              </span>
                              <p className="text-gray-900 font-medium whitespace-pre-wrap">{item.value}</p>
                              
                              <div className="flex items-center space-x-3 mt-2 text-xs">
                                <span className={`flex items-center ${item.provenance.source_type.includes('document') ? 'text-indigo-600' : 'text-blue-600'}`}>
                                  {item.provenance.source_type.includes('document') ? (
                                    <><FileText className="w-3 h-3 mr-1"/> Extracted from Document</>
                                  ) : (
                                    <><Activity className="w-3 h-3 mr-1"/> Patient Reported</>
                                  )}
                                </span>
                                {item.provenance.confidence && (
                                  <span className="text-gray-500">
                                    Conf: {Math.round(item.provenance.confidence * 100)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {summary.status !== 'completed' && (
                              <div className="flex items-start space-x-2 shrink-0">
                                {item.verification_status === 'confirmed' || item.verification_status === 'edited' ? (
                                  <span className="flex items-center text-green-600 text-sm font-medium px-3 py-1.5 bg-green-50 rounded-md">
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                    Verified
                                  </span>
                                ) : (
                                  <button 
                                    onClick={() => handleVerify(item, item.provenance.source_type.includes('patient'))}
                                    className="flex items-center text-gray-600 hover:text-green-600 text-sm font-medium px-3 py-1.5 bg-white border border-gray-200 hover:border-green-300 rounded-md transition"
                                  >
                                    <Check className="w-4 h-4 mr-1.5" />
                                    Verify
                                  </button>
                                )}
                                <button 
                                  onClick={() => {
                                    setEditingItem(item.id);
                                    setEditValue(item.value);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
        
        {/* Right Column (Red Flags & Docs) */}
        <div className="md:w-1/3 space-y-6">
          
          {summary.red_flags && summary.red_flags.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <h2 className="text-lg font-bold text-red-800">Red Flags</h2>
              </div>
              <div className="p-0">
                <ul className="divide-y divide-red-100">
                  {summary.red_flags.map((flag) => (
                    <li key={flag.id} className="p-4">
                      <h4 className="font-bold text-red-700 text-sm mb-1">{flag.rule}</h4>
                      <p className="text-red-900 text-sm">{flag.message}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Documents</h2>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {summary.documents?.length || 0}
              </span>
            </div>
            <div className="p-4">
              {summary.documents && summary.documents.length > 0 ? (
                <ul className="space-y-3">
                  {summary.documents.map((doc) => (
                    <li key={doc.id} className="flex items-start">
                      <FileText className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 break-all">{doc.filename}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">{doc.document_type.replace('_', ' ')}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No documents uploaded.</p>
              )}
            </div>
          </section>

          <Task8Widgets consultationId={summary.consultation_id} patientId={summary.patient_id} />

        </div>
      </main>
    </div>
  );
}
