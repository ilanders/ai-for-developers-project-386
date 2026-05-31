package com.booking.plugins

import com.booking.availability.DefaultAvailabilityProvider
import com.booking.service.*
import com.booking.storage.InMemoryStore
import io.ktor.server.application.*
import io.ktor.server.routing.*
import com.booking.routes.adminRoutes
import com.booking.routes.publicRoutes
import kotlinx.datetime.TimeZone

fun Application.configureRouting() {
    val store = InMemoryStore()
    val timezone = TimeZone.of(store.owner.timezone)
    val availabilityProvider = DefaultAvailabilityProvider()
    val slotService = SlotService(store, availabilityProvider, timezone)
    val eventTypeService = EventTypeService(store)
    val bookingService = BookingService(store, slotService, timezone)

    routing {
        adminRoutes(store, eventTypeService, bookingService)
        publicRoutes(eventTypeService, slotService, bookingService)
    }
}
