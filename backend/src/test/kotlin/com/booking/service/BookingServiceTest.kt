package com.booking.service

import com.booking.availability.DefaultAvailabilityProvider
import com.booking.generated.model.*
import com.booking.plugins.AppError
import com.booking.storage.InMemoryStore
import kotlinx.datetime.*
import kotlin.test.*

class BookingServiceTest {
    private val store = InMemoryStore()
    private val timezone = TimeZone.UTC
    private val provider = DefaultAvailabilityProvider()
    private val slotService = SlotService(store, provider, timezone)
    private val bookingService = BookingService(store, slotService, timezone)

    @BeforeTest
    fun setup() {
        store.eventTypes["test-et"] = EventType(
            id = "test-et",
            title = "Test Event",
            description = "Test",
            durationMinutes = 30
        )
    }

    @Test
    fun `createBooking succeeds with valid request`() {
        val slots = slotService.getFreeSlots("test-et")
        val targetSlot = slots.first()

        val booking = bookingService.createBooking(CreateBookingRequest(
            eventTypeId = "test-et",
            startTime = targetSlot.startTime,
            guest = GuestContact(name = "Test User", email = "test@example.com")
        ))
        assertEquals("test-et", booking.eventTypeId)
        assertEquals(targetSlot.startTime, booking.startTime)
        assertEquals(targetSlot.endTime, booking.endTime)
        assertEquals("Test User", booking.guest.name)
    }

    @Test
    fun `createBooking throws NotFound for unknown event type`() {
        assertFailsWith<AppError.NotFound> {
            bookingService.createBooking(CreateBookingRequest(
                eventTypeId = "ghost",
                startTime = Clock.System.now().plus(1, DateTimeUnit.DAY, TimeZone.UTC),
                guest = GuestContact(name = "X", email = "x@x.com")
            ))
        }
    }

    @Test
    fun `createBooking throws Validation for empty guest name`() {
        assertFailsWith<AppError.Validation> {
            bookingService.createBooking(CreateBookingRequest(
                eventTypeId = "test-et",
                startTime = Clock.System.now().plus(1, DateTimeUnit.DAY, TimeZone.UTC),
                guest = GuestContact(name = "", email = "x@x.com")
            ))
        }
    }

    @Test
    fun `createBooking throws Validation for invalid email`() {
        assertFailsWith<AppError.Validation> {
            bookingService.createBooking(CreateBookingRequest(
                eventTypeId = "test-et",
                startTime = Clock.System.now().plus(1, DateTimeUnit.DAY, TimeZone.UTC),
                guest = GuestContact(name = "User", email = "notanemail")
            ))
        }
    }

    @Test
    fun `createBooking throws Conflict for overlapping slot`() {
        val slots = slotService.getFreeSlots("test-et")
        val targetSlot = slots.first()

        bookingService.createBooking(CreateBookingRequest(
            eventTypeId = "test-et",
            startTime = targetSlot.startTime,
            guest = GuestContact(name = "First", email = "first@test.com")
        ))

        assertFailsWith<AppError.Conflict> {
            bookingService.createBooking(CreateBookingRequest(
                eventTypeId = "test-et",
                startTime = targetSlot.startTime,
                guest = GuestContact(name = "Second", email = "second@test.com")
            ))
        }
    }
}
