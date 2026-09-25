package com.example.data.local.dao

import androidx.room.*
import com.example.data.local.entity.NoteEntryEntity
import com.example.data.local.entity.SubstanceEntryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CalendarDao {

    // Substance Entries
    @Query("SELECT * FROM substance_entries ORDER BY dateIso DESC, timeStr DESC")
    fun getAllSubstances(): Flow<List<SubstanceEntryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSubstance(substance: SubstanceEntryEntity)

    @Query("DELETE FROM substance_entries WHERE id = :id")
    suspend fun deleteSubstanceById(id: String)

    // Note Entries
    @Query("SELECT * FROM note_entries ORDER BY dateIso DESC, timeStr DESC")
    fun getAllNotes(): Flow<List<NoteEntryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNote(note: NoteEntryEntity)

    @Query("DELETE FROM note_entries WHERE id = :id")
    suspend fun deleteNoteById(id: String)
}
