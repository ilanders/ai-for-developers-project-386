package com.booking.availability

import kotlinx.datetime.*

class DefaultAvailabilityProvider : AvailabilityProvider {
    override fun getAvailabilityWindows(date: LocalDate, timezone: TimeZone): List<AvailabilityWindow> {
        val startOfDay = date.atStartOfDayIn(timezone)
        val endOfDay = LocalDateTime(date, LocalTime(23, 59)).toInstant(timezone)
        return listOf(AvailabilityWindow(start = startOfDay, end = endOfDay))
    }
}
