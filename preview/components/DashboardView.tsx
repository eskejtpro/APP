import React from 'react';
import { Play, TrendingUp, ChevronRight, Activity, Flame, Clock } from 'lucide-react';
import { INITIAL_TEMPLATES } from '../data/sampleData';

interface DashboardViewProps {
  onStartSession: (name: string) => void;
  onOpenLibrary: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onStartSession, onOpenLibrary }) => {
  return (
    <div className="space-y-4 pb-20">
      {/* Banner / Current Plan */}
      <div className="bg-gradient-to-br from-[#181E29] to-[#1F2736] border border-[#2C384E] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> AKTYWNY CYKL ROTACYJNY
          </span>
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Dzień 1 z 4
          </span>
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Cykl Siłowy: Jesień 2026</h2>
        <p className="text-xs text-[#94A3B8] mb-4">
          Następny zaplanowany trening: <strong className="text-white">Push A (Klatka + Barki)</strong>
        </p>

        <button
          onClick={() => onStartSession('Push A (Klatka + Barki)')}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0F1218] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
        >
          <Play className="w-5 h-5 fill-current" />
          ROZPOCZNIJ SESJĘ TRENINGOWĄ
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#181E29] border border-[#2C384E] rounded-xl p-3 text-center">
          <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-[10px] text-[#94A3B8]">Treningi (m-c)</p>
          <p className="text-base font-bold text-white">14</p>
        </div>
        <div className="bg-[#181E29] border border-[#2C384E] rounded-xl p-3 text-center">
          <TrendingUp className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
          <p className="text-[10px] text-[#94A3B8]">Objętość (kg)</p>
          <p className="text-base font-bold text-white">28 450</p>
        </div>
        <div className="bg-[#181E29] border border-[#2C384E] rounded-xl p-3 text-center">
          <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-[10px] text-[#94A3B8]">Śr. czas trwania</p>
          <p className="text-base font-bold text-white">58m</p>
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Twoje Szablony Treningowe</h3>
          <button onClick={onOpenLibrary} className="text-xs text-emerald-400 hover:underline flex items-center">
            Biblioteka ćwiczeń <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {INITIAL_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-[#181E29] hover:bg-[#1F2736] border border-[#2C384E] rounded-xl p-3.5 flex items-center justify-between transition-colors cursor-pointer"
              onClick={() => onStartSession(tpl.name)}
            >
              <div>
                <h4 className="text-sm font-semibold text-white">{tpl.name}</h4>
                <p className="text-xs text-[#94A3B8]">{tpl.description}</p>
                <span className="inline-block mt-1 text-[10px] bg-[#0F1218] text-cyan-400 px-2 py-0.5 rounded border border-[#2C384E]">
                  {tpl.exerciseCount} ćwiczeń w zestawie
                </span>
              </div>
              <button className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500 hover:text-[#0F1218] transition-colors">
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
