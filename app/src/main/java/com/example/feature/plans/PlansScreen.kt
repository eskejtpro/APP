package com.example.feature.plans

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.domain.model.*
import com.example.ui.theme.*
import com.example.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class PlansViewMode {
    WEEK,
    MONTH
}

@Composable
fun PlansScreen(
    viewModel: MainViewModel,
    onNavigateToWorkout: () -> Unit
) {
    val activeCycle by viewModel.activeCycle.collectAsState()
    val templates by viewModel.templates.collectAsState()
    var viewMode by remember { mutableStateOf(PlansViewMode.WEEK) }

    // Week navigation & selection state
    val scheduleEntries = activeCycle?.scheduleEntries ?: emptyList()
    val weekChunks = remember(scheduleEntries) {
        if (scheduleEntries.isEmpty()) emptyList() else scheduleEntries.chunked(7)
    }
    var selectedWeekIdx by remember { mutableIntStateOf(0) }
    var selectedDayIso by remember { mutableStateOf<String?>(null) }

    // Automatically select the first day or today when cycle / week changes
    val currentWeekEntries = weekChunks.getOrNull(selectedWeekIdx) ?: emptyList()
    val activeSelectedDay = remember(currentWeekEntries, selectedDayIso) {
        currentWeekEntries.find { it.dateIso == selectedDayIso }
            ?: currentWeekEntries.firstOrNull()
    }

    // Dialog & confirmation states
    var showAssignModalForDay by remember { mutableStateOf<DayScheduleEntry?>(null) }
    var pendingActionOnDay by remember { mutableStateOf<Pair<DayScheduleEntry, () -> Unit>?>(null) }
    var showCopyWeekDialog by remember { mutableStateOf(false) }
    var showEndCycleDialog by remember { mutableStateOf(false) }
    var showWarningWithoutSessionDialog by remember { mutableStateOf<DayScheduleEntry?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitnessBackground)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // --- TOP BAR & VIEW TOGGLE ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Harmonogram & Plany",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = FitnessTextPrimary
                )
                Text(
                    text = activeCycle?.name ?: "Brak aktywnego cyklu",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitnessGreen
                )
            }

            // View toggle (Tydzień / Miesiąc)
            Surface(
                color = FitnessSurfaceVariant,
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, FitnessBorder)
            ) {
                Row(modifier = Modifier.padding(4.dp)) {
                    Surface(
                        color = if (viewMode == PlansViewMode.WEEK) FitnessGreen else Color.Transparent,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .clickable { viewMode = PlansViewMode.WEEK }
                            .testTag("toggle_week_view")
                    ) {
                        Text(
                            text = "Tydzień",
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = if (viewMode == PlansViewMode.WEEK) FitnessBackground else FitnessTextSecondary
                            )
                        )
                    }

                    Surface(
                        color = if (viewMode == PlansViewMode.MONTH) FitnessGreen else Color.Transparent,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .clickable { viewMode = PlansViewMode.MONTH }
                            .testTag("toggle_month_view")
                    ) {
                        Text(
                            text = "Miesiąc",
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = if (viewMode == PlansViewMode.MONTH) FitnessBackground else FitnessTextSecondary
                            )
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        // --- ROTATION & ACTION BAR ---
        activeCycle?.let { cycle ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = FitnessSurface),
                border = BorderStroke(1.dp, FitnessBorder)
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Kolejny w rotacji:",
                                style = MaterialTheme.typography.labelSmall,
                                color = FitnessTextSecondary
                            )
                            val nextWorkout = cycle.rotationSequence.getOrNull(cycle.currentRotationIndex) ?: "Push A"
                            Text(
                                text = nextWorkout,
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = FitnessTextPrimary
                            )
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            OutlinedButton(
                                onClick = { viewModel.skipCurrentRotation() },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                border = BorderStroke(1.dp, FitnessBorder),
                                modifier = Modifier.testTag("skip_rotation_button")
                            ) {
                                Text("Pomiń", fontSize = 11.sp, color = FitnessTextSecondary)
                            }

                            Button(
                                onClick = { viewModel.advanceRotation() },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = FitnessGreenContainer()),
                                modifier = Modifier.testTag("advance_rotation_button")
                            ) {
                                Text("Przesuń", fontSize = 11.sp, color = FitnessGreen)
                            }
                        }
                    }

                    // Copy week / End cycle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { showCopyWeekDialog = true },
                            modifier = Modifier
                                .weight(1f)
                                .height(36.dp)
                                .testTag("copy_week_button"),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, FitnessBorder)
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(14.dp), tint = FitnessCyan)
                            Spacer(Modifier.width(4.dp))
                            Text("Kopiuj tydzień", fontSize = 11.sp, color = FitnessTextPrimary)
                        }

                        OutlinedButton(
                            onClick = { showEndCycleDialog = true },
                            modifier = Modifier
                                .weight(1f)
                                .height(36.dp)
                                .testTag("end_cycle_button"),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, FitnessBorder)
                        ) {
                            Icon(Icons.Default.Flag, contentDescription = null, modifier = Modifier.size(14.dp), tint = FitnessAmber)
                            Spacer(Modifier.width(4.dp))
                            Text("Zakończ cykl", fontSize = 11.sp, color = FitnessAmber)
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        // --- CONTENT: NEW WEEK VIEW OR MONTH VIEW ---
        if (viewMode == PlansViewMode.WEEK) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("plans_week_container"),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // 1. Week navigation header (Poprzedni / Następny tydzień)
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = {
                                if (selectedWeekIdx > 0) {
                                    selectedWeekIdx--
                                    selectedDayIso = weekChunks.getOrNull(selectedWeekIdx)?.firstOrNull()?.dateIso
                                }
                            },
                            enabled = selectedWeekIdx > 0,
                            modifier = Modifier
                                .size(36.dp)
                                .testTag("prev_week_button")
                        ) {
                            Icon(
                                Icons.Default.ChevronLeft,
                                contentDescription = "Poprzedni tydzień",
                                tint = if (selectedWeekIdx > 0) FitnessGreen else FitnessTextTertiary
                            )
                        }

                        val weekStart = currentWeekEntries.firstOrNull()?.dateIso ?: ""
                        val weekEnd = currentWeekEntries.lastOrNull()?.dateIso ?: ""
                        Text(
                            text = "Tydzień ${selectedWeekIdx + 1} • ($weekStart — $weekEnd)",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = FitnessTextPrimary,
                            modifier = Modifier.testTag("week_header_text")
                        )

                        IconButton(
                            onClick = {
                                if (selectedWeekIdx < weekChunks.size - 1) {
                                    selectedWeekIdx++
                                    selectedDayIso = weekChunks.getOrNull(selectedWeekIdx)?.firstOrNull()?.dateIso
                                }
                            },
                            enabled = selectedWeekIdx < weekChunks.size - 1,
                            modifier = Modifier
                                .size(36.dp)
                                .testTag("next_week_button")
                        ) {
                            Icon(
                                Icons.Default.ChevronRight,
                                contentDescription = "Następny tydzień",
                                tint = if (selectedWeekIdx < weekChunks.size - 1) FitnessGreen else FitnessTextTertiary
                            )
                        }
                    }
                }

                // 2. Horizontal 7-Day Bar (Pon - Niedz)
                item {
                    WeekDaysBar(
                        entries = currentWeekEntries,
                        selectedDayIso = activeSelectedDay?.dateIso,
                        onSelectDay = { entry -> selectedDayIso = entry.dateIso }
                    )
                }

                // 3. Selected Day Details Card (Directly underneath)
                item {
                    if (activeSelectedDay != null) {
                        SelectedDayDetailsView(
                            entry = activeSelectedDay,
                            templates = templates,
                            onStartWorkout = { templateId ->
                                viewModel.startWorkoutFromToday(templateId)
                                onNavigateToWorkout()
                            },
                            onAssignWorkout = {
                                showAssignModalForDay = activeSelectedDay
                            },
                            onChangeToRestDay = {
                                if (activeSelectedDay.dayType != DayPlanType.NO_PLAN) {
                                    pendingActionOnDay = activeSelectedDay to {
                                        viewModel.updateDayDetails(
                                            dateIso = activeSelectedDay.dateIso,
                                            dayType = DayPlanType.REST_DAY,
                                            workoutTemplateId = null,
                                            workoutName = null,
                                            status = activeSelectedDay.status,
                                            notes = activeSelectedDay.notes
                                        )
                                    }
                                } else {
                                    viewModel.updateDayDetails(
                                        dateIso = activeSelectedDay.dateIso,
                                        dayType = DayPlanType.REST_DAY,
                                        workoutTemplateId = null,
                                        workoutName = null,
                                        status = activeSelectedDay.status,
                                        notes = activeSelectedDay.notes
                                    )
                                }
                            },
                            onChangeToNoPlan = {
                                if (activeSelectedDay.dayType != DayPlanType.NO_PLAN) {
                                    pendingActionOnDay = activeSelectedDay to {
                                        viewModel.updateDayDetails(
                                            dateIso = activeSelectedDay.dateIso,
                                            dayType = DayPlanType.NO_PLAN,
                                            workoutTemplateId = null,
                                            workoutName = null,
                                            status = activeSelectedDay.status,
                                            notes = activeSelectedDay.notes
                                        )
                                    }
                                } else {
                                    viewModel.updateDayDetails(
                                        dateIso = activeSelectedDay.dateIso,
                                        dayType = DayPlanType.NO_PLAN,
                                        workoutTemplateId = null,
                                        workoutName = null,
                                        status = activeSelectedDay.status,
                                        notes = activeSelectedDay.notes
                                    )
                                }
                            },
                            onQuickStatusChange = { newStatus ->
                                if (newStatus == CompletionStatus.WYKONANY && !activeSelectedDay.hasActualSession) {
                                    showWarningWithoutSessionDialog = activeSelectedDay
                                } else {
                                    viewModel.updateDayStatus(activeSelectedDay.dateIso, newStatus)
                                }
                            }
                        )
                    }
                }

                item {
                    Spacer(Modifier.height(30.dp))
                }
            }
        } else {
            // Month View
            MonthPlanGrid(
                entries = scheduleEntries,
                onDayClick = { entry ->
                    val weekIdx = weekChunks.indexOfFirst { week -> week.any { it.dateIso == entry.dateIso } }
                    if (weekIdx >= 0) selectedWeekIdx = weekIdx
                    selectedDayIso = entry.dateIso
                    viewMode = PlansViewMode.WEEK
                }
            )
        }
    }

    // --- ASSIGN WORKOUT MODAL ---
    showAssignModalForDay?.let { day ->
        AssignWorkoutModal(
            entry = day,
            templates = templates,
            onDismiss = { showAssignModalForDay = null },
            onSelectTemplate = { template ->
                showAssignModalForDay = null
                val assignAction = {
                    viewModel.updateDayDetails(
                        dateIso = day.dateIso,
                        dayType = DayPlanType.ASSIGNED_WORKOUT,
                        workoutTemplateId = template.id,
                        workoutName = template.name,
                        status = day.status,
                        notes = day.notes
                    )
                }
                if (day.dayType != DayPlanType.NO_PLAN) {
                    pendingActionOnDay = day to assignAction
                } else {
                    assignAction()
                }
            }
        )
    }

    // --- CONFIRM OVERWRITE DIALOG ---
    pendingActionOnDay?.let { (day, action) ->
        AlertDialog(
            onDismissRequest = { pendingActionOnDay = null },
            icon = { Icon(Icons.Default.WarningAmber, contentDescription = null, tint = FitnessAmber) },
            title = { Text("Zastąpienie planu dla dnia ${day.dateIso}") },
            text = {
                Text(
                    text = "Dla tego dnia był już przypisany: ${
                        when (day.dayType) {
                            DayPlanType.ASSIGNED_WORKOUT -> day.workoutName ?: "Trening"
                            DayPlanType.REST_DAY -> "Dzień wolny"
                            DayPlanType.NO_PLAN -> "Brak planu"
                        }
                    }. Czy na pewno chcesz zastąpić ten wpis nowym planem? Dotychczasowa historia i wykonane sesje nie zostaną zmienione.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FitnessTextSecondary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        action()
                        pendingActionOnDay = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
                ) {
                    Text("Tak, zastąp plan")
                }
            },
            dismissButton = {
                TextButton(onClick = { pendingActionOnDay = null }) {
                    Text("Anuluj")
                }
            }
        )
    }

    // --- COPY WEEK DIALOG ---
    if (showCopyWeekDialog) {
        CopyWeekModal(
            onDismiss = { showCopyWeekDialog = false },
            onConfirm = { sourceWeek, targetWeek, selectedDays ->
                viewModel.copyWeek(sourceWeek * 7, targetWeek * 7, selectedDays)
                showCopyWeekDialog = false
            }
        )
    }

    // --- END CYCLE DIALOG ---
    if (showEndCycleDialog) {
        EndCycleModal(
            activeDraft = viewModel.activeDraft.collectAsState().value,
            onDismiss = { showEndCycleDialog = false },
            onResumeSession = {
                showEndCycleDialog = false
                viewModel.resumeInterruptedSession()
                onNavigateToWorkout()
            },
            onArchiveAndEnd = {
                viewModel.endCurrentCycle(archiveUnfinished = true)
                showEndCycleDialog = false
            }
        )
    }

    // --- WARNING DIALOG: WYKONANY BEZ SESJI ---
    showWarningWithoutSessionDialog?.let { entry ->
        AlertDialog(
            onDismissRequest = { showWarningWithoutSessionDialog = null },
            icon = { Icon(Icons.Default.Info, contentDescription = null, tint = FitnessAmber) },
            title = { Text("Oznaczenie bez powiązanej sesji") },
            text = {
                Text(
                    text = "Oznaczasz dzień ${entry.dateIso} jako 'Wykonany' bez zarejestrowanej sesji treningowej. " +
                            "Do bazy statystyk nie zostaną dodane żadne fikcyjne serie ani objętość.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FitnessTextSecondary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.updateDayStatus(entry.dateIso, CompletionStatus.WYKONANY, showWarningIfNotActualSession = false)
                        showWarningWithoutSessionDialog = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
                ) {
                    Text("Potwierdź status")
                }
            },
            dismissButton = {
                TextButton(onClick = { showWarningWithoutSessionDialog = null }) {
                    Text("Anuluj")
                }
            }
        )
    }
}

