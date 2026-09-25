import React, { useState } from 'react';
import { RefreshCw, Check, ShieldCheck } from 'lucide-react';
import { Exercise } from '../../data/sampleData';

interface ReplaceExerciseDialogProps {
  isOpen: boolean;
  currentExerciseName: string;
  completedSetsCount: number;
  remainingSetsCount: number;
  availableExercises: Exercise[];
  onConfirmReplace: (newExercise: Exercise) => void;
  onClose: () => void;
}

export const ReplaceExerciseDialog: React.FC<ReplaceExerciseDialogProps> = ({
  isOpen,
  currentExerciseName,
  completedSetsCount,
  remainingSetsCount,
  availableExercises,
  onConfirmReplace,
  onClose
}) => {
  const [selectedExId, setSelectedExId] = useState<string>(availableExercises[0]?.id || '1');

  if (!isOpen) return null;

  const selectedEx = availableExercises.find((e) => e.id === selectedExId) || availableExercises[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Zastąp nieukończoną część</h3>
            <span className="text-[10px] text-cyan-400 font-mono">Zachowanie historii serii</span>
          </div>
        </div>

        {/* Product rule badge */}
        <div className="bg-[#212735] border border-[#2C3548] p-3 rounded-xl space-y-1.5 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-1.5 text-[#00E676] font-bold text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Zasada nienaruszalności wykonanych serii:</span>
          </div>
          <p className="leading-relaxed">
            Dotychczas ukończone serie (<strong>{completedSetsCount}</strong>) dla ćwiczenia <em>{currentExerciseName}</em> pozostają <strong>w pełni zachowane i zaliczone</strong>. Nowe ćwiczenie przejmie tylko pozostałe <strong>{remainingSetsCount}</strong> serii.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-white block">Wybierz ćwiczenie zamienne:</label>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {availableExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => setSelectedExId(ex.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  selectedExId === ex.id
                    ? 'bg-[#00E676]/15 border-[#00E676] text-white font-bold'
                    : 'bg-[#212735] border-[#2C3548] text-[#94A3B8] hover:text-white'
                }`}
              >
                <div>
                  <span className="block truncate max-w-[210px]">{ex.name}</span>
                  <span className="text-[9px] text-[#64748B] block">{ex.category}</span>
                </div>
                {selectedExId === ex.id && <Check className="w-4 h-4 text-[#00E676] shrink-0" />}
              </div>
            ))}
          </div>
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
              if (selectedEx) onConfirmReplace(selectedEx);
              onClose();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold transition-colors shadow-lg shadow-[#00E676]/20"
          >
            Zatwierdź zamianę
          </button>
        </div>
      </div>
    </div>
  );
};
