import React, { useState, useEffect } from 'react';
import { Pill, X, Check } from 'lucide-react';
import { CalendarProtocolEntry } from '../../data/sampleData';
import { formatToIso, getTodayDate } from '../../utils/dateHelper';

interface CalendarProtocolModalProps {
  isOpen: boolean;
  initialEntry?: CalendarProtocolEntry | null;
  defaultDateIso?: string;
  onClose: () => void;
  onSave: (entry: Omit<CalendarProtocolEntry, 'id' | 'timestamp'>) => void;
}

export const CalendarProtocolModal: React.FC<CalendarProtocolModalProps> = ({
  isOpen,
  initialEntry,
  defaultDateIso,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [dosageOrInfo, setDosageOrInfo] = useState('');
  const [dateIso, setDateIso] = useState(defaultDateIso || formatToIso(getTodayDate()));
  const [time, setTime] = useState('08:00');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialEntry) {
      setTitle(initialEntry.title);
      setDosageOrInfo(initialEntry.dosageOrInfo || '');
      setDateIso(initialEntry.dateIso);
      setTime(initialEntry.time);
      setNotes(initialEntry.notes || '');
    } else {
      setTitle('');
      setDosageOrInfo('');
      setDateIso(defaultDateIso || formatToIso(getTodayDate()));
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${mins}`);
      setNotes('');
    }
    setError('');
  }, [initialEntry, defaultDateIso, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      setError('Wpisz nazwę wpisu / substancji.');
      return;
    }
    if (!dateIso) {
      setError('Wybierz datę wpisu.');
      return;
    }

    onSave({
      title: title.trim(),
      dosageOrInfo: dosageOrInfo.trim() || undefined,
      dateIso,
      time: time || '08:00',
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {initialEntry ? 'Edycja Wpisu Cyklu/Protokołu' : 'Nowy Wpis Cyklu/Protokołu'}
              </h3>
              <span className="text-[10px] text-[#64748B]">
                Ręczny wpis bez wpływu na statystyki treningu
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-[#94A3B8] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">
              Nazwa substancji / protokołu *
            </label>
            <input
              type="text"
              placeholder="np. Kreatyna, Omega-3, Wit. D3..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">
              Ilość / Dawka (opcjonalnie)
            </label>
            <input
              type="text"
              placeholder="np. 5g, 2 kapsułki..."
              value={dosageOrInfo}
              onChange={(e) => setDosageOrInfo(e.target.value)}
              className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-purple-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">
                Data
              </label>
              <input
                type="date"
                value={dateIso}
                onChange={(e) => setDateIso(e.target.value)}
                className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2 text-xs text-white outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">
                Godzina
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2 text-xs text-white outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">
              Notatka / Komentarz
            </label>
            <input
              type="text"
              placeholder="np. Rano do śniadania..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2 text-xs text-white placeholder-[#64748B] outline-none focus:border-purple-400"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-[#2C3548] text-xs font-semibold text-[#94A3B8]"
          >
            Anuluj
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{initialEntry ? 'Zapisz zmiany' : 'Dodaj wpis'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
