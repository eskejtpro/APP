package com.example.domain.model

enum class CalendarEntryType(val displayName: String) {
    WORKOUT("Trening"),
    SUBSTANCE("Wpis substancji"),
    NOTE("Notatka")
}

data class SubstanceEntry(
    val id: String,
    val dateIso: String,
    val timeStr: String,
    val substanceName: String,
    val manualInfo: String,
    val isVerifiedByUser: Boolean = false
)

data class NoteEntry(
    val id: String,
    val dateIso: String,
    val timeStr: String,
    val title: String,
    val content: String
)

data class SubstanceLibraryItem(
    val name: String,
    val category: String,
    val description: String = "Pozycja poglądowa - wymaga weryfikacji przez użytkownika"
)
