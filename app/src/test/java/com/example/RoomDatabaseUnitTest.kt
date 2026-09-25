package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.database.AppDatabase
import com.example.data.local.entity.*
import com.example.data.repository.room.*
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

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class RoomDatabaseUnitTest {

    private lateinit var database: AppDatabase
    private lateinit var context: Context

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        database = AppDatabase.createInMemoryDatabase(context)
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun test_exercise_insert_read_and_category_retention() = runTest {
        val repo = RoomExerciseRepository(database.exerciseDao())
        val exercise = Exercise(
            id = "ex_bench",
            name = "Wyciskanie sztangi poziomo",
            category = ExerciseCategory.KLATKA_PIERSIOWA,
            notes = "Test notes",
            isCustom = true
        )

        repo.addExercise(exercise)
        val list = repo.getExercises().first()

        assertEquals(1, list.size)
        val fetched = list.first()
        assertEquals("Wyciskanie sztangi poziomo", fetched.name)
        // Zachowanie dokładnie jednej z 7 kategorii
        assertEquals(ExerciseCategory.KLATKA_PIERSIOWA, fetched.category)
        assertTrue(fetched.isCustom)
    }

    @Test
    fun test_day_schedule_insert_read_date_and_status() = runTest {
        val cycleEntity = TrainingCycleEntity(
            id = "cycle_test",
            name = "Cykl Testowy",
            cycleType = CycleType.ROTATIONAL,
            startDateIso = "2026-09-01",
            endDateIso = "2026-10-01",
            isActive = true
        )
        database.planDao().insertCycle(cycleEntity)

        val entry = DayScheduleEntry(
            dateIso = "2026-09-24",
            dayOfWeekName = "Czwartek",
            dayType = DayPlanType.ASSIGNED_WORKOUT,
            workoutTemplateId = "tpl_1",
            workoutName = "Push A",
            status = CompletionStatus.WYKONANY,
            hasActualSession = true,
            notes = "Dobra sesja"
        )

        val planRepo = RoomPlanRepository(database.planDao())
        planRepo.updateScheduleEntry(entry)

        val activeCycle = planRepo.getActiveCycle().first()
        assertNotNull(activeCycle)
        val entries = activeCycle!!.scheduleEntries
        assertEquals(1, entries.size)

        val fetchedEntry = entries.first()
        // Zapis i odczyt daty
        assertEquals("2026-09-24", fetchedEntry.dateIso)
        // Zapis i odczyt statusu dnia
        assertEquals(CompletionStatus.WYKONANY, fetchedEntry.status)
        assertEquals(DayPlanType.ASSIGNED_WORKOUT, fetchedEntry.dayType)
    }

    @Test
    fun test_active_session_draft_insert_and_read() = runTest {
        val repo = RoomWorkoutRepository(database.workoutDao())
        val draft = ActiveSessionDraft(
            workoutId = "tpl_push",
            workoutName = "Push A (Wyciskanie)",
            startTimeMillis = 100000L,
            exercises = listOf(
                WorkoutExercise(
                    exerciseId = "ex_1",
                    exerciseName = "Wyciskanie hantli skos",
                    category = ExerciseCategory.KLATKA_PIERSIOWA,
                    sets = listOf(
                        WorkoutSet(1, 10, 10, 32.0, isApproved = true),
                        WorkoutSet(2, 10, 9, 32.0, isApproved = null)
                    )
                )
            ),
            isInterrupted = true,
            isUnsettledDraft = true
        )

        repo.saveSessionDraft(draft)
        val fetched = repo.getActiveSessionDraft().first()

        assertNotNull(fetched)
        assertEquals("Push A (Wyciskanie)", fetched!!.workoutName)
        assertTrue(fetched.isInterrupted)
        assertEquals(1, fetched.exercises.size)
        assertEquals(2, fetched.exercises[0].sets.size)
        assertEquals(true, fetched.exercises[0].sets[0].isApproved)
        assertNull(fetched.exercises[0].sets[1].isApproved)
    }

    @Test
    fun test_note_insert_and_read() = runTest {
        val repo = RoomCalendarRepository(database.calendarDao())
        val note = NoteEntry(
            id = "note_1",
            dateIso = "2026-09-24",
            timeStr = "09:30",
            title = "Testowa notatka",
            content = "Regeneracja i sen przebiegły wzorowo."
        )

        repo.addNoteEntry(note)
        val list = repo.getNoteEntries().first()

        assertEquals(1, list.size)
        assertEquals("Testowa notatka", list.first().title)
        assertEquals("2026-09-24", list.first().dateIso)
        assertEquals("09:30", list.first().timeStr)
    }

    @Test
    fun test_app_settings_insert_and_read() = runTest {
        val repo = RoomSettingsRepository(database.settingsDao())

        repo.updateStartScreen(StartScreenOption.PLANS)
        repo.updateReminderDays(7)

        val settings = repo.getSettings().first()
        assertEquals(StartScreenOption.PLANS, settings.defaultStartScreen)
        assertEquals(7, settings.interruptedReminderDays)
    }

    @Test
    fun test_data_persists_across_repository_recreation() = runTest {
        // Pierwsza instancja repozytorium
        val repo1 = RoomExerciseRepository(database.exerciseDao())
        repo1.addExercise(
            Exercise(
                id = "ex_persistence",
                name = "Podciąganie nachwyt",
                category = ExerciseCategory.PLECY
            )
        )

        // Druga, nowo utworzona instancja repozytorium korzystająca z tej samej bazy
        val repo2 = RoomExerciseRepository(database.exerciseDao())
        val list = repo2.getExercises().first()

        assertEquals("Dane nie mogą być usuwane przy ponownym utworzeniu repozytorium", 1, list.size)
        assertEquals("Podciąganie nachwyt", list.first().name)
        assertEquals(ExerciseCategory.PLECY, list.first().category)
    }
}
