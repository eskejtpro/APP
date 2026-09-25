package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.domain.model.WorkoutExercise
import com.example.domain.model.WorkoutTemplate

@Entity(tableName = "workout_templates")
data class WorkoutTemplateEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val description: String,
    val exercises: List<WorkoutExercise>
) {
    fun toDomain(): WorkoutTemplate = WorkoutTemplate(
        id = id,
        name = name,
        description = description,
        exercises = exercises
    )

    companion object {
        fun fromDomain(domain: WorkoutTemplate): WorkoutTemplateEntity = WorkoutTemplateEntity(
            id = domain.id,
            name = domain.name,
            description = domain.description,
            exercises = domain.exercises
        )
    }
}
