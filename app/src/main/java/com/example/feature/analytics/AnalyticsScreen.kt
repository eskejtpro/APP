package com.example.feature.analytics

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.domain.model.ExerciseCategory
import com.example.ui.theme.*
import com.example.viewmodel.MainViewModel

@Composable
fun AnalyticsScreen(
    viewModel: MainViewModel
) {
    val analytics by viewModel.analytics.collectAsState()
    val activeCycle by viewModel.activeCycle.collectAsState()

    var selectedCycleTab by remember { mutableStateOf(0) } // 0 = Cały plan, 1 = Aktywny cykl

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitnessBackground)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // --- HEADER ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Analizy & Postępy",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = FitnessTextPrimary
                )
                Text(
                    text = "Rzeczywiste serie z ukończonych sesji",
                    style = MaterialTheme.typography.labelSmall,
                    color = FitnessGreen
                )
            }

            Surface(
                color = FitnessSurfaceVariant,
                shape = RoundedCornerShape(8.dp),
                border = BorderStroke(1.dp, FitnessBorder)
            ) {
                Text(
                    text = "v1.0 Offline",
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    style = MaterialTheme.typography.labelSmall,
                    color = FitnessTextTertiary
                )
            }
        }

        // --- CYCLE SELECTOR TABS ---
        Surface(
            color = FitnessSurface,
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, FitnessBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(modifier = Modifier.padding(4.dp)) {
                Surface(
                    color = if (selectedCycleTab == 0) FitnessGreen else Color.Transparent,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("tab_overall_plan")
                ) {
                    TextButton(onClick = { selectedCycleTab = 0 }) {
                        Text(
                            text = "Cały plan ogółem",
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = if (selectedCycleTab == 0) FitnessBackground else FitnessTextSecondary
                            )
                        )
                    }
                }

                Surface(
                    color = if (selectedCycleTab == 1) FitnessGreen else Color.Transparent,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("tab_active_cycle")
                ) {
                    TextButton(onClick = { selectedCycleTab = 1 }) {
                        Text(
                            text = activeCycle?.name?.take(16) ?: "Aktywny cykl",
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = if (selectedCycleTab == 1) FitnessBackground else FitnessTextSecondary
                            )
                        )
                    }
                }
            }
        }

        // --- 4 KEY METRIC CARDS ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricBox(
                modifier = Modifier.weight(1f),
                title = "Wykonane serie",
                value = "${analytics.totalSetsCount}",
                unit = "serii",
                icon = Icons.Default.Repeat,
                tint = FitnessGreen
            )
            MetricBox(
                modifier = Modifier.weight(1f),
                title = "Treningi",
                value = "${analytics.totalWorkoutsCount}",
                unit = "ukończonych",
                icon = Icons.Default.FitnessCenter,
                tint = FitnessCyan
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            val hours = analytics.totalDurationMinutes / 60
            val minutes = analytics.totalDurationMinutes % 60
            MetricBox(
                modifier = Modifier.weight(1f),
                title = "Czas treningu",
                value = "${hours}h ${minutes}m",
                unit = "łącznie",
                icon = Icons.Default.Timer,
                tint = FitnessPurple
            )
            MetricBox(
                modifier = Modifier.weight(1f),
                title = "Średnia sesja",
                value = "${analytics.averageSessionDurationMinutes}",
                unit = "minut",
                icon = Icons.Default.Speed,
                tint = FitnessAmber
            )
        }

        // --- 7 CATEGORIES DISTRIBUTION ---
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("analytics_categories_card"),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = FitnessSurface),
            border = BorderStroke(1.dp, FitnessBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Column {
                    Text(
                        text = "Rozkład serii wg 7 kategorii głównych",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = FitnessTextPrimary
                    )
                    Text(
                        text = "Zasada: Dokładnie jedna wykonana seria liczona jest tylko jeden raz.",
                        style = MaterialTheme.typography.labelSmall,
                        color = FitnessTextTertiary
                    )
                }

                analytics.categoryBreakdown.forEach { catItem ->
                    CategoryProgressBar(
                        categoryName = catItem.category.displayName,
                        count = catItem.completedSetsCount,
                        percentage = catItem.percentage
                    )
                }
            }
        }

        // --- STATYSTYKI MIESIĘCZNE ---
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("monthly_stats_card"),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = FitnessSurface),
            border = BorderStroke(1.dp, FitnessBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Statystyki miesięczne",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = FitnessTextPrimary
                )

                analytics.monthlyStats.forEach { month ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(FitnessSurfaceVariant)
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = month.monthName,
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                color = FitnessTextPrimary
                            )
                            Text(
                                text = "${month.completedWorkoutsCount} treningów • ${month.totalSetsCount} serii",
                                style = MaterialTheme.typography.bodySmall,
                                color = FitnessTextSecondary
                            )
                        }

                        Surface(
                            color = FitnessGreen.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "${month.totalDurationMinutes / 60}h ${month.totalDurationMinutes % 60}m",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                color = FitnessGreen
                            )
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(30.dp))
    }
}

@Composable
private fun MetricBox(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    unit: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    tint: Color
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = FitnessSurface),
        border = BorderStroke(1.dp, FitnessBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(title, style = MaterialTheme.typography.labelSmall, color = FitnessTextSecondary)
                Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(18.dp))
            }
            Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = FitnessTextPrimary
                )
                Text(
                    text = unit,
                    style = MaterialTheme.typography.labelSmall,
                    color = FitnessTextTertiary,
                    modifier = Modifier.padding(bottom = 3.dp)
                )
            }
        }
    }
}

@Composable
private fun CategoryProgressBar(
    categoryName: String,
    count: Int,
    percentage: Float
) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(categoryName, style = MaterialTheme.typography.bodySmall, color = FitnessTextPrimary)
            Text(
                text = "$count serii (${percentage.toInt()}%)",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = FitnessGreen
            )
        }
        LinearProgressIndicator(
            progress = { (percentage / 100f).coerceIn(0f, 1f) },
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp)),
            color = FitnessGreen,
            trackColor = FitnessSurfaceVariant
        )
    }
}
