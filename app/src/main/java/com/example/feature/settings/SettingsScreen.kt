package com.example.feature.settings

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
import com.example.domain.model.StartScreenOption
import com.example.ui.theme.*
import com.example.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun SettingsScreen(
    viewModel: MainViewModel,
    onNavigateBack: () -> Unit
) {
    val settings by viewModel.appSettings.collectAsState()

    var showBackupResultDialog by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitnessBackground)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // --- TOP BAR ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Wróć", tint = FitnessTextPrimary)
            }
            Spacer(Modifier.width(8.dp))
            Column {
                Text(
                    text = "Kopie & Ustawienia",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = FitnessTextPrimary
                )
                Text(
                    text = "PlanPasika.v1 • Architektura Offline-First",
                    style = MaterialTheme.typography.labelSmall,
                    color = FitnessGreen
                )
            }
        }

        // --- EKRAN STARTOWY ---
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("start_screen_settings_card"),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = FitnessSurface),
            border = BorderStroke(1.dp, FitnessBorder)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Default.Home, contentDescription = null, tint = FitnessGreen)
                    Text(
                        text = "Konfiguracja ekranu startowego",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = FitnessTextPrimary
                    )
                }

                Text(
                    text = "Wybierz, który moduł ma się otwierać domyślnie po uruchomieniu aplikacji:",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitnessTextSecondary
                )

                StartScreenOption.entries.forEach { option ->
                    Surface(
                        color = if (settings.defaultStartScreen == option) FitnessSurfaceVariant else Color.Transparent,
                        border = BorderStroke(
                            1.dp,
                            if (settings.defaultStartScreen == option) FitnessGreen else FitnessBorder
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("start_screen_option_${option.route}")
                    ) {
                        TextButton(
                            onClick = { viewModel.updateStartScreen(option) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = option.displayName,
                                    color = if (settings.defaultStartScreen == option) FitnessGreen else FitnessTextPrimary,
                                    fontWeight = if (settings.defaultStartScreen == option) FontWeight.Bold else FontWeight.Normal
                                )
                                if (settings.defaultStartScreen == option) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = FitnessGreen)
                                }
                            }
                        }
                    }
                }
            }
        }

        // --- PRZYPOMNIENIE O PRZERWANEJ SESJI ---
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("reminder_settings_card"),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = FitnessSurface),
            border = BorderStroke(1.dp, FitnessBorder)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Default.Alarm, contentDescription = null, tint = FitnessAmber)
                    Text(
                        text = "Przypomnienie o przerwanej sesji",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = FitnessTextPrimary
                    )
                }

                Text(
                    text = "Przypomnienie proponuje wznowienie, zakończenie albo archiwizację (nigdy automatyczne usunięcie). Domyślnie 3 dni.",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitnessTextSecondary
                )

                val reminderOptions = listOf(
                    1 to "1 dzień",
                    2 to "2 dni",
                    3 to "3 dni (domyślnie)",
                    7 to "7 dni",
                    -1 to "Wyłączone"
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    reminderOptions.take(3).forEach { (days, label) ->
                        FilterChip(
                            selected = settings.interruptedReminderDays == days,
                            onClick = { viewModel.updateReminderDays(days) },
                            label = { Text(label, fontSize = 10.sp) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    reminderOptions.drop(3).forEach { (days, label) ->
                        FilterChip(
                            selected = settings.interruptedReminderDays == days,
                            onClick = { viewModel.updateReminderDays(days) },
                            label = { Text(label, fontSize = 11.sp) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        // --- KOPIE I DANE (LOKALNE & BEZPIECZNE) ---
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("backup_settings_card"),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = FitnessSurface),
            border = BorderStroke(1.dp, FitnessBorder)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Default.Storage, contentDescription = null, tint = FitnessCyan)
                    Text(
                        text = "Lokalne kopie & Eksport",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = FitnessTextPrimary
                    )
                }

                Text(
                    text = "Aplikacja w wersji 1.0 działa w 100% offline. Dane są przechowywane wyłącznie na urządzeniu i przetrwają ponowne uruchomienie. Brak Firebase, logowania, serwerów i synchronizacji w chmurze.",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitnessTextSecondary
                )

                settings.lastLocalBackupTimestamp?.let { ts ->
                    val sdf = SimpleDateFormat("dd.MM.yyyy HH:mm", Locale.getDefault())
                    Text(
                        text = "Ostatnia lokalna kopia: ${sdf.format(Date(ts))}",
                        style = MaterialTheme.typography.labelSmall,
                        color = FitnessTextTertiary
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            viewModel.createLocalBackup()
                            showBackupResultDialog = "Utworzono kompletną lokalną kopię bazy danych SQLite/Room."
                        },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("create_local_backup_button"),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = FitnessGreen,
                            contentColor = FitnessBackground
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Kopia lokalna", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = {
                            viewModel.exportEncryptedBackup()
                            showBackupResultDialog = "Wygenerowano zaszyfrowany plik eksportu (.bak) do bezpiecznego przeniesienia."
                        },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("export_encrypted_backup_button"),
                        shape = RoundedCornerShape(10.dp),
                        border = BorderStroke(1.dp, FitnessBorder)
                    ) {
                        Icon(Icons.Default.Lock, contentDescription = null, tint = FitnessCyan, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Eksport .bak", fontSize = 12.sp, color = FitnessTextPrimary)
                    }
                }
            }
        }

        Spacer(Modifier.height(30.dp))
    }

    showBackupResultDialog?.let { msg ->
        AlertDialog(
            onDismissRequest = { showBackupResultDialog = null },
            icon = { Icon(Icons.Default.CheckCircle, contentDescription = null, tint = FitnessGreen) },
            title = { Text("Operacja zakończona sukcesem") },
            text = { Text(msg, style = MaterialTheme.typography.bodyMedium, color = FitnessTextSecondary) },
            confirmButton = {
                Button(
                    onClick = { showBackupResultDialog = null },
                    colors = ButtonDefaults.buttonColors(containerColor = FitnessGreen, contentColor = FitnessBackground)
                ) {
                    Text("OK")
                }
            }
        )
    }
}
