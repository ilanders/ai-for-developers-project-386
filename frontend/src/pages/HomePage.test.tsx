import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test-utils'
import userEvent from '@testing-library/user-event'
import HomePage from './HomePage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../api/client', () => ({
  listPublicEventTypes: vi.fn(),
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

const { listPublicEventTypes, ApiError } = await import('../api/client')

function renderPage() {
  return render(<HomePage />)
}

describe('HomePage', () => {
  it('показывает loader при загрузке', () => {
    vi.mocked(listPublicEventTypes).mockReturnValue(new Promise(() => {}))
    const { container } = renderPage()
    expect(container.querySelector('.mantine-Loader-root')).toBeInTheDocument()
  })

  it('рендерит список event types после загрузки', async () => {
    vi.mocked(listPublicEventTypes).mockResolvedValue([
      { id: 'intro', title: 'Intro Call', description: 'Short', durationMinutes: 15 },
      { id: 'deep', title: 'Deep Dive', description: 'Long', durationMinutes: 60 },
    ])

    renderPage()

    expect(await screen.findByText('Intro Call')).toBeInTheDocument()
    expect(await screen.findByText('Deep Dive')).toBeInTheDocument()
  })

  it('вызывает navigate при клике Book', async () => {
    vi.mocked(listPublicEventTypes).mockResolvedValue([
      { id: 'intro', title: 'Intro Call', description: 'Short', durationMinutes: 15 },
    ])

    renderPage()
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /book/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/book/intro')
  })

  it('показывает generic error при не-ApiError', async () => {
    vi.mocked(listPublicEventTypes).mockRejectedValue(new Error('Network failure'))

    renderPage()
    expect(await screen.findByText('Failed to load event types')).toBeInTheDocument()
  })

  it('показывает ошибку при ApiError', async () => {
    vi.mocked(listPublicEventTypes).mockRejectedValue(
      new ApiError(500, { code: 'VALIDATION_ERROR', message: 'Server error' }),
    )

    renderPage()
    expect(await screen.findByText('Server error')).toBeInTheDocument()
  })
})
