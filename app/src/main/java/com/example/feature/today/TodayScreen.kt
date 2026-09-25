package com.example.feature.today

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.domain.model.*
import com.example.ui.theme.*
import com.example.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun TodayScreen(
    viewModel: MainViewModel,
    onNavigateToWorkout: () -> Unit,
    onNavigateToCalendar: () -> Unit,
    onNavigateToPlans: () -> Unit
) {
    val activeCycle by viewModel.activeCycle.collectAsState()
    val activeDraft by viewModel.activeDraft.collectAsState()
    val substanceEntries by viewModel.substanceEntries.collectAsState()
    val noteEntries by viewModel.noteEntries.collectAsState()

    val currentDate = remember { Date() }
    val todayIso = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(currentDate) }
    val todayHeaderFormatted = remember {
        val sdf = SimpleDateFormat("EEEE, d MMMM yyyy", Locale("pl", "PL"))
        sdf.format(currentDate).replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale("pl", "PL")) else it.toString() }
    }

    val todaySchedule = activeCycle?.scheduleEntries?.find { it.dateIso == todayIso }
        ?: activeCycle?.scheduleEntries?.firstOrNull()
    val lastNote = noteEntries.firstOrNull()

    var showStatusDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitnessBackground)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Date Header
        Column {
            Text(
                text = todayHeaderFormatted,
                style = MaterialTheme.typography.labelLarge,
                color = FitnessTextSecondary,
                letterSpacing = 1.sp
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Dzisiaj",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = FitnessTextPrimary
                    )
                )
                Surface(
                    color = FitnessSurfaceVariant,
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, FitnessBorder)
                ) {
                    Text(
                        text = activeCycle?.name?.take(18) ?: "Brak aktywnego cyklu",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelMedium,
                        color = FitnessGreen
                    )
                }
            }
        }

        // --- PRZERWANA SESJA BANNER ---
        if (activeDraft != null && activeDraft!!.isInterrupted) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("interrupted_session_banner"),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = FitnessSurface),
                border = BorderStroke(1.5.dp, FitnessAmber)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Surface(
                            color = FitnessAmber.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = "Przerwana sesja",
                                tint = FitnessAmber,
                                modifier = Modifier
                                    .padding(8.dp)
                                    .size(24.dp)
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Wykryto przerwaną sesję",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = FitnessTextPrimary
                            )
                            Text(
                                text = "${activeDraft!!.workoutName} • Wersja robocza",
                                style = MaterialTheme.typography.bodySmall,
                                color = FitnessTextSecondary
                            )
                        }
                    }

                    Text(
                        text = "Masz rozpoczęty trening z niezamkniętymi seriami. Możesz go natychmiast wznowić jednym dotknięciem.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitnessTextSecondary
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = {
                                viewModel.resumeInterruptedSession()
                                onNavigateToWorkout()
                            },
                            modifier = Modifier
                                .weight(1.4f)
                                .height(48.dp)
                                .testTag("resume_session_button"),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = FitnessGreen,
                                contentColor = FitnessBackground
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null)
                            Spacer(Modifier.width(6.dp))
                            Text("Wznów sesję", fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = { viewModel.archiveInterruptedSession() },
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp)
                                .testTag("archive_session_button"),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = FitnessTextSecondary),
                            border = BorderStroke(1.dp, FitnessBorder),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Zarchiwizuj", fontSize = 13.sp)
                        }
                    }
                }
            }
        }

        // --- DZISIEJSZY PLANOWANY TRENING ---
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("today_workout_card"),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = FitnessSurface),
            border = BorderStroke(1.dp, FitnessBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.FitnessCenter,
                            contentDescription = null,
                            tint = FitnessGreen,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = "Dzisiejszy plan",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                            color = FitnessTextSecondary
                        )
                    }

                    // Manual Status Badge
                    val statusColor = when (todaySchedule?.status) {
                        CompletionStatus.WYKONANY -> FitnessGreen
                        CompletionStatus.NIEWYKONANY -> FitnessRed
                        else -> FitnessAmber
                    }
                    Surface(
                        color = statusColor.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, statusColor.copy(alpha = 0.4f)),
                        modifier = Modifier.testTag("today_status_badge")
                    ) {
                        Text(
                            text = todaySchedule?.status?.displayName ?: "Nierozstrzygnięty",
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = statusColor
                        )
                    }
                }

                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    val workoutTitle = when (todaySchedule?.dayType) {
                        DayPlanType.REST_DAY -> "Dzień wolny (Regeneracja)"
                        DayPlanType.NO_PLAN -> "Brak zaplanowanego treningu"
                        else -> todaySchedule?.workoutName ?: "Trening z rotacji: Legs A"
                    }
                    Text(
                        text = workoutTitle,
                        style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                        color = FitnessTextPrimary
                    )
                    Text(
                        text = if (todaySchedule?.dayType == DayPlanType.REST_DAY)
                            "Czas na adaptację, sen i regenerację mięśni"
                        else
                            "Główne partie: Nogi • Czas: ~70 min",
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitnessTextSecondary
                    )
                }

                // Action row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = {
                            viewModel.startWorkoutFromToday(todaySchedule?.workoutTemplateId)
                            onNavigateToWorkout()
                        },
                        modifier = Modifier
                            .weight(1.5f)
                            .height(52.dp)
                            .testTag("start_today_workout_button"),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = FitnessGreen,
                            contentColor = FitnessBackground
                        ),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, tint = FitnessBackground)
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text = "Rozpocznij trening",
                            style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold)
                        )
                    }

                    OutlinedButton(
                        onClick = { showStatusDialog = true },
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp)
                            .testTag("change_status_button"),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = FitnessTextPrimary),
                        border = BorderStroke(1.dp, FitnessBorder),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text("Zmień status", fontSize = 13.sp)
                    }
                }
            }
        }

        // --- NAJBLIŻSZE WYDARZENIA KALENDARZA ---
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("upcoming_events_card"),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = FitnessSurface),
            border = BorderStroke(1.dp, FitnessBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.CalendarMonth, contentDescription = null, tint = FitnessCyan)
                        Text(
                            text = "Najbliższe wydarzenia",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                            color = FitnessTextPrimary
                        )
                    }
                    TextButton(onClick = onNavigateToCalendar) {
                        Text("Zobacz całość", color = FitnessCyan, style = MaterialTheme.typography.labelMedium)
                    }
                }

                // Event 1: Today's Substance entry
                val todaySubstance = substanceEntries.find { it.dateIso == todayIso }
                if (todaySubstance != null) {
                    EventItem(
                        icon = Icons.Default.Medication,
                        iconTint = FitnessPurple,
                        title = todaySubstance.substanceName,
                        subtitle = "${todaySubstance.timeStr} • Wpis weryfikacyjny",
                        tag = "Wpis substancji"
                    )
                }

                // Event 2: Tomorrow's workout
                val tomorrowEntry = activeCycle?.scheduleEntries?.find { it.dateIso == "2026-09-25" }
                EventItem(
                    icon = Icons.Default.FitnessCenter,
                    iconTint = FitnessGreen,
                    title = tomorrowEntry?.workoutName ?: "Push B (Wycisk hantli)",
                    subtitle = "Jutro • Zaplanowany",
                    tag = "Trening"
                )

                // Event 3: Rest day on Sunday
                EventItem(
                    icon = Icons.Default.Bedtime,
                    iconTint = FitnessCyan,
                    title = "Dzień wolny od treningu",
                    subtitle = "Niedziela, 27 września",
                    tag = "Regeneracja"
                )
            }
        }

        // --- OSTATNIA NOTATKA ---
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("last_note_card"),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = FitnessSurface),
            border = BorderStroke(1.dp, FitnessBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.StickyNote2, contentDescription = null, tint = FitnessAmber)
                        Text(
                            text = "Ostatnia notatka",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                            color = FitnessTextPrimary
                        )
                    }
                    if (lastNote != null) {
                        Text(
                            text = "${lastNote.dateIso} ${lastNote.timeStr}",
                            style = MaterialTheme.typography.labelSmall,
                            color = FitnessTextTertiary
                        )
                    }
                }

                if (lastNote != null) {
                    Text(
                        text = lastNote.title,
                        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                        color = FitnessTextPrimary
                    )
                    Text(
                        text = lastNote.content,
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitnessTextSecondary,
                        maxLines = 3
                    )
                } else {
                    Text(
                        text = "Brak zapisanych notatek.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitnessTextTertiary
                    )
                }
            }
        }

        Spacer(Modifier.height(30.dp))
    }

    // Manual status change dialog for Today
    if (showStatusDialog) {
        AlertDialog(
            onDismissRequest = { showStatusDialog = false },
            title = { Text("Zmień status realizacji dla dzisiaj") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Status realizacji ustawiasz ręcznie. Zakończenie sesji ani data nie zmieniają statusu automatycznie.",
                        style = MaterialTheme.typography.bodySmall,
                        color = FitnessTextSecondary
                    )
                    CompletionStatus.entries.forEach { status ->
                        OutlinedButton(
                            onClick = {
                                viewModel.updateDayStatus(todayIso, status)
                                showStatusDialog = false
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (todaySchedule?.status == status) FitnessSurfaceVariant else Color.Transparent
                            )
                        ) {
                            Text(status.displayName)
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showStatusDialog = false }) {
                    Text("Zamknij")
                }
            }
        )
    }
}

@Composable
private fun EventItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconTint: Color,
    title: String,
    subtitle: String,
    tag: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(FitnessSurfaceVariant)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Surface(
            color = iconTint.copy(alpha = 0.15f),
            shape = RoundedCornerShape(8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconTint,
                modifier = Modifier
                    .padding(8.dp)
                    .size(20.dp)
            )
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                color = FitnessTextPrimary
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = FitnessTextSecondary
            )
        }
        Surface(
            color = FitnessBackground,
            shape = RoundedCornerShape(6.dp)
        ) {
            Text(
                text = tag,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                style = MaterialTheme.typography.labelSmall,
                color = FitnessTextTertiary
            )
        }
    }
}
