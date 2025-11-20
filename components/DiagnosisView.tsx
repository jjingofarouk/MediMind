import React, { useState } from 'react';
import { DiagnosisResult, DiagnosisItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateAudio, searchMedicalLiterature } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface DiagnosisViewProps {
  result: DiagnosisResult | null;
}

export const DiagnosisView: React.FC<DiagnosisViewProps> = ({ result }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [researchResult, setResearchResult] = useState<{query: string, text: string} | null>(null);
  const [isResearching, setIsResearching] = useState(false);

  if (!result) return (
    <div className="flex flex-col items-center justify-center h-96 text-slate-400">
      <p>No diagnosis generated yet.</p>
    </div>
  );

  const handleSpeak = async () => {
    if (isPlaying) return;
    try {
      setIsPlaying(true);
      const textToRead = `Summary of the case. ${result.summary}. Top diagnosis is ${result.differential[0].condition}.`;
      const audioBuffer = await generateAudio(textToRead);
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      
      const decoded = await ctx.decodeAudioData(audioBuffer);
      const source = ctx.createBufferSource();
      source.buffer = decoded;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start(0);
    } catch (e) {
      console.error("TTS Error", e);
      setIsPlaying(false);
    }
  };

  const handleResearch = async (condition: string) => {
    setIsResearching(true);
    try {
      const res = await searchMedicalLiterature(condition);
      setResearchResult({ query: condition, text: res });
    } catch (e) {
      console.error(e);
    } finally {
      setIsResearching(false);
    }
  };

  const chartData = result.differential.map(d => ({
    name: d.condition,
    prob: d.probability,
    reason: d.reasoning
  }));

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Col: Summary & Chart */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Clinical Summary</h2>
            <button 
              onClick={handleSpeak}
              disabled={isPlaying}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isPlaying ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="material-icons text-sm">{isPlaying ? 'volume_up' : 'volume_down'}</span>
              {isPlaying ? 'Speaking...' : 'Read Aloud'}
            </button>
          </div>
          <p className="text-slate-600 leading-relaxed text-lg">{result.summary}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Probability Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="prob" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#0d9488' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {researchResult && (
           <div className="bg-blue-50 rounded-2xl shadow-sm p-6 border border-blue-100">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-blue-900">Research: {researchResult.query}</h3>
               <button onClick={() => setResearchResult(null)} className="text-blue-500 hover:text-blue-700">Close</button>
             </div>
             <div className="prose prose-sm text-blue-800">
               <ReactMarkdown>{researchResult.text}</ReactMarkdown>
             </div>
           </div>
        )}
      </div>

      {/* Right Col: List Details */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 px-2">Differential Details</h3>
        {result.differential.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-teal-300 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-800">{item.condition}</h4>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                item.probability > 70 ? 'bg-red-100 text-red-700' : 
                item.probability > 40 ? 'bg-amber-100 text-amber-700' : 
                'bg-green-100 text-green-700'
              }`}>{item.probability}%</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{item.reasoning}</p>
            
            <div className="mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recommended Tests</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.testsRecommended.map(t => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{t}</span>
                ))}
              </div>
            </div>

            <button 
              onClick={() => handleResearch(item.condition)}
              disabled={isResearching}
              className="w-full mt-2 text-xs bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 font-medium flex items-center justify-center gap-2"
            >
              <span>Check Literature</span>
              {isResearching && researchResult?.query === item.condition && <span className="animate-spin h-3 w-3 border-2 border-blue-600 rounded-full border-t-transparent"></span>}
            </button>
          </div>
        ))}
        <div className="text-xs text-slate-400 mt-8 px-4 text-center">
          {result.disclaimer}
        </div>
      </div>
    </div>
  );
};
