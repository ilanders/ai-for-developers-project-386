package com.booking.api

import io.ktor.client.statement.*
import kotlinx.serialization.json.Json

val testJson = Json {
    ignoreUnknownKeys = true
    isLenient = true
}

suspend inline fun <reified T> body(response: HttpResponse): T =
    testJson.decodeFromString(response.bodyAsText())
