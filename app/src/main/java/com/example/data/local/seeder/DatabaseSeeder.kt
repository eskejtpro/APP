package com.example.data.local.seeder

import androidx.room.withTransaction
import com.example.data.local.database.AppDatabase
import com.example.data.local.entity.*
import com.example.data.sample.SampleData
import com.example.domain.model.AppSettings

class DatabaseSeeder(
    private val database: AppDatabase
) {

    /**
     * Bezpiecznie zasila bazę Room danymi początkowymi tylko wtedy, gdy baza jest całkowicie pusta.
     * Zwraca true jeśli wykonano seedowanie, false jeśli baza zawierała już dane użytkownika.
     */
    suspend fun seedIfEmpty(): Boolean {
        val exerciseCount = database.exerciseDao().getExerciseCount()
        val cycleCount = database.planDao().getCycleCount()

        // Jeśli w bazie znajdują się już jakiekolwiek ćwiczenia lub cykle, natychmiast przerywamy operację.
        // Gwarantuje to brak nadpisywania, brak usuwania danych i brak duplikatów.
        if (exerciseCount > 0 || cycleCount > 0) {
            return false
        }

        database.withTransaction {
            // 1. Zasilenie przykładowych ćwiczeń (dokładnie 7 kategorii głównych)
            val exerciseEntities = SampleData.exercisesList.map { ExerciseEntity.fromDomain(it) }
            database.exerciseDao().insertExercises(exerciseEntities)

            // 2. Zasilenie szablonów treningowych
            val templateEntities = SampleData.templates.map { WorkoutTemplateEntity.fromDomain(it) }
            database.workoutDao().insertTemplates(templateEntities)

            // 3. Zasilenie przykładowego cyklu treningowego (PPL rotacyjny)
            val cycle = SampleData.initialCycle
            val cycleEntity = TrainingCycleEntity(
                id = cycle.id,
                name = cycle.name,
                cycleType = cycle.cycleType,
                startDateIso = cycle.startDateIso,
                endDateIso = cycle.endDateIso,
                isActive = cycle.isActive,
                rotationSequence = cycle.rotationSequence,
                currentRotationIndex = cycle.currentRotationIndex
            )
            database.planDao().insertCycle(cycleEntity)

            // 4. Zasilenie harmonogramu dni dla cyklu
            val scheduleEntities = SampleData.sampleCycleSchedule.map {
                DayScheduleEntryEntity.fromDomain(cycle.id, it)
            }
            database.planDao().insertOrUpdateEntries(scheduleEntities)

            // 5. Zasilenie przykładowej przerwanej sesji (szkic roboczy)
            val draftEntity = ActiveSessionDraftEntity.fromDomain(SampleData.initialInterruptedDraft)
            database.workoutDao().insertOrUpdateDraft(draftEntity)

            // 6. Zasilenie wpisów substancji do weryfikacji
            for (sub in SampleData.sampleSubstanceEntries) {
                database.calendarDao().insertSubstance(SubstanceEntryEntity.fromDomain(sub))
            }

            // 7. Zasilenie przykładowych notatek
            for (note in SampleData.sampleNotes) {
                database.calendarDao().insertNote(NoteEntryEntity.fromDomain(note))
            }

            // 8. Domyślne ustawienia aplikacji
            database.settingsDao().insertOrUpdateSettings(AppSettingsEntity.fromDomain(AppSettings()))
        }

        return true
    }
}
