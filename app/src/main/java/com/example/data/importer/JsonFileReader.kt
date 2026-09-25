package com.example.data.importer

import android.content.ContentResolver
import android.net.Uri
import android.provider.OpenableColumns
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.nio.charset.StandardCharsets

sealed class FileReadResult {
    data class Success(val fileName: String, val content: String) : FileReadResult()
    data class Error(val message: String) : FileReadResult()
    data object Canceled : FileReadResult()
}

class JsonFileReader(
    private val contentResolver: ContentResolver? = null
) {
    companion object {
        /**
         * Maksymalny dopuszczalny rozmiar pliku importu danych treningowych: 10 MB.
         * Chroni przed wyczerpaniem pamięci RAM (OOM) oraz zawieszeniem aplikacji.
         */
        const val MAX_FILE_SIZE_BYTES: Long = 10L * 1024 * 1024
    }

    /**
     * Bezpiecznie odczytuje plik przez ContentResolver w tle (Dispatchers.IO).
     * Weryfikuje rozmiar pliku przed załadowaniem i dekoduje wyłącznie jako UTF-8.
     */
    suspend fun readFromUri(
        uri: Uri?,
        maxSizeBytes: Long = MAX_FILE_SIZE_BYTES
    ): FileReadResult = withContext(Dispatchers.IO) {
        if (uri == null) {
            return@withContext FileReadResult.Canceled
        }
        if (contentResolver == null) {
            return@withContext FileReadResult.Error("Brak dostępu do ContentResolver urządzenia.")
        }

        try {
            val fileName = getFileName(uri) ?: "plik.json"
            val declaredSize = getFileSize(uri)

            if (declaredSize != null && declaredSize > maxSizeBytes) {
                return@withContext FileReadResult.Error(
                    "Plik '$fileName' przekracza dopuszczalny limit rozmiaru 10 MB (rozmiar: ${declaredSize / 1024 / 1024} MB)."
                )
            }

            val inputStream = contentResolver.openInputStream(uri)
                ?: return@withContext FileReadResult.Error("Nie można otworzyć wskazanego pliku: $fileName")

            readStreamSafely(inputStream, fileName, maxSizeBytes)
        } catch (e: Exception) {
            FileReadResult.Error("Błąd odczytu pliku: ${e.localizedMessage ?: "Nieoczekiwany błąd wejścia/wyjścia"}")
        }
    }

    /**
     * Metoda do testów jednostkowych i bezpośredniego odczytu strumienia w pamięci.
     */
    fun readFromStream(
        inputStream: InputStream?,
        fileName: String = "plik.json",
        maxSizeBytes: Long = MAX_FILE_SIZE_BYTES
    ): FileReadResult {
        if (inputStream == null) {
            return FileReadResult.Error("Brak strumienia danych dla pliku: $fileName")
        }
        return try {
            readStreamSafely(inputStream, fileName, maxSizeBytes)
        } catch (e: Exception) {
            FileReadResult.Error("Błąd odczytu strumienia '$fileName': ${e.localizedMessage ?: "Błąd I/O"}")
        }
    }

    private fun readStreamSafely(
        inputStream: InputStream,
        fileName: String,
        maxSizeBytes: Long
    ): FileReadResult {
        return inputStream.use { stream ->
            val buffer = ByteArray(8192)
            val output = java.io.ByteArrayOutputStream()
            var totalBytesRead = 0L

            var bytesRead: Int
            while (stream.read(buffer).also { bytesRead = it } != -1) {
                totalBytesRead += bytesRead
                if (totalBytesRead > maxSizeBytes) {
                    return FileReadResult.Error(
                        "Plik '$fileName' przekracza dopuszczalny limit rozmiaru 10 MB."
                    )
                }
                output.write(buffer, 0, bytesRead)
            }

            val rawBytes = output.toByteArray()
            if (rawBytes.isEmpty()) {
                return FileReadResult.Error("Wybrany plik '$fileName' jest pusty (0 bajtów).")
            }

            val content = String(rawBytes, StandardCharsets.UTF_8)
            if (content.isBlank()) {
                FileReadResult.Error("Wybrany plik '$fileName' nie zawiera tekstu.")
            } else {
                FileReadResult.Success(fileName, content)
            }
        }
    }

    private fun getFileName(uri: Uri): String? {
        return try {
            contentResolver?.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (nameIndex != -1) cursor.getString(nameIndex) else null
                } else null
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun getFileSize(uri: Uri): Long? {
        return try {
            contentResolver?.query(uri, arrayOf(OpenableColumns.SIZE), null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
                    if (sizeIndex != -1 && !cursor.isNull(sizeIndex)) cursor.getLong(sizeIndex) else null
                } else null
            }
        } catch (e: Exception) {
            null
        }
    }
}
