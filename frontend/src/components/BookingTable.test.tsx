import { describe, it, expect } from 'vitest'
import { render, screen } from '../test-utils'
import BookingTable from './BookingTable'
import type { Booking } from '../api/client'

const booking: Booking = {
  id: 'b1',
  eventTypeId: 'intro',
  startTime: '2026-06-01T10:00:00Z',
  endTime: '2026-06-01T10:30:00Z',
  guest: { name: 'Alice', email: 'alice@test.com' },
  createdAt: '2026-06-01T10:30:00Z',
}

describe('BookingTable', () => {
  it('рендерит заголовки таблицы', () => {
    render(<BookingTable bookings={[booking]} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Event Type')).toBeInTheDocument()
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('End')).toBeInTheDocument()
  })

  it('рендерит строку с данными брони', () => {
    render(<BookingTable bookings={[booking]} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
    expect(screen.getByText('intro')).toBeInTheDocument()
  })

  it('рендерит пустую таблицу при пустом массиве', () => {
    render(<BookingTable bookings={[]} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })
})
