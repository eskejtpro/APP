package com.example.feature.workout

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.domain.model.*
import com.example.ui.theme.*
import com.example.viewmodel.MainViewModel
import java.util.Locale

@Composable
fun WorkoutScreen(
    viewModel: MainViewModel,
    onFinishNavigateToAnalytics: () -> Unit
) {
    val activeDraft by viewModel.activeDraft.collectAsState()
    val exercisesLibrary by viewModel.exercises.collectAsState()
    val templates by viewModel.templates.collectAsState()

    // Rest Timer & Session Duration States (Etap 4A)
    val restTimerRemaining by viewModel.restTimerRemainingSeconds.collectAsState()
    val restTimerTotal by viewModel.restTimerTotalSeconds.collectAsState()
    val isRestTimerRunning by viewModel.isRestTimerRunning.collectAsState()
    val isRestTimerFinished by viewModel.isRestTimerFinished.collectAsState()
    val sessionDurationSeconds by viewModel.sessionDurationSeconds.collectAsState()

    // Modals
    var exerciseIndexToReplace by remember { mutableStateOf<Int?>(null) }
    var exerciseIndexToAddSet by remember { mutableStateOf<Int?>(null) }
    var showFinishWorkoutDialog by remember { mutableStateOf(false) }
    var showSaveTemplateDialog by remember { mutableStateOf(false) }
    var showDiscardSessionDialog by remember { mutableStateOf(false) }

    // If no active draft is present, show selector to start from template
    if (activeDraft == null) {
        NoActiveWorkoutView(
            templates = templates,
            onStartTemplate = { tpl ->
                viewModel.startWorkoutFromToday(tpl.id)
            }
        )
        return
    }

    val draft = activeDraft!!

    // Session duration format (mm:ss or hh:mm:ss)
    val sessionHours = sessionDurationSeconds / 3600
    val sessionMins = (sessionDurationSeconds % 3600) / 60
    val sessionSecs = sessionDurationSeconds % 60
    val formattedDuration = if (sessionHours > 0) {
        String.format(Locale.getDefault(), "%02d:%02d:%02d", sessionHours, sessionMins, sessionSecs)
    } else {
        String.format(Locale.getDefault(), "%02d:%02d", sessionMins, sessionSecs)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitnessBackground)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // --- ACTIVE SESSION HEADER ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Surface(
                        color = FitnessGreen,
                        shape = RoundedCornerShape(4.dp),
                        modifier = Modifier.size(8.dp)
                    ) {}
                    Text(
                        text = "AKTYWNA SESJA • $formattedDuration",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = FitnessGreen
                    )
                }
                Text(
                    text = draft.workoutName,
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = FitnessTextPrimary
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(Icons.Default.CloudDone, contentDescription = null, tint = FitnessGreen, modifier = Modifier.size(12.dp))
                    Text(
                        text = "Autozapis Room aktywny • Draft SQLite",
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                        color = FitnessTextTertiary
                    )
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                IconButton(
                    onClick = { showSaveTemplateDialog = true },
                    modifier = Modifier.testTag("save_template_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.BookmarkAdd,
                        contentDescription = "Zapisz jako szablon",
                        tint = FitnessCyan
                    )
                }

                IconButton(
                    onClick = { showDiscardSessionDialog = true },
                    modifier = Modifier.testTag("discard_session_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Porzuć sesję",
                        tint = FitnessRed
                    )
                }
            }
        }

        Spacer(Modifier.height(8.dp))

        // --- REST TIMER BAR / CARD (Etap 4A) ---
        RestTimerSection(
            remainingSeconds = restTimerRemaining,
            totalSeconds = restTimerTotal,
            isRunning = isRestTimerRunning,
            isFinished = isRestTimerFinished,
            onStartPreset = { seconds -> viewModel.startRestTimer(seconds) },
            onAdjust = { delta -> viewModel.adjustRestTimer(delta) },
            onPause = { viewModel.pauseRestTimer() },
            onResume = { viewModel.resumeRestTimer() },
            onReset = { viewModel.resetRestTimer() }
        )

        Spacer(Modifier.height(10.dp))

        // --- EXERCISE LIST ---
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .testTag("active_workout_exercises_list"),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            itemsIndexed(draft.exercises) { exIndex, workoutEx ->
                WorkoutExerciseCard(
                    exerciseIndex = exIndex,
                    workoutExercise = workoutEx,
                    canMoveUp = exIndex > 0,
                    canMoveDown = exIndex < draft.exercises.size - 1,
                    onMoveUp = { viewModel.reorderExercise(exIndex, exIndex - 1) },
                    onMoveDown = { viewModel.reorderExercise(exIndex, exIndex + 1) },
                    onSkipToggle = { viewModel.skipExercise(exIndex) },
                    onReplaceRequest = { exerciseIndexToReplace = exIndex },
                    onAddSetRequest = { exerciseIndexToAddSet = exIndex },
                    onSetApproval = { setIdx, approved ->
                        viewModel.setSetApprovedStatus(exIndex, setIdx, approved)
                    },
                    onUpdateSetValues = { setIdx, reps, weight ->
                        viewModel.updateSetParameters(exIndex, setIdx, reps, weight)
                    }
                )
            }

            item {
                Spacer(Modifier.height(8.dp))
                // Finalize session button
                Button(
                    onClick = { showFinishWorkoutDialog = true },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                        .testTag("finish_workout_button"),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = FitnessGreen,
                        contentColor = FitnessBackground
                    ),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = FitnessBackground)
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = "Finalizuj trening",
                        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold)
                    )
                }
                Spacer(Modifier.height(30.dp))
            }
        }
    }

    // --- DIALOG: DISCARD WORKOUT ---
    if (showDiscardSessionDialog) {
        AlertDialog(
            onDismissRequest = { showDiscardSessionDialog = false },
            icon = { Icon(Icons.Default.WarningAmber, contentDescription = null, tint = FitnessRed) },
            title = { Text("Porzucić bieżący trening?") },
            text = {
                Text(
                    text = "Wprowadzone w tej sesji serie zostaną zarchiwizowane. Dane nie zostaną dopisane do historii ukończonych treningów.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FitnessTextSecondary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.discardActiveWorkout()
                        showDiscardSessionDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = FitnessRed, contentColor = Color.White)
                ) {
                    Text("Porzuć trening")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDiscardSessionDialog = false }) {
                    Text("Anuluj")
                }
            }
        )
    }

    // --- DIALOG: REPLACE EXERCISE ---
    exerciseIndexToReplace?.let { exIdx ->
        val currentEx = draft.exercises[exIdx]
        ReplaceExerciseModal(
            currentExercise = currentEx,
            availableExercises = exercisesLibrary,
            onDismiss = { exerciseIndexToReplace = null },
            onConfirmReplace = { newEx, setsCount, weight, reps ->
                viewModel.replaceExercise(exIdx, newEx, setsCount, weight, reps)
                exerciseIndexToReplace = null
            }
        )
    }

    // --- DIALOG: ADD SET ---
    exerciseIndexToAddSet?.let { exIdx ->
        val currentEx = draft.exercises[exIdx]
        val lastSet = currentEx.sets.lastOrNull()
        AddSetModal(
            exerciseName = currentEx.exerciseName,
            defaultWeight = lastSet?.weightKg ?: 60.0,
            defaultReps = lastSet?.targetReps ?: 10,
            onDismiss = { exerciseIndexToAddSet = null },
            onConfirm = { reps, weight ->
                viewModel.addSetToExercise(exIdx, reps, weight)
                exerciseIndexToAddSet = null
            }
        )
    }

    // --- DIALOG: FINALIZE WORKOUT & ROTATION SHIFT ---
    if (showFinishWorkoutDialog) {
        val uncompletedSetsCount = draft.exercises
            .filterNot { it.isSkipped }
            .flatMap { it.sets }
            .count { it.isApproved == null }

        FinishWorkoutModal(
            uncompletedSetsCount = uncompletedSetsCount,
            onDismiss = { showFinishWorkoutDialog = false },
            onFinishWithRotation = {
                viewModel.finalizeWorkout(advanceRotation = true)
                showFinishWorkoutDialog = false
                onFinishNavigateToAnalytics()
            },
            onFinishWithoutRotation = {
                viewModel.finalizeWorkout(advanceRotation = false)
                showFinishWorkoutDialog = false
                onFinishNavigateToAnalytics()
            }
        )
    }

    // --- DIALOG: SAVE MODIFIED AS NEW TEMPLATE ---
    if (showSaveTemplateDialog) {
        var templateName by remember { mutableStateOf("${draft.workoutName} (Własny)") }
        AlertDialog(
            onDismissRequest = { showSaveTemplateDialog = false },
            title = { Text("Zapisz jako nowy szablon") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Opcja pozwala zapisać zmodyfikowane parametry serii i powtórzeń jako nowy szablon, bez nadpisywania oryginału.",
                        style = MaterialTheme.typography.bodySmall,
                        color = FitnessTextSecondary
                    )
                    OutlinedTextField(
                        value = templateName,
                        onValueChange = { templateName = it },
                        label = { Text("Nazwa nowego szablonu") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.saveSessionAsNewTemplate(templateName)
                        showSaveTemplateDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
                ) {
                    Text("Zapisz szablon")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSaveTemplateDialog = false }) {
                    Text("Anuluj")
                }
            }
        )
    }
}

