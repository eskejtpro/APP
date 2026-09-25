package com.example.data.local.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.data.local.converter.RoomConverters
import com.example.data.local.dao.*
import com.example.data.local.entity.*

@Database(
    entities = [
        ExerciseEntity::class,
        WorkoutTemplateEntity::class,
        TrainingCycleEntity::class,
        DayScheduleEntryEntity::class,
        ActiveSessionDraftEntity::class,
        CompletedWorkoutSessionEntity::class,
        SubstanceEntryEntity::class,
        NoteEntryEntity::class,
        AppSettingsEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(RoomConverters::class)
abstract class AppDatabase : RoomDatabase() {

    abstract fun exerciseDao(): ExerciseDao
    abstract fun workoutDao(): WorkoutDao
    abstract fun planDao(): PlanDao
    abstract fun calendarDao(): CalendarDao
    abstract fun settingsDao(): SettingsDao

    companion object {
        private const val DATABASE_NAME = "plan_pasika_database.db"

        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    DATABASE_NAME
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }

        fun createInMemoryDatabase(context: Context): AppDatabase {
            return Room.inMemoryDatabaseBuilder(
                context.applicationContext,
                AppDatabase::class.java
            )
                .allowMainThreadQueries()
                .build()
        }
    }
}
