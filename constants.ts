export const MODELS = {
  DIAGNOSIS: 'gemini-3-pro-preview', // Complex reasoning
  CHAT: 'gemini-3-pro-preview', // Deep chat
  RESEARCH: 'gemini-2.5-flash', // Search grounding
  TTS: 'gemini-2.5-flash-preview-tts', // Speech
  LIVE: 'gemini-2.5-flash-native-audio-preview-09-2025' // Real-time
};

export const DEFAULT_CASE = {
  age: '',
  sex: '',
  chiefComplaint: '',
  history: '',
  vitals: ''
};

export const SAMPLE_CASES = [
  {
    age: '45',
    sex: 'Male',
    chiefComplaint: 'Sudden onset chest pain',
    history: 'Patient reports tearing sensation radiating to back. Hypertensive history. Smoker (1 pack/day for 20 years).',
    vitals: 'BP 160/95, HR 110, RR 22, O2 96% RA'
  },
  {
    age: '28',
    sex: 'Female',
    chiefComplaint: 'Right lower quadrant pain',
    history: 'Pain started periumbilical 12 hours ago, migrated to RLQ. Nausea, one episode of vomiting. No fever reported at home.',
    vitals: 'Temp 37.8C, HR 88, BP 110/70'
  }
];
