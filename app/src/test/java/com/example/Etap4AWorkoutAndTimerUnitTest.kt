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
class Etap4AWorkoutAndTimerUnitTest {

    private lateinit var viewModel: MainViewModel

    @Before
    fun setup() {
        viewModel = MainViewModel()
    }

    @Test
    fun test_save_and_restore_draft_persists_sets_and_values() = runTest {
        val template = viewModel.templates.first().first()
        viewModel.startWorkoutFromToday(template.id)

        val draftBefore = viewModel.activeDraft.value
        assertNotNull("Draft sesji powinien istnieć po rozpoczęciu", draftBefore)

        // Modify set 0 values
        viewModel.updateSetParameters(exerciseIndex = 0, setIndex = 0, reps = 12, weightKg = 105.0)
        viewModel.setSetApprovedStatus(exerciseIndex = 0, setIndex = 0, isApproved = true)

        val updatedDraft = viewModel.activeDraft.value
        assertNotNull(updatedDraft)
        val firstSet = updatedDraft!!.exercises[0].sets[0]
        assertEquals(12, firstSet.actualReps)
        assertEquals(105.0, firstSet.weightKg, 0.01)
        assertEquals(true, firstSet.isApproved)
    }

    @Test
    fun test_no_duplicate_draft_created() = runTest {
        val template = viewModel.templates.first().first()
        viewModel.startWorkoutFromToday(template.id)

        val firstDraftId = viewModel.activeDraft.value?.workoutId

        // Multiple updates
        viewModel.updateSetParameters(exerciseIndex = 0, setIndex = 0, reps = 10, weightKg = 80.0)
        viewModel.updateSetParameters(exerciseIndex = 0, setIndex = 0, reps = 11, weightKg = 82.5)

        val draftAfter = viewModel.activeDraft.value
        assertNotNull(draftAfter)
        assertEquals("Powinien być dokładnie jeden aktywny szkic", firstDraftId, draftAfter?.workoutId)
    }

    @Test
    fun test_session_finalization_removes_draft_and_adds_completed_session() = runTest {
        val template = viewModel.templates.first().first()
        viewModel.startWorkoutFromToday(template.id)

        val initialCompletedCount = viewModel.completedSessions.value.size

        // Approve set
        viewModel.setSetApprovedStatus(exerciseIndex = 0, setIndex = 0, isApproved = true)
        viewModel.finalizeWorkout(advanceRotation = false)

        assertNull("Po finalizacji szkic sesji musi zostać usunięty", viewModel.activeDraft.value)
        assertEquals(
            "Historia sesji powinna powiększyć się o dokładnie jeden wpis",
            initialCompletedCount + 1,
            viewModel.completedSessions.value.size
        )
    }

    @Test
    fun test_rest_timer_controls_start_pause_reset_adjust() = runTest {
        // Start 90s
        viewModel.startRestTimer(90)
        assertTrue(viewModel.isRestTimerRunning.value)
        assertEquals(90, viewModel.restTimerRemainingSeconds.value)
        assertEquals(90, viewModel.restTimerTotalSeconds.value)

        // Pause
        viewModel.pauseRestTimer()
        assertFalse(viewModel.isRestTimerRunning.value)
        assertEquals(90, viewModel.restTimerRemainingSeconds.value)

        // Adjust +15s
        viewModel.adjustRestTimer(15)
        assertEquals(105, viewModel.restTimerRemainingSeconds.value)
        assertEquals(105, viewModel.restTimerTotalSeconds.value)

        // Reset
        viewModel.resetRestTimer()
        assertEquals(0, viewModel.restTimerRemainingSeconds.value)
        assertFalse(viewModel.isRestTimerRunning.value)
        assertFalse(viewModel.isRestTimerFinished.value)
    }

    @Test
    fun test_rest_timer_finishes_and_sets_flag() = runTest {
        viewModel.startRestTimer(1)
        assertTrue(viewModel.isRestTimerRunning.value)

        // Advance coroutine delay
        advanceTimeBy(1100L)

        assertEquals(0, viewModel.restTimerRemainingSeconds.value)
        assertFalse(viewModel.isRestTimerRunning.value)
        assertTrue("Flaga ukończenia timera powinna być true", viewModel.isRestTimerFinished.value)
    }

    @Test
    fun test_rest_timer_does_not_mutate_workout_data() = runTest {
        val template = viewModel.templates.first().first()
        viewModel.startWorkoutFromToday(template.id)

        viewModel.updateSetParameters(exerciseIndex = 0, setIndex = 0, reps = 8, weightKg = 90.0)
        val initialWeight = viewModel.activeDraft.value!!.exercises[0].sets[0].weightKg
        val initialReps = viewModel.activeDraft.value!!.exercises[0].sets[0].actualReps

        // Start and stop timer multiple times
        viewModel.startRestTimer(60)
        viewModel.adjustRestTimer(30)
        viewModel.pauseRestTimer()
        viewModel.resetRestTimer()

        val draftAfterTimer = viewModel.activeDraft.value
        assertNotNull(draftAfterTimer)
        assertEquals(initialWeight, draftAfterTimer!!.exercises[0].sets[0].weightKg, 0.001)
        assertEquals(initialReps, draftAfterTimer.exercises[0].sets[0].actualReps)
    }
}
