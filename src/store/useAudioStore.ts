import { create } from 'zustand';

export type Chord = {
  root: string;
  quality: string; // 'maj7', 'min7', '7', etc.
  duration: string;
  notes: string[]; // e.g., ['C4', 'E4', 'G4', 'B4']
};

interface AudioState {
  isPlaying: boolean;
  bpm: number;
  currentChord: Chord | null;
  detectedNote: string | null;
  detectedFrequency: number | null;
  
  // Sequencer State
  sequence: Chord[];
  currentStep: number;
  timeSignature: [number, number];
  isMetronomeOn: boolean;
  
  // Settings
  sensitivity: number;
  inputDeviceId: string;
  outputDeviceId: string;
  showSafeNotes: boolean;
  fretCount: 12 | 17 | 24;
  noteLabelMode: 'interval' | 'note' | 'combined';
  noteLingeringTime: number;

  setIsPlaying: (isPlaying: boolean) => void;
  setBpm: (bpm: number) => void;
  setCurrentChord: (chord: Chord | null) => void;
  setDetectedNote: (note: string | null, frequency?: number) => void;
  
  // Sequencer Actions
  addChord: (chord: Chord) => void;
  removeChord: (index: number) => void;
  setCurrentStep: (step: number) => void;
  setTimeSignature: (sig: [number, number]) => void;
  setIsMetronomeOn: (isOn: boolean) => void;
  
  // Settings Actions
  setSensitivity: (val: number) => void;
  setInputDeviceId: (id: string) => void;
  setOutputDeviceId: (id: string) => void;
  setShowSafeNotes: (show: boolean) => void;
  setFretCount: (count: 12 | 17 | 24) => void;
  setNoteLabelMode: (mode: 'interval' | 'note' | 'combined') => void;
  setNoteLingeringTime: (time: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  bpm: 120,
  currentChord: null,
  detectedNote: null,
  detectedFrequency: null,
  
  sequence: [],
  currentStep: 0,
  timeSignature: [4, 4],
  isMetronomeOn: false,
  
  sensitivity: 0.001,  // Ultra-sensitive threshold for maximum detection rate
  inputDeviceId: 'default',
  outputDeviceId: 'default',
  showSafeNotes: true,
  fretCount: 17,
  noteLabelMode: 'combined',
  noteLingeringTime: 2000,

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setBpm: (bpm) => set({ bpm }),
  setCurrentChord: (currentChord) => set({ currentChord }),
  setDetectedNote: (detectedNote, detectedFrequency) => set({ detectedNote, detectedFrequency }),
  
  addChord: (chord) => set((state) => ({ sequence: [...state.sequence, chord] })),
  removeChord: (index) => set((state) => ({ sequence: state.sequence.filter((_, i) => i !== index) })),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setTimeSignature: (timeSignature) => set({ timeSignature }),
  setIsMetronomeOn: (isMetronomeOn) => set({ isMetronomeOn }),
  
  setSensitivity: (sensitivity) => set({ sensitivity }),
  setInputDeviceId: (inputDeviceId) => set({ inputDeviceId }),
  setOutputDeviceId: (outputDeviceId) => set({ outputDeviceId }),
  setShowSafeNotes: (showSafeNotes) => set({ showSafeNotes }),
  setFretCount: (count) => set({ fretCount: count }),
  setNoteLabelMode: (mode) => set({ noteLabelMode: mode }),
  setNoteLingeringTime: (time) => set({ noteLingeringTime: time }),
}));
