import React, { useState } from 'react';
import { Pill, ShieldAlert } from 'lucide-react';

interface SubstanceManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, info: string) => void;
}

export const SubstanceManualEntryModal: React.FC<SubstanceManualEntryModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [substanceName, setSubstanceName] = useState('');
  const [manualNote, setManualNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Ręczny wpis substancji</h3>
            <span className="text-[10px] text-purple-400 font-mono">Moduł ewidencji własnej</span>
          </div>
        </div>

        {/* Regulatory disclaimer according to rules */}
        <div className="bg-purple-950/30 border border-purple-800/40 p-3 rounded-xl space-y-1 text-xs text-purple-200">
          <div className="flex items-center gap-1.5 font-bold text-[11px] text-purple-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Zasada: Wyłącznie ręczny rejestr</span>
          </div>
          <p className="text-[10px] text-purple-300/80 leading-relaxed">
            Aplikacja PlanPasika służy wyłącznie do rejestracji ręcznych notatek użytkownika. Nie udziela porad medycznych, kalkulacji ani zaleceń dawkowania.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-white block mb-1">Nazwa substancji / suplementu:</label>
            <input
              type="text"
              placeholder="np. Kreatyna, Witamina D3, Cynk"
              value={substanceName}
              onChange={(e) => setSubstanceName(e.target.value)}
              className="w-full bg-[#212735] border border-[#2C3548] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white block mb-1">Własna notatka użytkownika:</label>
            <textarea
              placeholder="Wprowadź własną notatkę dotyczącą pory przyjęcia lub obserwacji..."
              rows={3}
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              className="w-full bg-[#212735] border border-[#2C3548] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676] resize-none"
            />
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
            disabled={!substanceName.trim()}
            onClick={() => {
              if (substanceName.trim()) {
                onSave(substanceName.trim(), manualNote.trim());
                onClose();
              }
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#00E676] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#00c864] text-black text-xs font-bold transition-colors shadow-lg shadow-[#00E676]/20"
          >
            Zapisz wpis
          </button>
        </div>
      </div>
    </div>
  );
};
