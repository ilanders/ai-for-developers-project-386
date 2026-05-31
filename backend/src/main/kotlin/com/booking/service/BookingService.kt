package com.booking.service

import com.booking.generated.model.*
import com.booking.plugins.AppError
import com.booking.storage.InMemoryStore
import kotlinx.datetime.*

class BookingService(
    private val store: InMemoryStore,
    private val slotService: SlotService,
    private val timezone: TimeZone
) {
    fun createBooking(request: CreateBookingRequest): Booking {
        val eventType = store.eventTypes[request.eventTypeId]
            ?: throw AppError.NotFound("Event type '${request.eventTypeId}' not found")

        validateGuestContact(request.guest)

        val now = Clock.System.now()
        if (request.startTime <= now) {
            throw AppError.Validation("startTime must be in the future", "startTime must be after current time")
        }

        val endTime = request.startTime.plus(eventType.durationMinutes.toLong(), DateTimeUnit.MINUTE, timezone)

        val freeSlots = slotService.getFreeSlots(request.eventTypeId)
        val isValidSlot = freeSlots.any { slot ->
            slot.startTime == request.startTime && slot.endTime == endTime
        }
        if (!isValidSlot) {
            throw AppError.Conflict("Requested slot is not available")
        }

        return store.addBooking(
            eventTypeId = request.eventTypeId,
            startTime = request.startTime,
            endTime = endTime,
            guest = request.guest
        )
    }

    fun listBookings(): List<Booking> {
        return store.bookings.toList()
    }

    private fun validateGuestContact(guest: GuestContact) {
        val errors = mutableListOf<String>()
        if (guest.name.isBlank()) errors.add("guest.name must not be blank")
        if (guest.email.isBlank()) errors.add("guest.email must not be blank")
        if (!guest.email.contains("@")) errors.add("guest.email must be a valid email")
        if (errors.isNotEmpty()) {
            throw AppError.Validation(errors.joinToString("; "), errors.joinToString(", "))
        }
    }
}