@Composable
private fun WorkoutExerciseCard(
    exerciseIndex: Int,
    workoutExercise: WorkoutExercise,
    canMoveUp: Boolean,
    canMoveDown: Boolean,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
    onSkipToggle: () -> Unit,
    onReplaceRequest: () -> Unit,
    onAddSetRequest: () -> Unit,
    onSetApproval: (setIndex: Int, isApproved: Boolean?) -> Unit,
    onUpdateSetValues: (setIndex: Int, reps: Int, weight: Double) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("exercise_card_${workoutExercise.exerciseId}"),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (workoutExercise.isSkipped) FitnessSurface.copy(alpha = 0.5f) else FitnessSurface
        ),
        border = BorderStroke(1.dp, if (workoutExercise.isReplaced) FitnessCyan else FitnessBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Header with Exercise Name & 7 Category Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Surface(
                            color = FitnessGreen.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = workoutExercise.category.displayName,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                color = FitnessGreen
                            )
                        }

                        if (workoutExercise.isReplaced) {
                            Surface(
                                color = FitnessCyan.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = "Zamiennik",
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = FitnessCyan
                                )
                            }
                        }

                        if (workoutExercise.isSkipped) {
                            Surface(
                                color = FitnessRed.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = "Pominięte",
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = FitnessRed
                                )
                            }
                        }
                    }

                    Text(
                        text = workoutExercise.exerciseName,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = if (workoutExercise.isSkipped) FitnessTextTertiary else FitnessTextPrimary
                    )
                }

                // Move & Skip controls
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = onMoveUp,
                        enabled = canMoveUp,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.ArrowUpward, contentDescription = "Przesuń wyżej", tint = if (canMoveUp) FitnessTextSecondary else FitnessTextTertiary.copy(alpha = 0.3f), modifier = Modifier.size(18.dp))
                    }
                    IconButton(
                        onClick = onMoveDown,
                        enabled = canMoveDown,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.ArrowDownward, contentDescription = "Przesuń niżej", tint = if (canMoveDown) FitnessTextSecondary else FitnessTextTertiary.copy(alpha = 0.3f), modifier = Modifier.size(18.dp))
                    }
                }
            }

            if (!workoutExercise.isSkipped) {
                // Table header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Seria", modifier = Modifier.width(40.dp), style = MaterialTheme.typography.labelSmall, color = FitnessTextTertiary)
                    Text("Ciężar (kg)", modifier = Modifier.width(80.dp), style = MaterialTheme.typography.labelSmall, color = FitnessTextTertiary)
                    Text("Powtórzenia", modifier = Modifier.width(80.dp), style = MaterialTheme.typography.labelSmall, color = FitnessTextTertiary)
                    Text("Status", modifier = Modifier.width(70.dp), style = MaterialTheme.typography.labelSmall, color = FitnessTextTertiary)
                }

                // Sets rows
                workoutExercise.sets.forEachIndexed { setIdx, setItem ->
                    SetRowItem(
                        set = setItem,
                        onApproveToggle = {
                            val newStatus = when (setItem.isApproved) {
                                null -> true
                                true -> false
                                false -> null
                            }
                            onSetApproval(setIdx, newStatus)
                        },
                        onValuesChange = { newReps, newWeight ->
                            onUpdateSetValues(setIdx, newReps, newWeight)
                        }
                    )
                }

                // Action buttons: Add Set & Replace Exercise
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onAddSetRequest,
                        modifier = Modifier
                            .weight(1f)
                            .height(36.dp)
                            .testTag("add_set_button_${workoutExercise.exerciseId}"),
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, FitnessBorder)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(14.dp), tint = FitnessGreen)
                        Spacer(Modifier.width(4.dp))
                        Text("+ Seria", fontSize = 12.sp, color = FitnessTextPrimary)
                    }

                    OutlinedButton(
                        onClick = onReplaceRequest,
                        modifier = Modifier
                            .weight(1.3f)
                            .height(36.dp)
                            .testTag("replace_exercise_button_${workoutExercise.exerciseId}"),
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, FitnessBorder)
                    ) {
                        Icon(Icons.Default.SwapHoriz, contentDescription = null, modifier = Modifier.size(14.dp), tint = FitnessCyan)
                        Spacer(Modifier.width(4.dp))
                        Text("Zastąp ćwiczenie", fontSize = 12.sp, color = FitnessCyan)
                    }

                    OutlinedButton(
                        onClick = onSkipToggle,
                        modifier = Modifier
                            .weight(0.9f)
                            .height(36.dp),
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, FitnessBorder)
                    ) {
                        Text("Pomiń", fontSize = 11.sp, color = FitnessTextSecondary)
                    }
                }
            } else {
                TextButton(onClick = onSkipToggle) {
                    Text("Przywróć pominięte ćwiczenie", color = FitnessGreen)
                }
            }
        }
    }
}

