package com.example.feature.library

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.importer.FileReadResult
import com.example.data.importer.GymTrackerJsonParser
import com.example.data.importer.JsonFileReader
import com.example.domain.model.*
import com.example.ui.theme.*
import com.example.viewmodel.MainViewModel

@Composable
fun ExerciseLibraryScreen(
    viewModel: MainViewModel,
    onNavigateBack: () -> Unit
) {
    val exercises by viewModel.exercises.collectAsState()

    var selectedCategoryFilter by remember { mutableStateOf<ExerciseCategory?>(null) }
    var searchQuery by remember { mutableStateOf("") }

    var showAddExerciseDialog by remember { mutableStateOf(false) }
    var showImportDialog by remember { mutableStateOf(false) }
    var editingExercise by remember { mutableStateOf<Exercise?>(null) }

    val filteredExercises = exercises.filter { ex ->
        (selectedCategoryFilter == null || ex.category == selectedCategoryFilter) &&
                (searchQuery.isBlank() || ex.name.contains(searchQuery, ignoreCase = true))
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitnessBackground)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // --- TOP BAR ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Wróć", tint = FitnessTextPrimary)
            }

            Text(
                text = "Biblioteka Ćwiczeń",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = FitnessTextPrimary
            )

            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                // GymTracker Pro Import button
                IconButton(
                    onClick = { showImportDialog = true },
                    modifier = Modifier.testTag("open_import_dialog_button")
                ) {
                    Icon(Icons.Default.FileDownload, contentDescription = "Import GymTracker Pro", tint = FitnessCyan)
                }

                IconButton(
                    onClick = { showAddExerciseDialog = true },
                    modifier = Modifier.testTag("add_exercise_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Dodaj ćwiczenie", tint = FitnessGreen)
                }
            }
        }

        Spacer(Modifier.height(10.dp))

        // Search field
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Szukaj ćwiczenia...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = FitnessTextTertiary) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = FitnessSurface,
                unfocusedContainerColor = FitnessSurface,
                focusedBorderColor = FitnessGreen,
                unfocusedBorderColor = FitnessBorder
            ),
            singleLine = true
        )

        Spacer(Modifier.height(10.dp))

        // 7 Categories Chips Row
        Text(
            text = "Kategorie główne (wyłącznie 7 partii):",
            style = MaterialTheme.typography.labelSmall,
            color = FitnessTextSecondary
        )
        Spacer(Modifier.height(4.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            FilterChip(
                selected = selectedCategoryFilter == null,
                onClick = { selectedCategoryFilter = null },
                label = { Text("Wszystkie (${exercises.size})", fontSize = 11.sp) }
            )
        }
        Spacer(Modifier.height(4.dp))
        // 7 Category chips grid
        ExerciseCategory.entries.chunked(4).forEach { rowCategories ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                rowCategories.forEach { cat ->
                    val count = exercises.count { it.category == cat }
                    FilterChip(
                        selected = selectedCategoryFilter == cat,
                        onClick = {
                            selectedCategoryFilter = if (selectedCategoryFilter == cat) null else cat
                        },
                        label = { Text("${cat.displayName} ($count)", fontSize = 10.sp) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            Spacer(Modifier.height(4.dp))
        }

        Spacer(Modifier.height(10.dp))

        // Exercise List
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(filteredExercises, key = { it.id }) { exercise ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = FitnessSurface),
                    border = BorderStroke(1.dp, FitnessBorder)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = exercise.name,
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                                    color = FitnessTextPrimary
                                )
                                if (exercise.isCustom) {
                                    Spacer(Modifier.width(6.dp))
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(FitnessCyan.copy(alpha = 0.2f))
                                            .padding(horizontal = 4.dp, vertical = 2.dp)
                                    ) {
                                        Text("Własne", style = MaterialTheme.typography.labelSmall, color = FitnessCyan)
                                    }
                                }
                            }
                            Spacer(Modifier.height(4.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = exercise.category.displayName,
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = FitnessGreen
                                )
                                if (exercise.notes.isNotBlank()) {
                                    Text(
                                        text = "• ${exercise.notes}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = FitnessTextTertiary,
                                        maxLines = 1
                                    )
                                }
                            }
                        }

                        Row {
                            IconButton(onClick = { editingExercise = exercise }) {
                                Icon(Icons.Default.Edit, contentDescription = "Edytuj", tint = FitnessTextSecondary)
                            }
                            IconButton(onClick = { viewModel.deleteExercise(exercise.id) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Usuń", tint = FitnessRed.copy(alpha = 0.8f))
                            }
                        }
                    }
                }
            }

            if (filteredExercises.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.FitnessCenter, contentDescription = null, tint = FitnessTextTertiary, modifier = Modifier.size(48.dp))
                            Spacer(Modifier.height(8.dp))
                            Text("Brak ćwiczeń w wybranej kategorii", color = FitnessTextSecondary)
                        }
                    }
                }
            }

            item {
                Spacer(Modifier.height(30.dp))
            }
        }
    }

    // --- ADD EXERCISE MODAL ---
    if (showAddExerciseDialog) {
        ExerciseFormModal(
            title = "Dodaj nowe ćwiczenie",
            initialName = "",
            initialCategory = ExerciseCategory.KLATKA_PIERSIOWA,
            initialNotes = "",
            onDismiss = { showAddExerciseDialog = false },
            onConfirm = { name, cat, notes ->
                viewModel.addCustomExercise(name, cat, notes)
                showAddExerciseDialog = false
            }
        )
    }

    // --- EDIT EXERCISE MODAL ---
    editingExercise?.let { ex ->
        ExerciseFormModal(
            title = "Edycja ćwiczenia",
            initialName = ex.name,
            initialCategory = ex.category,
            initialNotes = ex.notes,
            onDismiss = { editingExercise = null },
            onConfirm = { name, cat, notes ->
                viewModel.updateExercise(ex.copy(name = name, category = cat, notes = notes))
                editingExercise = null
            }
        )
    }

    // --- GYM TRACKER PRO IMPORT MODAL (ETAP 3D: ZATWIERDZANIE I TRANSAKCJA ROOM) ---
    val coroutineScope = rememberCoroutineScope()
    if (showImportDialog) {
        GymTrackerImportPreviewModal(
            existingExercises = exercises,
            onConfirmImport = { candidates, defaultStrategy, onResult ->
                coroutineScope.launch {
                    val result = viewModel.performGymTrackerImport(candidates, defaultStrategy)
                    onResult(result)
                }
            },
            onDismiss = { showImportDialog = false }
        )
    }
}

