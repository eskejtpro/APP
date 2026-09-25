package com.example.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val testTag: String
) {
    object Today : Screen(
        route = "today",
        title = "Dzisiaj",
        selectedIcon = Icons.Filled.Today,
        unselectedIcon = Icons.Outlined.Today,
        testTag = "nav_item_today"
    )

    object Plans : Screen(
        route = "plans",
        title = "Plany",
        selectedIcon = Icons.Filled.EventNote,
        unselectedIcon = Icons.Outlined.EventNote,
        testTag = "nav_item_plans"
    )

    object Workout : Screen(
        route = "workout",
        title = "Trening",
        selectedIcon = Icons.Filled.FitnessCenter,
        unselectedIcon = Icons.Outlined.FitnessCenter,
        testTag = "nav_item_workout"
    )

    object Calendar : Screen(
        route = "calendar",
        title = "Kalendarz",
        selectedIcon = Icons.Filled.CalendarMonth,
        unselectedIcon = Icons.Outlined.CalendarMonth,
        testTag = "nav_item_calendar"
    )

    object Analytics : Screen(
        route = "analytics",
        title = "Analizy",
        selectedIcon = Icons.Filled.BarChart,
        unselectedIcon = Icons.Outlined.BarChart,
        testTag = "nav_item_analytics"
    )

    object Library : Screen(
        route = "library",
        title = "Biblioteka i Import",
        selectedIcon = Icons.Filled.Storage,
        unselectedIcon = Icons.Outlined.Storage,
        testTag = "nav_item_library"
    )

    object Settings : Screen(
        route = "settings",
        title = "Kopie i Ustawienia",
        selectedIcon = Icons.Filled.Settings,
        unselectedIcon = Icons.Outlined.Settings,
        testTag = "nav_item_settings"
    )

    companion object {
        val bottomNavItems = listOf(Today, Plans, Workout, Calendar, Analytics)
    }
}
