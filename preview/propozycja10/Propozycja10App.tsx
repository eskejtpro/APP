import React, { useState } from 'react';
import {
  Play,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FolderOpen,
  Plus,
  ChevronRight,
  Dumbbell,
  HardDrive
} from 'lucide-react';
import { M3TopAppBar } from '../components/shared/M3TopAppBar';
import { M3BottomNavBar, M3TabKey } from '../components/shared/M3BottomNavBar';
import { WarningDialog } from '../components/shared/WarningDialog';
import { AnalyticsSheet } from '../components/shared/AnalyticsSheet';
import { GymTrackerImportDialog } from '../components/shared/GymTrackerImportDialog';
import { BackupSettingsDialog } from '../components/shared/BackupSettingsDialog';
import { getTodayFormattedPolish } from '../utils/dateHelper';
import { APPROVED_EXERCISE_CATEGORIES, DayPlanType, CompletionStatus } from '../data/sampleData';

export const Propozycja10App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<M3TabKey>('today');

  // State: Honest empty state
  const [todayType, setTodayType] = useState<DayPlanType>('NO_PLAN');
  const [todayStatus, setTodayStatus] = useState<CompletionStatus>('NIEROZSTRZYGNIETY');

  // Dialogs
  const [showWarningNoSession, setShowWarningNoSession] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090D] text-[#F8FAFC] flex justify-center selection:bg-[#00E676] selection:text-black">
      <div className="w-full max-w-md min-h-screen bg-[#0A0D14] flex flex-col relative shadow-2xl border-x border-[#1E2638]">
        {/* Top App Bar */}
        <M3TopAppBar
          proposalLabel="Propozycja 10: Katalog kinowy"
          onOpenLibrary={() => setShowImport(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto space-y-6 pb-28">
          {/* 1. CINEMATIC HERO BANNER (Nano Banana art direction in pure CSS/SVG:
              Volumetric rim lighting, deep obsidian atmospheric haze, no text in image, no fake workouts) */}
          <div className="relative w-full h-64 overflow-hidden bg-gradient-to-b from-[#141A26] to-[#0A0D14] border-b border-[#1E2638]">
            {/* SVG Atmospheric Grid & Volumetric Lighting */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Emerald Ambient Glow */}
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#00E676]/20 rounded-full blur-[90px]" />
              <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />

              {/* Minimal Architectural Grid lines */}
              <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E676" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#1E2638" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <path d="M0 40 H400 M0 100 H400 M0 160 H400 M0 220 H400" stroke="url(#gridGrad)" strokeWidth="0.5" />
                <path d="M60 0 V260 M140 0 V260 M220 0 V260 M300 0 V260 M380 0 V260" stroke="url(#gridGrad)" strokeWidth="0.5" />
                {/* Abstract geometric gym plates silhouette in background */}
                <circle cx="320" cy="90" r="45" stroke="#00E676" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" fill="none" />
                <circle cx="320" cy="90" r="28" stroke="#00E676" strokeWidth="0.75" opacity="0.4" fill="none" />
              </svg>

              {/* Dark Vignette Bottom Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/60 to-transparent" />
            </div>

            {/* Hero Interactive Floating Info */}
            <div className="absolute bottom-4 left-4 right-4 space-y-2 z-10">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#00E676] text-black font-mono">
                  GŁÓWNY PANEL KATALOGU
                </span>
                <span className="text-[10px] text-[#94A3B8] font-mono">
                  {getTodayFormattedPolish()}
                </span>
              </div>

              <div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  Centrum Treningowe PlanPasika
                </h1>
                <p className="text-xs text-[#94A3B8] max-w-xs mt-0.5">
                  Wszystkie moduły w formie przejrzystego katalogu półek z zachowaniem pełnej prywatności offline.
                </p>
              </div>

              {/* Quick Action Button */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => (window.location.href = '/propozycja-3-trening.html')}
                  className="bg-[#00E676] hover:bg-[#00c864] text-black font-black text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#00E676]/25 transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Rozpocznij sesję</span>
                </button>
                <button
                  onClick={() => (window.location.href = '/propozycja-2-harmonogram.html')}
                  className="bg-[#171B24]/90 hover:bg-[#212735] text-white border border-[#2C3548] font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Harmonogram</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. SHELF 1: DZISIEJSZY HARMONOGRAM & STATUS DNIA */}
          <section className="px-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00E676]" />
                <span>Dzisiejszy Dzień w Harmonogramie</span>
              </h2>
              <span className="text-[10px] text-[#64748B]">Max 1 trening/dzień</span>
            </div>

            <div className="bg-[#141A26] border border-[#222B3D] rounded-2xl p-4 space-y-3 shadow-lg">
              {/* Day Type Selector */}
              <div>
                <span className="text-[10px] font-bold text-[#94A3B8] block mb-1">Typ zaplanowanego dnia:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['ASSIGNED_WORKOUT', 'REST_DAY', 'NO_PLAN'] as DayPlanType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTodayType(t)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                        todayType === t
                          ? 'bg-[#00E676] text-black shadow-md'
                          : 'bg-[#1D2536] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {t === 'ASSIGNED_WORKOUT' ? 'Trening' : t === 'REST_DAY' ? 'Dzień wolny' : 'Brak planu'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Ręczny status rozliczenia:</span>
                  <span className="text-[10px] font-mono text-[#00E676] font-bold">{todayStatus}</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setTodayStatus('WYKONANY')}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                      todayStatus === 'WYKONANY'
                        ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                        : 'bg-[#0E121B] border-[#222B3D] text-[#94A3B8]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Wykonany</span>
                  </button>
                  <button
                    onClick={() => setTodayStatus('NIEWYKONANY')}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                      todayStatus === 'NIEWYKONANY'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-[#0E121B] border-[#222B3D] text-[#94A3B8]'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Niewykonany</span>
                  </button>
                  <button
                    onClick={() => setTodayStatus('NIEROZSTRZYGNIETY')}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                      todayStatus === 'NIEROZSTRZYGNIETY'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#0E121B] border-[#222B3D] text-[#94A3B8]'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Nierozstrzyg.</span>
                  </button>
                </div>
              </div>

              {/* Warning Action */}
              <button
                onClick={() => setShowWarningNoSession(true)}
                className="w-full text-center text-[10px] text-amber-400 hover:underline pt-0.5 block"
              >
                ⚠️ Oznacz jako wykonany bez sesji (z ostrzeżeniem)...
              </button>
            </div>
          </section>

          {/* 3. SHELF 2: DOSTĘPNE SZABLONY TRENINGOWE (Cinematic Horizontal Shelf) */}
          <section className="space-y-2.5">
            <div className="px-4 flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Szablony Treningowe
              </h2>
              <button
                onClick={() => (window.location.href = '/propozycja-4-planowanie.html')}
                className="text-[11px] text-[#00E676] hover:underline font-bold flex items-center gap-0.5"
              >
                <span>Wszystkie</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal Shelf with Honest Empty Card */}
            <div className="flex gap-3 px-4 overflow-x-auto pb-2 no-scrollbar">
              <div className="w-64 shrink-0 bg-[#141A26] border border-[#222B3D] rounded-2xl p-4 space-y-2 shadow-md flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-[#1D2536] flex items-center justify-center text-[#00E676]">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Brak szablonów w bazie</h3>
                  <p className="text-[10px] text-[#94A3B8]">
                    Utwórz własny plan lub zaimportuj dane z pliku GymTracker.
                  </p>
                </div>
                <button
                  onClick={() => (window.location.href = '/propozycja-4-planowanie.html')}
                  className="w-full py-2 rounded-xl bg-[#1D2536] hover:bg-[#263147] text-white text-[11px] font-bold border border-[#222B3D] transition-colors"
                >
                  Dodaj pierwszy plan
                </button>
              </div>

              <div className="w-64 shrink-0 bg-[#141A26] border border-[#222B3D] rounded-2xl p-4 space-y-2 shadow-md flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-[#1D2536] flex items-center justify-center text-[#00E676]">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Import GymTracker</h3>
                  <p className="text-[10px] text-[#94A3B8]">
                    Selektywnie wczytaj zdefiniowane ćwiczenia do lokalnej bazy.
                  </p>
                </div>
                <button
                  onClick={() => setShowImport(true)}
                  className="w-full py-2 rounded-xl bg-[#00E676]/15 hover:bg-[#00E676]/25 text-[#00E676] text-[11px] font-bold border border-[#00E676]/30 transition-colors"
                >
                  Wybierz plik importu
                </button>
              </div>
            </div>
          </section>

          {/* 4. SHELF 3: 7 ZATWIERDZONYCH PARTII ANATOMICZNYCH (Card Grid) */}
          <section className="px-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Partie Anatomiczne (7 Zatwierdzonych)
              </h2>
              <span className="text-[10px] text-[#64748B] font-mono">Model domenowy</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {APPROVED_EXERCISE_CATEGORIES.map((category) => (
                <div
                  key={category}
                  onClick={() => (window.location.href = '/propozycja-6-biblioteka.html')}
                  className="bg-[#141A26] border border-[#222B3D] hover:border-[#00E676]/40 p-3 rounded-2xl space-y-1 cursor-pointer transition-all shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#00E676] transition-colors">
                      {category}
                    </span>
                    <Dumbbell className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#00E676] transition-colors" />
                  </div>
                  <span className="text-[10px] text-[#64748B] block">
                    Kategoria domenowa
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 5. SHELF 4: BEZPIECZEŃSTWO I PAMIĘĆ LOKALNA */}
          <section className="px-4">
            <div className="bg-[#141A26] border border-[#222B3D] rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1D2536] flex items-center justify-center text-[#00E676]">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Lokalne Kopie i Eksport</h3>
                  <span className="text-[10px] text-[#94A3B8]">100% prywatności offline na telefonie</span>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(true)}
                className="text-xs font-bold text-[#00E676] hover:underline"
              >
                Ustawienia
              </button>
            </div>
          </section>
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
