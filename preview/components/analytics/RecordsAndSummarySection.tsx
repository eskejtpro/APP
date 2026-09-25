import React, { useMemo } from 'react';
import {
  Trophy,
  Clock,
  Calendar,
  Zap
} from 'lucide-react';
import { CompletedWorkoutSession } from '../../data/sampleData';

interface RecordsAndSummarySectionProps {
  sessions: CompletedWorkoutSession[];
}

export const RecordsAndSummarySection: React.FC<RecordsAndSummarySectionProps> = ({
  sessions
}) => {
  // Current vs Previous Week & Month calculations
  const periodComparison = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const currentMon = new Date(now);
    currentMon.setDate(now.getDate() + distToMon);
    currentMon.setHours(0, 0, 0, 0);

    const prevMon = new Date(currentMon);
    prevMon.setDate(currentMon.getDate() - 7);

    const currentMonIso = currentMon.toISOString().slice(0, 10);
    const prevMonIso = prevMon.toISOString().slice(0, 10);

    // Current month vs Previous month
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const curMonthPrefix = `${curYear}-${String(curMonth + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(curYear, curMonth - 1, 1);
    const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    // Filter sessions
    const curWeekSessions = sessions.filter((s) => s.dateIso >= currentMonIso);
    const prevWeekSessions = sessions.filter((s) => s.dateIso >= prevMonIso && s.dateIso < currentMonIso);

    const curMonthSessions = sessions.filter((s) => s.dateIso.startsWith(curMonthPrefix));
    const prevMonthSessions = sessions.filter((s) => s.dateIso.startsWith(prevMonthPrefix));

    const getStats = (list: CompletedWorkoutSession[]) => {
      const workouts = list.length;
      let sets = 0;
      let reps = 0;
      let tonnage = 0;
      let durationMins = 0;
      let validDurationCount = 0;

      list.forEach((s) => {
        sets += s.sets.length;
        s.sets.forEach((st) => {
          reps += st.reps;
          tonnage += st.weightKg * st.reps;
        });
        if (s.durationMinutes && s.durationMinutes > 0) {
          durationMins += s.durationMinutes;
          validDurationCount += 1;
        }
      });

      return { workouts, sets, reps, tonnage, durationMins, validDurationCount };
    };

    return {
      curWeek: getStats(curWeekSessions),
      prevWeek: getStats(prevWeekSessions),
      curMonth: getStats(curMonthSessions),
      prevMonth: getStats(prevMonthSessions),
      allTime: getStats(sessions)
    };
  }, [sessions]);

  // Personal Records & 1RM Estimations per Exercise
  const personalRecords = useMemo(() => {
    interface ExercisePR {
      exerciseName: string;
      category: string;
      maxWeightKg: number;
      maxWeightReps: number;
      maxTonnageSet: number;
      estimated1RM: number; // Epley: weight * (1 + reps/30)
      bestSessionDate: string;
    }

    const prMap: Record<string, ExercisePR> = {};

    sessions.forEach((session) => {
      session.sets.forEach((set) => {
        const name = set.exerciseName.trim();
        if (!name) return;

        // Epley formula for 1RM estimate
        const estimated1RM = set.reps === 1 ? set.weightKg : Number((set.weightKg * (1 + set.reps / 30)).toFixed(1));
        const setTonnage = set.weightKg * set.reps;

        if (!prMap[name]) {
          prMap[name] = {
            exerciseName: name,
            category: set.category,
            maxWeightKg: set.weightKg,
            maxWeightReps: set.reps,
            maxTonnageSet: setTonnage,
            estimated1RM,
            bestSessionDate: session.dateIso
          };
        } else {
          const current = prMap[name];
          if (set.weightKg > current.maxWeightKg || (set.weightKg === current.maxWeightKg && set.reps > current.maxWeightReps)) {
            current.maxWeightKg = set.weightKg;
            current.maxWeightReps = set.reps;
            current.bestSessionDate = session.dateIso;
          }
          if (estimated1RM > current.estimated1RM) {
            current.estimated1RM = estimated1RM;
          }
          if (setTonnage > current.maxTonnageSet) {
            current.maxTonnageSet = setTonnage;
          }
        }
      });
    });

    return Object.values(prMap).sort((a, b) => b.maxWeightKg - a.maxWeightKg);
  }, [sessions]);

  return (
    <div className="space-y-4">
      {/* 1. All-time KPI Grid */}
      <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00E676]/20 flex items-center justify-center text-[#00E676]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Faktycznie Zarejestrowane Wyniki
              </h3>
              <span className="text-[10px] text-[#64748B]">Brak fikcyjnych danych i planów</span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#00E676] bg-[#00E676]/15 px-2.5 py-0.5 rounded-full border border-[#00E676]/30">
            {periodComparison.allTime.workouts} {periodComparison.allTime.workouts === 1 ? 'trening' : 'treningów'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] text-center">
            <span className="text-[10px] text-[#64748B] block font-medium">Łączny Tonaż</span>
            <span className="text-sm font-black text-[#00E676] font-mono">
              {periodComparison.allTime.tonnage.toLocaleString('pl-PL')} kg
            </span>
          </div>

          <div className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] text-center">
            <span className="text-[10px] text-[#64748B] block font-medium">Ukończone Serie</span>
            <span className="text-sm font-black text-white font-mono">
              {periodComparison.allTime.sets}
            </span>
          </div>

          <div className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] text-center">
            <span className="text-[10px] text-[#64748B] block font-medium">Powtórzenia</span>
            <span className="text-sm font-black text-cyan-400 font-mono">
              {periodComparison.allTime.reps}
            </span>
          </div>
        </div>

        {/* Training duration stats (shown only if accurate start/end exists) */}
        {periodComparison.allTime.validDurationCount > 0 && (
          <div className="bg-[#0F1218] p-2.5 rounded-xl border border-[#2C3548] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Clock className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Łączny zarejestrowany czas:</span>
            </div>
            <span className="font-mono font-bold text-white">
              {Math.floor(periodComparison.allTime.durationMins / 60)}h {periodComparison.allTime.durationMins % 60}m
            </span>
          </div>
        )}
      </div>

      {/* 2. Period Comparisons (Week & Month) */}
      <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-3 shadow-md">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
          <span>Porównanie Okresów Treningowych</span>
        </h3>

        {/* Week vs Prev Week */}
        <div className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-white">Bieżący vs Poprzedni Tydzień</span>
            <span className="text-[10px] font-mono text-[#94A3B8]">Tonaż (kg)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#171B24] p-2 rounded-lg border border-[#2C3548]">
              <span className="text-[9px] text-[#64748B] block">Ten tydzień</span>
              <span className="font-bold text-white">{periodComparison.curWeek.tonnage.toLocaleString('pl-PL')} kg</span>
              <span className="text-[9px] text-[#00E676] block">({periodComparison.curWeek.workouts} sesji)</span>
            </div>

            <div className="bg-[#171B24] p-2 rounded-lg border border-[#2C3548]">
              <span className="text-[9px] text-[#64748B] block">Poprzedni tydzień</span>
              <span className="font-bold text-[#94A3B8]">{periodComparison.prevWeek.tonnage.toLocaleString('pl-PL')} kg</span>
              <span className="text-[9px] text-[#64748B] block">({periodComparison.prevWeek.workouts} sesji)</span>
            </div>
          </div>
        </div>

        {/* Month vs Prev Month */}
        <div className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-white">Bieżący vs Poprzedni Miesiąc</span>
            <span className="text-[10px] font-mono text-[#94A3B8]">Tonaż (kg)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#171B24] p-2 rounded-lg border border-[#2C3548]">
              <span className="text-[9px] text-[#64748B] block">Ten miesiąc</span>
              <span className="font-bold text-white">{periodComparison.curMonth.tonnage.toLocaleString('pl-PL')} kg</span>
              <span className="text-[9px] text-[#00E676] block">({periodComparison.curMonth.workouts} sesji)</span>
            </div>

            <div className="bg-[#171B24] p-2 rounded-lg border border-[#2C3548]">
              <span className="text-[9px] text-[#64748B] block">Poprzedni miesiąc</span>
              <span className="font-bold text-[#94A3B8]">{periodComparison.prevMonth.tonnage.toLocaleString('pl-PL')} kg</span>
              <span className="text-[9px] text-[#64748B] block">({periodComparison.prevMonth.workouts} sesji)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Personal Records (PR) & Estimated 1RM (Epley Formula) */}
      <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Rekordy Siłowe i Szacowane 1RM</span>
            </h3>
            <span className="text-[10px] text-[#64748B]">Metoda: Formuła Epleya [1RM = w * (1 + r / 30)]</span>
          </div>
        </div>

        {personalRecords.length === 0 ? (
          <div className="p-6 bg-[#0F1218] rounded-xl border border-[#2C3548] text-center text-xs text-[#64748B]">
            Brak zarejestrowanych serii w historii treningów.
          </div>
        ) : (
          <div className="space-y-2">
            {personalRecords.map((pr) => (
              <div
                key={pr.exerciseName}
                className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-[#00E676] font-mono uppercase font-bold block">
                      {pr.category}
                    </span>
                    <h4 className="text-xs font-black text-white">{pr.exerciseName}</h4>
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono">{pr.bestSessionDate}</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1 text-xs font-mono">
                  <div className="bg-[#171B24] p-2 rounded-lg border border-[#2C3548] text-center">
                    <span className="text-[9px] text-[#64748B] block">Max Ciężar</span>
                    <span className="font-bold text-white">{pr.maxWeightKg} kg</span>
                    <span className="text-[9px] text-[#94A3B8] block">x {pr.maxWeightReps} powt.</span>
                  </div>

                  <div className="bg-[#171B24] p-2 rounded-lg border border-[#2C3548] text-center">
                    <span className="text-[9px] text-amber-400 block font-bold">Szacunek 1RM</span>
                    <span className="font-bold text-amber-300">{pr.estimated1RM} kg</span>
                    <span className="text-[9px] text-amber-400/70 block">(Epley)</span>
                  </div>

                  <div className="bg-[#171B24] p-2 rounded-lg border border-[#2C3548] text-center">
                    <span className="text-[9px] text-[#64748B] block">Max Seria</span>
                    <span className="font-bold text-[#00E676]">{pr.maxTonnageSet} kg</span>
                    <span className="text-[9px] text-[#64748B] block">tonaż</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
