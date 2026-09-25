import React, { useState } from 'react';
import { FileSpreadsheet, Check } from 'lucide-react';
import { Exercise } from '../../data/sampleData';

interface GymTrackerImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (importedExercises: Exercise[]) => void;
}

export const GymTrackerImportDialog: React.FC<GymTrackerImportDialogProps> = ({
  isOpen,
  onClose,
  onConfirmImport
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>(['imp_1', 'imp_2', 'imp_3']);

  if (!isOpen) return null;

  const importCandidates = [
    {
      id: 'imp_1',
      name: 'Wyciskanie na maszynie Hammer',
      category: 'Klatka piersiowa',
      status: 'NEW',
      notes: 'Nowe ćwiczenie z pliku GymTracker'
    },
    {
      id: 'imp_2',
      name: 'Face pulls z linką wyciągu',
      category: 'Barki',
      status: 'NEW',
      notes: 'Brak w bazie lokalnej'
    },
    {
      id: 'imp_3',
      name: 'Wyciskanie sztangi leżąc na ławce poziomej',
      category: 'Klatka piersiowa',
      status: 'DUPLICATE',
      notes: 'Duplikat wykryty w bazie lokalnej (strategia: Pomiń lub Zastąp po potwierdzeniu)'
    }
  ];

  const handleToggle = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    const toImport: Exercise[] = importCandidates
      .filter((c) => selectedItems.includes(c.id) && c.status !== 'DUPLICATE')
      .map((c) => ({
        id: `imp-${Date.now()}-${c.id}`,
        name: c.name,
        category: c.category,
        notes: c.notes,
        isCustom: true
      }));

    onConfirmImport(toImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 flex items-center justify-center text-[#00E676] shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Selektywny Import GymTracker</h3>
            <span className="text-[10px] text-[#00E676] font-mono">Weryfikacja kategorii i duplikatów</span>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Wybierz pozycje do zaimportowania do lokalnej bazy Room. Duplikaty są domyślnie zabezpieczone przed niechcianym nadpisaniem.
        </p>

        {/* Candidate List */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {importCandidates.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            const isDup = item.status === 'DUPLICATE';

            return (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#212735] border-[#00E676]/60 text-white'
                    : 'bg-[#12151C] border-[#2C3548] text-[#64748B]'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white leading-tight">{item.name}</span>
                    {isDup ? (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-bold">
                        Duplikat
                      </span>
                    ) : (
                      <span className="text-[9px] bg-[#00E676]/20 text-[#00E676] px-1.5 py-0.2 rounded font-bold">
                        Nowe
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#94A3B8] block">{item.category} • {item.notes}</span>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-[#00E676] border-[#00E676] text-black'
                      : 'border-[#38435C] bg-[#171B24]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-[#2C3548] hover:bg-[#212735] text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold transition-colors shadow-lg shadow-[#00E676]/20"
          >
            Importuj wybrane
          </button>
        </div>
      </div>
    </div>
  );
};
