package com.example.data.importer

import com.example.domain.model.*
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

class GymTrackerJsonParser {

    /**
     * Główna funkcja analizy JSON.
     * Przyjmuje tekst w pamięci i opcjonalną listę istniejących nazw ćwiczeń.
     * Nie wykonuje żadnych operacji I/O ani zapisu do bazy danych.
     */
    fun analyze(
        jsonString: String?,
        sourceName: String = "GymTracker Pro",
        existingExerciseNames: Set<String> = emptySet()
    ): ImportAnalysisReport {
        if (jsonString.isNullOrBlank()) {
            return ImportAnalysisReport(
                isSuccess = false,
                sourceName = sourceName,
                errors = listOf(ImportError("Przekazany tekst JSON jest pusty."))
            )
        }

        val trimmed = jsonString.trim()

        val parsedObject: JSONObject?
        val parsedArray: JSONArray?

        try {
            if (trimmed.startsWith("{")) {
                parsedObject = JSONObject(trimmed)
                parsedArray = null
            } else if (trimmed.startsWith("[")) {
                parsedArray = JSONArray(trimmed)
                parsedObject = null
            } else {
                return ImportAnalysisReport(
                    isSuccess = false,
                    sourceName = sourceName,
                    errors = listOf(ImportError("Nieprawidłowy format danych: ciąg nie rozpoczyna się od '{' ani '['."))
                )
            }
        } catch (e: JSONException) {
            return ImportAnalysisReport(
                isSuccess = false,
                sourceName = sourceName,
                errors = listOf(ImportError("Błąd składni JSON: ${e.localizedMessage ?: "Niepoprawna składnia"}"))
            )
        }

        val warnings = mutableListOf<ImportWarning>()
        val errors = mutableListOf<ImportError>()
        val candidates = mutableListOf<ImportCandidate>()
        val templates = mutableListOf<GymTrackerRawTemplate>()
        val cycles = mutableListOf<GymTrackerRawCycle>()
        val sessions = mutableListOf<GymTrackerRawSession>()
        val recognizedTypes = mutableSetOf<ImportedDataType>()

        val seenExerciseNamesInPayload = mutableSetOf<String>()

        if (parsedArray != null) {
            // Tablica obiektów (np. [ { "name": "...", "category": "..." }, ... ])
            recognizedTypes.add(ImportedDataType.EXERCISES)
            for (i in 0 until parsedArray.length()) {
                val item = parsedArray.optJSONObject(i)
                if (item != null) {
                    processExerciseJsonObject(
                        item = item,
                        candidates = candidates,
                        seenNames = seenExerciseNamesInPayload,
                        existingNames = existingExerciseNames,
                        warnings = warnings,
                        errors = errors
                    )
                } else {
                    warnings.add(ImportWarning("Pominięto element tablicy o indeksie $i, który nie jest obiektem JSON."))
                }
            }
        } else if (parsedObject != null) {
            // Obiekt główny z możliwymi polami sekcji
            var hasRecognizedSection = false

            // 1. Sekcja ćwiczeń
            val exercisesArray = findJsonArray(parsedObject, listOf("exercises", "cwiczenia", "exercise_list", "items", "data"))
            if (exercisesArray != null) {
                hasRecognizedSection = true
                recognizedTypes.add(ImportedDataType.EXERCISES)
                for (i in 0 until exercisesArray.length()) {
                    val item = exercisesArray.optJSONObject(i)
                    if (item != null) {
                        processExerciseJsonObject(
                            item = item,
                            candidates = candidates,
                            seenNames = seenExerciseNamesInPayload,
                            existingNames = existingExerciseNames,
                            warnings = warnings,
                            errors = errors
                        )
                    }
                }
            }

            // 2. Sekcja szablonów
            val templatesArray = findJsonArray(parsedObject, listOf("templates", "workouts", "szablony", "workout_templates"))
            if (templatesArray != null) {
                hasRecognizedSection = true
                recognizedTypes.add(ImportedDataType.WORKOUT_TEMPLATES)
                for (i in 0 until templatesArray.length()) {
                    val item = templatesArray.optJSONObject(i)
                    if (item != null) {
                        val name = optStringAny(item, listOf("name", "nazwa", "title", "template_name"))
                        if (name.isNotBlank()) {
                            val desc = optStringAny(item, listOf("description", "opis", "notes"))
                            val exNames = mutableListOf<String>()
                            val exArr = findJsonArray(item, listOf("exercises", "cwiczenia", "exercise_names"))
                            if (exArr != null) {
                                for (j in 0 until exArr.length()) {
                                    val exItem = exArr.opt(j)
                                    if (exItem is String) {
                                        exNames.add(exItem)
                                    } else if (exItem is JSONObject) {
                                        val subName = optStringAny(exItem, listOf("name", "nazwa"))
                                        if (subName.isNotBlank()) exNames.add(subName)
                                    }
                                }
                            }
                            templates.add(
                                GymTrackerRawTemplate(
                                    name = name,
                                    description = desc,
                                    exerciseNames = exNames,
                                    unknownFields = extractUnknownFields(item, setOf("name", "nazwa", "title", "template_name", "description", "opis", "notes", "exercises", "cwiczenia", "exercise_names"))
                                )
                            )
                        } else {
                            warnings.add(ImportWarning("Pominięto szablon bez nazwy."))
                        }
                    }
                }
            }

            // 3. Sekcja cykli / planów
            val cyclesArray = findJsonArray(parsedObject, listOf("cycles", "plans", "plany", "training_cycles", "schemes"))
            if (cyclesArray != null) {
                hasRecognizedSection = true
                recognizedTypes.add(ImportedDataType.TRAINING_CYCLES)
                for (i in 0 until cyclesArray.length()) {
                    val item = cyclesArray.optJSONObject(i)
                    if (item != null) {
                        val name = optStringAny(item, listOf("name", "nazwa", "plan_name"))
                        if (name.isNotBlank()) {
                            val typeStr = optStringAny(item, listOf("type", "typ", "cycle_type"))
                            val workoutNames = mutableListOf<String>()
                            val wArr = findJsonArray(item, listOf("workouts", "sequence", "sekwencja", "days"))
                            if (wArr != null) {
                                for (j in 0 until wArr.length()) {
                                    val wItem = wArr.opt(j)
                                    if (wItem is String) workoutNames.add(wItem)
                                    else if (wItem is JSONObject) {
                                        val wName = optStringAny(wItem, listOf("name", "nazwa", "workout"))
                                        if (wName.isNotBlank()) workoutNames.add(wName)
                                    }
                                }
                            }
                            cycles.add(
                                GymTrackerRawCycle(
                                    name = name,
                                    cycleTypeStr = typeStr,
                                    workoutNames = workoutNames,
                                    unknownFields = extractUnknownFields(item, setOf("name", "nazwa", "plan_name", "type", "typ", "cycle_type", "workouts", "sequence", "sekwencja", "days"))
                                )
                            )
                        }
                    }
                }
            }

            // 4. Sekcja historii sesji
            val sessionsArray = findJsonArray(parsedObject, listOf("sessions", "history", "historia", "completed_workouts", "logs"))
            if (sessionsArray != null) {
                hasRecognizedSection = true
                recognizedTypes.add(ImportedDataType.COMPLETED_SESSIONS)
                for (i in 0 until sessionsArray.length()) {
                    val item = sessionsArray.optJSONObject(i)
                    if (item != null) {
                        val wName = optStringAny(item, listOf("workoutName", "workout_name", "name", "nazwa"))
                        val dateIso = optStringAny(item, listOf("date", "data", "dateIso", "timestamp"))
                        val duration = item.optInt("durationMinutes", item.optInt("duration", 0))
                        if (wName.isNotBlank()) {
                            sessions.add(
                                GymTrackerRawSession(
                                    workoutName = wName,
                                    dateIso = dateIso,
                                    durationMinutes = duration,
                                    unknownFields = extractUnknownFields(item, setOf("workoutName", "workout_name", "name", "nazwa", "date", "data", "dateIso", "timestamp", "durationMinutes", "duration"))
                                )
                            )
                        }
                    }
                }
            }

            // 5. Pojedynczy obiekt ćwiczenia
            if (!hasRecognizedSection) {
                val singleName = optStringAny(parsedObject, listOf("name", "nazwa", "exercise_name"))
                if (singleName.isNotBlank()) {
                    recognizedTypes.add(ImportedDataType.EXERCISES)
                    processExerciseJsonObject(
                        item = parsedObject,
                        candidates = candidates,
                        seenNames = seenExerciseNamesInPayload,
                        existingNames = existingExerciseNames,
                        warnings = warnings,
                        errors = errors
                    )
                } else {
                    return ImportAnalysisReport(
                        isSuccess = false,
                        sourceName = sourceName,
                        errors = listOf(ImportError("Prawidłowy format JSON, lecz brak rozpoznawalnych sekcji (np. 'exercises', 'templates', 'plans')."))
                    )
                }
            }
        }

        val totalFound = candidates.size + templates.size + cycles.size + sessions.size
        val duplicatesCount = candidates.count { it.isDuplicate }
        val newItemsCount = candidates.count { !it.isDuplicate }
        val conflictsCount = candidates.count { it.isCategoryAmbiguous }

        return ImportAnalysisReport(
            isSuccess = true,
            sourceName = sourceName,
            recognizedDataTypes = recognizedTypes.toList(),
            totalFound = totalFound,
            exercisesFound = candidates.size,
            templatesFound = templates.size,
            cyclesFound = cycles.size,
            sessionsFound = sessions.size,
            duplicatesCount = duplicatesCount,
            conflictsCount = conflictsCount,
            newItemsCount = newItemsCount,
            candidates = candidates,
            recognizedTemplates = templates,
            recognizedCycles = cycles,
            recognizedSessions = sessions,
            warnings = warnings,
            errors = errors
        )
    }

