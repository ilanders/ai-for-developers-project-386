# Calendar Booking — Backend

Backend for the calendar booking application built with **Kotlin + Ktor + Netty**.

## Requirements

- JDK 21+
- Gradle Wrapper (included)

## Commands

```bash
# Run tests
./gradlew test

# Start server (default port: 4010)
./gradlew run

# Start server on custom port
PORT=8080 ./gradlew run
```

## API Endpoints

All endpoints are defined in the OpenAPI contract at `../tsp-output/@typespec/openapi3/openapi.yaml`.

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/owner | Owner profile |
| POST | /api/admin/event-types | Create event type |
| GET | /api/admin/event-types | List event types |
| GET | /api/admin/bookings | List all bookings |
| GET | /api/public/event-types | List public event types |
| GET | /api/public/event-types/{id}/slots | Free slots for 14 days |
| POST | /api/public/bookings | Create booking |

## DTO Generation

DTOs are auto-generated from the OpenAPI spec using `openapi-generator`. To regenerate:

```bash
./gradlew openApiGenerate
```

Generated code lives in `build/generated/` under `com.booking.generated.model`. Do not edit manually.

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| PORT | 4010 | Server port |
| OWNER_ID | owner-1 | Owner profile ID |
| OWNER_DISPLAY_NAME | Calendar Owner | Owner display name |
| OWNER_TIMEZONE | UTC | Owner timezone |
