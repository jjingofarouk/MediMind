import React, { useState } from 'react';
import { AppMode, PatientCase, DiagnosisResult } from './types';
import { Header } from './components/Header';
import { CaseForm } from './components/CaseForm';
import { DiagnosisView } from './components/DiagnosisView';
import { ChatInterface } from './components/ChatInterface';
import { LiveConsultant } from './components/LiveConsultant';
import { generateDiagnosis } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CASE_INPUT);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCaseSubmit = async (data: PatientCase) => {
    setIsProcessing(true);
    try {
      const patientString = `
        Age: ${data.age}
        Sex: ${data.sex}
        CC: ${data.chiefComplaint}
        HPI: ${data.history}
        Vitals: ${data.vitals}
      `;
      const result = await generateDiagnosis(patientString);
      setDiagnosis(result);
      setMode(AppMode.DIAGNOSIS_VIEW);
    } catch (error) {
      console.error("Diagnosis generation failed", error);
      alert("Failed to generate diagnosis. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.CASE_INPUT:
        return <CaseForm onSubmit={handleCaseSubmit} isLoading={isProcessing} />;
      case AppMode.DIAGNOSIS_VIEW:
        return <DiagnosisView result={diagnosis} />;
      case AppMode.CHAT:
        return <ChatInterface />;
      case AppMode.LIVE_CONSULT:
        return <LiveConsultant />;
      default:
        return <CaseForm onSubmit={handleCaseSubmit} isLoading={isProcessing} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header currentMode={mode} setMode={setMode} />
      
      <main className="pt-4 pb-24 md:pb-8">
        {renderContent()}
      </main>

      {/* Load Material Icons */}
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    </div>
  );
};

export default App;
