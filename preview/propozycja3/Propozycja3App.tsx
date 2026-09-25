import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Dumbbell,
  RefreshCw
} from 'lucide-react';
import { M3TopAppBar } from '../components/shared/M3TopAppBar';
import { M3BottomNavBar, M3TabKey } from '../components/shared/M3BottomNavBar';
import { ReplaceExerciseDialog } from '../components/shared/ReplaceExerciseDialog';
import { AnalyticsSheet } from '../components/shared/AnalyticsSheet';
import { GymTrackerImportDialog } from '../components/shared/GymTrackerImportDialog';
import { BackupSettingsDialog } from '../components/shared/BackupSettingsDialog';
import { Exercise } from '../data/sampleData';

interface RegisteredSet {
  setNumber: number;
  weightKg: number;
  reps: number;
}

export const Propozycja3App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<M3TabKey>('workout');

  // Input state for new completed set (neutral inputs for approved fields)
  const [inputWeight, setInputWeight] = useState<number>(0);
  const [inputReps, setInputReps] = useState<number>(0);

  // Registered completed sets (honest empty state initially)
  const [completedSets, setCompletedSets] = useState<RegisteredSet[]>([]);

  // Dialog states
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Active exercise slot (honest empty or selected)
  const [activeExerciseName, setActiveExerciseName] = useState<string>('');

  // Demonstration helper for saving completed set (visual only, no writes to real Room data)
  const handleSaveCompletedSet = () => {
    if (inputWeight <= 0 && inputReps <= 0) {
      alert('Wprowadź ciężar i powtórzenia przed zatwierdzeniem serii.');
      return;
    }
    const nextSetNumber = completedSets.length + 1;
    setCompletedSets((prev) => [
      ...prev,
      {
        setNumber: nextSetNumber,
        weightKg: inputWeight,
        reps: inputReps
      }
    ]);
  };

  const handleConfirmReplace = (newEx: Exercise) => {
    setActiveExerciseName(newEx.name);
    setShowReplaceDialog(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F8FAFC] flex justify-center selection:bg-[#00E676] selection:text-black">
      <div className="w-full max-w-md min-h-screen bg-[#0F1218] flex flex-col relative shadow-2xl border-x border-[#212735]">
        {/* Top App Bar */}
        <M3TopAppBar
          proposalLabel="Propozycja 3: Skupiony Trening"
          onOpenLibrary={() => setShowImport(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4 pb-24">
          {/* 1. Header: Live Session Status Area */}
          <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider font-mono">
                WIDOK ŚLEDZENIA SERII • XIAOMI 14T
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">Brak aktywnej sesji</span>
            </div>

            <div>
              <h1 className="text-xl font-black text-white">Rejestracja Treningu</h1>
              <p className="text-xs text-[#94A3B8]">
                {activeExerciseName
                  ? `Wybrane ćwiczenie: ${activeExerciseName}`
                  : 'Brak przypisanego ćwiczenia roboczego'}
              </p>
            </div>

            {/* Rule banner: Room draft preservation */}
            <div className="bg-[#0F1218] p-2 rounded-xl border border-[#2C3548] flex items-center gap-2 text-[10px] text-[#94A3B8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
              <span>Zatwierdzone serie są bezpiecznie przechowywane w lokalnej bazie Room.</span>
            </div>
          </div>

          {/* 2. Neutral Set Entry Form (Zatwierdzone pola ciężar / powtórzenia) */}
          <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl p-4 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-[#00E676]" />
                <span>Wprowadzanie Serii</span>
              </h2>

              {activeExerciseName && (
                <button
                  onClick={() => setShowReplaceDialog(true)}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#212735] hover:bg-[#2C3548] text-cyan-400 border border-cyan-500/30 flex items-center gap-1"
                  title="Zastąp nieukończoną część ćwiczenia"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Zastąp resztę</span>
                </button>
              )}
            </div>

            {/* Steppers for weight and reps */}
            <div className="grid grid-cols-2 gap-3">
              {/* Ciężar (kg) */}
              <div className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] space-y-2">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">
                  Ciężar (kg)
                </span>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setInputWeight((w) => Math.max(0, +(w - 2.5).toFixed(1)))}
                    className="w-8 h-8 rounded-lg bg-[#212735] text-white flex items-center justify-center font-bold text-sm active:scale-95"
                  >
                    -
                  </button>
                  <span className="text-lg font-black font-mono text-white">
                    {inputWeight > 0 ? `${inputWeight} kg` : '0 kg'}
                  </span>
                  <button
                    onClick={() => setInputWeight((w) => +(w + 2.5).toFixed(1))}
                    className="w-8 h-8 rounded-lg bg-[#212735] text-white flex items-center justify-center font-bold text-sm active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Powtórzenia */}
              <div className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] space-y-2">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">
                  Powtórzenia
                </span>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setInputReps((r) => Math.max(0, r - 1))}
                    className="w-8 h-8 rounded-lg bg-[#212735] text-white flex items-center justify-center font-bold text-sm active:scale-95"
                  >
                    -
                  </button>
                  <span className="text-lg font-black font-mono text-white">
                    {inputReps > 0 ? inputReps : '0'}
                  </span>
                  <button
                    onClick={() => setInputReps((r) => r + 1)}
                    className="w-8 h-8 rounded-lg bg-[#212735] text-white flex items-center justify-center font-bold text-sm active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Button: Zapisz ukończoną serię */}
            <button
              onClick={handleSaveCompletedSet}
              className="w-full bg-[#00E676] hover:bg-[#00c864] text-black font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Zapisz ukończoną serię</span>
            </button>
          </div>

          {/* 3. Table of Registered Sets: Honest Empty State initially */}
          <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Zarejestrowane serie w sesji:</span>
              <span className="text-[10px] font-mono text-[#00E676]">
                {completedSets.length} serii
              </span>
            </div>

            {completedSets.length === 0 ? (
              <div className="p-4 bg-[#0F1218] rounded-xl border border-[#2C3548] text-center space-y-1">
                <span className="text-xs text-[#94A3B8] block">Brak zarejestrowanych serii</span>
                <span className="text-[10px] text-[#64748B] block">
                  Użyj powyższych pól ciężar/powtórzenia, aby dodać serię roboczą.
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="grid grid-cols-12 text-[10px] font-bold text-[#64748B] px-2 uppercase">
                  <span className="col-span-3">Seria</span>
                  <span className="col-span-5 text-center">Ciężar (kg)</span>
                  <span className="col-span-4 text-right">Powtórzenia</span>
                </div>

                {completedSets.map((s) => (
                  <div
                    key={s.setNumber}
                    className="grid grid-cols-12 items-center p-2 rounded-xl border border-[#00E676]/40 bg-[#00E676]/10 text-xs"
                  >
                    <div className="col-span-3 flex items-center gap-1.5 font-bold">
                      <span className="w-5 h-5 rounded-full bg-[#00E676] text-black font-black text-[10px] flex items-center justify-center">
                        {s.setNumber}
                      </span>
                      <span className="text-white text-[11px]">Seria {s.setNumber}</span>
                    </div>

                    <div className="col-span-5 text-center font-mono font-bold text-white">
                      {s.weightKg} kg
                    </div>

                    <div className="col-span-4 text-right font-mono font-bold text-[#00E676]">
                      {s.reps} powt.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Complete Session CTA Button */}
          <div className="pt-2">
            <button
              onClick={() => setShowSummaryModal(true)}
              className="w-full bg-[#212735] hover:bg-[#2C3548] text-white border border-[#2C3548] font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
              <span>Zakończ sesję</span>
            </button>
          </div>
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
            if (tab === 'plans') {
              window.location.href = '/propozycja-2-harmonogram.html';
            }
          }}
        />

        {/* Dialog: Replace Exercise Part */}
        <ReplaceExerciseDialog
          isOpen={showReplaceDialog}
          currentExerciseName={activeExerciseName || 'Ćwiczenie robocze'}
          completedSetsCount={completedSets.length}
          remainingSetsCount={0}
          availableExercises={[]}
          onConfirmReplace={handleConfirmReplace}
          onClose={() => setShowReplaceDialog(false)}
        />

        {/* Dialog: Session Summary (Strict Rule Reminder) */}
        {showSummaryModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
            <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#00E676]/20 flex items-center justify-center text-[#00E676]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Podsumowanie Sesji Treningowej</h3>
                  <span className="text-[10px] text-[#00E676] font-mono">PlanPasika</span>
                </div>
              </div>

              <div className="bg-[#212735] p-3 rounded-xl border border-[#2C3548] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Zatwierdzone serie:</span>
                  <span className="font-bold text-[#00E676] font-mono">{completedSets.length}</span>
                </div>
              </div>

              {/* Crucial product rule reminder */}
              <div className="bg-amber-500/10 border border-amber-500/40 p-3 rounded-xl space-y-1 text-xs text-amber-200">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Ważna zasada harmonogramu:</span>
                </div>
                <p className="text-[10px] text-amber-200/90 leading-relaxed">
                  Zakończenie sesji treningowej <strong>NIE zmienia samoczynnie statusu dnia</strong> w harmonogramie. Status (Wykonany / Niewykonany) ustawiasz wyłącznie samodzielnie w zakładce Dzisiaj lub Harmonogram.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#2C3548] hover:bg-[#212735] text-xs font-semibold text-[#94A3B8] hover:text-white"
                >
                  Wróć do sesji
                </button>
                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    alert('Sesja zapisana! Przejdź do zakładki Dzisiaj, aby ręcznie zatwierdzić status dnia.');
                    window.location.href = '/propozycja-1-dzisiaj.html';
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold shadow-lg shadow-[#00E676]/20"
                >
                  Zapisz sesję
                </button>
              </div>
            </div>
          </div>
        )}

        <AnalyticsSheet isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />

        <GymTrackerImportDialog
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onConfirmImport={() => alert('Zaimportowano pozycje do bazy.')}
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
