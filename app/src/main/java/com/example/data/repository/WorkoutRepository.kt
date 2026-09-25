package com.example.data.repository

import com.example.data.sample.SampleData
import com.example.domain.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

interface WorkoutRepository {
    fun getActiveSessionDraft(): Flow<ActiveSessionDraft?>
    fun getCompletedSessions(): Flow<List<CompletedWorkoutSession>>
    fun getTemplates(): Flow<List<WorkoutTemplate>>

    suspend fun saveSessionDraft(draft: ActiveSessionDraft)
    suspend fun updateSetApproval(exerciseIndex: Int, setIndex: Int, isApproved: Boolean?)
    suspend fun updateSetValues(exerciseIndex: Int, setIndex: Int, reps: Int, weightKg: Double)
    suspend fun addSetToExercise(exerciseIndex: Int, newSet: WorkoutSet)
    suspend fun replaceExercise(exerciseIndex: Int, replacementExercise: Exercise, replacementSets: List<WorkoutSet>)
    suspend fun skipExercise(exerciseIndex: Int)
    suspend fun reorderExercises(fromIndex: Int, toIndex: Int)
    suspend fun saveModifiedAsNewTemplate(templateName: String, exercises: List<WorkoutExercise>)
    suspend fun finalizeSession(advanceRotation: Boolean): CompletedWorkoutSession?
    suspend fun archiveSessionDraft()
    suspend fun startSessionFromTemplate(template: WorkoutTemplate)
    suspend fun resumeInterruptedSession()
}

class InMemoryWorkoutRepository : WorkoutRepository {
    private val _activeDraft = MutableStateFlow<ActiveSessionDraft?>(SampleData.initialInterruptedDraft)
    private val _completedSessions = MutableStateFlow<List<CompletedWorkoutSession>>(SampleData.sampleCompletedSessions)
    private val _templates = MutableStateFlow<List<WorkoutTemplate>>(SampleData.templates)

    override fun getActiveSessionDraft(): Flow<ActiveSessionDraft?> = _activeDraft.asStateFlow()

    override fun getCompletedSessions(): Flow<List<CompletedWorkoutSession>> = _completedSessions.asStateFlow()

    override fun getTemplates(): Flow<List<WorkoutTemplate>> = _templates.asStateFlow()

    override suspend fun saveSessionDraft(draft: ActiveSessionDraft) {
        _activeDraft.value = draft.copy(lastActivityTimestamp = System.currentTimeMillis())
    }

    override suspend fun updateSetApproval(exerciseIndex: Int, setIndex: Int, isApproved: Boolean?) {
        val current = _activeDraft.value ?: return
        if (exerciseIndex !in current.exercises.indices) return
        val currentEx = current.exercises[exerciseIndex]
        if (setIndex !in currentEx.sets.indices) return

        val updatedSets = currentEx.sets.toMutableList()
        updatedSets[setIndex] = updatedSets[setIndex].copy(isApproved = isApproved)

        val updatedExList = current.exercises.toMutableList()
        updatedExList[exerciseIndex] = currentEx.copy(sets = updatedSets)

        // Resets inactivity timer because user made a real modification
        _activeDraft.value = current.copy(
            exercises = updatedExList,
            lastActivityTimestamp = System.currentTimeMillis()
        )
    }

    override suspend fun updateSetValues(exerciseIndex: Int, setIndex: Int, reps: Int, weightKg: Double) {
        val current = _activeDraft.value ?: return
        if (exerciseIndex !in current.exercises.indices) return
        val currentEx = current.exercises[exerciseIndex]
        if (setIndex !in currentEx.sets.indices) return

        val updatedSets = currentEx.sets.toMutableList()
        updatedSets[setIndex] = updatedSets[setIndex].copy(actualReps = reps, weightKg = weightKg)

        val updatedExList = current.exercises.toMutableList()
        updatedExList[exerciseIndex] = currentEx.copy(sets = updatedSets)

        _activeDraft.value = current.copy(
            exercises = updatedExList,
            lastActivityTimestamp = System.currentTimeMillis()
        )
    }

