import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Dumbbell,
  Plus,
  Check,
  XCircle,
  HelpCircle,
  Pill,
  Copy,
  RefreshCw,
  Ruler,
  Layers,
  Trophy,
  Trash2,
  Edit2
} from 'lucide-react';
import { M3TopAppBar } from './components/shared/M3TopAppBar';
import { M3BottomNavBar, M3TabKey } from './components/shared/M3BottomNavBar';
import { WarningDialog } from './components/shared/WarningDialog';
import { ReplaceExerciseDialog } from './components/shared/ReplaceExerciseDialog';
import { ConfirmCopyWeekDialog } from './components/shared/ConfirmCopyWeekDialog';
import { ConfirmDeleteDialog } from './components/shared/ConfirmDeleteDialog';
import { GymTrackerImportDialog } from './components/shared/GymTrackerImportDialog';
import { BackupSettingsDialog } from './components/shared/BackupSettingsDialog';
import { MeasurementsSection } from './components/analytics/MeasurementsSection';
import { MuscleGroupsSection } from './components/analytics/MuscleGroupsSection';
import { RecordsAndSummarySection } from './components/analytics/RecordsAndSummarySection';
import { CalendarProtocolModal } from './components/calendar/CalendarProtocolModal';
import { RestTimerSection } from './components/workout/RestTimerSection';
import {
  getTodayFormattedPolish,
  getCurrentWeekDays,
  formatToIso,
  getTodayDate
} from './utils/dateHelper';
import {
  APPROVED_EXERCISE_CATEGORIES,
  DayPlanType,
  CompletionStatus,
  Exercise,
  BodyMeasurementEntry,
  CompletedWorkoutSession,
  CalendarProtocolEntry,
  RegisteredSet,
  WorkoutTemplate
} from './data/sampleData';
import { StorageService } from './utils/storage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<M3TabKey>('today');
  const weekDays = useMemo(() => getCurrentWeekDays(), []);

  // === PERSISTED STATE ===
  const [measurements, setMeasurements] = useState<BodyMeasurementEntry[]>(() =>
    StorageService.loadMeasurements()
  );
  const [workoutSessions, setWorkoutSessions] = useState<CompletedWorkoutSession[]>(() =>
    StorageService.loadSessions()
  );
  const [protocolEntries, setProtocolEntries] = useState<CalendarProtocolEntry[]>(() =>
    StorageService.loadProtocols()
  );
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>(() =>
    StorageService.loadExercises()
  );
  const [userPlans, setUserPlans] = useState<WorkoutTemplate[]>(() =>
    StorageService.loadTemplates()
  );
  const [dayNotesMap, setDayNotesMap] = useState<Record<string, string>>(() =>
    StorageService.loadDayNotes()
  );
  const [dayTypesMap, setDayTypesMap] = useState<Record<string, string>>(() =>
    StorageService.loadDayTypes()
  );
  const [dayStatusesMap, setDayStatusesMap] = useState<Record<string, string>>(() =>
    StorageService.loadDayStatuses()
  );

  // Sync to Storage on changes
  useEffect(() => {
    StorageService.saveMeasurements(measurements);
  }, [measurements]);

  useEffect(() => {
    StorageService.saveSessions(workoutSessions);
  }, [workoutSessions]);

  useEffect(() => {
    StorageService.saveProtocols(protocolEntries);
  }, [protocolEntries]);

  useEffect(() => {
    StorageService.saveExercises(exerciseLibrary);
  }, [exerciseLibrary]);

  useEffect(() => {
    StorageService.saveTemplates(userPlans);
  }, [userPlans]);

  useEffect(() => {
    StorageService.saveDayNotes(dayNotesMap);
  }, [dayNotesMap]);

  useEffect(() => {
    StorageService.saveDayTypes(dayTypesMap);
  }, [dayTypesMap]);

  useEffect(() => {
    StorageService.saveDayStatuses(dayStatusesMap);
  }, [dayStatusesMap]);

  // === SELECTED DAY ON DASHBOARD ===
  const todayIso = useMemo(() => formatToIso(getTodayDate()), []);
  const [selectedDayIso, setSelectedDayIso] = useState<string>(todayIso);

  const currentDayType: DayPlanType = (dayTypesMap[selectedDayIso] as DayPlanType) || 'NO_PLAN';
  const currentDayStatus: CompletionStatus = (dayStatusesMap[selectedDayIso] as CompletionStatus) || 'NIEROZSTRZYGNIETY';
  const currentDayNote: string = dayNotesMap[selectedDayIso] || '';

  // === ACTIVE WORKOUT SESSION STATE & DRAFT AUTO-SAVE (Etap 4A) ===
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<string>('');
  const [currentExerciseName, setCurrentExerciseName] = useState('Wyciskanie sztangi leżąc');
  const [currentCategory, setCurrentCategory] = useState<string>(APPROVED_EXERCISE_CATEGORIES[0]);
  const [currentSets, setCurrentSets] = useState<RegisteredSet[]>([]);
  const [inputWeight, setInputWeight] = useState<number>(60);
  const [inputReps, setInputReps] = useState<number>(10);

  // === REST TIMER (Etap 4A) ===
  const [restTimerRemaining, setRestTimerRemaining] = useState(0);
  const [restTimerTotal, setRestTimerTotal] = useState(90);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [isRestTimerFinished, setIsRestTimerFinished] = useState(false);

  // Load existing active draft on launch
  useEffect(() => {
    const draft = StorageService.loadActiveDraft();
    if (draft) {
      setIsSessionActive(true);
      setSessionStartTime(draft.startTime);
      setCurrentExerciseName(draft.exerciseName);
      setCurrentCategory(draft.category);
      setCurrentSets(draft.sets || []);
      setInputWeight(draft.inputWeight || 60);
      setInputReps(draft.inputReps || 10);
    }
  }, []);

  // Auto-save active draft to LocalStorage
  useEffect(() => {
    if (isSessionActive) {
      StorageService.saveActiveDraft({
        startTime: sessionStartTime || '12:00',
        exerciseName: currentExerciseName,
        category: currentCategory,
        sets: currentSets,
        inputWeight,
        inputReps,
        lastUpdatedTimestamp: Date.now()
      });
    }
  }, [isSessionActive, sessionStartTime, currentExerciseName, currentCategory, currentSets, inputWeight, inputReps]);

  // Rest Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (isRestTimerRunning && restTimerRemaining > 0) {
      interval = setInterval(() => {
        setRestTimerRemaining((prev) => {
          if (prev <= 1) {
            setIsRestTimerRunning(false);
            setIsRestTimerFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRestTimerRunning, restTimerRemaining]);

  const handleStartRestTimer = (seconds: number) => {
    setRestTimerTotal(seconds);
    setRestTimerRemaining(seconds);
    setIsRestTimerRunning(true);
    setIsRestTimerFinished(false);
  };

  const handleAdjustRestTimer = (delta: number) => {
    setRestTimerRemaining((prev) => {
      const next = Math.max(0, prev + delta);
      if (next > restTimerTotal) setRestTimerTotal(next);
      if (next === 0) {
        setIsRestTimerRunning(false);
        setIsRestTimerFinished(true);
      } else {
        setIsRestTimerFinished(false);
        setIsRestTimerRunning(true);
      }
      return next;
    });
  };

  const handlePauseRestTimer = () => setIsRestTimerRunning(false);
  const handleResumeRestTimer = () => {
    if (restTimerRemaining > 0) {
      setIsRestTimerRunning(true);
      setIsRestTimerFinished(false);
    }
  };
  const handleResetRestTimer = () => {
    setIsRestTimerRunning(false);
    setIsRestTimerFinished(false);
    setRestTimerRemaining(0);
  };

  // === SCHEDULE & PLANS STATE ===
  const [scheduleViewMode, setScheduleViewMode] = useState<'WEEK' | 'MONTH' | 'TEMPLATES'>('WEEK');
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanCategory, setNewPlanCategory] = useState<string>(APPROVED_EXERCISE_CATEGORIES[0]);

  // === ANALYTICS SUB-TAB STATE ===
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'MEASUREMENTS' | 'MUSCLES' | 'SUMMARY'>('MEASUREMENTS');
  const [muscleTimeRange, setMuscleTimeRange] = useState<'WEEK' | 'MONTH' | 'ALL'>('ALL');

  // === DIALOGS & MODALS ===
  const [showWarningNoSession, setShowWarningNoSession] = useState(false);
  const [showReplaceExerciseModal, setShowReplaceExerciseModal] = useState(false);
  const [showCopyWeekModal, setShowCopyWeekModal] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);

  // Protocol modal & delete
  const [protocolModalOpen, setProtocolModalOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<CalendarProtocolEntry | null>(null);
  const [deletingProtocolId, setDeletingProtocolId] = useState<string | null>(null);

  // ==========================================
  // HANDLERS: TODAY ACTIONS
  // ==========================================
  const handleSetDayType = (type: DayPlanType) => {
    setDayTypesMap((prev) => ({ ...prev, [selectedDayIso]: type }));
  };

  const handleSetDayStatus = (status: CompletionStatus) => {
    setDayStatusesMap((prev) => ({ ...prev, [selectedDayIso]: status }));
  };

  const handleSetDayNote = (note: string) => {
    setDayNotesMap((prev) => ({ ...prev, [selectedDayIso]: note }));
  };

  // ==========================================
  // HANDLERS: WORKOUT
  // ==========================================
  const handleStartSession = () => {
    setIsSessionActive(true);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setSessionStartTime(timeStr);
    setCurrentSets([]);
    setActiveTab('workout');
  };

  const handleSaveSet = () => {
    const nextSetNumber = currentSets.length + 1;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newSet: RegisteredSet = {
      id: `${Date.now()}-${nextSetNumber}`,
      setNumber: nextSetNumber,
      exerciseName: currentExerciseName,
      category: currentCategory,
      weightKg: inputWeight,
      reps: inputReps,
      completedAt: timeStr
    };

    setCurrentSets((prev) => [...prev, newSet]);
    handleStartRestTimer(restTimerTotal || 90);
  };

  const handleReplaceExercise = (newExercise: Exercise) => {
    setCurrentExerciseName(newExercise.name);
    setCurrentCategory(newExercise.category);
    setShowReplaceExerciseModal(false);
  };

  const handleEndSession = () => {
    if (currentSets.length > 0) {
      const now = new Date();
      const endTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Calculate approximate duration in minutes if possible
      let durationMinutes = 45;
      if (sessionStartTime) {
        const [sh, sm] = sessionStartTime.split(':').map(Number);
        const [eh, em] = endTimeStr.split(':').map(Number);
        const diff = (eh * 60 + em) - (sh * 60 + sm);
        if (diff > 0) durationMinutes = diff;
      }

      const totalTonnage = currentSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
      const totalReps = currentSets.reduce((sum, s) => sum + s.reps, 0);

      const completedSession: CompletedWorkoutSession = {
        id: String(Date.now()),
        dateIso: selectedDayIso,
        startTime: sessionStartTime || '12:00',
        endTime: endTimeStr,
        durationMinutes,
        workoutName: `Trening - ${currentCategory}`,
        category: currentCategory,
        sets: [...currentSets],
        totalTonnageKg: totalTonnage,
        totalReps
      };

      setWorkoutSessions((prev) => [completedSession, ...prev]);
    }

    StorageService.clearActiveDraft();
    setIsSessionActive(false);
    handleResetRestTimer();
    setShowEndSessionDialog(false);
  };

  const handleDiscardSession = () => {
    StorageService.clearActiveDraft();
    setIsSessionActive(false);
    setCurrentSets([]);
    handleResetRestTimer();
    setShowEndSessionDialog(false);
  };

  // ==========================================
  // HANDLERS: MEASUREMENTS CRUD
  // ==========================================
  const handleAddMeasurement = (entry: Omit<BodyMeasurementEntry, 'id' | 'timestamp'>) => {
    const newEntry: BodyMeasurementEntry = {
      ...entry,
      id: String(Date.now()),
      timestamp: new Date(`${entry.dateIso}T${entry.time}:00`).getTime() || Date.now()
    };
    setMeasurements((prev) => [newEntry, ...prev]);
  };

  const handleEditMeasurement = (id: string, entry: Omit<BodyMeasurementEntry, 'id' | 'timestamp'>) => {
    setMeasurements((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              ...entry,
              timestamp: new Date(`${entry.dateIso}T${entry.time}:00`).getTime() || m.timestamp
            }
          : m
      )
    );
  };

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  // ==========================================
  // HANDLERS: PROTOCOLS CRUD
  // ==========================================
  const handleSaveProtocol = (entry: Omit<CalendarProtocolEntry, 'id' | 'timestamp'>) => {
    if (editingProtocol) {
      setProtocolEntries((prev) =>
        prev.map((p) =>
          p.id === editingProtocol.id
            ? {
                ...p,
                ...entry,
                timestamp: new Date(`${entry.dateIso}T${entry.time}:00`).getTime() || p.timestamp
              }
            : p
        )
      );
      setEditingProtocol(null);
    } else {
      const newEntry: CalendarProtocolEntry = {
        ...entry,
        id: String(Date.now()),
        timestamp: new Date(`${entry.dateIso}T${entry.time}:00`).getTime() || Date.now()
      };
      setProtocolEntries((prev) => [newEntry, ...prev]);
    }
  };

  const handleDeleteProtocol = (id: string) => {
    setProtocolEntries((prev) => prev.filter((p) => p.id !== id));
  };

  // ==========================================
  // HANDLERS: TEMPLATES & IMPORT
  // ==========================================
  const handleCreatePlan = () => {
    if (!newPlanName.trim()) {
      alert('Wprowadź nazwę planu.');
      return;
    }
    const newTpl: WorkoutTemplate = {
      id: String(Date.now()),
      name: newPlanName.trim(),
      description: `Plan dla partii: ${newPlanCategory}`,
      exerciseCount: 1,
      exercises: [{ name: 'Ćwiczenie bazowe', category: newPlanCategory, setsCount: 3 }]
    };
    setUserPlans((prev) => [newTpl, ...prev]);
    setNewPlanName('');
    setShowCreatePlanModal(false);
  };

  // Protocols for selected day on dashboard
  const selectedDayProtocols = useMemo(() => {
    return protocolEntries.filter((p) => p.dateIso === selectedDayIso);
  }, [protocolEntries, selectedDayIso]);

  // Actual workout sessions for selected day
  const selectedDaySessions = useMemo(() => {
    return workoutSessions.filter((s) => s.dateIso === selectedDayIso);
  }, [workoutSessions, selectedDayIso]);

  const deletingProtocolItem = useMemo(() => {
    return protocolEntries.find((p) => p.id === deletingProtocolId);
  }, [protocolEntries, deletingProtocolId]);

  return (
    <div className="min-h-screen bg-[#07090D] text-[#F8FAFC] flex justify-center selection:bg-[#00E676] selection:text-black">
      {/* Mobile container simulating Xiaomi 14T frame in Obsidian Dark aesthetic */}
      <div className="w-full max-w-md min-h-screen bg-[#0A0D14] flex flex-col relative shadow-2xl border-x border-[#222B3D]">
        {/* Top App Bar */}
        <M3TopAppBar
          proposalLabel="PlanPasika"
          onOpenLibrary={() => setShowImportDialog(true)}
          onOpenSettings={() => setShowSettingsDialog(true)}
        />

        {/* Dynamic Main Body Content Based on Active Tab */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4 pb-24">
          {/* ========================================================= */}
          {/* 1. TAB: DZISIAJ (GŁÓWNY PULPIT OPERACYJNY)                */}
          {/* ========================================================= */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              {/* Header: Dynamic Date from device clock */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
                  PULPIT OPERACYJNY • XIAOMI 14T
                </span>
                <h1 className="text-xl font-black text-white capitalize">
                  {getTodayFormattedPolish()}
                </h1>
              </div>

              {/* Horizontal 7-Day Selector Strip */}
              <div className="bg-[#171B24] border border-[#222B3D] p-2.5 rounded-2xl space-y-1.5 shadow-md">
                <div className="flex items-center justify-between text-[11px] px-1">
                  <span className="font-bold text-[#94A3B8]">Bieżący Tydzień</span>
                  <span className="text-[10px] text-[#64748B] font-mono">1 trening/dzień</span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day) => {
                    const isSelected = day.dateIso === selectedDayIso;
                    const hasSession = workoutSessions.some((s) => s.dateIso === day.dateIso);
                    const dayType = dayTypesMap[day.dateIso];

                    return (
                      <button
                        key={day.dateIso}
                        onClick={() => setSelectedDayIso(day.dateIso)}
                        className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#00E676] text-black font-extrabold shadow-md'
                            : day.isToday
                            ? 'bg-[#212735] border border-[#00E676]/60 text-white'
                            : 'bg-[#0F1218] text-[#94A3B8] hover:text-white border border-[#222B3D]'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold">{day.dayOfWeekName.slice(0, 2)}</span>
                        <span className="text-xs font-black">{day.dayOfMonth}</span>
                        <div className="flex items-center gap-0.5 mt-1">
                          {hasSession && <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />}
                          {dayType === 'ASSIGNED_WORKOUT' && !hasSession && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          )}
                          {day.isToday && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Type Selector (Strictly separate from status) */}
              <div className="bg-[#171B24] border border-[#222B3D] p-4 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Typ Dnia ({selectedDayIso})
                  </h2>
                  <span className="text-[10px] text-[#64748B]">Harmonogram bazowy</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 bg-[#0F1218] p-1.5 rounded-xl border border-[#222B3D]">
                  {(['ASSIGNED_WORKOUT', 'REST_DAY', 'NO_PLAN'] as DayPlanType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleSetDayType(type)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                        currentDayType === type
                          ? 'bg-[#212735] text-[#00E676] border border-[#00E676]/50 shadow-sm'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {type === 'ASSIGNED_WORKOUT' ? 'Trening' : type === 'REST_DAY' ? 'Dzień wolny' : 'Brak planu'}
                    </button>
                  ))}
                </div>

                {currentDayType === 'NO_PLAN' && (
                  <div className="p-3 bg-[#0F1218] rounded-xl border border-[#222B3D] text-center space-y-1">
                    <span className="text-xs font-bold text-[#94A3B8] block">Brak przypisanego planu na ten dzień</span>
                    <p className="text-[10px] text-[#64748B]">
                      Wybierz typ dnia powyżej lub przydziel szablon w module Harmonogramu.
                    </p>
                  </div>
                )}
              </div>

              {/* Manual Status Rozliczenia Dnia (Strictly manual, never auto) */}
              <div className="bg-[#171B24] border border-[#222B3D] p-4 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Ręczny Status Rozliczenia
                    </h3>
                    <span className="text-[10px] text-[#94A3B8]">Status ustala wyłącznie użytkownik</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentDayStatus === 'WYKONANY'
                        ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40'
                        : currentDayStatus === 'NIEWYKONANY'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {currentDayStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSetDayStatus('WYKONANY')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      currentDayStatus === 'WYKONANY'
                        ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                        : 'bg-[#0F1218] border-[#222B3D] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Wykonany</span>
                  </button>

                  <button
                    onClick={() => handleSetDayStatus('NIEWYKONANY')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      currentDayStatus === 'NIEWYKONANY'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-[#0F1218] border-[#222B3D] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Niewykonany</span>
                  </button>

                  <button
                    onClick={() => handleSetDayStatus('NIEROZSTRZYGNIETY')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      currentDayStatus === 'NIEROZSTRZYGNIETY'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#0F1218] border-[#222B3D] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Nierozstrzyg.</span>
                  </button>
                </div>

                {/* Warning action for marking completed without session */}
                <button
                  onClick={() => setShowWarningNoSession(true)}
                  className="w-full text-center text-[10px] text-amber-400 hover:underline pt-1 block"
                >
                  ⚠️ Oznacz jako wykonany bez rejestracji sesji (z ostrzeżeniem)...
                </button>
              </div>

              {/* Quick Workout Launcher */}
              <div className="bg-[#171B24] border border-[#222B3D] p-4 rounded-2xl flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00E676]/20 border border-[#00E676]/40 flex items-center justify-center text-[#00E676]">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Sala Treningowa</h3>
                    <span className="text-[10px] text-[#94A3B8]">
                      {isSessionActive
                        ? 'Sesja w toku'
                        : selectedDaySessions.length > 0
                        ? `${selectedDaySessions.length} zapisana sesja (${selectedDaySessions[0].totalTonnageKg} kg)`
                        : 'Brak aktywnej sesji'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={isSessionActive ? () => setActiveTab('workout') : handleStartSession}
                  className="bg-[#00E676] hover:bg-[#00c864] text-black font-extrabold text-xs py-2 px-3.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {isSessionActive ? 'Wznów sesję' : 'Rozpocznij'}
                </button>
              </div>

              {/* Daily Note & Protocols/Substances for Selected Day */}
              <div className="bg-[#171B24] border border-[#222B3D] p-4 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Dziennik i Cykle / Protokoły
                  </h3>
                  <button
                    onClick={() => {
                      setEditingProtocol(null);
                      setProtocolModalOpen(true);
                    }}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Dodaj wpis cyklu</span>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Własna notatka samopoczucia/regeneracji..."
                  value={currentDayNote}
                  onChange={(e) => handleSetDayNote(e.target.value)}
                  className="w-full bg-[#0F1218] border border-[#222B3D] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676]"
                />

                {selectedDayProtocols.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {selectedDayProtocols.map((p) => (
                      <div
                        key={p.id}
                        className="bg-[#0F1218] p-2 rounded-xl border border-purple-500/30 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-purple-400" />
                          <span className="font-bold text-purple-300">{p.title}</span>
                          {p.dosageOrInfo && (
                            <span className="text-[10px] text-[#94A3B8]">({p.dosageOrInfo})</span>
                          )}
                          <span className="text-[9px] text-[#64748B] font-mono">{p.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingProtocol(p);
                              setProtocolModalOpen(true);
                            }}
                            className="p-1 text-[#94A3B8] hover:text-white"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeletingProtocolId(p.id)}
                            className="p-1 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. TAB: HARMONOGRAM I PLANY (KOMPAS TYGODNIA)             */}
          {/* ========================================================= */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
                  WSPÓLNE ŹRÓDŁO HARMONOGRAMU • XIAOMI 14T
                </span>
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-black text-white">Harmonogram i Plany</h1>
                  <button
                    onClick={() => setShowCopyWeekModal(true)}
                    className="bg-[#212735] hover:bg-[#2C3548] border border-[#222B3D] text-[#00E676] text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopiuj tydzień</span>
                  </button>
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="bg-[#171B24] border border-[#222B3D] p-1.5 rounded-2xl flex">
                <button
                  onClick={() => setScheduleViewMode('WEEK')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    scheduleViewMode === 'WEEK'
                      ? 'bg-[#00E676] text-black shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Tydzień (Pionowy)
                </button>
                <button
                  onClick={() => setScheduleViewMode('MONTH')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    scheduleViewMode === 'MONTH'
                      ? 'bg-[#00E676] text-black shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Miesiąc
                </button>
                <button
                  onClick={() => setScheduleViewMode('TEMPLATES')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    scheduleViewMode === 'TEMPLATES'
                      ? 'bg-[#00E676] text-black shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Szablony
                </button>
              </div>

              {/* WEEK VIEW: Vertical days list */}
              {scheduleViewMode === 'WEEK' && (
                <div className="space-y-2">
                  {weekDays.map((day) => {
                    const session = workoutSessions.find((s) => s.dateIso === day.dateIso);
                    const dayType = dayTypesMap[day.dateIso] || 'NO_PLAN';

                    return (
                      <div
                        key={day.dateIso}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          day.isToday ? 'bg-[#171B24] border-[#00E676]' : 'bg-[#171B24] border-[#222B3D]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{day.dayOfWeekName}</span>
                            <span className="text-[10px] text-[#64748B] font-mono">{day.dateIso}</span>
                            {day.isToday && (
                              <span className="text-[9px] bg-[#00E676] text-black font-extrabold px-1.5 py-0.2 rounded-full">
                                DZIŚ
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {session ? (
                              <span className="text-[10px] text-[#00E676] bg-[#00E676]/15 px-2 py-0.5 rounded-lg border border-[#00E676]/30 font-bold">
                                Sesja: {session.totalTonnageKg} kg
                              </span>
                            ) : dayType === 'ASSIGNED_WORKOUT' ? (
                              <span className="text-[10px] text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                                Zaplanowany trening
                              </span>
                            ) : dayType === 'REST_DAY' ? (
                              <span className="text-[10px] text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded-lg border border-blue-500/30">
                                Dzień wolny
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#94A3B8] bg-[#0F1218] px-2 py-0.5 rounded-lg border border-[#222B3D]">
                                Brak planu
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MONTH VIEW: Simple Calendar Grid */}
              {scheduleViewMode === 'MONTH' && (
                <div className="bg-[#171B24] border border-[#222B3D] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Kalendarz Miesiąca</span>
                    <span className="text-[10px] text-[#00E676]">Widok zsynchronizowany</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
                      <span key={d} className="text-[10px] text-[#64748B] font-bold py-1">
                        {d}
                      </span>
                    ))}
                    {weekDays.map((d) => {
                      const hasSession = workoutSessions.some((s) => s.dateIso === d.dateIso);
                      return (
                        <div
                          key={d.dateIso}
                          className={`p-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center ${
                            d.isToday
                              ? 'bg-[#00E676] text-black border-[#00E676]'
                              : 'bg-[#0F1218] text-[#94A3B8] border-[#222B3D]'
                          }`}
                        >
                          <span>{d.dayOfMonth}</span>
                          {hasSession && <span className="w-1 h-1 rounded-full bg-[#00E676] mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TEMPLATES VIEW */}
              {scheduleViewMode === 'TEMPLATES' && (
                <div className="bg-[#171B24] border border-[#222B3D] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white">Baza Szablonów Treningowych</h3>
                    <button
                      onClick={() => setShowCreatePlanModal(true)}
                      className="bg-[#00E676] text-black text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Nowy szablon</span>
                    </button>
                  </div>

                  {userPlans.length === 0 ? (
                    <div className="p-6 bg-[#0F1218] rounded-xl border border-[#222B3D] text-center space-y-1">
                      <span className="text-xs font-bold text-[#94A3B8] block">Brak szablonów treningowych</span>
                      <p className="text-[10px] text-[#64748B]">
                        Utwórz własny plan treningowy przypisany do 7 zatwierdzonych kategorii anatomicznych.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userPlans.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 bg-[#0F1218] rounded-xl border border-[#222B3D] flex items-center justify-between"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-white">{p.name}</h4>
                            <span className="text-[10px] text-[#00E676]">{p.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. TAB: TRENING (SALA TRENINGOWA / FOCUS)                  */}
          {/* ========================================================= */}
          {activeTab === 'workout' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
                  SALA TRENINGOWA • FOCUS
                </span>
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-black text-white">Sesja Treningowa</h1>
                  {isSessionActive && (
                    <button
                      onClick={() => setShowEndSessionDialog(true)}
                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold py-1.5 px-3 rounded-xl"
                    >
                      Zakończ sesję
                    </button>
                  )}
                </div>
              </div>

              {!isSessionActive ? (
                <div className="bg-[#171B24] border border-[#222B3D] rounded-2xl p-8 text-center space-y-3 shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-[#0F1218] border border-[#222B3D] flex items-center justify-center mx-auto text-[#00E676]">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Brak Aktywnej Sesji</h3>
                    <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">
                      Stan neutralny. Rozpocznij sesję, aby zapisywać ukończone serie i powtórzenia do lokalnej bazy Room.
                    </p>
                  </div>
                  <button
                    onClick={handleStartSession}
                    className="bg-[#00E676] hover:bg-[#00c864] text-black font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Rozpocznij nową sesję
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Rest Timer (Etap 4A) */}
                  <RestTimerSection
                    remainingSeconds={restTimerRemaining}
                    totalSeconds={restTimerTotal}
                    isRunning={isRestTimerRunning}
                    isFinished={isRestTimerFinished}
                    onStartPreset={handleStartRestTimer}
                    onAdjust={handleAdjustRestTimer}
                    onPause={handlePauseRestTimer}
                    onResume={handleResumeRestTimer}
                    onReset={handleResetRestTimer}
                  />

                  {/* Active Exercise Card */}
                  <div className="bg-[#171B24] border border-[#00E676] rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#00E676] font-mono font-bold uppercase block">
                          Bieżące ćwiczenie ({currentCategory})
                        </span>
                        <h2 className="text-sm font-black text-white">{currentExerciseName}</h2>
                      </div>
                      <button
                        onClick={() => setShowReplaceExerciseModal(true)}
                        className="bg-[#212735] hover:bg-[#2C3548] text-white border border-[#222B3D] text-[10px] font-bold py-1.5 px-2.5 rounded-xl flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 text-[#00E676]" />
                        <span>Zastąp ćwiczenie</span>
                      </button>
                    </div>

                    {/* Set Input Fields (Strictly Weight & Reps only) */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-[#0F1218] p-3 rounded-xl border border-[#222B3D] space-y-1">
                        <span className="text-[10px] text-[#94A3B8] font-bold block">Ciężar (kg)</span>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setInputWeight((w) => Math.max(0, w - 2.5))}
                            className="w-7 h-7 rounded-lg bg-[#212735] text-white flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="text-base font-black text-white font-mono">{inputWeight}</span>
                          <button
                            onClick={() => setInputWeight((w) => w + 2.5)}
                            className="w-7 h-7 rounded-lg bg-[#212735] text-white flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#0F1218] p-3 rounded-xl border border-[#222B3D] space-y-1">
                        <span className="text-[10px] text-[#94A3B8] font-bold block">Powtórzenia</span>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setInputReps((r) => Math.max(1, r - 1))}
                            className="w-7 h-7 rounded-lg bg-[#212735] text-white flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="text-base font-black text-white font-mono">{inputReps}</span>
                          <button
                            onClick={() => setInputReps((r) => r + 1)}
                            className="w-7 h-7 rounded-lg bg-[#212735] text-white flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveSet}
                      className="w-full py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Zapisz ukończoną serię #{currentSets.length + 1}</span>
                    </button>
                  </div>

                  {/* Registered Sets Table */}
                  <div className="bg-[#171B24] border border-[#222B3D] rounded-2xl p-4 space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Zarejestrowane Serie w Tej Sesji ({currentSets.length})
                    </h3>

                    {currentSets.length === 0 ? (
                      <span className="text-xs text-[#64748B] block text-center py-2">
                        Brak zarejestrowanych serii. Wprowadź dane powyżej.
                      </span>
                    ) : (
                      <div className="space-y-1.5">
                        {currentSets.map((s) => (
                          <div
                            key={s.id}
                            className="bg-[#0F1218] p-2.5 rounded-xl border border-[#222B3D] flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-[#00E676] font-mono">Seria {s.setNumber}</span>
                            <span className="text-white font-mono">{s.weightKg} kg</span>
                            <span className="text-[#94A3B8] font-mono">{s.reps} powt.</span>
                            <span className="text-[10px] text-emerald-400 font-bold">✓ Zapisana</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. TAB: DZIENNIK / KALENDARZ (CHRONOLOGIA ZDARZEŃ)       */}
          {/* ========================================================= */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
                  DZIENNIK ZDARZEŃ • KALENDARZ
                </span>
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-black text-white">Dziennik i Cykle</h1>
                  <button
                    onClick={() => {
                      setEditingProtocol(null);
                      setProtocolModalOpen(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Nowy wpis cyklu</span>
                  </button>
                </div>
              </div>

              {/* 4 Entity Types Legend */}
              <div className="bg-[#171B24] border border-[#222B3D] p-3 rounded-2xl flex flex-wrap gap-2 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Planowany trening
                </span>
                <span className="flex items-center gap-1 text-[#00E676]">
                  <span className="w-2 h-2 rounded-full bg-[#00E676]" /> Zapisana sesja
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> Wpis cyklu/protokołu
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-300" /> Notatka dnia
                </span>
              </div>

              {/* Timeline list of days */}
              <div className="space-y-3">
                {weekDays.map((d) => {
                  const daySession = workoutSessions.filter((s) => s.dateIso === d.dateIso);
                  const dayProtocols = protocolEntries.filter((p) => p.dateIso === d.dateIso);
                  const note = dayNotesMap[d.dateIso] || '';
                  const dayType = dayTypesMap[d.dateIso];

                  return (
                    <div
                      key={d.dateIso}
                      className="bg-[#171B24] border border-[#222B3D] rounded-2xl p-4 space-y-2.5 shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{d.dayOfWeekName}</span>
                          <span className="text-[10px] text-[#64748B] font-mono">{d.dateIso}</span>
                          {d.isToday && (
                            <span className="text-[9px] bg-[#00E676] text-black font-extrabold px-1.5 py-0.2 rounded-full">
                              DZIŚ
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setEditingProtocol(null);
                            setSelectedDayIso(d.dateIso);
                            setProtocolModalOpen(true);
                          }}
                          className="text-[10px] text-purple-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Wpis cyklu</span>
                        </button>
                      </div>

                      {/* 1. Planned Workout Info */}
                      {dayType === 'ASSIGNED_WORKOUT' && (
                        <div className="p-2 bg-[#0F1218] rounded-xl border border-cyan-500/30 flex items-center justify-between text-xs">
                          <span className="text-cyan-400 font-bold">Zaplanowany trening</span>
                          <span className="text-[10px] text-[#64748B]">z harmonogramu</span>
                        </div>
                      )}

                      {/* 2. Actual Performed Workout Sessions */}
                      {daySession.map((sess) => (
                        <div
                          key={sess.id}
                          className="p-2.5 bg-[#0F1218] rounded-xl border border-[#00E676]/40 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-black text-[#00E676] block">{sess.workoutName}</span>
                            <span className="text-[10px] text-[#94A3B8]">
                              {sess.sets.length} serii • {sess.totalTonnageKg} kg • {sess.startTime} - {sess.endTime}
                            </span>
                          </div>
                          <span className="text-[10px] bg-[#00E676]/20 text-[#00E676] px-2 py-0.5 rounded-full font-bold">
                            Zrealizowano
                          </span>
                        </div>
                      ))}

                      {/* 3. Protocol / Supplement Entries */}
                      {dayProtocols.map((prot) => (
                        <div
                          key={prot.id}
                          className="p-2 bg-[#0F1218] rounded-xl border border-purple-500/30 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Pill className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-bold text-purple-300">{prot.title}</span>
                            {prot.dosageOrInfo && (
                              <span className="text-[10px] text-[#94A3B8]">({prot.dosageOrInfo})</span>
                            )}
                            <span className="text-[10px] text-[#64748B] font-mono">{prot.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingProtocol(prot);
                                setProtocolModalOpen(true);
                              }}
                              className="p-1 text-[#94A3B8] hover:text-white"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeletingProtocolId(prot.id)}
                              className="p-1 text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* 4. Daily Note */}
                      <input
                        type="text"
                        placeholder="Dodaj notatkę samopoczucia / regeneracji..."
                        value={note}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDayNotesMap((prev) => ({ ...prev, [d.dateIso]: val }));
                        }}
                        className="w-full bg-[#0F1218] border border-[#222B3D] rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676]"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. TAB: ANALIZY (POMIARY + 7 PARTII + REKORDY PR)        */}
          {/* ========================================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
                  RZETELNE ANALIZY • BEZ ZGADYWANIA
                </span>
                <h1 className="text-xl font-black text-white">Centrum Analityczne</h1>
              </div>

              {/* Subtabs Selector: Pomiary / Partie Mięśniowe / Podsumowanie & PR */}
              <div className="bg-[#171B24] border border-[#222B3D] p-1.5 rounded-2xl flex">
                <button
                  onClick={() => setAnalyticsSubTab('MEASUREMENTS')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    analyticsSubTab === 'MEASUREMENTS'
                      ? 'bg-[#00E676] text-black shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Pomiary</span>
                </button>

                <button
                  onClick={() => setAnalyticsSubTab('MUSCLES')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    analyticsSubTab === 'MUSCLES'
                      ? 'bg-[#00E676] text-black shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>7 Partii</span>
                </button>

                <button
                  onClick={() => setAnalyticsSubTab('SUMMARY')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    analyticsSubTab === 'SUMMARY'
                      ? 'bg-[#00E676] text-black shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Rekordy PR</span>
                </button>
              </div>

              {/* SECTION 1: MEASUREMENTS */}
              {analyticsSubTab === 'MEASUREMENTS' && (
                <MeasurementsSection
                  measurements={measurements}
                  onAddMeasurement={handleAddMeasurement}
                  onEditMeasurement={handleEditMeasurement}
                  onDeleteMeasurement={handleDeleteMeasurement}
                />
              )}

              {/* SECTION 2: 7 MUSCLE GROUPS */}
              {analyticsSubTab === 'MUSCLES' && (
                <div className="space-y-3">
                  {/* Time Range Filter */}
                  <div className="bg-[#171B24] border border-[#222B3D] p-1.5 rounded-2xl flex">
                    {(['WEEK', 'MONTH', 'ALL'] as const).map((rng) => (
                      <button
                        key={rng}
                        onClick={() => setMuscleTimeRange(rng)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          muscleTimeRange === rng
                            ? 'bg-[#00E676] text-black shadow-md'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        {rng === 'WEEK' ? 'Tydzień' : rng === 'MONTH' ? 'Miesiąc' : 'Wszystko'}
                      </button>
                    ))}
                  </div>

                  <MuscleGroupsSection
                    sessions={workoutSessions}
                    timeRange={muscleTimeRange}
                  />
                </div>
              )}

              {/* SECTION 3: RECORDS AND SUMMARY */}
              {analyticsSubTab === 'SUMMARY' && (
                <RecordsAndSummarySection sessions={workoutSessions} />
              )}
            </div>
          )}
        </main>

        {/* Material 3 Bottom Navigation Bar */}
        <M3BottomNavBar activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

        {/* ========================================================= */}
        {/* MODALE I DIALOGI                                          */}
        {/* ========================================================= */}

        {/* Warning Dialog for Marking Completed Without Session */}
        <WarningDialog
          isOpen={showWarningNoSession}
          title="Oznaczenie bez sesji treningowej"
          message="Potwierdzasz oznaczenie dnia jako Wykonany bez zarejestrowania sesji treningowej. Pamiętaj, że taka operacja nie doda danych objętościowych do modułu Analiz."
          onConfirm={() => {
            handleSetDayStatus('WYKONANY');
            setShowWarningNoSession(false);
          }}
          onCancel={() => setShowWarningNoSession(false)}
        />

        {/* Protocol Manual Modal (Calendar / Day view) */}
        <CalendarProtocolModal
          isOpen={protocolModalOpen}
          initialEntry={editingProtocol}
          defaultDateIso={selectedDayIso}
          onClose={() => {
            setProtocolModalOpen(false);
            setEditingProtocol(null);
          }}
          onSave={handleSaveProtocol}
        />

        {/* Delete Protocol Confirmation */}
        <ConfirmDeleteDialog
          isOpen={Boolean(deletingProtocolId)}
          title="Usuwanie Wpisu Cyklu"
          message="Czy na pewno chcesz usunąć ten wpis z dziennika? Dane nie zostaną przywrócone."
          itemDescription={
            deletingProtocolItem
              ? `${deletingProtocolItem.title} (${deletingProtocolItem.dateIso} ${deletingProtocolItem.time})`
              : undefined
          }
          onConfirm={() => {
            if (deletingProtocolId) {
              handleDeleteProtocol(deletingProtocolId);
              setDeletingProtocolId(null);
            }
          }}
          onCancel={() => setDeletingProtocolId(null)}
        />

        {/* Replace Exercise Dialog */}
        <ReplaceExerciseDialog
          isOpen={showReplaceExerciseModal}
          currentExerciseName={currentExerciseName}
          completedSetsCount={currentSets.length}
          remainingSetsCount={1}
          availableExercises={exerciseLibrary}
          onConfirmReplace={handleReplaceExercise}
          onClose={() => setShowReplaceExerciseModal(false)}
        />

        {/* Confirm Copy Week Dialog */}
        <ConfirmCopyWeekDialog
          isOpen={showCopyWeekModal}
          onClose={() => setShowCopyWeekModal(false)}
          onConfirmCopy={() => {
            alert('Pomyślnie skopiowano harmonogram na kolejny tydzień.');
            setShowCopyWeekModal(false);
          }}
        />

        {/* Selective GymTracker Import Dialog */}
        <GymTrackerImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onConfirmImport={(newEx) => {
            setExerciseLibrary((prev) => [...prev, ...newEx]);
            alert(`Pomyślnie zaimportowano ${newEx.length} ćwiczeń do lokalnej bazy.`);
          }}
        />

        {/* Backup & Settings Dialog */}
        <BackupSettingsDialog
          isOpen={showSettingsDialog}
          onClose={() => setShowSettingsDialog(false)}
          onOpenImport={() => {
            setShowSettingsDialog(false);
            setShowImportDialog(true);
          }}
        />

        {/* End Session Confirmation Dialog */}
        {showEndSessionDialog && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
            <div className="bg-[#171B24] border border-[#222B3D] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold text-white">Zakończyć sesję treningową?</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Zarejestrowano {currentSets.length} serii. Dane zostaną zachowane w bazie Room i zasilą wykresy tonażu oraz 1RM.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleEndSession}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold shadow-md"
                >
                  Zapisz i zakończ trening
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEndSessionDialog(false)}
                    className="flex-1 py-2 px-3 rounded-xl border border-[#222B3D] text-xs font-semibold text-[#94A3B8]"
                  >
                    Kontynuuj
                  </button>
                  <button
                    onClick={handleDiscardSession}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold"
                  >
                    Porzuć szkic
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Nowy Plan */}
        {showCreatePlanModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
            <div className="bg-[#171B24] border border-[#222B3D] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold text-white">Nowy Szablon Treningowy</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nazwa planu..."
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full bg-[#0F1218] border border-[#222B3D] rounded-xl p-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676]"
                />
                <select
                  value={newPlanCategory}
                  onChange={(e) => setNewPlanCategory(e.target.value)}
                  className="w-full bg-[#0F1218] border border-[#222B3D] rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00E676]"
                >
                  {APPROVED_EXERCISE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreatePlanModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#222B3D] text-xs font-semibold text-[#94A3B8]"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleCreatePlan}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#00E676] text-black text-xs font-bold"
                >
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
