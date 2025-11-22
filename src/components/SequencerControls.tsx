"use client";

import { useAudioStore, Chord } from '@/store/useAudioStore';
import { Trash2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Dropdown from './Dropdown';

// Simple chord presets for MVP
const CHORD_TYPES = [
  { root: 'C', quality: 'maj7', notes: ['C4', 'E4', 'G4', 'B4'] },
  { root: 'D', quality: 'min7', notes: ['D4', 'F4', 'A4', 'C5'] },
  { root: 'G', quality: '7', notes: ['G3', 'B3', 'D4', 'F4'] },
  { root: 'A', quality: 'min7', notes: ['A3', 'C4', 'E4', 'G4'] },
  { root: 'F', quality: 'maj7', notes: ['F3', 'A3', 'C4', 'E4'] },
];

export default function SequencerControls() {
  const { sequence, addChord, removeChord, bpm, setBpm, currentStep, timeSignature, setTimeSignature, isMetronomeOn, setIsMetronomeOn } = useAudioStore();
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedScale, setSelectedScale] = useState('Major');
  const [customRoot, setCustomRoot] = useState('C');
  const [customQuality, setCustomQuality] = useState('maj7');

  const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const TIME_SIGNATURES = [
    { label: '4/4', value: [4, 4] },
    { label: '3/4', value: [3, 4] },
    { label: '6/8', value: [6, 8] },
  ];
  
  // Diatonic chords for Major scale (I, ii, iii, IV, V, vi, vii dim)
  const getDiatonicChords = (key: string) => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const rootIndex = notes.indexOf(key);
    const getNote = (i: number) => notes[(rootIndex + i) % 12];
    
    // Major Scale Intervals: 0, 2, 4, 5, 7, 9, 11
    // Chords: Maj7, min7, min7, Maj7, 7, min7, m7b5
    return [
      { root: getNote(0), quality: 'maj7', label: 'I' },
      { root: getNote(2), quality: 'min7', label: 'ii' },
      { root: getNote(4), quality: 'min7', label: 'iii' },
      { root: getNote(5), quality: 'maj7', label: 'IV' },
      { root: getNote(7), quality: '7', label: 'V' }, // Dominant 7 for V
      { root: getNote(9), quality: 'min7', label: 'vi' },
      { root: getNote(11), quality: 'm7b5', label: 'vii°' },
    ];
  };

  const diatonicChords = getDiatonicChords(selectedKey);

  const handleAddChord = (root: string, quality: string) => {
    const notes = getChordNotes(root, quality);
    addChord({
      root,
      quality,
      duration: '1m',
      notes
    });
  };

  const load12BarBlues = () => {
    // Clear current sequence
    while (useAudioStore.getState().sequence.length > 0) {
      removeChord(0);
    }

    // 12-bar blues: I7-I7-I7-I7-IV7-IV7-I7-I7-V7-IV7-I7-V7 (or I7 for last)
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const rootIndex = notes.indexOf(selectedKey);
    const getNote = (semitones: number) => notes[(rootIndex + semitones) % 12];

    const I = getNote(0);
    const IV = getNote(5);
    const V = getNote(7);

    // All dominant 7th chords for blues
    const progression = [
      { root: I, quality: '7' },   // Bar 1
      { root: I, quality: '7' },   // Bar 2
      { root: I, quality: '7' },   // Bar 3
      { root: I, quality: '7' },   // Bar 4
      { root: IV, quality: '7' },  // Bar 5
      { root: IV, quality: '7' },  // Bar 6
      { root: I, quality: '7' },   // Bar 7
      { root: I, quality: '7' },   // Bar 8
      { root: V, quality: '7' },   // Bar 9
      { root: IV, quality: '7' },  // Bar 10
      { root: I, quality: '7' },   // Bar 11
      { root: V, quality: '7' },   // Bar 12 (turnaround)
    ];

    progression.forEach(chord => {
      handleAddChord(chord.root, chord.quality);
    });
  };

  const load251Progression = () => {
    // Clear current sequence
    while (useAudioStore.getState().sequence.length > 0) {
      removeChord(0);
    }

    // ii-V-I-I (Jazz Standard)
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const rootIndex = notes.indexOf(selectedKey);
    const getNote = (semitones: number) => notes[(rootIndex + semitones) % 12];

    const ii = getNote(2);
    const V = getNote(7);
    const I = getNote(0);

    const progression = [
      { root: ii, quality: 'min7' },
      { root: V, quality: '7' },
      { root: I, quality: 'maj7' },
      { root: I, quality: 'maj7' },
    ];

    progression.forEach(chord => {
      handleAddChord(chord.root, chord.quality);
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Backing Track</h2>
          <p className="text-gray-400 text-xs mb-4">Build your progression</p>
        </div>
      <div className="flex justify-between items-center mb-8">
        
        <div className="flex items-center gap-6 bg-gray-800/50 p-2 rounded-lg border border-gray-700">
          <Dropdown 
            label="Key"
            value={selectedKey}
            onChange={setSelectedKey}
            options={KEYS.map(k => ({ label: k, value: k }))}
            className="w-20"
          />
          
          <div className="h-8 w-px bg-gray-700"></div>

          <Dropdown 
            label="Meter"
            value={`${timeSignature[0]}/${timeSignature[1]}`}
            onChange={(val) => {
              const [num, den] = val.split('/').map(Number);
              setTimeSignature([num, den]);
            }}
            options={TIME_SIGNATURES.map(ts => ({ label: ts.label, value: `${ts.value[0]}/${ts.value[1]}` }))}
            className="w-24"
          />

          <div className="h-8 w-px bg-gray-700"></div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">BPM: {bpm}</label>
            <input 
              type="range" 
              min="60" 
              max="200" 
              value={bpm} 
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-32 accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="h-8 w-px bg-gray-700"></div>

          <button 
            onClick={() => setIsMetronomeOn(!isMetronomeOn)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isMetronomeOn 
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' 
                : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isMetronomeOn ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`}></div>
            METRONOME
          </button>

          <button 
            onClick={() => useAudioStore.getState().setShowSafeNotes(!useAudioStore.getState().showSafeNotes)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              useAudioStore.getState().showSafeNotes 
                ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${useAudioStore.getState().showSafeNotes ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 'bg-gray-600'}`}></div>
            SAFE NOTES
          </button>

          <div className="h-8 w-px bg-gray-700"></div>

          <button 
            onClick={() => {
              while (useAudioStore.getState().sequence.length > 0) {
                removeChord(0);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 hover:border-red-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            CLEAR ALL
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-wrap gap-3 mb-8 min-h-[120px]">
        {sequence.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full text-gray-500 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/30">
            <p className="text-sm">No chords yet</p>
            <p className="text-xs opacity-50">Select a chord below to start</p>
          </div>
        )}
        
        {sequence.map((chord, index) => (
          <div 
            key={index}
            className={`relative flex-shrink-0 w-32 h-28 rounded-xl border transition-all duration-300 group ${
              index === currentStep 
                ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_30px_rgba(59,130,246,0.3)] scale-105 z-10' 
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
            }`}
          >
            <div className="absolute top-2 left-3 text-xs text-gray-500 font-mono">
              {index + 1}
            </div>
            
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-2xl font-bold text-white tracking-tight">
                {chord.root}<span className="text-lg font-normal text-gray-400">{chord.quality}</span>
              </span>
            </div>
            
            <button 
              onClick={() => removeChord(index)}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500/10 text-red-400 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Quick Progressions */}
      <div className="mb-8">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3 ml-1">
          Quick Progressions ({selectedKey})
        </h3>
        <div className="flex gap-4">
          <button 
            onClick={load12BarBlues}
            className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] active:scale-95"
          >
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div className="flex flex-col items-start">
              <span>12-Bar Blues</span>
              <span className="text-[10px] font-normal opacity-70">I7 - IV7 - V7</span>
            </div>
          </button>

          <button 
            onClick={load251Progression}
            className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-95"
          >
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="flex flex-col items-start">
              <span>2-5-1 Jazz</span>
              <span className="text-[10px] font-normal opacity-70">ii - V - I</span>
            </div>
          </button>
        </div>
      </div>

      {/* Smart Chord Builder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">
            Diatonic Chords ({selectedKey} {selectedScale})
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {diatonicChords.map((chord, i) => (
              <button
                key={i}
                onClick={() => handleAddChord(chord.root, chord.quality)}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 transition-all active:scale-95"
              >
                <span className="text-xs text-gray-500 mb-1">{chord.label}</span>
                <span className="font-bold text-white text-sm">{chord.root}</span>
                <span className="text-[10px] text-gray-400">{chord.quality}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">
            Custom Chord
          </h3>
          <div className="flex gap-2 p-4 bg-gray-800/30 rounded-xl border border-gray-800 items-end">
            <Dropdown 
              value={customRoot}
              onChange={setCustomRoot}
              options={KEYS.map(k => ({ label: k, value: k }))}
              className="w-20"
            />
            <Dropdown 
              value={customQuality}
              onChange={setCustomQuality}
              options={['maj7', 'min7', '7', 'm7b5', 'dim7', 'maj9', 'min9', '13'].map(q => ({ label: q, value: q }))}
              className="w-24"
            />
            <button 
              onClick={() => handleAddChord(customRoot, customQuality)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-4 rounded-lg transition-all active:scale-95 h-[38px]"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to get notes (Simple mapping for MVP)
function getChordNotes(root: string, quality: string): string[] {
  // This is a simplified logic. In a real app, use a library like 'tonal' or a proper map.
  // For now, we'll just map offsets from the root.
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const rootIndex = notes.indexOf(root);
  
  const getNote = (interval: number) => {
    const index = (rootIndex + interval) % 12;
    const octave = (rootIndex + interval) >= 12 ? 4 : 3; // Keep it around middle C
    return notes[index] + octave;
  };

  switch (quality) {
    case 'maj7': return [getNote(0), getNote(4), getNote(7), getNote(11)]; // 1, 3, 5, 7
    case 'min7': return [getNote(0), getNote(3), getNote(7), getNote(10)]; // 1, b3, 5, b7
    case '7':    return [getNote(0), getNote(4), getNote(7), getNote(10)]; // 1, 3, 5, b7
    case 'm7b5': return [getNote(0), getNote(3), getNote(6), getNote(10)]; // 1, b3, b5, b7
    case 'dim7': return [getNote(0), getNote(3), getNote(6), getNote(9)];  // 1, b3, b5, bb7
    default: return [getNote(0), getNote(4), getNote(7)];
  }
}
