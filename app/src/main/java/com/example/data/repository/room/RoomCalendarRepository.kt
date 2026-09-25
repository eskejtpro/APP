package com.example.data.repository.room

import com.example.data.local.dao.CalendarDao
import com.example.data.local.entity.NoteEntryEntity
import com.example.data.local.entity.SubstanceEntryEntity
import com.example.data.repository.CalendarRepository
import com.example.data.sample.SampleData
import com.example.domain.model.NoteEntry
import com.example.domain.model.SubstanceEntry
import com.example.domain.model.SubstanceLibraryItem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.UUID

class RoomCalendarRepository(
    private val calendarDao: CalendarDao
) : CalendarRepository {

    override fun getSubstanceEntries(): Flow<List<SubstanceEntry>> {
        return calendarDao.getAllSubstances().map { list ->
            list.map { it.toDomain() }
        }
    }

    override fun getNoteEntries(): Flow<List<NoteEntry>> {
        return calendarDao.getAllNotes().map { list ->
            list.map { it.toDomain() }
        }
    }

    override fun getSubstanceLibrary(): List<SubstanceLibraryItem> {
        return SampleData.substanceLibrary
    }

    override suspend fun addSubstanceEntry(entry: SubstanceEntry) {
        val entryWithId = if (entry.id.isBlank()) entry.copy(id = "sub_${UUID.randomUUID()}") else entry
        calendarDao.insertSubstance(SubstanceEntryEntity.fromDomain(entryWithId))
    }

    override suspend fun addNoteEntry(entry: NoteEntry) {
        val entryWithId = if (entry.id.isBlank()) entry.copy(id = "note_${UUID.randomUUID()}") else entry
        calendarDao.insertNote(NoteEntryEntity.fromDomain(entryWithId))
    }

    override suspend fun deleteSubstanceEntry(id: String) {
        calendarDao.deleteSubstanceById(id)
    }

    override suspend fun deleteNoteEntry(id: String) {
        calendarDao.deleteNoteById(id)
    }
}
