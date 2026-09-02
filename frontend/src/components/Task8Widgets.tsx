'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Download, ShieldCheck, Leaf } from 'lucide-react';
import { api } from '../lib/api'; // Or use fetch directly

interface Props {
  consultationId: string;
  patientId: string;
}

export const Task8Widgets: React.FC<Props> = ({ consultationId, patientId }) => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [ayush, setAyush] = useState<any>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  
  // ABHA / FHIR State
  const [fhirBundle, setFhirBundle] = useState<string | null>(null);
  const [isGeneratingFhir, setIsGeneratingFhir] = useState(false);
  const [abhaId, setAbhaId] = useState('');
  const [abhaMessage, setAbhaMessage] = useState('');

  useEffect(() => {
    // Fetch timeline and AYUSH data
    const fetchTask8Data = async () => {
      try {
        const timelineRes = await fetch(`/api/v1/patients/${patientId}/timeline`);
        if (timelineRes.ok) setTimeline(await timelineRes.json());
        
        const ayushRes = await fetch(`/api/v1/consultations/${consultationId}/ayush`);
        if (ayushRes.ok) setAyush(await ayushRes.json());
      } catch (err) {
        console.error("Failed to load Task 8 data", err);
      }
    };
    fetchTask8Data();
  }, [consultationId, patientId]);

  const handleGenerateFhir = async () => {
    setIsGeneratingFhir(true);
    try {
      const res = await fetch(`/api/v1/integrations/fhir/mock/${consultationId}`);
      if (res.ok) {
        const data = await res.json();
        setFhirBundle(JSON.stringify(data, null, 2));
      } else {
        alert("Failed to generate FHIR Bundle.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingFhir(false);
    }
  };

  const handleLinkAbha = async () => {
    if (!abhaId) return;
    try {
      const res = await fetch(`/api/v1/integrations/abha/mock/link?patient_id=${patientId}&abha_number=${abhaId}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAbhaMessage(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* 1. AYUSH Assessment */}
      {ayush && (
        <section className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden">
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-3 flex items-center">
            <Leaf className="w-5 h-5 text-emerald-600 mr-2" />
            <h2 className="text-lg font-bold text-emerald-800">AYUSH Assessment</h2>
          </div>
          <div className="p-4 space-y-2">
            {ayush.prakriti && <div className="text-sm"><strong>Prakriti:</strong> {JSON.stringify(ayush.prakriti)}</div>}
            {ayush.vikriti && <div className="text-sm"><strong>Vikriti:</strong> {JSON.stringify(ayush.vikriti)}</div>}
            {ayush.sara && <div className="text-sm"><strong>Sara:</strong> {ayush.sara}</div>}
            <div className="mt-2 text-xs text-gray-500 italic">This data was collected from patient input.</div>
          </div>
        </section>
      )}

      {/* 2. Medical Timeline */}
      <section className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
        <div className="bg-purple-50 border-b border-purple-200 px-5 py-3 flex items-center justify-between cursor-pointer" onClick={() => setShowTimeline(!showTimeline)}>
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-bold text-purple-800">Medical Timeline</h2>
          </div>
          <span className="text-sm text-purple-600 font-medium">{showTimeline ? 'Hide' : 'Show'}</span>
        </div>
        {showTimeline && (
          <div className="p-4 max-h-96 overflow-y-auto space-y-4">
            {timeline.length === 0 ? <p className="text-sm text-gray-500">No events found.</p> : timeline.map((event, idx) => (
              <div key={idx} className="border-l-2 border-purple-200 pl-3 py-1 relative">
                <div className="absolute w-2 h-2 bg-purple-500 rounded-full -left-[5px] top-2"></div>
                <div className="text-xs font-semibold text-gray-500">{new Date(event.date).toLocaleString()}</div>
                <div className="text-sm font-bold text-gray-800 mt-1">{event.type}</div>
                <div className="text-sm text-gray-600">{event.content}</div>
                <div className="text-xs text-gray-400 mt-1">{event.source} • {event.verification}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Interoperability (ABHA/FHIR) */}
      <section className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
        <div className="bg-blue-50 border-b border-blue-200 px-5 py-3 flex items-center">
          <ShieldCheck className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-bold text-blue-800">Interoperability (Mock)</h2>
        </div>
        <div className="p-4 space-y-4">
          
          <div className="space-y-2 border-b border-gray-100 pb-4">
            <h3 className="text-sm font-bold text-gray-700">Link ABHA</h3>
            <div className="flex gap-2">
              <input type="text" value={abhaId} onChange={e => setAbhaId(e.target.value)} placeholder="91-xxxx-xxxx-xxxx" className="border rounded px-2 py-1 text-sm flex-grow" />
              <button onClick={handleLinkAbha} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">Link</button>
            </div>
            {abhaMessage && <p className="text-xs text-green-600">{abhaMessage}</p>}
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-gray-700">Export FHIR Bundle</h3>
            <button onClick={handleGenerateFhir} disabled={isGeneratingFhir} className="w-full bg-slate-800 text-white px-3 py-2 rounded text-sm font-medium flex justify-center items-center">
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingFhir ? 'Generating...' : 'Generate FHIR JSON'}
            </button>
            {fhirBundle && (
              <pre className="mt-3 p-2 bg-gray-50 border rounded text-[10px] overflow-x-auto max-h-48 text-gray-700">
                {fhirBundle}
              </pre>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};
