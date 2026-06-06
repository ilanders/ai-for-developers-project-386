import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test-utils'
import userEvent from '@testing-library/user-event'
import CreateEventTypeForm from './CreateEventTypeForm'

vi.mock('../api/client', () => ({
  createEventType: vi.fn(),
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

const { createEventType, ApiError } = await import('../api/client')

describe('CreateEventTypeForm', () => {
  it('рендерит все поля', () => {
    render(<CreateEventTypeForm onSuccess={() => {}} />)
    expect(screen.getByRole('textbox', { name: /ID/ })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Title/ })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Description/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('вызывает createEventType при сабмите и сбрасывает форму', async () => {
    const onSuccess = vi.fn()
    vi.mocked(createEventType).mockResolvedValue({} as never)

    render(<CreateEventTypeForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /ID/ }), 'intro')
    await user.type(screen.getByRole('textbox', { name: /Title/ }), 'Intro Call')
    await user.type(screen.getByRole('textbox', { name: /Description/ }), 'Short intro')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(createEventType).toHaveBeenCalledWith({
      id: 'intro',
      title: 'Intro Call',
      description: 'Short intro',
      durationMinutes: 30,
    })
    expect(onSuccess).toHaveBeenCalled()

    expect(screen.getByRole('textbox', { name: /ID/ })).toHaveValue('')
  })

  it('показывает ошибку при ApiError', async () => {
    vi.mocked(createEventType).mockRejectedValue(
      new ApiError(409, { code: 'CONFLICT', message: 'Event type already exists' }),
    )

    render(<CreateEventTypeForm onSuccess={() => {}} />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /ID/ }), 'intro')
    await user.type(screen.getByRole('textbox', { name: /Title/ }), 'Intro')
    await user.type(screen.getByRole('textbox', { name: /Description/ }), 'Desc')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText('Event type already exists')).toBeInTheDocument()
  })

  it('показывает сообщение при неизвестной ошибке', async () => {
    vi.mocked(createEventType).mockRejectedValue(new Error('network error'))

    render(<CreateEventTypeForm onSuccess={() => {}} />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /ID/ }), 'intro')
    await user.type(screen.getByRole('textbox', { name: /Title/ }), 'Intro')
    await user.type(screen.getByRole('textbox', { name: /Description/ }), 'Desc')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText('Failed to create event type')).toBeInTheDocument()
  })
})
