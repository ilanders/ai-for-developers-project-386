package com.booking.availability

import com.booking.generated.model.AvailabilitySettings
import com.booking.storage.InMemoryStore
import kotlinx.datetime.*

class ConfigurableAvailabilityProvider(
    private val store: InMemoryStore
) : AvailabilityProvider {

    private fun parseTime(value: String): LocalTime {
        val normalized = if (value.count { it == ':' } == 1) "$value:00" else value
        return LocalTime.parse(normalized)
    }

    override fun getAvailabilityWindows(date: LocalDate, timezone: TimeZone): List<AvailabilityWindow> {
        val settings = store.availabilitySettings

        val override = settings.overrides.find { it.date == date }
        if (override != null) {
            if (override.isHoliday) return emptyList()
            return override.windows.map { window ->
                val startTime = parseTime(window.startTime)
                val endTime = parseTime(window.endTime)
                AvailabilityWindow(
                    start = LocalDateTime(date, startTime).toInstant(timezone),
                    end = LocalDateTime(date, endTime).toInstant(timezone)
                )
            }
        }

        val dayOfWeek = date.dayOfWeek.isoDayNumber
        val dayWindows = settings.windows.filter { it.dayOfWeek == dayOfWeek }
        if (dayWindows.isEmpty()) return emptyList()

        val dayBreaks = settings.breaks.filter { it.dayOfWeek == dayOfWeek }

        val windows = dayWindows.map { window ->
            val startTime = parseTime(window.startTime)
            val endTime = parseTime(window.endTime)
            AvailabilityWindow(
                start = LocalDateTime(date, startTime).toInstant(timezone),
                end = LocalDateTime(date, endTime).toInstant(timezone)
            )
        }

        if (dayBreaks.isEmpty()) return windows

        val breakPeriods = dayBreaks.map { break_ ->
            val startTime = parseTime(break_.startTime)
            val endTime = parseTime(break_.endTime)
            InstantRange(
                start = LocalDateTime(date, startTime).toInstant(timezone),
                endInclusive = LocalDateTime(date, endTime).toInstant(timezone)
            )
        }

        return windows.flatMap { window ->
            var current = listOf(window)
            for (breakPeriod in breakPeriods) {
                current = current.flatMap { w -> subtractBreak(w, breakPeriod) }
            }
            current
        }
    }

    private data class InstantRange(val start: Instant, val endInclusive: Instant)

    private fun subtractBreak(window: AvailabilityWindow, breakPeriod: InstantRange): List<AvailabilityWindow> {
        if (breakPeriod.endInclusive <= window.start || breakPeriod.start >= window.end) {
            return listOf(window)
        }

        val result = mutableListOf<AvailabilityWindow>()

        if (breakPeriod.start > window.start) {
            result.add(AvailabilityWindow(window.start, breakPeriod.start))
        }

        if (breakPeriod.endInclusive < window.end) {
            result.add(AvailabilityWindow(breakPeriod.endInclusive, window.end))
        }

        return result
    }
}
