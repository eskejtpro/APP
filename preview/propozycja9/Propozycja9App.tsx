import React, { useState } from 'react';
import {
  Smartphone,
  Bell,
  HardDrive,
  Download,
  FolderOpen,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { M3TopAppBar } from '../components/shared/M3TopAppBar';
import { M3BottomNavBar, M3TabKey } from '../components/shared/M3BottomNavBar';
import { GymTrackerImportDialog } from '../components/shared/GymTrackerImportDialog';
import { AnalyticsSheet } from '../components/shared/AnalyticsSheet';

export const Propozycja9App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<M3TabKey>('plans');

  // Settings states
  const [startupScreen, setStartupScreen] = useState<'TODAY' | 'SCHEDULE' | 'WORKOUT' | 'JOURNAL'>('TODAY');
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('17:00');

  // Dialogs
  const [showImport, setShowImport] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F8FAFC] flex justify-center selection:bg-[#00E676] selection:text-black">
      <div className="w-full max-w-md min-h-screen bg-[#0F1218] flex flex-col relative shadow-2xl border-x border-[#212735]">
        {/* Top App Bar */}
        <M3TopAppBar
          proposalLabel="Propozycja 9: Ustawienia lokalne"
          onOpenLibrary={() => setShowImport(true)}
          onOpenSettings={() => {}}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4 pb-24">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
              PREFERENCJE I PRYWATNOŚĆ • XIAOMI 14T
            </span>
            <h1 className="text-xl font-black text-white">Ustawienia PlanPasika</h1>
            <p className="text-xs text-[#94A3B8]">
              Przejrzyste zarządzanie pamięcią lokalną, kopiami zapasowymi i importem.
            </p>
          </div>

          {/* Privacy Guarantee Card */}
          <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-2 shadow-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00E676]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Gwarancja Prywatności (Offline-First)
              </h2>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              PlanPasika nie posiada serwerów, chmury, logowania ani telemetrii. Wszystkie dane o treningach, seriach i substancjach znajdują się wyłącznie w pamięci Twojego urządzenia w bazie SQLite/Room.
            </p>
          </div>

          {/* 1. Startup Screen Setting */}
          <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#00E676]" />
              <h3 className="text-xs font-bold text-white">Domyślny Ekran Startowy</h3>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Wybierz, który widok ma się otwierać przy starcie aplikacji:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'TODAY' as const, label: 'Dzisiaj (Pulpit)' },
                { id: 'SCHEDULE' as const, label: 'Harmonogram' },
                { id: 'WORKOUT' as const, label: 'Sala Treningowa' },
                { id: 'JOURNAL' as const, label: 'Dziennik / Notatki' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStartupScreen(opt.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                    startupScreen === opt.id
                      ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676]'
                      : 'bg-[#0F1218] border-[#2C3548] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {startupScreen === opt.id && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Reminders Setting */}
          <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#00E676]" />
                <div>
                  <h3 className="text-xs font-bold text-white">Lokalne Przypomnienia</h3>
                  <span className="text-[10px] text-[#94A3B8]">Powiadomienia w systemie Android</span>
                </div>
              </div>

              <button
                onClick={() => setRemindersEnabled(!remindersEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  remindersEnabled ? 'bg-[#00E676]' : 'bg-[#212735]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                    remindersEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {remindersEnabled && (
              <div className="pt-2 border-t border-[#2C3548]/50 flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Godzina przypomnienia:</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-[#0F1218] border border-[#2C3548] rounded-xl px-2.5 py-1 text-xs text-white font-mono outline-none focus:border-[#00E676]"
                />
              </div>
            )}
          </div>

          {/* 3. Local Backup & Export (With unresolved details marked honestly) */}
          <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#00E676]" />
              <h3 className="text-xs font-bold text-white">Kopia Zapasowa i Eksport Danych</h3>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Twórz lokalny plik z kopią bazy danych aplikacji PlanPasika do pamięci telefonu.
            </p>

            {/* Unresolved notice according to prompt */}
            <div className="bg-[#0F1218] p-2.5 rounded-xl border border-amber-500/30 flex items-start gap-2 text-[10px] text-amber-300">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Stan specyfikacji:</strong> Szczegółowy model szyfrowania eksportu, mechanizm klucza oraz procedura odzyskiwania bazy są na tym etapie oznaczone jako <em>nierozstrzygnięte</em>.
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => alert('Wygenerowano plik lokalnej kopii zapasowej w pamięci urządzenia.')}
                className="flex-1 bg-[#212735] hover:bg-[#2C3548] text-white border border-[#2C3548] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Utwórz kopię lokalną</span>
              </button>
            </div>
          </div>

          {/* 4. Selective GymTracker Import (With unresolved details marked honestly) */}
          <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#00E676]" />
              <h3 className="text-xs font-bold text-white">Selektywny Import z GymTracker</h3>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Wczytywanie ćwiczeń z zewnętrznego pliku eksportu GymTracker z możliwością wyboru konkretnych pozycji.
            </p>

            {/* Unresolved notice according to prompt */}
            <div className="bg-[#0F1218] p-2.5 rounded-xl border border-amber-500/30 flex items-start gap-2 text-[10px] text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Stan specyfikacji:</strong> Reguły automatycznego rozstrzygania konfliktów identycznych nazw oraz identyfikacja ciągłości historii serii są na tym etapie <em>nierozstrzygnięte</em> (brak narzucania pozornej decyzji).
              </span>
            </div>

            <button
              onClick={() => setShowImport(true)}
              className="w-full bg-[#00E676]/15 hover:bg-[#00E676]/25 border border-[#00E676]/30 text-[#00E676] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Otwórz selektywny import GymTracker</span>
            </button>
          </div>
        </main>

        {/* Bottom Navigation */}
        <M3BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'today') window.location.href = '/propozycja-1-dzisiaj.html';
            if (tab === 'plans') window.location.href = '/propozycja-2-harmonogram.html';
            if (tab === 'workout') window.location.href = '/propozycja-3-trening.html';
            if (tab === 'analytics') setShowAnalytics(true);
          }}
        />

        <GymTrackerImportDialog
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onConfirmImport={() => alert('Zaimportowano pozycje.')}
        />
        <AnalyticsSheet isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />
      </div>
    </div>
  );
};
