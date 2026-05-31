package com.booking

import io.ktor.server.engine.*
import io.ktor.server.netty.*
import com.booking.plugins.*

fun main() {
    val port = System.getenv("PORT")?.toIntOrNull() ?: 4010
    embeddedServer(Netty, port = port, host = "0.0.0.0") {
        configureSerialization()
        configureStatusPages()
        configureRouting()
    }.start(wait = true)
}
