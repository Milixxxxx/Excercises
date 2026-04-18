
export type BreathingPhase = 'Inhale' | 'Hold' | 'Exhale' | 'HoldEmpty';

export interface BreathingPattern {
  id: string;
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdEmpty: number;
  description: string;
}

export interface BreathLog {
  id: string;
  date: string;
  technique: string;
  duration: number; // in seconds
  tensionBefore: number; // 1-10
  tensionAfter: number; // 1-10
}

export interface AppSettings {
  voiceEnabled: boolean;
  soundscapeEnabled: boolean;
  balloonColor: string;
}
