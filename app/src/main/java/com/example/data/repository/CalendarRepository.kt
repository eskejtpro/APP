package com.example.data.repository

import com.example.data.sample.SampleData
import com.example.domain.model.NoteEntry
import com.example.domain.model.SubstanceEntry
import com.example.domain.model.SubstanceLibraryItem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

interface CalendarRepository {
    fun getSubstanceEntries(): Flow<List<SubstanceEntry>>
    fun getNoteEntries(): Flow<List<NoteEntry>>
    fun getSubstanceLibrary(): List<SubstanceLibraryItem>
    suspend fun addSubstanceEntry(entry: SubstanceEntry)
    suspend fun addNoteEntry(entry: NoteEntry)
    suspend fun deleteSubstanceEntry(id: String)
    suspend fun deleteNoteEntry(id: String)
}

class InMemoryCalendarRepository : CalendarRepository {
    private val _substances = MutableStateFlow<List<SubstanceEntry>>(SampleData.sampleSubstanceEntries)
    private val _notes = MutableStateFlow<List<NoteEntry>>(SampleData.sampleNotes)

    override fun getSubstanceEntries(): Flow<List<SubstanceEntry>> = _substances.asStateFlow()

    override fun getNoteEntries(): Flow<List<NoteEntry>> = _notes.asStateFlow()

    override fun getSubstanceLibrary(): List<SubstanceLibraryItem> = SampleData.substanceLibrary

    override suspend fun addSubstanceEntry(entry: SubstanceEntry) {
        val entryWithId = if (entry.id.isBlank()) entry.copy(id = "sub_${UUID.randomUUID()}") else entry
        _substances.value = listOf(entryWithId) + _substances.value
    }

    override suspend fun addNoteEntry(entry: NoteEntry) {
        val entryWithId = if (entry.id.isBlank()) entry.copy(id = "note_${UUID.randomUUID()}") else entry
        _notes.value = listOf(entryWithId) + _notes.value
    }

    override suspend fun deleteSubstanceEntry(id: String) {
        _substances.value = _substances.value.filterNot { it.id == id }
    }

    override suspend fun deleteNoteEntry(id: String) {
        _notes.value = _notes.value.filterNot { it.id == id }
    }
}
