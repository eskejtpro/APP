package com.example.data.local.entity

import androidx.room.Entity
import com.example.domain.model.CompletionStatus
import com.example.domain.model.DayPlanType
import com.example.domain.model.DayScheduleEntry

@Entity(
    tableName = "day_schedule_entries",
    primaryKeys = ["cycleId", "dateIso"]
)
data class DayScheduleEntryEntity(
    val cycleId: String,
    val dateIso: String,
    val dayOfWeekName: String,
    val dayType: DayPlanType,
    val workoutTemplateId: String? = null,
    val workoutName: String? = null,
    val status: CompletionStatus = CompletionStatus.NIEROZSTRZYGNIETY,
    val hasActualSession: Boolean = false,
    val notes: String = ""
) {
    fun toDomain(): DayScheduleEntry = DayScheduleEntry(
        dateIso = dateIso,
        dayOfWeekName = dayOfWeekName,
        dayType = dayType,
        workoutTemplateId = workoutTemplateId,
        workoutName = workoutName,
        status = status,
        hasActualSession = hasActualSession,
        notes = notes
    )

    companion object {
        fun fromDomain(cycleId: String, domain: DayScheduleEntry): DayScheduleEntryEntity = DayScheduleEntryEntity(
            cycleId = cycleId,
            dateIso = domain.dateIso,
            dayOfWeekName = domain.dayOfWeekName,
            dayType = domain.dayType,
            workoutTemplateId = domain.workoutTemplateId,
            workoutName = domain.workoutName,
            status = domain.status,
            hasActualSession = domain.hasActualSession,
            notes = domain.notes
        )
    }
}
