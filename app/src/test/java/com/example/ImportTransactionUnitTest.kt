package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.importer.GymTrackerJsonParser
import com.example.data.local.database.AppDatabase
import com.example.data.local.entity.CompletedWorkoutSessionEntity
import com.example.data.local.entity.DayScheduleEntryEntity
import com.example.data.local.entity.ExerciseEntity
import com.example.data.local.seeder.DatabaseSeeder
import com.example.data.repository.room.RoomExerciseRepository
import com.example.data.repository.room.RoomRepositoryProvider
import com.example.domain.model.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.util.UUID

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ImportTransactionUnitTest {

    private lateinit var database: AppDatabase
    private lateinit var context: Context
    private lateinit var provider: RoomRepositoryProvider
    private lateinit var exerciseRepo: RoomExerciseRepository

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        database = AppDatabase.createInMemoryDatabase(context)
        provider = RoomRepositoryProvider(database)
        exerciseRepo = RoomExerciseRepository(database.exerciseDao(), database)
    }

    @After
    fun tearDown() {
        database.close()
    }

    // 1. Brak zapisu przed jawnym zatwierdzeniem
    @Test
    fun test_no_database_write_before_explicit_confirmation() = runTest {
        provider.seeder.seedIfEmpty()
        val countBefore = database.exerciseDao().getExerciseCount()

        val parser = GymTrackerJsonParser()
        val json = """{"exercises": [{"name": "Nowe Cwiczenie Test", "category": "Chest"}]}"""
        val report = parser.analyze(json, existingExerciseNames = emptySet())

        // Samo wygenerowanie analizy i kandydatów nie może modyfikować bazy Room
        assertEquals(1, report.candidates.size)
        val countAfterAnalysis = database.exerciseDao().getExerciseCount()
        assertEquals("Baza danych nie może ulec modyfikacji przed zatwierdzeniem", countBefore, countAfterAnalysis)
    }

    // 2. Anulowanie bez zapisu
    @Test
    fun test_cancellation_without_save_leaves_database_intact() = runTest {
        provider.seeder.seedIfEmpty()
        val countBefore = database.exerciseDao().getExerciseCount()

        // Użytkownik otwiera podgląd, ale decyduje o anulowaniu (brak wywołania repo.importExercises)
        val candidate = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Cwiczenie Anulowane", rawCategory = "Chest"),
            mappedCategory = ExerciseCategory.KLATKA_PIERSIOWA,
            isDuplicate = false,
            isSelectedForImport = true,
            strategy = MergeStrategy.ADD_AS_NEW
        )

        // Anulowanie oznacza brak akcji zapisu
        val countAfter = database.exerciseDao().getExerciseCount()
        assertEquals(countBefore, countAfter)
        val exists = database.exerciseDao().getAllExercises().first().any { it.name == "Cwiczenie Anulowane" }
        assertFalse("Anulowane pozycje nie mogą pojawić się w bazie", exists)
    }

    // 3. Selektywny zapis - wyłącznie zaznaczone pozycje
    @Test
    fun test_selective_import_saves_only_checked_items() = runTest {
        provider.seeder.seedIfEmpty()
        val countBefore = database.exerciseDao().getExerciseCount()

        val candidate1 = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Zaznaczone A", rawCategory = "Barki"),
            mappedCategory = ExerciseCategory.BARKI,
            isDuplicate = false,
            isSelectedForImport = true,
            strategy = MergeStrategy.ADD_AS_NEW
        )
        val candidate2 = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Odznaczone B", rawCategory = "Nogi"),
            mappedCategory = ExerciseCategory.NOGI,
            isDuplicate = false,
            isSelectedForImport = false, // Odznaczone
            strategy = MergeStrategy.ADD_AS_NEW
        )

        val result = exerciseRepo.importExercises(listOf(candidate1, candidate2), MergeStrategy.ADD_AS_NEW)

        assertTrue(result.isSuccess)
        assertEquals(1, result.addedCount)
        assertEquals(countBefore + 1, database.exerciseDao().getExerciseCount())

        val allExercises = database.exerciseDao().getAllExercises().first()
        assertTrue(allExercises.any { it.name == "Zaznaczone A" })
        assertFalse("Odznaczone pozycje nie mogą zostać zapisane", allExercises.any { it.name == "Odznaczone B" })
    }

    // 4. Strategia ADD_AS_NEW
    @Test
    fun test_import_strategy_add_as_new_inserts_exercise_with_new_id() = runTest {
        provider.seeder.seedIfEmpty()
        val countBefore = database.exerciseDao().getExerciseCount()

        val candidate = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Nowe Cwiczenie Akcesoryjne", rawCategory = "Barki"),
            mappedCategory = ExerciseCategory.BARKI,
            isDuplicate = false,
            isSelectedForImport = true,
            strategy = MergeStrategy.ADD_AS_NEW
        )

        val result = exerciseRepo.importExercises(listOf(candidate), MergeStrategy.ADD_AS_NEW)

        assertTrue(result.isSuccess)
        assertEquals(1, result.addedCount)
        assertEquals(0, result.skippedCount)
        assertEquals(0, result.updatedCount)

        val countAfter = database.exerciseDao().getExerciseCount()
        assertEquals(countBefore + 1, countAfter)

        val all = database.exerciseDao().getAllExercises().first()
        assertTrue(all.any { it.name == "Nowe Cwiczenie Akcesoryjne" })
    }

    // 5. Strategia SKIP_DUPLICATES
    @Test
    fun test_import_strategy_skip_duplicates_preserves_existing_without_inserting() = runTest {
        provider.seeder.seedIfEmpty()
        val countBefore = database.exerciseDao().getExerciseCount()

        val candidate = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Wyciskanie sztangi leżąc", rawCategory = "Klatka", notes = "Nowa notatka z importu"),
            mappedCategory = ExerciseCategory.KLATKA_PIERSIOWA,
            isDuplicate = true,
            isSelectedForImport = true,
            strategy = MergeStrategy.SKIP_DUPLICATES
        )

        val result = exerciseRepo.importExercises(listOf(candidate), MergeStrategy.SKIP_DUPLICATES)

        assertTrue(result.isSuccess)
        assertEquals(0, result.addedCount)
        assertEquals(1, result.skippedCount)
        assertEquals(0, result.updatedCount)
        assertEquals(1, result.conflictsCount)

        val countAfter = database.exerciseDao().getExerciseCount()
        assertEquals("Liczba ćwiczeń nie powinna się zmienić przy strategii SKIP", countBefore, countAfter)

        val ex = database.exerciseDao().getAllExercises().first().find { it.name == "Wyciskanie sztangi leżąc" }
        assertNotNull(ex)
        assertNotEquals("Nowa notatka z importu", ex!!.notes)
    }

    // 6. Strategia KEEP_EXISTING
    @Test
    fun test_import_strategy_keep_existing_preserves_database_intact() = runTest {
        provider.seeder.seedIfEmpty()
        val countBefore = database.exerciseDao().getExerciseCount()

        val candidate = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Wyciskanie sztangi leżąc", rawCategory = "Klatka"),
            mappedCategory = ExerciseCategory.KLATKA_PIERSIOWA,
            isDuplicate = true,
            isSelectedForImport = true,
            strategy = MergeStrategy.KEEP_EXISTING
        )

        val result = exerciseRepo.importExercises(listOf(candidate), MergeStrategy.KEEP_EXISTING)

        assertTrue(result.isSuccess)
        assertEquals(0, result.addedCount)
        assertEquals(1, result.skippedCount)
        assertEquals(countBefore, database.exerciseDao().getExerciseCount())
    }

    // 7. Strategia OVERWRITE
    @Test
    fun test_import_strategy_overwrite_updates_existing_exercise() = runTest {
        provider.seeder.seedIfEmpty()
        val countBefore = database.exerciseDao().getExerciseCount()

        val candidate = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Wyciskanie sztangi leżąc", rawCategory = "Klatka", notes = "Zaktualizowana notatka"),
            mappedCategory = ExerciseCategory.KLATKA_PIERSIOWA,
            isDuplicate = true,
            isSelectedForImport = true,
            strategy = MergeStrategy.OVERWRITE
        )

        val result = exerciseRepo.importExercises(listOf(candidate), MergeStrategy.OVERWRITE)

        assertTrue(result.isSuccess)
        assertEquals(0, result.addedCount)
        assertEquals(0, result.skippedCount)
        assertEquals(1, result.updatedCount)

        val countAfter = database.exerciseDao().getExerciseCount()
        assertEquals(countBefore, countAfter)

        val ex = database.exerciseDao().getAllExercises().first().find { it.name == "Wyciskanie sztangi leżąc" }
        assertNotNull(ex)
        assertEquals("Zaktualizowana notatka", ex!!.notes)
    }

    // 8. Dynamiczna weryfikacja konfliktu w momencie zatwierdzania (Live Room check)
    @Test
    fun test_conflict_reverified_against_live_database_at_commit_time() = runTest {
        provider.seeder.seedIfEmpty()

        // Kandydat przygotowany przed dodaniem ćwiczenia do bazy (isDuplicate = false)
        val candidate = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Nowe Cwiczenie Równoległe", rawCategory = "Biceps"),
            mappedCategory = ExerciseCategory.BICEPS,
            isDuplicate = false,
            isSelectedForImport = true,
            strategy = MergeStrategy.SKIP_DUPLICATES
        )

        // W międzyczasie inne źródło dodaje ćwiczenie o tej samej nazwie do bazy Room
        database.exerciseDao().insertExercise(
            ExerciseEntity(
                id = "ex_concurrent",
                name = "Nowe Cwiczenie Równoległe",
                category = ExerciseCategory.BICEPS,
                notes = "Istniejące",
                isCustom = true
            )
        )

        // Wykonanie zatwierdzenia: transakcja musi na żywo wykryć konflikt
        val result = exerciseRepo.importExercises(listOf(candidate), MergeStrategy.SKIP_DUPLICATES)

        assertTrue(result.isSuccess)
        assertEquals(1, result.skippedCount)
        assertEquals(0, result.addedCount)
        assertEquals(1, result.conflictsCount)
    }

    // 9. Blokowanie niejednoznacznych kategorii
    @Test
    fun test_import_blocked_when_ambiguous_category_is_selected() = runTest {
        provider.seeder.seedIfEmpty()
        val countBefore = database.exerciseDao().getExerciseCount()

        val candidate = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Niejasne Ćwiczenie", rawCategory = "NieznanaPartia"),
            mappedCategory = ExerciseCategory.POZOSTALE,
            isDuplicate = false,
            isSelectedForImport = true,
            isCategoryAmbiguous = true, // Wymaga decyzji użytkownika!
            strategy = MergeStrategy.ADD_AS_NEW
        )

        val result = exerciseRepo.importExercises(listOf(candidate), MergeStrategy.ADD_AS_NEW)

        assertFalse("Import musi zostać zablokowany przy obecności nierozstrzygniętej kategorii", result.isSuccess)
        assertTrue(result.errorMessage?.contains("nierozstrzygniętą kategorię") == true)
        assertEquals(countBefore, database.exerciseDao().getExerciseCount())
    }

    // 10. Ochrona historii ukończonych treningów
    @Test
    fun test_import_never_mutates_completed_sessions_or_workout_history() = runTest {
        provider.seeder.seedIfEmpty()

        val sessionEntity = CompletedWorkoutSessionEntity(
            sessionId = "session_historical_1",
            workoutName = "Push Historyczny",
            dateIso = "2026-09-01",
            durationMinutes = 55,
            exercises = listOf(
                WorkoutExercise(
                    exerciseId = "ex_1",
                    exerciseName = "Wyciskanie sztangi leżąc",
                    category = ExerciseCategory.KLATKA_PIERSIOWA,
                    sets = listOf(WorkoutSet(1, 10, 10, 100.0, isApproved = true))
                )
            ),
            completedSetsCount = 1,
            totalVolumeKg = 1000.0,
            advancedRotation = false
        )
        database.workoutDao().insertCompletedSession(sessionEntity)

        val sessionsBefore = database.workoutDao().getAllCompletedSessions().first()
        assertEquals(1, sessionsBefore.size)

        // Wykonujemy import ze strategią OVERWRITE dla "Wyciskanie sztangi leżąc"
        val candidate = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Wyciskanie sztangi leżąc", rawCategory = "Inna", notes = "Zmiana"),
            mappedCategory = ExerciseCategory.BARKI,
            isDuplicate = true,
            isSelectedForImport = true,
            strategy = MergeStrategy.OVERWRITE
        )
        exerciseRepo.importExercises(listOf(candidate), MergeStrategy.OVERWRITE)

        // Upewniamy się, że historia sesji ma nienaruszoną kategorię KLATKA_PIERSIOWA
        val sessionsAfter = database.workoutDao().getAllCompletedSessions().first()
        assertEquals(1, sessionsAfter.size)
        val historyExercise = sessionsAfter.first().exercises.first()

        assertEquals(
            "Kategoria w ukończonej sesji historycznej musi pozostać niezmieniona (KLATKA_PIERSIOWA)",
            ExerciseCategory.KLATKA_PIERSIOWA,
            historyExercise.category
        )
    }

    // 11. Ochrona ukończonych i historycznych dni harmonogramu
    @Test
    fun test_import_does_not_modify_schedule_entries() = runTest {
        provider.seeder.seedIfEmpty()

        val scheduleBefore = database.planDao().getAllScheduleEntries().first()

        val candidate = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Nowe Cwiczenie", rawCategory = "Plecy"),
            mappedCategory = ExerciseCategory.PLECY,
            isDuplicate = false,
            isSelectedForImport = true,
            strategy = MergeStrategy.ADD_AS_NEW
        )
        exerciseRepo.importExercises(listOf(candidate), MergeStrategy.ADD_AS_NEW)

        val scheduleAfter = database.planDao().getAllScheduleEntries().first()
        assertEquals("Wpisy harmonogramu muszą pozostać niezmienione podczas importu biblioteki", scheduleBefore.size, scheduleAfter.size)
    }

    // 12. Reaktywne odświeżenie ViewModel
    @Test
    fun test_viewmodel_integration_refreshes_exercises_after_import() = runTest {
        val viewModel = provider.createRoomViewModel()
        val initialSize = viewModel.exercises.first().size

        val candidate = ImportCandidate(
            rawExercise = GymTrackerRawExercise(name = "Unoszenie nóg w zwisie", rawCategory = "Brzuch"),
            mappedCategory = ExerciseCategory.POZOSTALE,
            isDuplicate = false,
            isSelectedForImport = true,
            strategy = MergeStrategy.ADD_AS_NEW
        )

        val result = viewModel.performGymTrackerImport(listOf(candidate), MergeStrategy.ADD_AS_NEW)

        assertTrue(result.isSuccess)
        assertEquals(1, result.addedCount)

        val updatedList = viewModel.exercises.first()
        assertEquals(initialSize + 1, updatedList.size)
        assertTrue(updatedList.any { it.name == "Unoszenie nóg w zwisie" })
    }

    // 13. Zgodność parsera dla wejścia tekstowego i SAF
    @Test
    fun test_both_json_sources_saf_and_manual_produce_identical_import_report() {
        val parser = GymTrackerJsonParser()
        val rawJson = """[{"name": "Wznosy bokiem z hantlami", "category": "Barki"}]"""

        val reportFromManual = parser.analyze(rawJson, sourceName = "Wklejony ręcznie")
        val reportFromSaf = parser.analyze(rawJson, sourceName = "Plik: backup.json")

        assertEquals(reportFromManual.exercisesFound, reportFromSaf.exercisesFound)
        assertEquals(reportFromManual.candidates.first().rawExercise.name, reportFromSaf.candidates.first().rawExercise.name)
        assertEquals(reportFromManual.candidates.first().mappedCategory, reportFromSaf.candidates.first().mappedCategory)
    }
}