@Composable
private fun SetRowItem(
    set: WorkoutSet,
    onApproveToggle: () -> Unit,
    onValuesChange: (reps: Int, weight: Double) -> Unit
) {
    var isEditing by remember { mutableStateOf(false) }
    var editReps by remember { mutableStateOf(set.actualReps.toString()) }
    var editWeight by remember { mutableStateOf(set.weightKg.toString()) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(FitnessSurfaceVariant)
            .padding(horizontal = 8.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Set number
        Text(
            text = "#${set.setNumber}",
            modifier = Modifier.width(36.dp),
            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
            color = FitnessTextSecondary
        )

        // Weight
        if (isEditing) {
            OutlinedTextField(
                value = editWeight,
                onValueChange = { editWeight = it },
                modifier = Modifier.width(76.dp),
                singleLine = true
            )
        } else {
            Text(
                text = "${set.weightKg} kg",
                modifier = Modifier
                    .width(76.dp)
                    .clickable { isEditing = true },
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                color = FitnessTextPrimary
            )
        }

        // Reps
        if (isEditing) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = editReps,
                    onValueChange = { editReps = it },
                    modifier = Modifier.width(56.dp),
                    singleLine = true
                )
                IconButton(
                    onClick = {
                        val r = editReps.toIntOrNull() ?: set.actualReps
                        val w = editWeight.toDoubleOrNull() ?: set.weightKg
                        onValuesChange(r, w)
                        isEditing = false
                    },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(Icons.Default.Check, contentDescription = "Zatwierdź", tint = FitnessGreen)
                }
            }
        } else {
            Text(
                text = "${set.actualReps} powt.",
                modifier = Modifier
                    .width(76.dp)
                    .clickable { isEditing = true },
                style = MaterialTheme.typography.bodyMedium,
                color = FitnessTextSecondary
            )
        }

        // Approval Button: ✓ (Approved) / ✕ (Rejected) / ? (Draft)
        val (btnColor, btnText, btnIcon) = when (set.isApproved) {
            true -> Triple(FitnessGreen, "Zatw.", Icons.Default.Check)
            false -> Triple(FitnessRed, "Odrz.", Icons.Default.Close)
            null -> Triple(FitnessAmber, "Szkic", Icons.Default.HourglassEmpty)
        }

        Surface(
            color = btnColor.copy(alpha = 0.2f),
            shape = RoundedCornerShape(6.dp),
            border = BorderStroke(1.dp, btnColor),
            modifier = Modifier
                .width(72.dp)
                .clickable { onApproveToggle() }
                .testTag("set_approval_button_${set.setNumber}")
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(btnIcon, contentDescription = null, tint = btnColor, modifier = Modifier.size(12.dp))
                Spacer(Modifier.width(4.dp))
                Text(
                    text = btnText,
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = btnColor
                )
            }
        }
    }
}

