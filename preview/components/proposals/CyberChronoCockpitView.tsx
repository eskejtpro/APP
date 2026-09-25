import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Check,
  Flame,
  Activity,
  Zap,
  Shield,
  Layers,
  Clock
} from 'lucide-react';

interface CyberChronoCockpitViewProps {
  onBackToStandard: () => void;
}

export const CyberChronoCockpitView: React.FC<CyberChronoCockpitViewProps> = ({ onBackToStandard }) => {
  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(84);
  const [totalTimer, setTotalTimer] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Set Inputs
  const [weight, setWeight] = useState(102.5);
  const [reps, setReps] = useState(8);
  const [setsCompleted, setSetsCompleted] = useState([
    { id: 1, weight: 95, reps: 10, time: '18:15', rpe: 8 },
    { id: 2, weight: 100, reps: 8, time: '18:18', rpe: 8.5 }
  ]);
  const [activeSetIndex, setActiveSetIndex] = useState(3);
  const [totalTonnage, setTotalTonnage] = useState(1750);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleAdjustTimer = (delta: number) => {
    setTimerSeconds((prev) => Math.max(0, prev + delta));
  };

  const handleSetPreset = (sec: number) => {
    setTotalTimer(sec);
    setTimerSeconds(sec);
    setIsTimerRunning(true);
  };

  const handleCompleteSet = () => {
    const newSet = {
      id: setsCompleted.length + 1,
      weight,
      reps,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rpe: 9
    };
    setSetsCompleted([...setsCompleted, newSet]);
    setTotalTonnage((prev) => prev + weight * reps);
    setActiveSetIndex((prev) => prev + 1);
    setTimerSeconds(90);
    setIsTimerRunning(true);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = totalTimer > 0 ? ((totalTimer - timerSeconds) / totalTimer) * 100 : 0;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className="min-h-screen bg-[#07090E] text-[#F0F6FC] font-sans pb-28 select-none">
      {/* HUD Telemetry Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-[#00E676]/30 px-4 py-3 shadow-[0_4px_20px_rgba(0,230,118,0.1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E676]"></span>
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono tracking-widest text-[#00E676] uppercase font-bold">
                  HUD TELEMETRIA • LIVE
                </span>
              </div>
              <h1 className="text-sm font-black tracking-wide text-white uppercase flex items-center gap-1">
                PUSH HYPERTROPHY A <span className="text-[#00F5D4] text-xs font-mono">#SESJA-84</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div className="text-right">
              <span className="text-[9px] text-[#64748B] uppercase block">Tonaż Sesji</span>
              <span className="text-xs font-extrabold text-[#00F5D4]">{totalTonnage.toLocaleString()} KG</span>
            </div>
            <div className="h-6 w-px bg-[#1E293B]" />
            <div className="text-right">
              <span className="text-[9px] text-[#64748B] uppercase block">Czas Sesji</span>
              <span className="text-xs font-extrabold text-white">00:38:45</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Banner Informacyjny */}
        <div className="bg-gradient-to-r from-[#00E676]/10 via-[#00F5D4]/10 to-transparent border border-[#00E676]/30 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00E676]" />
            <div>
              <span className="text-[11px] font-bold text-white uppercase block">Wizualizacja 1: Cyber-Chrono Cockpit</span>
              <span className="text-[10px] text-[#94A3B8]">Styl telemetryczny, neonowy HUD, kołowy timer i kapsuły serii.</span>
            </div>
          </div>
          <button
            onClick={onBackToStandard}
            className="text-[10px] font-bold bg-[#1E293B] hover:bg-[#334155] text-[#00E676] px-2.5 py-1.5 rounded-lg border border-[#00E676]/30 transition-all"
          >
            Wróć do bazy
          </button>
        </div>

        {/* 1. RADIAL REST TIMER CARD (HUD GAUGE) */}
        <div className="bg-[#0C101A] border border-[#00F5D4]/30 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,245,212,0.06)] relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#00F5D4]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00F5D4]" />
              <span className="text-[10px] font-mono font-bold text-[#00F5D4] uppercase tracking-wider">
                Stoper Regeneracji Między Seriami
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#94A3B8]">Preset: {totalTimer}s</span>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            {/* Radial SVG Gauge */}
            <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#161F30" strokeWidth="7" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#neonGradient)"
                  strokeWidth="7"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E676" />
                    <stop offset="100%" stopColor="#00F5D4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black font-mono tracking-tight text-white">{formatTime(timerSeconds)}</span>
                <span className="text-[8px] font-mono uppercase text-[#00F5D4] tracking-widest">
                  {timerSeconds === 0 ? 'GOTOWY' : isTimerRunning ? 'ODPOCZYNEK' : 'PAUZA'}
                </span>
              </div>
            </div>

            {/* Timer Actions */}
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleAdjustTimer(-15)}
                  className="bg-[#141B29] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#222E45] rounded-lg py-2 text-xs font-mono font-bold transition-all active:scale-95"
                >
                  -15s
                </button>
                <button
                  onClick={() => handleAdjustTimer(15)}
                  className="bg-[#141B29] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#222E45] rounded-lg py-2 text-xs font-mono font-bold transition-all active:scale-95"
                >
                  +15s
                </button>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1 transition-all ${
                    isTimerRunning
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                      : 'bg-[#00E676] text-black shadow-lg shadow-[#00E676]/20'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isTimerRunning ? 'PAUZA' : 'WZNÓW'}</span>
                </button>
                <button
                  onClick={() => handleAdjustTimer(-timerSeconds)}
                  className="px-3 py-2 bg-[#141B29] hover:bg-[#1E293B] text-[#94A3B8] border border-[#222E45] rounded-lg text-xs font-mono font-bold"
                >
                  POMIŃ
                </button>
              </div>

              {/* Preset buttons */}
              <div className="flex justify-between gap-1 pt-1">
                {[60, 90, 120, 180].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleSetPreset(sec)}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold border transition-all ${
                      totalTimer === sec
                        ? 'bg-[#00F5D4]/20 border-[#00F5D4] text-[#00F5D4]'
                        : 'bg-[#101522] border-[#1D263B] text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. ACTIVE EXERCISE BATTLE CAPSULE */}
        <div className="bg-[#0C101A] border-2 border-[#00E676] rounded-2xl p-4 space-y-4 shadow-[0_10px_35px_rgba(0,230,118,0.08)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676] text-[9px] font-mono font-bold uppercase tracking-wider">
                  KLATKA PIERSIOWA
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8]">Ćwiczenie 1 z 5</span>
              </div>
              <h2 className="text-base font-black text-white tracking-wide mt-1">
                Wyciskanie Sztangi Leżąc (Bench Press)
              </h2>
            </div>
            <button className="text-[10px] font-mono text-[#00F5D4] border border-[#00F5D4]/30 px-2 py-1 rounded-lg hover:bg-[#00F5D4]/10">
              Zmień ⇄
            </button>
          </div>

          {/* Large Stepper Inputs */}
          <div className="grid grid-cols-2 gap-3">
            {/* Weight Stepper */}
            <div className="bg-[#121824] border border-[#1E293B] rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8]">Ciężar Roboczy</span>
                <span className="text-[9px] font-mono text-[#00E676]">KG</span>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setWeight((w) => Math.max(0, w - 2.5))}
                  className="w-9 h-9 rounded-lg bg-[#1C2538] hover:bg-[#25324C] text-[#00F5D4] text-lg font-mono font-bold flex items-center justify-center active:scale-90 transition-all"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="text-2xl font-black font-mono text-white tracking-tight">{weight}</span>
                </div>
                <button
                  onClick={() => setWeight((w) => w + 2.5)}
                  className="w-9 h-9 rounded-lg bg-[#1C2538] hover:bg-[#25324C] text-[#00F5D4] text-lg font-mono font-bold flex items-center justify-center active:scale-90 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Reps Stepper */}
            <div className="bg-[#121824] border border-[#1E293B] rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8]">Powtórzenia</span>
                <span className="text-[9px] font-mono text-[#00F5D4]">REPS</span>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setReps((r) => Math.max(1, r - 1))}
                  className="w-9 h-9 rounded-lg bg-[#1C2538] hover:bg-[#25324C] text-[#00E676] text-lg font-mono font-bold flex items-center justify-center active:scale-90 transition-all"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="text-2xl font-black font-mono text-white tracking-tight">{reps}</span>
                </div>
                <button
                  onClick={() => setReps((r) => r + 1)}
                  className="w-9 h-9 rounded-lg bg-[#1C2538] hover:bg-[#25324C] text-[#00E676] text-lg font-mono font-bold flex items-center justify-center active:scale-90 transition-all"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action: Complete Set */}
          <button
            onClick={handleCompleteSet}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00F5D4] text-black font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(0,230,118,0.3)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Zatwierdź Serię #{activeSetIndex} ({weight} kg × {reps})</span>
          </button>
        </div>

        {/* 3. COMPLETED SETS TELEMETRY LOG */}
        <div className="bg-[#0C101A] border border-[#1E293B] rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8] tracking-wider">
              Zarejestrowane Serie ({setsCompleted.length})
            </span>
            <span className="text-[10px] font-mono text-[#00E676]">Tonaż: {setsCompleted.reduce((s, i) => s + i.weight * i.reps, 0)} kg</span>
          </div>

          <div className="space-y-2">
            {setsCompleted.map((set, idx) => (
              <div
                key={set.id}
                className="bg-[#121824] border border-[#1E293B] rounded-xl px-3 py-2.5 flex items-center justify-between font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-white">
                      {set.weight} kg × {set.reps} powt.
                    </span>
                    <span className="text-[9px] text-[#64748B] block">Godz. {set.time} • RPE {set.rpe}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#00F5D4]">{(set.weight * set.reps).toLocaleString()} kg</span>
                  <Check className="w-4 h-4 text-[#00E676]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. MUSCLE LOAD TELEMETRY (7 ANATOMICAL CATEGORIES) */}
        <div className="bg-[#0C101A] border border-[#1E293B] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[10px] font-mono font-bold uppercase text-white tracking-wider">
                Obciążenie Anatomiczne (7 Grup)
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#64748B]">Cykl 4-tygodniowy</span>
          </div>

          <div className="space-y-2">
            {[
              { cat: 'KLATKA PIERSIOWA', pct: 85, color: 'from-[#00E676] to-[#00F5D4]' },
              { cat: 'PLECY', pct: 100, color: 'from-[#3B82F6] to-[#00F5D4]' },
              { cat: 'BARKI', pct: 45, color: 'from-[#F59E0B] to-[#EF4444]' },
              { cat: 'TRICEPS', pct: 60, color: 'from-[#00E676] to-[#3B82F6]' },
              { cat: 'NOGI', pct: 90, color: 'from-[#8B5CF6] to-[#EC4899]' }
            ].map((item) => (
              <div key={item.cat} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-[#94A3B8]">{item.cat}</span>
                  <span className="text-white font-bold">{item.pct}% objętości</span>
                </div>
                <div className="w-full h-1.5 bg-[#161F30] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Cockpit Floating Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#0B0F17]/95 backdrop-blur-lg border-t border-[#1E293B] py-2 px-6 flex justify-around items-center z-50">
        <button className="flex flex-col items-center gap-1 text-[#00E676]">
          <Activity className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold uppercase">KOKPIT</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#64748B] hover:text-white">
          <Layers className="w-5 h-5" />
          <span className="text-[9px] font-mono uppercase">PLANY</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#64748B] hover:text-white">
          <Clock className="w-5 h-5" />
          <span className="text-[9px] font-mono uppercase">KALENDARZ</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#64748B] hover:text-white">
          <Shield className="w-5 h-5" />
          <span className="text-[9px] font-mono uppercase">ANALIZY</span>
        </button>
      </nav>
    </div>
  );
};
