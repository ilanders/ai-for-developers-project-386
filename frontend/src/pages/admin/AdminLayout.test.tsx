import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import AdminLayout from './AdminLayout'

describe('AdminLayout', () => {
  it('рендерит три ссылки навигации', () => {
    render(<AdminLayout />, { initialEntries: ['/admin/owner'] })
    expect(screen.getByText('Owner')).toBeInTheDocument()
    expect(screen.getByText('Event Types')).toBeInTheDocument()
    expect(screen.getByText('Bookings')).toBeInTheDocument()
  })
})
