"use client";

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useAudioStore } from '@/store/useAudioStore';

export default function AudioEngine() {
  const { isPlaying, bpm, currentChord, setCurrentChord, sequence, timeSignature, isMetronomeOn } = useAudioStore();
  const synthRef = useRef<Tone.PolySynth | null>(null);

  // Initialize Tone.js
  useEffect(() => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
    }).toDestination();
    
    synthRef.current = synth;

    return () => {
      synth.dispose();
    };
  }, []);

  // Sync Time Signature
  useEffect(() => {
    // Tone.js expects timeSignature as a number (4) or array [4, 4] (but usually just the numerator if denominator is 4, or array)
    // Actually Tone.Transport.timeSignature accepts [numerator, denominator] or number.
    Tone.Transport.timeSignature = timeSignature;
  }, [timeSignature]);

  // Sync BPM
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  // Metronome Logic
  useEffect(() => {
    if (!isPlaying || !isMetronomeOn) return;

    const [numerator, denominator] = timeSignature;
    const metronomeSynth = new Tone.MembraneSynth({
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
      volume: -10
    }).toDestination();

    let loop: Tone.Loop | Tone.Sequence;

    if (denominator === 8) {
      // For 6/8, 9/8, 12/8, we usually feel dotted quarter notes
      // But for practice, eighth notes with accents on 1 and 4 (for 6/8) might be better
      // Let's do dotted quarters for the main pulse to keep it simple for now, or eighths?
      // Let's do eighth notes for x/8 signatures to be safe and precise
      loop = new Tone.Sequence((time, beat) => {
        if (beat === 0) {
          metronomeSynth.triggerAttackRelease("G5", "32n", time); // High click
        } else if (beat % 3 === 0) {
           metronomeSynth.triggerAttackRelease("C5", "32n", time, 0.5); // Medium click
        } else {
          metronomeSynth.triggerAttackRelease("C5", "32n", time, 0.2); // Low click
        }
      }, Array.from({ length: numerator }, (_, i) => i), "8n").start(0);
    } else {
      // For x/4 signatures (4/4, 3/4)
      loop = new Tone.Sequence((time, beat) => {
        if (beat === 0) {
          metronomeSynth.triggerAttackRelease("G5", "32n", time); // High click
        } else {
          metronomeSynth.triggerAttackRelease("C5", "32n", time, 0.3); // Low click
        }
      }, Array.from({ length: numerator }, (_, i) => i), "4n").start(0);
    }

    return () => {
      loop.dispose();
      metronomeSynth.dispose();
    };
  }, [isPlaying, timeSignature, isMetronomeOn]);

  // Handle Playback & Sequencing (Chords)
  useEffect(() => {
    if (isPlaying) {
      Tone.start();
      Tone.Transport.start();
      
      const sequenceWithIndices = sequence.map((c, i) => ({ chord: c, index: i }));
      
      const newSeq = new Tone.Sequence((time, event) => {
        if (!synthRef.current) return;
        
        synthRef.current.triggerAttackRelease(event.chord.notes, event.chord.duration, time);
        
        Tone.Draw.schedule(() => {
          setCurrentChord(event.chord);
          useAudioStore.getState().setCurrentStep(event.index);
        }, time);
      }, sequenceWithIndices, "1m").start(0);

      return () => {
        newSeq.dispose();
        Tone.Transport.stop();
      };
    } else {
      Tone.Transport.stop();
      Tone.Transport.cancel(); // Clear scheduled events
    }
  }, [isPlaying, sequence, setCurrentChord]);

  return null; // Headless component
}
