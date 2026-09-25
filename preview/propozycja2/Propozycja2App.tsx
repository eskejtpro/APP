import React, { useState } from 'react';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Copy,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { M3TopAppBar } from '../components/shared/M3TopAppBar';
import { M3BottomNavBar, M3TabKey } from '../components/shared/M3BottomNavBar';
import { ConfirmCopyWeekDialog } from '../components/shared/ConfirmCopyWeekDialog';
import { WarningDialog } from '../components/shared/WarningDialog';
import { AnalyticsSheet } from '../components/shared/AnalyticsSheet';
import { GymTrackerImportDialog } from '../components/shared/GymTrackerImportDialog';
import { BackupSettingsDialog } from '../components/shared/BackupSettingsDialog';
import {
  getCurrentWeekDays,
  DynamicDayInfo
} from '../utils/dateHelper';
import { DayPlanType, CompletionStatus } from '../data/sampleData';

interface EditableDayPlan {
  dayInfo: DynamicDayInfo;
  dayType: DayPlanType;
  workoutName: string | null;
  status: CompletionStatus;
}

export const Propozycja2App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<M3TabKey>('plans');
  const [viewMode, setViewMode] = useState<'WEEK' | 'MONTH'>('WEEK');

  const baseWeek = getCurrentWeekDays();
  // Honest Empty State: All days start with NO_PLAN, no fake workout names, status NIEROZSTRZYGNIETY
  const [scheduleDays, setScheduleDays] = useState<EditableDayPlan[]>(
    baseWeek.map((day) => ({
      dayInfo: day,
      dayType: 'NO_PLAN',
      workoutName: null,
      status: 'NIEROZSTRZYGNIETY'
    }))
  );

  const [selectedMonthDay, setSelectedMonthDay] = useState<number>(
    baseWeek.find((d) => d.isToday)?.dayOfMonth || new Date().getDate()
  );

  // Dialogs
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showWarningNoSession, setShowWarningNoSession] = useState(false);
  const [targetDayIndexForWarning, setTargetDayIndexForWarning] = useState<number | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleUpdateStatus = (index: number, newStatus: CompletionStatus) => {
    setScheduleDays((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, status: newStatus } : item))
    );
  };

  const handleUpdateDayType = (index: number, newType: DayPlanType) => {
    setScheduleDays((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              dayType: newType,
              workoutName: null
            }
          : item
      )
    );
  };

  const handleConfirmCopy = (offsetWeeks: number) => {
    alert(`Pomyślnie skopiowano harmonogram do przyszłego tygodnia (+${offsetWeeks} tyg.). Istniejące wpisy zostały zaktualizowane, a statusy ustawione na Nierozstrzygnięty.`);
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F8FAFC] flex justify-center selection:bg-[#00E676] selection:text-black">
      <div className="w-full max-w-md min-h-screen bg-[#0F1218] flex flex-col relative shadow-2xl border-x border-[#212735]">
        {/* Top App Bar */}
        <M3TopAppBar
          proposalLabel="Propozycja 2: Harmonogram"
          onOpenLibrary={() => setShowImport(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4 pb-24">
          {/* Header Orientation */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
                GŁÓWNY PUNKT ORIENTACYJNY • XIAOMI 14T
              </span>
              <h1 className="text-xl font-black text-white">Harmonogram PlanPasika</h1>
            </div>

            <button
              onClick={() => setShowCopyDialog(true)}
              className="bg-[#00E676]/15 hover:bg-[#00E676]/25 text-[#00E676] border border-[#00E676]/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Kopiuj tydzień</span>
            </button>
          </div>

          {/* View Mode Toggle: [Tydzień] | [Miesiąc] */}
          <div className="bg-[#171B24] border border-[#2C3548] p-1.5 rounded-2xl flex">
            <button
              onClick={() => setViewMode('WEEK')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                viewMode === 'WEEK'
                  ? 'bg-[#00E676] text-black shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Widok Tygodniowy (Pionowy)</span>
            </button>
            <button
              onClick={() => setViewMode('MONTH')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                viewMode === 'MONTH'
                  ? 'bg-[#00E676] text-black shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Widok Miesięczny</span>
            </button>
          </div>

          {/* Single Schedule Source of Truth Banner */}
          <div className="bg-[#171B24] p-2.5 rounded-xl border border-[#2C3548] flex items-center gap-2 text-[11px] text-[#94A3B8]">
            <AlertCircle className="w-4 h-4 text-[#00E676] shrink-0" />
            <span>Zasada: Wspólny harmonogram tygodnia i miesiąca (najwyżej 1 trening na dzień). Status jest wyłącznie ręczny.</span>
          </div>

          {/* ---------------- WIDOK TYGODNIOWY ---------------- */}
          {viewMode === 'WEEK' && (
            <div className="space-y-3">
              {scheduleDays.map((item, idx) => {
                const isToday = item.dayInfo.isToday;
                return (
                  <div
                    key={item.dayInfo.dateIso}
                    className={`bg-[#171B24] rounded-2xl p-4 border transition-all space-y-3 shadow-md ${
                      isToday
                        ? 'border-[#00E676] ring-1 ring-[#00E676]/30 shadow-lg shadow-[#00E676]/5'
                        : 'border-[#2C3548]'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                            isToday ? 'bg-[#00E676] text-black' : 'bg-[#212735] text-white'
                          }`}
                        >
                          {item.dayInfo.dayOfMonth}
                        </span>
                        <div>
                          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{item.dayInfo.dayOfWeekName}</span>
                            {isToday && (
                              <span className="text-[9px] bg-[#00E676]/20 text-[#00E676] font-bold px-1.5 py-0.2 rounded-full">
                                DZIŚ
                              </span>
                            )}
                          </h3>
                          <span className="text-[10px] text-[#64748B] font-mono">{item.dayInfo.dateIso}</span>
                        </div>
                      </div>

                      {/* Manual Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'WYKONANY'
                            ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40'
                            : item.status === 'NIEWYKONANY'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-[#64748B]/20 text-[#94A3B8] border border-[#64748B]/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Day Type Chips: Trening / Wolne / Brak planu */}
                    <div className="grid grid-cols-3 gap-1 bg-[#0F1218] p-1 rounded-xl border border-[#2C3548]">
                      {(['ASSIGNED_WORKOUT', 'REST_DAY', 'NO_PLAN'] as DayPlanType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => handleUpdateDayType(idx, t)}
                          className={`py-1 rounded-lg text-[10px] font-bold transition-all text-center ${
                            item.dayType === t
                              ? 'bg-[#212735] text-[#00E676] border border-[#00E676]/40 shadow-sm'
                              : 'text-[#64748B] hover:text-white'
                          }`}
                        >
                          {t === 'ASSIGNED_WORKOUT' ? 'Trening' : t === 'REST_DAY' ? 'Wolne' : 'Brak planu'}
                        </button>
                      ))}
                    </div>

                    {/* Content depending on Day Type: Honest Empty States */}
                    {item.dayType === 'ASSIGNED_WORKOUT' && (
                      <div className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] text-center space-y-1">
                        <span className="text-xs font-bold text-white block">
                          Brak przypisanego planu
                        </span>
                        <span className="text-[10px] text-[#64748B] block">
                          Wybierz lub utwórz plan w bazie
                        </span>
                      </div>
                    )}

                    {item.dayType === 'REST_DAY' && (
                      <div className="bg-[#0F1218] p-2.5 rounded-xl border border-[#2C3548] text-center">
                        <span className="text-xs text-[#94A3B8]">Dzień wolny (regeneracja)</span>
                      </div>
                    )}

                    {item.dayType === 'NO_PLAN' && (
                      <div className="bg-[#0F1218] p-2.5 rounded-xl border border-[#2C3548] text-center">
                        <span className="text-xs text-[#64748B]">Brak zaplanowanych wpisów</span>
                      </div>
                    )}

                    {/* Manual Status Buttons (Zasada: wyłącznie ręczny wybór) */}
                    <div className="flex gap-1.5 pt-1">
                      <button
                        onClick={() => handleUpdateStatus(idx, 'WYKONANY')}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border transition-all ${
                          item.status === 'WYKONANY'
                            ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                            : 'bg-[#0F1218] border-[#2C3548] text-[#94A3B8]'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Wykonany</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(idx, 'NIEWYKONANY')}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border transition-all ${
                          item.status === 'NIEWYKONANY'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                            : 'bg-[#0F1218] border-[#2C3548] text-[#94A3B8]'
                        }`}
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Niewykonany</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(idx, 'NIEROZSTRZYGNIETY')}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border transition-all ${
                          item.status === 'NIEROZSTRZYGNIETY'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-[#0F1218] border-[#2C3548] text-[#94A3B8]'
                        }`}
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Nierozstrzyg.</span>
                      </button>
                    </div>

                    {/* Warning Option: Execute without session */}
                    <button
                      onClick={() => {
                        setTargetDayIndexForWarning(idx);
                        setShowWarningNoSession(true);
                      }}
                      className="w-full text-center text-[10px] text-amber-400 hover:underline pt-0.5 block"
                    >
                      Oznacz jako wykonany bez sesji (z ostrzeżeniem)...
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------------- WIDOK MIESIĘCZNY ---------------- */}
          {viewMode === 'MONTH' && (
            <div className="space-y-4">
              <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white px-1">
                  <span>Miesiąc bieżący</span>
                  <div className="flex gap-2">
                    <button className="p-1 rounded-lg bg-[#212735] text-[#94A3B8] hover:text-white">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1 rounded-lg bg-[#212735] text-[#94A3B8] hover:text-white">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#64748B]">
                  <span>PN</span>
                  <span>WT</span>
                  <span>ŚR</span>
                  <span>CZ</span>
                  <span>PT</span>
                  <span>SB</span>
                  <span>ND</span>
                </div>

                {/* 31 Calendar cells - Honest empty representation */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
                    const isSelected = dayNum === selectedMonthDay;

                    return (
                      <button
                        key={dayNum}
                        onClick={() => setSelectedMonthDay(dayNum)}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all p-1 ${
                          isSelected
                            ? 'bg-[#00E676] text-black font-black shadow'
                            : 'bg-[#0F1218] border border-[#2C3548] text-white hover:border-[#00E676]/40'
                        }`}
                      >
                        <span className="text-xs font-bold">{dayNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sheet for selected day - Honest Empty State */}
              <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">Dzień {selectedMonthDay} — Podgląd planu</h4>
                  <span className="text-[10px] text-[#00E676] font-bold bg-[#00E676]/15 px-2 py-0.5 rounded-full">
                    Wspólne źródło
                  </span>
                </div>

                <div className="bg-[#212735] p-3 rounded-xl border border-[#2C3548] space-y-1">
                  <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Status wpisu:</span>
                  <p className="text-xs text-[#94A3B8]">
                    Brak zaplanowanych wpisów na ten dzień.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <M3BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'analytics') setShowAnalytics(true);
            if (tab === 'today') {
              window.location.href = '/propozycja-1-dzisiaj.html';
            }
            if (tab === 'workout') {
              window.location.href = '/propozycja-3-trening.html';
            }
          }}
        />

        {/* Modals & Dialogs */}
        <ConfirmCopyWeekDialog
          isOpen={showCopyDialog}
          onClose={() => setShowCopyDialog(false)}
          onConfirmCopy={handleConfirmCopy}
        />

        <WarningDialog
          isOpen={showWarningNoSession}
          title="Oznaczenie bez sesji treningowej"
          message="Potwierdzasz ręczne oznaczenie dnia jako Wykonany bez rejestracji sesji. Zgodnie z zasadą aplikacji, ten dzień nie zwiększy liczby ukończonych serii w Analizach."
          onConfirm={() => {
            if (targetDayIndexForWarning !== null) {
              handleUpdateStatus(targetDayIndexForWarning, 'WYKONANY');
            }
            setShowWarningNoSession(false);
          }}
          onCancel={() => setShowWarningNoSession(false)}
        />

        <AnalyticsSheet isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />

        <GymTrackerImportDialog
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onConfirmImport={() => alert('Pomyślnie zaimportowano wybrane pozycje.')}
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
