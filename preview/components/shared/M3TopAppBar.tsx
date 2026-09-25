import React from 'react';
import { Database, Settings } from 'lucide-react';

interface M3TopAppBarProps {
  proposalLabel?: string;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
}

export const M3TopAppBar: React.FC<M3TopAppBarProps> = ({
  proposalLabel,
  onOpenLibrary,
  onOpenSettings
}) => {
  return (
    <header className="bg-[#0F1218] border-b border-[#2C3548] px-4 py-3 flex items-center justify-between select-none">
      <div className="flex items-center gap-2">
        <div className="flex items-baseline">
          <span className="text-base font-black tracking-tight text-white">PlanPasika</span>
        </div>
        {proposalLabel && (
          <span className="text-[9px] font-mono font-bold bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 px-2 py-0.5 rounded-full ml-1">
            {proposalLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenLibrary}
          className="w-8 h-8 rounded-xl bg-[#171B24] hover:bg-[#212735] border border-[#2C3548] text-cyan-400 flex items-center justify-center transition-colors"
          title="Biblioteka ćwiczeń i Import"
        >
          <Database className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-xl bg-[#171B24] hover:bg-[#212735] border border-[#2C3548] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
          title="Kopie zapasowe i Ustawienia"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
