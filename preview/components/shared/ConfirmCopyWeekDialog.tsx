import React, { useState } from 'react';
import { Copy, AlertCircle } from 'lucide-react';

interface ConfirmCopyWeekDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCopy: (targetWeekOffset: number) => void;
}

export const ConfirmCopyWeekDialog: React.FC<ConfirmCopyWeekDialogProps> = ({
  isOpen,
  onClose,
  onConfirmCopy
}) => {
  const [selectedTarget, setSelectedTarget] = useState<number>(1); // 1 = następny tydzień (przyszłość)

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 flex items-center justify-center text-[#00E676] shrink-0">
            <Copy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Kopiuj plan tygodnia w przyszłość</h3>
            <span className="text-[10px] text-[#00E676] font-mono">Brak przeciągania • Weryfikacja</span>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Kopiowanie rozkładu dni jest dozwolone <strong>wyłącznie w przyszłość</strong>. Kopiowane są przypisania treningów i dni wolnych (statusy wykonania w nowym tygodniu pozostają nierozstrzygnięte).
        </p>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-white block">Docelowy tydzień:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedTarget(1)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                selectedTarget === 1
                  ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676]'
                  : 'bg-[#212735] border-[#2C3548] text-[#94A3B8]'
              }`}
            >
              +1 tydzień w przód
            </button>
            <button
              onClick={() => setSelectedTarget(2)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                selectedTarget === 2
                  ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676]'
                  : 'bg-[#212735] border-[#2C3548] text-[#94A3B8]'
              }`}
            >
              +2 tygodnie w przód
            </button>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-start gap-2 text-[11px] text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>Uwaga: Istniejący harmonogram w wybranym tygodniu zostanie <strong>nadpisany</strong> po zatwierdzeniu.</span>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-[#2C3548] hover:bg-[#212735] text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={() => {
              onConfirmCopy(selectedTarget);
              onClose();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold transition-colors shadow-lg shadow-[#00E676]/20"
          >
            Potwierdź i nadpisz
          </button>
        </div>
      </div>
    </div>
  );
};
