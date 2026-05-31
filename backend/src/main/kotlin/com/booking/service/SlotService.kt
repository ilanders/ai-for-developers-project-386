package com.booking.service

import com.booking.availability.AvailabilityProvider
import com.booking.generated.model.*
import com.booking.plugins.AppError
import com.booking.storage.InMemoryStore
import kotlinx.datetime.*

class SlotService(
    private val store: InMemoryStore,
    private val availabilityProvider: AvailabilityProvider,
    private val timezone: TimeZone
) {
    fun getFreeSlots(eventTypeId: String): List<Slot> {
        val eventType = store.eventTypes[eventTypeId]
            ?: throw AppError.NotFound("Event type '${eventTypeId}' not found")

        val now = Clock.System.now()
        val today = now.toLocalDateTime(timezone).date
        val endDate = today.plus(com.booking.config.BookingConfig.availabilityWindowDays, DateTimeUnit.DAY)
        val bookedSlots = store.bookings

        val freeSlots = mutableListOf<Slot>()
        var currentDate = today
        while (currentDate <= endDate) {
            val windows = availabilityProvider.getAvailabilityWindows(currentDate, timezone)
            for (window in windows) {
                var slotStart = window.start
                while (true) {
                    val slotEnd = slotStart.plus(eventType.durationMinutes.toLong(), DateTimeUnit.MINUTE, timezone)
                    if (slotEnd > window.end) break

                    if (slotStart >= now && slotEnd <= window.end) {
                        val overlaps = bookedSlots.any { booking ->
                            slotStart < booking.endTime && slotEnd > booking.startTime
                        }
                        if (!overlaps) {
                            freeSlots.add(Slot(startTime = slotStart, endTime = slotEnd))
                        }
                    }
                    slotStart = slotEnd
                }
            }
            currentDate = currentDate.plus(1, DateTimeUnit.DAY)
        }

        return freeSlots
    }
}
