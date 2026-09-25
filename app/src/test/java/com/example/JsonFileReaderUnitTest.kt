package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.importer.FileReadResult
import com.example.data.importer.GymTrackerJsonParser
import com.example.data.importer.JsonFileReader
import com.example.data.local.database.AppDatabase
import com.example.data.local.seeder.DatabaseSeeder
import com.example.domain.model.ExerciseCategory
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class JsonFileReaderUnitTest {

    private lateinit var fileReader: JsonFileReader
    private lateinit var parser: GymTrackerJsonParser
    private lateinit var database: AppDatabase
    private lateinit var context: Context

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        database = AppDatabase.createInMemoryDatabase(context)
        fileReader = JsonFileReader(contentResolver = null)
        parser = GymTrackerJsonParser()
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun test_read_null_uri_returns_canceled() {
        val result = runTest {
            fileReader.readFromUri(null)
        }
        assertTrue(
            "Przekazanie null Uri (anulowanie w selektorze SAF) musi zwracać Canceled bez błędu",
            result is FileReadResult.Canceled
        )
    }

    @Test
    fun test_read_valid_stream_returns_success() {
        val json = """[{"name": "Wyciskanie na ławce poziomej", "category": "Klatka"}]"""
        val stream = ByteArrayInputStream(json.toByteArray(StandardCharsets.UTF_8))

        val result = fileReader.readFromStream(stream, fileName = "eksport_gymtracker.json")
        assertTrue(result is FileReadResult.Success)

        val success = result as FileReadResult.Success
        assertEquals("eksport_gymtracker.json", success.fileName)
        assertEquals(json, success.content)

        // Weryfikacja bezpośredniego przekazania do istniejącego parsera
        val report = parser.analyze(success.content, sourceName = success.fileName)
        assertTrue(report.isSuccess)
        assertEquals(1, report.exercisesFound)
        assertEquals("Wyciskanie na ławce poziomej", report.candidates.first().rawExercise.name)
        assertEquals(ExerciseCategory.KLATKA_PIERSIOWA, report.candidates.first().mappedCategory)
    }

    @Test
    fun test_read_empty_stream_returns_error() {
        val emptyStream = ByteArrayInputStream("   \n\t ".toByteArray(StandardCharsets.UTF_8))
        val result = fileReader.readFromStream(emptyStream, fileName = "pusty_plik.json")

        assertTrue(result is FileReadResult.Error)
        val error = result as FileReadResult.Error
        assertTrue(
            "Komunikat błędu powinien informować o pustym pliku",
            error.message.contains("pusty") || error.message.contains("nie zawiera tekstu")
        )
    }

    @Test
    fun test_read_null_stream_returns_error() {
        val result = fileReader.readFromStream(null, fileName = "brakujacy.json")
        assertTrue(result is FileReadResult.Error)
        val error = result as FileReadResult.Error
        assertTrue(error.message.contains("Brak strumienia"))
    }

    @Test
    fun test_utf8_decoding_preserves_polish_characters() {
        val polishJson = """
            [
                {"name": "Przysiad ze sztangą na czworogłowy", "category": "Nogi", "notes": "Zażółć gęślą jaźń - pełen zakres"}
            ]
        """.trimIndent()
        val stream = ByteArrayInputStream(polishJson.toByteArray(StandardCharsets.UTF_8))

        val result = fileReader.readFromStream(stream, fileName = "polskie_znaki.json")
        assertTrue(result is FileReadResult.Success)

        val success = result as FileReadResult.Success
        assertTrue(success.content.contains("Przysiad ze sztangą na czworogłowy"))
        assertTrue(success.content.contains("Zażółć gęślą jaźń"))

        val report = parser.analyze(success.content)
        assertTrue(report.isSuccess)
        assertEquals("Zażółć gęślą jaźń - pełen zakres", report.candidates.first().rawExercise.notes)
    }

    @Test
    fun test_file_size_exceeding_limit_returns_error() {
        // Testujemy limit rozmiaru przekazując mały maxSizeBytes = 100 bajtów
        val largeData = "x".repeat(200)
        val stream = ByteArrayInputStream(largeData.toByteArray(StandardCharsets.UTF_8))

        val result = fileReader.readFromStream(stream, fileName = "duzy_plik.json", maxSizeBytes = 100L)
        assertTrue(result is FileReadResult.Error)

        val error = result as FileReadResult.Error
        assertTrue(
            "Błąd powinien informować o przekroczeniu limitu rozmiaru",
            error.message.contains("przekracza dopuszczalny limit")
        )
    }

    @Test
    fun test_corrupted_json_stream_handled_gracefully_without_crash() {
        val brokenJson = "{ niepoprawny_json: 123, "
        val stream = ByteArrayInputStream(brokenJson.toByteArray(StandardCharsets.UTF_8))

        val result = fileReader.readFromStream(stream, fileName = "zepsuty.json")
        assertTrue(result is FileReadResult.Success)

        val success = result as FileReadResult.Success
        val report = parser.analyze(success.content, sourceName = success.fileName)

        assertFalse(report.isSuccess)
        assertTrue(report.errors.isNotEmpty())
        assertTrue(report.errors.first().message.contains("Błąd składni JSON"))
    }

    @Test
    fun test_unusual_file_extension_with_valid_json_is_accepted() {
        val json = """[{"name": "Wiosłowanie hantlem", "category": "Plecy"}]"""
        val stream = ByteArrayInputStream(json.toByteArray(StandardCharsets.UTF_8))

        val result = fileReader.readFromStream(stream, fileName = "eksport_treningu.backup")
        assertTrue(result is FileReadResult.Success)

        val success = result as FileReadResult.Success
        val report = parser.analyze(success.content, sourceName = success.fileName)
        assertTrue(report.isSuccess)
        assertEquals(1, report.exercisesFound)
    }

    @Test
    fun test_file_reading_and_preview_analysis_never_mutates_room_database() = runTest {
        val seeder = DatabaseSeeder(database)
        seeder.seedIfEmpty()
        val countBefore = database.exerciseDao().getExerciseCount()

        val json = """[{"name": "Niewpisane Ćwiczenie Podglądowe", "category": "Klatka"}]"""
        val stream = ByteArrayInputStream(json.toByteArray(StandardCharsets.UTF_8))

        val readResult = fileReader.readFromStream(stream, fileName = "plik_testowy.json")
        assertTrue(readResult is FileReadResult.Success)

        val content = (readResult as FileReadResult.Success).content
        val report = parser.analyze(content)
        assertTrue(report.isSuccess)

        // Weryfikacja: brak jakiejkolwiek mutacji w bazie Room
        val countAfter = database.exerciseDao().getExerciseCount()
        assertEquals(
            "Baza Room nie może ulec żadnej zmianie podczas odczytu pliku i analizy podglądu (Etap 3C)",
            countBefore,
            countAfter
        )
    }

    @Test
    fun test_manual_paste_json_remains_fully_functional() {
        val manualJson = """[{"name": "Uginanie ramion z supinacją", "category": "Biceps"}]"""
        val report = parser.analyze(manualJson, sourceName = "Wklejony ręcznie")

        assertTrue(report.isSuccess)
        assertEquals(1, report.exercisesFound)
        assertEquals(ExerciseCategory.BICEPS, report.candidates.first().mappedCategory)
        assertEquals("Wklejony ręcznie", report.sourceName)
    }
}
