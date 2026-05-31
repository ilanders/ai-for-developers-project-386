package com.booking.storage

import com.booking.generated.model.*
import com.booking.plugins.AppError
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import java.util.UUID

class InMemoryStore {
    val owner: Owner = com.booking.config.BookingConfig.owner
    val eventTypes = mutableMapOf<String, EventType>()
    val bookings = mutableListOf<Booking>()

    fun addEventType(eventType: EventType): EventType {
        synchronized(eventTypes) {
            if (eventTypes.containsKey(eventType.id)) {
                throw AppError.Conflict("Event type with id '${eventType.id}' already exists")
            }
            eventTypes[eventType.id] = eventType
            return eventType
        }
    }

    fun addBooking(
        eventTypeId: String,
        startTime: Instant,
        endTime: Instant,
        guest: GuestContact
    ): Booking {
        synchronized(bookings) {
            val hasConflict = bookings.any { existing ->
                startTime < existing.endTime && endTime > existing.startTime
            }
            if (hasConflict) {
                throw AppError.Conflict("Slot is already booked")
            }
            val booking = Booking(
                id = UUID.randomUUID().toString(),
                eventTypeId = eventTypeId,
                startTime = startTime,
                endTime = endTime,
                guest = guest,
                createdAt = Clock.System.now()
            )
            bookings.add(booking)
            return booking
        }
    }
}
