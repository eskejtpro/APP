package com.example.data.local.dao

import androidx.room.*
import com.example.data.local.entity.ActiveSessionDraftEntity
import com.example.data.local.entity.CompletedWorkoutSessionEntity
import com.example.data.local.entity.WorkoutTemplateEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WorkoutDao {

    // Templates
    @Query("SELECT * FROM workout_templates")
    fun getAllTemplates(): Flow<List<WorkoutTemplateEntity>>

    @Query("SELECT COUNT(*) FROM workout_templates")
    suspend fun getTemplateCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTemplate(template: WorkoutTemplateEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTemplates(templates: List<WorkoutTemplateEntity>)

    // Active Draft
    @Query("SELECT * FROM active_session_draft WHERE id = :id LIMIT 1")
    fun getActiveDraft(id: String = ActiveSessionDraftEntity.SINGLETON_ID): Flow<ActiveSessionDraftEntity?>

    @Query("SELECT * FROM active_session_draft WHERE id = :id LIMIT 1")
    suspend fun getActiveDraftSync(id: String = ActiveSessionDraftEntity.SINGLETON_ID): ActiveSessionDraftEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateDraft(draft: ActiveSessionDraftEntity)

    @Query("DELETE FROM active_session_draft WHERE id = :id")
    suspend fun clearDraft(id: String = ActiveSessionDraftEntity.SINGLETON_ID)

    // Completed Sessions
    @Query("SELECT * FROM completed_workout_sessions ORDER BY dateIso DESC")
    fun getCompletedSessions(): Flow<List<CompletedWorkoutSessionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCompletedSession(session: CompletedWorkoutSessionEntity)
}
