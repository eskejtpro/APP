package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.domain.model.Exercise
import com.example.domain.model.ExerciseCategory

@Entity(tableName = "exercises")
data class ExerciseEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val category: ExerciseCategory,
    val notes: String = "",
    val isCustom: Boolean = false
) {
    fun toDomain(): Exercise = Exercise(
        id = id,
        name = name,
        category = category,
        notes = notes,
        isCustom = isCustom
    )

    companion object {
        fun fromDomain(domain: Exercise): ExerciseEntity = ExerciseEntity(
            id = domain.id,
            name = domain.name,
            category = domain.category,
            notes = domain.notes,
            isCustom = domain.isCustom
        )
    }
}
