package com.booking.routes

import com.booking.generated.model.*
import com.booking.service.EventTypeService
import com.booking.service.BookingService
import com.booking.storage.InMemoryStore
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.adminRoutes(
    store: InMemoryStore,
    eventTypeService: EventTypeService,
    bookingService: BookingService
) {
    route("/api/admin") {
        get("/owner") {
            call.respond(store.owner)
        }

        post("/event-types") {
            val request = call.receive<CreateEventTypeRequest>()
            val eventType = eventTypeService.createEventType(request)
            call.respond(HttpStatusCode.Created, eventType)
        }

        get("/event-types") {
            val eventTypes = eventTypeService.listEventTypes()
            call.respond(eventTypes)
        }

        get("/bookings") {
            val bookings = bookingService.listBookings()
            call.respond(bookings)
        }
    }
}
