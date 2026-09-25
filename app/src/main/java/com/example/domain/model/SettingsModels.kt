package com.example.domain.model

enum class StartScreenOption(val displayName: String, val route: String) {
    TODAY("Dzisiaj", "today"),
    PLANS("Plany", "plans"),
    WORKOUT("Trening", "workout"),
    CALENDAR("Kalendarz", "calendar"),
    ANALYTICS("Analizy", "analytics")
}

data class AppSettings(
    val defaultStartScreen: StartScreenOption = StartScreenOption.TODAY,
    val interruptedReminderDays: Int = 3, // 3 days default, -1 = disabled
    val lastLocalBackupTimestamp: Long? = null,
    val backupFilesCount: Int = 1
)
