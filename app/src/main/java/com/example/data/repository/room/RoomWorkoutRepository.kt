package com.example.data.repository.room

import com.example.data.local.dao.WorkoutDao
import com.example.data.local.entity.ActiveSessionDraftEntity
import com.example.data.local.entity.CompletedWorkoutSessionEntity
import com.example.data.local.entity.WorkoutTemplateEntity
import com.example.data.repository.WorkoutRepository
import com.example.domain.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.UUID

class RoomWorkoutRepository(
    private val workoutDao: WorkoutDao
) : WorkoutRepository {

    override fun getActiveSessionDraft(): Flow<ActiveSessionDraft?> {
        return workoutDao.getActiveDraft().map { it?.toDomain() }
    }

    override fun getCompletedSessions(): Flow<List<CompletedWorkoutSession>> {
        return workoutDao.getCompletedSessions().map { list ->
            list.map { it.toDomain() }
        }
    }

    override fun getTemplates(): Flow<List<WorkoutTemplate>> {
        return workoutDao.getAllTemplates().map { list ->
            list.map { it.toDomain() }
        }
    }

    override suspend fun saveSessionDraft(draft: ActiveSessionDraft) {
        val updated = draft.copy(lastActivityTimestamp = System.currentTimeMillis())
        workoutDao.insertOrUpdateDraft(ActiveSessionDraftEntity.fromDomain(updated))
    }

    override suspend fun updateSetApproval(exerciseIndex: Int, setIndex: Int, isApproved: Boolean?) {
        val current = workoutDao.getActiveDraftSync()?.toDomain() ?: return
        if (exerciseIndex !in current.exercises.indices) return
        val currentEx = current.exercises[exerciseIndex]
        if (setIndex !in currentEx.sets.indices) return

        val updatedSets = currentEx.sets.toMutableList()
        updatedSets[setIndex] = updatedSets[setIndex].copy(isApproved = isApproved)

        val updatedExList = current.exercises.toMutableList()
        updatedExList[exerciseIndex] = currentEx.copy(sets = updatedSets)

        val updatedDraft = current.copy(
            exercises = updatedExList,
            lastActivityTimestamp = System.currentTimeMillis()
        )
        workoutDao.insertOrUpdateDraft(ActiveSessionDraftEntity.fromDomain(updatedDraft))
    }

    override suspend fun updateSetValues(exerciseIndex: Int, setIndex: Int, reps: Int, weightKg: Double) {
        val current = workoutDao.getActiveDraftSync()?.toDomain() ?: return
        if (exerciseIndex !in current.exercises.indices) return
        val currentEx = current.exercises[exerciseIndex]
        if (setIndex !in currentEx.sets.indices) return

        val updatedSets = currentEx.sets.toMutableList()
        updatedSets[setIndex] = updatedSets[setIndex].copy(actualReps = reps, weightKg = weightKg)

        val updatedExList = current.exercises.toMutableList()
        updatedExList[exerciseIndex] = currentEx.copy(sets = updatedSets)

        val updatedDraft = current.copy(
            exercises = updatedExList,
            lastActivityTimestamp = System.currentTimeMillis()
        )
        workoutDao.insertOrUpdateDraft(ActiveSessionDraftEntity.fromDomain(updatedDraft))
    }

    override suspend fun addSetToExercise(exerciseIndex: Int, newSet: WorkoutSet) {
        val current = workoutDao.getActiveDraftSync()?.toDomain() ?: return
        if (exerciseIndex !in current.exercises.indices) return
        val currentEx = current.exercises[exerciseIndex]

        val updatedSets = currentEx.sets + newSet
        val updatedExList = current.exercises.toMutableList()
        updatedExList[exerciseIndex] = currentEx.copy(sets = updatedSets)

        val updatedDraft = current.copy(
            exercises = updatedExList,
            lastActivityTimestamp = System.currentTimeMillis()
        )
        workoutDao.insertOrUpdateDraft(ActiveSessionDraftEntity.fromDomain(updatedDraft))
    }

    override suspend fun replaceExercise(
        exerciseIndex: Int,
        replacementExercise: Exercise,
        replacementSets: List<WorkoutSet>
    ) {
        val current = workoutDao.getActiveDraftSync()?.toDomain() ?: return
        if (exerciseIndex !in current.exercises.indices) return
        val currentEx = current.exercises[exerciseIndex]

        val completedSets = currentEx.sets.filter { it.isApproved == true }
        val updatedExList = current.exercises.toMutableList()

        if (completedSets.isNotEmpty()) {
            updatedExList[exerciseIndex] = currentEx.copy(
                sets = completedSets,
                isReplaced = true
            )
            val replacementWorkoutEx = WorkoutExercise(
                exerciseId = replacementExercise.id,
                exerciseName = replacementExercise.name,
                category = replacementExercise.category,
                sets = replacementSets,
                isReplaced = false,
                originalExerciseId = currentEx.exerciseId
            )
            updatedExList.add(exerciseIndex + 1, replacementWorkoutEx)
        } else {
            updatedExList[exerciseIndex] = WorkoutExercise(
                exerciseId = replacementExercise.id,
                exerciseName = replacementExercise.name,
                category = replacementExercise.category,
                sets = replacementSets,
                isReplaced = false,
                originalExerciseId = currentEx.exerciseId
            )
        }

        val updatedDraft = current.copy(
            exercises = updatedExList,
            lastActivityTimestamp = System.currentTimeMillis()
        )
        workoutDao.insertOrUpdateDraft(ActiveSessionDraftEntity.fromDomain(updatedDraft))
    }

    override suspend fun skipExercise(exerciseIndex: Int) {
        val current = workoutDao.getActiveDraftSync()?.toDomain() ?: return
        if (exerciseIndex !in current.exercises.indices) return
        val currentEx = current.exercises[exerciseIndex]

        val updatedExList = current.exercises.toMutableList()
        updatedExList[exerciseIndex] = currentEx.copy(isSkipped = !currentEx.isSkipped)

        val updatedDraft = current.copy(
            exercises = updatedExList,
            lastActivityTimestamp = System.currentTimeMillis()
        )
        workoutDao.insertOrUpdateDraft(ActiveSessionDraftEntity.fromDomain(updatedDraft))
    }

    override suspend fun reorderExercises(fromIndex: Int, toIndex: Int) {
        val current = workoutDao.getActiveDraftSync()?.toDomain() ?: return
        if (fromIndex !in current.exercises.indices || toIndex !in current.exercises.indices) return

        val list = current.exercises.toMutableList()
        val item = list.removeAt(fromIndex)
        list.add(toIndex, item)

        val updatedDraft = current.copy(
            exercises = list,
            lastActivityTimestamp = System.currentTimeMillis()
        )
        workoutDao.insertOrUpdateDraft(ActiveSessionDraftEntity.fromDomain(updatedDraft))
    }

    override suspend fun saveModifiedAsNewTemplate(templateName: String, exercises: List<WorkoutExercise>) {
        val newTemplate = WorkoutTemplate(
            id = "tpl_${UUID.randomUUID()}",
            name = templateName,
            description = "Utworzono na podstawie sesji",
            exercises = exercises
        )
        workoutDao.insertTemplate(WorkoutTemplateEntity.fromDomain(newTemplate))
    }

    override suspend fun finalizeSession(advanceRotation: Boolean): CompletedWorkoutSession? {
        val current = workoutDao.getActiveDraftSync()?.toDomain() ?: return null
        val durationMinutes = ((System.currentTimeMillis() - current.startTimeMillis) / (60 * 1000L)).toInt().coerceAtLeast(15)

        val completedSets = current.exercises.filterNot { it.isSkipped }.flatMap { it.sets }.filter { it.isApproved == true }
        val totalVolume = completedSets.sumOf { it.actualReps * it.weightKg }

        val todayIso = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date())
        val completed = CompletedWorkoutSession(
            sessionId = "sess_${UUID.randomUUID()}",
            workoutName = current.workoutName,
            dateIso = todayIso,
            durationMinutes = durationMinutes,
            exercises = current.exercises,
            completedSetsCount = completedSets.size,
            totalVolumeKg = totalVolume,
            advancedRotation = advanceRotation
        )

        workoutDao.insertCompletedSession(CompletedWorkoutSessionEntity.fromDomain(completed))
        workoutDao.clearDraft()
        return completed
    }

    override suspend fun archiveSessionDraft() {
        workoutDao.clearDraft()
    }

    override suspend fun startSessionFromTemplate(template: WorkoutTemplate) {
        val draft = ActiveSessionDraft(
            workoutId = template.id,
            workoutName = template.name,
            startTimeMillis = System.currentTimeMillis(),
            exercises = template.exercises,
            isInterrupted = false,
            lastActivityTimestamp = System.currentTimeMillis(),
            isUnsettledDraft = true
        )
        workoutDao.insertOrUpdateDraft(ActiveSessionDraftEntity.fromDomain(draft))
    }

    override suspend fun resumeInterruptedSession() {
        val current = workoutDao.getActiveDraftSync()?.toDomain() ?: return
        val resumed = current.copy(
            isInterrupted = false,
            lastActivityTimestamp = System.currentTimeMillis()
        )
        workoutDao.insertOrUpdateDraft(ActiveSessionDraftEntity.fromDomain(resumed))
    }
}
