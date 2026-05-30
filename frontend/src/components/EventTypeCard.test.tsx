import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test-utils'
import userEvent from '@testing-library/user-event'
import EventTypeCard from './EventTypeCard'
import type { EventType } from '../api/client'

const eventType: EventType = {
  id: 'intro',
  title: 'Intro Call',
  description: 'A short intro',
  durationMinutes: 15,
}

describe('EventTypeCard', () => {
  it('рендерит заголовок, длительность и описание', () => {
    render(<EventTypeCard eventType={eventType} />)
    expect(screen.getByText('Intro Call')).toBeInTheDocument()
    expect(screen.getByText('15 min')).toBeInTheDocument()
    expect(screen.getByText('A short intro')).toBeInTheDocument()
  })

  it('не показывает кнопку Book если onBook не передан', () => {
    render(<EventTypeCard eventType={eventType} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('вызывает onBook с id при клике на Book', async () => {
    const onBook = vi.fn()
    render(<EventTypeCard eventType={eventType} onBook={onBook} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /book/i }))
    expect(onBook).toHaveBeenCalledWith('intro')
  })
})
