package com.example.data.repository

import com.example.data.sample.SampleData
import com.example.domain.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

interface PlanRepository {
    fun getActiveCycle(): Flow<TrainingCycle?>
    fun getAllCycles(): Flow<List<TrainingCycle>>
    suspend fun updateScheduleEntry(updatedEntry: DayScheduleEntry)
    suspend fun copyWeekToFuture(sourceStartIndex: Int, targetStartIndex: Int, selectedDayIndices: List<Int>)
    suspend fun advanceRotation()
    suspend fun skipCurrentRotation()
    suspend fun startNewCycle(name: String, cycleType: CycleType, startWorkoutName: String)
    suspend fun endCycle(archiveUnfinished: Boolean)
}

class InMemoryPlanRepository : PlanRepository {
    private val _activeCycle = MutableStateFlow<TrainingCycle?>(SampleData.initialCycle)
    private val _allCycles = MutableStateFlow<List<TrainingCycle>>(listOf(SampleData.initialCycle))

    override fun getActiveCycle(): Flow<TrainingCycle?> = _activeCycle.asStateFlow()

    override fun getAllCycles(): Flow<List<TrainingCycle>> = _allCycles.asStateFlow()

    override suspend fun updateScheduleEntry(updatedEntry: DayScheduleEntry) {
        val current = _activeCycle.value ?: return
        val updatedSchedule = current.scheduleEntries.map { entry ->
            if (entry.dateIso == updatedEntry.dateIso) {
                updatedEntry
            } else {
                entry
            }
        }
        val updatedCycle = current.copy(scheduleEntries = updatedSchedule)
        _activeCycle.value = updatedCycle
        _allCycles.value = _allCycles.value.map { if (it.id == current.id) updatedCycle else it }
    }

    override suspend fun copyWeekToFuture(sourceStartIndex: Int, targetStartIndex: Int, selectedDayIndices: List<Int>) {
        val current = _activeCycle.value ?: return
        val entries = current.scheduleEntries.toMutableList()

        if (sourceStartIndex >= targetStartIndex) {
            // Enforcement: Copying is only allowed to future weeks
            return
        }

        for (dayOffset in selectedDayIndices) {
            val srcIdx = sourceStartIndex + dayOffset
            val tgtIdx = targetStartIndex + dayOffset
            if (srcIdx < entries.size && tgtIdx < entries.size) {
                val srcEntry = entries[srcIdx]
                val tgtEntry = entries[tgtIdx]
                // Only copy workout template and day type. Never copy completion status or actual session flag
                entries[tgtIdx] = tgtEntry.copy(
                    dayType = srcEntry.dayType,
                    workoutTemplateId = srcEntry.workoutTemplateId,
                    workoutName = srcEntry.workoutName,
                    status = CompletionStatus.NIEROZSTRZYGNIETY,
                    hasActualSession = false
                )
            }
        }
        val updatedCycle = current.copy(scheduleEntries = entries)
        _activeCycle.value = updatedCycle
        _allCycles.value = _allCycles.value.map { if (it.id == current.id) updatedCycle else it }
    }

    override suspend fun advanceRotation() {
        val current = _activeCycle.value ?: return
        if (current.rotationSequence.isEmpty()) return
        val nextIdx = (current.currentRotationIndex + 1) % current.rotationSequence.size
        val updated = current.copy(currentRotationIndex = nextIdx)
        _activeCycle.value = updated
        _allCycles.value = _allCycles.value.map { if (it.id == current.id) updated else it }
    }

    override suspend fun skipCurrentRotation() {
        advanceRotation()
    }

    override suspend fun startNewCycle(name: String, cycleType: CycleType, startWorkoutName: String) {
        val current = _activeCycle.value
        val sequence = current?.rotationSequence ?: listOf("Push A", "Pull A", "Legs A")
        val startIdx = sequence.indexOf(startWorkoutName).let { if (it >= 0) it else 0 }

        val newCycle = TrainingCycle(
            id = "cycle_${UUID.randomUUID()}",
            name = name,
            cycleType = cycleType,
            startDateIso = "2026-10-01",
            endDateIso = "2026-12-01",
            isActive = true,
            scheduleEntries = SampleData.sampleCycleSchedule,
            rotationSequence = sequence,
            currentRotationIndex = startIdx
        )
        _activeCycle.value = newCycle
        _allCycles.value = _allCycles.value + newCycle
    }

    override suspend fun endCycle(archiveUnfinished: Boolean) {
        val current = _activeCycle.value ?: return
        val updated = current.copy(isActive = false)
        _activeCycle.value = updated
        _allCycles.value = _allCycles.value.map { if (it.id == current.id) updated else it }
    }
}
