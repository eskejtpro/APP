package com.example.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp

private val DarkColorScheme = darkColorScheme(
    primary = FitnessGreen,
    onPrimary = FitnessBackground,
    primaryContainer = FitnessGreenDark,
    onPrimaryContainer = FitnessGreenLight,
    secondary = FitnessCyan,
    onSecondary = FitnessBackground,
    secondaryContainer = FitnessSurfaceVariant,
    onSecondaryContainer = FitnessCyan,
    tertiary = FitnessPurple,
    background = FitnessBackground,
    onBackground = FitnessTextPrimary,
    surface = FitnessSurface,
    onSurface = FitnessTextPrimary,
    surfaceVariant = FitnessSurfaceVariant,
    onSurfaceVariant = FitnessTextSecondary,
    outline = FitnessBorder,
    outlineVariant = FitnessDivider,
    error = FitnessRed
)

val FitnessShapes = Shapes(
    extraSmall = RoundedCornerShape(6.dp),
    small = RoundedCornerShape(10.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(22.dp),
    extraLarge = RoundedCornerShape(28.dp)
)

@Composable
fun PlanPasikaTheme(
    content: @Composable () -> Unit
) {
    // Fitness app uses dedicated full dark mode
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        shapes = FitnessShapes,
        content = content
    )
}
