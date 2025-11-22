
import { useEffect, useRef, useState } from 'react';
import { useAudioStore } from '@/store/useAudioStore';
import { Settings } from 'lucide-react';

export default function PitchDetector() {
  const { detectedNote, setDetectedNote, sensitivity, setSensitivity, inputDeviceId, setInputDeviceId, fretCount, setFretCount, noteLabelMode, setNoteLabelMode, noteLingeringTime, setNoteLingeringTime } = useAudioStore();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch devices on mount
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devs => {
      setDevices(devs.filter(d => d.kind === 'audioinput'));
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const startAudio = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            deviceId: inputDeviceId !== 'default' ? { exact: inputDeviceId } : undefined,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } 
        });
        micStreamRef.current = stream;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const ml5 = (window as any).ml5;
        if (!ml5) {
          throw new Error("ml5 library not loaded");
        }
        
        const modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
        const pitch = ml5.pitchDetection(modelUrl, audioContext, stream, modelLoaded);

        function modelLoaded() {
          if (isMounted) {
            console.log('Model Loaded!');
            getPitch(pitch);
          }
        }

        const pitchDetectionCount = { current: 0 };
        const lastDetectionTime = { current: performance.now() };

        function getPitch(pitchInstance: any) {
          if (!isMounted) return;
          
          pitchInstance.getPitch((err: any, frequency: number) => {
            const now = performance.now();
            const delta = now - lastDetectionTime.current;
            lastDetectionTime.current = now;
            
            pitchDetectionCount.current++;
            
            // Heartbeat every 50 detections
            if (pitchDetectionCount.current % 50 === 0) {
              console.log(`%c[HEARTBEAT] ${pitchDetectionCount.current} detections (latency: ${delta.toFixed(1)}ms)`, 'color: magenta; font-weight: bold; font-size: 12px');
            }

            if (frequency && frequency > 70 && frequency < 2000) { // Extended guitar range (covers up to ~B6 and harmonics)
              if (analyserRef.current) {
                const bufferLength = analyserRef.current.fftSize;
                const dataArray = new Uint8Array(bufferLength);
                analyserRef.current.getByteTimeDomainData(dataArray);

                // Fast RMS calculation
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                  const normalized = (dataArray[i] - 128) / 128.0;
                  sum += normalized * normalized;
                }
                const rms = Math.sqrt(sum / bufferLength);
                
                const threshold = useAudioStore.getState().sensitivity;
                
                if (rms > threshold) {
                  const note = frequencyToNote(frequency);
                  setDetectedNote(note, frequency);
                  
                  // Minimal logging - only log note name
                  console.log(`🎵 ${note} (${frequency.toFixed(0)}Hz)`);
                } else {
                  setDetectedNote(null);
                }
              }
            } else {
              setDetectedNote(null);
            }
            
            // Continue polling immediately - no delay
            if (isMounted) {
              getPitch(pitchInstance);
            }
          });
        }

      } catch (err) {
        console.error("Error accessing microphone", err);
      }
    };

    startAudio();

    return () => {
      isMounted = false;
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [inputDeviceId, setDetectedNote]); // Re-run when input device changes

  // Helper to convert frequency to note
  const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  function frequencyToNote(frequency: number) {
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    const note = Math.round(noteNum) + 69;
    const noteName = noteStrings[note % 12];
    const octave = Math.floor(note / 12) - 1;
    return `${noteName}${octave}`;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 flex flex-col items-center">
      <div className="flex justify-between items-center mb-4 w-full">
        <h2 className="text-2xl font-bold text-white">Detected Note</h2>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${detectedNote ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
              <span className="text-[10px] text-gray-500 uppercase font-bold">
                {detectedNote ? 'Active' : 'Listening'}
              </span>
           </div>
           <button 
             onClick={() => setShowSettings(!showSettings)}
             className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
           >
             <Settings size={20} />
           </button>
        </div>
      </div>

      {showSettings && (
        <div className="w-full bg-gray-900/50 p-6 rounded-xl border border-gray-800 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Input Device</label>
              <select 
                value={inputDeviceId}
                onChange={(e) => setInputDeviceId(e.target.value)}
                className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 outline-none focus:border-blue-500 text-sm"
              >
                <option value="default">Default Microphone</option>
                {devices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0, 5)}...`}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Sensitivity (Threshold: {sensitivity})</label>
              <input 
                type="range" 
                min="0.001" 
                max="0.1" 
                step="0.001"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="accent-blue-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>More Sensitive</span>
                <span>Less Sensitive</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Fretboard Range</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFretCount(12)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                    fretCount === 12
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  12
                </button>
                <button
                  onClick={() => setFretCount(17)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                    fretCount === 17
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  17
                </button>
                <button
                  onClick={() => setFretCount(24)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                    fretCount === 24
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  24
                </button>
              </div>
              <div className="text-[10px] text-gray-600 text-center">
                {fretCount === 12 ? 'Standard (E2-E5)' : fretCount === 17 ? 'Extended (E2-B5)' : 'Full Range (E2-E6)'}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Note Labels</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNoteLabelMode('interval')}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                    noteLabelMode === 'interval'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  Interval
                </button>
                <button
                  onClick={() => setNoteLabelMode('note')}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                    noteLabelMode === 'note'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  Note
                </button>
                <button
                  onClick={() => setNoteLabelMode('combined')}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                    noteLabelMode === 'combined'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  Combined
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase">Note Trail Duration</label>
                <span className="text-xs font-bold text-blue-400">{(noteLingeringTime / 1000).toFixed(1)}s</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="3000" 
                step="100"
                value={noteLingeringTime}
                onChange={(e) => setNoteLingeringTime(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Short (0.5s)</span>
                <span>Long (3s)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
