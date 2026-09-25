package com.example.domain.model

enum class MergeStrategy(val displayName: String) {
    SKIP_DUPLICATES("Pomiń"),
    OVERWRITE("Zastąp po potwierdzeniu"),
    ADD_AS_NEW("Dodaj jako nowe"),
    KEEP_EXISTING("Zachowaj istniejące")
}

enum class ImportedDataType(val displayName: String) {
    EXERCISES("Ćwiczenia"),
    WORKOUT_TEMPLATES("Szablony treningowe"),
    TRAINING_CYCLES("Plany / Cykle"),
    COMPLETED_SESSIONS("Historia sesji")
}

data class GymTrackerRawExercise(
    val name: String,
    val rawCategory: String,
    val defaultSets: Int = 3,
    val defaultReps: Int = 10,
    val notes: String = "",
    val unknownFields: Map<String, String> = emptyMap()
)

data class GymTrackerRawTemplate(
    val name: String,
    val description: String = "",
    val exerciseNames: List<String> = emptyList(),
    val unknownFields: Map<String, String> = emptyMap()
)

data class GymTrackerRawCycle(
    val name: String,
    val cycleTypeStr: String = "",
    val workoutNames: List<String> = emptyList(),
    val unknownFields: Map<String, String> = emptyMap()
)

data class GymTrackerRawSession(
    val workoutName: String,
    val dateIso: String,
    val durationMinutes: Int = 0,
    val exerciseNames: List<String> = emptyList(),
    val unknownFields: Map<String, String> = emptyMap()
)

data class ImportCandidate(
    val rawExercise: GymTrackerRawExercise,
    val mappedCategory: ExerciseCategory,
    val isCategoryAmbiguous: Boolean = false,
    val isDuplicate: Boolean = false,
    val existingExerciseId: String? = null,
    val isSelectedForImport: Boolean = true,
    val strategy: MergeStrategy = if (isDuplicate) MergeStrategy.SKIP_DUPLICATES else MergeStrategy.ADD_AS_NEW,
    val validationWarning: String? = null
)

data class ImportWarning(
    val message: String,
    val itemName: String? = null,
    val requiresUserAction: Boolean = false
)

data class ImportError(
    val message: String,
    val rawSnippet: String? = null
)

data class ImportExecutionResult(
    val isSuccess: Boolean,
    val addedCount: Int = 0,
    val skippedCount: Int = 0,
    val updatedCount: Int = 0,
    val conflictsCount: Int = 0,
    val errorMessage: String? = null
)

data class ImportAnalysisReport(
    val isSuccess: Boolean,
    val sourceName: String = "GymTracker Pro",
    val recognizedDataTypes: List<ImportedDataType> = emptyList(),
    val totalFound: Int = 0,
    val exercisesFound: Int = 0,
    val templatesFound: Int = 0,
    val cyclesFound: Int = 0,
    val sessionsFound: Int = 0,
    val duplicatesCount: Int = 0,
    val conflictsCount: Int = 0,
    val newItemsCount: Int = 0,
    val candidates: List<ImportCandidate> = emptyList(),
    val recognizedTemplates: List<GymTrackerRawTemplate> = emptyList(),
    val recognizedCycles: List<GymTrackerRawCycle> = emptyList(),
    val recognizedSessions: List<GymTrackerRawSession> = emptyList(),
    val warnings: List<ImportWarning> = emptyList(),
    val errors: List<ImportError> = emptyList()
)
