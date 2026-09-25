package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.domain.model.AppSettings
import com.example.domain.model.StartScreenOption

@Entity(tableName = "app_settings")
data class AppSettingsEntity(
    @PrimaryKey
    val id: String = SINGLETON_ID,
    val defaultStartScreen: StartScreenOption = StartScreenOption.TODAY,
    val interruptedReminderDays: Int = 3,
    val lastLocalBackupTimestamp: Long? = null,
    val backupFilesCount: Int = 1
) {
    fun toDomain(): AppSettings = AppSettings(
        defaultStartScreen = defaultStartScreen,
        interruptedReminderDays = interruptedReminderDays,
        lastLocalBackupTimestamp = lastLocalBackupTimestamp,
        backupFilesCount = backupFilesCount
    )

    companion object {
        const val SINGLETON_ID = "app_settings_singleton"

        fun fromDomain(domain: AppSettings): AppSettingsEntity = AppSettingsEntity(
            id = SINGLETON_ID,
            defaultStartScreen = domain.defaultStartScreen,
            interruptedReminderDays = domain.interruptedReminderDays,
            lastLocalBackupTimestamp = domain.lastLocalBackupTimestamp,
            backupFilesCount = domain.backupFilesCount
        )
    }
}
