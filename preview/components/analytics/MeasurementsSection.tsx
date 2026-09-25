import React, { useState, useMemo } from 'react';
import {
  Ruler,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  FileText,
  X,
  Check
} from 'lucide-react';
import {
  BodyMeasurementEntry,
  MeasurementType,
  MEASUREMENT_CONFIGS
} from '../../data/sampleData';
import { ConfirmDeleteDialog } from '../shared/ConfirmDeleteDialog';
import { formatToIso, getTodayDate } from '../../utils/dateHelper';

interface MeasurementsSectionProps {
  measurements: BodyMeasurementEntry[];
  onAddMeasurement: (entry: Omit<BodyMeasurementEntry, 'id' | 'timestamp'>) => void;
  onEditMeasurement: (id: string, entry: Omit<BodyMeasurementEntry, 'id' | 'timestamp'>) => void;
  onDeleteMeasurement: (id: string) => void;
}

export const MeasurementsSection: React.FC<MeasurementsSectionProps> = ({
  measurements,
  onAddMeasurement,
  onEditMeasurement,
  onDeleteMeasurement
}) => {
  const [selectedType, setSelectedType] = useState<MeasurementType>('WEIGHT');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BodyMeasurementEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formType, setFormType] = useState<MeasurementType>('WEIGHT');
  const [formValue, setFormValue] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(formatToIso(getTodayDate()));
  const [formTime, setFormTime] = useState<string>('08:00');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Filtered & Sorted list for selected type
  const typeEntries = useMemo(() => {
    return measurements
      .filter((m) => m.type === selectedType)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [measurements, selectedType]);

  const chronologicalEntries = useMemo(() => {
    return [...typeEntries].sort((a, b) => a.timestamp - b.timestamp);
  }, [typeEntries]);

  // Statistics calculation for selected type
  const stats = useMemo(() => {
    if (chronologicalEntries.length === 0) return null;
    const values = chronologicalEntries.map((e) => e.value);
    const latest = values[values.length - 1];
    const earliest = values[0];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const diff = values.length > 1 ? latest - values[values.length - 2] : 0;
    const totalDiff = latest - earliest;
    return {
      latest,
      min,
      max,
      avg: Number(avg.toFixed(1)),
      diff: Number(diff.toFixed(1)),
      totalDiff: Number(totalDiff.toFixed(1)),
      count: values.length
    };
  }, [chronologicalEntries]);

  const currentConfig = MEASUREMENT_CONFIGS[selectedType];

  const handleOpenAdd = (type?: MeasurementType) => {
    const t = type || selectedType;
    setFormType(t);
    setFormValue('');
    const now = new Date();
    setFormDate(formatToIso(now));
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setFormTime(`${hours}:${mins}`);
    setFormNotes('');
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (entry: BodyMeasurementEntry) => {
    setEditingEntry(entry);
    setFormType(entry.type);
    setFormValue(String(entry.value));
    setFormDate(entry.dateIso);
    setFormTime(entry.time);
    setFormNotes(entry.notes || '');
    setFormError('');
  };

  const handleSaveForm = (isEdit: boolean) => {
    const cleanStr = formValue.replace(',', '.').trim();
    const num = parseFloat(cleanStr);
    if (isNaN(num) || num <= 0) {
      setFormError('Wprowadź prawidłową dodatnią wartość liczbową.');
      return;
    }
    if (!formDate) {
      setFormError('Wybierz datę pomiaru.');
      return;
    }

    const config = MEASUREMENT_CONFIGS[formType];
    const data = {
      type: formType,
      value: Number(num.toFixed(1)),
      unit: config.unit,
      dateIso: formDate,
      time: formTime || '08:00',
      notes: formNotes.trim() ? formNotes.trim() : undefined
    };

    if (isEdit && editingEntry) {
      onEditMeasurement(editingEntry.id, data);
      setEditingEntry(null);
    } else {
      onAddMeasurement(data);
      setShowAddModal(false);
    }
  };

  // Simple clean SVG line chart calculation
  const renderChart = () => {
    if (chronologicalEntries.length < 2) {
      return (
        <div className="h-32 bg-[#0F1218] rounded-xl border border-[#2C3548] flex flex-col items-center justify-center p-4 text-center">
          <Ruler className="w-5 h-5 text-[#64748B] mb-1.5" />
          <span className="text-xs text-[#94A3B8] font-medium">
            {chronologicalEntries.length === 1
              ? 'Wymagane co najmniej 2 pomiary do wykreślenia trendu'
              : 'Brak zapisanych pomiarów dla tej partii'}
          </span>
        </div>
      );
    }

    const width = 340;
    const height = 120;
    const padding = 20;

    const values = chronologicalEntries.map((e) => e.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valRange = maxVal === minVal ? 1 : maxVal - minVal;

    const points = chronologicalEntries.map((e, idx) => {
      const x = padding + (idx / (chronologicalEntries.length - 1)) * (width - padding * 2);
      const y = height - padding - ((e.value - minVal) / valRange) * (height - padding * 2);
      return { x, y, value: e.value, date: e.dateIso };
    });

    const pathData = points.reduce((acc, pt, idx) => {
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
    }, '');

    const areaData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] space-y-2">
        <div className="flex items-center justify-between text-[11px] px-1 font-mono">
          <span className="text-[#64748B]">Min: <strong className="text-white">{minVal} {currentConfig.unit}</strong></span>
          <span className="text-[#64748B]">Śr: <strong className="text-white">{stats?.avg} {currentConfig.unit}</strong></span>
          <span className="text-[#64748B]">Max: <strong className="text-white">{maxVal} {currentConfig.unit}</strong></span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
          <defs>
            <linearGradient id="measureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E676" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00E676" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#222B3D" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#222B3D" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#222B3D" strokeDasharray="3 3" />

          {/* Area under curve */}
          <path d={areaData} fill="url(#measureGradient)" />

          {/* Line */}
          <path d={pathData} fill="none" stroke="#00E676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Point dots */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#07090D"
              stroke="#00E676"
              strokeWidth="2"
            />
          ))}
        </svg>

        <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono px-1">
          <span>{chronologicalEntries[0].dateIso}</span>
          <span>{chronologicalEntries[chronologicalEntries.length - 1].dateIso}</span>
        </div>
      </div>
    );
  };

  const deletingItem = measurements.find((m) => m.id === deletingId);

  return (
    <div className="space-y-4">
      {/* Header & Main Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Ruler className="w-4 h-4 text-[#00E676]" />
            <span>Masa ciała i Obwody</span>
          </h2>
          <span className="text-[10px] text-[#94A3B8]">
            Rzetelne pomiary fizyczne bez automatycznych diagnoz
          </span>
        </div>
        <button
          onClick={() => handleOpenAdd()}
          className="bg-[#00E676] hover:bg-[#00c864] text-black font-extrabold text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Dodaj pomiar</span>
        </button>
      </div>

      {/* Horizontal Type Selector Grid */}
      <div className="bg-[#171B24] border border-[#2C3548] p-2 rounded-2xl shadow-md">
        <div className="grid grid-cols-5 gap-1">
          {(Object.keys(MEASUREMENT_CONFIGS) as MeasurementType[]).map((type) => {
            const conf = MEASUREMENT_CONFIGS[type];
            const isSel = selectedType === type;
            const count = measurements.filter((m) => m.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                  isSel
                    ? 'bg-[#00E676] text-black font-black shadow-md'
                    : 'bg-[#0F1218] text-[#94A3B8] hover:text-white border border-[#2C3548]'
                }`}
              >
                <span className="text-[10px] truncate w-full font-bold block">{conf.label}</span>
                <span className="text-[9px] font-mono opacity-80">{count > 0 ? `${count} wpisów` : conf.unit}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Summary Card for Selected Type */}
      <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#00E676] font-mono font-bold uppercase block">
              Bieżący wymiar
            </span>
            <h3 className="text-base font-black text-white">{currentConfig.label}</h3>
          </div>

          {stats ? (
            <div className="text-right">
              <span className="text-lg font-black text-white font-mono">
                {stats.latest} <span className="text-xs text-[#00E676] font-normal">{currentConfig.unit}</span>
              </span>
              <div className="flex items-center justify-end gap-1 text-[11px] font-mono font-bold">
                {stats.diff > 0 ? (
                  <span className="text-amber-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +{stats.diff} {currentConfig.unit}
                  </span>
                ) : stats.diff < 0 ? (
                  <span className="text-[#00E676] flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" /> {stats.diff} {currentConfig.unit}
                  </span>
                ) : (
                  <span className="text-[#64748B] flex items-center">
                    <Minus className="w-3 h-3 mr-0.5" /> 0.0 {currentConfig.unit}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-xs text-[#64748B] italic">Brak danych</span>
          )}
        </div>

        {/* Dynamic Chart */}
        {renderChart()}
      </div>

      {/* Chronological History List */}
      <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-2 shadow-md">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Historia Wpisów ({typeEntries.length})
          </h4>
          <span className="text-[10px] text-[#64748B]">Brak nadpisywania z tego samego dnia</span>
        </div>

        {typeEntries.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#64748B]">
            Brak wpisów dla kategorii {currentConfig.label}. Kliknij „Dodaj pomiar” powyżej.
          </div>
        ) : (
          <div className="space-y-1.5">
            {typeEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-white text-sm">
                      {entry.value} {entry.unit}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {entry.dateIso}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {entry.time}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-[11px] text-[#94A3B8] italic flex items-center gap-1 pt-0.5">
                      <FileText className="w-3 h-3 text-[#00E676]/70 flex-shrink-0" />
                      <span>{entry.notes}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(entry)}
                    className="p-1.5 rounded-lg bg-[#212735] hover:bg-[#2C3548] text-[#94A3B8] hover:text-white transition-colors"
                    title="Edytuj pomiar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(entry.id)}
                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition-colors"
                    title="Usuń pomiar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Dodawanie / Edycja Pomiaru */}
      {(showAddModal || editingEntry) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00E676]/20 flex items-center justify-center text-[#00E676]">
                  <Ruler className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  {editingEntry ? 'Edycja Pomiaru' : 'Nowy Pomiar'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEntry(null);
                }}
                className="p-1 rounded-full text-[#94A3B8] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                {formError}
              </div>
            )}

            <div className="space-y-3">
              {/* Type selection */}
              <div>
                <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">
                  Rodzaj pomiaru
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as MeasurementType)}
                  className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00E676]"
                >
                  {(Object.keys(MEASUREMENT_CONFIGS) as MeasurementType[]).map((t) => (
                    <option key={t} value={t}>
                      {MEASUREMENT_CONFIGS[t].label} ({MEASUREMENT_CONFIGS[t].unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Value Input */}
              <div>
                <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">
                  Wartość ({MEASUREMENT_CONFIGS[formType].unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={`np. ${formType === 'WEIGHT' ? '75.5' : '95.0'}`}
                  value={formValue}
                  onChange={(e) => {
                    setFormValue(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2.5 text-base font-mono font-bold text-white outline-none focus:border-[#00E676]"
                />
              </div>

              {/* Date & Time (Avoid silent overwrite) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2 text-xs text-white outline-none focus:border-[#00E676]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">
                    Godzina
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2 text-xs text-white outline-none focus:border-[#00E676]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">
                  Opcjonalna notatka (np. naczczo, po treningu)
                </label>
                <input
                  type="text"
                  placeholder="np. Rano na czczo..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEntry(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl border border-[#2C3548] text-xs font-semibold text-[#94A3B8]"
              >
                Anuluj
              </button>
              <button
                onClick={() => handleSaveForm(Boolean(editingEntry))}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{editingEntry ? 'Zapisz zmiany' : 'Dodaj wpis'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deletingId)}
        title="Usuwanie Pomiaru"
        message="Czy na pewno chcesz usunąć ten wpis pomiarowy? Operacja jest nieodwracalna."
        itemDescription={
          deletingItem
            ? `${MEASUREMENT_CONFIGS[deletingItem.type].label}: ${deletingItem.value} ${deletingItem.unit} (${deletingItem.dateIso} ${deletingItem.time})`
            : undefined
        }
        onConfirm={() => {
          if (deletingId) {
            onDeleteMeasurement(deletingId);
            setDeletingId(null);
          }
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
