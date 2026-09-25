import React, { useState, useEffect } from 'react';
import {
  Check,
  Plus,
  Save,
  Pause,
  Play,
  RotateCcw,
  X,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

interface SessionViewProps {
  workoutName?: string;
  onFinishSession: () => void;
}

interface ActiveSet {
  setNumber: number;
  weight: number;
  targetReps: number;
  actualReps: number;
  isDone: boolean;
}

export const SessionView: React.FC<SessionViewProps> = ({
  workoutName = 'Push A (Klatka + Barki)',
  onFinishSession
}) => {
  // Session workout sets
  const [sets, setSets] = useState<ActiveSet[]>([
    { setNumber: 1, weight: 80, targetReps: 8, actualReps: 8, isDone: true },
    { setNumber: 2, weight: 85, targetReps: 8, actualReps: 8, isDone: true },
    { setNumber: 3, weight: 90, targetReps: 6, actualReps: 6, isDone: false },
    { setNumber: 4, weight: 90, targetReps: 6, actualReps: 6, isDone: false }
  ]);

  // Overall workout session duration ticker (seconds)
  const [sessionSeconds, setSessionSeconds] = useState(2540); // 42m 20s

  // Rest Timer State (Etap 4A)
  const [restRemaining, setRestRemaining] = useState<number>(0);
  const [restTotal, setRestTotal] = useState<number>(90);
  const [isRestRunning, setIsRestRunning] = useState<boolean>(false);
  const [isRestFinished, setIsRestFinished] = useState<boolean>(false);

  // Modals
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Session elapsed timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rest Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isRestRunning && restRemaining > 0) {
      interval = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev <= 1) {
            setIsRestRunning(false);
            setIsRestFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRestRunning, restRemaining]);

  const startRestTimer = (seconds: number) => {
    setRestTotal(seconds);
    setRestRemaining(seconds);
    setIsRestRunning(true);
    setIsRestFinished(false);
  };

  const adjustRestTimer = (delta: number) => {
    const next = Math.max(0, restRemaining + delta);
    setRestRemaining(next);
    if (next > restTotal) setRestTotal(next);
    if (next === 0) {
      setIsRestRunning(false);
      setIsRestFinished(true);
    } else {
      setIsRestFinished(false);
      setIsRestRunning(true);
    }
  };

  const toggleSet = (idx: number) => {
    const copy = [...sets];
    const newStatus = !copy[idx].isDone;
    copy[idx].isDone = newStatus;
    setSets(copy);

    // Auto-start rest timer on set approval! (Etap 4A)
    if (newStatus) {
      startRestTimer(restTotal || 90);
    }
  };

  const addSet = () => {
    const last = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        setNumber: sets.length + 1,
        weight: last ? last.weight : 80,
        targetReps: last ? last.targetReps : 8,
        actualReps: last ? last.actualReps : 8,
        isDone: false
      }
    ]);
  };

  const completedCount = sets.filter((s) => s.isDone).length;
  const progressPercent = restTotal > 0 ? (restRemaining / restTotal) * 100 : 0;

  const sessionMins = Math.floor(sessionSeconds / 60);
  const sessionSecs = sessionSeconds % 60;
  const sessionTimeFormatted = `${String(sessionMins).padStart(2, '0')}:${String(sessionSecs).padStart(2, '0')}`;

  const restMins = Math.floor(restRemaining / 60);
  const restSecs = restRemaining % 60;
  const restTimeFormatted = `${String(restMins).padStart(2, '0')}:${String(restSecs).padStart(2, '0')}`;

  return (
    <div className="space-y-4 pb-24">
      {/* Active Workout Top Header */}
      <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl p-4 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              Aktywna sesja • {sessionTimeFormatted}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Room Draft: OK
            </span>
            <button
              onClick={() => setShowDiscardModal(true)}
              className="text-[#94A3B8] hover:text-red-400 p-1 rounded-lg transition-colors"
              title="Porzuć sesję"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-bold text-white">{workoutName}</h2>
          <span className="text-xs text-[#94A3B8]">
            Zatwierdzono: <strong className="text-emerald-400">{completedCount}</strong>/{sets.length} serii
          </span>
        </div>
      </div>

      {/* ================= REST TIMER (ETAP 4A) ================= */}
      <div
        className={`border rounded-2xl p-3.5 transition-all shadow-md ${
          isRestFinished
            ? 'bg-amber-950/20 border-amber-500/60 shadow-amber-500/10'
            : isRestRunning
            ? 'bg-cyan-950/20 border-cyan-500/60 shadow-cyan-500/10'
            : 'bg-[#181E29] border-[#2C384E]'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRestFinished
                  ? 'bg-amber-400 animate-ping'
                  : isRestRunning
                  ? 'bg-cyan-400 animate-pulse'
                  : 'bg-[#64748B]'
              }`}
            />
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isRestFinished ? 'text-amber-400' : isRestRunning ? 'text-cyan-400' : 'text-[#94A3B8]'
              }`}
            >
              {isRestFinished
                ? 'CZAS NA SERIĘ! (ODPOCZYNEK ZAKOŃCZONY)'
                : isRestRunning
                ? 'STOPER ODPOCZYNKU MIĘDZY SERIAMI'
                : restRemaining > 0
                ? 'ODPOCZYNEK WSTRZYMANY'
                : 'STOPER ODPOCZYNKU MIĘDZY SERIAMI'}
            </span>
          </div>

          {(restRemaining > 0 || isRestFinished) && (
            <span
              className={`font-mono text-xl font-black ${
                isRestFinished ? 'text-amber-400' : isRestRunning ? 'text-cyan-400' : 'text-white'
              }`}
            >
              {restTimeFormatted}
            </span>
          )}
        </div>

        {/* Linear progress bar */}
        {restRemaining > 0 && (
          <div className="w-full bg-[#0F1218] rounded-full h-1.5 overflow-hidden mb-2.5">
            <div
              className={`h-full transition-all duration-300 ${
                isRestRunning ? 'bg-cyan-400' : 'bg-amber-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Quick Presets & Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            {[60, 90, 120, 180].map((sec) => (
              <button
                key={sec}
                onClick={() => startRestTimer(sec)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                  restTotal === sec && (isRestRunning || restRemaining > 0)
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-[#0F1218] text-[#94A3B8] border-[#2C384E] hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {(restRemaining > 0 || isRestRunning) && (
              <>
                <button
                  onClick={() => adjustRestTimer(-15)}
                  className="bg-[#0F1218] hover:bg-[#1F2736] text-[#94A3B8] hover:text-white text-xs px-2 py-1 rounded-lg border border-[#2C384E]"
                >
                  -15s
                </button>
                <button
                  onClick={() => adjustRestTimer(15)}
                  className="bg-[#0F1218] hover:bg-[#1F2736] text-[#94A3B8] hover:text-white text-xs px-2 py-1 rounded-lg border border-[#2C384E]"
                >
                  +15s
                </button>
                <button
                  onClick={() => setIsRestRunning(!isRestRunning)}
                  className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                >
                  {isRestRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setIsRestRunning(false);
                    setRestRemaining(0);
                    setIsRestFinished(false);
                  }}
                  className="p-1.5 rounded-lg bg-[#0F1218] text-[#94A3B8] hover:text-white border border-[#2C384E]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Current Exercise Card */}
      <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
              Ćwiczenie 1 z 4
            </span>
            <h3 className="text-base font-bold text-white">Wyciskanie sztangi leżąc</h3>
          </div>
          <span className="text-xs bg-[#1F2736] text-emerald-400 px-2.5 py-1 rounded-lg border border-[#2C384E] font-medium">
            Klatka piersiowa
          </span>
        </div>

        {/* Sets Table */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-5 text-[10px] text-[#94A3B8] font-semibold px-2 py-1 uppercase text-center">
            <span>Seria</span>
            <span>Ciężar</span>
            <span>Cel</span>
            <span>Wykonano</span>
            <span>Zatwierdź</span>
          </div>

          {sets.map((s, idx) => (
            <div
              key={s.setNumber}
              className={`grid grid-cols-5 items-center text-xs p-2.5 rounded-xl border text-center transition-all ${
                s.isDone
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                  : 'bg-[#0F1218] border-[#2C384E] text-[#94A3B8]'
              }`}
            >
              <span className="font-bold">{s.setNumber}</span>
              <span className="font-semibold text-white">{s.weight} kg</span>
              <span>{s.targetReps} powt.</span>
              <span className="font-bold text-emerald-400">{s.actualReps}</span>
              <button
                onClick={() => toggleSet(idx)}
                className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center transition-all ${
                  s.isDone
                    ? 'bg-emerald-500 text-[#0F1218] font-bold shadow-md shadow-emerald-500/30'
                    : 'bg-[#1F2736] text-[#94A3B8] hover:bg-[#2C384E] hover:text-white'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addSet}
          className="w-full bg-[#0F1218] hover:bg-[#1F2736] text-cyan-400 border border-cyan-500/30 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Dodaj kolejną serię
        </button>
      </div>

      {/* Finish Session Action Button */}
      <div className="pt-2">
        <button
          onClick={() => setShowFinishModal(true)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0F1218] font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
        >
          <Save className="w-4 h-4" />
          FINALIZUJ I ZAPISZ TRENING
        </button>
      </div>

      {/* --- FINISH WORKOUT CONFIRMATION MODAL --- */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Finalizacja treningu</h3>
            <p className="text-xs text-[#94A3B8]">
              Wybierz sposób rozliczenia sesji w rotacji planu:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowFinishModal(false);
                  onFinishSession();
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0F1218] font-bold py-2.5 rounded-xl text-xs shadow-md shadow-emerald-500/20"
              >
                Ukończ z przesunięciem rotacji
              </button>

              <button
                onClick={() => {
                  setShowFinishModal(false);
                  onFinishSession();
                }}
                className="w-full bg-[#1F2736] hover:bg-[#2C384E] text-white font-semibold py-2.5 rounded-xl text-xs border border-[#2C384E]"
              >
                Zachowaj bez przesunięcia rotacji
              </button>

              <button
                onClick={() => setShowFinishModal(false)}
                className="w-full bg-transparent text-[#94A3B8] hover:text-white py-1.5 text-xs"
              >
                Wróć do sesji
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DISCARD WORKOUT MODAL --- */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181E29] border border-red-500/40 rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              Porzucenie sesji treningowej
            </div>
            <p className="text-xs text-[#94A3B8]">
              Czy na pewno chcesz porzucić bieżący trening? Wprowadzone serie zostaną zarchiwizowane, a stan nie zostanie dopisany do historii ukończonych treningów.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 bg-[#1F2736] hover:bg-[#2C384E] text-[#94A3B8] font-semibold py-2 rounded-xl text-xs"
              >
                Anuluj
              </button>
              <button
                onClick={() => {
                  setShowDiscardModal(false);
                  onFinishSession();
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs shadow-md shadow-red-500/20"
              >
                Tak, porzuć
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
