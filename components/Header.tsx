import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { id: AppMode.CASE_INPUT, label: 'New Case', icon: 'clinical_notes' },
    { id: AppMode.DIAGNOSIS_VIEW, label: 'Diagnosis', icon: 'vital_signs' },
    { id: AppMode.CHAT, label: 'AI Chat', icon: 'chat' },
    { id: AppMode.LIVE_CONSULT, label: 'Live Consultant', icon: 'mic' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => setMode(AppMode.CASE_INPUT)}>
            <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
              M
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">MediMind<span className="text-teal-600">AI</span></h1>
          </div>
          
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center ${
                  currentMode === item.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Mobile Menu Button Placeholder - simplified for this output */}
          <div className="md:hidden">
             <span className="text-teal-600 font-medium text-sm">{navItems.find(i => i.id === currentMode)?.label}</span>
          </div>
        </div>
      </div>
      {/* Mobile Nav Bar (Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-3 z-50 safe-area-pb">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`flex flex-col items-center justify-center w-full ${
               currentMode === item.id ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            <span className="material-icons text-2xl mb-1 block h-6 w-6 bg-current opacity-20 rounded-full"></span> 
            {/* Using simplified visual indicator instead of icons font dep to save load time/complexity, normally would use proper SVG icons */}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
