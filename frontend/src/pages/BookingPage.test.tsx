import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import BookingPage from './BookingPage'

vi.mock('../api/client', () => ({
  getFreeSlots: vi.fn(),
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

const { getFreeSlots, createBooking, ApiError } = await import('../api/client')

const slots = [
  { startTime: '2026-06-01T10:00:00Z', endTime: '2026-06-01T10:30:00Z' },
  { startTime: '2026-06-01T11:00:00Z', endTime: '2026-06-01T11:30:00Z' },
]

function renderPage() {
  return render(
    <MantineProvider>
      <MemoryRouter initialEntries={['/book/intro']}>
        <Routes>
          <Route path="/book/:eventTypeId" element={<BookingPage />} />
        </Routes>
      </MemoryRouter>
    </MantineProvider>,
  )
}

describe('BookingPage', () => {
  it('показывает loader при загрузке', () => {
    vi.mocked(getFreeSlots).mockReturnValue(new Promise(() => {}))
    const { container } = renderPage()
    expect(container.querySelector('.mantine-Loader-root')).toBeInTheDocument()
  })

  it('рендерит SlotPicker после загрузки слотов', async () => {
    vi.mocked(getFreeSlots).mockResolvedValue(slots)
    renderPage()
    expect(await screen.findByText(/Mon, Jun 1/i)).toBeInTheDocument()
  })

  it('показывает BookingForm после выбора слота', async () => {
    vi.mocked(getFreeSlots).mockResolvedValue(slots)
    renderPage()

    const user = userEvent.setup()
    const buttons = await screen.findAllByRole('button')
    await user.click(buttons[0])

    expect(screen.getByText('Your Details')).toBeInTheDocument()
  })

  it('показывает success message после бронирования', async () => {
    vi.mocked(getFreeSlots).mockResolvedValue(slots)
    vi.mocked(createBooking).mockResolvedValue({} as never)

    renderPage()

    const user = userEvent.setup()
    const buttons = await screen.findAllByRole('button')
    await user.click(buttons[0])
    await user.type(screen.getByRole('textbox', { name: /Name/ }), 'Alice')
    await user.type(screen.getByRole('textbox', { name: /Email/ }), 'alice@test.com')
    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    expect(await screen.findByText('Booking confirmed!')).toBeInTheDocument()
  })

  it('показывает ошибку 409 Conflict при бронировании занятого слота', async () => {
    vi.mocked(getFreeSlots).mockResolvedValue(slots)
    vi.mocked(createBooking).mockRejectedValue(
      new ApiError(409, { code: 'CONFLICT', message: 'Slot already booked' }),
    )

    renderPage()

    const user = userEvent.setup()
    const buttons = await screen.findAllByRole('button')
    await user.click(buttons[0])
    await user.type(screen.getByRole('textbox', { name: /Name/ }), 'Alice')
    await user.type(screen.getByRole('textbox', { name: /Email/ }), 'alice@test.com')
    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    expect(await screen.findByText('Slot already booked')).toBeInTheDocument()
  })

  it('показывает empty state если нет слотов', async () => {
    vi.mocked(getFreeSlots).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/No available slots/i)).toBeInTheDocument()
  })

  it('показывает ошибку при ApiError', async () => {
    vi.mocked(getFreeSlots).mockRejectedValue(
      new ApiError(500, { code: 'VALIDATION_ERROR', message: 'Failed to load slots' }),
    )
    renderPage()
    expect(await screen.findByText('Failed to load slots')).toBeInTheDocument()
  })
})
