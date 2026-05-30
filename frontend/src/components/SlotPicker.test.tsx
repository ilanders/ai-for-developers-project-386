import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test-utils'
import userEvent from '@testing-library/user-event'
import SlotPicker from './SlotPicker'
import type { Slot } from '../api/client'

const baseSlot = (overrides: Partial<Slot> = {}): Slot => ({
  startTime: '2026-06-01T10:00:00Z',
  endTime: '2026-06-01T10:30:00Z',
  ...overrides,
})

describe('SlotPicker', () => {
  it('рендерит пустой список без групп', () => {
    const { container } = render(<SlotPicker slots={[]} onSelect={() => {}} />)
    expect(container.querySelector('.mantine-Stack-root')?.children.length ?? 0).toBe(0)
  })

  it('группирует слоты по дате', () => {
    const slots = [
      baseSlot({ startTime: '2026-06-01T10:00:00Z' }),
      baseSlot({ startTime: '2026-06-01T11:00:00Z' }),
      baseSlot({ startTime: '2026-06-02T10:00:00Z' }),
    ]
    render(<SlotPicker slots={slots} onSelect={() => {}} />)
    expect(screen.getByText(/Mon, Jun 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Tue, Jun 2/i)).toBeInTheDocument()
  })

  it('вызывает onSelect при клике на слот', async () => {
    const onSelect = vi.fn()
    const slot = baseSlot({ startTime: '2026-06-01T10:00:00Z' })
    render(<SlotPicker slots={[slot]} onSelect={onSelect} />)
    const user = userEvent.setup()
    await user.click(screen.getAllByRole('button')[0])
    expect(onSelect).toHaveBeenCalledWith(slot)
  })
})
