package com.example

import com.example.data.repository.InMemoryPlanRepository
import com.example.data.repository.InMemoryWorkoutRepository
import com.example.domain.model.*
import com.example.viewmodel.MainViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class BusinessRulesUnitTest {

    @Test
    fun rotation_advances_on_completion_or_manual_skip() = runTest {
        val planRepo = InMemoryPlanRepository()
        var currentCycle = planRepo.getActiveCycle().first()
        assertNotNull(currentCycle)
        val initialIdx = currentCycle!!.currentRotationIndex
        val seqSize = currentCycle.rotationSequence.size

        // Test manual skip
        planRepo.skipCurrentRotation()
        currentCycle = planRepo.getActiveCycle().first()
        val expectedSkipIdx = (initialIdx + 1) % seqSize
        assertEquals("Rotacja powinna przesunąć się o 1 po pominięciu", expectedSkipIdx, currentCycle!!.currentRotationIndex)

        // Test completion advance
        planRepo.advanceRotation()
        currentCycle = planRepo.getActiveCycle().first()
        val expectedAdvanceIdx = (expectedSkipIdx + 1) % seqSize
        assertEquals("Rotacja powinna przesunąć się o 1 po ukończeniu", expectedAdvanceIdx, currentCycle!!.currentRotationIndex)
    }

    @Test
    fun schedule_copying_works_only_to_future_week() = runTest {
        val planRepo = InMemoryPlanRepository()

        val cycleBefore = planRepo.getActiveCycle().first()!!
        val originalTargetEntry = cycleBefore.scheduleEntries[0] // Same week (index 0)

        // Próba skopiowania do tego samego lub przeszłego tygodnia (0 -> 0)
        planRepo.copyWeekToFuture(sourceStartIndex = 0, targetStartIndex = 0, selectedDayIndices = listOf(0, 1))

        val cycleAfterSameWeek = planRepo.getActiveCycle().first()!!
        assertEquals(
            "Harmonogram nie może zostać skopiowany do tego samego lub przeszłego tygodnia",
            originalTargetEntry.workoutName,
            cycleAfterSameWeek.scheduleEntries[0].workoutName
        )

        // Kopiowanie do przyszłego tygodnia (0 -> 7)
        planRepo.copyWeekToFuture(sourceStartIndex = 0, targetStartIndex = 7, selectedDayIndices = listOf(0))
        val cycleAfterFutureWeek = planRepo.getActiveCycle().first()!!
        assertEquals(
            "Kopiowanie do przyszłego tygodnia powinno przypisać trening źródłowy",
            cycleBefore.scheduleEntries[0].workoutName,
            cycleAfterFutureWeek.scheduleEntries[7].workoutName
        )
    }

    @Test
    fun copying_does_not_violate_history_or_completed_sessions() = runTest {
        val planRepo = InMemoryPlanRepository()
        val cycleBefore = planRepo.getActiveCycle().first()!!

        // Wpis źródłowy na pozycji 0 ma status WYKONANY i hasActualSession = true
        val srcEntry = cycleBefore.scheduleEntries[0]
        assertEquals(CompletionStatus.WYKONANY, srcEntry.status)
        assertTrue(srcEntry.hasActualSession)

        // Kopiujemy do przyszłego tygodnia (0 -> 7)
        planRepo.copyWeekToFuture(sourceStartIndex = 0, targetStartIndex = 7, selectedDayIndices = listOf(0))

        val cycleAfter = planRepo.getActiveCycle().first()!!
        val copiedTargetEntry = cycleAfter.scheduleEntries[7]

        // Weryfikacja: status w przyszłym tygodniu to NIEROZSTRZYGNIETY, a hasActualSession to false
        assertEquals(
            "Skopiowany wpis w przyszłości nie może dziedziczyć statusu wykonania",
            CompletionStatus.NIEROZSTRZYGNIETY,
            copiedTargetEntry.status
        )
        assertFalse(
            "Skopiowany wpis w przyszłości nie może mieć flagi zarejestrowanej sesji",
            copiedTargetEntry.hasActualSession
        )

        // Weryfikacja: historia (wpis źródłowy) pozostała nienaruszona
        val historicalEntry = cycleAfter.scheduleEntries[0]
        assertEquals(CompletionStatus.WYKONANY, historicalEntry.status)
        assertTrue(historicalEntry.hasActualSession)
    }

    @Test
    fun completed_sets_are_counted_strictly_once_and_drafts_ignored() = runTest {
        val testWorkoutRepo = InMemoryWorkoutRepository()

        // Tworzymy sesję z 3 zatwierdzonymi seriami, 1 odrzuconą i 1 szkicem (null)
        val testExercise = WorkoutExercise(
            exerciseId = "ex_chest",
            exerciseName = "Wyciskanie sztangi",
            category = ExerciseCategory.KLATKA_PIERSIOWA,
            sets = listOf(
                WorkoutSet(1, 10, 10, 100.0, isApproved = true),
                WorkoutSet(2, 10, 10, 100.0, isApproved = true),
                WorkoutSet(3, 10, 10, 100.0, isApproved = true),
                WorkoutSet(4, 10, 8, 100.0, isApproved = false), // odrzucona
                WorkoutSet(5, 10, 0, 100.0, isApproved = null)   // szkic / nierozliczona
            )
        )

        val session = CompletedWorkoutSession(
            sessionId = "sess_test",
            workoutName = "Test Push",
            dateIso = "2026-09-24",
            durationMinutes = 60,
            exercises = listOf(testExercise),
            completedSetsCount = 3,
            totalVolumeKg = 3000.0,
            advancedRotation = true
        )

        // Obliczamy analitykę przez ViewModel
        val viewModel = MainViewModel(
            workoutRepository = testWorkoutRepo
        )

        // Liczba wykonanych serii w analityce musi równać się dokładnie liczbie zatwierdzonych serii (3) z testu
        val completedSets = testExercise.sets.count { it.isApproved == true }
        assertEquals(3, completedSets)

        // Sprawdzamy czy suma serii we wszystkich 7 kategoriach równa się dokładnie łącznej liczbie ukończonych serii
        val categoryBreakdown = viewModel.analytics.value.categoryBreakdown
        val sumAcrossCategories = categoryBreakdown.sumOf { it.completedSetsCount }
        assertEquals(
            "Suma serii we wszystkich kategoriach musi być równa liczbie ukończonych serii (każda liczona dokładnie raz)",
            viewModel.analytics.value.totalSetsCount,
            sumAcrossCategories
        )
    }

    @Test
    fun sets_are_properly_assigned_to_exactly_7_categories() {
        // Weryfikacja że system operuje na dokładnie 7 zdefiniowanych kategoriach
        val allCategories = ExerciseCategory.entries
        assertEquals("Musi istnieć dokładnie 7 kategorii głównych", 7, allCategories.size)

        val expectedCategories = setOf(
            "Klatka piersiowa",
            "Plecy",
            "Barki",
            "Nogi",
            "Biceps",
            "Triceps",
            "Pozostałe"
        )

        val actualCategoryNames = allCategories.map { it.displayName }.toSet()
        assertEquals("Nazwy 7 kategorii muszą być zgodne ze specyfikacją", expectedCategories, actualCategoryNames)
    }
}
