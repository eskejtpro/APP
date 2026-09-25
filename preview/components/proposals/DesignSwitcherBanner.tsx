import React from 'react';
import { Palette } from 'lucide-react';

export type DesignProposalType = 'standard' | 'cyber_chrono' | 'obsidian_monolith' | 'tactical_bento';

interface DesignSwitcherBannerProps {
  currentDesign: DesignProposalType;
  onSelectDesign: (design: DesignProposalType) => void;
}

export const DesignSwitcherBanner: React.FC<DesignSwitcherBannerProps> = ({
  currentDesign,
  onSelectDesign
}) => {
  return (
    <div className="bg-[#0D1117] border-b border-[#21262D] px-3 py-2 select-none sticky top-0 z-50 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-5 h-5 rounded-md bg-[#00E676]/20 border border-[#00E676]/40 flex items-center justify-center">
            <Palette className="w-3 h-3 text-[#00E676]" />
          </div>
          <span className="text-[10px] font-mono font-bold text-[#E6EDF3] hidden sm:inline">
            WIZUALIZACJA:
          </span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => onSelectDesign('standard')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
              currentDesign === 'standard'
                ? 'bg-[#00E676] text-black shadow-sm'
                : 'bg-[#161B22] text-[#8B949E] hover:text-white border border-[#30363D]'
            }`}
          >
            Baza M3
          </button>

          <button
            onClick={() => onSelectDesign('cyber_chrono')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
              currentDesign === 'cyber_chrono'
                ? 'bg-[#00F5D4] text-black shadow-sm'
                : 'bg-[#161B22] text-[#8B949E] hover:text-[#00F5D4] border border-[#30363D]'
            }`}
          >
            1. Cyber-Chrono
          </button>

          <button
            onClick={() => onSelectDesign('obsidian_monolith')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
              currentDesign === 'obsidian_monolith'
                ? 'bg-[#FFFFFF] text-black shadow-sm'
                : 'bg-[#161B22] text-[#8B949E] hover:text-white border border-[#30363D]'
            }`}
          >
            2. Obsidian
          </button>

          <button
            onClick={() => onSelectDesign('tactical_bento')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
              currentDesign === 'tactical_bento'
                ? 'bg-[#D4FF00] text-black shadow-sm'
                : 'bg-[#161B22] text-[#8B949E] hover:text-[#D4FF00] border border-[#30363D]'
            }`}
          >
            3. Bento Grid
          </button>
        </div>
      </div>
    </div>
  );
};
