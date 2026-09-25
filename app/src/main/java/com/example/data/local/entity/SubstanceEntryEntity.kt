package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.domain.model.SubstanceEntry

@Entity(tableName = "substance_entries")
data class SubstanceEntryEntity(
    @PrimaryKey
    val id: String,
    val dateIso: String,
    val timeStr: String,
    val substanceName: String,
    val manualInfo: String,
    val isVerifiedByUser: Boolean = false
) {
    fun toDomain(): SubstanceEntry = SubstanceEntry(
        id = id,
        dateIso = dateIso,
        timeStr = timeStr,
        substanceName = substanceName,
        manualInfo = manualInfo,
        isVerifiedByUser = isVerifiedByUser
    )

    companion object {
        fun fromDomain(domain: SubstanceEntry): SubstanceEntryEntity = SubstanceEntryEntity(
            id = domain.id,
            dateIso = domain.dateIso,
            timeStr = domain.timeStr,
            substanceName = domain.substanceName,
            manualInfo = domain.manualInfo,
            isVerifiedByUser = domain.isVerifiedByUser
        )
    }
}
