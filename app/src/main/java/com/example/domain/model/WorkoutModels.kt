package com.example.domain.model

data class WorkoutSet(
    val setNumber: Int,
    val targetReps: Int,
    val actualReps: Int,
    val weightKg: Double,
    /**
     * null = wersja robocza / oczekująca na decyzję
     * true = seria zatwierdzona przez użytkownika
     * false = seria odrzucona przez użytkownika
     */
    val isApproved: Boolean? = null,
    val notes: String = ""
) {
    val isDecided: Boolean get() = isApproved != null
    val isCountedAsCompleted: Boolean get() = isApproved == true
}

data class WorkoutExercise(
    val exerciseId: String,
    val exerciseName: String,
    val category: ExerciseCategory,
    val sets: List<WorkoutSet>,
    val isSkipped: Boolean = false,
    val isReplaced: Boolean = false,
    val originalExerciseId: String? = null,
    val notes: String = ""
)

data class WorkoutTemplate(
    val id: String,
    val name: String,
    val description: String,
    val exercises: List<WorkoutExercise>
)

data class ActiveSessionDraft(
    val workoutId: String,
    val workoutName: String,
    val startTimeMillis: Long,
    val exercises: List<WorkoutExercise>,
    val isInterrupted: Boolean = false,
    val lastActivityTimestamp: Long = System.currentTimeMillis(),
    val isUnsettledDraft: Boolean = true
)

data class CompletedWorkoutSession(
    val sessionId: String,
    val workoutName: String,
    val dateIso: String,
    val durationMinutes: Int,
    val exercises: List<WorkoutExercise>,
    val completedSetsCount: Int,
    val totalVolumeKg: Double,
    val advancedRotation: Boolean
)
