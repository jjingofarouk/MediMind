export enum AppMode {
  CASE_INPUT = 'CASE_INPUT',
  DIAGNOSIS_VIEW = 'DIAGNOSIS_VIEW',
  CHAT = 'CHAT',
  LIVE_CONSULT = 'LIVE_CONSULT'
}

export interface PatientCase {
  age: string;
  sex: string;
  chiefComplaint: string;
  history: string;
  vitals: string;
}

export interface DiagnosisItem {
  condition: string;
  probability: number;
  reasoning: string;
  testsRecommended: string[];
}

export interface DiagnosisResult {
  differential: DiagnosisItem[];
  summary: string;
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: Array<{ title: string; uri: string }>;
}

export interface AudioState {
  isPlaying: boolean;
  isRecording: boolean;
  volume: number;
}
