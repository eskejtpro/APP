package com.example.data.repository.room

import com.example.data.local.dao.SettingsDao
import com.example.data.local.entity.AppSettingsEntity
import com.example.data.repository.SettingsRepository
import com.example.domain.model.AppSettings
import com.example.domain.model.StartScreenOption
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class RoomSettingsRepository(
    private val settingsDao: SettingsDao
) : SettingsRepository {

    override fun getSettings(): Flow<AppSettings> {
        return settingsDao.getSettings().map { entity ->
            entity?.toDomain() ?: AppSettings()
        }
    }

    override suspend fun updateStartScreen(option: StartScreenOption) {
        val current = settingsDao.getSettingsSync()?.toDomain() ?: AppSettings()
        val updated = current.copy(defaultStartScreen = option)
        settingsDao.insertOrUpdateSettings(AppSettingsEntity.fromDomain(updated))
    }

    override suspend fun updateReminderDays(days: Int) {
        val current = settingsDao.getSettingsSync()?.toDomain() ?: AppSettings()
        val updated = current.copy(interruptedReminderDays = days)
        settingsDao.insertOrUpdateSettings(AppSettingsEntity.fromDomain(updated))
    }

    override suspend fun createLocalBackup(): String {
        val now = System.currentTimeMillis()
        val dateFormat = SimpleDateFormat("yyyyMMdd_HHmm", Locale.getDefault())
        val fileName = "backup_planpasika_${dateFormat.format(Date(now))}.sqlite"

        val current = settingsDao.getSettingsSync()?.toDomain() ?: AppSettings()
        val updated = current.copy(
            lastLocalBackupTimestamp = now,
            backupFilesCount = current.backupFilesCount + 1
        )
        settingsDao.insertOrUpdateSettings(AppSettingsEntity.fromDomain(updated))
        return fileName
    }

    override suspend fun exportEncryptedBackup(): String {
        val now = System.currentTimeMillis()
        val dateFormat = SimpleDateFormat("yyyyMMdd_HHmm", Locale.getDefault())
        return "planpasika_encrypted_${dateFormat.format(Date(now))}.bak"
    }
}
