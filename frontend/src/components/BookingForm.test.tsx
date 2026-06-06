import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test-utils'
import userEvent from '@testing-library/user-event'
import BookingForm from './BookingForm'
import type { Slot } from '../api/client'

const slot: Slot = {
  startTime: '2026-06-01T10:00:00Z',
  endTime: '2026-06-01T10:30:00Z',
}

vi.mock('../api/client', () => ({
  createBooking: vi.fn(),
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

const { createBooking, ApiError } = await import('../api/client')

describe('BookingForm', () => {
  it('рендерит поля Name и Email', () => {
    render(
      <BookingForm eventTypeId="t1" slot={slot} onSuccess={() => {}} />,
    )
    expect(screen.getByRole('textbox', { name: /Name/ })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Email/ })).toBeInTheDocument()
  })

  it('вызывает createBooking при сабмите и вызывает onSuccess', async () => {
    const onSuccess = vi.fn()
    vi.mocked(createBooking).mockResolvedValue({} as never)

    render(<BookingForm eventTypeId="t1" slot={slot} onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /Name/ }), 'Alice')
    await user.type(screen.getByRole('textbox', { name: /Email/ }), 'alice@test.com')
    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    expect(createBooking).toHaveBeenCalledWith({
      eventTypeId: 't1',
      startTime: '2026-06-01T10:00:00Z',
      guest: { name: 'Alice', email: 'alice@test.com' },
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  it('показывает generic error при не-ApiError', async () => {
    vi.mocked(createBooking).mockRejectedValue(new Error('Network failure'))

    render(<BookingForm eventTypeId="t1" slot={slot} onSuccess={() => {}} />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /Name/ }), 'Alice')
    await user.type(screen.getByRole('textbox', { name: /Email/ }), 'alice@test.com')
    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    expect(await screen.findByText('Failed to create booking')).toBeInTheDocument()
  })

  it('показывает ошибку при ApiError', async () => {
    vi.mocked(createBooking).mockRejectedValue(
      new ApiError(409, { code: 'CONFLICT', message: 'Slot already booked' }),
    )

    render(<BookingForm eventTypeId="t1" slot={slot} onSuccess={() => {}} />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /Name/ }), 'Alice')
    await user.type(screen.getByRole('textbox', { name: /Email/ }), 'alice@test.com')
    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    expect(screen.getByText('Slot already booked')).toBeInTheDocument()
  })
})
