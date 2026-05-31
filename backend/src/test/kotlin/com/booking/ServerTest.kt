package com.booking

import com.booking.api.testModule
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.*

class ServerTest {
    @Test
    fun `server root returns 404`() = testApplication {
        application { testModule() }
        assertEquals(HttpStatusCode.NotFound, client.get("/").status)
    }
}
