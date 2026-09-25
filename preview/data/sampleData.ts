// Preview Types & Domain Mirror for PlanPasika

export type DayPlanType = 'ASSIGNED_WORKOUT' | 'REST_DAY' | 'NO_PLAN';
export type CompletionStatus = 'WYKONANY' | 'NIEWYKONANY' | 'NIEROZSTRZYGNIETY';

export interface PlannedExercise {
  name: string;
  category: string;
  setsCount: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exerciseCount: number;
  exercises: PlannedExercise[];
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  notes: string;
  isCustom?: boolean;
}

export interface DayScheduleEntry {
  dateIso: string;
  dayOfWeekName: string;
  dayType: DayPlanType;
  workoutTemplateId?: string | null;
  workoutName?: string | null;
  status: CompletionStatus;
  hasActualSession?: boolean;
  notes?: string;
}

// 7 approved domain categories from ExerciseCategory.kt
export const APPROVED_EXERCISE_CATEGORIES = [
  'Klatka piersiowa',
  'Plecy',
  'Barki',
  'Nogi',
  'Biceps',
  'Triceps',
  'Pozostałe'
] as const;

export type ExerciseCategory = typeof APPROVED_EXERCISE_CATEGORIES[number];

// Measurement domain
export type MeasurementType =
  | 'WEIGHT'
  | 'CHEST'
  | 'WAIST'
  | 'HIPS'
  | 'LEFT_ARM'
  | 'RIGHT_ARM'
  | 'LEFT_THIGH'
  | 'RIGHT_THIGH'
  | 'LEFT_CALF'
  | 'RIGHT_CALF';

export interface MeasurementConfig {
  type: MeasurementType;
  label: string;
  unit: 'kg' | 'cm';
  defaultStep: number;
}

export const MEASUREMENT_CONFIGS: Record<MeasurementType, MeasurementConfig> = {
  WEIGHT: { type: 'WEIGHT', label: 'Masa ciała', unit: 'kg', defaultStep: 0.1 },
  CHEST: { type: 'CHEST', label: 'Klatka piersiowa', unit: 'cm', defaultStep: 0.5 },
  WAIST: { type: 'WAIST', label: 'Talia / pas', unit: 'cm', defaultStep: 0.5 },
  HIPS: { type: 'HIPS', label: 'Biodra', unit: 'cm', defaultStep: 0.5 },
  LEFT_ARM: { type: 'LEFT_ARM', label: 'Lewe ramię', unit: 'cm', defaultStep: 0.5 },
  RIGHT_ARM: { type: 'RIGHT_ARM', label: 'Prawe ramię', unit: 'cm', defaultStep: 0.5 },
  LEFT_THIGH: { type: 'LEFT_THIGH', label: 'Lewe udo', unit: 'cm', defaultStep: 0.5 },
  RIGHT_THIGH: { type: 'RIGHT_THIGH', label: 'Prawe udo', unit: 'cm', defaultStep: 0.5 },
  LEFT_CALF: { type: 'LEFT_CALF', label: 'Lewa łydka', unit: 'cm', defaultStep: 0.5 },
  RIGHT_CALF: { type: 'RIGHT_CALF', label: 'Prawa łydka', unit: 'cm', defaultStep: 0.5 }
};

export interface BodyMeasurementEntry {
  id: string;
  type: MeasurementType;
  value: number;
  unit: 'kg' | 'cm';
  dateIso: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
  timestamp: number;
}

// Workout sets & completed sessions
export interface RegisteredSet {
  id: string;
  setNumber: number;
  exerciseName: string;
  category: string;
  weightKg: number;
  reps: number;
  completedAt?: string;
}

export interface CompletedWorkoutSession {
  id: string;
  dateIso: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes?: number;
  workoutName: string;
  category: string;
  sets: RegisteredSet[];
  totalTonnageKg: number;
  totalReps: number;
  notes?: string;
}

// Manual Calendar Cycle / Protocol Entry
export interface CalendarProtocolEntry {
  id: string;
  dateIso: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  dosageOrInfo?: string;
  notes?: string;
  timestamp: number;
}

export const INITIAL_TEMPLATES: WorkoutTemplate[] = [];
export const INITIAL_EXERCISES: Exercise[] = [];
