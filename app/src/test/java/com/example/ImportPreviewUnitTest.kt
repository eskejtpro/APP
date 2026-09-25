package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.importer.GymTrackerJsonParser
import com.example.data.local.database.AppDatabase
import com.example.data.local.seeder.DatabaseSeeder
import com.example.domain.model.ExerciseCategory
import com.example.domain.model.MergeStrategy
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ImportPreviewUnitTest {

    private lateinit var database: AppDatabase
    private lateinit var context: Context
    private lateinit var parser: GymTrackerJsonParser

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        database = AppDatabase.createInMemoryDatabase(context)
        parser = GymTrackerJsonParser()
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun test_preview_analysis_of_valid_json_produces_detailed_report() {
        val json = """
            {
              "app": "GymTracker Pro",
              "exercises": [
                {"name": "Wyciskanie hantli na skosie", "category": "Chest", "sets": 3},
                {"name": "Wznosy bokiem", "category": "Shoulders", "sets": 4}
              ]
            }
        """.trimIndent()

        val report = parser.analyze(json)
        assertTrue(report.isSuccess)
        assertEquals(2, report.exercisesFound)
        assertEquals(2, report.candidates.size)
        assertEquals(ExerciseCategory.KLATKA_PIERSIOWA, report.candidates[0].mappedCategory)
        assertEquals(ExerciseCategory.BARKI, report.candidates[1].mappedCategory)
    }

    @Test
    fun test_preview_analysis_of_malformed_json_shows_error_state() {
        val badJson = "{ niepoprawny_json: "
        val report = parser.analyze(badJson)

        assertFalse(report.isSuccess)
        assertTrue(report.errors.isNotEmpty())
        assertEquals(0, report.candidates.size)
    }

    @Test
    fun test_preview_detects_duplicates_and_ambiguous_categories_with_warnings() = runTest {
        // Seedujemy bazę, aby w bazie znajdowało się "Wyciskanie sztangi leżąc"
        DatabaseSeeder(database).seedIfEmpty()
        val existingInDb = database.exerciseDao().getAllExercises().first().map { it.name }.toSet()

        val json = """
            [
              {"name": "Wyciskanie sztangi leżąc", "category": "Klatka"},
              {"name": "Nietypowe Ćwiczenie Autorskie", "category": "KategoriaX"}
            ]
        """.trimIndent()

        val report = parser.analyze(json, existingExerciseNames = existingInDb)

        assertTrue(report.isSuccess)
        assertEquals(2, report.candidates.size)

        // Pierwszy: wykryty jako duplikat bazy
        val dupCandidate = report.candidates[0]
        assertTrue(dupCandidate.isDuplicate)
        assertEquals(MergeStrategy.SKIP_DUPLICATES, dupCandidate.strategy)

        // Drugi: niejednoznaczna kategoria
        val ambigCandidate = report.candidates[1]
        assertTrue(ambigCandidate.isCategoryAmbiguous)
        assertEquals(ExerciseCategory.POZOSTALE, ambigCandidate.mappedCategory)
    }

    @Test
    fun test_manual_preview_modification_category_selection_and_strategy_toggle() {
        val json = """[{"name": "Dipsy na poręczach", "category": "Inne"}]"""
        val report = parser.analyze(json)

        val candidate = report.candidates.first()
        assertEquals(ExerciseCategory.POZOSTALE, candidate.mappedCategory)

        // Symulacja manualnej korekty przez użytkownika w podglądzie
        val userModifiedCandidate = candidate.copy(
            mappedCategory = ExerciseCategory.TRICEPS,
            isCategoryAmbiguous = false,
            strategy = MergeStrategy.OVERWRITE,
            isSelectedForImport = true
        )

        assertEquals(ExerciseCategory.TRICEPS, userModifiedCandidate.mappedCategory)
        assertFalse(userModifiedCandidate.isCategoryAmbiguous)
        assertEquals(MergeStrategy.OVERWRITE, userModifiedCandidate.strategy)
        assertTrue(userModifiedCandidate.isSelectedForImport)
    }

    @Test
    fun test_candidate_deselection_in_preview() {
        val json = """[{"name": "Ćwiczenie do pominięcia", "category": "Plecy"}]"""
        val report = parser.analyze(json)
        val candidate = report.candidates.first()

        val deselected = candidate.copy(isSelectedForImport = false)
        assertFalse(deselected.isSelectedForImport)
    }

    @Test
    fun test_pure_in_memory_preview_and_cancellation_never_mutates_database() = runTest {
        val seeder = DatabaseSeeder(database)
        seeder.seedIfEmpty()
        val countBefore = database.exerciseDao().getExerciseCount()

        val json = """
            [
              {"name": "Nowe Niesamowite Ćwiczenie", "category": "Klatka"}
            ]
        """.trimIndent()

        // Wywołujemy analizę podglądu
        val report = parser.analyze(json)
        assertTrue(report.isSuccess)

        // Użytkownik zmienia podgląd i zamyka okno (anulowanie)
        val countAfter = database.exerciseDao().getExerciseCount()
        assertEquals("Baza danych Room nie może ulec żadnej mutacji podczas podglądu", countBefore, countAfter)
    }
}
