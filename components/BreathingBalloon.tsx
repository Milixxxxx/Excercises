
import React from 'react';
import { BreathingPhase } from '../types';

interface BreathingBalloonProps {
  phase: BreathingPhase;
  color: string;
  duration: number; // duration of current phase
}

const BreathingBalloon: React.FC<BreathingBalloonProps> = ({ phase, color, duration }) => {
  // Scale mapping: 1.0 (empty) to 2.5 (full)
  let scale = 1.0;
  let isPulsing = false;

  switch (phase) {
    case 'Inhale':
      scale = 2.5;
      break;
    case 'Hold':
      scale = 2.5;
      isPulsing = true;
      break;
    case 'Exhale':
      scale = 1.0;
      break;
    case 'HoldEmpty':
      scale = 1.0;
      isPulsing = true;
      break;
  }

  return (
    <div className="relative flex items-center justify-center w-full h-[350px]">
      {/* Background Glow */}
      <div 
        className="absolute w-48 h-48 rounded-full blur-3xl opacity-20 transition-all duration-1000"
        style={{ backgroundColor: color }}
      />
      
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-2xl"
      >
        <defs>
          <radialGradient id="balloonGradient" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>
        
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="url(#balloonGradient)"
          className={`balloon-transition ${isPulsing ? 'animate-balloon-pulse' : ''}`}
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'center',
            transitionDuration: `${duration}s`
          }}
        />
      </svg>
      
      {/* Visual Indicator text inside/near balloon */}
      <div className="absolute flex flex-col items-center justify-center text-mainText pointer-events-none">
        <span className="text-3xl font-display font-bold uppercase tracking-widest opacity-80 mb-1">
          {phase === 'HoldEmpty' ? 'Hold' : phase}
        </span>
      </div>
    </div>
  );
};

export default BreathingBalloon;
