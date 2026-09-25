package com.example.data.sample

import com.example.domain.model.*

object SampleData {

    val exercisesList = listOf(
        // Klatka piersiowa
        Exercise("ex_1", "Wyciskanie sztangi na ławce poziomej", ExerciseCategory.KLATKA_PIERSIOWA, "Główne ćwiczenie siłowe"),
        Exercise("ex_2", "Wyciskanie hantli na skosie dodatnim", ExerciseCategory.KLATKA_PIERSIOWA, "Kąt 30 stopni, pełna kontrola"),
        Exercise("ex_3", "Rozpiętki na bramie z linkami", ExerciseCategory.KLATKA_PIERSIOWA, "Przytrzymanie skurczu 1s"),
        // Plecy
        Exercise("ex_4", "Podciąganie nachwytem z ciężarem", ExerciseCategory.PLECY, "Pełen zakres ruchu"),
        Exercise("ex_5", "Wiosłowanie sztangą w opadzie", ExerciseCategory.PLECY, "Prowadzenie łokci blisko tułowia"),
        Exercise("ex_6", "Ściąganie drążka wyciągu górnego", ExerciseCategory.PLECY, "Do górnej części klatki"),
        // Barki
        Exercise("ex_7", "Wyciskanie żołnierskie (OHP)", ExerciseCategory.BARKI, "Napięty brzuch i pośladki"),
        Exercise("ex_8", "Wznosy hantli bokiem", ExerciseCategory.BARKI, "Lekko ugięte łokcie, kciuk neutralnie"),
        Exercise("ex_9", "Face pull na wyciągu", ExerciseCategory.BARKI, "Retrakcja łopatek, zewnętrzna rotacja"),
        // Nogi
        Exercise("ex_10", "Przysiad ze sztangą na plecach", ExerciseCategory.NOGI, "Głębokość poniżej kąta prostego"),
        Exercise("ex_11", "Wypychanie ciężaru na suwnicy", ExerciseCategory.NOGI, "Stopy na szerokość bioder"),
        Exercise("ex_12", "Uginanie nóg leżąc na maszynie", ExerciseCategory.NOGI, "Izolacja mięśni kulszowo-goleniowych"),
        // Biceps
        Exercise("ex_13", "Uginanie przedramion z hantlami z supinacją", ExerciseCategory.BICEPS, "Kontrolowana faza ekscentryczna"),
        Exercise("ex_14", "Uginanie na modlitewniku ze sztangą łamaną", ExerciseCategory.BICEPS, "Stałe napięcie w dolnej fazie"),
        // Triceps
        Exercise("ex_15", "Dipy na poręczach z obciążeniem", ExerciseCategory.TRICEPS, "Tułów pionowo dla nacisku na triceps"),
        Exercise("ex_16", "Prostowanie ramion na wyciągu (sznur)", ExerciseCategory.TRICEPS, "Rozszerzenie linek w dole"),
        // Pozostałe
        Exercise("ex_17", "Allahy - spięcia brzucha na wyciągu", ExerciseCategory.POZOSTALE, "Koncentracja na zwijaniu tułowia"),
        Exercise("ex_18", "Wspięcia na palce stojąc", ExerciseCategory.POZOSTALE, "Pauza 2s w pełnym rozciągnięciu")
    )

    val pushWorkoutExerciseList = listOf(
        WorkoutExercise(
            exerciseId = "ex_1",
            exerciseName = "Wyciskanie sztangi na ławce poziomej",
            category = ExerciseCategory.KLATKA_PIERSIOWA,
            sets = listOf(
                WorkoutSet(1, targetReps = 8, actualReps = 8, weightKg = 100.0, isApproved = true),
                WorkoutSet(2, targetReps = 8, actualReps = 8, weightKg = 100.0, isApproved = true),
                WorkoutSet(3, targetReps = 8, actualReps = 7, weightKg = 100.0, isApproved = null)
            )
        ),
        WorkoutExercise(
            exerciseId = "ex_2",
            exerciseName = "Wyciskanie hantli na skosie dodatnim",
            category = ExerciseCategory.KLATKA_PIERSIOWA,
            sets = listOf(
                WorkoutSet(1, targetReps = 10, actualReps = 10, weightKg = 36.0, isApproved = null),
                WorkoutSet(2, targetReps = 10, actualReps = 9, weightKg = 36.0, isApproved = null),
                WorkoutSet(3, targetReps = 10, actualReps = 8, weightKg = 36.0, isApproved = null)
            )
        ),
        WorkoutExercise(
            exerciseId = "ex_8",
            exerciseName = "Wznosy hantli bokiem",
            category = ExerciseCategory.BARKI,
            sets = listOf(
                WorkoutSet(1, targetReps = 15, actualReps = 15, weightKg = 14.0, isApproved = null),
                WorkoutSet(2, targetReps = 15, actualReps = 14, weightKg = 14.0, isApproved = null),
                WorkoutSet(3, targetReps = 15, actualReps = 12, weightKg = 14.0, isApproved = null)
            )
        ),
        WorkoutExercise(
            exerciseId = "ex_16",
            exerciseName = "Prostowanie ramion na wyciągu (sznur)",
            category = ExerciseCategory.TRICEPS,
            sets = listOf(
                WorkoutSet(1, targetReps = 12, actualReps = 12, weightKg = 35.0, isApproved = null),
                WorkoutSet(2, targetReps = 12, actualReps = 11, weightKg = 35.0, isApproved = null),
                WorkoutSet(3, targetReps = 12, actualReps = 10, weightKg = 35.0, isApproved = null)
            )
        )
    )

