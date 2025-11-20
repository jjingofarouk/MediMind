import React, { useState } from 'react';
import { SAMPLE_CASES } from '../constants';
import { PatientCase } from '../types';

interface CaseFormProps {
  onSubmit: (data: PatientCase) => void;
  isLoading: boolean;
}

export const CaseForm: React.FC<CaseFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PatientCase>({
    age: '',
    sex: '',
    chiefComplaint: '',
    history: '',
    vitals: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const loadSample = (index: number) => {
    setFormData(SAMPLE_CASES[index]);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-teal-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Patient Intake</h2>
          <div className="flex space-x-2">
            <button onClick={() => loadSample(0)} className="text-xs bg-teal-700 text-teal-100 px-2 py-1 rounded hover:bg-teal-800">Sample 1</button>
            <button onClick={() => loadSample(1)} className="text-xs bg-teal-700 text-teal-100 px-2 py-1 rounded hover:bg-teal-800">Sample 2</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input
                type="text"
                name="age"
                required
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                placeholder="e.g., 45"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sex</label>
              <select
                name="sex"
                required
                value={formData.sex}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chief Complaint</label>
            <input
              type="text"
              name="chiefComplaint"
              required
              value={formData.chiefComplaint}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              placeholder="Main reason for visit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">History of Present Illness (HPI)</label>
            <textarea
              name="history"
              required
              value={formData.history}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Describe symptom onset, duration, characteristics, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vitals & Notes (Optional)</label>
            <textarea
              name="vitals"
              value={formData.vitals}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition resize-none"
              placeholder="BP, HR, Temp, O2 sat, etc."
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl text-white font-semibold shadow-lg transition-all transform hover:-translate-y-0.5 ${
                isLoading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Case...
                </span>
              ) : 'Generate Differential Diagnosis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};