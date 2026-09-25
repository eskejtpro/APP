package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.domain.model.CycleType

@Entity(tableName = "training_cycles")
data class TrainingCycleEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val cycleType: CycleType,
    val startDateIso: String,
    val endDateIso: String,
    val isActive: Boolean = true,
    val rotationSequence: List<String> = emptyList(),
    val currentRotationIndex: Int = 0
)
