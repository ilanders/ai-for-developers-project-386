import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

// ===== Domain Models =====

model Owner {
  id: string;
  displayName: string;
  timezone: string;
}

model EventType {
  id: string;
  title: string;
  description: string;
  durationMinutes: int32;
}

model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
}

model GuestContact {
  name: string;
  email: string;
}

model Booking {
  id: string;
  eventTypeId: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  guest: GuestContact;
  createdAt: utcDateTime;
}

// ===== Request Bodies =====

model CreateEventTypeRequest {
  id: string;
  title: string;
  description: string;
  durationMinutes: int32;
}

model Created<T> {
  @statusCode statusCode: 201;
  @body body: T;
}

model CreateBookingRequest {
  eventTypeId: string;
  startTime: utcDateTime;
  guest: GuestContact;
}

// ===== Error Models =====

@error
model NotFoundError {
  @statusCode statusCode: 404;
  code: "NOT_FOUND";
  message: string;
  details?: string;
}

@error
model ConflictError {
  @statusCode statusCode: 409;
  code: "CONFLICT";
  message: string;
  details?: string;
}

@error
model ValidationError {
  @statusCode statusCode: 422;
  code: "VALIDATION_ERROR";
  message: string;
  details?: string;
}

// ===== Admin API =====

@route("/api/admin")
interface Admin {
  @get
  @route("/owner")
  getOwner(): Owner;

  @post
  @route("/event-types")
  createEventType(@body body: CreateEventTypeRequest): Created<EventType> | ConflictError | ValidationError;

  @get
  @route("/event-types")
  listEventTypes(): EventType[];

  @get
  @route("/bookings")
  listBookings(): Booking[];
}

// ===== Public API =====

@route("/api/public")
interface Public {
  @get
  @route("/event-types")
  listPublicEventTypes(): EventType[];

  @get
  @route("/event-types/{eventTypeId}/slots")
  getFreeSlots(@path eventTypeId: string): Slot[] | NotFoundError;

  @post
  @route("/bookings")
  createBooking(@body body: CreateBookingRequest): Created<Booking> | NotFoundError | ConflictError | ValidationError;
}
