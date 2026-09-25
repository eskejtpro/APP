import React from 'react';
import { Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const completedDays = new Set([2, 4, 7, 9, 11, 14, 16, 18, 21, 23]);

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            Wrzesień 2026
          </h2>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-lg bg-[#1F2736] text-[#94A3B8] hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 rounded-lg bg-[#1F2736] text-[#94A3B8] hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
            <span key={d} className="text-[10px] text-[#94A3B8] font-bold py-1">
              {d}
            </span>
          ))}

          {days.map((d) => {
            const isCompleted = completedDays.has(d);
            const isToday = d === 24;
            return (
              <div
                key={d}
                className={`h-10 rounded-xl flex flex-col items-center justify-center text-xs font-semibold relative transition-all ${
                  isToday
                    ? 'border-2 border-cyan-400 bg-cyan-950/30 text-white'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#0F1218] text-[#94A3B8] border border-[#2C384E]/50'
                }`}
              >
                <span>{d}</span>
                {isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* History item */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Ostatnia ukończona sesja</h3>
        <div className="bg-[#181E29] border border-[#2C384E] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Ukończono 23 Września
            </span>
            <span className="text-[10px] bg-[#1F2736] text-[#94A3B8] px-2 py-0.5 rounded border border-[#2C384E]">
              54 minuty
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white">Pull A (Plecy + Biceps)</h4>
          <div className="flex gap-4 text-xs text-[#94A3B8]">
            <span>Objętość: <strong className="text-white">6 800 kg</strong></span>
            <span>Serie: <strong className="text-white">18</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
