package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.database.AppDatabase
import com.example.data.repository.*
import com.example.data.repository.room.*
import com.example.domain.model.*
import com.example.viewmodel.MainViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class MainViewModelRoomIntegrationUnitTest {

    private lateinit var database: AppDatabase
    private lateinit var context: Context
    private lateinit var provider: RoomRepositoryProvider

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        database = AppDatabase.createInMemoryDatabase(context)
        provider = RoomRepositoryProvider(database)
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun test_app_launch_with_room_repositories_and_seeder_before_read() = runTest {
        // Seeder wykonuje się przed utworzeniem ViewModelu
        val viewModel = provider.createRoomViewModel()

        val exercises = viewModel.exercises.first()
        assertTrue("Ćwiczenia powinny zostać zainicjalizowane z bazy Room", exercises.isNotEmpty())

        val activeCycle = viewModel.activeCycle.first()
        assertNotNull("Aktywny cykl powinien zostać załadowany z bazy Room", activeCycle)
    }

    @Test
    fun test_reading_sample_exercises_from_room_preserves_7_categories() = runTest {
        val viewModel = provider.createRoomViewModel()
        val exercises = viewModel.exercises.first()

        assertTrue(exercises.size >= 18)
        val categories = exercises.map { it.category }.toSet()
        assertEquals("Musi istnieć dokładnie 7 kategorii głównych w odczytanych ćwiczeniach", 7, categories.size)
    }

    @Test
    fun test_reading_cycle_and_schedule_from_room() = runTest {
        val viewModel = provider.createRoomViewModel()
        val activeCycle = viewModel.activeCycle.first()

        assertNotNull(activeCycle)
        assertEquals("Cykl 1: Jesień 2026 (Rotacyjny PPL)", activeCycle!!.name)
        assertTrue("Cykl musi posiadać wpisy harmonogramu", activeCycle.scheduleEntries.isNotEmpty())
        assertEquals("Push A", activeCycle.scheduleEntries.first().workoutName)
    }

    @Test
    fun test_reading_interrupted_session_from_room() = runTest {
        val viewModel = provider.createRoomViewModel()
        val activeDraft = viewModel.activeDraft.first()

        assertNotNull("Szkic przerwanej sesji powinien zostać załadowany", activeDraft)
        assertTrue("Szkic początkowy powinien mieć flagę isInterrupted = true", activeDraft!!.isInterrupted)
        assertEquals("Push A (Klatka, Barki, Triceps)", activeDraft.workoutName)
    }

    @Test
    fun test_saving_settings_change_and_reading_back_via_room() = runTest {
        val viewModel = provider.createRoomViewModel()

        viewModel.updateStartScreen(StartScreenOption.CALENDAR)
        viewModel.updateInterruptedReminderDays(7)

        val updatedSettings = viewModel.appSettings.first()
        assertEquals(StartScreenOption.CALENDAR, updatedSettings.defaultStartScreen)
        assertEquals(7, updatedSettings.interruptedReminderDays)
    }

    @Test
    fun test_data_persists_when_recreating_viewmodel_with_same_room_database() = runTest {
        // Pierwsza instancja ViewModelu dodaje nowe ćwiczenie
        val viewModel1 = provider.createRoomViewModel()
        viewModel1.addCustomExercise(
            name = "Wyciskanie sztangielek na skosie dodatnim",
            category = ExerciseCategory.KLATKA_PIERSIOWA,
            notes = "Kąt 30 stopni"
        )

        // Druga instancja ViewModelu podłączona do tej samej bazy Room
        val viewModel2 = MainViewModel(
            exerciseRepository = provider.exerciseRepository,
            planRepository = provider.planRepository,
            workoutRepository = provider.workoutRepository,
            calendarRepository = provider.calendarRepository,
            settingsRepository = provider.settingsRepository
        )

        val list2 = viewModel2.exercises.first()
        assertTrue(
            "Nowo utworzony ViewModel musi odczytać wcześniej dodane ćwiczenie z trwałej bazy Room",
            list2.any { it.name == "Wyciskanie sztangielek na skosie dodatnim" }
        )
    }

    @Test
    fun test_inmemory_repository_works_in_fallback_and_test_mode() = runTest {
        // Utworzenie ViewModelu z domyślnymi repozytoriami InMemory
        val inMemoryViewModel = MainViewModel(
            exerciseRepository = InMemoryExerciseRepository(),
            planRepository = InMemoryPlanRepository(),
            workoutRepository = InMemoryWorkoutRepository(),
            calendarRepository = InMemoryCalendarRepository(),
            settingsRepository = InMemorySettingsRepository()
        )

        val exercises = inMemoryViewModel.exercises.first()
        assertTrue("Tryb fallback InMemory musi działać poprawnie", exercises.isNotEmpty())
        assertEquals(StartScreenOption.TODAY, inMemoryViewModel.appSettings.first().defaultStartScreen)
    }

    @Test
    fun test_database_singleton_ensures_single_instance_per_process() {
        val db1 = AppDatabase.getInstance(context)
        val db2 = AppDatabase.getInstance(context)

        assertSame("AppDatabase.getInstance musi zwracać dokładnie tę samą instancję singletona", db1, db2)
    }
}
