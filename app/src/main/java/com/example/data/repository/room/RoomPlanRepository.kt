package com.example.data.repository.room

import com.example.data.local.dao.PlanDao
import com.example.data.local.entity.DayScheduleEntryEntity
import com.example.data.local.entity.TrainingCycleEntity
import com.example.data.repository.PlanRepository
import com.example.domain.model.*
import kotlinx.coroutines.flow.*
import java.util.UUID

class RoomPlanRepository(
    private val planDao: PlanDao
) : PlanRepository {

    override fun getActiveCycle(): Flow<TrainingCycle?> {
        return planDao.getActiveCycle().flatMapLatest { cycleEntity ->
            if (cycleEntity == null) {
                flowOf(null)
            } else {
                planDao.getEntriesForCycle(cycleEntity.id).map { entries ->
                    TrainingCycle(
                        id = cycleEntity.id,
                        name = cycleEntity.name,
                        cycleType = cycleEntity.cycleType,
                        startDateIso = cycleEntity.startDateIso,
                        endDateIso = cycleEntity.endDateIso,
                        isActive = cycleEntity.isActive,
                        scheduleEntries = entries.map { it.toDomain() },
                        rotationSequence = cycleEntity.rotationSequence,
                        currentRotationIndex = cycleEntity.currentRotationIndex
                    )
                }
            }
        }
    }

    override fun getAllCycles(): Flow<List<TrainingCycle>> {
        return planDao.getAllCycles().map { cycles ->
            cycles.map { c ->
                TrainingCycle(
                    id = c.id,
                    name = c.name,
                    cycleType = c.cycleType,
                    startDateIso = c.startDateIso,
                    endDateIso = c.endDateIso,
                    isActive = c.isActive,
                    scheduleEntries = emptyList(),
                    rotationSequence = c.rotationSequence,
                    currentRotationIndex = c.currentRotationIndex
                )
            }
        }
    }

    override suspend fun updateScheduleEntry(updatedEntry: DayScheduleEntry) {
        val activeCycle = getActiveCycle().first() ?: return
        val entity = DayScheduleEntryEntity.fromDomain(activeCycle.id, updatedEntry)
        planDao.insertOrUpdateEntry(entity)
    }

    override suspend fun copyWeekToFuture(
        sourceStartIndex: Int,
        targetStartIndex: Int,
        selectedDayIndices: List<Int>
    ) {
        if (sourceStartIndex >= targetStartIndex) return
        val activeCycle = getActiveCycle().first() ?: return
        val entries = activeCycle.scheduleEntries

        val updatedEntities = mutableListOf<DayScheduleEntryEntity>()
        for (dayOffset in selectedDayIndices) {
            val srcIdx = sourceStartIndex + dayOffset
            val tgtIdx = targetStartIndex + dayOffset
            if (srcIdx < entries.size && tgtIdx < entries.size) {
                val src = entries[srcIdx]
                val tgt = entries[tgtIdx]
                val copiedDomain = tgt.copy(
                    dayType = src.dayType,
                    workoutTemplateId = src.workoutTemplateId,
                    workoutName = src.workoutName,
                    status = CompletionStatus.NIEROZSTRZYGNIETY,
                    hasActualSession = false
                )
                updatedEntities.add(DayScheduleEntryEntity.fromDomain(activeCycle.id, copiedDomain))
            }
        }
        if (updatedEntities.isNotEmpty()) {
            planDao.insertOrUpdateEntries(updatedEntities)
        }
    }

    override suspend fun advanceRotation() {
        val activeCycle = getActiveCycle().first() ?: return
        if (activeCycle.rotationSequence.isEmpty()) return
        val nextIdx = (activeCycle.currentRotationIndex + 1) % activeCycle.rotationSequence.size

        val updatedEntity = TrainingCycleEntity(
            id = activeCycle.id,
            name = activeCycle.name,
            cycleType = activeCycle.cycleType,
            startDateIso = activeCycle.startDateIso,
            endDateIso = activeCycle.endDateIso,
            isActive = activeCycle.isActive,
            rotationSequence = activeCycle.rotationSequence,
            currentRotationIndex = nextIdx
        )
        planDao.updateCycle(updatedEntity)
    }

    override suspend fun skipCurrentRotation() {
        advanceRotation()
    }

    override suspend fun startNewCycle(name: String, cycleType: CycleType, startWorkoutName: String) {
        val activeCycle = getActiveCycle().first()
        val sequence = activeCycle?.rotationSequence ?: listOf("Push A", "Pull A", "Legs A")
        val startIdx = sequence.indexOf(startWorkoutName).let { if (it >= 0) it else 0 }

        val newCycleId = "cycle_${UUID.randomUUID()}"
        val newCycleEntity = TrainingCycleEntity(
            id = newCycleId,
            name = name,
            cycleType = cycleType,
            startDateIso = "2026-10-01",
            endDateIso = "2026-12-01",
            isActive = true,
            rotationSequence = sequence,
            currentRotationIndex = startIdx
        )
        planDao.insertCycle(newCycleEntity)
    }

    override suspend fun endCycle(archiveUnfinished: Boolean) {
        val activeCycle = getActiveCycle().first() ?: return
        val updatedEntity = TrainingCycleEntity(
            id = activeCycle.id,
            name = activeCycle.name,
            cycleType = activeCycle.cycleType,
            startDateIso = activeCycle.startDateIso,
            endDateIso = activeCycle.endDateIso,
            isActive = false,
            rotationSequence = activeCycle.rotationSequence,
            currentRotationIndex = activeCycle.currentRotationIndex
        )
        planDao.updateCycle(updatedEntity)
    }
}
