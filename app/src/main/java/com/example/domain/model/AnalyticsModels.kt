package com.example.domain.model

data class CategorySetCount(
    val category: ExerciseCategory,
    val completedSetsCount: Int,
    val percentage: Float
)

data class CycleStats(
    val cycleId: String,
    val cycleName: String,
    val completedWorkoutsCount: Int,
    val totalSetsCount: Int,
    val totalDurationMinutes: Int,
    val categoryBreakdown: List<CategorySetCount>
)

data class MonthlyStats(
    val monthName: String,
    val completedWorkoutsCount: Int,
    val totalSetsCount: Int,
    val totalDurationMinutes: Int
)

data class OverallAnalytics(
    val totalWorkoutsCount: Int,
    val totalSetsCount: Int,
    val totalDurationMinutes: Int,
    val averageSessionDurationMinutes: Int,
    val categoryBreakdown: List<CategorySetCount>,
    val monthlyStats: List<MonthlyStats>,
    val cycleStatsList: List<CycleStats>
)