    private fun processExerciseJsonObject(
        item: JSONObject,
        candidates: MutableList<ImportCandidate>,
        seenNames: MutableSet<String>,
        existingNames: Set<String>,
        warnings: MutableList<ImportWarning>,
        errors: MutableList<ImportError>
    ) {
        val name = optStringAny(item, listOf("name", "nazwa", "exercise_name", "title")).trim()
        if (name.isBlank()) {
            errors.add(ImportError("Wykryto rekord ćwiczenia z brakującą lub pustą nazwą.", item.toString()))
            return
        }

        val rawCategory = optStringAny(item, listOf("category", "kategoria", "group", "muscle_group", "part")).trim()
        val defaultSets = item.optInt("defaultSets", item.optInt("sets", item.optInt("serie", 3)))
        val defaultReps = item.optInt("defaultReps", item.optInt("reps", item.optInt("powtorzenia", 10)))
        val notes = optStringAny(item, listOf("notes", "notatki", "description", "opis", "comment")).trim()

        val unknownFields = extractUnknownFields(
            item,
            setOf("name", "nazwa", "exercise_name", "title", "category", "kategoria", "group", "muscle_group", "part", "defaultSets", "sets", "serie", "defaultReps", "reps", "powtorzenia", "notes", "notatki", "description", "opis", "comment", "id")
        )

        val mappingResult = mapCategorySafely(rawCategory)

        val normalizedName = name.lowercase()
        val isDuplicateInPayload = seenNames.contains(normalizedName)
        val isDuplicateInDatabase = existingNames.any { it.trim().equals(name, ignoreCase = true) }
        val isDuplicate = isDuplicateInPayload || isDuplicateInDatabase

        seenNames.add(normalizedName)

        val warningMsg: String? = when {
            isDuplicateInPayload -> {
                warnings.add(ImportWarning("Zduplikowana nazwa w pliku importu: '$name'.", itemName = name, requiresUserAction = true))
                "Duplikat wewnątrz importowanego pliku"
            }
            isDuplicateInDatabase -> {
                warnings.add(ImportWarning("Ćwiczenie '$name' już istnieje w lokalnej bazie.", itemName = name, requiresUserAction = true))
                "Ćwiczenie istnieje już w bazie"
            }
            mappingResult.isAmbiguous -> {
                warnings.add(ImportWarning("Nierozpoznana kategoria '$rawCategory' dla ćwiczenia '$name'. Przypisano 'Pozostałe' (wymaga weryfikacji).", itemName = name, requiresUserAction = true))
                "Niejednoznaczna kategoria: '$rawCategory'"
            }
            else -> null
        }

        val rawExercise = GymTrackerRawExercise(
            name = name,
            rawCategory = if (rawCategory.isBlank()) "Nieokreślona" else rawCategory,
            defaultSets = defaultSets,
            defaultReps = defaultReps,
            notes = notes,
            unknownFields = unknownFields
        )

        val initialStrategy = if (isDuplicate) MergeStrategy.SKIP_DUPLICATES else MergeStrategy.ADD_AS_NEW

        candidates.add(
            ImportCandidate(
                rawExercise = rawExercise,
                mappedCategory = mappingResult.category,
                isCategoryAmbiguous = mappingResult.isAmbiguous,
                isDuplicate = isDuplicate,
                isSelectedForImport = true,
                strategy = initialStrategy,
                validationWarning = warningMsg
            )
        )
    }

