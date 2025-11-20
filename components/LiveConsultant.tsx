import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MODELS } from '../constants';
import { decodeAudioData, createPcmBlob } from '../utils/audioUtils';

export const LiveConsultant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [volume, setVolume] = useState(0);
  
  // Refs for persistent audio context/nodes across renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null); // Holds the Live Session
  
  // Visualizer
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startSession = async () => {
    setStatus('connecting');
    try {
      // 1. Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      
      // 2. Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 3. Setup Gemini Live
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: MODELS.LIVE,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: "You are an experienced medical consultant named Dr. Gemini. Discuss the differential diagnosis with the user in a professional yet conversational tone. Keep responses concise."
        },
        callbacks: {
          onopen: () => {
            setStatus('connected');
            setIsActive(true);
            
            // Setup Input Processing
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Calculate volume for visualizer
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
              setVolume(Math.sqrt(sum/inputData.length));

              const pcmBlob = createPcmBlob(inputData, 16000);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputCtx) {
              const binary = atob(audioData);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              
              const buffer = await decodeAudioData(bytes, outputCtx, 24000, 1);
              
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              const currentTime = outputCtx.currentTime;
              const startTime = Math.max(currentTime, nextStartTimeRef.current);
              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;
            }
          },
          onclose: () => {
            setStatus('idle');
            setIsActive(false);
          },
          onerror: (err) => {
            console.error(err);
            setStatus('error');
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error("Failed to start live session", e);
      setStatus('error');
    }
  };

  const stopSession = () => {
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    // We can't easily force close the session object from the SDK without holding the session instance
    // Usually reloading the page or just stopping input is enough for MVP
    setIsActive(false);
    setStatus('idle');
    window.location.reload(); // Hard reset for safety in this demo structure
  };

  // Simple Visualizer
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, 300, 100);
      const barHeight = volume * 500;
      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.arc(150, 50, 20 + barHeight, 0, 2 * Math.PI);
      ctx.fill();
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isActive, volume]);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="text-center space-y-8 max-w-md w-full">
        <div className="relative">
          <div className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
            status === 'connected' ? 'bg-teal-50 ring-4 ring-teal-100' : 'bg-slate-100'
          }`}>
             {status === 'connected' ? (
               <canvas ref={canvasRef} width={300} height={100} className="absolute inset-0 w-full h-full rounded-full opacity-50" />
             ) : null}
             <span className={`material-icons text-6xl ${
               status === 'connected' ? 'text-teal-600' : 'text-slate-400'
             }`}>
               mic
             </span>
          </div>
          {status === 'connecting' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">
            {status === 'idle' && "Start Consultation"}
            {status === 'connecting' && "Connecting..."}
            {status === 'connected' && "Live Consultant Active"}
            {status === 'error' && "Connection Error"}
          </h2>
          <p className="text-slate-500">
            {status === 'connected' 
              ? "Speak naturally to discuss the case." 
              : "Use your voice to brainstorm diagnoses in real-time with Gemini."}
          </p>
        </div>

        <button
          onClick={status === 'connected' ? stopSession : startSession}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
            status === 'connected' 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {status === 'connected' ? 'End Session' : 'Start Live Session'}
        </button>
      </div>
    </div>
  );
};