@Composable
private fun ReplaceExerciseModal(
    currentExercise: WorkoutExercise,
    availableExercises: List<Exercise>,
    onDismiss: () -> Unit,
    onConfirmReplace: (newEx: Exercise, setsCount: Int, weight: Double, reps: Int) -> Unit
) {
    var selectedExercise by remember { mutableStateOf<Exercise?>(null) }
    var replacementSetsCount by remember { mutableStateOf(3) }
    var replacementWeight by remember { mutableStateOf(50.0) }
    var replacementReps by remember { mutableStateOf(10) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Zastąp ćwiczenie w sesji") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Zasada: Wykonane i zatwierdzone serie pozostaną przy ćwiczeniu '${currentExercise.exerciseName}'. Niewykonana część zostanie zastąpiona nowym ćwiczeniem. Zamiana dotyczy wyłącznie aktualnej sesji.",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitnessTextSecondary
                )

                Text("Wybierz nowe ćwiczenie z biblioteki:", style = MaterialTheme.typography.labelMedium)
                LazyColumn(modifier = Modifier.height(140.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    itemsIndexed(availableExercises.filter { it.id != currentExercise.exerciseId }) { _, ex ->
                        Surface(
                            color = if (selectedExercise?.id == ex.id) FitnessSurfaceVariant else FitnessSurface,
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, if (selectedExercise?.id == ex.id) FitnessGreen else FitnessBorder),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { selectedExercise = ex }
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(ex.name, style = MaterialTheme.typography.bodySmall, color = FitnessTextPrimary)
                                Text(ex.category.displayName, style = MaterialTheme.typography.labelSmall, color = FitnessTextTertiary)
                            }
                        }
                    }
                }

                // Sets count
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Liczba serii zamiennika:", style = MaterialTheme.typography.bodySmall)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = { if (replacementSetsCount > 1) replacementSetsCount-- }) {
                            Icon(Icons.Default.Remove, contentDescription = null)
                        }
                        Text("$replacementSetsCount", fontWeight = FontWeight.Bold)
                        IconButton(onClick = { replacementSetsCount++ }) {
                            Icon(Icons.Default.Add, contentDescription = null)
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    selectedExercise?.let { ex ->
                        onConfirmReplace(ex, replacementSetsCount, replacementWeight, replacementReps)
                    }
                },
                enabled = selectedExercise != null,
                colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
            ) {
                Text("Zatwierdź zamianę")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Anuluj")
            }
        }
    )
}

