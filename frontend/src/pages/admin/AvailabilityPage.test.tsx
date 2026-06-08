import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import AvailabilityPage from './AvailabilityPage'

vi.mock('../../api/client', () => ({
  getAvailability: vi.fn(),
  updateAvailability: vi.fn(),
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

const { getAvailability, updateAvailability, ApiError } = await import('../../api/client')

const defaultSettings = {
  windows: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 7, startTime: '09:00', endTime: '17:00' },
  ],
  breaks: [],
  overrides: [],
}

describe('AvailabilityPage', () => {
  it('показывает loader при загрузке', () => {
    vi.mocked(getAvailability).mockReturnValue(new Promise(() => {}))
    const { container } = render(<AvailabilityPage />)
    expect(container.querySelector('.mantine-Loader-root')).toBeInTheDocument()
  })

  it('рендерит форму после загрузки', async () => {
    vi.mocked(getAvailability).mockResolvedValue(defaultSettings)
    render(<AvailabilityPage />)

    expect(await screen.findByText('Availability Settings')).toBeInTheDocument()
    expect(await screen.findByText('Weekly Schedule')).toBeInTheDocument()
    expect(await screen.findByText('Breaks')).toBeInTheDocument()
    expect(await screen.findByText('Date Overrides')).toBeInTheDocument()
  })

  it('показывает ошибку при неудачной загрузке', async () => {
    vi.mocked(getAvailability).mockRejectedValue(
      new ApiError(404, { code: 'NOT_FOUND', message: 'Not found' }),
    )

    render(<AvailabilityPage />)
    expect(await screen.findByText('Not found')).toBeInTheDocument()
  })

  it('показывает generic error при не-ApiError', async () => {
    vi.mocked(getAvailability).mockRejectedValue(new Error('Network failure'))

    render(<AvailabilityPage />)
    expect(await screen.findByText('Failed to load availability settings')).toBeInTheDocument()
  })

  it('вызывает updateAvailability при сохранении', async () => {
    vi.mocked(getAvailability).mockResolvedValue(defaultSettings)
    vi.mocked(updateAvailability).mockResolvedValue(defaultSettings)

    render(<AvailabilityPage />)

    const saveButton = await screen.findByText('Save Changes')
    saveButton.click()

    expect(updateAvailability).toHaveBeenCalledWith(defaultSettings)
  })

  it('показывает "Saved!" после успешного сохранения', async () => {
    vi.mocked(getAvailability).mockResolvedValue(defaultSettings)
    vi.mocked(updateAvailability).mockResolvedValue(defaultSettings)

    render(<AvailabilityPage />)

    const saveButton = await screen.findByText('Save Changes')
    saveButton.click()

    expect(await screen.findByText('Saved!')).toBeInTheDocument()
  })
})