// -------------------------------------------------------------
// --- 7-DAY HORIZONTAL BAR ---
// -------------------------------------------------------------

private val SHORT_DAY_NAMES = listOf("Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz")

@Composable
private fun WeekDaysBar(
    entries: List<DayScheduleEntry>,
    selectedDayIso: String?,
    onSelectDay: (DayScheduleEntry) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("week_days_bar"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = FitnessSurface),
        border = BorderStroke(1.dp, FitnessBorder)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            entries.forEachIndexed { index, entry ->
                val isSelected = entry.dateIso == selectedDayIso
                val shortDayLabel = SHORT_DAY_NAMES.getOrNull(index) ?: entry.dayOfWeekName.take(3)
                val shortDate = entry.dateIso.takeLast(5).replace("-", ".") // "21.09"

                val workoutTitleShort = when (entry.dayType) {
                    DayPlanType.REST_DAY -> "Wolne"
                    DayPlanType.NO_PLAN -> "Brak planu"
                    DayPlanType.ASSIGNED_WORKOUT -> {
                        val name = entry.workoutName ?: "Trening"
                        // Skracamy do 8-10 znaków dla kompaktowości paska
                        if (name.length > 10) name.take(9) + "…" else name
                    }
                }

                // Wizualne rozróżnienie stanów:
                val (borderColor, containerBg, titleColor) = when {
                    isSelected -> Triple(FitnessGreen, FitnessGreen.copy(alpha = 0.18f), FitnessGreen)
                    entry.dayType == DayPlanType.ASSIGNED_WORKOUT -> Triple(FitnessBorder, FitnessSurfaceVariant, FitnessTextPrimary)
                    entry.dayType == DayPlanType.REST_DAY -> Triple(FitnessCyan.copy(alpha = 0.4f), FitnessCyan.copy(alpha = 0.08f), FitnessCyan)
                    else -> Triple(FitnessBorder.copy(alpha = 0.5f), FitnessBackground, FitnessTextTertiary)
                }

                Surface(
                    modifier = Modifier
                        .widthIn(min = 54.dp)
                        .height(84.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { onSelectDay(entry) }
                        .testTag("week_day_chip_${entry.dateIso}"),
                    shape = RoundedCornerShape(12.dp),
                    color = containerBg,
                    border = BorderStroke(if (isSelected) 2.dp else 1.dp, borderColor)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(vertical = 6.dp, horizontal = 4.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        // Dzień tygodnia (Pon, Wt, etc.)
                        Text(
                            text = shortDayLabel,
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.SemiBold
                            ),
                            color = if (isSelected) FitnessGreen else FitnessTextPrimary,
                            textAlign = TextAlign.Center
                        )

                        // Data (np. 21.09)
                        Text(
                            text = shortDate,
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                            color = FitnessTextSecondary,
                            textAlign = TextAlign.Center
                        )

                        // Skrót treningu / Wolne / Brak planu
                        Text(
                            text = workoutTitleShort,
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 9.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            ),
                            color = titleColor,
                            textAlign = TextAlign.Center,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// --- SELECTED DAY DETAILS VIEW ---
// -------------------------------------------------------------

@Composable
private fun SelectedDayDetailsView(
    entry: DayScheduleEntry,
    templates: List<WorkoutTemplate>,
    onStartWorkout: (String) -> Unit,
    onAssignWorkout: () -> Unit,
    onChangeToRestDay: () -> Unit,
    onChangeToNoPlan: () -> Unit,
    onQuickStatusChange: (CompletionStatus) -> Unit
) {
    val assignedTemplate = remember(entry.workoutTemplateId, templates) {
        templates.find { it.id == entry.workoutTemplateId }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("selected_day_details_card"),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = FitnessSurface),
        border = BorderStroke(1.dp, FitnessBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header: Pełna data i nazwa dnia + Status realizacji
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "${entry.dayOfWeekName}, ${entry.dateIso}",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = FitnessTextPrimary
                    )
                    Text(
                        text = when (entry.dayType) {
                            DayPlanType.ASSIGNED_WORKOUT -> "Dzień treningowy"
                            DayPlanType.REST_DAY -> "Dzień regeneracji"
                            DayPlanType.NO_PLAN -> "Brak przypisanego planu"
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = when (entry.dayType) {
                            DayPlanType.ASSIGNED_WORKOUT -> FitnessGreen
                            DayPlanType.REST_DAY -> FitnessCyan
                            DayPlanType.NO_PLAN -> FitnessTextTertiary
                        }
                    )
                }

                // Szybki wybór statusu realizacji
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    StatusChip(
                        text = "Wyk.",
                        isSelected = entry.status == CompletionStatus.WYKONANY,
                        color = FitnessGreen,
                        onClick = { onQuickStatusChange(CompletionStatus.WYKONANY) }
                    )
                    StatusChip(
                        text = "Niew.",
                        isSelected = entry.status == CompletionStatus.NIEWYKONANY,
                        color = FitnessRed,
                        onClick = { onQuickStatusChange(CompletionStatus.NIEWYKONANY) }
                    )
                    StatusChip(
                        text = "Nier.",
                        isSelected = entry.status == CompletionStatus.NIEROZSTRZYGNIETY,
                        color = FitnessAmber,
                        onClick = { onQuickStatusChange(CompletionStatus.NIEROZSTRZYGNIETY) }
                    )
                }
            }

            HorizontalDivider(color = FitnessBorder)

            // Content according to DayPlanType
            when (entry.dayType) {
                DayPlanType.ASSIGNED_WORKOUT -> {
                    // Full Workout Title
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = entry.workoutName ?: assignedTemplate?.name ?: "Trening",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
                                color = FitnessTextPrimary
                            )
                            assignedTemplate?.description?.let { desc ->
                                if (desc.isNotEmpty()) {
                                    Text(
                                        text = desc,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = FitnessTextSecondary
                                    )
                                }
                            }
                        }
                    }

                    // Główna akcja: Rozpocznij trening
                    Button(
                        onClick = {
                            val tplId = entry.workoutTemplateId ?: assignedTemplate?.id ?: templates.firstOrNull()?.id ?: ""
                            onStartWorkout(tplId)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("start_workout_from_day_button"),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = FitnessGreen,
                            contentColor = FitnessBackground
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Rozpocznij trening", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }

                    // Planned Exercises List
                    val exercises = assignedTemplate?.exercises ?: emptyList()
                    if (exercises.isNotEmpty()) {
                        Text(
                            text = "Zaplanowane ćwiczenia (${exercises.size}):",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = FitnessTextSecondary
                        )

                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            exercises.forEachIndexed { idx, ex ->
                                Surface(
                                    color = FitnessSurfaceVariant,
                                    shape = RoundedCornerShape(10.dp),
                                    border = BorderStroke(1.dp, FitnessBorder),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(10.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = "${idx + 1}. ${ex.exerciseName}",
                                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                                color = FitnessTextPrimary
                                            )
                                            Text(
                                                text = ex.category.displayName,
                                                style = MaterialTheme.typography.labelSmall,
                                                color = FitnessCyan
                                            )
                                        }

                                        Surface(
                                            color = FitnessBackground,
                                            shape = RoundedCornerShape(6.dp),
                                            border = BorderStroke(1.dp, FitnessBorder)
                                        ) {
                                            Text(
                                                text = "${ex.sets.size} serie",
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                                color = FitnessTextPrimary
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Day Planning Actions
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = onAssignWorkout,
                            modifier = Modifier.weight(1f).height(38.dp),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, FitnessBorder)
                        ) {
                            Text("Zmień trening", fontSize = 11.sp, color = FitnessTextPrimary)
                        }

                        OutlinedButton(
                            onClick = onChangeToRestDay,
                            modifier = Modifier.weight(1f).height(38.dp),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, FitnessCyan.copy(alpha = 0.5f))
                        ) {
                            Text("Ustaw wolne", fontSize = 11.sp, color = FitnessCyan)
                        }

                        OutlinedButton(
                            onClick = onChangeToNoPlan,
                            modifier = Modifier.weight(1f).height(38.dp),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, FitnessBorder)
                        ) {
                            Text("Usuń plan", fontSize = 11.sp, color = FitnessTextTertiary)
                        }
                    }
                }

                DayPlanType.REST_DAY -> {
                    // Empty / Rest State
                    Surface(
                        color = FitnessCyan.copy(alpha = 0.08f),
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, FitnessCyan.copy(alpha = 0.3f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Icon(Icons.Default.Bedtime, contentDescription = null, tint = FitnessCyan, modifier = Modifier.size(20.dp))
                                Text(
                                    text = "Dzień regeneracji (Wolne)",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = FitnessCyan
                                )
                            }
                            Text(
                                text = "W tym dniu zaplanowano odpoczynek i regenerację mięśniową.",
                                style = MaterialTheme.typography.bodySmall,
                                color = FitnessTextSecondary
                            )
                        }
                    }

                    // Available Actions
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = onAssignWorkout,
                            modifier = Modifier.weight(1f).height(42.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = FitnessGreenContainer())
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp), tint = FitnessGreen)
                            Spacer(Modifier.width(6.dp))
                            Text("Przypisz trening", fontSize = 12.sp, color = FitnessGreen, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = onChangeToNoPlan,
                            modifier = Modifier.weight(1f).height(42.dp),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, FitnessBorder)
                        ) {
                            Text("Brak planu", fontSize = 12.sp, color = FitnessTextSecondary)
                        }
                    }
                }

                DayPlanType.NO_PLAN -> {
                    // Empty / No Plan State
                    Surface(
                        color = FitnessSurfaceVariant,
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, FitnessBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Icon(Icons.Default.EventBusy, contentDescription = null, tint = FitnessTextTertiary, modifier = Modifier.size(20.dp))
                                Text(
                                    text = "Brak planu na ten dzień",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = FitnessTextPrimary
                                )
                            }
                            Text(
                                text = "Ten dzień nie ma jeszcze przypisanego treningu ani zaplanowanego odpoczynku.",
                                style = MaterialTheme.typography.bodySmall,
                                color = FitnessTextSecondary
                            )
                        }
                    }

                    // Available Actions
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = onAssignWorkout,
                            modifier = Modifier.weight(1f).height(42.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = FitnessGreenContainer())
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp), tint = FitnessGreen)
                            Spacer(Modifier.width(6.dp))
                            Text("Przypisz trening", fontSize = 12.sp, color = FitnessGreen, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = onChangeToRestDay,
                            modifier = Modifier.weight(1f).height(42.dp),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, FitnessCyan.copy(alpha = 0.5f))
                        ) {
                            Icon(Icons.Default.Bedtime, contentDescription = null, modifier = Modifier.size(16.dp), tint = FitnessCyan)
                            Spacer(Modifier.width(6.dp))
                            Text("Ustaw wolne", fontSize = 12.sp, color = FitnessCyan)
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// --- ASSIGN WORKOUT MODAL ---
// -------------------------------------------------------------

@Composable
private fun AssignWorkoutModal(
    entry: DayScheduleEntry,
    templates: List<WorkoutTemplate>,
    onDismiss: () -> Unit,
    onSelectTemplate: (WorkoutTemplate) -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Przypisz trening (${entry.dayOfWeekName}, ${entry.dateIso})")
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Wybierz szablon treningowy do zaplanowania na ten dzień:",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitnessTextSecondary
                )

                templates.forEach { tpl ->
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onSelectTemplate(tpl) }
                            .testTag("assign_template_${tpl.id}"),
                        shape = RoundedCornerShape(12.dp),
                        color = FitnessSurfaceVariant,
                        border = BorderStroke(1.dp, FitnessBorder)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = tpl.name,
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = FitnessTextPrimary
                            )
                            if (tpl.description.isNotEmpty()) {
                                Text(
                                    text = tpl.description,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = FitnessTextSecondary
                                )
                            }
                            Spacer(Modifier.height(4.dp))
                            Text(
                                text = "${tpl.exercises.size} ćwiczeń w zestawie",
                                style = MaterialTheme.typography.labelSmall,
                                color = FitnessGreen
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Anuluj")
            }
        }
    )
}

