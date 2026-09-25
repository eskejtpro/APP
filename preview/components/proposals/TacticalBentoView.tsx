import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Activity,
  Dumbbell,
  TrendingUp,
  Calculator
} from 'lucide-react';

interface TacticalBentoViewProps {
  onBackToStandard: () => void;
}

export const TacticalBentoView: React.FC<TacticalBentoViewProps> = ({ onBackToStandard }) => {
  // Plate calculator interactive state
  const [calcTargetWeight, setCalcTargetWeight] = useState(102.5);

  const calculatePlates = (target: number) => {
    const barWeight = 20;
    let remainingPerSide = Math.max(0, (target - barWeight) / 2);
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const result: { plate: number; count: number }[] = [];

    for (const p of availablePlates) {
      if (remainingPerSide >= p) {
        const count = Math.floor(remainingPerSide / p);
        result.push({ plate: p, count });
        remainingPerSide -= count * p;
      }
    }
    return result;
  };

  const plates = calculatePlates(calcTargetWeight);

  return (
    <div className="min-h-screen bg-[#0C0F17] text-[#F8FAFC] font-sans pb-28 select-none">
      {/* Top Header */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[#1A2234]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#D4FF00] flex items-center justify-center font-black text-black text-xs">
            PP
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#D4FF00] font-bold uppercase tracking-wider block">
              BENTO WORKSTATION
            </span>
            <h1 className="text-base font-extrabold text-white">Pulpit Treningowy</h1>
          </div>
        </div>
        <button
          onClick={onBackToStandard}
          className="text-xs font-bold text-[#D4FF00] bg-[#1A2234] hover:bg-[#25324C] border border-[#D4FF00]/30 px-3 py-1.5 rounded-xl transition-all"
        >
          Wróć
        </button>
      </header>

      {/* Bento Grid Main Container */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-[#131926] border border-[#212C42] rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Wizualizacja 3: Tactical Bento Workstation</span>
            <span className="text-[10px] text-[#94A3B8]">Modułowy pulpit bento z kalkulatorem talerzy i osią czasu.</span>
          </div>
          <span className="px-2.5 py-1 bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/40 rounded-full text-[10px] font-bold">
            Bento Grid
          </span>
        </div>

        {/* BENTO TILE 1 (Hero Large): Dzisiejszy Trening */}
        <div className="bg-gradient-to-br from-[#161E2E] to-[#0F1420] border-2 border-[#D4FF00]/60 rounded-3xl p-5 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="px-3 py-1 rounded-full bg-[#D4FF00] text-black text-[10px] font-black uppercase tracking-wider">
              DZISIEJSZY PLAN (CZWARTEK)
            </span>
            <span className="text-xs font-mono text-[#94A3B8]">5 ćwiczeń • ~50 min</span>
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Push Hypertrophy (Klatka + Barki)</h2>
            <p className="text-xs text-[#94A3B8] mt-1">Główne boje: Wyciskanie sztangi, Wznosy bokiem, Dipsy.</p>
          </div>

          <div className="pt-2">
            <button className="w-full py-3 rounded-2xl bg-[#D4FF00] hover:bg-[#bce400] text-black font-extrabold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#D4FF00]/20 transition-all active:scale-95">
              <Dumbbell className="w-4 h-4" />
              <span>ROZPOCZNIJ TĘ SESJĘ</span>
            </button>
          </div>
        </div>

        {/* BENTO TILE 2 (Wide): Weekly Timeline */}
        <div className="bg-[#131926] border border-[#212C42] rounded-3xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase font-bold tracking-wider">
              HARMONOGRAM TYGODNIA (TYDZIEŃ 3 Z 6)
            </span>
            <span className="text-[10px] font-mono text-[#D4FF00]">3/4 Treningi</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center font-mono">
            {[
              { day: 'PN', status: 'done', label: 'Push' },
              { day: 'WT', status: 'done', label: 'Pull' },
              { day: 'ŚR', status: 'rest', label: 'Rest' },
              { day: 'CZ', status: 'today', label: 'Push' },
              { day: 'PT', status: 'planned', label: 'Legs' },
              { day: 'SO', status: 'rest', label: 'Rest' },
              { day: 'ND', status: 'rest', label: 'Rest' }
            ].map((d) => (
              <div
                key={d.day}
                className={`py-2 rounded-xl border flex flex-col items-center gap-1 ${
                  d.status === 'today'
                    ? 'bg-[#D4FF00]/20 border-[#D4FF00] text-white font-bold ring-1 ring-[#D4FF00]'
                    : d.status === 'done'
                    ? 'bg-[#1A263B] border-[#2563EB]/40 text-[#60A5FA]'
                    : 'bg-[#0E131E] border-[#1E2638] text-[#64748B]'
                }`}
              >
                <span className="text-[9px] font-bold">{d.day}</span>
                <span className="text-[8px]">{d.status === 'done' ? '✔' : d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BENTO ROW: 2 Asymmetrical Tiles */}
        <div className="grid grid-cols-2 gap-4">
          {/* Tile 3: Recovery Gauge */}
          <div className="bg-[#131926] border border-[#212C42] rounded-3xl p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase font-bold">REGENERACJA</span>
              <Activity className="w-3.5 h-3.5 text-[#22C55E]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#22C55E] font-mono">94%</div>
              <span className="text-[10px] text-white font-medium block">Gotowy na 100% obciążenia</span>
              <span className="text-[9px] text-[#64748B]">Ostatnia sesja: 22h temu</span>
            </div>
          </div>

          {/* Tile 4: Tonnage Progress */}
          <div className="bg-[#131926] border border-[#212C42] rounded-3xl p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase font-bold">TONAŻ MIESIĘCZNY</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#38BDF8]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#38BDF8] font-mono">+12.4%</div>
              <span className="text-[10px] text-white font-medium block">64 250 kg zrealizowane</span>
              <span className="text-[9px] text-[#64748B]">Trend progresji liniowej</span>
            </div>
          </div>
        </div>

        {/* BENTO TILE 5: Szybki Kalkulator Talerzy na Sztangę (Plate Math) */}
        <div className="bg-[#131926] border border-[#212C42] rounded-3xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#D4FF00]" />
              <span className="text-xs font-bold text-white uppercase font-mono">
                Kalkulator Talerzy na Sztangę (Gryf 20 kg)
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#D4FF00] font-bold">{calcTargetWeight} KG</span>
          </div>

          {/* Weight selector buttons */}
          <div className="flex items-center justify-between gap-2 bg-[#0E131E] p-2 rounded-2xl border border-[#1E2638]">
            <button
              onClick={() => setCalcTargetWeight((w) => Math.max(20, w - 5))}
              className="px-3 py-1.5 bg-[#1A2234] hover:bg-[#25324C] text-white font-mono font-bold rounded-xl text-xs"
            >
              -5 kg
            </button>
            <span className="text-sm font-black font-mono text-white">{calcTargetWeight} kg łącznie</span>
            <button
              onClick={() => setCalcTargetWeight((w) => w + 5)}
              className="px-3 py-1.5 bg-[#1A2234] hover:bg-[#25324C] text-white font-mono font-bold rounded-xl text-xs"
            >
              +5 kg
            </button>
          </div>

          {/* Visual Plates Display (Na stronę) */}
          <div className="bg-[#0E131E] p-3 rounded-2xl border border-[#1E2638] space-y-1.5">
            <span className="text-[10px] text-[#94A3B8] font-mono uppercase block">
              Zestaw talerzy NA JEDNĄ STRONĘ gryfu ({Math.max(0, (calcTargetWeight - 20) / 2)} kg):
            </span>
            <div className="flex flex-wrap gap-1.5 items-center pt-1">
              {plates.length === 0 ? (
                <span className="text-xs text-[#64748B] font-mono">Sam gryf olimpijski (20 kg)</span>
              ) : (
                plates.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/50 text-[#93C5FD] font-mono text-xs font-bold flex items-center gap-1"
                  >
                    <span>{p.count}×</span>
                    <span className="text-white">{p.plate} kg</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bento Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#0C0F17]/95 backdrop-blur-lg border-t border-[#1A2234] py-2 px-6 flex justify-around items-center z-50">
        <button className="flex flex-col items-center gap-1 text-[#D4FF00]">
          <Activity className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold">Pulpit</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#64748B] hover:text-white">
          <Layers className="w-5 h-5" />
          <span className="text-[9px] font-mono">Plany</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#64748B] hover:text-white">
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] font-mono">Kalendarz</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#64748B] hover:text-white">
          <TrendingUp className="w-5 h-5" />
          <span className="text-[9px] font-mono">Analizy</span>
        </button>
      </nav>
    </div>
  );
};
