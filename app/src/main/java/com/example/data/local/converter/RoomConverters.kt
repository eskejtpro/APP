package com.example.data.local.converter

import androidx.room.TypeConverter
import com.example.domain.model.*
import org.json.JSONArray
import org.json.JSONObject

class RoomConverters {

    // --- ENUMS ---

    @TypeConverter
    fun fromExerciseCategory(category: ExerciseCategory?): String? {
        return category?.name
    }

    @TypeConverter
    fun toExerciseCategory(name: String?): ExerciseCategory? {
        return name?.let {
            try {
                ExerciseCategory.valueOf(it)
            } catch (e: IllegalArgumentException) {
                ExerciseCategory.POZOSTALE
            }
        }
    }

    @TypeConverter
    fun fromDayPlanType(type: DayPlanType?): String? {
        return type?.name
    }

    @TypeConverter
    fun toDayPlanType(name: String?): DayPlanType? {
        return name?.let {
            try {
                DayPlanType.valueOf(it)
            } catch (e: IllegalArgumentException) {
                DayPlanType.NO_PLAN
            }
        }
    }

    @TypeConverter
    fun fromCompletionStatus(status: CompletionStatus?): String? {
        return status?.name
    }

    @TypeConverter
    fun toCompletionStatus(name: String?): CompletionStatus? {
        return name?.let {
            try {
                CompletionStatus.valueOf(it)
            } catch (e: IllegalArgumentException) {
                CompletionStatus.NIEROZSTRZYGNIETY
            }
        }
    }

    @TypeConverter
    fun fromCycleType(type: CycleType?): String? {
        return type?.name
    }

    @TypeConverter
    fun toCycleType(name: String?): CycleType? {
        return name?.let {
            try {
                CycleType.valueOf(it)
            } catch (e: IllegalArgumentException) {
                CycleType.WEEKLY
            }
        }
    }

    @TypeConverter
    fun fromStartScreenOption(option: StartScreenOption?): String? {
        return option?.name
    }

    @TypeConverter
    fun toStartScreenOption(name: String?): StartScreenOption? {
        return name?.let {
            try {
                StartScreenOption.valueOf(it)
            } catch (e: IllegalArgumentException) {
                StartScreenOption.TODAY
            }
        }
    }

    // --- LIST OF STRINGS ---

    @TypeConverter
    fun fromStringList(list: List<String>?): String? {
        if (list == null) return null
        val array = JSONArray()
        for (item in list) {
            array.put(item)
        }
        return array.toString()
    }

    @TypeConverter
    fun toStringList(json: String?): List<String>? {
        if (json.isNullOrBlank()) return emptyList()
        val result = mutableListOf<String>()
        val array = JSONArray(json)
        for (i in 0 until array.length()) {
            result.add(array.getString(i))
        }
        return result
    }

    // --- LIST OF WORKOUT EXERCISES (ZŁOŻONA STRUKTURA SERII I ĆWICZEŃ) ---

    @TypeConverter
    fun fromWorkoutExerciseList(exercises: List<WorkoutExercise>?): String? {
        if (exercises == null) return null
        val exArray = JSONArray()
        for (ex in exercises) {
            val exObj = JSONObject().apply {
                put("exerciseId", ex.exerciseId)
                put("exerciseName", ex.exerciseName)
                put("category", ex.category.name)
                put("isSkipped", ex.isSkipped)
                put("isReplaced", ex.isReplaced)
                put("originalExerciseId", ex.originalExerciseId ?: "")
                put("notes", ex.notes)

                val setsArray = JSONArray()
                for (s in ex.sets) {
                    val setObj = JSONObject().apply {
                        put("setNumber", s.setNumber)
                        put("targetReps", s.targetReps)
                        put("actualReps", s.actualReps)
                        put("weightKg", s.weightKg)
                        if (s.isApproved != null) {
                            put("isApproved", s.isApproved)
                        } else {
                            put("isApproved", JSONObject.NULL)
                        }
                        put("notes", s.notes)
                    }
                    setsArray.put(setObj)
                }
                put("sets", setsArray)
            }
            exArray.put(exObj)
        }
        return exArray.toString()
    }

    @TypeConverter
    fun toWorkoutExerciseList(json: String?): List<WorkoutExercise>? {
        if (json.isNullOrBlank()) return emptyList()
        val result = mutableListOf<WorkoutExercise>()
        val exArray = JSONArray(json)
        for (i in 0 until exArray.length()) {
            val exObj = exArray.getJSONObject(i)
            val catName = exObj.optString("category", ExerciseCategory.POZOSTALE.name)
            val cat = try {
                ExerciseCategory.valueOf(catName)
            } catch (e: Exception) {
                ExerciseCategory.POZOSTALE
            }

            val setsArray = exObj.optJSONArray("sets") ?: JSONArray()
            val sets = mutableListOf<WorkoutSet>()
            for (j in 0 until setsArray.length()) {
                val sObj = setsArray.getJSONObject(j)
                val isApproved = if (sObj.isNull("isApproved")) null else sObj.getBoolean("isApproved")
                sets.add(
                    WorkoutSet(
                        setNumber = sObj.optInt("setNumber", j + 1),
                        targetReps = sObj.optInt("targetReps", 10),
                        actualReps = sObj.optInt("actualReps", 10),
                        weightKg = sObj.optDouble("weightKg", 0.0),
                        isApproved = isApproved,
                        notes = sObj.optString("notes", "")
                    )
                )
            }

            result.add(
                WorkoutExercise(
                    exerciseId = exObj.optString("exerciseId", ""),
                    exerciseName = exObj.optString("exerciseName", ""),
                    category = cat,
                    sets = sets,
                    isSkipped = exObj.optBoolean("isSkipped", false),
                    isReplaced = exObj.optBoolean("isReplaced", false),
                    originalExerciseId = exObj.optString("originalExerciseId", "").ifEmpty { null },
                    notes = exObj.optString("notes", "")
                )
            )
        }
        return result
    }
}
