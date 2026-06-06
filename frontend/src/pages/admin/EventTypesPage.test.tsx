import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import EventTypesPage from './EventTypesPage'

vi.mock('../../api/client', () => ({
  listEventTypes: vi.fn(),
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

const { listEventTypes, createEventType, ApiError } = await import('../../api/client')

describe('EventTypesPage', () => {
  it('показывает loader при загрузке', () => {
    vi.mocked(listEventTypes).mockReturnValue(new Promise(() => {}))
    const { container } = render(<EventTypesPage />)
    expect(container.querySelector('.mantine-Loader-root')).toBeInTheDocument()
  })

  it('рендерит форму создания и список типов', async () => {
    vi.mocked(listEventTypes).mockResolvedValue([
      { id: 'intro', title: 'Intro Call', description: 'Short', durationMinutes: 15 },
    ])

    render(<EventTypesPage />)

    expect(await screen.findByText('Intro Call')).toBeInTheDocument()
    expect(screen.getByText('Create New Event Type')).toBeInTheDocument()
  })

  it('перезагружает список после создания типа', async () => {
    vi.mocked(listEventTypes).mockResolvedValue([])
    vi.mocked(createEventType).mockResolvedValue({} as never)

    render(<EventTypesPage />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /ID/ }), 'new-type')
    await user.type(screen.getByRole('textbox', { name: /Title/ }), 'New Type')
    await user.type(screen.getByRole('textbox', { name: /Description/ }), 'Desc')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(createEventType).toHaveBeenCalled()
    expect(listEventTypes).toHaveBeenCalled()
  })

  it('показывает generic error при не-ApiError', async () => {
    vi.mocked(listEventTypes).mockRejectedValue(new Error('Network failure'))

    render(<EventTypesPage />)
    expect(await screen.findByText('Failed to load event types')).toBeInTheDocument()
  })

  it('показывает ошибку при ApiError', async () => {
    vi.mocked(listEventTypes).mockRejectedValue(
      new ApiError(500, { code: 'VALIDATION_ERROR', message: 'Failed to load' }),
    )

    render(<EventTypesPage />)
    expect(await screen.findByText('Failed to load')).toBeInTheDocument()
  })
})
