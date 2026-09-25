package com.example.data.repository

import com.example.data.sample.SampleData
import com.example.domain.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

interface ExerciseRepository {
    fun getExercises(): Flow<List<Exercise>>
    suspend fun addExercise(exercise: Exercise)
    suspend fun updateExercise(exercise: Exercise)
    suspend fun deleteExercise(id: String)
    suspend fun importExercises(
        candidates: List<ImportCandidate>,
        defaultStrategy: MergeStrategy = MergeStrategy.SKIP_DUPLICATES
    ): ImportExecutionResult
}

class InMemoryExerciseRepository : ExerciseRepository {
    private val _exercises = MutableStateFlow<List<Exercise>>(SampleData.exercisesList)

    override fun getExercises(): Flow<List<Exercise>> = _exercises.asStateFlow()

    override suspend fun addExercise(exercise: Exercise) {
        _exercises.value = _exercises.value + exercise
    }

    override suspend fun updateExercise(exercise: Exercise) {
        _exercises.value = _exercises.value.map {
            if (it.id == exercise.id) exercise else it
        }
    }

    override suspend fun deleteExercise(id: String) {
        _exercises.value = _exercises.value.filterNot { it.id == id }
    }

    override suspend fun importExercises(
        candidates: List<ImportCandidate>,
        defaultStrategy: MergeStrategy
    ): ImportExecutionResult {
        val currentList = _exercises.value.toMutableList()
        var added = 0
        var skipped = 0
        var updated = 0
        var conflicts = 0

        val selected = candidates.filter { it.isSelectedForImport }
        if (selected.isEmpty()) {
            return ImportExecutionResult(
                isSuccess = true,
                addedCount = 0,
                skippedCount = 0,
                updatedCount = 0,
                conflictsCount = 0
            )
        }

        if (selected.any { it.isCategoryAmbiguous }) {
            return ImportExecutionResult(
                isSuccess = false,
                errorMessage = "Nie można zatwierdzić importu: wybrane pozycje zawierają nierozstrzygniętą kategorię."
            )
        }
        for (candidate in selected) {
            val existing = currentList.find { it.name.equals(candidate.rawExercise.name, ignoreCase = true) }
            val effectiveStrategy = candidate.strategy

            if (existing != null) {
                conflicts++
                when (effectiveStrategy) {
                    MergeStrategy.SKIP_DUPLICATES, MergeStrategy.KEEP_EXISTING -> {
                        skipped++
                    }
                    MergeStrategy.OVERWRITE -> {
                        val index = currentList.indexOf(existing)
                        currentList[index] = existing.copy(
                            category = candidate.mappedCategory,
                            notes = candidate.rawExercise.notes
                        )
                        updated++
                    }
                    MergeStrategy.ADD_AS_NEW -> {
                        currentList.add(
                            Exercise(
                                id = UUID.randomUUID().toString(),
                                name = "${candidate.rawExercise.name} (Import)",
                                category = candidate.mappedCategory,
                                notes = candidate.rawExercise.notes,
                                isCustom = true
                            )
                        )
                        added++
                    }
                }
            } else {
                currentList.add(
                    Exercise(
                        id = UUID.randomUUID().toString(),
                        name = candidate.rawExercise.name,
                        category = candidate.mappedCategory,
                        notes = candidate.rawExercise.notes,
                        isCustom = true
                    )
                )
                added++
            }
        }
        _exercises.value = currentList
        return ImportExecutionResult(
            isSuccess = true,
            addedCount = added,
            skippedCount = skipped,
            updatedCount = updated,
            conflictsCount = conflicts
        )
    }
}
