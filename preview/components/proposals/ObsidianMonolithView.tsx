import React, { useState, useEffect } from 'react';
import {
  Check,
  Trophy,
  ArrowUpRight
} from 'lucide-react';

interface ObsidianMonolithViewProps {
  onBackToStandard: () => void;
}

export const ObsidianMonolithView: React.FC<ObsidianMonolithViewProps> = ({ onBackToStandard }) => {
  const [weight, setWeight] = useState(102.5);
  const [reps, setReps] = useState(8);
  const [setNumber, setSetNumber] = useState(3);
  const [restSeconds, setRestSeconds] = useState(75);
  const [isResting, setIsResting] = useState(true);
  const hasNewPR = true;

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isResting && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restSeconds]);

  const formatRest = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans pb-32 select-none">
      {/* Top Swiss Header */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[#18181B]">
        <div>
          <span className="text-[10px] tracking-widest text-[#A1A1AA] uppercase font-mono font-medium">
            MONOLITH • TRYB FOCUS
          </span>
          <h1 className="text-lg font-bold tracking-tight text-white">Wyciskanie Sztangi Leżąc</h1>
        </div>
        <button
          onClick={onBackToStandard}
          className="text-[11px] font-semibold text-[#A1A1AA] hover:text-white px-3 py-1.5 rounded-full border border-[#27272A] transition-all"
        >
          Wróć
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto p-5 space-y-6">
        {/* Info Banner */}
        <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Wizualizacja 2: Obsidian Monolith</span>
            <span className="text-[10px] text-[#71717A]">Czerń OLED, olbrzymie cyfry 48sp czytelne z 2 metrów na macie.</span>
          </div>
          <span className="px-2.5 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 rounded-full text-[10px] font-bold">
            OLED Focus
          </span>
        </div>

        {/* PR Badge (Obsidian Luxury Gold Accent) */}
        {hasNewPR && (
          <div className="bg-gradient-to-r from-[#F59E0B]/10 via-[#F59E0B]/5 to-transparent border border-[#F59E0B]/30 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#F59E0B] uppercase font-bold tracking-wider block">
                  NOWY REKORD ŻYCIOWY (PR)
                </span>
                <span className="text-xs font-bold text-white">Estymowany 1RM = 130.0 kg (+2.5 kg)</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#F59E0B]" />
          </div>
        )}

        {/* FLOOR FOCUS DISPLAY (Olbrzymie wartości dla sali treningowej) */}
        <div className="bg-[#09090B] border border-[#27272A] rounded-3xl p-6 space-y-6 shadow-2xl relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-widest text-[#10B981] uppercase">
              SERIA {setNumber} Z 4
            </span>
            <span className="text-xs font-mono text-[#71717A]">CEL: RPE 8.5</span>
          </div>

          {/* Huge Number Grid */}
          <div className="grid grid-cols-2 gap-4 text-center">
            {/* Weight */}
            <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-4 space-y-2">
              <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider block">CIĘŻAR</span>
              <div className="text-4xl font-black tracking-tighter text-white font-mono">{weight}</div>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  onClick={() => setWeight((w) => Math.max(0, w - 2.5))}
                  className="w-10 h-10 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-base font-bold flex items-center justify-center active:scale-90 transition-all"
                >
                  -
                </button>
                <button
                  onClick={() => setWeight((w) => w + 2.5)}
                  className="w-10 h-10 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-base font-bold flex items-center justify-center active:scale-90 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Reps */}
            <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-4 space-y-2">
              <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider block">POWTÓRZENIA</span>
              <div className="text-4xl font-black tracking-tighter text-white font-mono">{reps}</div>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  onClick={() => setReps((r) => Math.max(1, r - 1))}
                  className="w-10 h-10 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-base font-bold flex items-center justify-center active:scale-90 transition-all"
                >
                  -
                </button>
                <button
                  onClick={() => setReps((r) => r + 1)}
                  className="w-10 h-10 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-base font-bold flex items-center justify-center active:scale-90 transition-all"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Big Monolithic Complete Button */}
          <button
            onClick={() => {
              setSetNumber((s) => s + 1);
              setRestSeconds(90);
              setIsResting(true);
            }}
            className="w-full py-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#E4E4E7] text-black font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>ODHACZ SERIĘ #{setNumber} ({weight} KG × {reps})</span>
          </button>
        </div>

        {/* Minimal Rest Timer Strip */}
        <div className="bg-[#09090B] border border-[#27272A] rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono">
            <span className="text-xs text-[#71717A] uppercase">Odpoczynek:</span>
            <span className="text-lg font-black text-[#10B981]">{formatRest(restSeconds)}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <button
              onClick={() => setRestSeconds((s) => Math.max(0, s - 15))}
              className="px-2.5 py-1 bg-[#18181B] hover:bg-[#27272A] text-xs text-[#A1A1AA] rounded-lg border border-[#27272A]"
            >
              -15s
            </button>
            <button
              onClick={() => setIsResting(!isResting)}
              className="px-3 py-1 bg-[#18181B] hover:bg-[#27272A] text-xs text-white rounded-lg border border-[#27272A]"
            >
              {isResting ? 'Pauza' : 'Wznów'}
            </button>
            <button
              onClick={() => setRestSeconds((s) => s + 15)}
              className="px-2.5 py-1 bg-[#18181B] hover:bg-[#27272A] text-xs text-[#A1A1AA] rounded-lg border border-[#27272A]"
            >
              +15s
            </button>
          </div>
        </div>

        {/* Session Progress List */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#71717A] uppercase tracking-wider block">Historia Serii</span>
          {[
            { id: 1, w: 95, r: 10, check: true },
            { id: 2, w: 100, r: 8, check: true }
          ].map((item) => (
            <div
              key={item.id}
              className="bg-[#09090B] border border-[#18181B] rounded-xl px-4 py-2.5 flex items-center justify-between font-mono"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#71717A]">#{item.id}</span>
                <span className="text-sm font-bold text-white">{item.w} kg × {item.r} powtórzeń</span>
              </div>
              <Check className="w-4 h-4 text-[#10B981]" />
            </div>
          ))}
        </div>
      </main>

      {/* Floating Pill Bottom Dock */}
      <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 px-4">
        <nav className="bg-[#121215]/90 backdrop-blur-xl border border-[#27272A] rounded-full px-6 py-2.5 shadow-2xl flex items-center gap-8">
          <button className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>Trening</span>
          </button>
          <button className="text-xs font-medium text-[#71717A] hover:text-white transition-colors">
            Plany
          </button>
          <button className="text-xs font-medium text-[#71717A] hover:text-white transition-colors">
            Kalendarz
          </button>
          <button className="text-xs font-medium text-[#71717A] hover:text-white transition-colors">
            Analizy
          </button>
        </nav>
      </div>
    </div>
  );
};
