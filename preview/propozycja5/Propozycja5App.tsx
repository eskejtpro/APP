import React, { useState } from 'react';
import {
  Pill,
  Plus,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { M3TopAppBar } from '../components/shared/M3TopAppBar';
import { M3BottomNavBar, M3TabKey } from '../components/shared/M3BottomNavBar';
import { WarningDialog } from '../components/shared/WarningDialog';
import { SubstanceManualEntryModal } from '../components/shared/SubstanceManualEntryModal';
import { AnalyticsSheet } from '../components/shared/AnalyticsSheet';
import { GymTrackerImportDialog } from '../components/shared/GymTrackerImportDialog';
import { BackupSettingsDialog } from '../components/shared/BackupSettingsDialog';
import { getCurrentWeekDays, DynamicDayInfo } from '../utils/dateHelper';
import { DayPlanType, CompletionStatus } from '../data/sampleData';

interface TimelineNode {
  dayInfo: DynamicDayInfo;
  planType: DayPlanType;
  status: CompletionStatus;
  notes: string;
  substances: string[];
}

export const Propozycja5App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<M3TabKey>('calendar');
  const weekDays = getCurrentWeekDays();

  // Honest Initial State: no fake notes, no fake substances, no fake events
  const [nodes, setNodes] = useState<TimelineNode[]>(
    weekDays.map((d) => ({
      dayInfo: d,
      planType: 'NO_PLAN',
      status: 'NIEROZSTRZYGNIETY',
      notes: '',
      substances: []
    }))
  );

  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(
    Math.max(0, weekDays.findIndex((d) => d.isToday))
  );

  // Dialogs
  const [showWarningNoSession, setShowWarningNoSession] = useState(false);
  const [warningTargetIndex, setWarningTargetIndex] = useState<number | null>(null);
  const [showSubstanceModal, setShowSubstanceModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleUpdateStatus = (index: number, newStatus: CompletionStatus) => {
    setNodes((prev) =>
      prev.map((n, idx) => (idx === index ? { ...n, status: newStatus } : n))
    );
  };

  const handleUpdateType = (index: number, newType: DayPlanType) => {
    setNodes((prev) =>
      prev.map((n, idx) => (idx === index ? { ...n, planType: newType } : n))
    );
  };

  const handleSaveSubstance = (name: string, info: string) => {
    setNodes((prev) =>
      prev.map((n, idx) =>
        idx === activeNodeIndex
          ? { ...n, substances: [...n.substances, `${name} ${info ? `(${info})` : ''}`.trim()] }
          : n
      )
    );
  };

  const handleUpdateNote = (index: number, text: string) => {
    setNodes((prev) =>
      prev.map((n, idx) => (idx === index ? { ...n, notes: text } : n))
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F8FAFC] flex justify-center selection:bg-[#00E676] selection:text-black">
      <div className="w-full max-w-md min-h-screen bg-[#0F1218] flex flex-col relative shadow-2xl border-x border-[#212735]">
        {/* Top App Bar */}
        <M3TopAppBar
          proposalLabel="Propozycja 5: Dziennik / Kalendarz"
          onOpenLibrary={() => setShowImport(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4 pb-24">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
              STRUMIEŃ CHRONOLOGICZNY • XIAOMI 14T
            </span>
            <h1 className="text-xl font-black text-white">Dziennik i Kalendarz</h1>
            <p className="text-xs text-[#94A3B8]">
              Oś czasu własnych notatek i wyłącznie ręcznych wpisów substancji.
            </p>
          </div>

          {/* Privacy & No medical advice banner */}
          <div className="p-3 bg-[#171B24] border border-[#2C3548] rounded-2xl flex items-start gap-2.5 text-xs text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
            <span>
              <strong>Prywatny rejestr:</strong> Wpisy substancji są wyłącznie ręcznymi notatkami użytkownika. Aplikacja nie podaje dawkowania, porad ani sugestii.
            </span>
          </div>

          {/* Timeline Nodes Container */}
          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#2C3548]">
            {nodes.map((node, idx) => {
              const isToday = node.dayInfo.isToday;

              return (
                <div key={node.dayInfo.dateIso} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[27px] top-3 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-all ${
                      isToday
                        ? 'bg-[#00E676] border-black text-black shadow-md shadow-[#00E676]/40'
                        : node.status === 'WYKONANY'
                        ? 'bg-emerald-500 border-[#0F1218] text-white'
                        : node.status === 'NIEWYKONANY'
                        ? 'bg-rose-500 border-[#0F1218] text-white'
                        : 'bg-[#212735] border-[#2C3548] text-[#94A3B8]'
                    }`}
                  >
                    {node.dayInfo.dayOfMonth}
                  </div>

                  {/* Day Card */}
                  <div
                    className={`bg-[#171B24] border rounded-2xl p-4 space-y-3 shadow-md transition-all ${
                      isToday
                        ? 'border-[#00E676] ring-1 ring-[#00E676]/30'
                        : 'border-[#2C3548]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {node.dayInfo.dayOfWeekName}
                          </span>
                          {isToday && (
                            <span className="text-[9px] bg-[#00E676] text-black font-black px-1.5 py-0.2 rounded-full">
                              DZIŚ
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#64748B] font-mono">
                          {node.dayInfo.dateIso}
                        </span>
                      </div>

                      {/* Manual Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          node.status === 'WYKONANY'
                            ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40'
                            : node.status === 'NIEWYKONANY'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-[#64748B]/20 text-[#94A3B8] border border-[#64748B]/30'
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>

                    {/* Day Type Selector Chips */}
                    <div className="grid grid-cols-3 gap-1 bg-[#0F1218] p-1 rounded-xl border border-[#2C3548]">
                      {(['ASSIGNED_WORKOUT', 'REST_DAY', 'NO_PLAN'] as DayPlanType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => handleUpdateType(idx, t)}
                          className={`py-1 rounded-lg text-[10px] font-bold transition-all text-center ${
                            node.planType === t
                              ? 'bg-[#212735] text-[#00E676] border border-[#00E676]/40 shadow-sm'
                              : 'text-[#64748B] hover:text-white'
                          }`}
                        >
                          {t === 'ASSIGNED_WORKOUT' ? 'Trening' : t === 'REST_DAY' ? 'Wolne' : 'Brak planu'}
                        </button>
                      ))}
                    </div>

                    {/* Note input */}
                    <div>
                      <input
                        type="text"
                        placeholder="Własna notatka dnia..."
                        value={node.notes}
                        onChange={(e) => handleUpdateNote(idx, e.target.value)}
                        className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676]"
                      />
                    </div>

                    {/* Manual Substances List */}
                    {node.substances.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {node.substances.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] bg-purple-500/15 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-lg flex items-center gap-1"
                          >
                            <Pill className="w-3 h-3" />
                            <span>{s}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions: Add Substance + Manual Status Selector */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#2C3548]/50">
                      <button
                        onClick={() => {
                          setActiveNodeIndex(idx);
                          setShowSubstanceModal(true);
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 py-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Dodaj substancję (ręcznie)</span>
                      </button>

                      {/* 3 Manual Status buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdateStatus(idx, 'WYKONANY')}
                          className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                            node.status === 'WYKONANY'
                              ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                              : 'bg-[#0F1218] border-[#2C3548] text-[#94A3B8]'
                          }`}
                          title="Wykonany"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(idx, 'NIEWYKONANY')}
                          className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                            node.status === 'NIEWYKONANY'
                              ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                              : 'bg-[#0F1218] border-[#2C3548] text-[#94A3B8]'
                          }`}
                          title="Niewykonany"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(idx, 'NIEROZSTRZYGNIETY')}
                          className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                            node.status === 'NIEROZSTRZYGNIETY'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-[#0F1218] border-[#2C3548] text-[#94A3B8]'
                          }`}
                          title="Nierozstrzygnięty"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Warning action */}
                    <button
                      onClick={() => {
                        setWarningTargetIndex(idx);
                        setShowWarningNoSession(true);
                      }}
                      className="w-full text-center text-[10px] text-amber-400 hover:underline pt-0.5 block"
                    >
                      Oznacz jako wykonany bez sesji (z ostrzeżeniem)...
                    </button>
                  </div>
                </div>
              );
            })}
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

        {/* Dialogs */}
        <WarningDialog
          isOpen={showWarningNoSession}
          title="Oznaczenie bez sesji treningowej"
          message="Potwierdzasz ręczne oznaczenie dnia jako Wykonany bez sesji treningowej. Pamiętaj, że taka pozycja nie zasila modułu Analiz danymi o objętości."
          onConfirm={() => {
            if (warningTargetIndex !== null) {
              handleUpdateStatus(warningTargetIndex, 'WYKONANY');
            }
            setShowWarningNoSession(false);
          }}
          onCancel={() => setShowWarningNoSession(false)}
        />

        <SubstanceManualEntryModal
          isOpen={showSubstanceModal}
          onClose={() => setShowSubstanceModal(false)}
          onSave={handleSaveSubstance}
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
