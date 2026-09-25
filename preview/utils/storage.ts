// LocalStorage persistence manager for PlanPasika
import {
  BodyMeasurementEntry,
  CompletedWorkoutSession,
  CalendarProtocolEntry,
  Exercise,
  WorkoutTemplate,
  RegisteredSet
} from '../data/sampleData';

export interface ActiveSessionDraftState {
  startTime: string;
  exerciseName: string;
  category: string;
  sets: RegisteredSet[];
  inputWeight: number;
  inputReps: number;
  lastUpdatedTimestamp: number;
}

const KEYS = {
  MEASUREMENTS: 'planpasika_measurements_v1',
  SESSIONS: 'planpasika_workout_sessions_v1',
  PROTOCOLS: 'planpasika_protocols_v1',
  EXERCISES: 'planpasika_exercises_v1',
  TEMPLATES: 'planpasika_templates_v1',
  DAY_NOTES: 'planpasika_day_notes_v1',
  DAY_TYPES: 'planpasika_day_types_v1',
  DAY_STATUSES: 'planpasika_day_statuses_v1',
  ACTIVE_DRAFT: 'planpasika_active_draft_v1'
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`[PlanPasika Storage] Error loading key "${key}":`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[PlanPasika Storage] Error saving key "${key}":`, err);
  }
}

export const StorageService = {
  // Measurements
  loadMeasurements: (): BodyMeasurementEntry[] => safeGet<BodyMeasurementEntry[]>(KEYS.MEASUREMENTS, []),
  saveMeasurements: (entries: BodyMeasurementEntry[]): void => safeSet(KEYS.MEASUREMENTS, entries),

  // Completed workout sessions
  loadSessions: (): CompletedWorkoutSession[] => safeGet<CompletedWorkoutSession[]>(KEYS.SESSIONS, []),
  saveSessions: (sessions: CompletedWorkoutSession[]): void => safeSet(KEYS.SESSIONS, sessions),

  // Calendar protocol entries
  loadProtocols: (): CalendarProtocolEntry[] => safeGet<CalendarProtocolEntry[]>(KEYS.PROTOCOLS, []),
  saveProtocols: (protocols: CalendarProtocolEntry[]): void => safeSet(KEYS.PROTOCOLS, protocols),

  // Exercises
  loadExercises: (): Exercise[] => safeGet<Exercise[]>(KEYS.EXERCISES, []),
  saveExercises: (exercises: Exercise[]): void => safeSet(KEYS.EXERCISES, exercises),

  // Workout templates
  loadTemplates: (): WorkoutTemplate[] => safeGet<WorkoutTemplate[]>(KEYS.TEMPLATES, []),
  saveTemplates: (templates: WorkoutTemplate[]): void => safeSet(KEYS.TEMPLATES, templates),

  // Daily notes map { [dateIso]: string }
  loadDayNotes: (): Record<string, string> => safeGet<Record<string, string>>(KEYS.DAY_NOTES, {}),
  saveDayNotes: (notes: Record<string, string>): void => safeSet(KEYS.DAY_NOTES, notes),

  // Daily types map { [dateIso]: DayPlanType }
  loadDayTypes: (): Record<string, string> => safeGet<Record<string, string>>(KEYS.DAY_TYPES, {}),
  saveDayTypes: (types: Record<string, string>): void => safeSet(KEYS.DAY_TYPES, types),

  // Daily statuses map { [dateIso]: CompletionStatus }
  loadDayStatuses: (): Record<string, string> => safeGet<Record<string, string>>(KEYS.DAY_STATUSES, {}),
  saveDayStatuses: (statuses: Record<string, string>): void => safeSet(KEYS.DAY_STATUSES, statuses),

  // Active Draft Auto-save (Etap 4A)
  loadActiveDraft: (): ActiveSessionDraftState | null => safeGet<ActiveSessionDraftState | null>(KEYS.ACTIVE_DRAFT, null),
  saveActiveDraft: (draft: ActiveSessionDraftState): void => safeSet(KEYS.ACTIVE_DRAFT, draft),
  clearActiveDraft: (): void => {
    try {
      localStorage.removeItem(KEYS.ACTIVE_DRAFT);
    } catch (e) {
      console.warn('[PlanPasika Storage] Error clearing draft:', e);
    }
  }
};
