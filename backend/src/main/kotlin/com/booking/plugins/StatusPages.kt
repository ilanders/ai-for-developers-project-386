package com.booking.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import com.booking.generated.model.*

sealed class AppError(message: String) : Exception(message) {
    class NotFound(msg: String, val details: String? = null) : AppError(msg)
    class Conflict(msg: String, val details: String? = null) : AppError(msg)
    class Validation(msg: String, val details: String? = null) : AppError(msg)
}

fun Application.configureStatusPages() {
    install(StatusPages) {
        exception<AppError.NotFound> { call, cause ->
            call.respond(
                HttpStatusCode.NotFound,
                NotFoundError(code = NotFoundError.Code.NOT_FOUND, message = cause.message ?: "Not found", details = cause.details)
            )
        }
        exception<AppError.Conflict> { call, cause ->
            call.respond(
                HttpStatusCode.Conflict,
                ConflictError(code = ConflictError.Code.CONFLICT, message = cause.message ?: "Conflict", details = cause.details)
            )
        }
        exception<AppError.Validation> { call, cause ->
            call.respond(
                HttpStatusCode.UnprocessableEntity,
                ValidationError(code = ValidationError.Code.VALIDATION_ERROR, message = cause.message ?: "Validation error", details = cause.details)
            )
        }
    }
}
