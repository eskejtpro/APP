package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.database.AppDatabase
import com.example.data.local.entity.ExerciseEntity
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

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class DatabaseSeederUnitTest {

    private lateinit var database: AppDatabase
    private lateinit var context: Context
    private lateinit var seeder: DatabaseSeeder

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        database = AppDatabase.createInMemoryDatabase(context)
        seeder = DatabaseSeeder(database)
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun test_seed_empty_database_populates_all_tables() = runTest {
        // 1. Sprawdzenie stanu początkowego - baza jest pusta
        assertEquals(0, database.exerciseDao().getExerciseCount())
        assertEquals(0, database.planDao().getCycleCount())

        // 2. Wykonanie seedowania
        val seeded = seeder.seedIfEmpty()
        assertTrue("Seedowanie pustej bazy musi zwrócić true", seeded)

        // 3. Sprawdzenie czy dane zostały dodane
        val exerciseCount = database.exerciseDao().getExerciseCount()
        assertTrue("Liczba ćwiczeń po seedowaniu powinna być > 0", exerciseCount >= 18)

        val cycleCount = database.planDao().getCycleCount()
        assertEquals("Powinien zostać dodany dokładnie 1 przykładowy cykl", 1, cycleCount)

        val templateCount = database.workoutDao().getTemplateCount()
        assertTrue("Powinny zostać dodane szablony treningowe", templateCount >= 3)
    }

    @Test
    fun test_no_reseeding_if_database_already_has_data() = runTest {
        // Pierwsze seedowanie
        val firstRun = seeder.seedIfEmpty()
        assertTrue(firstRun)
        val countAfterFirst = database.exerciseDao().getExerciseCount()

        // Drugie seedowanie
        val secondRun = seeder.seedIfEmpty()
        assertFalse("Drugie uruchomienie na niepustej bazie musi zwrócić false", secondRun)

        val countAfterSecond = database.exerciseDao().getExerciseCount()
        assertEquals("Brak ponownego seedowania bazy zawierającej dane", countAfterFirst, countAfterSecond)
    }

    @Test
    fun test_no_duplicates_after_second_run() = runTest {
        seeder.seedIfEmpty()
        val initialCycles = database.planDao().getAllCycles().first()
        val initialExercises = database.exerciseDao().getAllExercises().first()

        // Wywołujemy ponowne seedowanie
        seeder.seedIfEmpty()

        val cyclesAfter = database.planDao().getAllCycles().first()
        val exercisesAfter = database.exerciseDao().getAllExercises().first()

        assertEquals("Liczba cykli nie może ulec podwojeniu", initialCycles.size, cyclesAfter.size)
        assertEquals("Liczba ćwiczeń nie może ulec podwojeniu", initialExercises.size, exercisesAfter.size)
    }

    @Test
    fun test_preserves_user_data_and_never_overwrites() = runTest {
        // Użytkownik ręcznie dodaje własne ćwiczenie do bazy zanim seeder się wykona
        val customExercise = ExerciseEntity(
            id = "user_ex_1",
            name = "Moje własne ćwiczenie autorskie",
            category = ExerciseCategory.KLATKA_PIERSIOWA,
            notes = "Ważna notatka użytkownika",
            isCustom = true
        )
        database.exerciseDao().insertExercise(customExercise)

        // Uruchamiamy seeder
        val seeded = seeder.seedIfEmpty()
        assertFalse("Seeder nie może modyfikować bazy zawierającej dane użytkownika", seeded)

        // Sprawdzamy czy dane użytkownika pozostały nietknięte
        val fetched = database.exerciseDao().getExerciseById("user_ex_1")
        assertNotNull(fetched)
        assertEquals("Moje własne ćwiczenie autorskie", fetched!!.name)
        assertEquals("Ważna notatka użytkownika", fetched.notes)
    }

    @Test
    fun test_preserves_all_7_exercise_categories_in_seed_data() = runTest {
        seeder.seedIfEmpty()
        val exercises = database.exerciseDao().getAllExercises().first()

        val categoriesPresent = exercises.map { it.category }.toSet()
        assertEquals(
            "Wszystkie 7 kategorii głównych musi być obecne w przykładowej bibliotece",
            7,
            categoriesPresent.size
        )

        for (category in ExerciseCategory.entries) {
            assertTrue(
                "Kategoria ${category.displayName} musi znajdować się w załadowanych ćwiczeniach",
                categoriesPresent.contains(category)
            )
        }
    }

    @Test
    fun test_saves_sample_cycle_and_schedule_correctly() = runTest {
        seeder.seedIfEmpty()

        val activeCycle = database.planDao().getActiveCycle().first()
        assertNotNull("Aktywny cykl musi być obecny", activeCycle)
        assertEquals("Cykl 1: Jesień 2026 (Rotacyjny PPL)", activeCycle!!.name)

        val scheduleEntries = database.planDao().getEntriesForCycleSync(activeCycle.id)
        assertTrue("Harmonogram cyklu powinien zawierać wpisy", scheduleEntries.isNotEmpty())

        val firstEntry = scheduleEntries.first()
        assertNotNull(firstEntry.dateIso)
        assertNotNull(firstEntry.dayType)
        assertNotNull(firstEntry.status)
    }

    @Test
    fun test_saves_interrupted_session_draft_correctly() = runTest {
        seeder.seedIfEmpty()

        val draft = database.workoutDao().getActiveDraftSync()
        assertNotNull("Szkic przerwanej sesji musi być obecny dla interfejsu", draft)
        assertTrue("Szkic początkowy powinien być oznaczony jako przerwany", draft!!.isInterrupted)
        assertEquals("Push A (Klatka, Barki, Triceps)", draft.workoutName)
        assertTrue("Szkic musi zawierać ćwiczenia", draft.exercises.isNotEmpty())
    }
}
