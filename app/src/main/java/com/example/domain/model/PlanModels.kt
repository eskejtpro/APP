package com.example.domain.model

enum class DayPlanType(val displayName: String) {
    ASSIGNED_WORKOUT("Przypisany trening"),
    REST_DAY("Dzień wolny"),
    NO_PLAN("Brak planu")
}

enum class CompletionStatus(val displayName: String) {
    WYKONANY("Wykonany"),
    NIEWYKONANY("Niewykonany"),
    NIEROZSTRZYGNIETY("Nierozstrzygnięty")
}

enum class CycleType(val displayName: String) {
    WEEKLY("Plan tygodniowy"),
    ROTATIONAL("Plan rotacyjny"),
    CUSTOM("Własny harmonogram")
}

data class DayScheduleEntry(
    val dateIso: String, // Format: YYYY-MM-DD
    val dayOfWeekName: String, // Poniedziałek, Wtorek, etc.
    val dayType: DayPlanType,
    val workoutTemplateId: String? = null,
    val workoutName: String? = null,
    val status: CompletionStatus = CompletionStatus.NIEROZSTRZYGNIETY,
    val hasActualSession: Boolean = false,
    val notes: String = ""
)

data class TrainingCycle(
    val id: String,
    val name: String,
    val cycleType: CycleType,
    val startDateIso: String,
    val endDateIso: String,
    val isActive: Boolean = true,
    val scheduleEntries: List<DayScheduleEntry>,
    val rotationSequence: List<String> = emptyList(),
    val currentRotationIndex: Int = 0
)
