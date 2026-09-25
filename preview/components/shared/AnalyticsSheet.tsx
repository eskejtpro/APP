import React from 'react';
import { BarChart3, ShieldCheck, X } from 'lucide-react';

interface CategoryMetric {
  name: string;
  completedSets: number;
  percentage: number;
}

interface AnalyticsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsSheet: React.FC<AnalyticsSheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // The 7 strictly approved product categories from ExerciseCategory domain model
  const approvedCategories: CategoryMetric[] = [
    { name: 'Klatka piersiowa', completedSets: 0, percentage: 0 },
    { name: 'Plecy', completedSets: 0, percentage: 0 },
    { name: 'Barki', completedSets: 0, percentage: 0 },
    { name: 'Nogi', completedSets: 0, percentage: 0 },
    { name: 'Biceps', completedSets: 0, percentage: 0 },
    { name: 'Triceps', completedSets: 0, percentage: 0 },
    { name: 'Pozostałe', completedSets: 0, percentage: 0 }
  ];

  const totalSets = approvedCategories.reduce((acc, c) => acc + c.completedSets, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end select-none">
      <div className="bg-[#171B24] border-t border-[#2C3548] rounded-t-3xl max-w-md w-full mx-auto p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="w-12 h-1.5 rounded-full bg-[#333D52] mx-auto" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00E676]/20 flex items-center justify-center text-[#00E676]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Analiza Objętości Serii</h3>
              <span className="text-[10px] text-[#00E676] font-mono">7 zatwierdzonych kategorii</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Rule Banner */}
        <div className="bg-[#212735] border border-[#2C3548] p-3 rounded-xl space-y-1 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-1.5 text-[#00E676] font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Reguła wyliczeń:</span>
          </div>
          <p className="text-[10px] leading-relaxed">
            Analizy liczą <strong>wyłącznie serie rzeczywiście ukończone i zatwierdzone</strong>. Serie odrzucone lub wersje robocze są bezwzględnie pomijane.
          </p>
        </div>

        {/* Total stats */}
        <div className="grid grid-cols-2 gap-2 bg-[#0F1218] p-3 rounded-2xl border border-[#2C3548]">
          <div>
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Ukończone serie</span>
            <span className="text-xl font-black text-white font-mono">{totalSets}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Zatwierdzone partie</span>
            <span className="text-xl font-black text-[#00E676] font-mono">0 / 7</span>
          </div>
        </div>

        {/* Empty state notice */}
        <div className="p-2.5 rounded-xl bg-[#0F1218] border border-[#2C3548] text-center">
          <span className="text-xs text-[#94A3B8]">Brak zarejestrowanych serii w bazie. Wszystkie kategorie: 0 serii.</span>
        </div>

        {/* 7 Categories Progress List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {approvedCategories.map((cat, idx) => (
            <div key={idx} className="bg-[#212735] p-3 rounded-xl border border-[#2C3548] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{cat.name}</span>
                <span className="font-mono text-[#00E676] font-bold">
                  {cat.completedSets} serii ({cat.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#0F1218] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00E676] rounded-full"
                  style={{ width: `${cat.percentage * 3.5}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#212735] hover:bg-[#2C3548] text-white text-xs font-bold transition-colors"
        >
          Zamknij analizy
        </button>
      </div>
    </div>
  );
};
