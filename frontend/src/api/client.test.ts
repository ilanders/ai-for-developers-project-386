import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  ApiError,
  getOwner,
  listEventTypes,
  createEventType,
  listBookings,
  listPublicEventTypes,
  getFreeSlots,
  createBooking,
} from './client'

describe('ApiError', () => {
  it('создает ошибку с сообщением, статусом и телом', () => {
    const body = { code: 'NOT_FOUND' as const, message: 'Not found' }
    const err = new ApiError(404, body)
    expect(err).toBeInstanceOf(Error)
    expect(err.status).toBe(404)
    expect(err.body).toBe(body)
    expect(err.message).toBe('Not found')
  })
})

describe('request', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('возвращает JSON при успешном ответе', async () => {
    const data = { id: '1' }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    })
    const result = await getOwner()
    expect(result).toEqual(data)
  })

  it('возвращает undefined при 204', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.resolve({}),
    })
    const result = await listEventTypes()
    expect(result).toBeUndefined()
  })

  it('кидает ApiError при ошибке', async () => {
    const body = { message: 'Conflict' }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve(body),
    })
    await expect(createEventType({} as never)).rejects.toThrow(ApiError)
    await expect(createEventType({} as never)).rejects.toMatchObject({
      status: 409,
      body,
    })
  })
})

describe('API functions', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  function mockFetch(data: unknown) {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    })
  }

  it('getOwner вызывает GET /api/admin/owner', async () => {
    mockFetch({ id: '1' })
    await getOwner()
    expect(fetch).toHaveBeenCalledWith('/api/admin/owner', {
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('listEventTypes вызывает GET /api/admin/event-types', async () => {
    mockFetch([])
    await listEventTypes()
    expect(fetch).toHaveBeenCalledWith('/api/admin/event-types', {
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('createEventType вызывает POST /api/admin/event-types с телом', async () => {
    mockFetch({})
    const body = { id: 'test', title: 'Test', description: '', durationMinutes: 30 }
    await createEventType(body)
    expect(fetch).toHaveBeenCalledWith('/api/admin/event-types', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('listBookings вызывает GET /api/admin/bookings', async () => {
    mockFetch([])
    await listBookings()
    expect(fetch).toHaveBeenCalledWith('/api/admin/bookings', {
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('listPublicEventTypes вызывает GET /api/public/event-types', async () => {
    mockFetch([])
    await listPublicEventTypes()
    expect(fetch).toHaveBeenCalledWith('/api/public/event-types', {
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('getFreeSlots вызывает GET /api/public/event-types/:id/slots', async () => {
    mockFetch([])
    await getFreeSlots('abc')
    expect(fetch).toHaveBeenCalledWith('/api/public/event-types/abc/slots', {
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('createBooking вызывает POST /api/public/bookings с телом', async () => {
    mockFetch({})
    const body = {
      eventTypeId: 't1',
      startTime: '2026-06-01T10:00:00Z',
      guest: { name: 'Alice', email: 'alice@test.com' },
    }
    await createBooking(body)
    expect(fetch).toHaveBeenCalledWith('/api/public/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  })
})
