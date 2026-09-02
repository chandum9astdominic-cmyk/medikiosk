'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doctorApi } from '../../lib/api';
import { DoctorQueueItem } from '../../lib/doctorTypes';
import { Users, AlertTriangle, FileText, Activity } from 'lucide-react';

export default function DoctorDashboard() {
  const [queue, setQueue] = useState<DoctorQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorApi.getQueue();
      setQueue(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient queue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-blue-300" />
          <div>
            <h1 className="text-xl font-bold leading-tight">MediKiosk Doctor Portal</h1>
            <p className="text-sm text-blue-200">Patient Pre-Consultation Summaries</p>
          </div>
        </div>
        <button 
          onClick={fetchQueue}
          className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-md transition"
        >
          Refresh Queue
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2 mb-6 text-gray-800">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Waiting Room Queue</h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : queue.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No patients in queue</h3>
            <p className="text-gray-500 mt-2">New pre-consultation summaries will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {queue.map((item) => (
              <div 
                key={item.consultation_id} 
                className={`bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition cursor-pointer flex flex-col ${
                  item.red_flag_count > 0 ? 'border-l-4 border-l-red-500' : 'border-gray-200 border-l-4 border-l-blue-500'
                }`}
                onClick={() => router.push(`/doctor/consultation/${item.consultation_id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{item.patient_name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.patient_age ? `${item.patient_age} yrs` : 'Age unknown'} • {item.patient_sex || 'Sex unknown'}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold">
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="mb-4 flex-grow">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">CC:</span> {item.chief_complaint || 'Not provided'}
                  </p>
                </div>
                
                <div className="flex space-x-3 pt-3 border-t border-gray-100">
                  {item.red_flag_count > 0 && (
                    <div className="flex items-center text-red-600 text-sm font-medium">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {item.red_flag_count} Flags
                    </div>
                  )}
                  {item.document_count > 0 && (
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <FileText className="w-4 h-4 mr-1" />
                      {item.document_count} Docs
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
