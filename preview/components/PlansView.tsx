import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Play,
  ChevronLeft,
  ChevronRight,
  Moon,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  RotateCw,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  DayScheduleEntry,
  WorkoutTemplate,
  CompletionStatus,
  DayPlanType
} from '../data/sampleData';

interface PlansViewProps {
  entries: DayScheduleEntry[];
  templates: WorkoutTemplate[];
  onStartSession: (workoutName: string) => void;
  onUpdateDay: (updated: DayScheduleEntry) => void;
  onAdvanceRotation: () => void;
  onSkipRotation: () => void;
}

const SHORT_DAY_NAMES = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'];

export const PlansView: React.FC<PlansViewProps> = ({
  entries = [],
  templates = [],
  onStartSession,
  onUpdateDay,
  onAdvanceRotation,
  onSkipRotation
}) => {
  const [viewMode, setViewMode] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(
    entries[0]?.dateIso || '2026-09-21'
  );

  // Modals & Confirmation state
  const [showAssignModalForDay, setShowAssignModalForDay] = useState<DayScheduleEntry | null>(null);
  const [pendingOverwrite, setPendingOverwrite] = useState<{
    day: DayScheduleEntry;
    newType: DayPlanType;
    templateId: string | null;
    templateName: string | null;
  } | null>(null);

  const [warningNoSessionDay, setWarningNoSessionDay] = useState<DayScheduleEntry | null>(null);

  // Safe chunking of schedule entries into 7-day weeks
  const weekChunks: DayScheduleEntry[][] = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    const chunks: DayScheduleEntry[][] = [];
    for (let i = 0; i < entries.length; i += 7) {
      chunks.push(entries.slice(i, i + 7));
    }
    return chunks;
  }, [entries]);

  // Safe bounds check for selectedWeekIdx
  const safeWeekIdx = Math.min(Math.max(0, selectedWeekIdx), Math.max(0, weekChunks.length - 1));
  const currentWeekEntries = weekChunks[safeWeekIdx] || weekChunks[0] || [];

  // Determine currently selected day with safe fallback
  const selectedDay = useMemo(() => {
    return (
      entries.find((e) => e.dateIso === selectedDateIso) ||
      currentWeekEntries[0] ||
      entries[0] ||
      null
    );
  }, [entries, selectedDateIso, currentWeekEntries]);

  // Find assigned template if present
  const assignedTemplate = useMemo(() => {
    if (!selectedDay || !selectedDay.workoutTemplateId) return null;
    return templates.find((t) => t.id === selectedDay.workoutTemplateId) || null;
  }, [selectedDay, templates]);

  const handleDaySelect = (day: DayScheduleEntry) => {
    setSelectedDateIso(day.dateIso);
  };

  const handleStatusChange = (status: CompletionStatus) => {
    if (!selectedDay) return;
    if (status === 'WYKONANY' && !selectedDay.hasActualSession) {
      setWarningNoSessionDay(selectedDay);
    } else {
      onUpdateDay({
        ...selectedDay,
        status
      });
    }
  };

  const handleRequestAssignTemplate = (template: WorkoutTemplate) => {
    if (!selectedDay) return;
    setShowAssignModalForDay(null);

    // If day already had an assigned workout or rest day, require confirmation
    if (selectedDay.dayType !== 'NO_PLAN') {
      setPendingOverwrite({
        day: selectedDay,
        newType: 'ASSIGNED_WORKOUT',
        templateId: template.id,
        templateName: template.name
      });
    } else {
      onUpdateDay({
        ...selectedDay,
        dayType: 'ASSIGNED_WORKOUT',
        workoutTemplateId: template.id,
        workoutName: template.name
      });
    }
  };

  const handleRequestRestDay = () => {
    if (!selectedDay) return;
    if (selectedDay.dayType !== 'NO_PLAN') {
      setPendingOverwrite({
        day: selectedDay,
        newType: 'REST_DAY',
        templateId: null,
        templateName: null
      });
    } else {
      onUpdateDay({
        ...selectedDay,
        dayType: 'REST_DAY',
        workoutTemplateId: null,
        workoutName: null
      });
    }
  };

  const handleRequestNoPlan = () => {
    if (!selectedDay) return;
    if (selectedDay.dayType !== 'NO_PLAN') {
      setPendingOverwrite({
        day: selectedDay,
        newType: 'NO_PLAN',
        templateId: null,
        templateName: null
      });
    } else {
      onUpdateDay({
        ...selectedDay,
        dayType: 'NO_PLAN',
        workoutTemplateId: null,
        workoutName: null
      });
    }
  };

  const executePendingOverwrite = () => {
    if (!pendingOverwrite) return;
    onUpdateDay({
      ...pendingOverwrite.day,
      dayType: pendingOverwrite.newType,
      workoutTemplateId: pendingOverwrite.templateId,
      workoutName: pendingOverwrite.templateName
    });
    setPendingOverwrite(null);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Bar with View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
            Harmonogram & Plany
          </h2>
          <p className="text-xs text-[#94A3B8]">Cykl Siłowy: Jesień 2026 (Rotacja 4-dniowa)</p>
        </div>

        {/* Week / Month Toggle */}
        <div className="bg-[#181E29] border border-[#2C384E] p-1 rounded-xl flex">
          <button
            onClick={() => setViewMode('WEEK')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'WEEK'
                ? 'bg-emerald-500 text-[#0F1218] shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Tydzień
          </button>
          <button
            onClick={() => setViewMode('MONTH')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'MONTH'
                ? 'bg-emerald-500 text-[#0F1218] shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Miesiąc
          </button>
        </div>
      </div>

      {/* Rotation Status Bar */}
      <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl p-3.5 flex items-center justify-between shadow-md">
        <div>
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-semibold">
            Kolejny w rotacji:
          </span>
          <span className="text-sm font-bold text-white">Push A (Klatka + Barki)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSkipRotation}
            className="text-xs text-[#94A3B8] hover:text-white bg-[#1F2736] hover:bg-[#2C384E] px-2.5 py-1.5 rounded-lg border border-[#2C384E] transition-colors"
          >
            Pomiń
          </button>
          <button
            onClick={onAdvanceRotation}
            className="text-xs text-emerald-400 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-1 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Przesuń
          </button>
        </div>
      </div>

      {/* ----------------- WEEK VIEW ----------------- */}
      {viewMode === 'WEEK' ? (
        <div className="space-y-3">
          {/* Week Navigation Header */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => {
                if (safeWeekIdx > 0) {
                  const nextIdx = safeWeekIdx - 1;
                  setSelectedWeekIdx(nextIdx);
                  const firstDay = weekChunks[nextIdx]?.[0];
                  if (firstDay) setSelectedDateIso(firstDay.dateIso);
                }
              }}
              disabled={safeWeekIdx === 0}
              className="p-1.5 rounded-lg bg-[#181E29] border border-[#2C384E] text-[#94A3B8] disabled:opacity-30 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-xs font-bold text-white">
                Tydzień {safeWeekIdx + 1} • ({currentWeekEntries[0]?.dateIso.slice(5).replace('-', '.')} — {currentWeekEntries[currentWeekEntries.length - 1]?.dateIso.slice(5).replace('-', '.')})
              </span>
            </div>

            <button
              onClick={() => {
                if (safeWeekIdx < weekChunks.length - 1) {
                  const nextIdx = safeWeekIdx + 1;
                  setSelectedWeekIdx(nextIdx);
                  const firstDay = weekChunks[nextIdx]?.[0];
                  if (firstDay) setSelectedDateIso(firstDay.dateIso);
                }
              }}
              disabled={safeWeekIdx >= weekChunks.length - 1}
              className="p-1.5 rounded-lg bg-[#181E29] border border-[#2C384E] text-[#94A3B8] disabled:opacity-30 hover:text-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal 7-Day Bar (Pon - Niedz) */}
          <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl p-2 shadow-lg">
            <div className="grid grid-cols-7 gap-1.5">
              {currentWeekEntries.map((day, idx) => {
                const isSelected = day.dateIso === selectedDay?.dateIso;
                const shortDayLabel = SHORT_DAY_NAMES[idx] || day.dayOfWeekName.slice(0, 3);
                const shortDate = day.dateIso.slice(5).replace('-', '.'); // np. 21.09

                const shortTitle =
                  day.dayType === 'REST_DAY'
                    ? 'Wolne'
                    : day.dayType === 'NO_PLAN'
                    ? 'Brak planu'
                    : day.workoutName
                    ? day.workoutName.replace(/\s*\(.*\)/, '').slice(0, 9)
                    : 'Trening';

                // Visual differentiation based on state:
                let borderClass = 'border-[#2C384E]';
                let bgClass = 'bg-[#0F1218]';
                let textClass = 'text-[#94A3B8]';

                if (isSelected) {
                  borderClass = 'border-emerald-500 shadow-md ring-1 ring-emerald-500';
                  bgClass = 'bg-emerald-500/10';
                  textClass = 'text-emerald-400 font-bold';
                } else if (day.dayType === 'ASSIGNED_WORKOUT') {
                  borderClass = 'border-[#2C384E] hover:border-emerald-500/40';
                  bgClass = 'bg-[#1F2736]';
                  textClass = 'text-white';
                } else if (day.dayType === 'REST_DAY') {
                  borderClass = 'border-cyan-500/30';
                  bgClass = 'bg-cyan-950/20';
                  textClass = 'text-cyan-400';
                } else {
                  borderClass = 'border-[#2C384E]/40';
                  bgClass = 'bg-[#0F1218]';
                  textClass = 'text-[#64748B]';
                }

                return (
                  <button
                    key={day.dateIso}
                    onClick={() => handleDaySelect(day)}
                    className={`flex flex-col items-center justify-between py-2 px-1 rounded-xl border text-center transition-all min-h-[78px] ${borderClass} ${bgClass}`}
                  >
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                      {shortDayLabel}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">{shortDate}</span>
                    <span className={`text-[9px] font-medium truncate w-full px-0.5 ${textClass}`}>
                      {shortTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Details Card */}
          {selectedDay && (
            <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl p-4 shadow-xl space-y-4">
              {/* Day Header & Status Pill */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedDay.dayOfWeekName}, {selectedDay.dateIso}
                  </h3>
                  <div className="text-xs font-semibold">
                    {selectedDay.dayType === 'ASSIGNED_WORKOUT' && (
                      <span className="text-emerald-400 flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" /> Dzień treningowy
                      </span>
                    )}
                    {selectedDay.dayType === 'REST_DAY' && (
                      <span className="text-cyan-400 flex items-center gap-1 mt-0.5">
                        <Moon className="w-3.5 h-3.5" /> Dzień regeneracji
                      </span>
                    )}
                    {selectedDay.dayType === 'NO_PLAN' && (
                      <span className="text-[#94A3B8] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" /> Brak planu
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Chips */}
                <div className="flex items-center gap-1 bg-[#0F1218] p-1 rounded-xl border border-[#2C384E]">
                  <button
                    onClick={() => handleStatusChange('WYKONANY')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      selectedDay.status === 'WYKONANY'
                        ? 'bg-emerald-500 text-[#0F1218]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Wyk.
                  </button>
                  <button
                    onClick={() => handleStatusChange('NIEWYKONANY')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      selectedDay.status === 'NIEWYKONANY'
                        ? 'bg-red-500 text-white'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Niew.
                  </button>
                  <button
                    onClick={() => handleStatusChange('NIEROZSTRZYGNIETY')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      selectedDay.status === 'NIEROZSTRZYGNIETY'
                        ? 'bg-amber-500 text-[#0F1218]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Nier.
                  </button>
                </div>
              </div>

              <div className="h-px bg-[#2C384E]" />

              {/* Day Content according to dayType */}
              {selectedDay.dayType === 'ASSIGNED_WORKOUT' && (
                <div className="space-y-3.5">
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {selectedDay.workoutName || assignedTemplate?.name || 'Trening'}
                    </h4>
                    {assignedTemplate?.description && (
                      <p className="text-xs text-[#94A3B8] mt-0.5">{assignedTemplate.description}</p>
                    )}
                  </div>

                  {/* Start Workout Primary Action */}
                  <button
                    onClick={() => onStartSession(selectedDay.workoutName || 'Push A (Klatka + Barki)')}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0F1218] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all text-sm"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    ROZPOCZNIJ TRENING
                  </button>

                  {/* Planned Exercises List */}
                  {assignedTemplate && assignedTemplate.exercises.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block">
                        Zaplanowane ćwiczenia ({assignedTemplate.exercises.length}):
                      </span>
                      <div className="space-y-1.5">
                        {assignedTemplate.exercises.map((ex, idx) => (
                          <div
                            key={idx}
                            className="bg-[#0F1218] border border-[#2C384E] rounded-xl p-2.5 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-semibold text-white">
                                {idx + 1}. {ex.name}
                              </p>
                              <span className="text-[10px] text-cyan-400 font-medium">
                                {ex.category}
                              </span>
                            </div>
                            <span className="text-[10px] bg-[#1F2736] text-white px-2 py-1 rounded-lg border border-[#2C384E] font-bold">
                              {ex.setsCount} serie
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Edit Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => setShowAssignModalForDay(selectedDay)}
                      className="bg-[#1F2736] hover:bg-[#2C384E] text-white text-xs font-semibold py-2 rounded-xl border border-[#2C384E] transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Zmień
                    </button>
                    <button
                      onClick={handleRequestRestDay}
                      className="bg-[#1F2736] hover:bg-[#2C384E] text-cyan-400 text-xs font-semibold py-2 rounded-xl border border-cyan-500/30 transition-colors flex items-center justify-center gap-1"
                    >
                      <Moon className="w-3.5 h-3.5" />
                      Ustaw wolne
                    </button>
                    <button
                      onClick={handleRequestNoPlan}
                      className="bg-[#1F2736] hover:bg-[#2C384E] text-[#94A3B8] text-xs font-semibold py-2 rounded-xl border border-[#2C384E] transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Usuń plan
                    </button>
                  </div>
                </div>
              )}

              {selectedDay.dayType === 'REST_DAY' && (
                <div className="space-y-4">
                  <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-4 text-center space-y-1">
                    <Moon className="w-8 h-8 text-cyan-400 mx-auto mb-1" />
                    <h4 className="text-sm font-bold text-white">Dzień regeneracji (Wolne)</h4>
                    <p className="text-xs text-[#94A3B8]">
                      W tym dniu zaplanowano odpoczynek i odbudowę zasobów glikogenu.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAssignModalForDay(selectedDay)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-[#0F1218] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Przypisz trening
                    </button>
                    <button
                      onClick={handleRequestNoPlan}
                      className="flex-1 bg-[#1F2736] hover:bg-[#2C384E] text-[#94A3B8] font-semibold py-2.5 rounded-xl text-xs border border-[#2C384E] transition-colors"
                    >
                      Ustaw brak planu
                    </button>
                  </div>
                </div>
              )}

              {selectedDay.dayType === 'NO_PLAN' && (
                <div className="space-y-4">
                  <div className="bg-[#0F1218] border border-[#2C384E] rounded-2xl p-4 text-center space-y-1">
                    <Calendar className="w-8 h-8 text-[#64748B] mx-auto mb-1" />
                    <h4 className="text-sm font-bold text-white">Brak zaplanowanego treningu</h4>
                    <p className="text-xs text-[#94A3B8]">
                      Ten dzień nie ma jeszcze przypisanego treningu ani zaplanowanego odpoczynku.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAssignModalForDay(selectedDay)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-[#0F1218] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Przypisz trening
                    </button>
                    <button
                      onClick={handleRequestRestDay}
                      className="flex-1 bg-[#1F2736] hover:bg-[#2C384E] text-cyan-400 font-semibold py-2.5 rounded-xl text-xs border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Moon className="w-3.5 h-3.5" />
                      Ustaw dzień wolny
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ----------------- MONTH VIEW ----------------- */
        <div className="space-y-3">
          <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl p-4 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3">Wrzesień / Październik 2026</h3>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {SHORT_DAY_NAMES.map((d) => (
                <span key={d} className="text-[10px] text-[#94A3B8] font-bold py-1">
                  {d}
                </span>
              ))}

              {entries.map((entry) => {
                const isSelected = entry.dateIso === selectedDay?.dateIso;
                return (
                  <button
                    key={entry.dateIso}
                    onClick={() => {
                      setSelectedDateIso(entry.dateIso);
                      const weekIdx = Math.floor(entries.indexOf(entry) / 7);
                      setSelectedWeekIdx(weekIdx);
                      setViewMode('WEEK');
                    }}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center text-xs font-semibold relative transition-all ${
                      isSelected
                        ? 'border-2 border-emerald-500 bg-emerald-500/20 text-white'
                        : entry.dayType === 'ASSIGNED_WORKOUT'
                        ? 'bg-[#1F2736] text-white border border-[#2C384E]'
                        : entry.dayType === 'REST_DAY'
                        ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-500/30'
                        : 'bg-[#0F1218] text-[#94A3B8] border border-[#2C384E]/40'
                    }`}
                  >
                    <span className="text-[11px]">{entry.dateIso.slice(8)}</span>
                    <span className="text-[8px] truncate px-0.5">
                      {entry.dayType === 'REST_DAY'
                        ? 'Wolne'
                        : entry.dayType === 'NO_PLAN'
                        ? '-'
                        : entry.workoutName?.slice(0, 5) || 'Tr.'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- ASSIGN WORKOUT MODAL --- */}
      {showAssignModalForDay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white">
              Przypisz trening ({showAssignModalForDay.dayOfWeekName}, {showAssignModalForDay.dateIso})
            </h3>
            <p className="text-xs text-[#94A3B8]">Wybierz szablon do zaplanowania na ten dzień:</p>

            <div className="space-y-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleRequestAssignTemplate(tpl)}
                  className="w-full text-left bg-[#0F1218] hover:bg-[#1F2736] border border-[#2C384E] hover:border-emerald-500/50 rounded-xl p-3 transition-colors"
                >
                  <p className="text-xs font-bold text-white">{tpl.name}</p>
                  <p className="text-[10px] text-[#94A3B8]">{tpl.description}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                    {tpl.exercises.length} ćwiczeń w zestawie
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAssignModalForDay(null)}
              className="w-full bg-[#1F2736] hover:bg-[#2C384E] text-[#94A3B8] font-semibold py-2 rounded-xl text-xs transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* --- CONFIRM OVERWRITE MODAL --- */}
      {pendingOverwrite && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              Zastąpienie istniejącego planu
            </div>
            <p className="text-xs text-[#94A3B8]">
              Dla dnia <strong>{pendingOverwrite.day.dateIso}</strong> był już zaplanowany{' '}
              <strong className="text-white">
                {pendingOverwrite.day.workoutName ||
                  (pendingOverwrite.day.dayType === 'REST_DAY' ? 'Dzień wolny' : 'Plan')}
              </strong>
              . Czy na pewno chcesz go zastąpić?
            </p>
            <p className="text-[11px] text-emerald-400">
              * Dotychczasowa historia wykonanych treningów i serii pozostanie w 100% nienaruszona.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPendingOverwrite(null)}
                className="flex-1 bg-[#1F2736] hover:bg-[#2C384E] text-[#94A3B8] font-semibold py-2 rounded-xl text-xs"
              >
                Anuluj
              </button>
              <button
                onClick={executePendingOverwrite}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-[#0F1218] font-bold py-2 rounded-xl text-xs shadow-md shadow-emerald-500/20"
              >
                Tak, zastąp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- WARNING: WYKONANY BEZ SESJI --- */}
      {warningNoSessionDay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              Oznaczenie bez powiązanej sesji
            </div>
            <p className="text-xs text-[#94A3B8]">
              Oznaczasz dzień <strong>{warningNoSessionDay.dateIso}</strong> jako „Wykonany” bez rejestracji sesji treningowej. Do bazy statystyk nie zostaną dodane żadne fikcyjne serie ani objętość.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setWarningNoSessionDay(null)}
                className="flex-1 bg-[#1F2736] hover:bg-[#2C384E] text-[#94A3B8] font-semibold py-2 rounded-xl text-xs"
              >
                Anuluj
              </button>
              <button
                onClick={() => {
                  onUpdateDay({
                    ...warningNoSessionDay,
                    status: 'WYKONANY'
                  });
                  setWarningNoSessionDay(null);
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-[#0F1218] font-bold py-2 rounded-xl text-xs shadow-md shadow-emerald-500/20"
              >
                Potwierdź
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
