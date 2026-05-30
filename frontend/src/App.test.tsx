import { describe, it, expect, vi } from 'vitest'
import { render, screen } from './test-utils'
import App from './App'

vi.mock('./api/client', () => ({
  listPublicEventTypes: vi.fn(),
  getFreeSlots: vi.fn(),
  createBooking: vi.fn(),
  getOwner: vi.fn(),
  listEventTypes: vi.fn(),
  createEventType: vi.fn(),
  listBookings: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number
    body: { message: string }
    constructor(status: number, body: { message: string }) {
      super(body.message)
      this.status = status
      this.body = body
    }
  },
}))

const { listPublicEventTypes, getFreeSlots, getOwner, listEventTypes, listBookings } =
  await import('./api/client')

function renderApp(initialEntry: string) {
  return render(<App />, { initialEntries: [initialEntry] })
}

describe('App routing', () => {
  it('рендерит HomePage на "/"', async () => {
    vi.mocked(listPublicEventTypes).mockResolvedValue([])
    renderApp('/')
    expect(await screen.findByText('Book a Meeting')).toBeInTheDocument()
  })

  it('показывает Layout на "/"', async () => {
    vi.mocked(listPublicEventTypes).mockResolvedValue([])
    renderApp('/')
    expect(await screen.findByText('Calendar Booking')).toBeInTheDocument()
  })

  it('рендерит BookingPage на "/book/intro"', async () => {
    vi.mocked(getFreeSlots).mockResolvedValue([])
    renderApp('/book/intro')
    expect(await screen.findByText('Select a Time Slot')).toBeInTheDocument()
  })

  it('рендерит OwnerPage на "/admin/owner"', async () => {
    vi.mocked(getOwner).mockResolvedValue({
      id: 'owner1',
      displayName: 'Alice',
      timezone: 'Europe/Moscow',
    })
    renderApp('/admin/owner')
    expect(await screen.findByText('Owner Profile')).toBeInTheDocument()
  })

  it('редиректит с "/admin" на "/admin/owner"', async () => {
    vi.mocked(getOwner).mockResolvedValue({
      id: 'owner1',
      displayName: 'Alice',
      timezone: 'Europe/Moscow',
    })
    renderApp('/admin')
    expect(await screen.findByText('Owner Profile')).toBeInTheDocument()
  })

  it('показывает AdminLayout на "/admin/owner"', async () => {
    vi.mocked(getOwner).mockResolvedValue({
      id: 'owner1',
      displayName: 'Alice',
      timezone: 'Europe/Moscow',
    })
    renderApp('/admin/owner')
    expect(await screen.findByText('Admin Panel')).toBeInTheDocument()
  })

  it('рендерит EventTypesPage на "/admin/event-types"', async () => {
    vi.mocked(listEventTypes).mockResolvedValue([])
    renderApp('/admin/event-types')
    expect(await screen.findByText('Create New Event Type')).toBeInTheDocument()
  })

  it('рендерит BookingsPage на "/admin/bookings"', async () => {
    vi.mocked(listBookings).mockResolvedValue([])
    renderApp('/admin/bookings')
    expect(await screen.findByRole('heading', { name: /Bookings/i })).toBeInTheDocument()
  })
})
