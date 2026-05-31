package com.booking.availability

import kotlinx.datetime.*

data class AvailabilityWindow(
    val start: Instant,
    val end: Instant
)

interface AvailabilityProvider {
    fun getAvailabilityWindows(date: LocalDate, timezone: TimeZone): List<AvailabilityWindow>
}
