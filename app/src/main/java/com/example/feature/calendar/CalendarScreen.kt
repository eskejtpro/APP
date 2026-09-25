package com.example.feature.calendar

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.domain.model.*
import com.example.ui.theme.*
import com.example.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

@Composable
fun CalendarScreen(
    viewModel: MainViewModel
) {
    val substanceEntries by viewModel.substanceEntries.collectAsState()
    val noteEntries by viewModel.noteEntries.collectAsState()
    val activeCycle by viewModel.activeCycle.collectAsState()
    val substanceLibrary = viewModel.substanceLibrary

    val currentDate = remember { Date() }
    val todayIso = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(currentDate) }
    var selectedDateIso by remember { mutableStateOf(todayIso) }
    var showAddEntryDialog by remember { mutableStateOf(false) }
    var showSimulatorDialog by remember { mutableStateOf(false) }

    val currentMonthHeader = remember {
        val sdf = SimpleDateFormat("LLLL yyyy", Locale("pl", "PL"))
        sdf.format(currentDate).replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale("pl", "PL")) else it.toString() }
    }

    val daysInWindow = remember {
        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, -3)
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        (0..7).map {
            val d = sdf.format(cal.time)
            cal.add(Calendar.DAY_OF_YEAR, 1)
            d
        }
    }

    // Entries for selected date
    val daySubstances = substanceEntries.filter { it.dateIso == selectedDateIso }
    val dayNotes = noteEntries.filter { it.dateIso == selectedDateIso }
    val dayWorkout = activeCycle?.scheduleEntries?.find { it.dateIso == selectedDateIso }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitnessBackground)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // --- HEADER ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Kalendarz Wpisów",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = FitnessTextPrimary
                )
                Text(
                    text = "Treningi • Substancje • Notatki",
                    style = MaterialTheme.typography.labelSmall,
                    color = FitnessGreen
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                // Button to open educational simulator
                OutlinedButton(
                    onClick = { showSimulatorDialog = true },
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, FitnessBorder),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    modifier = Modifier.testTag("open_simulator_button")
                ) {
                    Icon(Icons.Default.Science, contentDescription = null, tint = FitnessPurple, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Symulator", fontSize = 12.sp, color = FitnessTextPrimary)
                }

                Button(
                    onClick = { showAddEntryDialog = true },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                    modifier = Modifier.testTag("add_calendar_entry_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Dodaj", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(Modifier.height(8.dp))

        // --- MANDATORY DISCLAIMER BANNER ---
        Surface(
            color = FitnessSurfaceVariant,
            shape = RoundedCornerShape(10.dp),
            border = BorderStroke(1.dp, FitnessBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.Security, contentDescription = null, tint = FitnessAmber, modifier = Modifier.size(18.dp))
                Text(
                    text = "Aplikacja wyłącznie rejestruje wpisy. Nie podaje dawek, schematów stosowania ani zaleceń medycznych.",
                    style = MaterialTheme.typography.labelSmall,
                    color = FitnessTextSecondary
                )
            }
        }

        Spacer(Modifier.height(12.dp))

        // --- MONTH CALENDAR ROW / GRID SELECTOR ---
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = FitnessSurface),
            border = BorderStroke(1.dp, FitnessBorder)
        ) {
            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = currentMonthHeader,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = FitnessTextPrimary
                )

                // Days selector
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    daysInWindow.forEach { dateStr ->
                        val dayNum = dateStr.takeLast(2)
                        val isSelected = dateStr == selectedDateIso
                        val hasSubstance = substanceEntries.any { it.dateIso == dateStr }
                        val hasWorkout = activeCycle?.scheduleEntries?.any { it.dateIso == dateStr && it.dayType == DayPlanType.ASSIGNED_WORKOUT } == true

                        Surface(
                            color = if (isSelected) FitnessGreen else FitnessSurfaceVariant,
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, if (isSelected) FitnessGreen else FitnessBorder),
                            modifier = Modifier
                                .width(38.dp)
                                .height(52.dp)
                                .clickable { selectedDateIso = dateStr }
                        ) {
                            Column(
                                modifier = Modifier.fillMaxSize().padding(4.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = dayNum,
                                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                    color = if (isSelected) FitnessBackground else FitnessTextPrimary
                                )
                                // Event dots
                                Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                    if (hasWorkout) {
                                        Surface(
                                            color = if (isSelected) FitnessBackground else FitnessGreen,
                                            shape = RoundedCornerShape(2.dp),
                                            modifier = Modifier.size(4.dp)
                                        ) {}
                                    }
                                    if (hasSubstance) {
                                        Surface(
                                            color = if (isSelected) FitnessBackground else FitnessPurple,
                                            shape = RoundedCornerShape(2.dp),
                                            modifier = Modifier.size(4.dp)
                                        ) {}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(14.dp))

        // --- SELECTED DAY DETAILS ---
        Text(
            text = "Wpisy dla dnia: $selectedDateIso",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = FitnessTextPrimary
        )

        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .testTag("calendar_day_entries_list"),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // 1. Workout entry for this day
            if (dayWorkout != null) {
                item {
                    CalendarEventCard(
                        typeLabel = "Trening",
                        typeColor = FitnessGreen,
                        icon = Icons.Default.FitnessCenter,
                        title = when (dayWorkout.dayType) {
                            DayPlanType.REST_DAY -> "Dzień wolny (Regeneracja)"
                            DayPlanType.NO_PLAN -> "Brak planu"
                            DayPlanType.ASSIGNED_WORKOUT -> dayWorkout.workoutName ?: "Trening"
                        },
                        details = "Status realizacji: ${dayWorkout.status.displayName}",
                        timeStr = "Plan",
                        onDelete = null
                    )
                }
            }

            // 2. Substance entries for this day
            items(daySubstances) { sub ->
                CalendarEventCard(
                    typeLabel = "Wpis substancji",
                    typeColor = FitnessPurple,
                    icon = Icons.Default.Medication,
                    title = sub.substanceName,
                    details = "${sub.manualInfo} • (Wpis do późniejszej weryfikacji)",
                    timeStr = sub.timeStr,
                    onDelete = { viewModel.deleteSubstanceEntry(sub.id) }
                )
            }

            // 3. Notes for this day
            items(dayNotes) { note ->
                CalendarEventCard(
                    typeLabel = "Notatka",
                    typeColor = FitnessAmber,
                    icon = Icons.Default.StickyNote2,
                    title = note.title,
                    details = note.content,
                    timeStr = note.timeStr,
                    onDelete = { viewModel.deleteNoteEntry(note.id) }
                )
            }

            if (dayWorkout == null && daySubstances.isEmpty() && dayNotes.isEmpty()) {
                item {
                    Text(
                        text = "Brak wpisów dla wybranego dnia.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitnessTextTertiary,
                        modifier = Modifier.padding(vertical = 20.dp)
                    )
                }
            }

            item {
                Spacer(Modifier.height(30.dp))
            }
        }
    }

    // --- ADD ENTRY DIALOG ---
    if (showAddEntryDialog) {
        AddCalendarEntryModal(
            selectedDateIso = selectedDateIso,
            substanceLibrary = substanceLibrary,
            onDismiss = { showAddEntryDialog = false },
            onAddSubstance = { date, time, name, info ->
                viewModel.addSubstanceEntry(date, time, name, info)
                showAddEntryDialog = false
            },
            onAddNote = { date, time, title, content ->
                viewModel.addNoteEntry(date, time, title, content)
                showAddEntryDialog = false
            }
        )
    }

    // --- EDUCATIONAL SIMULATOR DIALOG ---
    if (showSimulatorDialog) {
        EducationalSimulatorModal(onDismiss = { showSimulatorDialog = false })
    }
}