    val templates = listOf(
        WorkoutTemplate(
            id = "tpl_push_a",
            name = "Push A (Klatka, Barki, Triceps)",
            description = "Akcent na klatkę i siłę wyciskania",
            exercises = pushWorkoutExerciseList
        ),
        WorkoutTemplate(
            id = "tpl_pull_a",
            name = "Pull A (Plecy, Tył barku, Biceps)",
            description = "Akcent na szerokość pleców i wiosłowanie",
            exercises = listOf(
                WorkoutExercise(
                    exerciseId = "ex_4",
                    exerciseName = "Podciąganie nachwytem z ciężarem",
                    category = ExerciseCategory.PLECY,
                    sets = listOf(
                        WorkoutSet(1, 6, 6, 15.0),
                        WorkoutSet(2, 6, 6, 15.0),
                        WorkoutSet(3, 6, 5, 15.0)
                    )
                ),
                WorkoutExercise(
                    exerciseId = "ex_5",
                    exerciseName = "Wiosłowanie sztangą w opadzie",
                    category = ExerciseCategory.PLECY,
                    sets = listOf(
                        WorkoutSet(1, 8, 8, 90.0),
                        WorkoutSet(2, 8, 8, 90.0),
                        WorkoutSet(3, 8, 8, 90.0)
                    )
                ),
                WorkoutExercise(
                    exerciseId = "ex_9",
                    exerciseName = "Face pull na wyciągu",
                    category = ExerciseCategory.BARKI,
                    sets = listOf(
                        WorkoutSet(1, 15, 15, 25.0),
                        WorkoutSet(2, 15, 15, 25.0)
                    )
                ),
                WorkoutExercise(
                    exerciseId = "ex_13",
                    exerciseName = "Uginanie przedramion z supinacją",
                    category = ExerciseCategory.BICEPS,
                    sets = listOf(
                        WorkoutSet(1, 10, 10, 18.0),
                        WorkoutSet(2, 10, 9, 18.0),
                        WorkoutSet(3, 10, 8, 18.0)
                    )
                )
            )
        ),
        WorkoutTemplate(
            id = "tpl_legs_a",
            name = "Legs A (Czworogłowe, Dwugłowe, Łydki)",
            description = "Intensywny trening dolnych partii",
            exercises = listOf(
                WorkoutExercise(
                    exerciseId = "ex_10",
                    exerciseName = "Przysiad ze sztangą na plecach",
                    category = ExerciseCategory.NOGI,
                    sets = listOf(
                        WorkoutSet(1, 6, 6, 140.0),
                        WorkoutSet(2, 6, 6, 140.0),
                        WorkoutSet(3, 6, 5, 140.0)
                    )
                ),
                WorkoutExercise(
                    exerciseId = "ex_11",
                    exerciseName = "Wypychanie ciężaru na suwnicy",
                    category = ExerciseCategory.NOGI,
                    sets = listOf(
                        WorkoutSet(1, 10, 10, 260.0),
                        WorkoutSet(2, 10, 10, 260.0)
                    )
                ),
                WorkoutExercise(
                    exerciseId = "ex_12",
                    exerciseName = "Uginanie nóg leżąc na maszynie",
                    category = ExerciseCategory.NOGI,
                    sets = listOf(
                        WorkoutSet(1, 12, 12, 50.0),
                        WorkoutSet(2, 12, 11, 50.0)
                    )
                ),
                WorkoutExercise(
                    exerciseId = "ex_18",
                    exerciseName = "Wspięcia na palce stojąc",
                    category = ExerciseCategory.POZOSTALE,
                    sets = listOf(
                        WorkoutSet(1, 15, 15, 80.0),
                        WorkoutSet(2, 15, 15, 80.0)
                    )
                )
            )
        )
    )

