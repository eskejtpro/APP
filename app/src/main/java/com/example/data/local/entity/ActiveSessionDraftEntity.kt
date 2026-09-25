package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.domain.model.ActiveSessionDraft
import com.example.domain.model.WorkoutExercise

@Entity(tableName = "active_session_draft")
data class ActiveSessionDraftEntity(
    @PrimaryKey
    val id: String = SINGLETON_ID,
    val workoutId: String,
    val workoutName: String,
    val startTimeMillis: Long,
    val exercises: List<WorkoutExercise>,
    val isInterrupted: Boolean = false,
    val lastActivityTimestamp: Long = System.currentTimeMillis(),
    val isUnsettledDraft: Boolean = true
) {
    fun toDomain(): ActiveSessionDraft = ActiveSessionDraft(
        workoutId = workoutId,
        workoutName = workoutName,
        startTimeMillis = startTimeMillis,
        exercises = exercises,
        isInterrupted = isInterrupted,
        lastActivityTimestamp = lastActivityTimestamp,
        isUnsettledDraft = isUnsettledDraft
    )

    companion object {
        const val SINGLETON_ID = "active_draft_singleton"

        fun fromDomain(domain: ActiveSessionDraft): ActiveSessionDraftEntity = ActiveSessionDraftEntity(
            id = SINGLETON_ID,
            workoutId = domain.workoutId,
            workoutName = domain.workoutName,
            startTimeMillis = domain.startTimeMillis,
            exercises = domain.exercises,
            isInterrupted = domain.isInterrupted,
            lastActivityTimestamp = domain.lastActivityTimestamp,
            isUnsettledDraft = domain.isUnsettledDraft
        )
    }
}
