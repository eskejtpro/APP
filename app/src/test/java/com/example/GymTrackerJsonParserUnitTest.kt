package com.example

import com.example.data.importer.GymTrackerJsonParser
import com.example.domain.model.ExerciseCategory
import com.example.domain.model.ImportedDataType
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class GymTrackerJsonParserUnitTest {

    private lateinit var parser: GymTrackerJsonParser

    @Before
    fun setup() {
        parser = GymTrackerJsonParser()
    }

    @Test
    fun test_valid_json_with_exercises_array() {
        val json = """
            [
                {"name": "Wyciskanie sztangi poziomo", "category": "Klatka piersiowa", "sets": 4, "reps": 8, "notes": "Ciężar roboczy 100kg"},
                {"name": "Wiosłowanie sztangą", "category": "Plecy", "sets": 4, "reps": 10},
                {"name": "Wznosy bokiem", "category": "Barki", "sets": 3, "reps": 15}
            ]
        """.trimIndent()

        val report = parser.analyze(json)

        assertTrue(report.isSuccess)
        assertEquals(3, report.exercisesFound)
        assertEquals(3, report.totalFound)
        assertTrue(report.recognizedDataTypes.contains(ImportedDataType.EXERCISES))
        assertEquals(0, report.duplicatesCount)
        assertEquals(0, report.errors.size)

        val first = report.candidates[0]
        assertEquals("Wyciskanie sztangi poziomo", first.rawExercise.name)
        assertEquals(ExerciseCategory.KLATKA_PIERSIOWA, first.mappedCategory)
        assertFalse(first.isCategoryAmbiguous)
    }

    @Test
    fun test_valid_json_with_multiple_data_types() {
        val json = """
            {
                "exercises": [
                    {"name": "Przysiad ze sztangą", "category": "Nogi"}
                ],
                "templates": [
                    {"name": "Legs Power", "description": "Mocny trening nóg", "exercises": ["Przysiad ze sztangą"]}
                ],
                "plans": [
                    {"name": "Cykl Zimowy", "type": "ROTATIONAL", "workouts": ["Legs Power"]}
                ],
                "sessions": [
                    {"workoutName": "Legs Power", "date": "2026-09-24", "durationMinutes": 60}
                ]
            }
        """.trimIndent()

        val report = parser.analyze(json)

        assertTrue(report.isSuccess)
        assertEquals(1, report.exercisesFound)
        assertEquals(1, report.templatesFound)
        assertEquals(1, report.cyclesFound)
        assertEquals(1, report.sessionsFound)
        assertEquals(4, report.totalFound)
        assertEquals(4, report.recognizedDataTypes.size)
    }

    @Test
    fun test_empty_or_blank_json_reports_error() {
        val reportNull = parser.analyze(null)
        assertFalse(reportNull.isSuccess)
        assertTrue(reportNull.errors.isNotEmpty())

        val reportBlank = parser.analyze("   \n\t  ")
        assertFalse(reportBlank.isSuccess)
        assertTrue(reportBlank.errors.isNotEmpty())
    }

    @Test
    fun test_invalid_syntax_json_reports_error() {
        val badJson = "{ invalid_json_syntax: 123, "
        val report = parser.analyze(badJson)

        assertFalse(report.isSuccess)
        assertTrue(report.errors.isNotEmpty())
        assertTrue(report.errors.first().message.contains("Błąd składni JSON"))
    }

    @Test
    fun test_json_with_unknown_unrecognized_structure() {
        val randomJson = """
            {
                "randomField": 12345,
                "someMeta": "unrelated"
            }
        """.trimIndent()

        val report = parser.analyze(randomJson)

        assertFalse(report.isSuccess)
        assertTrue(report.errors.any { it.message.contains("brak rozpoznawalnych sekcji") })
    }

    @Test
    fun test_detects_duplicates_within_payload_and_against_database() {
        val json = """
            [
                {"name": "Wyciskanie żołnierskie", "category": "Barki"},
                {"name": "Wyciskanie żołnierskie", "category": "Barki"},
                {"name": "Podciąganie na drążku", "category": "Plecy"}
            ]
        """.trimIndent()

        val existingInDb = setOf("Podciąganie na drążku")
        val report = parser.analyze(json, existingExerciseNames = existingInDb)

        assertTrue(report.isSuccess)
        assertEquals(3, report.candidates.size)

        // Pierwszy wpis: nowy
        assertFalse(report.candidates[0].isDuplicate)

        // Drugi wpis: duplikat wewnątrz payloadu
        assertTrue(report.candidates[1].isDuplicate)

        // Trzeci wpis: duplikat względem istniejącej bazy
        assertTrue(report.candidates[2].isDuplicate)

        assertEquals(2, report.duplicatesCount)
        assertTrue(report.warnings.any { it.message.contains("Zduplikowana nazwa w pliku importu") })
        assertTrue(report.warnings.any { it.message.contains("już istnieje w lokalnej bazie") })
    }

    @Test
    fun test_detects_missing_required_exercise_name() {
        val json = """
            [
                {"name": "", "category": "Klatka"},
                {"category": "Plecy"},
                {"name": "Uginanie przedramion ze sztangą", "category": "Biceps"}
            ]
        """.trimIndent()

        val report = parser.analyze(json)

        assertTrue(report.isSuccess)
        assertEquals(1, report.candidates.size) // Tylko poprawny rekord z nazwą
        assertEquals(2, report.errors.size)    // 2 błędy braku nazwy
        assertEquals("Uginanie przedramion ze sztangą", report.candidates.first().rawExercise.name)
    }

    @Test
    fun test_maps_known_categories_properly() {
        assertEquals(ExerciseCategory.KLATKA_PIERSIOWA, parser.mapCategorySafely("Klatka piersiowa").category)
        assertEquals(ExerciseCategory.KLATKA_PIERSIOWA, parser.mapCategorySafely("Chest").category)
        assertEquals(ExerciseCategory.PLECY, parser.mapCategorySafely("Plecy").category)
        assertEquals(ExerciseCategory.PLECY, parser.mapCategorySafely("Back").category)
        assertEquals(ExerciseCategory.BARKI, parser.mapCategorySafely("Shoulders").category)
        assertEquals(ExerciseCategory.BARKI, parser.mapCategorySafely("Barki").category)
        assertEquals(ExerciseCategory.NOGI, parser.mapCategorySafely("Czworogłowy / Nogi").category)
        assertEquals(ExerciseCategory.NOGI, parser.mapCategorySafely("Legs").category)
        assertEquals(ExerciseCategory.BICEPS, parser.mapCategorySafely("Biceps").category)
        assertEquals(ExerciseCategory.TRICEPS, parser.mapCategorySafely("Triceps").category)
        assertEquals(ExerciseCategory.POZOSTALE, parser.mapCategorySafely("Brzuch / Core").category)
    }

    @Test
    fun test_maps_unknown_category_to_pozostale_with_warning() {
        val json = """
            [
                {"name": "Tajemnicze ćwiczenie", "category": "SuperNieznanaKategoria123"}
            ]
        """.trimIndent()

        val report = parser.analyze(json)

        assertTrue(report.isSuccess)
        assertEquals(1, report.candidates.size)
        val candidate = report.candidates.first()

        assertEquals(ExerciseCategory.POZOSTALE, candidate.mappedCategory)
        assertTrue("Nieznana kategoria musi być oznaczona jako niejednoznaczna", candidate.isCategoryAmbiguous)
        assertTrue(report.warnings.any { it.message.contains("Nierozpoznana kategoria") && it.requiresUserAction })
    }

    @Test
    fun test_strict_preservation_of_exactly_7_categories() {
        val allCategories = ExerciseCategory.entries
        assertEquals("Model musi zawierać dokładnie 7 kategorii", 7, allCategories.size)

        for (category in allCategories) {
            val res = parser.mapCategorySafely(category.displayName)
            assertEquals(category, res.category)
            assertFalse(res.isAmbiguous)
        }
    }

    @Test
    fun test_parser_is_purely_in_memory_and_does_not_mutate_state() {
        val json = """[{"name": "Test pure", "category": "Klatka"}]"""
        val report1 = parser.analyze(json)
        val report2 = parser.analyze(json)

        // Wielokrotne parsowanie tego samego tekstu daje identyczny wynik (brak efektów ubocznych)
        assertEquals(report1.totalFound, report2.totalFound)
        assertEquals(report1.candidates.first().rawExercise.name, report2.candidates.first().rawExercise.name)
    }
}