    val sampleCycleSchedule = listOf(
        DayScheduleEntry("2026-09-21", "Poniedziałek", DayPlanType.ASSIGNED_WORKOUT, "tpl_push_a", "Push A", CompletionStatus.WYKONANY, hasActualSession = true),
        DayScheduleEntry("2026-09-22", "Wtorek", DayPlanType.ASSIGNED_WORKOUT, "tpl_pull_a", "Pull A", CompletionStatus.WYKONANY, hasActualSession = true),
        DayScheduleEntry("2026-09-23", "Środa", DayPlanType.REST_DAY, null, null, CompletionStatus.WYKONANY),
        DayScheduleEntry("2026-09-24", "Czwartek", DayPlanType.ASSIGNED_WORKOUT, "tpl_legs_a", "Legs A", CompletionStatus.NIEROZSTRZYGNIETY),
        DayScheduleEntry("2026-09-25", "Piątek", DayPlanType.ASSIGNED_WORKOUT, "tpl_push_a", "Push B (Wycisk hantli)", CompletionStatus.NIEROZSTRZYGNIETY),
        DayScheduleEntry("2026-09-26", "Sobota", DayPlanType.ASSIGNED_WORKOUT, "tpl_pull_a", "Pull B (Martwy ciąg)", CompletionStatus.NIEROZSTRZYGNIETY),
        DayScheduleEntry("2026-09-27", "Niedziela", DayPlanType.REST_DAY, null, null, CompletionStatus.NIEROZSTRZYGNIETY),
        // Kolejny tydzień
        DayScheduleEntry("2026-09-28", "Poniedziałek", DayPlanType.ASSIGNED_WORKOUT, "tpl_legs_a", "Legs B", CompletionStatus.NIEROZSTRZYGNIETY),
        DayScheduleEntry("2026-09-29", "Wtorek", DayPlanType.ASSIGNED_WORKOUT, "tpl_push_a", "Push A", CompletionStatus.NIEROZSTRZYGNIETY),
        DayScheduleEntry("2026-09-30", "Środa", DayPlanType.REST_DAY, null, null, CompletionStatus.NIEROZSTRZYGNIETY)
    )

    val initialCycle = TrainingCycle(
        id = "cycle_1",
        name = "Cykl 1: Jesień 2026 (Rotacyjny PPL)",
        cycleType = CycleType.ROTATIONAL,
        startDateIso = "2026-09-21",
        endDateIso = "2026-11-15",
        isActive = true,
        scheduleEntries = sampleCycleSchedule,
        rotationSequence = listOf("Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"),
        currentRotationIndex = 2 // Legs A is next
    )

    // Initial interrupted session to satisfy requirement:
    // "Jeżeli istnieje przerwana sesja, pokaż widoczny komunikat z możliwością wznowienia jednym dotknięciem."
    val initialInterruptedDraft = ActiveSessionDraft(
        workoutId = "tpl_push_a",
        workoutName = "Push A (Klatka, Barki, Triceps)",
        startTimeMillis = System.currentTimeMillis() - (28 * 3600 * 1000L), // wczoraj
        exercises = pushWorkoutExerciseList,
        isInterrupted = true,
        lastActivityTimestamp = System.currentTimeMillis() - (28 * 3600 * 1000L),
        isUnsettledDraft = true
    )

    val substanceLibrary = listOf(
        SubstanceLibraryItem("Testosteron Enanthate", "Testosterony"),
        SubstanceLibraryItem("Testosteron Cypionate", "Testosterony"),
        SubstanceLibraryItem("Testosteron Propionate", "Testosterony"),
        SubstanceLibraryItem("Primobolan (Methenolone)", "Pochodne DHT"),
        SubstanceLibraryItem("Anavar (Oxandrolone)", "Pochodne DHT"),
        SubstanceLibraryItem("HCG (Gonadotropina)", "Peptydy"),
        SubstanceLibraryItem("Anastrozol (Arimidex)", "Inhibitory aromatazy"),
        SubstanceLibraryItem("Eksemestan (Aromasin)", "Inhibitory aromatazy"),
        SubstanceLibraryItem("Inna pozycja własna", "Własne")
    )

    val sampleSubstanceEntries = listOf(
        SubstanceEntry("sub_1", "2026-09-24", "08:00", "Testosteron Cypionate", "Wpis informacyjny (wymaga weryfikacji)", isVerifiedByUser = false),
        SubstanceEntry("sub_2", "2026-09-21", "08:15", "Testosteron Cypionate", "Wpis informacyjny (wymaga weryfikacji)", isVerifiedByUser = true)
    )

    val sampleNotes = listOf(
        NoteEntry("note_1", "2026-09-24", "07:30", "Regeneracja i sen", "Sen 8h, dobra regeneracja po wczorajszym dniu wolnym. Dzisiaj skupienie na technice przysiadów."),
        NoteEntry("note_2", "2026-09-22", "21:00", "Wnioski po treningu pleców", "Ciężar 90kg w wiosłowaniu poszedł gładko, zachować ten sam w kolejnej rotacji.")
    )

    val sampleCompletedSessions = listOf(
        CompletedWorkoutSession(
            sessionId = "sess_1",
            workoutName = "Push A",
            dateIso = "2026-09-21",
            durationMinutes = 68,
            exercises = pushWorkoutExerciseList,
            completedSetsCount = 12,
            totalVolumeKg = 8450.0,
            advancedRotation = true
        ),
        CompletedWorkoutSession(
            sessionId = "sess_2",
            workoutName = "Pull A",
            dateIso = "2026-09-22",
            durationMinutes = 72,
            exercises = templates[1].exercises,
            completedSetsCount = 11,
            totalVolumeKg = 7920.0,
            advancedRotation = true
        )
    )
}