@Composable
private fun CalendarEventCard(
    typeLabel: String,
    typeColor: Color,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    details: String,
    timeStr: String,
    onDelete: (() -> Unit)?
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = FitnessSurface),
        border = BorderStroke(1.dp, FitnessBorder)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Surface(
                    color = typeColor.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = typeColor,
                        modifier = Modifier.padding(8.dp).size(20.dp)
                    )
                }

                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Surface(
                            color = FitnessSurfaceVariant,
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = typeLabel,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = typeColor
                            )
                        }
                        Text(
                            text = timeStr,
                            style = MaterialTheme.typography.labelSmall,
                            color = FitnessTextTertiary
                        )
                    }

                    Text(
                        text = title,
                        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                        color = FitnessTextPrimary
                    )

                    Text(
                        text = details,
                        style = MaterialTheme.typography.bodySmall,
                        color = FitnessTextSecondary,
                        maxLines = 2
                    )
                }
            }

            if (onDelete != null) {
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.DeleteOutline, contentDescription = "Usuń", tint = FitnessTextTertiary)
                }
            }
        }
    }
}

@Composable
private fun AddCalendarEntryModal(
    selectedDateIso: String,
    substanceLibrary: List<SubstanceLibraryItem>,
    onDismiss: () -> Unit,
    onAddSubstance: (date: String, time: String, name: String, info: String) -> Unit,
    onAddNote: (date: String, time: String, title: String, content: String) -> Unit
) {
    var entryType by remember { mutableStateOf(CalendarEntryType.SUBSTANCE) }

    // Substance form fields
    var selectedSubstanceName by remember { mutableStateOf(substanceLibrary.first().name) }
    var customSubstanceName by remember { mutableStateOf("") }
    var substanceInfo by remember { mutableStateOf("") }
    var entryTime by remember { mutableStateOf("08:00") }

    // Note form fields
    var noteTitle by remember { mutableStateOf("") }
    var noteContent by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Dodaj wpis do kalendarza") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Type selector
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(
                        selected = entryType == CalendarEntryType.SUBSTANCE,
                        onClick = { entryType = CalendarEntryType.SUBSTANCE },
                        label = { Text("Wpis substancji") },
                        modifier = Modifier.weight(1f)
                    )
                    FilterChip(
                        selected = entryType == CalendarEntryType.NOTE,
                        onClick = { entryType = CalendarEntryType.NOTE },
                        label = { Text("Notatka") },
                        modifier = Modifier.weight(1f)
                    )
                }

                if (entryType == CalendarEntryType.SUBSTANCE) {
                    Text(
                        text = "Wybierz substancję z biblioteki:",
                        style = MaterialTheme.typography.labelSmall,
                        color = FitnessTextSecondary
                    )

                    // Autocomplete / Selector from library
                    substanceLibrary.take(5).forEach { item ->
                        Surface(
                            color = if (selectedSubstanceName == item.name) FitnessSurfaceVariant else FitnessSurface,
                            border = BorderStroke(1.dp, if (selectedSubstanceName == item.name) FitnessPurple else FitnessBorder),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { selectedSubstanceName = item.name }
                        ) {
                            Row(modifier = Modifier.padding(8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(item.name, style = MaterialTheme.typography.bodySmall, color = FitnessTextPrimary)
                                Text(item.category, style = MaterialTheme.typography.labelSmall, color = FitnessTextTertiary)
                            }
                        }
                    }

                    OutlinedTextField(
                        value = substanceInfo,
                        onValueChange = { substanceInfo = it },
                        label = { Text("Ręcznie wprowadzona informacja / notatka") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Text(
                        text = "Wpis ma charakter wyłącznie ewidencyjny i wymaga późniejszej weryfikacji. Aplikacja nie podaje dawek ani zaleceń.",
                        style = MaterialTheme.typography.labelSmall,
                        color = FitnessAmber
                    )
                } else {
                    OutlinedTextField(
                        value = noteTitle,
                        onValueChange = { noteTitle = it },
                        label = { Text("Tytuł notatki") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = noteContent,
                        onValueChange = { noteContent = it },
                        label = { Text("Treść notatki") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (entryType == CalendarEntryType.SUBSTANCE) {
                        onAddSubstance(selectedDateIso, entryTime, selectedSubstanceName, substanceInfo)
                    } else {
                        onAddNote(selectedDateIso, entryTime, noteTitle.ifBlank { "Notatka" }, noteContent)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
            ) {
                Text("Zapisz wpis")
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
private fun EducationalSimulatorModal(
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edukacyjny symulator hipotetycznych danych") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Surface(
                    color = FitnessRed.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, FitnessRed.copy(alpha = 0.5f))
                ) {
                    Text(
                        text = "WAŻNE OSTRZEŻENIE: Niniejszy moduł to symulator edukacyjny służący wyłącznie do celów poglądowo-teoretycznych. " +
                                "Symulator pod żadnym pozorem nie generuje zaleceń medycznych ani dawkowania.",
                        modifier = Modifier.padding(10.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = FitnessTextPrimary
                    )
                }

                Text(
                    text = "Wykres rzeczywistych zdarzeń kalendarza jest ściśle oddzielony od danych symulowanych. Dane w symulatorze to wyłącznie matematyczne modele farmakokinetyki z literatury naukowej.",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitnessTextSecondary
                )

                // Educational placeholder illustration
                Card(
                    colors = CardDefaults.cardColors(containerColor = FitnessSurfaceVariant),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Model teoretyczny: Okres półtrwania (T1/2)", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodySmall)
                        Text("• Enanthate: ~4.5 - 5 dni\n• Cypionate: ~5 - 6 dni\n• Propionate: ~1.5 - 2 dni", style = MaterialTheme.typography.labelSmall, color = FitnessTextSecondary)
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = FitnessPurple, contentColor = FitnessTextPrimary)
            ) {
                Text("Rozumiem i zamykam")
            }
        }
    )
}
