
import React from 'react';
import { BreathLog } from '../types';

interface HistoryProps {
  logs: BreathLog[];
  onClear: () => void;
}

const History: React.FC<HistoryProps> = ({ logs, onClear }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-mainText/60 italic">
        No sessions logged yet. Breathe to begin.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-semibold text-lg">Your Sessions</h3>
        <button 
          onClick={onClear}
          className="text-xs uppercase tracking-tighter text-terracotta font-bold hover:underline"
        >
          Clear History
        </button>
      </div>
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="bg-white/50 backdrop-blur-sm border border-beige rounded-xl p-4 flex flex-col gap-1 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-display font-bold text-darkBlue">{log.technique}</span>
              <span className="text-xs text-mainText/60">{new Date(log.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mainText/70">Duration: {Math.floor(log.duration / 60)}m {log.duration % 60}s</span>
              <span className="text-mainText/70">Tension: {log.tensionBefore} → {log.tensionAfter}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
