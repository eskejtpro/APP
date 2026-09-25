import React, { useState } from 'react';
import {
  Calendar,
  Dumbbell,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3,
  Pill,
  HardDrive,
  ChevronRight
} from 'lucide-react';
import { M3TopAppBar } from '../components/shared/M3TopAppBar';
import { M3BottomNavBar, M3TabKey } from '../components/shared/M3BottomNavBar';
import { WarningDialog } from '../components/shared/WarningDialog';
import { AnalyticsSheet } from '../components/shared/AnalyticsSheet';
import { GymTrackerImportDialog } from '../components/shared/GymTrackerImportDialog';
import { BackupSettingsDialog } from '../components/shared/BackupSettingsDialog';
import { getTodayFormattedPolish } from '../utils/dateHelper';
import { DayPlanType, CompletionStatus } from '../data/sampleData';

export const Propozycja8App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<M3TabKey>('today');

  // State: Honest empty initial state
  const [todayType, setTodayType] = useState<DayPlanType>('NO_PLAN');
  const [todayStatus, setTodayStatus] = useState<CompletionStatus>('NIEROZSTRZYGNIETY');

  // Dialogs
  const [showWarningNoSession, setShowWarningNoSession] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F8FAFC] flex justify-center selection:bg-[#00E676] selection:text-black">
      <div className="w-full max-w-md min-h-screen bg-[#0F1218] flex flex-col relative shadow-2xl border-x border-[#212735]">
        {/* Top App Bar */}
        <M3TopAppBar
          proposalLabel="Propozycja 8: Modułowy Bento"
          onOpenLibrary={() => setShowImport(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4 pb-24">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
              MODUŁOWY PULPIT BENTO • XIAOMI 14T
            </span>
            <h1 className="text-xl font-black text-white capitalize">
              {getTodayFormattedPolish()}
            </h1>
          </div>

          {/* BENTO GRID CONTAINER */}
          <div className="grid grid-cols-2 gap-3">
            {/* Tile 1: Hero Dzisiaj (Col-span 2) */}
            <div className="col-span-2 bg-[#171B24] border border-[#2C3548] rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#00E676] bg-[#00E676]/15 px-2.5 py-0.5 rounded-full border border-[#00E676]/30 uppercase font-mono">
                  DZISIEJSZY STATUS
                </span>
                <span className="text-[10px] font-mono text-[#64748B]">Brak aktywnej sesji</span>
              </div>

              {/* Day Type Selector */}
              <div>
                <span className="text-[10px] font-bold text-[#94A3B8] block mb-1">Typ dnia:</span>
                <div className="grid grid-cols-3 gap-1 bg-[#0F1218] p-1 rounded-xl border border-[#2C3548]">
                  {(['ASSIGNED_WORKOUT', 'REST_DAY', 'NO_PLAN'] as DayPlanType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTodayType(t)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all text-center ${
                        todayType === t
                          ? 'bg-[#212735] text-[#00E676] border border-[#00E676]/40 shadow-sm'
                          : 'text-[#64748B] hover:text-white'
                      }`}
                    >
                      {t === 'ASSIGNED_WORKOUT' ? 'Trening' : t === 'REST_DAY' ? 'Wolne' : 'Brak planu'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Status Buttons (No auto change) */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Status rozliczenia (ręczny):</span>
                  <span className="text-[10px] text-[#00E676] font-bold">{todayStatus}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setTodayStatus('WYKONANY')}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                      todayStatus === 'WYKONANY'
                        ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                        : 'bg-[#0F1218] border-[#2C3548] text-[#94A3B8]'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Wykonany</span>
                  </button>
                  <button
                    onClick={() => setTodayStatus('NIEWYKONANY')}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                      todayStatus === 'NIEWYKONANY'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-[#0F1218] border-[#2C3548] text-[#94A3B8]'
                    }`}
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Niewykonany</span>
                  </button>
                  <button
                    onClick={() => setTodayStatus('NIEROZSTRZYGNIETY')}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                      todayStatus === 'NIEROZSTRZYGNIETY'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#0F1218] border-[#2C3548] text-[#94A3B8]'
                    }`}
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Nierozstrzyg.</span>
                  </button>
                </div>
              </div>

              {/* Warning option */}
              <button
                onClick={() => setShowWarningNoSession(true)}
                className="w-full text-center text-[10px] text-amber-400 hover:underline pt-0.5 block"
              >
                ⚠️ Oznacz jako wykonany bez sesji (z ostrzeżeniem)...
              </button>
            </div>

            {/* Tile 2: Harmonogram (Col-span 1) */}
            <div
              onClick={() => (window.location.href = '/propozycja-2-harmonogram.html')}
              className="bg-[#171B24] border border-[#2C3548] hover:border-[#00E676]/50 rounded-2xl p-3.5 space-y-2 cursor-pointer transition-all shadow-md flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-xl bg-[#00E676]/20 text-[#00E676] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Harmonogram</h3>
                <span className="text-[10px] text-[#94A3B8] block">Wspólny tydzień/miesiąc</span>
              </div>
              <span className="text-[10px] text-[#00E676] font-bold flex items-center gap-0.5">
                <span>Otwórz</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Tile 3: Trening Focus (Col-span 1) */}
            <div
              onClick={() => (window.location.href = '/propozycja-3-trening.html')}
              className="bg-[#171B24] border border-[#2C3548] hover:border-[#00E676]/50 rounded-2xl p-3.5 space-y-2 cursor-pointer transition-all shadow-md flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-xl bg-[#00E676]/20 text-[#00E676] flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Sala Treningowa</h3>
                <span className="text-[10px] text-[#94A3B8] block">Zapis serii i powtórzeń</span>
              </div>
              <span className="text-[10px] text-[#00E676] font-bold flex items-center gap-0.5">
                <span>Rejestruj</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Tile 4: Analizy Objętości (Col-span 1) */}
            <div
              onClick={() => (window.location.href = '/propozycja-7-analizy.html')}
              className="bg-[#171B24] border border-[#2C3548] hover:border-[#00E676]/50 rounded-2xl p-3.5 space-y-2 cursor-pointer transition-all shadow-md flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-xl bg-[#00E676]/20 text-[#00E676] flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Analizy</h3>
                <span className="text-[10px] text-[#94A3B8] block">7 zatwierdzonych partii</span>
              </div>
              <span className="text-[10px] text-[#64748B] font-mono">Brak danych o seriach</span>
            </div>

            {/* Tile 5: Dziennik & Substancje (Col-span 1) */}
            <div
              onClick={() => (window.location.href = '/propozycja-5-dziennik.html')}
              className="bg-[#171B24] border border-[#2C3548] hover:border-[#00E676]/50 rounded-2xl p-3.5 space-y-2 cursor-pointer transition-all shadow-md flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Dziennik</h3>
                <span className="text-[10px] text-[#94A3B8] block">Ręczne wpisy bez porad</span>
              </div>
              <span className="text-[10px] text-purple-400 font-bold flex items-center gap-0.5">
                <span>Wpisy</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Tile 6: Pamięć Lokalna & Baza (Col-span 2) */}
            <div className="col-span-2 bg-[#171B24] border border-[#2C3548] rounded-2xl p-3.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#212735] flex items-center justify-center text-[#00E676]">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Lokalna Baza Danych Room</h4>
                  <span className="text-[10px] text-[#94A3B8]">Offline-first, brak chmury i kont</span>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(true)}
                className="text-xs font-bold text-[#00E676] hover:underline"
              >
                Kopie / Import
              </button>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <M3BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'plans') window.location.href = '/propozycja-2-harmonogram.html';
            if (tab === 'workout') window.location.href = '/propozycja-3-trening.html';
            if (tab === 'calendar') window.location.href = '/propozycja-5-dziennik.html';
            if (tab === 'analytics') window.location.href = '/propozycja-7-analizy.html';
          }}
        />

        {/* Dialogs */}
        <WarningDialog
          isOpen={showWarningNoSession}
          title="Wykonanie bez rejestracji sesji"
          message="Potwierdzasz ręczne oznaczenie dnia jako Wykonany bez sesji. Pamiętaj: zgodnie z zasadami produktu Analizy zliczają wyłącznie faktycznie ukończone serie zarejestrowane w sesjach!"
          onConfirm={() => {
            setTodayStatus('WYKONANY');
            setShowWarningNoSession(false);
          }}
          onCancel={() => setShowWarningNoSession(false)}
        />

        <AnalyticsSheet isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />
        <GymTrackerImportDialog
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onConfirmImport={() => alert('Zaimportowano pozycje.')}
        />
        <BackupSettingsDialog
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onOpenImport={() => setShowImport(true)}
        />
      </div>
    </div>
  );
};