@Composable
private fun AddSetModal(
    exerciseName: String,
    defaultWeight: Double,
    defaultReps: Int,
    onDismiss: () -> Unit,
    onConfirm: (reps: Int, weight: Double) -> Unit
) {
    var reps by remember { mutableStateOf(defaultReps.toString()) }
    var weight by remember { mutableStateOf(defaultWeight.toString()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Dodaj serię do $exerciseName") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "Możesz dowolnie zmienić powtórzenia i ciężar dla nowej serii.",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitnessTextSecondary
                )
                OutlinedTextField(
                    value = weight,
                    onValueChange = { weight = it },
                    label = { Text("Ciężar (kg)") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = reps,
                    onValueChange = { reps = it },
                    label = { Text("Powtórzenia") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val r = reps.toIntOrNull() ?: defaultReps
                    val w = weight.toDoubleOrNull() ?: defaultWeight
                    onConfirm(r, w)
                },
                colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
            ) {
                Text("Dodaj")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Anuluj")
            }
        }
    )
}

@Composable
private fun FinishWorkoutModal(
    uncompletedSetsCount: Int,
    onDismiss: () -> Unit,
    onFinishWithRotation: () -> Unit,
    onFinishWithoutRotation: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Finalizacja treningu") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (uncompletedSetsCount > 0) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = FitnessSurfaceVariant),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Row(modifier = Modifier.padding(10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(Icons.Default.Warning, contentDescription = null, tint = FitnessAmber)
                            Text(
                                text = "Wykryto $uncompletedSetsCount niezatwierdzonych / niewykonanych serii w szkicu!",
                                style = MaterialTheme.typography.bodySmall,
                                color = FitnessAmber
                            )
                        }
                    }
                }

                Text(
                    text = "Wybierz sposób rozliczenia sesji w rotacji planu:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FitnessTextSecondary
                )
            }
        },
        confirmButton = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onFinishWithRotation,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
                ) {
                    Text("Ukończ z przesunięciem rotacji", fontSize = 12.sp)
                }

                OutlinedButton(
                    onClick = onFinishWithoutRotation,
                    modifier = Modifier.fillMaxWidth(),
                    border = BorderStroke(1.dp, FitnessBorder)
                ) {
                    Text("Zachowaj bez przesunięcia", fontSize = 12.sp, color = FitnessTextPrimary)
                }

                TextButton(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Wróć do sesji")
                }
            }
        }
    )
}

