package com.example.data.local.dao

import androidx.room.*
import com.example.data.local.entity.DayScheduleEntryEntity
import com.example.data.local.entity.TrainingCycleEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PlanDao {

    @Query("SELECT * FROM training_cycles WHERE isActive = 1 LIMIT 1")
    fun getActiveCycle(): Flow<TrainingCycleEntity?>

    @Query("SELECT COUNT(*) FROM training_cycles")
    suspend fun getCycleCount(): Int

    @Query("SELECT * FROM training_cycles ORDER BY startDateIso DESC")
    fun getAllCycles(): Flow<List<TrainingCycleEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCycle(cycle: TrainingCycleEntity)

    @Update
    suspend fun updateCycle(cycle: TrainingCycleEntity)

    // Schedule Entries
    @Query("SELECT * FROM day_schedule_entries WHERE cycleId = :cycleId ORDER BY dateIso ASC")
    fun getEntriesForCycle(cycleId: String): Flow<List<DayScheduleEntryEntity>>

    @Query("SELECT * FROM day_schedule_entries WHERE cycleId = :cycleId ORDER BY dateIso ASC")
    suspend fun getEntriesForCycleSync(cycleId: String): List<DayScheduleEntryEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateEntry(entry: DayScheduleEntryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateEntries(entries: List<DayScheduleEntryEntity>)
}
