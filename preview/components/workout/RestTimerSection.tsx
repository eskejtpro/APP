import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

interface RestTimerSectionProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
  onStartPreset: (seconds: number) => void;
  onAdjust: (deltaSeconds: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export const RestTimerSection: React.FC<RestTimerSectionProps> = ({
  remainingSeconds,
  totalSeconds,
  isRunning,
  isFinished,
  onStartPreset,
  onAdjust,
  onPause,
  onResume,
  onReset
}) => {
  // Beep & Vibration cue on finish
  useEffect(() => {
    if (isFinished) {
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        // Web Audio API beep
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch {
        // Fallback gracefully if Web Audio is blocked or unsupported
      }
    }
  }, [isFinished]);

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progressPct = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isFinished
        ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-950/30'
        : isRunning
        ? 'bg-[#171B24] border-[#00E676]/60 shadow-lg shadow-[#00E676]/10'
        : 'bg-[#171B24] border-[#222B3D]'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isFinished
              ? 'bg-amber-500/20 text-amber-300'
              : isRunning
              ? 'bg-[#00E676]/20 text-[#00E676]'
              : 'bg-[#0F1218] text-[#94A3B8]'
          }`}>
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              {isFinished
                ? 'Koniec odpoczynku! Czas na serię'
                : isRunning
                ? 'Stoper Odpoczynku w toku'
                : 'Stoper Odpoczynku'}
            </span>
            <span className="text-[10px] text-[#64748B] font-mono">
              {isRunning ? 'Nie blokuje rejestracji serii' : 'Wybierz czas lub zmień ręcznie'}
            </span>
          </div>
        </div>

        {/* Large Time Display */}
        <div className="text-right font-mono">
          <span className={`text-xl font-black ${
            isFinished ? 'text-amber-300' : isRunning ? 'text-[#00E676]' : 'text-white'
          }`}>
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-[#0F1218] rounded-full overflow-hidden mb-3 border border-[#222B3D]">
        <div
          style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          className={`h-full transition-all duration-300 ${
            isFinished ? 'bg-amber-400' : 'bg-[#00E676]'
          }`}
        />
      </div>

      {/* Controls & Presets */}
      <div className="flex flex-col gap-2">
        {/* Presets row */}
        <div className="flex items-center justify-between gap-1.5">
          {[
            { label: '60s', val: 60 },
            { label: '90s', val: 90 },
            { label: '120s', val: 120 },
            { label: '180s', val: 180 }
          ].map((preset) => (
            <button
              key={preset.val}
              onClick={() => onStartPreset(preset.val)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                totalSeconds === preset.val && (isRunning || remainingSeconds > 0)
                  ? 'bg-[#00E676] text-black shadow-sm'
                  : 'bg-[#0F1218] text-[#94A3B8] hover:text-white border border-[#222B3D]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Adjust and Actions Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAdjust(-15)}
              className="px-2 py-1.5 rounded-lg bg-[#0F1218] hover:bg-[#212735] border border-[#222B3D] text-[11px] font-mono text-[#94A3B8] hover:text-white"
              title="-15s"
            >
              -15s
            </button>
            <button
              onClick={() => onAdjust(15)}
              className="px-2 py-1.5 rounded-lg bg-[#0F1218] hover:bg-[#212735] border border-[#222B3D] text-[11px] font-mono text-[#94A3B8] hover:text-white"
              title="+15s"
            >
              +15s
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {isRunning ? (
              <button
                onClick={onPause}
                className="px-3 py-1.5 rounded-xl bg-[#212735] hover:bg-[#2C3548] border border-[#222B3D] text-xs font-bold text-amber-300 flex items-center gap-1 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pauza</span>
              </button>
            ) : remainingSeconds > 0 ? (
              <button
                onClick={onResume}
                className="px-3 py-1.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Wznów</span>
              </button>
            ) : null}

            <button
              onClick={onReset}
              className="p-1.5 rounded-xl bg-[#0F1218] hover:bg-[#212735] border border-[#222B3D] text-[#64748B] hover:text-white transition-colors"
              title="Resetuj stoper"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
