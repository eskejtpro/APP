import React, { useState } from 'react';
import { Settings, Download, Upload, Shield, X, Bell, Layout, Palette } from 'lucide-react';
import { StorageService } from '../../utils/storage';

interface BackupSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImport: () => void;
}

export const THEME_PRESETS = [
  { id: 'emerald', name: 'Obsidian Emerald', hex: '#00E676', bg: '#0A0D14' },
  { id: 'cyan', name: 'Cyber Cyan', hex: '#00F5D4', bg: '#070C14' },
  { id: 'lime', name: 'Tactical Lime', hex: '#D4FF00', bg: '#0D1117' },
  { id: 'gold', name: 'Monolith Gold', hex: '#F59E0B', bg: '#0B0B0E' },
  { id: 'titanium', name: 'Pure Titanium', hex: '#E2E8F0', bg: '#09090B' }
];

export const BackupSettingsDialog: React.FC<BackupSettingsDialogProps> = ({
  isOpen,
  onClose,
  onOpenImport
}) => {
  const [startScreen, setStartScreen] = useState('TODAY');
  const [reminderDays] = useState(3);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('planpasika_theme') || 'emerald';
  });

  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('planpasika_theme', themeId);
  };

  if (!isOpen) return null;

  const handleExportJson = () => {
    const backupData = {
      app: 'PlanPasika.v1',
      version: '1.0',
      exportDate: new Date().toISOString(),
      note: 'Lokalna kopia bazy Room i magazynu danych',
      measurements: StorageService.loadMeasurements(),
      workoutSessions: StorageService.loadSessions(),
      protocolEntries: StorageService.loadProtocols(),
      exercises: StorageService.loadExercises(),
      templates: StorageService.loadTemplates(),
      dayNotes: StorageService.loadDayNotes(),
      dayTypes: StorageService.loadDayTypes(),
      dayStatuses: StorageService.loadDayStatuses()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PlanPasika_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00E676]/20 flex items-center justify-center text-[#00E676]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Kopie i Ustawienia</h3>
              <span className="text-[10px] text-[#00E676] font-mono">PlanPasika.v1</span>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-[#94A3B8] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Motyw & Akcent Kolorystyczny */}
        <div className="bg-[#212735] p-3 rounded-xl border border-[#2C3548] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Palette className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Akcent kolorystyczny motywu:</span>
            </div>
            <span className="text-[10px] font-mono text-[#00E676] uppercase font-bold">
              {THEME_PRESETS.find((t) => t.id === selectedTheme)?.name || 'Emerald'}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {THEME_PRESETS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all border ${
                  selectedTheme === t.id
                    ? 'border-white bg-[#171B24] ring-1 ring-white'
                    : 'border-[#2C3548] bg-[#171B24] hover:border-[#4B5563]'
                }`}
                title={t.name}
              >
                <span
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: t.hex }}
                />
                <span className="text-[8px] font-mono text-[#94A3B8] truncate max-w-[48px]">
                  {t.id}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Start Screen Selection */}
        <div className="bg-[#212735] p-3 rounded-xl border border-[#2C3548] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Layout className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Domyślny ekran startowy aplikacji:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { id: 'TODAY', label: 'Dzisiaj' },
              { id: 'PLANS', label: 'Harmonogram' },
              { id: 'WORKOUT', label: 'Trening' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStartScreen(opt.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  startScreen === opt.id
                    ? 'bg-[#00E676] text-black shadow'
                    : 'bg-[#171B24] text-[#94A3B8] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Interrupted Session Reminders */}
        <div className="bg-[#212735] p-3 rounded-xl border border-[#2C3548] space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Przypomnienie o przerwanej sesji:</span>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold">{reminderDays} dni</span>
          </div>
          <p className="text-[10px] text-[#94A3B8]">
            Zgodnie z regułą, aplikacja przypomina o niedokończonym szkicu sesji po upływie zdefiniowanych dni.
          </p>
        </div>

        {/* 3. Local Backups & Export */}
        <div className="bg-[#212735] p-3 rounded-xl border border-[#2C3548] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Shield className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Lokalne kopie zapasowe (Offline JSON):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportJson}
              className="py-2 px-2.5 rounded-lg bg-[#171B24] hover:bg-[#2C3548] border border-[#2C3548] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Eksportuj kopię</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenImport();
              }}
              className="py-2 px-2.5 rounded-lg bg-[#171B24] hover:bg-[#2C3548] border border-[#2C3548] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Importuj dane</span>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold transition-colors shadow-lg shadow-[#00E676]/20"
        >
          Gotowe
        </button>
      </div>
    </div>
  );
};
