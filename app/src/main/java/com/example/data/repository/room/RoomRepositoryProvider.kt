package com.example.data.repository.room

import android.content.Context
import com.example.data.local.database.AppDatabase
import com.example.data.local.seeder.DatabaseSeeder
import com.example.viewmodel.MainViewModel

class RoomRepositoryProvider(
    private val database: AppDatabase
) {
    val seeder = DatabaseSeeder(database)

    val exerciseRepository = RoomExerciseRepository(database.exerciseDao(), database)
    val planRepository = RoomPlanRepository(database.planDao())
    val workoutRepository = RoomWorkoutRepository(database.workoutDao())
    val calendarRepository = RoomCalendarRepository(database.calendarDao())
    val settingsRepository = RoomSettingsRepository(database.settingsDao())

    /**
     * Uruchamia asynchroniczne sprawdzenie i zasilenie bazy w tle (Dispatcher IO), nie blokując wątku głównego.
     */
    fun initializeData(coroutineScope: kotlinx.coroutines.CoroutineScope = kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO)) {
        coroutineScope.launch {
            seeder.seedIfEmpty()
        }
    }

    /**
     * Inicjalizuje dane początkowe w bazie jeśli jest pusta i zwraca gotowy ViewModel operujący na Room.
     */
    suspend fun createRoomViewModel(): MainViewModel {
        seeder.seedIfEmpty()
        return MainViewModel(
            exerciseRepository = exerciseRepository,
            planRepository = planRepository,
            workoutRepository = workoutRepository,
            calendarRepository = calendarRepository,
            settingsRepository = settingsRepository
        )
    }

    companion object {
        fun fromContext(context: Context): RoomRepositoryProvider {
            val db = AppDatabase.getInstance(context)
            return RoomRepositoryProvider(db)
        }
    }
}
