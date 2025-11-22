"use client";

import AudioEngine from "@/components/AudioEngine";
import FretboardVisualizer from "@/components/FretboardVisualizer";
import PitchDetector from "@/components/PitchDetector";
import SequencerControls from "@/components/SequencerControls";
import { useAudioStore } from "@/store/useAudioStore";
import { Play, Square } from "lucide-react";
import { useState } from "react";
import * as Tone from 'tone';

export default function Home() {
  const { isPlaying, setIsPlaying, setCurrentChord } = useAudioStore();
  const [started, setStarted] = useState(false);

  const handleStart = async () => {
    await Tone.start();
    setStarted(true);
    // Set a default chord for testing
    setCurrentChord({
      root: "C",
      quality: "maj7",
      duration: "1m",
      notes: ["C4", "E4", "G4", "B4"]
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="z-10 w-full max-w-6xl flex flex-col gap-8">
        {/* Header */}
        <header className="flex items-center justify-between py-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-white">Im</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Improv<span className="text-gray-500 font-normal">Assistant</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
            {!started ? (
              <button 
                onClick={handleStart}
                className="px-8 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Start Session
              </button>
            ) : (
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${
                  isPlaying 
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/50' 
                    : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/50'
                }`}
              >
                {isPlaying ? <><Square size={16} fill="currentColor" /> Stop</> : <><Play size={16} fill="currentColor" /> Play</>}
              </button>
            )}
          </div>
        </header>

        {started ? (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AudioEngine />
            <PitchDetector />
            
            <section>
              <FretboardVisualizer />
            </section>
            
            <section>
              <SequencerControls />
            </section>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto animate-in zoom-in duration-500">
            <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
              Master the Fretboard.
            </h2>
            <p className="text-xl text-gray-400 mb-12 leading-relaxed">
              Real-time visualization of safe notes over your custom backing tracks. 
              Connect your guitar, build a progression, and start improvising.
            </p>
            
            <div className="grid grid-cols-3 gap-8 text-left w-full">
              <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-400">1</div>
                <h3 className="font-bold text-white mb-2">Connect</h3>
                <p className="text-sm text-gray-500">Allow microphone access to detect your playing in real-time.</p>
              </div>
              <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 text-purple-400">2</div>
                <h3 className="font-bold text-white mb-2">Build</h3>
                <p className="text-sm text-gray-500">Create a chord progression using the smart sequencer.</p>
              </div>
              <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400">3</div>
                <h3 className="font-bold text-white mb-2">Play</h3>
                <p className="text-sm text-gray-500">Follow the visualizer to hit the right notes every time.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
