import React from 'react';
import { Dumbbell, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentTab?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentTab = 'dashboard' }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#181E29] border-b border-[#2C384E] px-4 py-3 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <Dumbbell className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            PlanPasika.v1
            <span className="text-[10px] font-medium bg-[#1F2736] text-emerald-400 px-1.5 py-0.5 rounded border border-[#2C384E]">
              {currentTab === 'plans' ? 'Plany' : currentTab === 'library' ? 'Biblioteka' : currentTab === 'session' ? 'Trening' : 'Xiaomi 14T'}
            </span>
          </h1>
          <p className="text-[11px] text-[#94A3B8]">Lokalny asystent treningowy • Offline-first</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-2 py-1 rounded-full">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="text-[10px] font-medium">Baza Room (Local)</span>
      </div>
    </header>
  );
};
