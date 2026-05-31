package com.booking.api

import com.booking.generated.model.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlinx.datetime.*
import kotlin.test.*

class PublicRoutesTest {

    @Test
    fun `GET public event-types returns list`() = testApplication {
        application { testModule() }
        client.post("/api/admin/event-types") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(CreateEventTypeRequest("test-1", "Test", "Desc", 30)))
        }
        val response = client.get("/api/public/event-types")
        assertEquals(HttpStatusCode.OK, response.status)
        val list = body<List<EventType>>(response)
        assertEquals(1, list.size)
    }

    @Test
    fun `GET free slots returns slots for valid event type`() = testApplication {
        application { testModule() }
        client.post("/api/admin/event-types") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(CreateEventTypeRequest("meeting", "Meeting", "45 min meeting", 45)))
        }
        val response = client.get("/api/public/event-types/meeting/slots")
        assertEquals(HttpStatusCode.OK, response.status)
        val slots = body<List<Slot>>(response)
        assertTrue(slots.isNotEmpty())
    }

    @Test
    fun `GET free slots for unknown event type returns 404`() = testApplication {
        application { testModule() }
        val response = client.get("/api/public/event-types/nonexistent/slots")
        assertEquals(HttpStatusCode.NotFound, response.status)
        val error = body<NotFoundError>(response)
        assertEquals(NotFoundError.Code.NOT_FOUND, error.code)
    }

    @Test
    fun `POST create booking succeeds`() = testApplication {
        application { testModule() }
        client.post("/api/admin/event-types") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(CreateEventTypeRequest("book-test", "Booking Test", "Test", 30)))
        }
        val slotsResponse = client.get("/api/public/event-types/book-test/slots")
        val slots = body<List<Slot>>(slotsResponse)
        assertTrue(slots.isNotEmpty())
        val targetSlot = slots.first()

        val response = client.post("/api/public/bookings") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(CreateBookingRequest(
                eventTypeId = "book-test",
                startTime = targetSlot.startTime,
                guest = GuestContact(name = "John", email = "john@example.com")
            )))
        }
        assertEquals(HttpStatusCode.Created, response.status)
        val booking = body<Booking>(response)
        assertEquals("book-test", booking.eventTypeId)
        assertEquals("John", booking.guest.name)
        assertEquals(targetSlot.startTime, booking.startTime)
    }

    @Test
    fun `POST create booking with unknown event type returns 404`() = testApplication {
        application { testModule() }
        val response = client.post("/api/public/bookings") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(CreateBookingRequest(
                eventTypeId = "ghost",
                startTime = Clock.System.now().plus(1, DateTimeUnit.DAY, TimeZone.UTC),
                guest = GuestContact(name = "Jane", email = "jane@test.com")
            )))
        }
        assertEquals(HttpStatusCode.NotFound, response.status)
    }

    @Test
    fun `POST create booking with invalid guest returns 422`() = testApplication {
        application { testModule() }
        client.post("/api/admin/event-types") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(CreateEventTypeRequest("valid-et", "Valid", "Desc", 30)))
        }
        val response = client.post("/api/public/bookings") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(CreateBookingRequest(
                eventTypeId = "valid-et",
                startTime = Clock.System.now().plus(1, DateTimeUnit.DAY, TimeZone.UTC),
                guest = GuestContact(name = "", email = "bad")
            )))
        }
        assertEquals(HttpStatusCode.UnprocessableEntity, response.status)
    }
}
