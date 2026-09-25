package com.example.domain.model

enum class ExerciseCategory(val displayName: String) {
    KLATKA_PIERSIOWA("Klatka piersiowa"),
    PLECY("Plecy"),
    BARKI("Barki"),
    NOGI("Nogi"),
    BICEPS("Biceps"),
    TRICEPS("Triceps"),
    POZOSTALE("Pozostałe");

    companion object {
        fun fromDisplayName(name: String): ExerciseCategory {
            return entries.firstOrNull { it.displayName.equals(name, ignoreCase = true) } ?: POZOSTALE
        }
    }
}