@Composable
private fun NoActiveWorkoutView(
    templates: List<WorkoutTemplate>,
    onStartTemplate: (WorkoutTemplate) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitnessBackground)
            .padding(20.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Surface(
            color = FitnessSurfaceVariant,
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.size(72.dp)
        ) {
            Icon(
                imageVector = Icons.Default.FitnessCenter,
                contentDescription = null,
                tint = FitnessGreen,
                modifier = Modifier
                    .padding(18.dp)
                    .size(36.dp)
            )
        }

        Spacer(Modifier.height(16.dp))

        Text(
            text = "Brak aktywnego treningu",
            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
            color = FitnessTextPrimary
        )

        Text(
            text = "Wybierz szablon, aby rozpocząć nową sesję roboczą:",
            style = MaterialTheme.typography.bodyMedium,
            color = FitnessTextSecondary
        )

        Spacer(Modifier.height(20.dp))

        templates.forEach { tpl ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp)
                    .clickable { onStartTemplate(tpl) },
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = FitnessSurface),
                border = BorderStroke(1.dp, FitnessBorder)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(tpl.name, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold), color = FitnessTextPrimary)
                        Text("${tpl.exercises.size} ćwiczeń • ${tpl.description}", style = MaterialTheme.typography.bodySmall, color = FitnessTextSecondary)
                    }
                    Icon(Icons.Default.PlayArrow, contentDescription = null, tint = FitnessGreen)
                }
            }
        }
    }
}

// -------------------------------------------------------------
// --- REST TIMER SECTION (Etap 4A) ---
// -------------------------------------------------------------

