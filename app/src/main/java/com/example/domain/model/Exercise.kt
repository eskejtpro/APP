package com.example.domain.model

data class Exercise(
    val id: String,
    val name: String,
    val category: ExerciseCategory,
    val notes: String = "",
    val isCustom: Boolean = false
)
