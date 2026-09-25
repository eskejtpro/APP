import React, { useMemo } from 'react';
import {
  Layers,
  ShieldCheck
} from 'lucide-react';
import {
  APPROVED_EXERCISE_CATEGORIES,
  CompletedWorkoutSession,
  ExerciseCategory
} from '../../data/sampleData';

interface MuscleGroupsSectionProps {
  sessions: CompletedWorkoutSession[];
  timeRange: 'WEEK' | 'MONTH' | 'ALL';
}

interface MuscleCategoryMetric {
  category: ExerciseCategory;
  setsCount: number;
  repsCount: number;
  volumeKg: number;
  sessionFrequency: number;
  distinctExercises: string[];
}

export const MuscleGroupsSection: React.FC<MuscleGroupsSectionProps> = ({
  sessions,
  timeRange
}) => {
  // Filter sessions by time range
  const filteredSessions = useMemo(() => {
    if (timeRange === 'ALL') return sessions;

    const now = new Date();
    const cutoffDate = new Date();

    if (timeRange === 'WEEK') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'MONTH') {
      cutoffDate.setDate(now.getDate() - 30);
    }

    const cutoffIso = cutoffDate.toISOString().slice(0, 10);
    return sessions.filter((s) => s.dateIso >= cutoffIso);
  }, [sessions, timeRange]);

  // Aggregate metrics across the 7 strictly approved categories
  const categoryMetrics = useMemo(() => {
    const map: Record<ExerciseCategory, MuscleCategoryMetric> = {
      'Klatka piersiowa': { category: 'Klatka piersiowa', setsCount: 0, repsCount: 0, volumeKg: 0, sessionFrequency: 0, distinctExercises: [] },
      'Plecy': { category: 'Plecy', setsCount: 0, repsCount: 0, volumeKg: 0, sessionFrequency: 0, distinctExercises: [] },
      'Barki': { category: 'Barki', setsCount: 0, repsCount: 0, volumeKg: 0, sessionFrequency: 0, distinctExercises: [] },
      'Nogi': { category: 'Nogi', setsCount: 0, repsCount: 0, volumeKg: 0, sessionFrequency: 0, distinctExercises: [] },
      'Biceps': { category: 'Biceps', setsCount: 0, repsCount: 0, volumeKg: 0, sessionFrequency: 0, distinctExercises: [] },
      'Triceps': { category: 'Triceps', setsCount: 0, repsCount: 0, volumeKg: 0, sessionFrequency: 0, distinctExercises: [] },
      'Pozostałe': { category: 'Pozostałe', setsCount: 0, repsCount: 0, volumeKg: 0, sessionFrequency: 0, distinctExercises: [] }
    };

    const sessionDatesPerCategory: Record<ExerciseCategory, Set<string>> = {
      'Klatka piersiowa': new Set(),
      'Plecy': new Set(),
      'Barki': new Set(),
      'Nogi': new Set(),
      'Biceps': new Set(),
      'Triceps': new Set(),
      'Pozostałe': new Set()
    };

    const exerciseSetsPerCategory: Record<ExerciseCategory, Set<string>> = {
      'Klatka piersiowa': new Set(),
      'Plecy': new Set(),
      'Barki': new Set(),
      'Nogi': new Set(),
      'Biceps': new Set(),
      'Triceps': new Set(),
      'Pozostałe': new Set()
    };

    filteredSessions.forEach((session) => {
      session.sets.forEach((set) => {
        const cat = (APPROVED_EXERCISE_CATEGORIES.includes(set.category as any)
          ? set.category
          : 'Pozostałe') as ExerciseCategory;

        map[cat].setsCount += 1;
        map[cat].repsCount += set.reps;
        map[cat].volumeKg += set.weightKg * set.reps;

        sessionDatesPerCategory[cat].add(session.dateIso);
        if (set.exerciseName) {
          exerciseSetsPerCategory[cat].add(set.exerciseName);
        }
      });
    });

    // Populate frequency and distinct exercises
    APPROVED_EXERCISE_CATEGORIES.forEach((cat) => {
      map[cat].sessionFrequency = sessionDatesPerCategory[cat].size;
      map[cat].distinctExercises = Array.from(exerciseSetsPerCategory[cat]);
    });

    return Object.values(map);
  }, [filteredSessions]);

  const totalVolume = useMemo(() => {
    return categoryMetrics.reduce((sum, c) => sum + c.volumeKg, 0);
  }, [categoryMetrics]);

  const totalSets = useMemo(() => {
    return categoryMetrics.reduce((sum, c) => sum + c.setsCount, 0);
  }, [categoryMetrics]);

  return (
    <div className="space-y-4">
      {/* Header & Verification Notice */}
      <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-2 shadow-md">
        <div className="flex items-center gap-2 text-white font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-[#00E676]" />
          <span>7 Zatwierdzonych Partii Mięśniowych</span>
        </div>
        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
          Statystyki opierają się wyłącznie na <strong>rzeczywiście ukończonych seriach</strong>. Kategoria jest trwale przypisana w chwili wykonania treningu.
        </p>

        {/* Total stats summary */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-[#0F1218] p-2.5 rounded-xl border border-[#2C3548]">
            <span className="text-[10px] text-[#64748B] block font-medium">Łączna objętość (tonaż)</span>
            <span className="text-sm font-black text-white font-mono">{totalVolume.toLocaleString('pl-PL')} kg</span>
          </div>
          <div className="bg-[#0F1218] p-2.5 rounded-xl border border-[#2C3548]">
            <span className="text-[10px] text-[#64748B] block font-medium">Ukończone serie</span>
            <span className="text-sm font-black text-[#00E676] font-mono">{totalSets} serii</span>
          </div>
        </div>
      </div>

      {/* Visual Volume Distribution Bar */}
      {totalVolume > 0 && (
        <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-2.5 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span>Rozkład Objętości Mięśniowej</span>
            <span className="text-[10px] text-[#00E676] font-mono">100% zrealizowane</span>
          </div>

          <div className="h-3 w-full bg-[#0F1218] rounded-full overflow-hidden flex border border-[#2C3548]">
            {categoryMetrics.map((m, idx) => {
              const pct = totalVolume > 0 ? (m.volumeKg / totalVolume) * 100 : 0;
              if (pct <= 0) return null;
              const colors = [
                'bg-[#00E676]',
                'bg-cyan-400',
                'bg-blue-500',
                'bg-indigo-500',
                'bg-purple-500',
                'bg-amber-400',
                'bg-slate-400'
              ];
              return (
                <div
                  key={m.category}
                  style={{ width: `${pct}%` }}
                  className={`h-full ${colors[idx % colors.length]}`}
                  title={`${m.category}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] font-mono">
            {categoryMetrics
              .filter((m) => m.volumeKg > 0)
              .map((m) => {
                const pct = ((m.volumeKg / totalVolume) * 100).toFixed(0);
                return (
                  <span key={m.category} className="text-[#94A3B8] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#00E676]" />
                    <span>{m.category}: <strong>{pct}%</strong></span>
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* 7 Muscle Cards List */}
      <div className="space-y-2.5">
        {categoryMetrics.map((metric) => {
          const hasData = metric.setsCount > 0;
          return (
            <div
              key={metric.category}
              className={`p-4 rounded-2xl border transition-all ${
                hasData
                  ? 'bg-[#171B24] border-[#2C3548] shadow-md'
                  : 'bg-[#171B24]/60 border-[#212735] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      hasData
                        ? 'bg-[#00E676]/20 text-[#00E676]'
                        : 'bg-[#0F1218] text-[#64748B]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-white">{metric.category}</h3>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    hasData
                      ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                      : 'bg-[#0F1218] text-[#64748B]'
                  }`}
                >
                  {hasData ? `${metric.setsCount} serii` : 'Brak serii'}
                </span>
              </div>

              {hasData ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <div className="bg-[#0F1218] p-2 rounded-xl border border-[#2C3548] text-center">
                      <span className="text-[9px] text-[#64748B] block">Powtórzenia</span>
                      <span className="text-xs font-bold font-mono text-white">
                        {metric.repsCount}
                      </span>
                    </div>

                    <div className="bg-[#0F1218] p-2 rounded-xl border border-[#2C3548] text-center">
                      <span className="text-[9px] text-[#64748B] block">Tonaż</span>
                      <span className="text-xs font-bold font-mono text-[#00E676]">
                        {metric.volumeKg.toLocaleString('pl-PL')} kg
                      </span>
                    </div>

                    <div className="bg-[#0F1218] p-2 rounded-xl border border-[#2C3548] text-center">
                      <span className="text-[9px] text-[#64748B] block">Częstotliwość</span>
                      <span className="text-xs font-bold font-mono text-cyan-400">
                        {metric.sessionFrequency} {metric.sessionFrequency === 1 ? 'trening' : 'treningi'}
                      </span>
                    </div>
                  </div>

                  {metric.distinctExercises.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[9px] text-[#64748B] uppercase tracking-wider block font-bold mb-1">
                        Wykonane ćwiczenia:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {metric.distinctExercises.map((ex) => (
                          <span
                            key={ex}
                            className="text-[10px] bg-[#0F1218] border border-[#2C3548] text-[#94A3B8] px-2 py-0.5 rounded-lg"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-[#64748B] italic pt-1">
                  Brak zarejestrowanych serii w wybranym przedziale czasowym.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
