package com.example

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.feature.analytics.AnalyticsScreen
import com.example.feature.calendar.CalendarScreen
import com.example.feature.library.ExerciseLibraryScreen
import com.example.feature.plans.PlansScreen
import com.example.feature.settings.SettingsScreen
import com.example.feature.today.TodayScreen
import com.example.feature.workout.WorkoutScreen
import com.example.navigation.Screen
import com.example.ui.theme.*
import com.example.viewmodel.MainViewModel
import kotlinx.coroutines.flow.collectLatest

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlanPasikaApp(
    mainViewModel: MainViewModel = viewModel()
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Today.route

    val appSettings by mainViewModel.appSettings.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    // Listen for toast messages from ViewModel
    LaunchedEffect(mainViewModel) {
        mainViewModel.userMessage.collectLatest { message ->
            snackbarHostState.showSnackbar(message)
        }
    }

    val isTopLevelDestination = Screen.bottomNavItems.any { it.route == currentRoute }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = FitnessBackground,
        snackbarHost = {
            SnackbarHost(
                hostState = snackbarHostState,
                snackbar = { data ->
                    Snackbar(
                        snackbarData = data,
                        containerColor = FitnessSurfaceVariant,
                        contentColor = FitnessTextPrimary,
                        shape = FitnessShapes.medium
                    )
                }
            )
        },
        topBar = {
            if (isTopLevelDestination) {
                TopAppBar(
                    title = {
                        Row(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = "PlanPasika",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = FitnessTextPrimary
                            )
                            Text(
                                text = ".v1",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = FitnessGreen
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = FitnessBackground,
                        titleContentColor = FitnessTextPrimary
                    ),
                    actions = {
                        IconButton(
                            onClick = { navController.navigate(Screen.Library.route) },
                            modifier = Modifier.testTag("top_bar_library_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Storage,
                                contentDescription = "Biblioteka ćwiczeń",
                                tint = FitnessCyan
                            )
                        }
                        IconButton(
                            onClick = { navController.navigate(Screen.Settings.route) },
                            modifier = Modifier.testTag("top_bar_settings_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Settings,
                                contentDescription = "Ustawienia i kopie",
                                tint = FitnessTextSecondary
                            )
                        }
                    }
                )
            }
        },
        bottomBar = {
            if (isTopLevelDestination) {
                NavigationBar(
                    containerColor = FitnessSurface,
                    contentColor = FitnessTextSecondary,
                    tonalElevation = 0.dp,
                    windowInsets = WindowInsets.navigationBars
                ) {
                    Screen.bottomNavItems.forEach { screen ->
                        val selected = currentRoute == screen.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                if (currentRoute != screen.route) {
                                    navController.navigate(screen.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = if (selected) screen.selectedIcon else screen.unselectedIcon,
                                    contentDescription = screen.title
                                )
                            },
                            label = {
                                Text(
                                    text = screen.title,
                                    fontSize = 11.sp,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = FitnessBackground,
                                unselectedIconColor = FitnessTextTertiary,
                                selectedTextColor = FitnessGreen,
                                unselectedTextColor = FitnessTextTertiary,
                                indicatorColor = FitnessGreen
                            ),
                            modifier = Modifier.testTag(screen.testTag)
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = appSettings.defaultStartScreen.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            composable(Screen.Today.route) {
                TodayScreen(
                    viewModel = mainViewModel,
                    onNavigateToWorkout = { navController.navigate(Screen.Workout.route) },
                    onNavigateToCalendar = { navController.navigate(Screen.Calendar.route) },
                    onNavigateToPlans = { navController.navigate(Screen.Plans.route) }
                )
            }

            composable(Screen.Plans.route) {
                PlansScreen(
                    viewModel = mainViewModel,
                    onNavigateToWorkout = { navController.navigate(Screen.Workout.route) }
                )
            }

            composable(Screen.Workout.route) {
                WorkoutScreen(
                    viewModel = mainViewModel,
                    onFinishNavigateToAnalytics = { navController.navigate(Screen.Analytics.route) }
                )
            }

            composable(Screen.Calendar.route) {
                CalendarScreen(
                    viewModel = mainViewModel
                )
            }

            composable(Screen.Analytics.route) {
                AnalyticsScreen(
                    viewModel = mainViewModel
                )
            }

            composable(Screen.Library.route) {
                ExerciseLibraryScreen(
                    viewModel = mainViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    viewModel = mainViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }
    }
}
