
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BreathingPhase, 
  BreathingPattern, 
  BreathLog, 
  AppSettings 
} from './types';
import { PATTERNS, COLORS } from './constants';
import BreathingBalloon from './components/BreathingBalloon';
import History from './components/History';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  // --- State ---
  const [isActive, setIsActive] = useState(false);
  const [pattern, setPattern] = useState<BreathingPattern>(PATTERNS[0]);
  const [phase, setPhase] = useState<BreathingPhase>('Inhale');
  const [timeLeft, setTimeLeft] = useState(pattern.inhale);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [logs, setLogs] = useState<BreathLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [tensionBefore, setTensionBefore] = useState(5);
  const [isSetupOpen, setIsSetupOpen] = useState(true);

  const [settings, setSettings] = useState<AppSettings>({
    voiceEnabled: true,
    soundscapeEnabled: false,
    balloonColor: COLORS.sage
  });

  // --- Refs for timing ---
  // Fix: use ReturnType<typeof setInterval> instead of NodeJS.Timeout to avoid namespace errors in browser environments
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Initialize ---
  useEffect(() => {
    const storedLogs = localStorage.getItem('breathpulse_logs');
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
    
    const storedSettings = localStorage.getItem('breathpulse_settings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  // --- Logic ---
  const saveSession = useCallback((afterTension: number) => {
    const newLog: BreathLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      technique: pattern.name,
      duration: totalSeconds,
      tensionBefore,
      tensionAfter: afterTension
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('breathpulse_logs', JSON.stringify(updatedLogs));
    setIsActive(false);
    setIsSetupOpen(true);
    setTotalSeconds(0);
    audioService.stopSoundscape();
  }, [logs, pattern, totalSeconds, tensionBefore]);

  const toggleBreathing = () => {
    if (!isActive) {
      setIsActive(true);
      setIsSetupOpen(false);
      setPhase('Inhale');
      setTimeLeft(pattern.inhale);
      setTotalSeconds(0);
      if (settings.soundscapeEnabled) {
        audioService.startSoundscape();
      }
      if (settings.voiceEnabled) {
        audioService.speak("Begin inhaling");
      }
      audioService.playGong();
    } else {
      const tensionAfter = Number(prompt("How do you feel now? (1-10)", "3") || "3");
      saveSession(tensionAfter);
    }
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Next Phase Logic
            let nextPhase: BreathingPhase = 'Inhale';
            let nextTime = pattern.inhale;

            if (phase === 'Inhale') {
              if (pattern.hold > 0) {
                nextPhase = 'Hold';
                nextTime = pattern.hold;
              } else {
                nextPhase = 'Exhale';
                nextTime = pattern.exhale;
              }
            } else if (phase === 'Hold') {
              nextPhase = 'Exhale';
              nextTime = pattern.exhale;
            } else if (phase === 'Exhale') {
              if (pattern.holdEmpty > 0) {
                nextPhase = 'HoldEmpty';
                nextTime = pattern.holdEmpty;
              } else {
                nextPhase = 'Inhale';
                nextTime = pattern.inhale;
              }
            } else if (phase === 'HoldEmpty') {
              nextPhase = 'Inhale';
              nextTime = pattern.inhale;
            }

            setPhase(nextPhase);
            audioService.playGong();
            if (settings.voiceEnabled) {
              audioService.speak(nextPhase === 'HoldEmpty' ? 'Hold' : nextPhase);
            }
            return nextTime;
          }
          return prev - 1;
        });
        setTotalSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, pattern, settings.voiceEnabled]);

  const handlePatternChange = (p: BreathingPattern) => {
    setPattern(p);
    if (!isActive) {
      setTimeLeft(p.inhale);
    }
  };

  const clearHistory = () => {
    setLogs([]);
    localStorage.removeItem('breathpulse_logs');
  };

  const getPhaseDuration = () => {
    switch (phase) {
      case 'Inhale': return pattern.inhale;
      case 'Hold': return pattern.hold;
      case 'Exhale': return pattern.exhale;
      case 'HoldEmpty': return pattern.holdEmpty;
    }
  };

  return (
    <div className="min-h-screen bg-bgLight text-mainText flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-darkBlue tracking-tight">
          Breath<span className="text-sage">Pulse</span>
        </h1>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 hover:bg-beige/30 rounded-full transition-colors"
          title="History"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col items-center">
        
        {showHistory ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             <button 
              onClick={() => setShowHistory(false)}
              className="mb-4 text-darkBlue flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to exercise
            </button>
            <div className="bg-beige/20 p-6 rounded-3xl border border-beige/50">
              <History logs={logs} onClear={clearHistory} />
            </div>
          </div>
        ) : (
          <>
            {/* Balloon Animation Area */}
            <div className="w-full flex flex-col items-center mb-12">
              <BreathingBalloon 
                phase={isActive ? phase : 'Inhale'} 
                color={settings.balloonColor}
                duration={isActive ? getPhaseDuration() : 0}
              />
              
              {isActive && (
                <div className="text-center mt-4">
                  <div className="text-5xl font-display font-bold text-darkBlue">{timeLeft}</div>
                  <div className="text-sm uppercase tracking-widest opacity-50 mt-2">
                    {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            {!isActive && isSetupOpen && (
              <div className="w-full bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-beige/50 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-darkBlue/60 mb-3">Select Technique</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PATTERNS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePatternChange(p)}
                        className={`p-3 rounded-xl border text-sm text-left transition-all ${
                          pattern.id === p.id 
                          ? 'border-darkBlue bg-darkBlue text-white' 
                          : 'border-beige hover:border-darkBlue/30 bg-white/50'
                        }`}
                      >
                        <div className="font-bold">{p.name}</div>
                        <div className="text-[10px] opacity-70 mt-1">{p.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-widest text-darkBlue/60 mb-3">Current Tension (1-10)</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={tensionBefore} 
                      onChange={(e) => setTensionBefore(parseInt(e.target.value))}
                      className="w-full accent-terracotta"
                    />
                    <div className="flex justify-between text-[10px] mt-1 text-mainText/60">
                      <span>Calm</span>
                      <span>Stressed ({tensionBefore})</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-darkBlue/60 mb-1">Theme</label>
                    <div className="flex gap-2">
                      {Object.entries(COLORS).map(([name, hex]) => (
                        <button
                          key={name}
                          onClick={() => setSettings({...settings, balloonColor: hex})}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.balloonColor === hex ? 'border-darkBlue' : 'border-transparent'}`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 py-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={settings.voiceEnabled} 
                      onChange={(e) => setSettings({...settings, voiceEnabled: e.target.checked})}
                      className="w-4 h-4 accent-mauve"
                    />
                    <span className="text-sm font-medium">Voice Guide</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={settings.soundscapeEnabled} 
                      onChange={(e) => setSettings({...settings, soundscapeEnabled: e.target.checked})}
                      className="w-4 h-4 accent-mauve"
                    />
                    <span className="text-sm font-medium">Ocean Soundscape</span>
                  </label>
                </div>
              </div>
            )}

            <button
              onClick={toggleBreathing}
              className={`mt-10 w-full md:w-64 py-5 rounded-2xl font-display font-bold text-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 ${
                isActive 
                ? 'bg-terracotta text-white hover:bg-terracotta/90' 
                : 'bg-darkBlue text-white hover:bg-darkBlue/90'
              }`}
            >
              {isActive ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Finish Session
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Breathing
                </>
              )}
            </button>
            
            {!isActive && (
              <p className="mt-8 text-sm font-serif italic text-mainText/60 text-center max-w-sm">
                "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor."
              </p>
            )}
          </>
        )}
      </main>

      <footer className="mt-auto py-6 text-[10px] uppercase tracking-widest text-mainText/40 font-bold">
        &copy; {new Date().getFullYear()} BreathPulse Mindful Tech
      </footer>
    </div>
  );
};

export default App;