// -------------------------------------------------------------
// --- STATUS CHIP ---
// -------------------------------------------------------------

@Composable
private fun StatusChip(
    text: String,
    isSelected: Boolean,
    color: Color,
    onClick: () -> Unit
) {
    Surface(
        color = if (isSelected) color.copy(alpha = 0.2f) else Color.Transparent,
        border = BorderStroke(1.dp, if (isSelected) color else FitnessBorder),
        shape = RoundedCornerShape(6.dp),
        modifier = Modifier.clickable { onClick() }
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                color = if (isSelected) color else FitnessTextTertiary
            )
        )
    }
}

// -------------------------------------------------------------
// --- MONTH PLAN GRID ---
// -------------------------------------------------------------

@Composable
private fun MonthPlanGrid(
    entries: List<DayScheduleEntry>,
    onDayClick: (DayScheduleEntry) -> Unit
) {
    val currentDate = remember { Date() }
    val todayIso = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(currentDate) }
    val currentMonthHeader = remember {
        val sdf = SimpleDateFormat("LLLL yyyy", Locale("pl", "PL"))
        sdf.format(currentDate).replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale("pl", "PL")) else it.toString() }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .testTag("plans_month_grid"),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = "Widok miesięczny • $currentMonthHeader",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = FitnessTextPrimary
        )
        Text(
            text = "Dotknij dowolny dzień, aby przejść do jego szczegółów i edycji w widoku tygodnia.",
            style = MaterialTheme.typography.bodySmall,
            color = FitnessTextSecondary
        )

        Spacer(Modifier.height(4.dp))

        // Days of week header
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround) {
            listOf("Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd").forEach { day ->
                Text(
                    text = day,
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = FitnessTextTertiary
                )
            }
        }

        // Grid cells
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            val chunked = entries.chunked(7)
            itemsIndexed(chunked) { weekIdx, weekEntries ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    weekEntries.forEach { entry ->
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .height(68.dp)
                                .clickable { onDayClick(entry) },
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (entry.dateIso == todayIso) FitnessGreen.copy(alpha = 0.12f) else FitnessSurface
                            ),
                            border = BorderStroke(
                                1.dp,
                                if (entry.dateIso == todayIso) FitnessGreen else FitnessBorder
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(4.dp),
                                verticalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = entry.dateIso.takeLast(2),
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = FitnessTextPrimary
                                )
                                Text(
                                    text = when (entry.dayType) {
                                        DayPlanType.REST_DAY -> "Wolne"
                                        DayPlanType.NO_PLAN -> "Brak"
                                        else -> entry.workoutName?.take(7) ?: "Trening"
                                    },
                                    style = MaterialTheme.typography.labelSmall,
                                    color = when (entry.status) {
                                        CompletionStatus.WYKONANY -> FitnessGreen
                                        CompletionStatus.NIEWYKONANY -> FitnessRed
                                        else -> FitnessTextSecondary
                                    },
                                    maxLines = 1
                                )
                            }
                        }
                    }
                    // Fill remaining empty cells if week is not full
                    repeat(7 - weekEntries.size) {
                        Spacer(Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// --- COPY WEEK & END CYCLE MODALS ---
// -------------------------------------------------------------

@Composable
private fun CopyWeekModal(
    onDismiss: () -> Unit,
    onConfirm: (sourceWeek: Int, targetWeek: Int, selectedDays: List<Int>) -> Unit
) {
    var selectedTargetWeek by remember { mutableIntStateOf(1) }
    val dayIndices = remember { mutableStateListOf(0, 1, 2, 3, 4, 5, 6) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Kopiuj harmonogram tygodnia") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = "Kopiowanie dotyczy wybranego tygodnia i może zostać przeniesione do przyszłego tygodnia.",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitnessTextSecondary
                )

                Text(
                    text = "Docelowy tydzień: Przyszły tydzień",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                    color = FitnessCyan
                )

                Text(
                    text = "Dni do skopiowania:",
                    style = MaterialTheme.typography.labelMedium,
                    color = FitnessTextSecondary
                )

                val dayNames = listOf("Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz")
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    dayNames.forEachIndexed { index, name ->
                        val isChecked = dayIndices.contains(index)
                        FilterChip(
                            selected = isChecked,
                            onClick = {
                                if (isChecked) dayIndices.remove(index) else dayIndices.add(index)
                            },
                            label = { Text(name, fontSize = 10.sp) }
                        )
                    }
                }

                Card(
                    colors = CardDefaults.cardColors(containerColor = FitnessSurfaceVariant),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(
                        text = "Potwierdzenie: Istniejące przyszłe wpisy w wybranych dniach zostaną zastąpione. Dane historyczne, zakończone sesje ani wykonane serie nie zostaną naruszone.",
                        modifier = Modifier.padding(10.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = FitnessAmber
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(0, selectedTargetWeek, dayIndices.toList()) },
                colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
            ) {
                Text("Zastąp i skopiuj")
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
private fun EndCycleModal(
    activeDraft: ActiveSessionDraft?,
    onDismiss: () -> Unit,
    onResumeSession: () -> Unit,
    onArchiveAndEnd: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Zakończenie cyklu") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = "Przed zakończeniem cyklu sprawdź stan trwających sesji treningowych.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FitnessTextSecondary
                )

                if (activeDraft != null) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = FitnessSurfaceVariant),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                text = "Niedokończona sesja: ${activeDraft.workoutName}",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                color = FitnessAmber
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = onResumeSession,
                                    colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
                                ) {
                                    Text("Wznów sesję", fontSize = 12.sp)
                                }
                            }
                        }
                    }
                } else {
                    Text(
                        text = "Brak niedokończonych sesji roboczych.",
                        style = MaterialTheme.typography.bodySmall,
                        color = FitnessGreen
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onArchiveAndEnd,
                colors = ButtonDefaults.buttonColors(containerColor = FitnessAmber, contentColor = FitnessBackground)
            ) {
                Text("Zarchiwizuj i zakończ cykl")
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
private fun FitnessGreenContainer(): Color = FitnessGreen.copy(alpha = 0.2f)
