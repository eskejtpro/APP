package com.example.data.repository

import com.example.domain.model.AppSettings
import com.example.domain.model.StartScreenOption
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

interface SettingsRepository {
    fun getSettings(): Flow<AppSettings>
    suspend fun updateStartScreen(option: StartScreenOption)
    suspend fun updateReminderDays(days: Int)
    suspend fun createLocalBackup(): String
    suspend fun exportEncryptedBackup(): String
}

class InMemorySettingsRepository : SettingsRepository {
    private val _settings = MutableStateFlow(
        AppSettings(
            defaultStartScreen = StartScreenOption.TODAY,
            interruptedReminderDays = 3,
            lastLocalBackupTimestamp = System.currentTimeMillis() - (86400 * 1000L),
            backupFilesCount = 2
        )
    )

    override fun getSettings(): Flow<AppSettings> = _settings.asStateFlow()

    override suspend fun updateStartScreen(option: StartScreenOption) {
        _settings.value = _settings.value.copy(defaultStartScreen = option)
    }

    override suspend fun updateReminderDays(days: Int) {
        _settings.value = _settings.value.copy(interruptedReminderDays = days)
    }

    override suspend fun createLocalBackup(): String {
        val now = System.currentTimeMillis()
        val dateFormat = SimpleDateFormat("yyyyMMdd_HHmm", Locale.getDefault())
        val fileName = "backup_planpasika_${dateFormat.format(Date(now))}.sqlite"
        _settings.value = _settings.value.copy(
            lastLocalBackupTimestamp = now,
            backupFilesCount = _settings.value.backupFilesCount + 1
        )
        return fileName
    }

    override suspend fun exportEncryptedBackup(): String {
        val now = System.currentTimeMillis()
        val dateFormat = SimpleDateFormat("yyyyMMdd_HHmm", Locale.getDefault())
        return "planpasika_encrypted_${dateFormat.format(Date(now))}.bak"
    }
}
