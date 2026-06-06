import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import OwnerPage from './OwnerPage'

vi.mock('../../api/client', () => ({
  getOwner: vi.fn(),
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

const { getOwner, ApiError } = await import('../../api/client')

describe('OwnerPage', () => {
  it('показывает loader при загрузке', () => {
    vi.mocked(getOwner).mockReturnValue(new Promise(() => {}))
    const { container } = render(<OwnerPage />)
    expect(container.querySelector('.mantine-Loader-root')).toBeInTheDocument()
  })

  it('рендерит данные владельца после загрузки', async () => {
    vi.mocked(getOwner).mockResolvedValue({
      id: 'owner1',
      displayName: 'Alice',
      timezone: 'Europe/Moscow',
    })

    render(<OwnerPage />)

    expect(await screen.findByText('owner1')).toBeInTheDocument()
    expect(await screen.findByText('Alice')).toBeInTheDocument()
    expect(await screen.findByText('Europe/Moscow')).toBeInTheDocument()
  })

  it('показывает generic error при не-ApiError', async () => {
    vi.mocked(getOwner).mockRejectedValue(new Error('Network failure'))

    render(<OwnerPage />)
    expect(await screen.findByText('Failed to load owner')).toBeInTheDocument()
  })

  it('показывает ошибку при ApiError', async () => {
    vi.mocked(getOwner).mockRejectedValue(
      new ApiError(404, { code: 'NOT_FOUND', message: 'Owner not found' }),
    )

    render(<OwnerPage />)
    expect(await screen.findByText('Owner not found')).toBeInTheDocument()
  })
})