    override suspend fun addSetToExercise(exerciseIndex: Int, newSet: WorkoutSet) {
        val current = _activeDraft.value ?: return
        if (exerciseIndex !in current.exercises.indices) return
        val currentEx = current.exercises[exerciseIndex]

        val updatedSets = currentEx.sets + newSet
        val updatedExList = current.exercises.toMutableList()
        updatedExList[exerciseIndex] = currentEx.copy(sets = updatedSets)

        _activeDraft.value = current.copy(
            exercises = updatedExList,
            lastActivityTimestamp = System.currentTimeMillis()
        )
    }

    override suspend fun replaceExercise(
        exerciseIndex: Int,
        replacementExercise: Exercise,
        replacementSets: List<WorkoutSet>
    ) {
        val current = _activeDraft.value ?: return
        if (exerciseIndex !in current.exercises.indices) return
        val currentEx = current.exercises[exerciseIndex]

        // Rule: Completed sets stay with original exercise!
        val completedSets = currentEx.sets.filter { it.isApproved == true }

        val updatedExList = current.exercises.toMutableList()

        if (completedSets.isNotEmpty()) {
            // Keep original with only its completed sets
            updatedExList[exerciseIndex] = currentEx.copy(
                sets = completedSets,
                isReplaced = true
            )
            // Insert replacement exercise immediately after
            val replacementWorkoutExercise = WorkoutExercise(
                exerciseId = replacementExercise.id,
                exerciseName = replacementExercise.name,
                category = replacementExercise.category,
                sets = replacementSets,
                isReplaced = false,
                originalExerciseId = currentEx.exerciseId
            )
            updatedExList.add(exerciseIndex + 1, replacementWorkoutExercise)
        } else {
            // Entire exercise replaced
            updatedExList[exerciseIndex] = WorkoutExercise(
                exerciseId = replacementExercise.id,
                exerciseName = replacementExercise.name,
                category = replacementExercise.category,
                sets = replacementSets,
                isReplaced = false,
                originalExerciseId = currentEx.exerciseId
            )
        }

        _activeDraft.value = current.copy(
            exercises = updatedExList,
            lastActivityTimestamp = System.currentTimeMillis()
        )
    }

    override suspend fun skipExercise(exerciseIndex: Int) {
        val current = _activeDraft.value ?: return
        if (exerciseIndex !in current.exercises.indices) return
        val currentEx = current.exercises[exerciseIndex]

        val updatedExList = current.exercises.toMutableList()
        updatedExList[exerciseIndex] = currentEx.copy(isSkipped = !currentEx.isSkipped)

        _activeDraft.value = current.copy(
            exercises = updatedExList,
            lastActivityTimestamp = System.currentTimeMillis()
        )
    }

    override suspend fun reorderExercises(fromIndex: Int, toIndex: Int) {
        val current = _activeDraft.value ?: return
        if (fromIndex !in current.exercises.indices || toIndex !in current.exercises.indices) return

        val list = current.exercises.toMutableList()
        val item = list.removeAt(fromIndex)
        list.add(toIndex, item)

        _activeDraft.value = current.copy(
            exercises = list,
            lastActivityTimestamp = System.currentTimeMillis()
        )
    }

    override suspend fun saveModifiedAsNewTemplate(templateName: String, exercises: List<WorkoutExercise>) {
        val newTemplate = WorkoutTemplate(
            id = "tpl_${UUID.randomUUID()}",
            name = templateName,
            description = "Utworzono na podstawie bieżącej sesji",
            exercises = exercises
        )
        _templates.value = _templates.value + newTemplate
    }

    override suspend fun finalizeSession(advanceRotation: Boolean): CompletedWorkoutSession? {
        val current = _activeDraft.value ?: return null
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

        _completedSessions.value = listOf(completed) + _completedSessions.value
        _activeDraft.value = null
        return completed
    }

    override suspend fun archiveSessionDraft() {
        // Archive without deleting data
        _activeDraft.value = null
    }

    override suspend fun startSessionFromTemplate(template: WorkoutTemplate) {
        _activeDraft.value = ActiveSessionDraft(
            workoutId = template.id,
            workoutName = template.name,
            startTimeMillis = System.currentTimeMillis(),
            exercises = template.exercises,
            isInterrupted = false,
            lastActivityTimestamp = System.currentTimeMillis(),
            isUnsettledDraft = true
        )
    }

    override suspend fun resumeInterruptedSession() {
        val current = _activeDraft.value ?: return
        _activeDraft.value = current.copy(
            isInterrupted = false,
            lastActivityTimestamp = System.currentTimeMillis()
        )
    }
}
