package com.booking.service

import com.booking.generated.model.*
import com.booking.plugins.AppError
import com.booking.storage.InMemoryStore

class EventTypeService(private val store: InMemoryStore) {
    fun createEventType(request: CreateEventTypeRequest): EventType {
        validateCreateEventTypeRequest(request)
        val eventType = EventType(
            id = request.id,
            title = request.title,
            description = request.description,
            durationMinutes = request.durationMinutes
        )
        return store.addEventType(eventType)
    }

    fun listEventTypes(): List<EventType> {
        return store.eventTypes.values.toList()
    }

    private fun validateCreateEventTypeRequest(request: CreateEventTypeRequest) {
        val errors = mutableListOf<String>()
        if (request.id.isBlank()) errors.add("id must not be blank")
        if (request.title.isBlank()) errors.add("title must not be blank")
        if (request.description.isBlank()) errors.add("description must not be blank")
        if (request.durationMinutes <= 0) errors.add("durationMinutes must be greater than 0")
        if (errors.isNotEmpty()) {
            throw AppError.Validation(errors.joinToString("; "), errors.joinToString(", "))
        }
    }
}
