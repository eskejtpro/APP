package com.example.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.repository.*
import com.example.domain.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID

class MainViewModel(
    private val exerciseRepository: ExerciseRepository = InMemoryExerciseRepository(),
    private val planRepository: PlanRepository = InMemoryPlanRepository(),
    private val workoutRepository: WorkoutRepository = InMemoryWorkoutRepository(),
    private val calendarRepository: CalendarRepository = InMemoryCalendarRepository(),
    private val settingsRepository: SettingsRepository = InMemorySettingsRepository()
) : ViewModel() {

    // Exercises
    val exercises: StateFlow<List<Exercise>> = exerciseRepository.getExercises()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    // Plans & Cycles
    val activeCycle: StateFlow<TrainingCycle?> = planRepository.getActiveCycle()
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)

    val allCycles: StateFlow<List<TrainingCycle>> = planRepository.getAllCycles()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    // Workout & Session
    val activeDraft: StateFlow<ActiveSessionDraft?> = workoutRepository.getActiveSessionDraft()
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)

    val completedSessions: StateFlow<List<CompletedWorkoutSession>> = workoutRepository.getCompletedSessions()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    val templates: StateFlow<List<WorkoutTemplate>> = workoutRepository.getTemplates()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    // Calendar
    val substanceEntries: StateFlow<List<SubstanceEntry>> = calendarRepository.getSubstanceEntries()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    val noteEntries: StateFlow<List<NoteEntry>> = calendarRepository.getNoteEntries()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    val substanceLibrary: List<SubstanceLibraryItem> = calendarRepository.getSubstanceLibrary()

    // Settings
    val appSettings: StateFlow<AppSettings> = settingsRepository.getSettings()
        .stateIn(viewModelScope, SharingStarted.Eagerly, AppSettings())

    // User Feedback Messages (Toasts / Banners)
    private val _userMessage = MutableSharedFlow<String>()
    val userMessage: SharedFlow<String> = _userMessage.asSharedFlow()

    // --- REST TIMER & SESSION TRACKING (Etap 4A) ---
    private val _restTimerRemainingSeconds = MutableStateFlow(0)
    val restTimerRemainingSeconds: StateFlow<Int> = _restTimerRemainingSeconds.asStateFlow()

    private val _restTimerTotalSeconds = MutableStateFlow(90)
    val restTimerTotalSeconds: StateFlow<Int> = _restTimerTotalSeconds.asStateFlow()

    private val _isRestTimerRunning = MutableStateFlow(false)
    val isRestTimerRunning: StateFlow<Boolean> = _isRestTimerRunning.asStateFlow()

    private val _isRestTimerFinished = MutableStateFlow(false)
    val isRestTimerFinished: StateFlow<Boolean> = _isRestTimerFinished.asStateFlow()

    private val _sessionDurationSeconds = MutableStateFlow(0L)
    val sessionDurationSeconds: StateFlow<Long> = _sessionDurationSeconds.asStateFlow()

    private var restTimerJob: kotlinx.coroutines.Job? = null
    private var sessionDurationJob: kotlinx.coroutines.Job? = null

    init {
        // Obserwuj aktywną sesję, aby automatycznie zarządzać stoperem czasu trwania
        viewModelScope.launch {
            activeDraft.collect { draft ->
                if (draft != null) {
                    if (sessionDurationJob == null || sessionDurationJob?.isActive != true) {
                        startSessionDurationTracker(draft.startTimeTimestamp)
                    }
                } else {
                    sessionDurationJob?.cancel()
                    sessionDurationJob = null
                    _sessionDurationSeconds.value = 0L
                    resetRestTimer()
                }
            }
        }
    }

    private fun startSessionDurationTracker(startTimestamp: Long) {
        sessionDurationJob?.cancel()
        sessionDurationJob = viewModelScope.launch {
            while (true) {
                val elapsed = (System.currentTimeMillis() - startTimestamp) / 1000L
                _sessionDurationSeconds.value = elapsed.coerceAtLeast(0L)
                kotlinx.coroutines.delay(1000L)
            }
        }
    }

    fun startRestTimer(durationSeconds: Int = 90) {
        restTimerJob?.cancel()
        _restTimerTotalSeconds.value = durationSeconds
        _restTimerRemainingSeconds.value = durationSeconds
        _isRestTimerRunning.value = true
        _isRestTimerFinished.value = false

        restTimerJob = viewModelScope.launch {
            while (_restTimerRemainingSeconds.value > 0 && _isRestTimerRunning.value) {
                kotlinx.coroutines.delay(1000L)
                _restTimerRemainingSeconds.value = (_restTimerRemainingSeconds.value - 1).coerceAtLeast(0)
            }
            if (_restTimerRemainingSeconds.value == 0) {
                _isRestTimerRunning.value = false
                _isRestTimerFinished.value = true
                _userMessage.emit("Koniec odpoczynku! Czas na kolejną serię.")
            }
        }
    }

    fun adjustRestTimer(deltaSeconds: Int) {
        val current = _restTimerRemainingSeconds.value
        val newRemaining = (current + deltaSeconds).coerceAtLeast(0)
        _restTimerRemainingSeconds.value = newRemaining
        if (newRemaining > _restTimerTotalSeconds.value) {
            _restTimerTotalSeconds.value = newRemaining
        }
        if (newRemaining == 0) {
            _isRestTimerRunning.value = false
            _isRestTimerFinished.value = true
        } else {
            _isRestTimerFinished.value = false
            if (!_isRestTimerRunning.value) {
                resumeRestTimer()
            }
        }
    }

    fun pauseRestTimer() {
        _isRestTimerRunning.value = false
        restTimerJob?.cancel()
    }

    fun resumeRestTimer() {
        if (_restTimerRemainingSeconds.value > 0) {
            _isRestTimerRunning.value = true
            _isRestTimerFinished.value = false
            restTimerJob = viewModelScope.launch {
                while (_restTimerRemainingSeconds.value > 0 && _isRestTimerRunning.value) {
                    kotlinx.coroutines.delay(1000L)
                    _restTimerRemainingSeconds.value = (_restTimerRemainingSeconds.value - 1).coerceAtLeast(0)
                }
                if (_restTimerRemainingSeconds.value == 0) {
                    _isRestTimerRunning.value = false
                    _isRestTimerFinished.value = true
                    _userMessage.emit("Koniec odpoczynku! Czas na kolejną serię.")
                }
            }
        }
    }

    fun resetRestTimer() {
        restTimerJob?.cancel()
        _isRestTimerRunning.value = false
        _isRestTimerFinished.value = false
        _restTimerRemainingSeconds.value = 0
    }

    fun discardActiveWorkout() {
        viewModelScope.launch {
            resetRestTimer()
            workoutRepository.archiveSessionDraft()
            _userMessage.emit("Sesja treningowa została porzucona")
        }
    }

    companion object {
        fun provideFactory(
            context: android.content.Context,
            useRoom: Boolean = true
        ): androidx.lifecycle.ViewModelProvider.Factory = object : androidx.lifecycle.ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return if (useRoom) {
                    try {
                        val provider = com.example.data.repository.room.RoomRepositoryProvider.fromContext(context)
                        provider.initializeData()
                        MainViewModel(
                            exerciseRepository = provider.exerciseRepository,
                            planRepository = provider.planRepository,
                            workoutRepository = provider.workoutRepository,
                            calendarRepository = provider.calendarRepository,
                            settingsRepository = provider.settingsRepository
                        ) as T
                    } catch (e: Exception) {
                        // Bezpieczny fallback do InMemory w przypadku nieoczekiwanego błędu
                        MainViewModel() as T
                    }
                } else {
                    MainViewModel() as T
                }
            }
        }
    }

    // Analytics computation derived from real completed sessions and cycles
    val analytics: StateFlow<OverallAnalytics> = combine(
        completedSessions,
        activeCycle
    ) { sessions, cycle ->
        calculateAnalytics(sessions, cycle)
    }.stateIn(
        viewModelScope,
        SharingStarted.Eagerly,
        OverallAnalytics(0, 0, 0, 0, emptyList(), emptyList(), emptyList())
    )

    // --- TODAY ACTIONS ---
    fun resumeInterruptedSession() {
        viewModelScope.launch {
            workoutRepository.resumeInterruptedSession()
            _userMessage.emit("Wznowiono przerwaną sesję")
        }
    }

    fun archiveInterruptedSession() {
        viewModelScope.launch {
            workoutRepository.archiveSessionDraft()
            _userMessage.emit("Zarchiwizowano niedokończoną sesję")
        }
    }

    fun startWorkoutFromToday(workoutTemplateId: String?) {
        viewModelScope.launch {
            val template = templates.value.find { it.id == workoutTemplateId }
                ?: templates.value.firstOrNull()
            if (template != null) {
                workoutRepository.startSessionFromTemplate(template)
                _userMessage.emit("Rozpoczęto trening: ${template.name}")
            }
        }
    }

    // --- WORKOUT ACTIONS ---
    fun setSetApprovedStatus(exerciseIndex: Int, setIndex: Int, isApproved: Boolean?) {
        viewModelScope.launch {
            workoutRepository.updateSetApproval(exerciseIndex, setIndex, isApproved)
            if (isApproved == true) {
                // Automatyczny start stopera odpoczynku po zatwierdzeniu serii
                startRestTimer(_restTimerTotalSeconds.value.coerceIn(30, 300))
            }
        }
    }

    fun updateSetParameters(exerciseIndex: Int, setIndex: Int, reps: Int, weightKg: Double) {
        viewModelScope.launch {
            workoutRepository.updateSetValues(exerciseIndex, setIndex, reps, weightKg)
        }
    }

    fun addSetToExercise(exerciseIndex: Int, targetReps: Int, weightKg: Double) {
        viewModelScope.launch {
            val draft = activeDraft.value ?: return@launch
            val ex = draft.exercises.getOrNull(exerciseIndex) ?: return@launch
            val nextSetNum = ex.sets.size + 1
            val newSet = WorkoutSet(
                setNumber = nextSetNum,
                targetReps = targetReps,
                actualReps = targetReps,
                weightKg = weightKg,
                isApproved = null
            )
            workoutRepository.addSetToExercise(exerciseIndex, newSet)
        }
    }

    fun replaceExercise(
        exerciseIndex: Int,
        newExercise: Exercise,
        replacementSetsCount: Int,
        initialWeight: Double,
        initialReps: Int
    ) {
        viewModelScope.launch {
            val sets = (1..replacementSetsCount).map { setIndex ->
                WorkoutSet(
                    setNumber = setIndex,
                    targetReps = initialReps,
                    actualReps = initialReps,
                    weightKg = initialWeight,
                    isApproved = null
                )
            }
            workoutRepository.replaceExercise(exerciseIndex, newExercise, sets)
            _userMessage.emit("Zastąpiono ćwiczenie przez ${newExercise.name}")
        }
    }

    fun skipExercise(exerciseIndex: Int) {
        viewModelScope.launch {
            workoutRepository.skipExercise(exerciseIndex)
        }
    }

    fun reorderExercise(fromIndex: Int, toIndex: Int) {
        viewModelScope.launch {
            workoutRepository.reorderExercises(fromIndex, toIndex)
        }
    }

    fun saveSessionAsNewTemplate(templateName: String) {
        viewModelScope.launch {
            val draft = activeDraft.value ?: return@launch
            workoutRepository.saveModifiedAsNewTemplate(templateName, draft.exercises)
            _userMessage.emit("Zapisano nowy szablon: $templateName")
        }
    }

    fun finalizeWorkout(advanceRotation: Boolean) {
        viewModelScope.launch {
            val result = workoutRepository.finalizeSession(advanceRotation)
            if (result != null) {
                if (advanceRotation) {
                    planRepository.advanceRotation()
                }
                _userMessage.emit("Trening ukończony! Zapisano ${result.completedSetsCount} serii.")
            }
        }
    }

    // --- PLANS & CYCLES ACTIONS ---
    fun updateDayStatus(
        dateIso: String,
        newStatus: CompletionStatus,
        showWarningIfNotActualSession: Boolean = true
    ) {
        viewModelScope.launch {
            val cycle = activeCycle.value ?: return@launch
            val entry = cycle.scheduleEntries.find { it.dateIso == dateIso } ?: return@launch

            val updatedEntry = entry.copy(status = newStatus)
            planRepository.updateScheduleEntry(updatedEntry)

            if (newStatus == CompletionStatus.WYKONANY && !entry.hasActualSession && showWarningIfNotActualSession) {
                _userMessage.emit("Uwaga: Oznaczono dzień jako Wykonany bez sesji. Nie dodano fikcyjnych serii ani objętości.")
            }
        }
    }

    fun updateDayDetails(
        dateIso: String,
        dayType: DayPlanType,
        workoutTemplateId: String?,
        workoutName: String?,
        status: CompletionStatus,
        notes: String
    ) {
        viewModelScope.launch {
            val cycle = activeCycle.value ?: return@launch
            val entry = cycle.scheduleEntries.find { it.dateIso == dateIso } ?: return@launch
            val updated = entry.copy(
                dayType = dayType,
                workoutTemplateId = workoutTemplateId,
                workoutName = workoutName,
                status = status,
                notes = notes
            )
            planRepository.updateScheduleEntry(updated)
            _userMessage.emit("Zaktualizowano dzień $dateIso")
        }
    }

    fun copyWeek(sourceStartIdx: Int, targetStartIdx: Int, selectedDays: List<Int>) {
        viewModelScope.launch {
            if (targetStartIdx <= sourceStartIdx) {
                _userMessage.emit("Błąd: Kopiowanie dozwolone wyłącznie do przyszłego tygodnia.")
                return@launch
            }
            planRepository.copyWeekToFuture(sourceStartIdx, targetStartIdx, selectedDays)
            _userMessage.emit("Skopiowano harmonogram do wybranego tygodnia.")
        }
    }

    fun advanceRotation() {
        viewModelScope.launch {
            planRepository.advanceRotation()
            _userMessage.emit("Przesunięto rotację do kolejnego treningu.")
        }
    }

    fun skipCurrentRotation() {
        viewModelScope.launch {
            planRepository.skipCurrentRotation()
            _userMessage.emit("Pominięto trening w sekwencji rotacji.")
        }
    }

    fun startNewCycle(name: String, cycleType: CycleType, startWorkoutName: String) {
        viewModelScope.launch {
            planRepository.startNewCycle(name, cycleType, startWorkoutName)
            _userMessage.emit("Rozpoczęto nowy cykl: $name")
        }
    }

    fun endCurrentCycle(archiveUnfinished: Boolean) {
        viewModelScope.launch {
            planRepository.endCycle(archiveUnfinished)
            _userMessage.emit("Cykl został zakończony")
        }
    }

    // --- CALENDAR ACTIONS ---
    fun addSubstanceEntry(dateIso: String, timeStr: String, name: String, manualInfo: String) {
        viewModelScope.launch {
            val entry = SubstanceEntry(
                id = "sub_${UUID.randomUUID()}",
                dateIso = dateIso,
                timeStr = timeStr,
                substanceName = name,
                manualInfo = manualInfo,
                isVerifiedByUser = false
            )
            calendarRepository.addSubstanceEntry(entry)
            _userMessage.emit("Zapisano wpis substancji (wymaga weryfikacji)")
        }
    }

    fun addNoteEntry(dateIso: String, timeStr: String, title: String, content: String) {
        viewModelScope.launch {
            val entry = NoteEntry(
                id = "note_${UUID.randomUUID()}",
                dateIso = dateIso,
                timeStr = timeStr,
                title = title,
                content = content
            )
            calendarRepository.addNoteEntry(entry)
            _userMessage.emit("Zapisano notatkę")
        }
    }

    fun deleteSubstanceEntry(id: String) {
        viewModelScope.launch {
            calendarRepository.deleteSubstanceEntry(id)
        }
    }

    fun deleteNoteEntry(id: String) {
        viewModelScope.launch {
            calendarRepository.deleteNoteEntry(id)
        }
    }

    // --- LIBRARY & IMPORT ACTIONS ---
    fun addCustomExercise(name: String, category: ExerciseCategory, notes: String) {
        viewModelScope.launch {
            val ex = Exercise(
                id = "ex_${UUID.randomUUID()}",
                name = name,
                category = category,
                notes = notes,
                isCustom = true
            )
            exerciseRepository.addExercise(ex)
            _userMessage.emit("Dodano ćwiczenie do kategorii: ${category.displayName}")
        }
    }

    fun updateExercise(exercise: Exercise) {
        viewModelScope.launch {
            exerciseRepository.updateExercise(exercise)
            _userMessage.emit("Zaktualizowano ćwiczenie w bibliotece")
        }
    }

    suspend fun performGymTrackerImport(
        candidates: List<ImportCandidate>,
        strategy: MergeStrategy = MergeStrategy.SKIP_DUPLICATES
    ): ImportExecutionResult {
        val result = exerciseRepository.importExercises(candidates, strategy)
        if (result.isSuccess) {
            _userMessage.emit("Import zakończony: dodano ${result.addedCount}, zaktualizowano ${result.updatedCount}, pominięto ${result.skippedCount}.")
        } else {
            _userMessage.emit("Błąd importu: ${result.errorMessage ?: "Błąd transakcji"}")
        }
        return result
    }

    // --- SETTINGS ACTIONS ---
    fun updateStartScreen(option: StartScreenOption) {
        viewModelScope.launch {
            settingsRepository.updateStartScreen(option)
            _userMessage.emit("Ustawiono domyślny ekran startowy: ${option.displayName}")
        }
    }

    fun updateReminderDays(days: Int) {
        viewModelScope.launch {
            settingsRepository.updateReminderDays(days)
            val msg = if (days > 0) "Przypomnienie o przerwanej sesji: co $days dni" else "Przypomnienia wyłączone"
            _userMessage.emit(msg)
        }
    }

    fun createLocalBackup() {
        viewModelScope.launch {
            val fileName = settingsRepository.createLocalBackup()
            _userMessage.emit("Utworzono lokalną kopię: $fileName")
        }
    }

    fun exportEncryptedBackup() {
        viewModelScope.launch {
            val fileName = settingsRepository.exportEncryptedBackup()
            _userMessage.emit("Wyeksportowano zaszyfrowany plik: $fileName")
        }
    }

    // --- COMPUTATION ENGINE ---
    private fun calculateAnalytics(
        sessions: List<CompletedWorkoutSession>,
        cycle: TrainingCycle?
    ): OverallAnalytics {
        val totalWorkouts = sessions.size
        var totalSets = 0
        var totalDuration = 0

        // Strict 7 categories distribution: exactly 1 completed set is counted only once!
        val categoryCounts = ExerciseCategory.entries.associateWith { 0 }.toMutableMap()

        for (session in sessions) {
            totalDuration += session.durationMinutes
            for (exercise in session.exercises) {
                if (exercise.isSkipped) continue
                val completedSets = exercise.sets.count { it.isApproved == true }
                totalSets += completedSets
                val cat = exercise.category
                categoryCounts[cat] = (categoryCounts[cat] ?: 0) + completedSets
            }
        }

        val totalValidSets = categoryCounts.values.sum().coerceAtLeast(1)
        val breakdown = ExerciseCategory.entries.map { cat ->
            val count = categoryCounts[cat] ?: 0
            val pct = (count.toFloat() / totalValidSets.toFloat()) * 100f
            CategorySetCount(cat, count, pct)
        }

        val avgDuration = if (totalWorkouts > 0) totalDuration / totalWorkouts else 0

        val monthly = listOf(
            MonthlyStats("Wrzesień 2026", totalWorkouts, totalSets, totalDuration),
            MonthlyStats("Sierpień 2026", 14, 168, 980)
        )

        val cycleStats = if (cycle != null) {
            listOf(
                CycleStats(
                    cycleId = cycle.id,
                    cycleName = cycle.name,
                    completedWorkoutsCount = totalWorkouts,
                    totalSetsCount = totalSets,
                    totalDurationMinutes = totalDuration,
                    categoryBreakdown = breakdown
                )
            )
        } else emptyList()

        return OverallAnalytics(
            totalWorkoutsCount = totalWorkouts,
            totalSetsCount = totalSets,
            totalDurationMinutes = totalDuration,
            averageSessionDurationMinutes = avgDuration,
            categoryBreakdown = breakdown,
            monthlyStats = monthly,
            cycleStatsList = cycleStats
        )
    }
}
