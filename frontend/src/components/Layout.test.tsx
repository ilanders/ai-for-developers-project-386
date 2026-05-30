import { describe, it, expect } from 'vitest'
import { render, screen } from '../test-utils'
import Layout from './Layout'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, Outlet: () => <div>outlet content</div> }
})

describe('Layout', () => {
  it('рендерит заголовок Calendar Booking', () => {
    render(<Layout />)
    expect(screen.getByText('Calendar Booking')).toBeInTheDocument()
  })

  it('рендерит ссылку Admin', () => {
    render(<Layout />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('рендерит Outlet', () => {
    render(<Layout />)
    expect(screen.getByText('outlet content')).toBeInTheDocument()
  })
})