@Composable
private fun RestTimerSection(
    remainingSeconds: Int,
    totalSeconds: Int,
    isRunning: Boolean,
    isFinished: Boolean,
    onStartPreset: (Int) -> Unit,
    onAdjust: (Int) -> Unit,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onReset: () -> Unit
) {
    val progress = if (totalSeconds > 0) {
        (remainingSeconds.toFloat() / totalSeconds.toFloat()).coerceIn(0f, 1f)
    } else 0f

    val mins = remainingSeconds / 60
    val secs = remainingSeconds % 60
    val formattedTime = String.format(Locale.getDefault(), "%02d:%02d", mins, secs)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("rest_timer_card"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = when {
                isFinished -> FitnessAmber.copy(alpha = 0.15f)
                isRunning -> FitnessCyan.copy(alpha = 0.12f)
                else -> FitnessSurface
            }
        ),
        border = BorderStroke(
            width = if (isRunning || isFinished) 1.5.dp else 1.dp,
            color = when {
                isFinished -> FitnessAmber
                isRunning -> FitnessCyan
                else -> FitnessBorder
            }
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Surface(
                        color = when {
                            isFinished -> FitnessAmber
                            isRunning -> FitnessCyan
                            else -> FitnessTextTertiary
                        },
                        shape = CircleShape,
                        modifier = Modifier.size(8.dp)
                    ) {}

                    Text(
                        text = when {
                            isFinished -> "CZAS NA SERIĘ! (ODPOCZYNEK ZAKOŃCZONY)"
                            isRunning -> "ODLICZANIE PRZERWY"
                            remainingSeconds > 0 -> "PRZERWA WSTRZYMANA"
                            else -> "STOPER ODPOCZYNKU MIĘDZY SERIAMI"
                        },
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = when {
                            isFinished -> FitnessAmber
                            isRunning -> FitnessCyan
                            else -> FitnessTextSecondary
                        }
                    )
                }

                // Display Timer text
                if (remainingSeconds > 0 || isFinished) {
                    Text(
                        text = formattedTime,
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.sp
                        ),
                        color = when {
                            isFinished -> FitnessAmber
                            isRunning -> FitnessCyan
                            else -> FitnessTextPrimary
                        }
                    )
                }
            }

            // Linear Progress Bar during active countdown
            if (remainingSeconds > 0) {
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = if (isRunning) FitnessCyan else FitnessAmber,
                    trackColor = FitnessSurfaceVariant
                )
            }

            // Quick Control / Preset row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Preset Chips (60s, 90s, 120s, 180s)
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    listOf(60, 90, 120, 180).forEach { sec ->
                        val isPresetActive = totalSeconds == sec && (isRunning || remainingSeconds > 0)
                        Surface(
                            color = if (isPresetActive) FitnessCyan.copy(alpha = 0.25f) else FitnessSurfaceVariant,
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, if (isPresetActive) FitnessCyan else FitnessBorder),
                            modifier = Modifier
                                .clickable { onStartPreset(sec) }
                                .testTag("rest_preset_${sec}s")
                        ) {
                            Text(
                                text = "${sec}s",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = if (isPresetActive) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isPresetActive) FitnessCyan else FitnessTextSecondary
                                )
                            )
                        }
                    }
                }

                // Fine Adjustments (+/- 15s) and Play/Pause controls
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                    if (remainingSeconds > 0 || isRunning) {
                        Surface(
                            color = FitnessSurfaceVariant,
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, FitnessBorder),
                            modifier = Modifier.clickable { onAdjust(-15) }
                        ) {
                            Text("-15s", modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp), style = MaterialTheme.typography.labelSmall, color = FitnessTextSecondary)
                        }

                        Surface(
                            color = FitnessSurfaceVariant,
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, FitnessBorder),
                            modifier = Modifier.clickable { onAdjust(15) }
                        ) {
                            Text("+15s", modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp), style = MaterialTheme.typography.labelSmall, color = FitnessTextSecondary)
                        }

                        IconButton(
                            onClick = if (isRunning) onPause else onResume,
                            modifier = Modifier.size(30.dp)
                        ) {
                            Icon(
                                imageVector = if (isRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = if (isRunning) "Pauza" else "Wznów",
                                tint = FitnessCyan,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        IconButton(
                            onClick = onReset,
                            modifier = Modifier.size(30.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Zresetuj stoper",
                                tint = FitnessTextTertiary,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

