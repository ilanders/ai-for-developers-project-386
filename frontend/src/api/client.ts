import type { components } from '../types/api'

export type Owner = components['schemas']['Owner']
export type EventType = components['schemas']['EventType']
export type Slot = components['schemas']['Slot']
export type Booking = components['schemas']['Booking']
export type CreateEventTypeRequest = components['schemas']['CreateEventTypeRequest']
export type CreateBookingRequest = components['schemas']['CreateBookingRequest']
export type NotFoundError = components['schemas']['NotFoundError']
export type ConflictError = components['schemas']['ConflictError']
export type ValidationError = components['schemas']['ValidationError']

export type ApiErrorBody = NotFoundError | ConflictError | ValidationError

export class ApiError extends Error {
  status: number
  body: ApiErrorBody

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.status = status
    this.body = body
  }
}

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json() as ApiErrorBody
    throw new ApiError(res.status, body)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export function getOwner(): Promise<Owner> {
  return request('/api/admin/owner')
}

export function listEventTypes(): Promise<EventType[]> {
  return request('/api/admin/event-types')
}

export function createEventType(
  body: CreateEventTypeRequest,
): Promise<EventType> {
  return request('/api/admin/event-types', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function listBookings(): Promise<Booking[]> {
  return request('/api/admin/bookings')
}

export function listPublicEventTypes(): Promise<EventType[]> {
  return request('/api/public/event-types')
}

export function getFreeSlots(eventTypeId: string): Promise<Slot[]> {
  return request(`/api/public/event-types/${eventTypeId}/slots`)
}

export function createBooking(
  body: CreateBookingRequest,
): Promise<Booking> {
  return request('/api/public/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export type GuestContact = components['schemas']['GuestContact']
