package com.booking.config

import com.booking.generated.model.Owner

object BookingConfig {
    val owner = Owner(
        id = System.getenv("OWNER_ID") ?: "owner-1",
        displayName = System.getenv("OWNER_DISPLAY_NAME") ?: "Calendar Owner",
        timezone = System.getenv("OWNER_TIMEZONE") ?: "UTC"
    )
    val availabilityWindowDays = 14
}