    /**
     * Mapowanie kategorii źródłowej do dokładnie 7 kategorii głównych.
     * Jeżeli nieznana lub niejednoznaczna -> przypisuje POZOSTALE i flaguje jako ambiguous.
     */
    fun mapCategorySafely(raw: String?): CategoryMappingResult {
        if (raw.isNullOrBlank()) {
            return CategoryMappingResult(ExerciseCategory.POZOSTALE, isAmbiguous = true)
        }

        val normalized = raw.trim().lowercase()

        return when {
            // 1. Klatka piersiowa
            normalized.contains("klatk") || normalized.contains("chest") ||
                    normalized.contains("pec") || normalized.contains("piersiow") -> {
                CategoryMappingResult(ExerciseCategory.KLATKA_PIERSIOWA, isAmbiguous = false)
            }

            // 2. Plecy
            normalized.contains("plec") || normalized.contains("back") ||
                    normalized.contains("grzbiet") || normalized.contains("lat") ||
                    normalized.contains("najszersz") || normalized.contains("lędźw") -> {
                CategoryMappingResult(ExerciseCategory.PLECY, isAmbiguous = false)
            }

            // 3. Barki
            normalized.contains("bark") || normalized.contains("shoulder") ||
                    normalized.contains("delt") || normalized.contains("naramien") -> {
                CategoryMappingResult(ExerciseCategory.BARKI, isAmbiguous = false)
            }

            // 4. Nogi
            normalized.contains("nog") || normalized.contains("leg") ||
                    normalized.contains("quad") || normalized.contains("ud") ||
                    normalized.contains("łydk") || normalized.contains("czworo") ||
                    normalized.contains("dwugłow") || normalized.contains("poślad") ||
                    normalized.contains("glute") || normalized.contains("hamstring") -> {
                CategoryMappingResult(ExerciseCategory.NOGI, isAmbiguous = false)
            }

            // 5. Biceps
            normalized.contains("biceps") || normalized.contains("dwugłowy ramienia") ||
                    normalized.contains("bicep") -> {
                CategoryMappingResult(ExerciseCategory.BICEPS, isAmbiguous = false)
            }

            // 6. Triceps
            normalized.contains("triceps") || normalized.contains("trójgłowy ramienia") ||
                    normalized.contains("tricep") -> {
                CategoryMappingResult(ExerciseCategory.TRICEPS, isAmbiguous = false)
            }

            // 7. Pozostałe (brzuch, cardio, ogólne, nieznane)
            normalized.contains("brzuch") || normalized.contains("abs") ||
                    normalized.contains("core") || normalized.contains("cardio") ||
                    normalized.contains("pozostał") || normalized.contains("other") -> {
                CategoryMappingResult(ExerciseCategory.POZOSTALE, isAmbiguous = false)
            }

            else -> {
                CategoryMappingResult(ExerciseCategory.POZOSTALE, isAmbiguous = true)
            }
        }
    }

    private fun findJsonArray(obj: JSONObject, keys: List<String>): JSONArray? {
        for (k in keys) {
            val arr = obj.optJSONArray(k)
            if (arr != null) return arr
        }
        return null
    }

    private fun optStringAny(obj: JSONObject, keys: List<String>): String {
        for (k in keys) {
            if (obj.has(k) && !obj.isNull(k)) {
                val s = obj.optString(k, "").trim()
                if (s.isNotEmpty()) return s
            }
        }
        return ""
    }

    private fun extractUnknownFields(obj: JSONObject, knownKeys: Set<String>): Map<String, String> {
        val result = mutableMapOf<String, String>()
        val keys = obj.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            if (!knownKeys.contains(key.lowercase())) {
                val value = obj.opt(key)?.toString() ?: ""
                if (value.isNotBlank()) {
                    result[key] = value
                }
            }
        }
        return result
    }

    data class CategoryMappingResult(
        val category: ExerciseCategory,
        val isAmbiguous: Boolean
    )
}
