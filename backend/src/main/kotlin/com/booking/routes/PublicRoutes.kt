package com.booking.routes

import com.booking.generated.model.*
import com.booking.service.EventTypeService
import com.booking.service.BookingService
import com.booking.service.SlotService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.publicRoutes(
    eventTypeService: EventTypeService,
    slotService: SlotService,
    bookingService: BookingService
) {
    route("/api/public") {
        get("/event-types") {
            val eventTypes = eventTypeService.listEventTypes()
            call.respond(eventTypes)
        }

        get("/event-types/{eventTypeId}/slots") {
            val eventTypeId = call.parameters["eventTypeId"] ?: return@get
            val slots = slotService.getFreeSlots(eventTypeId)
            call.respond(slots)
        }

        post("/bookings") {
            val request = call.receive<CreateBookingRequest>()
            val booking = bookingService.createBooking(request)
            call.respond(HttpStatusCode.Created, booking)
        }
    }
}
