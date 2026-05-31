package com.booking.api

import com.booking.generated.model.*
import com.booking.plugins.configureRouting
import com.booking.plugins.configureSerialization
import com.booking.plugins.configureStatusPages
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.testing.*
import kotlin.test.*

fun Application.testModule() {
    configureSerialization()
    configureStatusPages()
    configureRouting()
}

class AdminRoutesTest {

    @Test
    fun `GET admin owner returns owner`() = testApplication {
        application { testModule() }
        val response = client.get("/api/admin/owner")
        assertEquals(HttpStatusCode.OK, response.status)
        val owner = body<Owner>(response)
        assertEquals("owner-1", owner.id)
        assertEquals("UTC", owner.timezone)
    }

    @Test
    fun `POST event-type creates event type`() = testApplication {
        application { testModule() }
        val request = CreateEventTypeRequest("consultation", "Consultation", "30 min consultation", 30)
        val response = client.post("/api/admin/event-types") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(request))
        }
        assertEquals(HttpStatusCode.Created, response.status)
        val eventType = body<EventType>(response)
        assertEquals("consultation", eventType.id)
        assertEquals(30, eventType.durationMinutes)
    }

    @Test
    fun `POST event-type duplicate id returns 409`() = testApplication {
        application { testModule() }
        val request = CreateEventTypeRequest("dup-1", "Duplicate", "Test duplicate", 30)
        client.post("/api/admin/event-types") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(request))
        }
        val response = client.post("/api/admin/event-types") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(request))
        }
        assertEquals(HttpStatusCode.Conflict, response.status)
        val error = body<ConflictError>(response)
        assertEquals(ConflictError.Code.CONFLICT, error.code)
    }

    @Test
    fun `POST event-type invalid data returns 422`() = testApplication {
        application { testModule() }
        val request = CreateEventTypeRequest("", "", "", 0)
        val response = client.post("/api/admin/event-types") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(request))
        }
        assertEquals(HttpStatusCode.UnprocessableEntity, response.status)
        val error = body<ValidationError>(response)
        assertEquals(ValidationError.Code.VALIDATION_ERROR, error.code)
    }

    @Test
    fun `GET event-types returns list`() = testApplication {
        application { testModule() }
        client.post("/api/admin/event-types") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(CreateEventTypeRequest("a", "A", "A desc", 30)))
        }
        client.post("/api/admin/event-types") {
            contentType(ContentType.Application.Json)
            setBody(testJson.encodeToString(CreateEventTypeRequest("b", "B", "B desc", 60)))
        }
        val response = client.get("/api/admin/event-types")
        assertEquals(HttpStatusCode.OK, response.status)
        val list = body<List<EventType>>(response)
        assertEquals(2, list.size)
    }

    @Test
    fun `GET admin bookings returns list`() = testApplication {
        application { testModule() }
        val response = client.get("/api/admin/bookings")
        assertEquals(HttpStatusCode.OK, response.status)
        val list = body<List<Booking>>(response)
        assertTrue(list.isEmpty())
    }
}
