"use client";

import { useAudioStore } from '@/store/useAudioStore';
import { useEffect, useState } from 'react';

const STRINGS = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2']; // Standard tuning (High E to Low E)

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function FretboardVisualizer() {
  const { detectedNote, currentChord, showSafeNotes, fretCount, noteLabelMode, noteLingeringTime } = useAudioStore();
  const FRETS = fretCount;
  
  // Helper to get note name from full note string (e.g. "C4" -> "C")
  const getNoteName = (note: string) => note.replace(/[0-9-]/g, '');

  // Helper to calculate note at a specific fret position
  const getNoteAtPosition = (stringIndex: number, fret: number) => {
    const openStringNote = STRINGS[stringIndex]; // e.g. "E4"
    const openNoteName = getNoteName(openStringNote);
    const openOctave = parseInt(openStringNote.replace(/\D/g, '')) || 0;
    const openNoteIndex = NOTES.indexOf(openNoteName);
    
    const totalSemitones = openNoteIndex + fret;
    const noteName = NOTES[totalSemitones % 12];
    const octaveShift = Math.floor(totalSemitones / 12);
    const currentOctave = openOctave + octaveShift;
    
    return `${noteName}${currentOctave}`;
  };

  const [recentNotes, setRecentNotes] = useState<{ note: string; time: number }[]>([]);

  // Update recent notes when a new note is detected
  useEffect(() => {
    if (detectedNote) {
      setRecentNotes(prev => {
        const now = Date.now();
        // Add new note, keep only last X seconds
        const updated = [...prev, { note: detectedNote, time: now }];
        return updated.filter(n => now - n.time < noteLingeringTime);
      });
    }
  }, [detectedNote, noteLingeringTime]);

  // Animation loop to fade out notes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRecentNotes(prev => {
        const filtered = prev.filter(n => now - n.time < noteLingeringTime);
        if (filtered.length !== prev.length) return filtered;
        return prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [noteLingeringTime]);

  const isSafeNote = (fullNote: string) => {
    if (!currentChord || !showSafeNotes) return false;
    const noteName = getNoteName(fullNote);
    const safeNotes = currentChord.notes.map(n => getNoteName(n));
    return safeNotes.includes(noteName);
  };

  const isRootNote = (fullNote: string) => {
    if (!currentChord || !showSafeNotes) return false;
    const noteName = getNoteName(fullNote);
    return getNoteName(currentChord.root) === noteName;
  };

  const getNoteStatus = (fullNote: string) => {
    // Check if currently detected (Exact match including octave)
    if (detectedNote && detectedNote === fullNote) return { type: 'current', opacity: 1 };
    
    // Check if in recent history (Exact match)
    const recent = recentNotes.filter(n => n.note === fullNote).sort((a, b) => b.time - a.time)[0];
    if (recent) {
      const age = Date.now() - recent.time;
      const opacity = Math.max(0, 1 - age / noteLingeringTime); // Fade over configured time
      return { type: 'recent', opacity };
    }

    return null;
  };

  // Debug logging - comprehensive note matching
  useEffect(() => {
    if (detectedNote) {
      console.log(`%c🎸 DETECTED: ${detectedNote}`, 'color: cyan; font-weight: bold');
      
      // Check all fretboard positions
      let matchFound = false;
      const matches: string[] = [];
      
      for (let stringIndex = 0; stringIndex < STRINGS.length; stringIndex++) {
        for (let fret = 0; fret <= FRETS; fret++) {
          const noteAtPos = getNoteAtPosition(stringIndex, fret);
          if (noteAtPos === detectedNote) {
            matchFound = true;
            matches.push(`String ${6-stringIndex} (${STRINGS[stringIndex]}), Fret ${fret}`);
          }
        }
      }
      
      if (matchFound) {
        console.log(`%c✅ VISUALIZED at: ${matches.join(', ')}`, 'color: green');
      } else {
        console.log(`%c❌ NOT FOUND on fretboard!`, 'color: red; font-weight: bold');
        console.log(`Fretboard range: ${STRINGS[5]} (fret 0) to ${getNoteAtPosition(0, FRETS)} (fret ${FRETS})`);
        
        // Show some sample fretboard notes for comparison
        console.log('Sample fretboard notes:', [
          `E-string open: ${getNoteAtPosition(5, 0)}`,
          `E-string fret 12: ${getNoteAtPosition(5, 12)}`,
          `High-E open: ${getNoteAtPosition(0, 0)}`,
          `High-E fret 12: ${getNoteAtPosition(0, 12)}`
        ]);
      }
    }
  }, [detectedNote, FRETS]);

  const getInterval = (root: string, note: string) => {
    const rootIndex = NOTES.indexOf(getNoteName(root));
    const noteIndex = NOTES.indexOf(getNoteName(note));
    
    let semitones = (noteIndex - rootIndex + 12) % 12;
    
    const intervals: { [key: number]: string } = {
      0: 'R',
      1: 'b2',
      2: '2',
      3: 'b3',
      4: '3',
      5: '4',
      6: 'b5',
      7: '5',
      8: 'b6',
      9: '6',
      10: 'b7',
      11: '7'
    };
    
    return intervals[semitones] || '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
      <div className="relative h-64 min-w-[800px] select-none">
        {/* Fretboard Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-lg border border-gray-700 shadow-inner"></div>
        
        {/* Frets */}
        {Array.from({ length: FRETS + 1 }).map((_, fret) => (
          <div 
            key={fret} 
            className={`absolute top-0 bottom-0 w-px bg-gradient-to-b from-gray-600 to-gray-800 ${fret === 0 ? 'w-1.5 bg-gray-400' : ''}`}
            style={{ left: `${(fret / FRETS) * 100}%` }}
          >
             {/* Fret Markers (Inlays) */}
             {[3, 5, 7, 9].includes(fret) && (
               <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-700/50 shadow-inner"></div>
             )}
             {fret === 12 && (
               <>
                 <div className="absolute top-[35%] -translate-x-1/2 w-3 h-3 rounded-full bg-gray-700/50 shadow-inner"></div>
                 <div className="absolute top-[65%] -translate-x-1/2 w-3 h-3 rounded-full bg-gray-700/50 shadow-inner"></div>
               </>
             )}
             <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-500 text-[10px] font-mono">{fret}</span>
          </div>
        ))}

        {/* Strings & Notes */}
        {STRINGS.map((stringNote, stringIndex) => (
          <div 
            key={stringIndex} 
            className="absolute left-0 right-0 h-[1px] bg-gray-500 group"
            style={{ top: `${10 + stringIndex * 16}%`, opacity: 0.4 + (stringIndex * 0.1) }} 
          >
            {/* String Label */}
            <span className="absolute -left-6 -top-2 text-xs text-gray-500 font-mono">{getNoteName(stringNote)}</span>

            {/* Render Notes on this String */}
            {Array.from({ length: FRETS + 1 }).map((_, fret) => {
              const noteAtPos = getNoteAtPosition(stringIndex, fret);
              const safe = isSafeNote(noteAtPos);
              const root = isRootNote(noteAtPos);
              const status = getNoteStatus(noteAtPos);
              
              // Only render if it's a safe note or currently/recently detected
              if (!safe && !status) return null;

              const interval = currentChord ? getInterval(currentChord.root, noteAtPos) : '';

              return (
                <div 
                  key={fret}
                  className={`absolute -top-4 w-8 h-8 rounded-full flex flex-col items-center justify-center z-10
                    ${status?.type === 'current'
                      ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.8)] scale-125 ring-2 ring-white transition-none' 
                      : status?.type === 'recent'
                        ? 'bg-blue-400 text-white shadow-[0_0_10px_rgba(96,165,250,0.5)] transition-all duration-300'
                        : root 
                          ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.6)] transition-all duration-150' 
                          : 'bg-green-900/90 text-green-400 border border-green-500/50 transition-all duration-150'
                    }
                  `}
                  style={{ 
                    left: `${(fret / FRETS) * 100}%`, 
                    transform: 'translateX(-50%)',
                    opacity: status?.type === 'recent' ? status.opacity : 1
                  }}
                >
                  {(noteLabelMode === 'note' || noteLabelMode === 'combined') && (
                    <span className={`font-bold leading-none ${noteLabelMode === 'combined' ? 'text-[10px]' : 'text-xs'}`}>
                      {getNoteName(noteAtPos)}
                    </span>
                  )}
                  
                  {(noteLabelMode === 'interval' || noteLabelMode === 'combined') && interval && (
                    <span className={`font-mono leading-none ${
                      noteLabelMode === 'combined' 
                        ? 'text-[8px]' 
                        : 'text-[10px] font-bold'
                      } ${root ? 'text-black/70 font-bold' : 'text-white/70'}`}>
                      {interval}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-between items-center px-8">
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Detected Note</div>
          <div className={`text-4xl font-black ${detectedNote ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'text-gray-700'}`}>
            {detectedNote || '--'}
          </div>
        </div>

        <div className="h-12 w-px bg-gray-800"></div>

        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Target Chord</div>
          <div className={`text-4xl font-black ${currentChord ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'text-gray-700'}`}>
            {currentChord ? `${currentChord.root}${currentChord.quality}` : '--'}
          </div>
        </div>

        <div className="h-12 w-px bg-gray-800"></div>

        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Safe Notes</div>
          <div className="flex gap-2">
            {currentChord ? (
              currentChord.notes.map(n => getNoteName(n)).map((note, i) => (
                <span key={i} className="px-2 py-1 rounded bg-gray-800 text-green-400 font-mono text-sm border border-gray-700">
                  {note}
                </span>
              ))
            ) : (
              <span className="text-gray-700">--</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
