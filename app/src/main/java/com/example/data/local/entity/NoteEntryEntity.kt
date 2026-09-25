package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.domain.model.NoteEntry

@Entity(tableName = "note_entries")
data class NoteEntryEntity(
    @PrimaryKey
    val id: String,
    val dateIso: String,
    val timeStr: String,
    val title: String,
    val content: String
) {
    fun toDomain(): NoteEntry = NoteEntry(
        id = id,
        dateIso = dateIso,
        timeStr = timeStr,
        title = title,
        content = content
    )

    companion object {
        fun fromDomain(domain: NoteEntry): NoteEntryEntity = NoteEntryEntity(
            id = domain.id,
            dateIso = domain.dateIso,
            timeStr = domain.timeStr,
            title = domain.title,
            content = domain.content
        )
    }
}
