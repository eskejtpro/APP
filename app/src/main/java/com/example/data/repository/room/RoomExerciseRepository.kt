package com.example.data.repository.room

import androidx.room.withTransaction
import com.example.data.local.dao.ExerciseDao
import com.example.data.local.database.AppDatabase
import com.example.data.local.entity.ExerciseEntity
import com.example.data.repository.ExerciseRepository
import com.example.domain.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.util.UUID

class RoomExerciseRepository(
    private val exerciseDao: ExerciseDao,
    private val database: AppDatabase? = null
) : ExerciseRepository {

    override fun getExercises(): Flow<List<Exercise>> {
        return exerciseDao.getAllExercises().map { list ->
            list.map { it.toDomain() }
        }
    }

    override suspend fun addExercise(exercise: Exercise) {
        exerciseDao.insertExercise(ExerciseEntity.fromDomain(exercise))
    }

    override suspend fun updateExercise(exercise: Exercise) {
        exerciseDao.updateExercise(ExerciseEntity.fromDomain(exercise))
    }

    override suspend fun deleteExercise(id: String) {
        exerciseDao.deleteExerciseById(id)
    }

    override suspend fun importExercises(
        candidates: List<ImportCandidate>,
        defaultStrategy: MergeStrategy
    ): ImportExecutionResult {
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
                errorMessage = "Nie można zatwierdzić importu: wybrane pozycje zawierają nierozstrzygniętą kategorię wymagającą decyzji użytkownika."
            )
        }

        return try {
            val executionBlock: suspend () -> ImportExecutionResult = {
                val currentList = exerciseDao.getAllExercises().first().map { it.toDomain() }
                val toInsert = mutableListOf<ExerciseEntity>()
                var added = 0
                var skipped = 0
                var updated = 0
                var conflicts = 0

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
                                val updatedEntity = existing.copy(
                                    category = candidate.mappedCategory,
                                    notes = candidate.rawExercise.notes
                                )
                                exerciseDao.updateExercise(ExerciseEntity.fromDomain(updatedEntity))
                                updated++
                            }
                            MergeStrategy.ADD_AS_NEW -> {
                                val newEx = Exercise(
                                    id = UUID.randomUUID().toString(),
                                    name = "${candidate.rawExercise.name} (Import)",
                                    category = candidate.mappedCategory,
                                    notes = candidate.rawExercise.notes,
                                    isCustom = true
                                )
                                toInsert.add(ExerciseEntity.fromDomain(newEx))
                                added++
                            }
                        }
                    } else {
                        val newEx = Exercise(
                            id = UUID.randomUUID().toString(),
                            name = candidate.rawExercise.name,
                            category = candidate.mappedCategory,
                            notes = candidate.rawExercise.notes,
                            isCustom = true
                        )
                        toInsert.add(ExerciseEntity.fromDomain(newEx))
                        added++
                    }
                }

                if (toInsert.isNotEmpty()) {
                    exerciseDao.insertExercises(toInsert)
                }

                ImportExecutionResult(
                    isSuccess = true,
                    addedCount = added,
                    skippedCount = skipped,
                    updatedCount = updated,
                    conflictsCount = conflicts
                )
            }

            if (database != null) {
                database.withTransaction {
                    executionBlock()
                }
            } else {
                executionBlock()
            }
        } catch (e: Exception) {
            ImportExecutionResult(
                isSuccess = false,
                errorMessage = "Błąd transakcji Room: ${e.localizedMessage ?: "Nieoczekiwany wyjątek"}"
            )
        }
    }
}
