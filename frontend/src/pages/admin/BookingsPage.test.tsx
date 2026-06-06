import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import BookingsPage from './BookingsPage'

vi.mock('../../api/client', () => ({
  listBookings: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number
    body: { code: string; message: string }
    constructor(status: number, body: { code: string; message: string }) {
      super(body.message)
      this.status = status
      this.body = body
    }
  },
}))

const { listBookings, ApiError } = await import('../../api/client')

describe('BookingsPage', () => {
  it('показывает loader при загрузке', () => {
    vi.mocked(listBookings).mockReturnValue(new Promise(() => {}))
    const { container } = render(<BookingsPage />)
    expect(container.querySelector('.mantine-Loader-root')).toBeInTheDocument()
  })

  it('рендерит таблицу броней после загрузки', async () => {
    vi.mocked(listBookings).mockResolvedValue([
      {
        id: 'b1',
        eventTypeId: 'intro',
        startTime: '2026-06-01T10:00:00Z',
        endTime: '2026-06-01T10:30:00Z',
        guest: { name: 'Alice', email: 'alice@test.com' },
        createdAt: '2026-06-01T10:30:00Z',
      },
    ])

    render(<BookingsPage />)

    expect(await screen.findByText('Alice')).toBeInTheDocument()
    expect(await screen.findByText('alice@test.com')).toBeInTheDocument()
  })

  it('показывает generic error при не-ApiError', async () => {
    vi.mocked(listBookings).mockRejectedValue(new Error('Network failure'))

    render(<BookingsPage />)
    expect(await screen.findByText('Failed to load bookings')).toBeInTheDocument()
  })

  it('показывает ошибку при ApiError', async () => {
    vi.mocked(listBookings).mockRejectedValue(
      new ApiError(500, { code: 'VALIDATION_ERROR', message: 'Failed to load bookings' }),
    )

    render(<BookingsPage />)
    expect(await screen.findByText('Failed to load bookings')).toBeInTheDocument()
  })
})