@Composable
private fun ExerciseFormModal(
    title: String,
    initialName: String,
    initialCategory: ExerciseCategory,
    initialNotes: String,
    onDismiss: () -> Unit,
    onConfirm: (name: String, category: ExerciseCategory, notes: String) -> Unit
) {
    var name by remember { mutableStateOf(initialName) }
    var category by remember { mutableStateOf(initialCategory) }
    var notes by remember { mutableStateOf(initialNotes) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "Każde ćwiczenie ma dokładnie jedną kategorię główną (brak partii pomocniczych). Zmiana kategorii dotyczy biblioteki; rozpoczęte sesje zachowują historyczne przypisanie.",
                    style = MaterialTheme.typography.labelSmall,
                    color = FitnessTextSecondary
                )
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nazwa ćwiczenia") },
                    modifier = Modifier.fillMaxWidth()
                )

                Text("Kategoria główna:", style = MaterialTheme.typography.labelMedium)
                ExerciseCategory.entries.chunked(3).forEach { rowList ->
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        rowList.forEach { cat ->
                            FilterChip(
                                selected = category == cat,
                                onClick = { category = cat },
                                label = { Text(cat.displayName, fontSize = 10.sp) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Wskazówki / notatka") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(name.ifBlank { "Nowe ćwiczenie" }, category, notes) },
                colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
            ) {
                Text("Zapisz")
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
private fun GymTrackerImportPreviewModal(
    existingExercises: List<Exercise>,
    onConfirmImport: (candidates: List<ImportCandidate>, defaultStrategy: MergeStrategy, onResult: (ImportExecutionResult) -> Unit) -> Unit,
    onDismiss: () -> Unit
) {
    val parser = remember { GymTrackerJsonParser() }
    val coroutineScope = rememberCoroutineScope()

    val sampleJson = remember {
        """
        {
          "app": "GymTracker Pro",
          "version": "2.4.1",
          "exercises": [
            {"name": "Wyciskanie hantli na skosie dodatnim", "category": "Chest / Upper", "sets": 3, "notes": "Kąt 30 st"},
            {"name": "Wznosy bokiem na wyciągu", "category": "Shoulders / Delts", "sets": 4, "notes": "Pojedyncza rączka"},
            {"name": "Uginanie ramion chwyt młotkowy", "category": "Arms / Biceps", "sets": 3, "notes": "Hantle stojąc"},
            {"name": "Wyciskanie francuskie ze sztangą łamaną", "category": "Arms / Triceps", "sets": 3, "notes": "Leżąc na ławce"},
            {"name": "Dziwne ćwiczenie z nieznaną partią", "category": "SuperUnknownGroup", "sets": 3, "notes": "Nieznana grupa"}
          ],
          "templates": [
            {"name": "Push A (Importowany)", "description": "Szablon z pliku JSON", "exercises": ["Wyciskanie hantli na skosie dodatnim"]}
          ],
          "plans": [
            {"name": "Cykl Jesień 2026", "type": "ROTATIONAL", "workouts": ["Push A (Importowany)"]}
          ]
        }
        """.trimIndent()
    }

    val context = LocalContext.current
    val fileReader = remember { JsonFileReader(context.contentResolver) }

    var selectedFileName by remember { mutableStateOf<String?>(null) }
    var fileErrorMessage by remember { mutableStateOf<String?>(null) }
    var isReadingFile by remember { mutableStateOf(false) }

    var rawJson by remember { mutableStateOf(sampleJson) }
    var report by remember { mutableStateOf<ImportAnalysisReport?>(null) }
    val candidatesState = remember { mutableStateListOf<ImportCandidate>() }

    var isSummaryStep by remember { mutableStateOf(false) }
    var isImporting by remember { mutableStateOf(false) }
    var executionResult by remember { mutableStateOf<ImportExecutionResult?>(null) }
    var defaultStrategy by remember { mutableStateOf(MergeStrategy.SKIP_DUPLICATES) }

    var candidateToChangeCategoryIndex by remember { mutableStateOf<Int?>(null) }

    fun runAnalysis() {
        val existingNames = existingExercises.map { it.name }.toSet()
        val analysis = parser.analyze(
            rawJson,
            sourceName = selectedFileName?.let { "Plik: $it" } ?: "GymTracker Pro",
            existingExerciseNames = existingNames
        )
        report = analysis
        isSummaryStep = false
        executionResult = null
        candidatesState.clear()
        candidatesState.addAll(analysis.candidates)
    }

    // Android Storage Access Framework (SAF) launcher - zero wide permissions
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri == null) {
            // Anulowano wybór w systemowym selektorze: nie pokazuj błędu, zachowaj poprzedni stan
            return@rememberLauncherForActivityResult
        }
        isReadingFile = true
        fileErrorMessage = null
        coroutineScope.launch {
            when (val res = fileReader.readFromUri(uri)) {
                is FileReadResult.Success -> {
                    selectedFileName = res.fileName
                    rawJson = res.content
                    fileErrorMessage = null
                    isReadingFile = false
                    runAnalysis()
                }
                is FileReadResult.Error -> {
                    fileErrorMessage = res.message
                    isReadingFile = false
                }
                is FileReadResult.Canceled -> {
                    isReadingFile = false
                }
            }
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.92f),
            shape = RoundedCornerShape(16.dp),
            color = FitnessSurface,
            border = BorderStroke(1.dp, FitnessBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Podgląd importu JSON",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = FitnessTextPrimary
                        )
                        Text(
                            text = "Etap 3C • Wybór pliku SAF & bezpieczny podgląd",
                            style = MaterialTheme.typography.labelSmall,
                            color = FitnessCyan
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Zamknij", tint = FitnessTextSecondary)
                    }
                }

                Spacer(Modifier.height(8.dp))

                // Treść podglądu
                if (report == null) {
                    // Krok 1: Wklejanie tekstu JSON lub wybór pliku i wywołanie analizy
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Wybierz plik JSON z telefonu przez bezpieczny Storage Access Framework lub wklej treść poniżej. Analiza działa wyłącznie w pamięci.",
                            style = MaterialTheme.typography.bodySmall,
                            color = FitnessTextSecondary
                        )

                        // Przycisk SAF do wyboru pliku
                        Button(
                            onClick = {
                                filePickerLauncher.launch(arrayOf("application/json", "text/*", "*/*"))
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("pick_json_file_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = FitnessSurfaceVariant, contentColor = FitnessCyan),
                            border = BorderStroke(1.dp, FitnessCyan.copy(alpha = 0.5f))
                        ) {
                            Icon(Icons.Default.FileOpen, contentDescription = null, modifier = Modifier.size(18.dp), tint = FitnessCyan)
                            Spacer(Modifier.width(8.dp))
                            Text("Wybierz plik JSON z telefonu (SAF)", fontWeight = FontWeight.SemiBold)
                        }

                        if (isReadingFile) {
                            Surface(
                                color = FitnessSurfaceVariant,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    CircularProgressIndicator(modifier = Modifier.size(16.dp), color = FitnessCyan, strokeWidth = 2.dp)
                                    Spacer(Modifier.width(8.dp))
                                    Text("Odczytywanie pliku (UTF-8, limit 10 MB)...", style = MaterialTheme.typography.labelSmall, color = FitnessCyan)
                                }
                            }
                        }

                        if (selectedFileName != null) {
                            Surface(
                                color = FitnessSurfaceVariant,
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, FitnessGreen.copy(alpha = 0.5f)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = FitnessGreen, modifier = Modifier.size(16.dp))
                                        Spacer(Modifier.width(6.dp))
                                        Text("Plik: $selectedFileName", style = MaterialTheme.typography.labelSmall, color = FitnessTextPrimary)
                                    }
                                    IconButton(
                                        onClick = {
                                            selectedFileName = null
                                            rawJson = ""
                                        },
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Icon(Icons.Default.Close, contentDescription = "Odłącz plik", tint = FitnessTextTertiary, modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                        }

                        if (fileErrorMessage != null) {
                            Surface(
                                color = FitnessRed.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, FitnessRed),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Error, contentDescription = null, tint = FitnessRed, modifier = Modifier.size(16.dp))
                                    Spacer(Modifier.width(6.dp))
                                    Text(fileErrorMessage!!, style = MaterialTheme.typography.labelSmall, color = FitnessRed)
                                }
                            }
                        }

                        OutlinedTextField(
                            value = rawJson,
                            onValueChange = {
                                rawJson = it
                                fileErrorMessage = null
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            label = { Text("Tekst JSON") },
                            placeholder = { Text("Wklej strukturę JSON...") },
                            textStyle = MaterialTheme.typography.labelSmall
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = {
                                    selectedFileName = null
                                    rawJson = sampleJson
                                    fileErrorMessage = null
                                },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Wklej przykład", fontSize = 12.sp)
                            }
                            OutlinedButton(
                                onClick = {
                                    selectedFileName = null
                                    rawJson = ""
                                    fileErrorMessage = null
                                },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Wyczyść", fontSize = 12.sp)
                            }
                        }

                        Button(
                            onClick = { runAnalysis() },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("analyze_json_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
                        ) {
                            Icon(Icons.Default.Analytics, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Analizuj strukturę JSON", fontWeight = FontWeight.Bold)
                        }
                    }
                } else {
                    val currentReport = report!!
                    // Krok 2: Prezentacja szczegółowego raportu analizy
                    LazyColumn(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Status analizy
                        item {
                            if (!currentReport.isSuccess) {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = FitnessRed.copy(alpha = 0.15f)),
                                    border = BorderStroke(1.dp, FitnessRed),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.Error, contentDescription = null, tint = FitnessRed)
                                            Spacer(Modifier.width(8.dp))
                                            Text("Błąd analizy JSON", fontWeight = FontWeight.Bold, color = FitnessRed)
                                        }
                                        Spacer(Modifier.height(4.dp))
                                        currentReport.errors.forEach { err ->
                                            Text("• ${err.message}", style = MaterialTheme.typography.bodySmall, color = FitnessTextPrimary)
                                        }
                                    }
                                }
                            } else {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = FitnessSurfaceVariant),
                                    shape = RoundedCornerShape(10.dp),
                                    border = BorderStroke(1.dp, FitnessBorder)
                                ) {
                                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text("Wynik analizy JSON", fontWeight = FontWeight.Bold, color = FitnessGreen)
                                            Text("Źródło: ${currentReport.sourceName}", style = MaterialTheme.typography.labelSmall, color = FitnessTextTertiary)
                                        }

                                        // Rozpoznane typy danych
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                                        ) {
                                            currentReport.recognizedDataTypes.forEach { type ->
                                                Box(
                                                    modifier = Modifier
                                                        .clip(RoundedCornerShape(4.dp))
                                                        .background(FitnessCyan.copy(alpha = 0.2f))
                                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                                ) {
                                                    Text(type.displayName, style = MaterialTheme.typography.labelSmall, color = FitnessCyan, fontSize = 10.sp)
                                                }
                                            }
                                        }

                                        Divider(color = FitnessBorder, modifier = Modifier.padding(vertical = 4.dp))

                                        // Metryki
                                        Text(
                                            "Wykryto łącznie: ${currentReport.totalFound} • Nowe: ${currentReport.newItemsCount} • Duplikaty: ${currentReport.duplicatesCount} • Niejednoznaczności: ${currentReport.conflictsCount}",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = FitnessTextPrimary
                                        )
                                        Text(
                                            "Ćwiczenia: ${currentReport.exercisesFound} | Szablony: ${currentReport.templatesFound} | Cykle: ${currentReport.cyclesFound} | Sesje: ${currentReport.sessionsFound}",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = FitnessTextSecondary
                                        )
                                    }
                                }
                            }
                        }

                        // Ostrzeżenia
                        if (currentReport.warnings.isNotEmpty()) {
                            item {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = FitnessAmber.copy(alpha = 0.12f)),
                                    border = BorderStroke(1.dp, FitnessAmber.copy(alpha = 0.5f)),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.Warning, contentDescription = null, tint = FitnessAmber, modifier = Modifier.size(16.dp))
                                            Spacer(Modifier.width(6.dp))
                                            Text("Ostrzeżenia i uwagi (${currentReport.warnings.size})", fontWeight = FontWeight.Bold, color = FitnessAmber, fontSize = 12.sp)
                                        }
                                        currentReport.warnings.forEach { w ->
                                            Text("• ${w.message}", style = MaterialTheme.typography.labelSmall, color = FitnessTextPrimary)
                                        }
                                    }
                                }
                            }
                        }

                        // Sekcja innych wykrytych elementów (Szablony, Cykle)
                        if (currentReport.recognizedTemplates.isNotEmpty() || currentReport.recognizedCycles.isNotEmpty()) {
                            item {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = FitnessSurface),
                                    shape = RoundedCornerShape(10.dp),
                                    border = BorderStroke(1.dp, FitnessBorder)
                                ) {
                                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Text("Inne rozpoznane struktury w pliku:", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = FitnessTextPrimary)
                                        currentReport.recognizedTemplates.forEach { tpl ->
                                            Text("• Szablon: ${tpl.name} (${tpl.exerciseNames.size} ćwiczeń)", style = MaterialTheme.typography.labelSmall, color = FitnessTextSecondary)
                                        }
                                        currentReport.recognizedCycles.forEach { cyc ->
                                            Text("• Cykl/Plan: ${cyc.name} (${cyc.workoutNames.size} treningów w sekwencji)", style = MaterialTheme.typography.labelSmall, color = FitnessTextSecondary)
                                        }
                                    }
                                }
                            }
                        }

                        // Lista kandydatów ćwiczeń
                        if (candidatesState.isNotEmpty()) {
                            item {
                                Text(
                                    "Rozpoznane ćwiczenia (${candidatesState.size}):",
                                    fontWeight = FontWeight.Bold,
                                    color = FitnessTextPrimary,
                                    fontSize = 13.sp
                                )
                            }

                            items(candidatesState.indices.toList()) { idx ->
                                val cand = candidatesState[idx]
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = FitnessSurfaceVariant),
                                    shape = RoundedCornerShape(10.dp),
                                    border = BorderStroke(
                                        1.dp,
                                        when {
                                            cand.isDuplicate -> FitnessAmber
                                            cand.isCategoryAmbiguous -> FitnessCyan
                                            else -> FitnessBorder
                                        }
                                    ),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        // Górny wiersz z checkboxem i nazwą
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                                Checkbox(
                                                    checked = cand.isSelectedForImport,
                                                    onCheckedChange = { checked ->
                                                        candidatesState[idx] = cand.copy(isSelectedForImport = checked)
                                                    }
                                                )
                                                Column {
                                                    Text(cand.rawExercise.name, fontWeight = FontWeight.Bold, color = FitnessTextPrimary, fontSize = 13.sp)
                                                    if (cand.rawExercise.notes.isNotBlank()) {
                                                        Text("Notatka: ${cand.rawExercise.notes}", style = MaterialTheme.typography.labelSmall, color = FitnessTextTertiary)
                                                    }
                                                }
                                            }

                                            if (cand.isDuplicate) {
                                                Box(
                                                    modifier = Modifier
                                                        .clip(RoundedCornerShape(4.dp))
                                                        .background(FitnessAmber.copy(alpha = 0.2f))
                                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                                ) {
                                                    Text("Duplikat", style = MaterialTheme.typography.labelSmall, color = FitnessAmber, fontSize = 10.sp)
                                                }
                                            }
                                        }

                                        // Wiersz mapowania kategorii
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(FitnessSurface)
                                                .clickable { candidateToChangeCategoryIndex = idx }
                                                .padding(horizontal = 8.dp, vertical = 6.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column {
                                                Text(
                                                    text = "Źródło: ${cand.rawExercise.rawCategory}",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = FitnessTextTertiary
                                                )
                                                Text(
                                                    text = "Docelowo: ${cand.mappedCategory.displayName}",
                                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                                    color = if (cand.isCategoryAmbiguous) FitnessAmber else FitnessGreen
                                                )
                                            }
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Text("Zmień", fontSize = 11.sp, color = FitnessCyan)
                                                Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = FitnessCyan)
                                            }
                                        }

                                        // Strategia scalania per kandydat
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text("Strategia scalania:", style = MaterialTheme.typography.labelSmall, color = FitnessTextSecondary)
                                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                                MergeStrategy.entries.forEach { strat ->
                                                    FilterChip(
                                                        selected = cand.strategy == strat,
                                                        onClick = {
                                                            candidatesState[idx] = cand.copy(strategy = strat)
                                                        },
                                                        label = { Text(strat.displayName, fontSize = 9.sp) }
                                                    )
                                                }
                                            }
                                        }

                                        if (cand.validationWarning != null) {
                                            Text(
                                                text = "⚠️ ${cand.validationWarning}",
                                                style = MaterialTheme.typography.labelSmall,
                                                color = FitnessAmber
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer(Modifier.height(10.dp))

                    // Dolne przyciski kroku 2
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { report = null },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Wróć do JSON", fontSize = 12.sp)
                        }

                        OutlinedButton(
                            onClick = onDismiss,
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Anuluj", fontSize = 12.sp)
                        }

                        Button(
                            onClick = { isSummaryStep = true },
                            modifier = Modifier.weight(1.3f),
                            colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground),
                            enabled = candidatesState.any { it.isSelectedForImport }
                        ) {
                            Text("Dalej: Podsumowanie (${candidatesState.count { it.isSelectedForImport }})", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }
                } else {
                    // Krok 3: Podsumowanie planowanych zmian i atomowe zatwierdzenie Room
                    val selected = candidatesState.filter { it.isSelectedForImport }
                    val toAddCount = selected.count { !it.isDuplicate || it.strategy == MergeStrategy.ADD_AS_NEW }
                    val toOverwriteCount = selected.count { it.isDuplicate && it.strategy == MergeStrategy.OVERWRITE }
                    val toSkipCount = selected.count { it.isDuplicate && (it.strategy == MergeStrategy.SKIP_DUPLICATES || it.strategy == MergeStrategy.KEEP_EXISTING) }
                    val unresolvedCount = selected.count { it.isCategoryAmbiguous }
                    val deselectedCount = candidatesState.count { !it.isSelectedForImport }

                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Krok 3: Podsumowanie planowanych zmian",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = FitnessTextPrimary
                        )

                        if (executionResult != null) {
                            val res = executionResult!!
                            if (res.isSuccess) {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = FitnessGreen.copy(alpha = 0.15f)),
                                    border = BorderStroke(1.dp, FitnessGreen),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = FitnessGreen)
                                            Spacer(Modifier.width(8.dp))
                                            Text("Import zakończony pomyślnie!", fontWeight = FontWeight.Bold, color = FitnessGreen)
                                        }
                                        Text("• Zapisano w bazie Room:", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold, color = FitnessTextPrimary)
                                        Text("  - Dodano nowych ćwiczeń: ${res.addedCount}", style = MaterialTheme.typography.bodySmall, color = FitnessTextPrimary)
                                        Text("  - Zaktualizowano (zastąpiono): ${res.updatedCount}", style = MaterialTheme.typography.bodySmall, color = FitnessTextPrimary)
                                        Text("  - Pominięto duplikatów: ${res.skippedCount}", style = MaterialTheme.typography.bodySmall, color = FitnessTextPrimary)
                                        Text("  - Rozwiązanych kolizji: ${res.conflictsCount}", style = MaterialTheme.typography.bodySmall, color = FitnessTextPrimary)
                                        Spacer(Modifier.height(4.dp))
                                        Text("Ukończone treningi i historia sesji pozostały w 100% nienaruszone.", style = MaterialTheme.typography.labelSmall, color = FitnessCyan)
                                    }
                                }
                            } else {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = FitnessRed.copy(alpha = 0.15f)),
                                    border = BorderStroke(1.dp, FitnessRed),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.Error, contentDescription = null, tint = FitnessRed)
                                            Spacer(Modifier.width(8.dp))
                                            Text("Błąd transakcji bazy Room", fontWeight = FontWeight.Bold, color = FitnessRed)
                                        }
                                        Text(res.errorMessage ?: "Niepowodzenie transakcji zapisu.", style = MaterialTheme.typography.bodySmall, color = FitnessTextPrimary)
                                        Text("Transakcja została wycofana w całości. Stan bazy danych nie uległ żadnej zmianie.", style = MaterialTheme.typography.labelSmall, color = FitnessTextSecondary)
                                    }
                                }
                            }
                        } else {
                            // Prezentacja bilansu planowanych operacji
                            Card(
                                colors = CardDefaults.cardColors(containerColor = FitnessSurfaceVariant),
                                shape = RoundedCornerShape(10.dp),
                                border = BorderStroke(1.dp, FitnessBorder),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text("Bilans operacji w bazie:", fontWeight = FontWeight.Bold, color = FitnessGreen)
                                    Text("• Rekordy do dodania jako nowe: $toAddCount", style = MaterialTheme.typography.bodySmall, color = FitnessTextPrimary)
                                    Text("• Istniejące rekordy do zastąpienia: $toOverwriteCount", style = MaterialTheme.typography.bodySmall, color = FitnessAmber)
                                    Text("• Rekordy do pominięcia (bez zmian): $toSkipCount", style = MaterialTheme.typography.bodySmall, color = FitnessTextSecondary)
                                    if (deselectedCount > 0) {
                                        Text("• Pozycje odznaczone przez użytkownika: $deselectedCount", style = MaterialTheme.typography.bodySmall, color = FitnessTextTertiary)
                                    }
                                }
                            }

                            if (unresolvedCount > 0) {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = FitnessRed.copy(alpha = 0.15f)),
                                    shape = RoundedCornerShape(10.dp),
                                    border = BorderStroke(1.dp, FitnessRed),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Warning, contentDescription = null, tint = FitnessRed, modifier = Modifier.size(20.dp))
                                        Spacer(Modifier.width(8.dp))
                                        Text(
                                            text = "Zatwierdzenie zablokowane: $unresolvedCount wybranych ćwiczeń ma niejednoznaczną kategorię. Wróć do podglądu i wskaż właściwą partię z 7 głównych lub odznacz te pozycje.",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = FitnessRed
                                        )
                                    }
                                }
                            }

                            if (report?.warnings?.isNotEmpty() == true) {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = FitnessAmber.copy(alpha = 0.12f)),
                                    shape = RoundedCornerShape(10.dp),
                                    border = BorderStroke(1.dp, FitnessAmber.copy(alpha = 0.4f)),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                        Text("Ostrzeżenia parsera (${report?.warnings?.size}):", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = FitnessAmber)
                                        report?.warnings?.take(3)?.forEach { w ->
                                            Text("• ${w.message}", style = MaterialTheme.typography.labelSmall, color = FitnessTextSecondary)
                                        }
                                    }
                                }
                            }

                            // Przegląd wybranych strategii dla kandydatów
                            Text("Wybrane strategie dla pozycji:", style = MaterialTheme.typography.labelSmall, color = FitnessTextSecondary)
                            LazyColumn(
                                modifier = Modifier
                                    .weight(1f)
                                    .fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                items(selected) { cand ->
                                    Surface(
                                        color = FitnessSurface,
                                        shape = RoundedCornerShape(6.dp),
                                        border = BorderStroke(0.5.dp, FitnessBorder),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(horizontal = 8.dp, vertical = 6.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(cand.rawExercise.name, style = MaterialTheme.typography.bodySmall, color = FitnessTextPrimary, maxLines = 1)
                                                Text("Kategoria: ${cand.mappedCategory.displayName}", style = MaterialTheme.typography.labelSmall, color = if (cand.isCategoryAmbiguous) FitnessAmber else FitnessTextTertiary)
                                            }
                                            Surface(
                                                color = when (cand.strategy) {
                                                    MergeStrategy.ADD_AS_NEW -> FitnessGreen.copy(alpha = 0.2f)
                                                    MergeStrategy.OVERWRITE -> FitnessAmber.copy(alpha = 0.2f)
                                                    MergeStrategy.SKIP_DUPLICATES, MergeStrategy.KEEP_EXISTING -> FitnessSurfaceVariant
                                                },
                                                shape = RoundedCornerShape(4.dp)
                                            ) {
                                                Text(
                                                    text = cand.strategy.displayName,
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = when (cand.strategy) {
                                                        MergeStrategy.ADD_AS_NEW -> FitnessGreen
                                                        MergeStrategy.OVERWRITE -> FitnessAmber
                                                        MergeStrategy.SKIP_DUPLICATES, MergeStrategy.KEEP_EXISTING -> FitnessTextSecondary
                                                    },
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }

                            // Karta gwarancji bezpieczeństwa historii
                            Card(
                                colors = CardDefaults.cardColors(containerColor = FitnessSurface),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, FitnessCyan.copy(alpha = 0.35f)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Security, contentDescription = null, tint = FitnessCyan, modifier = Modifier.size(18.dp))
                                    Spacer(Modifier.width(8.dp))
                                    Text(
                                        text = "Historia ukończonych sesji treningowych i serie pozostają nienaruszone. Zapis odbywa się w jednej atomowej transakcji Room.",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = FitnessTextSecondary
                                    )
                                }
                            }
                        }

                        // Dolne przyciski kroku 3
                        if (executionResult != null && executionResult!!.isSuccess) {
                            Button(
                                onClick = onDismiss,
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
                            ) {
                                Text("Zakończ i zamknij", fontWeight = FontWeight.Bold)
                            }
                        } else {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        isSummaryStep = false
                                        executionResult = null
                                    },
                                    modifier = Modifier.weight(1f),
                                    enabled = !isImporting
                                ) {
                                    Text("Wróć do podglądu", fontSize = 12.sp)
                                }

                                OutlinedButton(
                                    onClick = onDismiss,
                                    modifier = Modifier.weight(1f),
                                    enabled = !isImporting
                                ) {
                                    Text("Anuluj", fontSize = 12.sp)
                                }

                                Button(
                                    onClick = {
                                        isImporting = true
                                        onConfirmImport(candidatesState.toList(), defaultStrategy) { res ->
                                            isImporting = false
                                            executionResult = res
                                        }
                                    },
                                    modifier = Modifier.weight(1.3f),
                                    colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground),
                                    enabled = !isImporting && selected.isNotEmpty() && unresolvedCount == 0 && report?.isSuccess == true
                                ) {
                                    if (isImporting) {
                                        CircularProgressIndicator(modifier = Modifier.size(16.dp), color = FitnessBackground, strokeWidth = 2.dp)
                                        Spacer(Modifier.width(6.dp))
                                        Text("Zapisywanie...", fontSize = 11.sp)
                                    } else {
                                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(Modifier.width(4.dp))
                                        Text("Zatwierdź import", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Modal ręcznej zmiany kategorii dla kandydata
    candidateToChangeCategoryIndex?.let { idx ->
        val cand = candidatesState.getOrNull(idx)
        if (cand != null) {
            AlertDialog(
                onDismissRequest = { candidateToChangeCategoryIndex = null },
                title = { Text("Zmień kategorię ćwiczenia") },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "Ćwiczenie: ${cand.rawExercise.name}",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Wybierz dokładnie jedną z 7 kategorii głównych:",
                            style = MaterialTheme.typography.labelSmall,
                            color = FitnessTextSecondary
                        )
                        ExerciseCategory.entries.forEach { cat ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(6.dp))
                                    .clickable {
                                        candidatesState[idx] = cand.copy(
                                            mappedCategory = cat,
                                            isCategoryAmbiguous = false
                                        )
                                        candidateToChangeCategoryIndex = null
                                    }
                                    .padding(vertical = 4.dp)
                            ) {
                                RadioButton(
                                    selected = cand.mappedCategory == cat,
                                    onClick = {
                                        candidatesState[idx] = cand.copy(
                                            mappedCategory = cat,
                                            isCategoryAmbiguous = false
                                        )
                                        candidateToChangeCategoryIndex = null
                                    }
                                )
                                Spacer(Modifier.width(6.dp))
                                Text(cat.displayName, style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                    }
                },
                confirmButton = {},
                dismissButton = {
                    TextButton(onClick = { candidateToChangeCategoryIndex = null }) {
                        Text("Anuluj")
                    }
                }
            )
        }
    }
}
