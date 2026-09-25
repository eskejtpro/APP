package com.example

import com.example.domain.model.*
import com.example.viewmodel.MainViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class WorkoutSessionUnitTest {

    private lateinit var viewModel: MainViewModel

    @Before
    fun setup() {
        viewModel = MainViewModel()
    }

    @Test
    fun test_start_rest_timer_with_preset_updates_state() = runTest {
        viewModel.startRestTimer(90)

        assertEquals(90, viewModel.restTimerRemainingSeconds.value)
        assertEquals(90, viewModel.restTimerTotalSeconds.value)
        assertTrue(viewModel.isRestTimerRunning.value)
        assertFalse(viewModel.isRestTimerFinished.value)
    }

    @Test
    fun test_adjust_rest_timer_adds_and_subtracts_time() = runTest {
        viewModel.startRestTimer(60)
        assertEquals(60, viewModel.restTimerRemainingSeconds.value)

        viewModel.adjustRestTimer(15)
        assertEquals(75, viewModel.restTimerRemainingSeconds.value)

        viewModel.adjustRestTimer(-30)
        assertEquals(45, viewModel.restTimerRemainingSeconds.value)
    }

    @Test
    fun test_pause_and_resume_rest_timer() = runTest {
        viewModel.startRestTimer(90)
        assertTrue(viewModel.isRestTimerRunning.value)

        viewModel.pauseRestTimer()
        assertFalse(viewModel.isRestTimerRunning.value)
        assertEquals(90, viewModel.restTimerRemainingSeconds.value)

        viewModel.resumeRestTimer()
        assertTrue(viewModel.isRestTimerRunning.value)
    }

    @Test
    fun test_reset_rest_timer_clears_timer() = runTest {
        viewModel.startRestTimer(120)
        assertTrue(viewModel.isRestTimerRunning.value)

        viewModel.resetRestTimer()
        assertEquals(0, viewModel.restTimerRemainingSeconds.value)
        assertFalse(viewModel.isRestTimerRunning.value)
        assertFalse(viewModel.isRestTimerFinished.value)
    }

    @Test
    fun test_set_approval_automatically_triggers_rest_timer() = runTest {
        // Start workout from first template
        val template = viewModel.templates.first().first()
        viewModel.startWorkoutFromToday(template.id)

        assertNotNull(viewModel.activeDraft.value)

        // Zatwierdzenie serii powinno automatycznie uruchomić stoper odpoczynku
        viewModel.setSetApprovedStatus(exerciseIndex = 0, setIndex = 0, isApproved = true)

        assertTrue(
            "Zatwierdzenie serii powinno automatycznie uruchomić stoper odpoczynku",
            viewModel.isRestTimerRunning.value || viewModel.restTimerRemainingSeconds.value > 0
        )
    }

    @Test
    fun test_discard_active_workout_archives_draft_and_resets_timer() = runTest {
        val template = viewModel.templates.first().first()
        viewModel.startWorkoutFromToday(template.id)
        viewModel.startRestTimer(90)

        assertNotNull(viewModel.activeDraft.value)
        assertTrue(viewModel.isRestTimerRunning.value)

        viewModel.discardActiveWorkout()

        assertNull("Po porzuceniu sesji activeDraft powinien być null", viewModel.activeDraft.value)
        assertFalse("Po porzuceniu sesji stoper powinien zostać zresetowany", viewModel.isRestTimerRunning.value)
        assertEquals(0, viewModel.restTimerRemainingSeconds.value)
    }
}
