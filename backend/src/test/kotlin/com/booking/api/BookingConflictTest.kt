package com.booking.api

import com.booking.generated.model.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.*

class BookingConflictTest {

    @Test
    fun `double booking same slot returns 409`() = testApplication {
        application { testModule() }
        client.post("/api/admin/event-types") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(CreateEventTypeRequest("conflict-test", "Conflict Test", "Test", 60)))
        }

        val slotsResponse = client.get("/api/public/event-types/conflict-test/slots")
        val slots = body<List<Slot>>(slotsResponse)
        assertTrue(slots.isNotEmpty())
        val targetSlot = slots.first()

        val bookingJson = testJson.encodeToString(CreateBookingRequest(
            eventTypeId = "conflict-test",
            startTime = targetSlot.startTime,
            guest = GuestContact(name = "Alice", email = "alice@test.com")
        ))

        val firstResponse = client.post("/api/public/bookings") {
            contentType(ContentType.Application.Json)
            setBody(bookingJson)
        }
        assertEquals(HttpStatusCode.Created, firstResponse.status)

        val secondResponse = client.post("/api/public/bookings") {
            contentType(ContentType.Application.Json)
            setBody(bookingJson)
        }
        assertEquals(HttpStatusCode.Conflict, secondResponse.status)
        val error = body<ConflictError>(secondResponse)
        assertEquals(ConflictError.Code.CONFLICT, error.code)
    }
}
