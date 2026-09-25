package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.domain.model.CompletedWorkoutSession
import com.example.domain.model.WorkoutExercise

@Entity(tableName = "completed_workout_sessions")
data class CompletedWorkoutSessionEntity(
    @PrimaryKey
    val sessionId: String,
    val workoutName: String,
    val dateIso: String,
    val durationMinutes: Int,
    val exercises: List<WorkoutExercise>,
    val completedSetsCount: Int,
    val totalVolumeKg: Double,
    val advancedRotation: Boolean
) {
    fun toDomain(): CompletedWorkoutSession = CompletedWorkoutSession(
        sessionId = sessionId,
        workoutName = workoutName,
        dateIso = dateIso,
        durationMinutes = durationMinutes,
        exercises = exercises,
        completedSetsCount = completedSetsCount,
        totalVolumeKg = totalVolumeKg,
        advancedRotation = advancedRotation
    )

    companion object {
        fun fromDomain(domain: CompletedWorkoutSession): CompletedWorkoutSessionEntity = CompletedWorkoutSessionEntity(
            sessionId = domain.sessionId,
            workoutName = domain.workoutName,
            dateIso = domain.dateIso,
            durationMinutes = domain.durationMinutes,
            exercises = domain.exercises,
            completedSetsCount = domain.completedSetsCount,
            totalVolumeKg = domain.totalVolumeKg,
            advancedRotation = domain.advancedRotation
        )
    }
}
