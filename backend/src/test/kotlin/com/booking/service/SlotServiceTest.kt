package com.booking.service

import com.booking.availability.DefaultAvailabilityProvider
import com.booking.generated.model.*
import com.booking.plugins.AppError
import com.booking.storage.InMemoryStore
import kotlinx.datetime.*
import kotlin.test.*

class SlotServiceTest {
    private val store = InMemoryStore()
    private val timezone = TimeZone.UTC
    private val provider = DefaultAvailabilityProvider()
    private val service = SlotService(store, provider, timezone)

    @BeforeTest
    fun setup() {
        store.eventTypes["quick"] = EventType(
            id = "quick",
            title = "Quick",
            description = "15 min",
            durationMinutes = 15
        )
    }

    @Test
    fun `getFreeSlots returns slots for valid event type`() {
        val slots = service.getFreeSlots("quick")
        assertTrue(slots.isNotEmpty())
        slots.forEach { slot ->
            val diff = slot.endTime - slot.startTime
            assertEquals(15 * 60_000_000_000, diff.inWholeNanoseconds)
        }
    }

    @Test
    fun `getFreeSlots throws NotFound for unknown event type`() {
        assertFailsWith<AppError.NotFound> {
            service.getFreeSlots("unknown")
        }
    }

    @Test
    fun `slots do not include past times`() {
        val slots = service.getFreeSlots("quick")
        val now = Clock.System.now()
        slots.forEach { slot ->
            assertTrue(slot.startTime > now)
        }
    }
}
