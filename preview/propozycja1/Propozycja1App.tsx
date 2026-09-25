import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Plus,
  Pill,
  Calendar
} from 'lucide-react';
import { M3TopAppBar } from '../components/shared/M3TopAppBar';
import { M3BottomNavBar, M3TabKey } from '../components/shared/M3BottomNavBar';
import { WarningDialog } from '../components/shared/WarningDialog';
import { SubstanceManualEntryModal } from '../components/shared/SubstanceManualEntryModal';
import { AnalyticsSheet } from '../components/shared/AnalyticsSheet';
import { GymTrackerImportDialog } from '../components/shared/GymTrackerImportDialog';
import { BackupSettingsDialog } from '../components/shared/BackupSettingsDialog';
import {
  getTodayFormattedPolish,
  getCurrentWeekDays
} from '../utils/dateHelper';
import { DayPlanType, CompletionStatus } from '../data/sampleData';

export const Propozycja1App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<M3TabKey>('today');
  const weekDays = getCurrentWeekDays();

  // Today state: Honest empty state (no fake assigned workout or fake session)
  const [todayType, setTodayType] = useState<DayPlanType>('NO_PLAN');
  const [todayStatus, setTodayStatus] = useState<CompletionStatus>('NIEROZSTRZYGNIETY');
  const [selectedDayIso, setSelectedDayIso] = useState<string>(
    weekDays.find((d) => d.isToday)?.dateIso || ''
  );

  // Notes & Substances (Honest empty state)
  const [todayNotes, setTodayNotes] = useState<string>('');
  const [substances, setSubstances] = useState<{ id: string; name: string; info: string }[]>([]);

  // Dialogs
  const [showWarningNoSession, setShowWarningNoSession] = useState(false);
  const [showSubstanceModal, setShowSubstanceModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F8FAFC] flex justify-center selection:bg-[#00E676] selection:text-black">
      {/* Xiaomi 14T Frame Simulation */}
      <div className="w-full max-w-md min-h-screen bg-[#0F1218] flex flex-col relative shadow-2xl border-x border-[#212735]">
        {/* Top App Bar */}
        <M3TopAppBar
          proposalLabel="Propozycja 1: Pulpit Dzisiaj"
          onOpenLibrary={() => setShowImport(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4 pb-24">
          {/* 1. Header: Dynamic Today Date & Orientation */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
              GŁÓWNY PULPIT OPERACYJNY • XIAOMI 14T
            </span>
            <h1 className="text-xl font-black text-white capitalize">
              {getTodayFormattedPolish()}
            </h1>
          </div>

          {/* 2. Mini Week Strip (Horizontal 7-day selector) */}
          <div className="bg-[#171B24] border border-[#2C3548] p-2.5 rounded-2xl space-y-1.5 shadow-md">
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="font-bold text-[#94A3B8]">Bieżący Tydzień</span>
              <span className="text-[10px] text-[#64748B] font-mono">Brak zaplanowanych wpisów</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => {
                const isSelected = day.dateIso === selectedDayIso;
                return (
                  <button
                    key={day.dateIso}
                    onClick={() => setSelectedDayIso(day.dateIso)}
                    className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#00E676] text-black font-extrabold shadow-md'
                        : day.isToday
                        ? 'bg-[#212735] border border-[#00E676]/60 text-white'
                        : 'bg-[#0F1218] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-bold">{day.dayOfWeekName.slice(0, 2)}</span>
                    <span className="text-xs font-black">{day.dayOfMonth}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        day.isToday ? 'bg-amber-400' : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Hero Card: Honest Empty State for Day Plan & Session */}
          <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#212735] text-[#94A3B8] border border-[#2C3548]">
                PLAN NA DZIŚ
              </span>
              <span className="text-[11px] font-mono text-[#64748B]">Max 1 trening / dzień</span>
            </div>

            {todayType === 'ASSIGNED_WORKOUT' ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#0F1218] rounded-xl border border-[#2C3548] text-center space-y-1">
                  <p className="text-xs font-bold text-white">Brak przypisanego planu treningowego</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    Przejdź do modułu Plany, aby utworzyć lub przypisać jednostkę treningową.
                  </p>
                </div>
                <button
                  onClick={() => (window.location.href = '/propozycja-2-harmonogram.html')}
                  className="w-full bg-[#212735] hover:bg-[#2C3548] text-[#00E676] border border-[#00E676]/40 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Otwórz harmonogram planów</span>
                </button>
              </div>
            ) : todayType === 'REST_DAY' ? (
              <div className="p-3 bg-[#0F1218] rounded-xl border border-[#2C3548] text-center space-y-1">
                <p className="text-xs font-bold text-white">Dzień wolny</p>
                <p className="text-[11px] text-[#94A3B8]">Zaplanowany odpoczynek i regeneracja mięśniowa.</p>
              </div>
            ) : (
              <div className="p-3 bg-[#0F1218] rounded-xl border border-[#2C3548] text-center space-y-1">
                <p className="text-xs font-bold text-white">Brak planu na ten dzień</p>
                <p className="text-[11px] text-[#94A3B8]">
                  Wybierz typ dnia poniżej lub przejdź do harmonogramu.
                </p>
              </div>
            )}

            {/* Active session state indicator: Honest Empty State */}
            <div className="pt-1 border-t border-[#2C3548]/50 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Stan sesji w Room:</span>
              <span className="font-mono text-[#94A3B8]">Brak aktywnej sesji</span>
            </div>
          </div>

          {/* 4. Day Type Selector (Strict separation of Day Type and Status) */}
          <div className="bg-[#171B24] border border-[#2C3548] p-3.5 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-[#94A3B8] block">Typ zaplanowanego dnia:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'ASSIGNED_WORKOUT' as DayPlanType, label: 'Trening' },
                { id: 'REST_DAY' as DayPlanType, label: 'Dzień wolny' },
                { id: 'NO_PLAN' as DayPlanType, label: 'Brak planu' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTodayType(t.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                    todayType === t.id
                      ? 'bg-[#00E676] text-black shadow'
                      : 'bg-[#212735] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Manual Status Manager (Strict Product Rule Enforcement) */}
          <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Ręczny status rozliczenia dnia:</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  todayStatus === 'WYKONANY'
                    ? 'bg-[#00E676]/20 text-[#00E676]'
                    : todayStatus === 'NIEWYKONANY'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-[#64748B]/20 text-[#94A3B8]'
                }`}
              >
                {todayStatus}
              </span>
            </div>

            {/* Rule explanation notice */}
            <div className="bg-[#0F1218] p-2.5 rounded-xl border border-[#2C3548] flex items-start gap-2 text-[10px] text-[#94A3B8] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
              <span>
                <strong>Zasada:</strong> Status dnia jest wyłącznie ręczny i nigdy nie zmienia się samoczynnie (po zakończeniu sesji ani przez upływ czasu). Korekta statusu nie modyfikuje sesji.
              </span>
            </div>

            {/* 3 Status buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTodayStatus('WYKONANY')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  todayStatus === 'WYKONANY'
                    ? 'bg-[#00E676]/20 border border-[#00E676] text-[#00E676]'
                    : 'bg-[#212735] border border-[#2C3548] text-[#94A3B8] hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Wykonany</span>
              </button>

              <button
                onClick={() => setTodayStatus('NIEWYKONANY')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  todayStatus === 'NIEWYKONANY'
                    ? 'bg-rose-500/20 border border-rose-500 text-rose-400'
                    : 'bg-[#212735] border border-[#2C3548] text-[#94A3B8] hover:text-white'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Niewykonany</span>
              </button>

              <button
                onClick={() => setTodayStatus('NIEROZSTRZYGNIETY')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  todayStatus === 'NIEROZSTRZYGNIETY'
                    ? 'bg-amber-500/20 border border-amber-500 text-amber-300'
                    : 'bg-[#212735] border border-[#2C3548] text-[#94A3B8] hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Nierozstrzyg.</span>
              </button>
            </div>

            {/* Warning Action: Mark completed without session */}
            <button
              onClick={() => setShowWarningNoSession(true)}
              className="w-full text-center text-[11px] text-amber-400 hover:text-amber-300 font-semibold py-1.5 border border-dashed border-amber-500/30 rounded-xl hover:bg-amber-500/10 transition-colors"
            >
              ⚠️ Oznacz jako wykonany bez rejestracji sesji...
            </button>
          </div>

          {/* 6. Calendar Quick Actions: Notes & Manual Substances */}
          <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Notatka i Ręczne Substancje:</span>
              <button
                onClick={() => setShowSubstanceModal(true)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Dodaj substancję</span>
              </button>
            </div>

            <textarea
              placeholder="Własna notatka dnia (samopoczucie, regeneracja, uwagi)..."
              value={todayNotes}
              onChange={(e) => setTodayNotes(e.target.value)}
              rows={2}
              className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676] resize-none"
            />

            {substances.length === 0 ? (
              <div className="p-2 rounded-xl bg-[#0F1218] border border-[#2C3548] text-center">
                <span className="text-[11px] text-[#64748B]">Brak wpisanych substancji na ten dzień</span>
              </div>
            ) : (
              <div className="space-y-1.5 pt-1">
                {substances.map((s) => (
                  <div
                    key={s.id}
                    className="bg-[#212735] p-2 rounded-lg border border-[#2C3548] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Pill className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-bold text-white">{s.name}</span>
                      <span className="text-[10px] text-[#94A3B8]">{s.info}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Bottom Navigation Bar */}
        <M3BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'analytics') setShowAnalytics(true);
            if (tab === 'plans') {
              window.location.href = '/propozycja-2-harmonogram.html';
            }
            if (tab === 'workout') {
              window.location.href = '/propozycja-3-trening.html';
            }
          }}
        />

        {/* Dialogs */}
        <WarningDialog
          isOpen={showWarningNoSession}
          title="Oznaczenie bez sesji treningowej"
          message="PlanPasika pozwala na ręczne oznaczenie dnia jako Wykonany bez rejestrowania sesji treningowej (np. trening poza domem lub brak możliwości wprowadzania danych na żywo). Pamiętaj, że taka pozycja nie zasili modułu Analiz danymi o objętości i seriach."
          confirmLabel="Tak, oznacz jako wykonany"
          onConfirm={() => {
            setTodayStatus('WYKONANY');
            setShowWarningNoSession(false);
          }}
          onCancel={() => setShowWarningNoSession(false)}
        />

        <SubstanceManualEntryModal
          isOpen={showSubstanceModal}
          onClose={() => setShowSubstanceModal(false)}
          onSave={(name, info) => {
            setSubstances((prev) => [...prev, { id: String(Date.now()), name, info }]);
          }}
        />

        <AnalyticsSheet isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />

        <GymTrackerImportDialog
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onConfirmImport={(newEx) => {
            alert(`Pomyślnie zaimportowano ${newEx.length} ćwiczeń do bazy.`);
          }}
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
